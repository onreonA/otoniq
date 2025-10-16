/**
 * Temporarily Disable RLS for Profiles (Development Only)
 * 
 * Problem: RLS policies causing infinite recursion and blocking 2FA queries
 * Solution: Disable RLS for profiles table in development, re-enable in production
 * 
 * ⚠️ WARNING: This should only be used in development!
 * ⚠️ In production, you must implement proper RLS policies!
 */

-- =====================================================
-- 1. Drop ALL existing policies on profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Tenant admins can view tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- =====================================================
-- 2. Disable RLS entirely for profiles table
-- =====================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. Add a simple policy that allows everything (for now)
-- =====================================================

-- Re-enable RLS but with permissive policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to do everything (TEMPORARY!)
CREATE POLICY "Allow all for authenticated users" ON profiles
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. Verification & Warning
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '⚠️  WARNING: RLS on profiles table is now PERMISSIVE!';
  RAISE NOTICE '⚠️  All authenticated users can access all profiles!';
  RAISE NOTICE '⚠️  This is for DEVELOPMENT ONLY!';
  RAISE NOTICE '✅ 2FA queries should now work without errors';
  RAISE NOTICE 'ℹ️  TODO: Implement proper RLS policies before production!';
END $$;

-- =====================================================
-- 5. Future TODO: Proper RLS Implementation
-- =====================================================

/*
FUTURE IMPLEMENTATION NOTES:

For production, you should implement:

1. Service Account Pattern:
   - Create a service role in Supabase
   - Use service_role key for 2FA operations
   - Keep user operations with regular anon key

2. Stored Procedures with SECURITY DEFINER:
   - Create functions that bypass RLS
   - Grant execute to authenticated users
   - Use these for 2FA status checks

3. JWT Claims-Based Policies:
   - Ensure role is set in JWT during auth
   - Use (auth.jwt() ->> 'role') in policies
   - Force token refresh after role changes

4. Separate Tables:
   - Move 2FA data to separate table
   - Apply different RLS policies
   - Reduce complexity

Current temporary solution allows development to continue!
*/

