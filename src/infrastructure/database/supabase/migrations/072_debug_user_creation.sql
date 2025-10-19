-- ============================================================================
-- MIGRATION: 072_debug_user_creation.sql
-- DESCRIPTION: Debug user creation issues
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- CHECK CURRENT RLS POLICIES
-- ============================================================================

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'tenants');

-- Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'tenants')
ORDER BY tablename, policyname;

-- ============================================================================
-- CHECK CONSTRAINTS AND TRIGGERS
-- ============================================================================

-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'tenants')
ORDER BY tc.table_name;

-- Check triggers
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('users', 'tenants')
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- TEST MANUAL USER CREATION
-- ============================================================================

-- Test if we can manually insert into users table
-- (This will help us understand if the issue is with RLS or constraints)

-- First, let's check if the tenant exists
SELECT id, company_name, subscription_status 
FROM tenants 
WHERE company_name LIKE '%Deneme 2%';

-- Check if there are any existing users with similar email
SELECT id, email, tenant_id, role 
FROM users 
WHERE email LIKE '%deneme%';

-- ============================================================================
-- DISABLE RLS TEMPORARILY FOR TESTING
-- ============================================================================

-- Temporarily disable RLS to test if that's the issue
-- (We'll re-enable it after testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RE-ENABLE RLS AFTER TESTING
-- ============================================================================

-- Re-enable RLS (uncomment after testing)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMPLETED: Migration 072
-- ============================================================================
