/**
 * Fix RLS Infinite Recursion Issues
 * 
 * Problem: profiles table RLS policies query themselves, causing infinite recursion
 * Solution: Use SECURITY DEFINER functions to break the recursion loop
 */

-- =====================================================
-- 1. Drop existing problematic policies
-- =====================================================

DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Tenant admins can view tenant profiles" ON profiles;

-- =====================================================
-- 2. Create helper functions with SECURITY DEFINER
-- =====================================================

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if current user is tenant admin or super admin
CREATE OR REPLACE FUNCTION is_tenant_admin_or_super()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('tenant_admin', 'super_admin')
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 3. Create new RLS policies using helper functions
-- =====================================================

-- Policy: Super admins can view all profiles (using helper function)
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (is_super_admin());

-- Policy: Tenant admins can view profiles in their tenant (using helper functions)
CREATE POLICY "Tenant admins can view tenant profiles" ON profiles
  FOR SELECT USING (
    is_tenant_admin_or_super() 
    AND tenant_id = get_user_tenant_id()
  );

-- =====================================================
-- 4. Grant necessary permissions
-- =====================================================

-- Grant execute permissions on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_tenant_admin_or_super() TO authenticated;

-- =====================================================
-- 5. Add comments
-- =====================================================

COMMENT ON FUNCTION is_super_admin() IS 'Returns TRUE if current user is a super admin';
COMMENT ON FUNCTION get_user_tenant_id() IS 'Returns the tenant_id of the current user';
COMMENT ON FUNCTION is_tenant_admin_or_super() IS 'Returns TRUE if current user is a tenant admin or super admin';

-- =====================================================
-- 6. Verify policies are working
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ RLS infinite recursion fix applied successfully';
  RAISE NOTICE '✅ Helper functions created: is_super_admin(), get_user_tenant_id(), is_tenant_admin_or_super()';
  RAISE NOTICE '✅ New policies created using SECURITY DEFINER functions';
END $$;

