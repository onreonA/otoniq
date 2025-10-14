-- =====================================================
-- MIGRATION 011: Integration Logs & Sync History Schema
-- Description: Tables for tracking integration syncs, logs, and operations
-- Created: 2025-01-14
-- =====================================================

-- =====================================================
-- 1. INTEGRATION LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration Details
  integration_type TEXT NOT NULL, -- 'odoo', 'shopify', 'trendyol', etc.
  operation_type TEXT NOT NULL, -- 'sync', 'import', 'export', 'webhook'
  direction TEXT NOT NULL, -- 'inbound', 'outbound', 'bidirectional'
  
  -- Operation Details
  entity_type TEXT, -- 'product', 'order', 'customer', 'category', 'inventory'
  entity_id TEXT, -- External ID or internal ID
  entity_count INTEGER DEFAULT 0, -- Number of entities processed
  
  -- Status & Results
  status TEXT NOT NULL, -- 'pending', 'running', 'success', 'partial_success', 'failed', 'cancelled'
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- Duration in milliseconds
  
  -- Details
  request_data JSONB, -- Request payload or parameters
  response_data JSONB, -- Response or result data
  error_message TEXT,
  error_details JSONB,
  warnings JSONB, -- Array of warning messages
  metadata JSONB, -- Additional metadata
  
  -- Tracking
  triggered_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Manual trigger
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_integration_type CHECK (integration_type IN ('odoo', 'shopify', 'trendyol', 'n11', 'hepsiburada', 'amazon', 'etsy', 'ebay', 'custom')),
  CONSTRAINT valid_operation_type CHECK (operation_type IN ('sync', 'import', 'export', 'webhook', 'manual')),
  CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'success', 'partial_success', 'failed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_integration_logs_tenant ON integration_logs(tenant_id);
CREATE INDEX idx_integration_logs_type ON integration_logs(integration_type);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_created ON integration_logs(created_at DESC);
CREATE INDEX idx_integration_logs_entity ON integration_logs(entity_type, entity_id);
CREATE INDEX idx_integration_logs_tenant_type ON integration_logs(tenant_id, integration_type, created_at DESC);

-- RLS Policies
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's integration logs"
  ON integration_logs
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert integration logs for their tenant"
  ON integration_logs
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's integration logs"
  ON integration_logs
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 2. INTEGRATION SYNC SCHEDULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS integration_sync_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration Details
  integration_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  direction TEXT NOT NULL,
  
  -- Schedule Configuration
  is_enabled BOOLEAN DEFAULT true,
  frequency TEXT NOT NULL, -- 'manual', 'realtime', 'hourly', 'daily', 'weekly'
  cron_expression TEXT, -- For custom schedules
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT,
  
  -- Configuration
  sync_config JSONB, -- Filters, mappings, etc.
  
  -- Tracking
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_sync_frequency CHECK (frequency IN ('manual', 'realtime', 'hourly', 'daily', 'weekly', 'custom'))
);

-- Indexes
CREATE INDEX idx_sync_schedules_tenant ON integration_sync_schedules(tenant_id);
CREATE INDEX idx_sync_schedules_enabled ON integration_sync_schedules(is_enabled, next_run_at);
CREATE INDEX idx_sync_schedules_type ON integration_sync_schedules(tenant_id, integration_type);

-- RLS Policies
ALTER TABLE integration_sync_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their tenant's sync schedules"
  ON integration_sync_schedules
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their tenant's sync schedules"
  ON integration_sync_schedules
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 3. INTEGRATION FIELD MAPPINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Integration & Entity
  integration_type TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'product', 'order', 'customer', etc.
  
  -- Mapping Configuration
  source_field TEXT NOT NULL, -- External field name
  target_field TEXT NOT NULL, -- Internal field name
  transformation JSONB, -- Transformation rules (if any)
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, integration_type, entity_type, source_field, target_field)
);

-- Indexes
CREATE INDEX idx_field_mappings_tenant ON integration_field_mappings(tenant_id);
CREATE INDEX idx_field_mappings_type ON integration_field_mappings(tenant_id, integration_type, entity_type);

-- RLS Policies
ALTER TABLE integration_field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their tenant's field mappings"
  ON integration_field_mappings
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate log statistics
CREATE OR REPLACE FUNCTION get_integration_stats(
  p_tenant_id UUID,
  p_integration_type TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days'
)
RETURNS TABLE (
  total_syncs BIGINT,
  successful_syncs BIGINT,
  failed_syncs BIGINT,
  total_entities BIGINT,
  success_rate NUMERIC,
  avg_duration_ms NUMERIC,
  last_sync_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_syncs,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_syncs,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_syncs,
    COALESCE(SUM(entity_count), 0)::BIGINT as total_entities,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as success_rate,
    ROUND(AVG(duration_ms), 0) as avg_duration_ms,
    MAX(completed_at) as last_sync_at
  FROM integration_logs
  WHERE tenant_id = p_tenant_id
    AND integration_type = p_integration_type
    AND created_at >= p_start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update sync schedule after run
CREATE OR REPLACE FUNCTION update_sync_schedule_after_run(
  p_schedule_id UUID,
  p_status TEXT,
  p_next_run_at TIMESTAMP WITH TIME ZONE
)
RETURNS VOID AS $$
BEGIN
  UPDATE integration_sync_schedules
  SET 
    last_run_at = NOW(),
    last_run_status = p_status,
    next_run_at = p_next_run_at,
    updated_at = NOW()
  WHERE id = p_schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. VIEWS FOR ANALYTICS
-- =====================================================

-- Recent integration activity view
CREATE OR REPLACE VIEW recent_integration_activity AS
SELECT 
  il.id,
  il.tenant_id,
  il.integration_type,
  il.operation_type,
  il.entity_type,
  il.entity_count,
  il.status,
  il.success_count,
  il.error_count,
  il.duration_ms,
  il.started_at,
  il.completed_at,
  il.error_message,
  u.email as triggered_by_email
FROM integration_logs il
LEFT JOIN users u ON il.triggered_by = u.id
WHERE il.created_at >= NOW() - INTERVAL '7 days'
ORDER BY il.created_at DESC;

-- Integration health summary view
CREATE OR REPLACE VIEW integration_health_summary AS
SELECT 
  tenant_id,
  integration_type,
  COUNT(*) as total_operations,
  COUNT(*) FILTER (WHERE status = 'success') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'partial_success') as partial,
  ROUND(AVG(duration_ms), 0) as avg_duration_ms,
  MAX(completed_at) as last_sync_at,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    ELSE 0 
  END as success_rate
FROM integration_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, integration_type;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_integration_logs_updated_at
  BEFORE UPDATE ON integration_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_logs_updated_at();

CREATE TRIGGER trigger_sync_schedules_updated_at
  BEFORE UPDATE ON integration_sync_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_logs_updated_at();

CREATE TRIGGER trigger_field_mappings_updated_at
  BEFORE UPDATE ON integration_field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_logs_updated_at();

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE integration_logs IS 'Tracks all integration sync operations and their results';
COMMENT ON TABLE integration_sync_schedules IS 'Manages scheduled integration synchronization jobs';
COMMENT ON TABLE integration_field_mappings IS 'Defines field mappings between external and internal systems';
COMMENT ON FUNCTION get_integration_stats IS 'Calculates integration statistics for a given period';
COMMENT ON VIEW recent_integration_activity IS 'Shows recent integration activity across all tenants';
COMMENT ON VIEW integration_health_summary IS 'Provides health metrics for each integration';

-- =====================================================
-- END OF MIGRATION 011
-- =====================================================

