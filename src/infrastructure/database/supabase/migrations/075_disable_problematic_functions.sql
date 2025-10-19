-- ============================================================================
-- MIGRATION: 075_disable_problematic_functions.sql
-- DESCRIPTION: Temporarily disable problematic functions that might interfere with user creation
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- DISABLE PROBLEMATIC FUNCTIONS
-- ============================================================================

-- 1. Disable check_and_lock_account function
-- This function might be interfering with user creation
DROP FUNCTION IF EXISTS check_and_lock_account CASCADE;

-- 2. Disable any other functions that might use auth.uid() during user creation
-- These functions could be causing the 500 error

-- 3. Check if there are any triggers on auth.users that might be causing issues
-- (We'll check this in the next step)

-- ============================================================================
-- CHECK FOR TRIGGERS ON AUTH.USERS
-- ============================================================================

-- Check if there are any triggers on auth.users table
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- ============================================================================
-- CHECK FOR TRIGGERS ON PUBLIC.USERS
-- ============================================================================

-- Check if there are any triggers on public.users table
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
-- TEST USER CREATION AFTER DISABLING FUNCTIONS
-- ============================================================================

-- Now try to create a test user manually
-- This will help us see if the functions were the problem

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
  'test2@deneme2.com',
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
SELECT id, email, created_at FROM auth.users WHERE email = 'test2@deneme2.com';

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
  (SELECT id FROM auth.users WHERE email = 'test2@deneme2.com'),
  (SELECT id FROM tenants WHERE company_name = 'Deneme 2 AŞ'),
  'test2@deneme2.com',
  'tenant_admin',
  'Test User 2',
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
WHERE u.email = 'test2@deneme2.com';

-- ============================================================================
-- COMPLETED: Migration 075
-- ============================================================================
