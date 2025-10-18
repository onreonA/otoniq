-- ============================================================================
-- OTONIQ.AI - Usage Tracking Schema
-- Migration 063: Usage metrics, quotas, and analytics
-- ============================================================================

-- ============================================================================
-- TENANT USAGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Metric identification
  metric_name TEXT NOT NULL CHECK (metric_name IN (
    'products_count',
    'users_count',
    'orders_count',
    'api_calls',
    'storage_used_bytes',
    'ai_credits_used',
    'n8n_executions',
    'marketplace_syncs',
    'email_sent',
    'sms_sent',
    'whatsapp_messages',
    'telegram_messages'
  )),
  
  -- Metric value
  metric_value BIGINT NOT NULL DEFAULT 0,
  
  -- Period tracking
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'monthly', 'yearly')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  /* Example metadata:
  {
    "source": "api",
    "endpoint": "/products/create",
    "user_id": "uuid",
    "breakdown": {"success": 450, "failed": 50}
  }
  */
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenant_usage_tenant_id ON tenant_usage(tenant_id);
CREATE INDEX idx_tenant_usage_metric_name ON tenant_usage(metric_name);
CREATE INDEX idx_tenant_usage_recorded_at ON tenant_usage(recorded_at DESC);
CREATE INDEX idx_tenant_usage_period_type ON tenant_usage(period_type);

-- Unique constraint: One record per tenant per metric per day
CREATE UNIQUE INDEX idx_tenant_usage_unique 
  ON tenant_usage(tenant_id, metric_name, recorded_at, period_type);

-- Comments
COMMENT ON TABLE tenant_usage IS 'Daily/monthly usage metrics for each tenant';
COMMENT ON COLUMN tenant_usage.metric_value IS 'Cumulative value for the period';

-- ============================================================================
-- USAGE QUOTAS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Quota definition
  metric_name TEXT NOT NULL,
  quota_limit BIGINT NOT NULL, -- -1 = unlimited
  current_usage BIGINT NOT NULL DEFAULT 0,
  
  -- Period
  reset_period TEXT NOT NULL DEFAULT 'monthly' CHECK (reset_period IN ('daily', 'monthly', 'yearly', 'never')),
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  next_reset_at TIMESTAMPTZ,
  
  -- Alert thresholds
  warning_threshold INTEGER DEFAULT 80, -- Percentage (e.g., 80 = 80%)
  alert_sent_at TIMESTAMPTZ,
  
  -- Status
  is_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_quotas_tenant_id ON usage_quotas(tenant_id);
CREATE INDEX idx_usage_quotas_metric_name ON usage_quotas(metric_name);
CREATE INDEX idx_usage_quotas_is_exceeded ON usage_quotas(is_exceeded);
CREATE INDEX idx_usage_quotas_next_reset_at ON usage_quotas(next_reset_at);

-- Unique constraint: One quota per tenant per metric
CREATE UNIQUE INDEX idx_usage_quotas_unique 
  ON usage_quotas(tenant_id, metric_name);

-- Comments
COMMENT ON TABLE usage_quotas IS 'Usage quotas and limits for each tenant';
COMMENT ON COLUMN usage_quotas.quota_limit IS '-1 means unlimited';
COMMENT ON COLUMN usage_quotas.warning_threshold IS 'Percentage threshold for warning alerts (e.g., 80 = 80%)';

-- ============================================================================
-- USAGE EVENTS TABLE (Real-time tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value INTEGER DEFAULT 1,
  
  -- Context
  resource_type TEXT, -- 'product', 'order', 'api_call', etc.
  resource_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  /* Example metadata:
  {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "endpoint": "/api/products",
    "method": "POST",
    "response_time_ms": 150
  }
  */
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usage_events_tenant_id ON usage_events(tenant_id);
CREATE INDEX idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX idx_usage_events_metric_name ON usage_events(metric_name);
CREATE INDEX idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX idx_usage_events_resource ON usage_events(resource_type, resource_id);

-- Partition by month for better performance (optional, requires PostgreSQL 10+)
-- CREATE TABLE usage_events_y2025m01 PARTITION OF usage_events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Comments
COMMENT ON TABLE usage_events IS 'Real-time usage event tracking (high volume)';
COMMENT ON COLUMN usage_events.metric_value IS 'Increment value (usually 1)';

-- ============================================================================
-- FEATURE USAGE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Feature identification
  feature_name TEXT NOT NULL,
  feature_category TEXT, -- 'automation', 'analytics', 'marketplace', etc.
  
  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User engagement
  unique_users_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feature_usage_tenant_id ON feature_usage(tenant_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_feature_category ON feature_usage(feature_category);
CREATE INDEX idx_feature_usage_last_used_at ON feature_usage(last_used_at DESC);

-- Unique constraint
CREATE UNIQUE INDEX idx_feature_usage_unique 
  ON feature_usage(tenant_id, feature_name);

-- Comments
COMMENT ON TABLE feature_usage IS 'Feature adoption and usage tracking';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_usage_quotas_updated_at
  BEFORE UPDATE ON usage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_usage_updated_at
  BEFORE UPDATE ON feature_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update quota status
CREATE OR REPLACE FUNCTION update_quota_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if quota is exceeded
  IF NEW.quota_limit > 0 AND NEW.current_usage >= NEW.quota_limit THEN
    NEW.is_exceeded := true;
    IF OLD.is_exceeded = false THEN
      NEW.exceeded_at := NOW();
    END IF;
  ELSE
    NEW.is_exceeded := false;
    NEW.exceeded_at := NULL;
  END IF;
  
  -- Calculate next reset date
  IF NEW.reset_period = 'daily' THEN
    NEW.next_reset_at := DATE_TRUNC('day', NOW()) + INTERVAL '1 day';
  ELSIF NEW.reset_period = 'monthly' THEN
    NEW.next_reset_at := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
  ELSIF NEW.reset_period = 'yearly' THEN
    NEW.next_reset_at := DATE_TRUNC('year', NOW()) + INTERVAL '1 year';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quota_status_trigger
  BEFORE INSERT OR UPDATE ON usage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_quota_status();

-- Aggregate usage events to daily metrics
CREATE OR REPLACE FUNCTION aggregate_usage_events()
RETURNS void AS $$
DECLARE
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  -- Aggregate yesterday's events into tenant_usage
  INSERT INTO tenant_usage (tenant_id, metric_name, metric_value, recorded_at, period_type)
  SELECT 
    tenant_id,
    metric_name,
    SUM(metric_value) as total_value,
    yesterday,
    'daily'
  FROM usage_events
  WHERE DATE(created_at) = yesterday
  GROUP BY tenant_id, metric_name
  ON CONFLICT (tenant_id, metric_name, recorded_at, period_type)
  DO UPDATE SET
    metric_value = EXCLUDED.metric_value,
    metadata = jsonb_build_object(
      'last_aggregated_at', NOW(),
      'event_count', (SELECT COUNT(*) FROM usage_events 
                      WHERE tenant_id = EXCLUDED.tenant_id 
                      AND metric_name = EXCLUDED.metric_name 
                      AND DATE(created_at) = yesterday)
    );
  
  -- Update usage quotas
  UPDATE usage_quotas uq
  SET current_usage = (
    SELECT COALESCE(SUM(metric_value), 0)
    FROM tenant_usage tu
    WHERE tu.tenant_id = uq.tenant_id
      AND tu.metric_name = uq.metric_name
      AND tu.recorded_at >= uq.last_reset_at
  );
  
  RAISE NOTICE 'Usage events aggregated for %', yesterday;
END;
$$ LANGUAGE plpgsql;

-- Schedule this function to run daily via pg_cron or external scheduler
COMMENT ON FUNCTION aggregate_usage_events IS 'Aggregate usage_events into tenant_usage (run daily)';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Tenant Usage: Users can view their own, super admins can view all
CREATE POLICY "Users can view their usage metrics"
  ON tenant_usage FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert usage metrics"
  ON tenant_usage FOR INSERT
  WITH CHECK (true); -- Allow system to insert

CREATE POLICY "Super admins can manage all usage metrics"
  ON tenant_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Usage Quotas: Same as tenant_usage
CREATE POLICY "Users can view their usage quotas"
  ON usage_quotas FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all usage quotas"
  ON usage_quotas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Usage Events: Users can view their own, system can insert
CREATE POLICY "Users can view their usage events"
  ON usage_events FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert usage events"
  ON usage_events FOR INSERT
  WITH CHECK (true);

-- Feature Usage: Same as tenant_usage
CREATE POLICY "Users can view their feature usage"
  ON feature_usage FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can manage feature usage"
  ON feature_usage FOR ALL
  WITH CHECK (true);

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Current period usage summary
CREATE OR REPLACE VIEW current_usage_summary_view AS
SELECT 
  t.id as tenant_id,
  t.company_name,
  sp.plan_name,
  uq.metric_name,
  uq.quota_limit,
  uq.current_usage,
  CASE 
    WHEN uq.quota_limit = -1 THEN 0
    ELSE ROUND((uq.current_usage::NUMERIC / uq.quota_limit::NUMERIC) * 100, 2)
  END as usage_percentage,
  uq.is_exceeded,
  uq.next_reset_at
FROM tenants t
LEFT JOIN tenant_subscriptions ts ON ts.tenant_id = t.id AND ts.status IN ('trial', 'active')
LEFT JOIN subscription_plans sp ON sp.id = ts.plan_id
LEFT JOIN usage_quotas uq ON uq.tenant_id = t.id
WHERE t.subscription_status = 'active';

COMMENT ON VIEW current_usage_summary_view IS 'Current usage vs quotas for all active tenants';

-- Feature adoption rate
CREATE OR REPLACE VIEW feature_adoption_view AS
SELECT 
  fu.feature_name,
  fu.feature_category,
  COUNT(DISTINCT fu.tenant_id) as tenants_using,
  (SELECT COUNT(*) FROM tenants WHERE subscription_status = 'active') as total_active_tenants,
  ROUND(
    (COUNT(DISTINCT fu.tenant_id)::NUMERIC / 
     NULLIF((SELECT COUNT(*) FROM tenants WHERE subscription_status = 'active'), 0)::NUMERIC) * 100, 
    2
  ) as adoption_rate_percent,
  SUM(fu.usage_count) as total_usage_count,
  MAX(fu.last_used_at) as most_recent_use
FROM feature_usage fu
GROUP BY fu.feature_name, fu.feature_category
ORDER BY adoption_rate_percent DESC;

COMMENT ON VIEW feature_adoption_view IS 'Feature adoption rates across all tenants';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_tenant_id UUID,
  p_metric_name TEXT,
  p_value INTEGER DEFAULT 1
)
RETURNS void AS $$
BEGIN
  -- Insert usage event
  INSERT INTO usage_events (tenant_id, metric_name, metric_value, event_type)
  VALUES (p_tenant_id, p_metric_name, p_value, 'increment');
  
  -- Update quota current usage
  UPDATE usage_quotas
  SET current_usage = current_usage + p_value
  WHERE tenant_id = p_tenant_id AND metric_name = p_metric_name;
  
  -- If quota doesn't exist, create it (with unlimited limit)
  INSERT INTO usage_quotas (tenant_id, metric_name, quota_limit, current_usage)
  VALUES (p_tenant_id, p_metric_name, -1, p_value)
  ON CONFLICT (tenant_id, metric_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_usage IS 'Increment usage for a tenant metric';

-- Function to check if quota is exceeded
CREATE OR REPLACE FUNCTION check_quota_exceeded(
  p_tenant_id UUID,
  p_metric_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_exceeded BOOLEAN;
BEGIN
  SELECT is_exceeded INTO v_is_exceeded
  FROM usage_quotas
  WHERE tenant_id = p_tenant_id AND metric_name = p_metric_name;
  
  RETURN COALESCE(v_is_exceeded, false);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_quota_exceeded IS 'Check if a tenant has exceeded their quota for a metric';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 063: Usage tracking schema created successfully!';
  RAISE NOTICE '📦 Created tables: tenant_usage, usage_quotas, usage_events, feature_usage';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📊 Helper views created: current_usage_summary_view, feature_adoption_view';
  RAISE NOTICE '⚡ Helper functions: increment_usage(), check_quota_exceeded(), aggregate_usage_events()';
END $$;

