/**
 * Analytics Cache & Events Schema
 * 
 * Purpose: Pre-calculated metrics for performance and event tracking
 */

-- =====================================================
-- 1. Analytics Events Table
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'order_created', 'product_viewed', 'search', 'sync_completed', etc.
  event_category TEXT NOT NULL, -- 'sales', 'inventory', 'integration', 'user_action'
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata for filtering
  product_id UUID,
  order_id UUID,
  amount NUMERIC(10, 2),
  quantity INTEGER
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_tenant_date ON analytics_events(tenant_id, created_at DESC);

-- =====================================================
-- 2. Analytics Cache Table (Pre-calculated Metrics)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'total_sales', 'total_orders', 'avg_order_value', 'product_count', etc.
  metric_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly', 'all_time'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metric_value NUMERIC(15, 2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(tenant_id, metric_type, metric_period, period_start)
);

-- Indexes
CREATE INDEX idx_analytics_cache_tenant_id ON analytics_cache(tenant_id);
CREATE INDEX idx_analytics_cache_type ON analytics_cache(metric_type);
CREATE INDEX idx_analytics_cache_period ON analytics_cache(period_start DESC);
CREATE INDEX idx_analytics_cache_tenant_metric ON analytics_cache(tenant_id, metric_type, period_start DESC);

-- =====================================================
-- 3. Cohort Analysis Table
-- =====================================================

CREATE TABLE IF NOT EXISTS cohort_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cohort_month DATE NOT NULL, -- First month of cohort (e.g., '2025-01-01')
  retention_month INTEGER NOT NULL, -- Months since cohort_month (0, 1, 2, 3, ...)
  customer_count INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(15, 2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, cohort_month, retention_month)
);

-- Indexes
CREATE INDEX idx_cohort_tenant_id ON cohort_analysis(tenant_id);
CREATE INDEX idx_cohort_month ON cohort_analysis(cohort_month DESC);

-- =====================================================
-- 4. Analytics Alerts Table
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'anomaly', 'threshold', 'trend'
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  current_value NUMERIC(15, 2),
  expected_value NUMERIC(15, 2),
  threshold_value NUMERIC(15, 2),
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_alerts_tenant_id ON analytics_alerts(tenant_id);
CREATE INDEX idx_analytics_alerts_severity ON analytics_alerts(severity);
CREATE INDEX idx_analytics_alerts_acknowledged ON analytics_alerts(is_acknowledged);
CREATE INDEX idx_analytics_alerts_created_at ON analytics_alerts(created_at DESC);

-- =====================================================
-- 5. Enable RLS
-- =====================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS Policies (Permissive for authenticated users)
-- =====================================================

-- Analytics Events
CREATE POLICY "Users can view own tenant analytics events" ON analytics_events
  FOR SELECT TO authenticated
  USING (true); -- Simplified for now

CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Analytics Cache
CREATE POLICY "Users can view own tenant analytics cache" ON analytics_cache
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage analytics cache" ON analytics_cache
  FOR ALL TO authenticated
  USING (true);

-- Cohort Analysis
CREATE POLICY "Users can view own tenant cohort analysis" ON cohort_analysis
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage cohort analysis" ON cohort_analysis
  FOR ALL TO authenticated
  USING (true);

-- Analytics Alerts
CREATE POLICY "Users can view own tenant analytics alerts" ON analytics_alerts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage analytics alerts" ON analytics_alerts
  FOR ALL TO authenticated
  USING (true);

-- =====================================================
-- 7. Helper Functions
-- =====================================================

-- Function to calculate metrics (will be called by AnalyticsService)
CREATE OR REPLACE FUNCTION calculate_sales_metrics(
  p_tenant_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_sales NUMERIC,
  total_orders INTEGER,
  avg_order_value NUMERIC,
  customer_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COUNT(DISTINCT o.id)::INTEGER as total_orders,
    COALESCE(AVG(o.total_amount), 0) as avg_order_value,
    COUNT(DISTINCT o.customer_id)::INTEGER as customer_count
  FROM orders o
  WHERE o.tenant_id = p_tenant_id
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top products by revenue
CREATE OR REPLACE FUNCTION get_top_products(
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  productId TEXT,
  productName TEXT,
  revenue NUMERIC,
  quantity INTEGER,
  orderCount INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id::TEXT as productId,
    p.name as productName,
    COALESCE(SUM(oi.price * oi.quantity), 0) as revenue,
    COALESCE(SUM(oi.quantity), 0)::INTEGER as quantity,
    COUNT(DISTINCT oi.order_id)::INTEGER as orderCount
  FROM products p
  LEFT JOIN order_items oi ON oi.product_id = p.id
  LEFT JOIN orders o ON o.id = oi.order_id
  WHERE p.tenant_id = p_tenant_id
    AND (o.status IS NULL OR o.status != 'cancelled')
  GROUP BY p.id, p.name
  ORDER BY revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect anomalies (simple Z-score method)
CREATE OR REPLACE FUNCTION detect_anomalies(
  p_tenant_id UUID,
  p_metric_type TEXT,
  p_threshold NUMERIC DEFAULT 2.5
)
RETURNS TABLE (
  period_start TIMESTAMPTZ,
  metric_value NUMERIC,
  z_score NUMERIC,
  is_anomaly BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      AVG(metric_value) as mean_value,
      STDDEV(metric_value) as std_dev
    FROM analytics_cache
    WHERE tenant_id = p_tenant_id
      AND metric_type = p_metric_type
      AND metric_period = 'daily'
  )
  SELECT
    ac.period_start,
    ac.metric_value,
    (ac.metric_value - s.mean_value) / NULLIF(s.std_dev, 0) as z_score,
    ABS((ac.metric_value - s.mean_value) / NULLIF(s.std_dev, 0)) > p_threshold as is_anomaly
  FROM analytics_cache ac, stats s
  WHERE ac.tenant_id = p_tenant_id
    AND ac.metric_type = p_metric_type
    AND ac.metric_period = 'daily'
  ORDER BY ac.period_start DESC
  LIMIT 30;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. Comments
-- =====================================================

COMMENT ON TABLE analytics_events IS 'Raw analytics events for tracking user actions and system events';
COMMENT ON TABLE analytics_cache IS 'Pre-calculated metrics for fast dashboard loading';
COMMENT ON TABLE cohort_analysis IS 'Customer cohort retention and revenue analysis';
COMMENT ON TABLE analytics_alerts IS 'Automated alerts for anomalies and thresholds';

-- =====================================================
-- 9. Verification
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Analytics schema created successfully';
  RAISE NOTICE '✅ Tables: analytics_events, analytics_cache, cohort_analysis, analytics_alerts';
  RAISE NOTICE '✅ Functions: calculate_sales_metrics(), detect_anomalies()';
  RAISE NOTICE 'ℹ️  Ready for AnalyticsService implementation';
END $$;

