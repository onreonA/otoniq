-- ============================================================================
-- MIGRATION: 070_fix_nsl_user.sql
-- DESCRIPTION: Fix NSL user creation and account lockout issues
-- AUTHOR: OTONIQ Team
-- DATE: 2025-01-19
-- ============================================================================

-- ============================================================================
-- CHECK CURRENT STATUS
-- ============================================================================

-- Check if NSL tenant exists
DO $$
DECLARE
  _tenant_id UUID;
  _user_id UUID;
BEGIN
  -- Find NSL tenant
  SELECT id INTO _tenant_id 
  FROM tenants 
  WHERE company_name = 'NSL Savunma ve Bilişim A.Ş.' 
  LIMIT 1;
  
  IF _tenant_id IS NULL THEN
    RAISE NOTICE '❌ NSL tenant not found!';
  ELSE
    RAISE NOTICE '✅ NSL tenant found with ID: %', _tenant_id;
  END IF;
  
  -- Check if user exists in auth.users
  SELECT id INTO _user_id 
  FROM auth.users 
  WHERE email = 'omer@nsl.com.tr';
  
  IF _user_id IS NULL THEN
    RAISE NOTICE '❌ User omer@nsl.com.tr not found in auth.users';
    RAISE NOTICE '🔧 MANUAL STEPS REQUIRED:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User"';
    RAISE NOTICE '3. Email: omer@nsl.com.tr';
    RAISE NOTICE '4. Password: 12345678';
    RAISE NOTICE '5. Check "Email Confirmed"';
    RAISE NOTICE '6. Click "Create User"';
    RAISE NOTICE '7. Run this migration again';
  ELSE
    RAISE NOTICE '✅ User omer@nsl.com.tr found in auth.users with ID: %', _user_id;
    
    -- Create/update user profile in public.users
    IF _tenant_id IS NOT NULL THEN
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
      
      RAISE NOTICE '✅ User profile created/updated successfully';
    END IF;
  END IF;
END $$;

-- ============================================================================
-- VERIFY FUNCTIONS EXIST
-- ============================================================================

-- Check if account lockout functions exist
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN ('record_login_attempt', 'get_failed_attempts_count', 'is_account_locked');
  
  IF function_count < 3 THEN
    RAISE NOTICE '❌ Account lockout functions missing. Run migration 068 first.';
  ELSE
    RAISE NOTICE '✅ Account lockout functions exist';
  END IF;
END $$;

-- ============================================================================
-- TEST FUNCTIONS
-- ============================================================================

-- Test if functions work (this will show any parameter issues)
DO $$
DECLARE
  test_result INTEGER;
BEGIN
  -- Test get_failed_attempts_count function
  BEGIN
    SELECT get_failed_attempts_count('test@example.com', 15, NULL) INTO test_result;
    RAISE NOTICE '✅ get_failed_attempts_count function works';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ get_failed_attempts_count function error: %', SQLERRM;
  END;
END $$;

-- ============================================================================
-- COMPLETED: Migration 070
-- ============================================================================
