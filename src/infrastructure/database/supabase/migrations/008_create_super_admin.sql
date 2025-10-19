-- ============================================================================
-- OTONIQ.AI - Create Super Admin User
-- Migration 008: Create super admin user for system management
-- ============================================================================

-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with actual user ID from Supabase Auth
-- You can get this from browser console: await window.supabase.auth.getUser()

-- Create super admin user
-- NOTE: This should be run manually after getting the real user ID
INSERT INTO users (
  id,
  tenant_id,
  email,
  role,
  full_name,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID from auth.users
  NULL, -- Super admin has no tenant_id
  'admin@otoniq.ai',
  'super_admin',
  'Super Admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  tenant_id = NULL,
  updated_at = NOW();

-- Verify the user was created
SELECT 
  id,
  email,
  role,
  tenant_id,
  full_name,
  created_at
FROM users 
WHERE role = 'super_admin';

-- ============================================================================
-- COMPLETED: Migration 008
-- ============================================================================
