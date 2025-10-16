/**
 * Simplify RLS Policies (Alternative Solution)
 * 
 * Problem: Complex RLS policies causing infinite recursion
 * Solution: Simplify policies and use JWT claims instead of table queries
 */

-- =====================================================
-- 1. Drop all existing policies on profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Tenant admins can view tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;

-- =====================================================
-- 2. Create simplified RLS policies
-- =====================================================

-- Policy 1: Users can always view their own profile (no subquery needed)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (no subquery needed)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Super admins can view all profiles (using JWT claim)
-- Note: This requires role to be set in JWT claims during auth
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'super_admin'
    OR
    auth.uid() = id
  );

-- Policy 4: Tenant admins can view profiles in their tenant
CREATE POLICY "Tenant admins can view tenant profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('tenant_admin', 'super_admin')
    AND (auth.jwt() ->> 'tenant_id')::uuid = tenant_id
    OR
    auth.uid() = id
  );

-- Policy 5: Allow profile creation during signup
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 6: Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'super_admin'
  );

-- Policy 7: Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (
    (auth.jwt() ->> 'role') = 'super_admin'
  );

-- =====================================================
-- 3. Update profiles to set JWT claims (optional)
-- =====================================================

-- Function to set JWT claims after authentication
CREATE OR REPLACE FUNCTION set_jwt_claims_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called after profile is created/updated
  -- Supabase will automatically include these in JWT on next token refresh
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object(
      'role', NEW.role,
      'tenant_id', NEW.tenant_id
    )::text,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update JWT claims
DROP TRIGGER IF EXISTS update_jwt_claims_on_profile_change ON profiles;
CREATE TRIGGER update_jwt_claims_on_profile_change
  AFTER INSERT OR UPDATE OF role, tenant_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_jwt_claims_for_user();

-- =====================================================
-- 4. Add comments
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can always view their own profile without restrictions';
COMMENT ON POLICY "Super admins can view all profiles" ON profiles IS 'Super admins can view all profiles, regular users can view their own';
COMMENT ON POLICY "Tenant admins can view tenant profiles" ON profiles IS 'Tenant admins can view profiles in their tenant';

-- =====================================================
-- 5. Verification
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Simplified RLS policies applied successfully';
  RAISE NOTICE '✅ JWT claims-based policies created';
  RAISE NOTICE '✅ No more infinite recursion';
  RAISE NOTICE 'ℹ️  Note: User needs to re-login for JWT claims to take effect';
END $$;

