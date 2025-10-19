-- ============================================================================
-- OTONIQ.AI - Fix Super Admin User
-- Migration 009: Update existing user to super admin role
-- ============================================================================

-- First, let's see what users exist
SELECT 
  id,
  email,
  role,
  tenant_id,
  full_name,
  created_at
FROM users 
ORDER BY created_at DESC;

-- Update the first user to be super admin (replace with actual user ID)
-- This is a temporary fix - in production, you should use proper user management
UPDATE users 
SET 
  role = 'super_admin',
  tenant_id = NULL,
  updated_at = NOW()
WHERE id = (
  SELECT id FROM users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verify the update
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
-- COMPLETED: Migration 009
-- ============================================================================
