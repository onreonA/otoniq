-- ============================================================================
-- MIGRATION: 071_fix_admin_api_rls.sql
-- DESCRIPTION: Fix RLS policies for Admin API user creation
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- FIX RLS POLICIES FOR ADMIN API
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view same tenant users" ON users;
DROP POLICY IF EXISTS "Tenant admins can manage their tenant users" ON users;

-- Create new policies that work with Admin API
-- 1. Allow service role to bypass RLS for user creation
CREATE POLICY "Service role can manage all users"
  ON users FOR ALL
  USING (auth.role() = 'service_role');

-- 2. Super admins can view all users (when authenticated)
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'super_admin'
    )
  );

-- 3. Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL AND id = auth.uid());

-- 4. Users can view same tenant users
CREATE POLICY "Users can view same tenant users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- 5. Tenant admins can manage their tenant users
CREATE POLICY "Tenant admins can manage their tenant users"
  ON users FOR ALL
  USING (
    auth.uid() IS NOT NULL AND
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('tenant_admin', 'super_admin')
    )
  );

-- ============================================================================
-- ADDITIONAL FIXES FOR TENANTS TABLE
-- ============================================================================

-- Drop existing tenant policies
DROP POLICY IF EXISTS "Super admins can view all tenants" ON tenants;
DROP POLICY IF EXISTS "Super admins can create tenants" ON tenants;
DROP POLICY IF EXISTS "Super admins can update tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant admins can view their tenant" ON tenants;

-- Create new tenant policies
CREATE POLICY "Service role can manage all tenants"
  ON tenants FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Super admins can view all tenants"
  ON tenants FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update tenants"
  ON tenants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Tenant admins can view their tenant"
  ON tenants FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- Check if policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'tenants')
ORDER BY tablename, policyname;

-- ============================================================================
-- COMPLETED: Migration 071
-- ============================================================================
