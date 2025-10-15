-- Migration: 017_rate_limiting.sql
-- Description: Rate limiting tracking and API request logging

-- Create rate_limit_tracking table
CREATE TABLE IF NOT EXISTS rate_limit_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL, -- user_id, ip_address, or api_key
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('user', 'ip', 'api_key')),
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier ON rate_limit_tracking(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_endpoint ON rate_limit_tracking(endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window ON rate_limit_tracking(window_start, window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_tracking(created_at);

-- Create api_request_logs table for monitoring
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for api_request_logs
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_tenant_id ON api_request_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_request_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_request_logs(response_status);

-- Enable RLS
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rate_limit_tracking
CREATE POLICY "Super admins can view rate limits" ON rate_limit_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- RLS Policies for api_request_logs
CREATE POLICY "Users can view own API logs" ON api_request_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view tenant API logs" ON api_request_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'tenant_admin')
            AND (tenant_id = api_request_logs.tenant_id OR role = 'super_admin')
        )
    );

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier TEXT,
    p_identifier_type TEXT,
    p_endpoint TEXT,
    p_limit INTEGER,
    p_window_minutes INTEGER DEFAULT 1
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    remaining_requests INTEGER,
    reset_at TIMESTAMPTZ
) AS $$
DECLARE
    current_window_start TIMESTAMPTZ;
    current_window_end TIMESTAMPTZ;
    current_count INTEGER;
    existing_record RECORD;
BEGIN
    -- Calculate current window
    current_window_start := DATE_TRUNC('minute', NOW());
    current_window_end := current_window_start + (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Find existing record in current window
    SELECT * INTO existing_record
    FROM rate_limit_tracking
    WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND endpoint = p_endpoint
    AND window_end > NOW()
    ORDER BY window_start DESC
    LIMIT 1;
    
    IF existing_record IS NULL THEN
        -- Create new record
        INSERT INTO rate_limit_tracking (
            identifier,
            identifier_type,
            endpoint,
            request_count,
            window_start,
            window_end
        ) VALUES (
            p_identifier,
            p_identifier_type,
            p_endpoint,
            1,
            current_window_start,
            current_window_end
        );
        
        RETURN QUERY SELECT TRUE, p_limit - 1, current_window_end;
    ELSIF existing_record.request_count < p_limit THEN
        -- Increment existing record
        UPDATE rate_limit_tracking
        SET 
            request_count = request_count + 1,
            updated_at = NOW()
        WHERE id = existing_record.id;
        
        RETURN QUERY SELECT 
            TRUE, 
            p_limit - (existing_record.request_count + 1),
            existing_record.window_end;
    ELSE
        -- Rate limit exceeded
        RETURN QUERY SELECT 
            FALSE, 
            0,
            existing_record.window_end;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API request
CREATE OR REPLACE FUNCTION log_api_request(
    p_user_id UUID,
    p_tenant_id UUID,
    p_endpoint TEXT,
    p_method TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_request_body JSONB DEFAULT NULL,
    p_response_status INTEGER DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO api_request_logs (
        user_id,
        tenant_id,
        endpoint,
        method,
        ip_address,
        user_agent,
        request_body,
        response_status,
        response_time_ms,
        error_message
    ) VALUES (
        p_user_id,
        p_tenant_id,
        p_endpoint,
        p_method,
        p_ip_address,
        p_user_agent,
        p_request_body,
        p_response_status,
        p_response_time_ms,
        p_error_message
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get rate limit statistics
CREATE OR REPLACE FUNCTION get_rate_limit_stats(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_requests BIGINT,
    blocked_requests BIGINT,
    unique_identifiers BIGINT,
    top_endpoints TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE request_count >= 100) as blocked,
            COUNT(DISTINCT identifier) as unique_ids
        FROM rate_limit_tracking
        WHERE created_at > NOW() - (p_hours || ' hours')::INTERVAL
    ),
    top_eps AS (
        SELECT ARRAY_AGG(endpoint ORDER BY request_count DESC) as endpoints
        FROM (
            SELECT endpoint, SUM(request_count) as request_count
            FROM rate_limit_tracking
            WHERE created_at > NOW() - (p_hours || ' hours')::INTERVAL
            GROUP BY endpoint
            ORDER BY request_count DESC
            LIMIT 10
        ) t
    )
    SELECT 
        stats.total,
        stats.blocked,
        stats.unique_ids,
        top_eps.endpoints
    FROM stats, top_eps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limit_records()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete records older than 24 hours
    DELETE FROM rate_limit_tracking 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old API logs (keep 30 days)
    DELETE FROM api_request_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rate_limit_tracking_updated_at
    BEFORE UPDATE ON rate_limit_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE rate_limit_tracking IS 'Rate limiting tracking per identifier and endpoint';
COMMENT ON TABLE api_request_logs IS 'API request logging for monitoring and debugging';
COMMENT ON COLUMN rate_limit_tracking.identifier IS 'User ID, IP address, or API key';
COMMENT ON COLUMN rate_limit_tracking.identifier_type IS 'Type of identifier (user, ip, api_key)';
COMMENT ON COLUMN rate_limit_tracking.window_start IS 'Start of the rate limit window';
COMMENT ON COLUMN rate_limit_tracking.window_end IS 'End of the rate limit window';
