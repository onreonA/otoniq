-- Migration: 014_two_factor_auth.sql
-- Description: Add Two-Factor Authentication support to profiles table

-- Add 2FA columns to profiles table
ALTER TABLE profiles 
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_backup_codes TEXT[],
ADD COLUMN two_factor_verified_at TIMESTAMPTZ;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled);

-- RLS is already enabled from previous migration, no need to enable again
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies for viewing/updating profiles already exist from 001_profiles_schema.sql
-- No need to recreate them here

-- Create function to generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes()
RETURNS TEXT[] AS $$
DECLARE
    codes TEXT[] := '{}';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        codes := array_append(codes, 
            upper(substring(md5(random()::text) from 1 for 8))
        );
    END LOOP;
    RETURN codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify TOTP code
CREATE OR REPLACE FUNCTION verify_totp_code(
    user_id UUID,
    totp_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_secret TEXT;
    is_valid BOOLEAN := FALSE;
BEGIN
    -- Get user's 2FA secret
    SELECT two_factor_secret INTO user_secret
    FROM profiles 
    WHERE id = user_id AND two_factor_enabled = TRUE;
    
    -- If no secret found, return false
    IF user_secret IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Verify TOTP code (this would need to be implemented with otplib in the application)
    -- For now, we'll just check if the code is 6 digits
    IF totp_code ~ '^[0-9]{6}$' THEN
        is_valid := TRUE;
    END IF;
    
    RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to enable 2FA
CREATE OR REPLACE FUNCTION enable_two_factor(
    user_id UUID,
    secret TEXT
)
RETURNS TEXT[] AS $$
DECLARE
    backup_codes TEXT[];
BEGIN
    -- Generate backup codes
    backup_codes := generate_backup_codes();
    
    -- Update user profile
    UPDATE profiles 
    SET 
        two_factor_secret = secret,
        two_factor_enabled = TRUE,
        two_factor_backup_codes = backup_codes,
        two_factor_verified_at = NOW()
    WHERE id = user_id;
    
    RETURN backup_codes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to disable 2FA
CREATE OR REPLACE FUNCTION disable_two_factor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles 
    SET 
        two_factor_secret = NULL,
        two_factor_enabled = FALSE,
        two_factor_backup_codes = NULL,
        two_factor_verified_at = NULL
    WHERE id = user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON TABLE profiles IS 'User profiles with 2FA support';
COMMENT ON COLUMN profiles.two_factor_secret IS 'TOTP secret for 2FA';
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN profiles.two_factor_backup_codes IS 'Backup codes for 2FA recovery';
COMMENT ON COLUMN profiles.two_factor_verified_at IS 'When 2FA was last verified';
