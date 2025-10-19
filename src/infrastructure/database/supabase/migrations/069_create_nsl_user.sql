-- ============================================================================
-- MIGRATION: 069_create_nsl_user.sql
-- DESCRIPTION: Create NSL user in auth.users and public.users tables
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-19
-- ============================================================================

-- ============================================================================
-- CREATE NSL USER AUTOMATICALLY
-- ============================================================================

-- Get the NSL tenant ID dynamically and create user profile
DO $$
DECLARE
  _tenant_id UUID;
  _user_id UUID;
BEGIN
  -- Find NSL tenant ID
  SELECT id INTO _tenant_id 
  FROM tenants 
  WHERE company_name = 'NSL Savunma ve Bilişim A.Ş.' 
  LIMIT 1;
  
  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'NSL Savunma ve Bilişim A.Ş. tenant not found. Please create the tenant first.';
  END IF;
  
  RAISE NOTICE 'Found NSL tenant with ID: %', _tenant_id;
  
  -- Check if user already exists in auth.users
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = 'omer@nsl.com.tr';
  
  IF _user_id IS NULL THEN
    RAISE NOTICE 'User omer@nsl.com.tr not found in auth.users. Please create manually through Supabase Dashboard.';
    RAISE NOTICE 'Steps:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User"';
    RAISE NOTICE '3. Enter email: omer@nsl.com.tr, password: 12345678';
    RAISE NOTICE '4. Check "Email Confirmed"';
    RAISE NOTICE '5. Click "Create User"';
    RAISE NOTICE '6. Copy the UUID and update this migration';
  ELSE
    RAISE NOTICE 'User omer@nsl.com.tr found with ID: %', _user_id;
    
    -- Create user profile in public.users
    INSERT INTO users (
      id,
      tenant_id,
      email,
      role,
      full_name,
      created_at,
      updated_at
    ) VALUES (
      _user_id,
      _tenant_id,
      'omer@nsl.com.tr',
      'tenant_admin',
      'Ömer Ünsal',
      NOW(),
      NOW()
    ) ON CONFLICT (email) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
    
    RAISE NOTICE 'User profile created/updated successfully';
  END IF;
END $$;

-- ============================================================================
-- VERIFY USER CREATION
-- ============================================================================

-- Check if user exists in auth.users (this will show if manual creation worked)
-- SELECT id, email, created_at FROM auth.users WHERE email = 'omer@nsl.com.tr';

-- Check if user profile exists in public.users
-- SELECT id, tenant_id, email, role, full_name FROM users WHERE email = 'omer@nsl.com.tr';

-- ============================================================================
-- MANUAL STEPS REQUIRED (if user not found in auth.users)
-- ============================================================================

/*
TO COMPLETE THIS MIGRATION, YOU NEED TO:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" 
3. Enter:
   - Email: omer@nsl.com.tr
   - Password: 12345678
   - Email Confirmed: true (check the box)
4. Click "Create User"
5. Run this migration again

ALTERNATIVELY, use the Supabase Admin API:

curl -X POST 'https://ydqqmyhkxczmdnqkswro.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "omer@nsl.com.tr",
    "password": "12345678",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Ömer Ünsal"
    }
  }'
*/

-- ============================================================================
-- COMPLETED: Migration 069
-- ============================================================================