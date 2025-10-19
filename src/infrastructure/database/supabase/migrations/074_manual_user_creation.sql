-- ============================================================================
-- MIGRATION: 074_manual_user_creation.sql
-- DESCRIPTION: Manual user creation for testing
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- MANUAL USER CREATION TEST
-- ============================================================================

-- First, let's create a test user manually in auth.users
-- (This will help us understand if the issue is with the Admin API or the database)

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
  'test@deneme2.com',
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
SELECT id, email, created_at FROM auth.users WHERE email = 'test@deneme2.com';

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
  (SELECT id FROM auth.users WHERE email = 'test@deneme2.com'),
  (SELECT id FROM tenants WHERE company_name = 'Deneme 2 AŞ'),
  'test@deneme2.com',
  'tenant_admin',
  'Test User',
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
WHERE u.email = 'test@deneme2.com';

-- ============================================================================
-- CLEANUP (Optional)
-- ============================================================================

-- If you want to clean up the test user, uncomment these lines:
-- DELETE FROM public.users WHERE email = 'test@deneme2.com';
-- DELETE FROM auth.users WHERE email = 'test@deneme2.com';

-- ============================================================================
-- COMPLETED: Migration 074
-- ============================================================================
