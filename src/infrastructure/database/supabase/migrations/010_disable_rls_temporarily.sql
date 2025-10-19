-- ============================================================================
-- OTONIQ.AI - Temporarily Disable RLS for Testing
-- Migration 010: Disable RLS temporarily to allow tenant creation
-- ============================================================================

-- WARNING: This is for development only! Never use in production!

-- Temporarily disable RLS on tenants table
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on users table  
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('tenants', 'users')
AND schemaname = 'public';

-- ============================================================================
-- COMPLETED: Migration 010 (TEMPORARY)
-- ============================================================================
