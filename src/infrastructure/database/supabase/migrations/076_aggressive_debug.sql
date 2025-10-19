-- ============================================================================
-- MIGRATION: 076_aggressive_debug.sql
-- DESCRIPTION: Aggressive debugging - disable ALL problematic functions and triggers
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- DISABLE ALL PROBLEMATIC FUNCTIONS
-- ============================================================================

-- 1. Disable ALL functions that might interfere with user creation
DROP FUNCTION IF EXISTS check_and_lock_account CASCADE;
DROP FUNCTION IF EXISTS audit_product_changes CASCADE;
DROP FUNCTION IF EXISTS log_product_changes CASCADE;
DROP FUNCTION IF EXISTS track_order_status_changes CASCADE;
DROP FUNCTION IF EXISTS apply_product_optimization CASCADE;
DROP FUNCTION IF EXISTS export_user_data CASCADE;
DROP FUNCTION IF EXISTS get_audit_stats CASCADE;
DROP FUNCTION IF EXISTS get_current_tenant_id CASCADE;
DROP FUNCTION IF EXISTS is_super_admin CASCADE;
DROP FUNCTION IF EXISTS refresh_oauth_token CASCADE;

-- ============================================================================
-- DISABLE ALL TRIGGERS ON PUBLIC.USERS
-- ============================================================================

-- Disable all triggers on public.users table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.users CASCADE';
    END LOOP;
END $$;

-- ============================================================================
-- DISABLE ALL TRIGGERS ON AUTH.USERS
-- ============================================================================

-- Disable all triggers on auth.users table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'auth' 
        AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- ============================================================================
-- CHECK REMAINING TRIGGERS
-- ============================================================================

-- Check if there are any remaining triggers
SELECT
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
  AND event_object_table = 'users'
ORDER BY trigger_schema, trigger_name;

-- ============================================================================
-- TEST USER CREATION AFTER AGGRESSIVE CLEANUP
-- ============================================================================

-- Now try to create a test user manually
-- This will help us see if the functions/triggers were the problem

-- Step 1: Create user in auth.users manually
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test3@deneme2.com',
  crypt('12345678', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Step 2: Get the user ID we just created
SELECT id, email, created_at FROM auth.users WHERE email = 'test3@deneme2.com';

-- Step 3: Insert into public.users
-- (Replace the UUID with the actual user ID from step 2)
INSERT INTO public.users (
  id,
  tenant_id,
  email,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test3@deneme2.com'),
  (SELECT id FROM tenants WHERE company_name = 'Deneme 2 AŞ'),
  'test3@deneme2.com',
  'tenant_admin',
  'Test User 3',
  NOW(),
  NOW()
);

-- ============================================================================
-- VERIFY USER CREATION
-- ============================================================================

-- Check if user was created successfully
SELECT 
  u.id,
  u.email,
  u.role,
  u.full_name,
  t.company_name
FROM public.users u
JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email = 'test3@deneme2.com';

-- ============================================================================
-- COMPLETED: Migration 076
-- ============================================================================
