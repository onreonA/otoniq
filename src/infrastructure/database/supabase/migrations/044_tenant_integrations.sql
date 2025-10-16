-- ============================================================================
-- OTONIQ.AI - Tenant Integrations Schema
-- Migration 044: Tenant integrations for Odoo, Shopify, etc.
-- ============================================================================

-- ============================================================================
-- TENANT INTEGRATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration info
  integration_type TEXT NOT NULL CHECK (integration_type IN (
    'odoo', 'shopify', 'woocommerce', 'sap', 'alibaba', 'trendyol', 'amazon', 'other'
  )),
  integration_name TEXT, -- Custom name for "other"
  
  -- Configuration (ENCRYPTED in application layer)
  config JSONB NOT NULL, -- {url, username, password, api_key, etc}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
  last_connection_test TIMESTAMPTZ,
  last_error TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb, -- {auto_sync: true, sync_interval: 3600, etc}
  
  -- Stats
  total_syncs INTEGER DEFAULT 0,
  last_sync_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One integration type per tenant
  UNIQUE(tenant_id, integration_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_tenant_id ON tenant_integrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_type ON tenant_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_status ON tenant_integrations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_integrations_active ON tenant_integrations(is_active);

-- Comments
COMMENT ON TABLE tenant_integrations IS 'Tenant entegrasyonları (Odoo, Shopify, vb.)';
COMMENT ON COLUMN tenant_integrations.config IS 'Integration configuration (encrypted)';
COMMENT ON COLUMN tenant_integrations.settings IS 'Integration settings and preferences';

-- RLS Policies
ALTER TABLE tenant_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Tenants can view own integrations" ON tenant_integrations;
DROP POLICY IF EXISTS "Tenants can insert own integrations" ON tenant_integrations;
DROP POLICY IF EXISTS "Tenants can update own integrations" ON tenant_integrations;
DROP POLICY IF EXISTS "Tenants can delete own integrations" ON tenant_integrations;
DROP POLICY IF EXISTS "Allow all for testing" ON tenant_integrations;

-- Policy: Tenants can only see their own integrations
CREATE POLICY "Tenants can view own integrations" ON tenant_integrations
  FOR SELECT USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can insert their own integrations
CREATE POLICY "Tenants can insert own integrations" ON tenant_integrations
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can update their own integrations
CREATE POLICY "Tenants can update own integrations" ON tenant_integrations
  FOR UPDATE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can delete their own integrations
CREATE POLICY "Tenants can delete own integrations" ON tenant_integrations
  FOR DELETE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Temporary policy for testing (remove in production)
CREATE POLICY "Allow all for testing" ON tenant_integrations
  FOR ALL USING (true);

-- Update trigger
CREATE OR REPLACE FUNCTION update_tenant_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_update_tenant_integrations_updated_at ON tenant_integrations;

CREATE TRIGGER trigger_update_tenant_integrations_updated_at
  BEFORE UPDATE ON tenant_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_integrations_updated_at();
