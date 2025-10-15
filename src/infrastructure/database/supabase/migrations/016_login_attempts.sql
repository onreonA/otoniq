-- Migration: 016_login_attempts.sql
-- Description: Account lockout mechanism with failed login attempts tracking

-- Create login_attempts table
CREATE TABLE login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'password_reset', '2fa_verification')),
    success BOOLEAN NOT NULL DEFAULT FALSE,
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Create indexes for performance
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX idx_login_attempts_expires_at ON login_attempts(expires_at);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);

-- Create account_lockouts table
CREATE TABLE account_lockouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address INET,
    lockout_type TEXT NOT NULL CHECK (lockout_type IN ('user', 'ip', 'email')),
    lockout_reason TEXT NOT NULL,
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    unlocked_by UUID REFERENCES auth.users(id),
    unlocked_at TIMESTAMPTZ,
    unlock_reason TEXT
);

-- Create indexes for lockouts
CREATE INDEX idx_account_lockouts_user_id ON account_lockouts(user_id);
CREATE INDEX idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX idx_account_lockouts_ip_address ON account_lockouts(ip_address);
CREATE INDEX idx_account_lockouts_is_active ON account_lockouts(is_active);
CREATE INDEX idx_account_lockouts_expires_at ON account_lockouts(expires_at);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_attempts
CREATE POLICY "Users can view own login attempts" ON login_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert login attempts" ON login_attempts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update login attempts" ON login_attempts
    FOR UPDATE WITH CHECK (true);

-- RLS Policies for account_lockouts
CREATE POLICY "Users can view own lockouts" ON account_lockouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all lockouts" ON account_lockouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'tenant_admin')
        )
    );

CREATE POLICY "System can manage lockouts" ON account_lockouts
    FOR ALL WITH CHECK (true);

-- Create function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
    p_user_id UUID,
    p_email TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_attempt_type TEXT,
    p_success BOOLEAN,
    p_failure_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    attempt_id UUID;
BEGIN
    INSERT INTO login_attempts (
        user_id,
        email,
        ip_address,
        user_agent,
        attempt_type,
        success,
        failure_reason
    ) VALUES (
        p_user_id,
        p_email,
        p_ip_address,
        p_user_agent,
        p_attempt_type,
        p_success,
        p_failure_reason
    ) RETURNING id INTO attempt_id;
    
    RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(
    p_email TEXT,
    p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
    is_locked BOOLEAN,
    lockout_type TEXT,
    locked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    lockout_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE as is_locked,
        l.lockout_type,
        l.locked_at,
        l.expires_at,
        l.lockout_reason
    FROM account_lockouts l
    WHERE l.is_active = TRUE 
    AND l.expires_at > NOW()
    AND (
        (l.lockout_type = 'email' AND l.email = p_email) OR
        (l.lockout_type = 'ip' AND l.ip_address = p_ip_address) OR
        (l.lockout_type = 'user' AND l.email = p_email)
    )
    ORDER BY l.locked_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check failed attempts count
CREATE OR REPLACE FUNCTION get_failed_attempts_count(
    p_email TEXT,
    p_ip_address INET DEFAULT NULL,
    p_minutes INTEGER DEFAULT 15
)
RETURNS INTEGER AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM login_attempts
    WHERE email = p_email
    AND success = FALSE
    AND created_at > (NOW() - INTERVAL '1 minute' * p_minutes)
    AND (
        ip_address = p_ip_address OR 
        p_ip_address IS NULL
    );
    
    RETURN COALESCE(attempt_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to lock account
CREATE OR REPLACE FUNCTION lock_account(
    p_user_id UUID,
    p_email TEXT,
    p_ip_address INET,
    p_lockout_type TEXT,
    p_lockout_reason TEXT,
    p_lockout_duration_minutes INTEGER DEFAULT 15
)
RETURNS UUID AS $$
DECLARE
    lockout_id UUID;
    expires_at TIMESTAMPTZ;
BEGIN
    expires_at := NOW() + (INTERVAL '1 minute' * p_lockout_duration_minutes);
    
    INSERT INTO account_lockouts (
        user_id,
        email,
        ip_address,
        lockout_type,
        lockout_reason,
        expires_at
    ) VALUES (
        p_user_id,
        p_email,
        p_ip_address,
        p_lockout_type,
        p_lockout_reason,
        expires_at
    ) RETURNING id INTO lockout_id;
    
    RETURN lockout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to unlock account
CREATE OR REPLACE FUNCTION unlock_account(
    p_lockout_id UUID,
    p_unlocked_by UUID,
    p_unlock_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE account_lockouts
    SET 
        is_active = FALSE,
        unlocked_by = p_unlocked_by,
        unlocked_at = NOW(),
        unlock_reason = p_unlock_reason
    WHERE id = p_lockout_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired lockouts
CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    -- Clean up expired lockouts
    UPDATE account_lockouts
    SET is_active = FALSE
    WHERE expires_at < NOW() AND is_active = TRUE;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Clean up old login attempts (older than 24 hours)
    DELETE FROM login_attempts 
    WHERE created_at < (NOW() - INTERVAL '24 hours');
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get lockout statistics
CREATE OR REPLACE FUNCTION get_lockout_stats(
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_attempts BIGINT,
    failed_attempts BIGINT,
    successful_attempts BIGINT,
    active_lockouts BIGINT,
    unique_emails BIGINT,
    unique_ips BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE success = FALSE) as failed_attempts,
        COUNT(*) FILTER (WHERE success = TRUE) as successful_attempts,
        (SELECT COUNT(*) FROM account_lockouts WHERE is_active = TRUE) as active_lockouts,
        COUNT(DISTINCT email) as unique_emails,
        COUNT(DISTINCT ip_address) as unique_ips
    FROM login_attempts
    WHERE created_at > (NOW() - INTERVAL '1 hour' * p_hours);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically lock account after too many failed attempts
CREATE OR REPLACE FUNCTION check_and_lock_account()
RETURNS TRIGGER AS $$
DECLARE
    failed_count INTEGER;
    user_id UUID;
BEGIN
    -- Only check for failed login attempts
    IF NEW.attempt_type = 'login' AND NEW.success = FALSE THEN
        -- Get user ID if available
        SELECT id INTO user_id FROM auth.users WHERE email = NEW.email;
        
        -- Count recent failed attempts
        SELECT get_failed_attempts_count(NEW.email, NEW.ip_address, 15) INTO failed_count;
        
        -- Lock account if too many failed attempts
        IF failed_count >= 5 THEN
            PERFORM lock_account(
                user_id,
                NEW.email,
                NEW.ip_address,
                'user',
                'Too many failed login attempts',
                15
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_check_and_lock_account
    AFTER INSERT ON login_attempts
    FOR EACH ROW
    EXECUTE FUNCTION check_and_lock_account();

-- Add comments
COMMENT ON TABLE login_attempts IS 'Login attempts tracking for security monitoring';
COMMENT ON TABLE account_lockouts IS 'Account lockout management';
COMMENT ON COLUMN login_attempts.attempt_type IS 'Type of authentication attempt';
COMMENT ON COLUMN login_attempts.failure_reason IS 'Reason for failed attempt';
COMMENT ON COLUMN account_lockouts.lockout_type IS 'Type of lockout (user, ip, email)';
COMMENT ON COLUMN account_lockouts.lockout_reason IS 'Reason for account lockout';
