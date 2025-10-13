-- ============================================================================
-- OTONIQ.AI - Create Default Tenant for Super Admin
-- Migration 006: Create default tenant for super admin operations
-- ============================================================================

-- Create default tenant for super admin
INSERT INTO tenants (
  id,
  company_name,
  domain,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Otoniq.ai Super Admin',
  'admin.otoniq.ai',
  'enterprise',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
