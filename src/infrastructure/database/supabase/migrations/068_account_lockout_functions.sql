-- ============================================================================
-- MIGRATION: 068_account_lockout_functions.sql
-- DESCRIPTION: Account lockout and login attempt tracking functions
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-19
-- ============================================================================

-- ============================================================================
-- TABLES: Account Lockout System
-- ============================================================================

-- Login attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'password_reset', '2fa_verification')),
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Account lockouts table
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address INET,
  lockout_type TEXT NOT NULL CHECK (lockout_type IN ('user', 'ip', 'email')),
  lockout_reason TEXT NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  unlocked_by UUID REFERENCES auth.users(id),
  unlocked_at TIMESTAMPTZ,
  unlock_reason TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_active ON account_lockouts(is_active);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_expires_at ON account_lockouts(expires_at);

-- ============================================================================
-- FUNCTIONS: Account Lockout System
-- ============================================================================

-- Drop existing functions if they exist (with all possible parameter combinations)
DROP FUNCTION IF EXISTS record_login_attempt CASCADE;
DROP FUNCTION IF EXISTS is_account_locked CASCADE;
DROP FUNCTION IF EXISTS get_failed_attempts_count CASCADE;
DROP FUNCTION IF EXISTS lock_account CASCADE;
DROP FUNCTION IF EXISTS unlock_account CASCADE;
DROP FUNCTION IF EXISTS get_lockout_stats CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_lockouts CASCADE;

-- Record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_email TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_attempt_type TEXT DEFAULT 'login',
  p_success BOOLEAN DEFAULT false,
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

-- Check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(
  p_email TEXT,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE (
  lockout_id UUID,
  lockout_type TEXT,
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  lockout_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.lockout_type,
    al.locked_at,
    al.expires_at,
    al.lockout_reason
  FROM account_lockouts al
  WHERE al.is_active = true
    AND al.expires_at > NOW()
    AND (
      al.email = p_email OR 
      (p_ip_address IS NOT NULL AND al.ip_address = p_ip_address)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get failed attempts count
CREATE OR REPLACE FUNCTION get_failed_attempts_count(
  p_email TEXT,
  p_minutes INTEGER DEFAULT 15,
  p_ip_address INET DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM login_attempts
  WHERE success = false
    AND created_at > NOW() - INTERVAL '1 minute' * p_minutes
    AND (
      email = p_email OR 
      (p_ip_address IS NOT NULL AND ip_address = p_ip_address)
    );
  
  RETURN COALESCE(attempt_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock account
CREATE OR REPLACE FUNCTION lock_account(
  p_email TEXT,
  p_lockout_type TEXT,
  p_lockout_reason TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_lockout_duration_minutes INTEGER DEFAULT 15
)
RETURNS UUID AS $$
DECLARE
  lockout_id UUID;
  expires_at TIMESTAMPTZ;
BEGIN
  expires_at := NOW() + INTERVAL '1 minute' * p_lockout_duration_minutes;
  
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

-- Unlock account
CREATE OR REPLACE FUNCTION unlock_account(
  p_lockout_id UUID,
  p_unlocked_by UUID,
  p_unlock_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE account_lockouts
  SET 
    is_active = false,
    unlocked_by = p_unlocked_by,
    unlocked_at = NOW(),
    unlock_reason = p_unlock_reason
  WHERE id = p_lockout_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get lockout statistics
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
    (SELECT COUNT(*) FROM login_attempts WHERE created_at > NOW() - INTERVAL '1 hour' * p_hours) as total_attempts,
    (SELECT COUNT(*) FROM login_attempts WHERE success = false AND created_at > NOW() - INTERVAL '1 hour' * p_hours) as failed_attempts,
    (SELECT COUNT(*) FROM login_attempts WHERE success = true AND created_at > NOW() - INTERVAL '1 hour' * p_hours) as successful_attempts,
    (SELECT COUNT(*) FROM account_lockouts WHERE is_active = true) as active_lockouts,
    (SELECT COUNT(DISTINCT email) FROM login_attempts WHERE created_at > NOW() - INTERVAL '1 hour' * p_hours) as unique_emails,
    (SELECT COUNT(DISTINCT ip_address) FROM login_attempts WHERE created_at > NOW() - INTERVAL '1 hour' * p_hours AND ip_address IS NOT NULL) as unique_ips;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired lockouts
CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE account_lockouts
  SET is_active = false
  WHERE is_active = true 
    AND expires_at <= NOW();
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own login attempts" ON login_attempts;
DROP POLICY IF EXISTS "System can insert login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Users can view their own lockouts" ON account_lockouts;
DROP POLICY IF EXISTS "System can manage lockouts" ON account_lockouts;

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- Login attempts policies
CREATE POLICY "Users can view their own login attempts" ON login_attempts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "System can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Account lockouts policies
CREATE POLICY "Users can view their own lockouts" ON account_lockouts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "System can manage lockouts" ON account_lockouts
  FOR ALL USING (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION record_login_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION is_account_locked TO authenticated;
GRANT EXECUTE ON FUNCTION get_failed_attempts_count TO authenticated;
GRANT EXECUTE ON FUNCTION lock_account TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_account TO authenticated;
GRANT EXECUTE ON FUNCTION get_lockout_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_lockouts TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE login_attempts IS 'Login attempt tracking for security and lockout management';
COMMENT ON TABLE account_lockouts IS 'Account lockout records for security management';
COMMENT ON FUNCTION record_login_attempt IS 'Record a login attempt for security tracking';
COMMENT ON FUNCTION is_account_locked IS 'Check if an account is currently locked';
COMMENT ON FUNCTION get_failed_attempts_count IS 'Get count of failed login attempts within time window';
COMMENT ON FUNCTION lock_account IS 'Lock an account for security reasons';
COMMENT ON FUNCTION unlock_account IS 'Unlock a previously locked account';
COMMENT ON FUNCTION get_lockout_stats IS 'Get lockout and attempt statistics';
COMMENT ON FUNCTION cleanup_expired_lockouts IS 'Clean up expired lockouts';

-- ============================================================================
-- COMPLETED: Migration 068
-- ============================================================================
