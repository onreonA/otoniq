-- ============================================================================
-- OTONIQ.AI - Integration Logs Schema
-- Migration 045: Integration activity logs
-- ============================================================================

-- Drop existing table if exists
DROP TABLE IF EXISTS integration_logs CASCADE;

-- ============================================================================
-- INTEGRATION LOGS TABLE
-- Stores logs for all integration activities (Odoo, Shopify, N8N, etc.)
-- ============================================================================
CREATE TABLE integration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration info
  integration_type TEXT NOT NULL, -- 'odoo', 'shopify', 'n8n', etc.
  integration_id UUID REFERENCES tenant_integrations(id) ON DELETE CASCADE,
  
  -- Log details
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'debug')),
  message TEXT NOT NULL,
  log_type TEXT NOT NULL, -- 'connection', 'sync', 'error', etc.
  
  -- Additional data
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_logs_tenant_id ON integration_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_type ON integration_logs(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_logs_level ON integration_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);

-- Comments
COMMENT ON TABLE integration_logs IS 'Integration activity logs for debugging and monitoring';
COMMENT ON COLUMN integration_logs.log_level IS 'Log level: info, warning, error, debug';
COMMENT ON COLUMN integration_logs.log_type IS 'Log type: connection, sync, error, etc.';
COMMENT ON COLUMN integration_logs.details IS 'Additional log data in JSON format';

-- RLS Policies
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can only see their own logs
CREATE POLICY "Tenants can view own logs" ON integration_logs
  FOR SELECT USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can insert their own logs
CREATE POLICY "Tenants can insert own logs" ON integration_logs
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can update their own logs (for status changes)
CREATE POLICY "Tenants can update own logs" ON integration_logs
  FOR UPDATE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Policy: Tenants can delete their own logs
CREATE POLICY "Tenants can delete own logs" ON integration_logs
  FOR DELETE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- Temporary policy for testing (remove in production)
CREATE POLICY "Allow all for testing" ON integration_logs
  FOR ALL USING (true);
