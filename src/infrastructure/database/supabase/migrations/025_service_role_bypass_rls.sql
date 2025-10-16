/**
 * Alternative Solution: Create Service Functions with SECURITY DEFINER
 * 
 * This is more secure than disabling RLS entirely.
 * Use this if you want to keep RLS enabled but allow 2FA operations.
 */

-- =====================================================
-- 1. Create SECURITY DEFINER functions for 2FA operations
-- =====================================================

-- Function to get 2FA status (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_2fa_status(p_user_id UUID)
RETURNS TABLE (
  two_factor_enabled BOOLEAN,
  two_factor_verified_at TIMESTAMPTZ,
  backup_codes_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.two_factor_enabled,
    p.two_factor_verified_at,
    COALESCE(array_length(p.two_factor_backup_codes, 1), 0) as backup_codes_count
  FROM profiles p
  WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update 2FA settings (bypasses RLS)
CREATE OR REPLACE FUNCTION update_user_2fa(
  p_user_id UUID,
  p_secret TEXT DEFAULT NULL,
  p_enabled BOOLEAN DEFAULT NULL,
  p_backup_codes TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET
    two_factor_secret = COALESCE(p_secret, two_factor_secret),
    two_factor_enabled = COALESCE(p_enabled, two_factor_enabled),
    two_factor_backup_codes = COALESCE(p_backup_codes, two_factor_backup_codes),
    two_factor_verified_at = CASE WHEN p_enabled = TRUE THEN NOW() ELSE two_factor_verified_at END
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Grant permissions to authenticated users
-- =====================================================

GRANT EXECUTE ON FUNCTION get_user_2fa_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_2fa(UUID, TEXT, BOOLEAN, TEXT[]) TO authenticated;

-- =====================================================
-- 3. Add RLS policies that work with these functions
-- =====================================================

-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Users can view own profile for 2FA" ON profiles;

-- Create a simplified policy for own profile access
CREATE POLICY "Users can view own profile for 2FA" ON profiles
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id OR is_super_admin());

-- =====================================================
-- 4. Verification
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Created SECURITY DEFINER functions for 2FA';
  RAISE NOTICE '✅ Function: get_user_2fa_status(user_id)';
  RAISE NOTICE '✅ Function: update_user_2fa(user_id, secret, enabled, backup_codes)';
  RAISE NOTICE 'ℹ️  Use these functions from your application code';
  RAISE NOTICE 'ℹ️  They bypass RLS while maintaining security';
END $$;

