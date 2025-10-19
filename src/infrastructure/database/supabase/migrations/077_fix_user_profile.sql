-- ============================================================================
-- MIGRATION: 077_fix_user_profile.sql
-- DESCRIPTION: Fix user profile issues after successful user creation
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-20
-- ============================================================================

-- ============================================================================
-- CHECK USER PROFILE STATUS
-- ============================================================================

-- Check if the user exists in auth.users
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'test@test1.com';

-- Check if the user exists in public.users
SELECT 
  u.id,
  u.email,
  u.role,
  u.full_name,
  u.tenant_id,
  t.company_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email = 'test@test1.com';

-- ============================================================================
-- FIX USER PROFILE IF MISSING
-- ============================================================================

-- If user exists in auth.users but not in public.users, create the profile
INSERT INTO public.users (
  id,
  tenant_id,
  email,
  role,
  full_name,
  created_at,
  updated_at
)
SELECT 
  au.id,
  t.id as tenant_id,
  au.email,
  'tenant_admin' as role,
  'Test User' as full_name,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
CROSS JOIN public.tenants t
WHERE au.email = 'test@test1.com'
  AND t.company_name = 'Deneme 1 AŞ'
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu 
    WHERE pu.id = au.id
  );

-- ============================================================================
-- VERIFY USER PROFILE
-- ============================================================================

-- Check if user profile was created successfully
SELECT 
  u.id,
  u.email,
  u.role,
  u.full_name,
  u.tenant_id,
  t.company_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
WHERE u.email = 'test@test1.com';

-- ============================================================================
-- COMPLETED: Migration 077
-- ============================================================================
