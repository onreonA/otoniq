-- ============================================================================
-- MIGRATION: 073_deep_debug_user_creation.sql
-- DESCRIPTION: Deep debug user creation issues
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- CHECK AUTH.USERS TABLE STRUCTURE
-- ============================================================================

-- Check if auth.users table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK PUBLIC.USERS TABLE STRUCTURE
-- ============================================================================

-- Check public.users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- CHECK CONSTRAINTS ON PUBLIC.USERS
-- ============================================================================

-- Check all constraints on public.users
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'users'
ORDER BY tc.constraint_name;

-- ============================================================================
-- CHECK TRIGGERS ON PUBLIC.USERS
-- ============================================================================

-- Check all triggers on public.users
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================================================
-- TEST MANUAL INSERT INTO PUBLIC.USERS
-- ============================================================================

-- Test if we can manually insert into public.users
-- (This will help us understand if the issue is with the table itself)

-- First, let's check if the tenant exists
SELECT id, company_name, subscription_status 
FROM tenants 
WHERE company_name LIKE '%Deneme 2%';

-- Check if there are any existing users with similar email
SELECT id, email, tenant_id, role 
FROM users 
WHERE email LIKE '%deneme%';

-- ============================================================================
-- CHECK AUTH FUNCTIONS AND POLICIES
-- ============================================================================

-- Check if there are any auth-related functions that might be causing issues
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%auth%'
ORDER BY routine_name;

-- Check if there are any auth-related policies
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
  AND (policyname LIKE '%auth%' OR qual LIKE '%auth%')
ORDER BY tablename, policyname;

-- ============================================================================
-- CHECK FOR CUSTOM FUNCTIONS THAT MIGHT INTERFERE
-- ============================================================================

-- Check for any custom functions that might be triggered on user creation
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_definition LIKE '%users%' OR routine_definition LIKE '%auth%')
ORDER BY routine_name;

-- ============================================================================
-- COMPLETED: Migration 073
-- ============================================================================
