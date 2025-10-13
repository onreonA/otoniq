-- ============================================================================
-- OTONIQ.AI - Assign Tenant to User
-- Migration 007: Assign tenant_id to bilgi@omerfarukunsal.com user
-- ============================================================================

-- First, create a tenant for the user if it doesn't exist
INSERT INTO tenants (
  id,
  company_name,
  domain,
  subscription_plan,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Omer Faruk Unsal',
  'omerfarukunsal.com',
  'professional',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update the user to assign tenant_id
UPDATE users 
SET 
  tenant_id = '11111111-1111-1111-1111-111111111111',
  updated_at = NOW()
WHERE email = 'bilgi@omerfarukunsal.com';
