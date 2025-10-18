-- ================================================
-- Check Existing Users and Tenant IDs
-- ================================================

-- Show all users with their tenant_ids
SELECT 
  email,
  tenant_id,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

