-- Migration: 015_user_sessions.sql
-- Description: User session tracking and refresh token management

-- Create user_sessions table
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    refresh_expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR refresh_expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create new session
CREATE OR REPLACE FUNCTION create_user_session(
    p_user_id UUID,
    p_session_token TEXT,
    p_refresh_token TEXT,
    p_expires_at TIMESTAMPTZ,
    p_refresh_expires_at TIMESTAMPTZ,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO user_sessions (
        user_id,
        session_token,
        refresh_token,
        expires_at,
        refresh_expires_at,
        ip_address,
        user_agent,
        device_info
    ) VALUES (
        p_user_id,
        p_session_token,
        p_refresh_token,
        p_expires_at,
        p_refresh_expires_at,
        p_ip_address,
        p_user_agent,
        p_device_info
    ) RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to refresh session
CREATE OR REPLACE FUNCTION refresh_user_session(
    p_refresh_token TEXT,
    p_new_session_token TEXT,
    p_new_refresh_token TEXT,
    p_new_expires_at TIMESTAMPTZ,
    p_new_refresh_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Find session by refresh token
    SELECT * INTO session_record
    FROM user_sessions
    WHERE refresh_token = p_refresh_token 
    AND is_active = TRUE 
    AND refresh_expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update session with new tokens
    UPDATE user_sessions
    SET 
        session_token = p_new_session_token,
        refresh_token = p_new_refresh_token,
        expires_at = p_new_expires_at,
        refresh_expires_at = p_new_refresh_expires_at,
        last_activity = NOW(),
        updated_at = NOW()
    WHERE id = session_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to invalidate session
CREATE OR REPLACE FUNCTION invalidate_user_session(
    p_session_token TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE user_sessions
    SET is_active = FALSE, updated_at = NOW()
    WHERE session_token = p_session_token;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to invalidate all user sessions
CREATE OR REPLACE FUNCTION invalidate_all_user_sessions(
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE user_sessions
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = p_user_id AND is_active = TRUE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get active sessions for user
CREATE OR REPLACE FUNCTION get_user_active_sessions(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    session_token TEXT,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.session_token,
        s.ip_address,
        s.user_agent,
        s.device_info,
        s.created_at,
        s.last_activity,
        s.expires_at
    FROM user_sessions s
    WHERE s.user_id = p_user_id 
    AND s.is_active = TRUE 
    AND s.expires_at > NOW()
    ORDER BY s.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE user_sessions IS 'User session tracking with refresh token support';
COMMENT ON COLUMN user_sessions.session_token IS 'Current session token';
COMMENT ON COLUMN user_sessions.refresh_token IS 'Refresh token for session renewal';
COMMENT ON COLUMN user_sessions.expires_at IS 'When the session expires';
COMMENT ON COLUMN user_sessions.refresh_expires_at IS 'When the refresh token expires';
COMMENT ON COLUMN user_sessions.device_info IS 'Device information (browser, OS, etc.)';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether the session is currently active';
