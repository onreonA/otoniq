-- Workflow Analytics System
-- AI-powered insights and performance analytics

-- Workflow Execution Analytics
CREATE TABLE IF NOT EXISTS workflow_execution_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  execution_id UUID,
  execution_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  input_data_size INTEGER DEFAULT 0,
  output_data_size INTEGER DEFAULT 0,
  memory_usage_mb DECIMAL(10,2) DEFAULT 0,
  cpu_usage_percent DECIMAL(5,2) DEFAULT 0,
  node_count INTEGER DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Performance Metrics
CREATE TABLE IF NOT EXISTS workflow_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('execution_time', 'success_rate', 'error_rate', 'throughput', 'resource_usage', 'cost')),
  metric_value DECIMAL(15,4) NOT NULL,
  metric_unit TEXT NOT NULL,
  time_window TEXT NOT NULL CHECK (time_window IN ('hour', 'day', 'week', 'month')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI-Powered Insights
CREATE TABLE IF NOT EXISTS workflow_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('performance', 'optimization', 'anomaly', 'trend', 'recommendation', 'prediction')),
  insight_category TEXT NOT NULL CHECK (insight_category IN ('bottleneck', 'error_pattern', 'resource_usage', 'execution_time', 'success_rate', 'cost_optimization', 'scalability')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  data_points JSONB,
  recommendations JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Anomaly Detection
CREATE TABLE IF NOT EXISTS workflow_anomalies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('execution_time_spike', 'error_rate_increase', 'resource_usage_spike', 'throughput_drop', 'unusual_pattern')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  baseline_value DECIMAL(15,4),
  actual_value DECIMAL(15,4),
  deviation_percent DECIMAL(5,2),
  context_data JSONB,
  is_investigated BOOLEAN NOT NULL DEFAULT false,
  investigation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Cost Analytics
CREATE TABLE IF NOT EXISTS workflow_cost_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('execution', 'storage', 'api_calls', 'compute', 'bandwidth')),
  cost_amount DECIMAL(10,4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  resource_usage JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Usage Patterns
CREATE TABLE IF NOT EXISTS workflow_usage_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('peak_hours', 'usage_frequency', 'user_behavior', 'seasonal', 'trend')),
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Optimization Suggestions
CREATE TABLE IF NOT EXISTS workflow_optimization_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('performance', 'cost', 'reliability', 'scalability', 'maintainability')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_impact TEXT NOT NULL CHECK (potential_impact IN ('low', 'medium', 'high')),
  implementation_effort TEXT NOT NULL CHECK (implementation_effort IN ('low', 'medium', 'high')),
  estimated_savings DECIMAL(10,4),
  savings_unit TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Health Scores
CREATE TABLE IF NOT EXISTS workflow_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  overall_score DECIMAL(3,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  performance_score DECIMAL(3,2) NOT NULL CHECK (performance_score >= 0 AND performance_score <= 100),
  reliability_score DECIMAL(3,2) NOT NULL CHECK (reliability_score >= 0 AND reliability_score <= 100),
  efficiency_score DECIMAL(3,2) NOT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  cost_score DECIMAL(3,2) NOT NULL CHECK (cost_score >= 0 AND cost_score <= 100),
  score_factors JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_execution_analytics_workflow ON workflow_execution_analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_analytics_tenant ON workflow_execution_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_analytics_executed_at ON workflow_execution_analytics(executed_at);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_analytics_success ON workflow_execution_analytics(success);

CREATE INDEX IF NOT EXISTS idx_workflow_performance_metrics_workflow ON workflow_performance_metrics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_performance_metrics_tenant ON workflow_performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_performance_metrics_type ON workflow_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_workflow_performance_metrics_time_window ON workflow_performance_metrics(time_window);
CREATE INDEX IF NOT EXISTS idx_workflow_performance_metrics_recorded_at ON workflow_performance_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_workflow_insights_workflow ON workflow_insights(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_insights_tenant ON workflow_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_insights_type ON workflow_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_workflow_insights_severity ON workflow_insights(severity);
CREATE INDEX IF NOT EXISTS idx_workflow_insights_resolved ON workflow_insights(is_resolved);

CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_workflow ON workflow_anomalies(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_tenant ON workflow_anomalies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_type ON workflow_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_severity ON workflow_anomalies(severity);
CREATE INDEX IF NOT EXISTS idx_workflow_anomalies_detected_at ON workflow_anomalies(detected_at);

CREATE INDEX IF NOT EXISTS idx_workflow_cost_analytics_workflow ON workflow_cost_analytics(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cost_analytics_tenant ON workflow_cost_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_cost_analytics_type ON workflow_cost_analytics(cost_type);
CREATE INDEX IF NOT EXISTS idx_workflow_cost_analytics_period ON workflow_cost_analytics(billing_period_start, billing_period_end);

CREATE INDEX IF NOT EXISTS idx_workflow_usage_patterns_workflow ON workflow_usage_patterns(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_usage_patterns_tenant ON workflow_usage_patterns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_usage_patterns_type ON workflow_usage_patterns(pattern_type);

CREATE INDEX IF NOT EXISTS idx_workflow_optimization_suggestions_workflow ON workflow_optimization_suggestions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_optimization_suggestions_tenant ON workflow_optimization_suggestions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_optimization_suggestions_type ON workflow_optimization_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_workflow_optimization_suggestions_applied ON workflow_optimization_suggestions(is_applied);

CREATE INDEX IF NOT EXISTS idx_workflow_health_scores_workflow ON workflow_health_scores(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_health_scores_tenant ON workflow_health_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_health_scores_calculated_at ON workflow_health_scores(calculated_at);

-- RLS Policies
ALTER TABLE workflow_execution_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_cost_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_usage_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_optimization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_health_scores ENABLE ROW LEVEL SECURITY;

-- Execution Analytics Policies
CREATE POLICY "Users can view their tenant execution analytics" ON workflow_execution_analytics
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert execution analytics" ON workflow_execution_analytics
  FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Performance Metrics Policies
CREATE POLICY "Users can view their tenant performance metrics" ON workflow_performance_metrics
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can insert performance metrics" ON workflow_performance_metrics
  FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Insights Policies
CREATE POLICY "Users can view their tenant insights" ON workflow_insights
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update their tenant insights" ON workflow_insights
  FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Anomalies Policies
CREATE POLICY "Users can view their tenant anomalies" ON workflow_anomalies
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update their tenant anomalies" ON workflow_anomalies
  FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Cost Analytics Policies
CREATE POLICY "Users can view their tenant cost analytics" ON workflow_cost_analytics
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Usage Patterns Policies
CREATE POLICY "Users can view their tenant usage patterns" ON workflow_usage_patterns
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Optimization Suggestions Policies
CREATE POLICY "Users can view their tenant optimization suggestions" ON workflow_optimization_suggestions
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can update their tenant optimization suggestions" ON workflow_optimization_suggestions
  FOR UPDATE USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Health Scores Policies
CREATE POLICY "Users can view their tenant health scores" ON workflow_health_scores
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_workflow_performance_summary(
  p_workflow_id UUID,
  p_time_window TEXT DEFAULT '7 days'
)
RETURNS TABLE (
  total_executions BIGINT,
  success_rate DECIMAL(5,2),
  avg_execution_time DECIMAL(10,2),
  error_count BIGINT,
  last_execution TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_executions,
    ROUND(
      (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100, 
      2
    ) as success_rate,
    ROUND(AVG(execution_time_ms), 2) as avg_execution_time,
    COUNT(*) FILTER (WHERE success = false) as error_count,
    MAX(executed_at) as last_execution
  FROM workflow_execution_analytics
  WHERE workflow_id = p_workflow_id
    AND executed_at >= NOW() - INTERVAL '1 ' || p_time_window;
END;
$$ LANGUAGE plpgsql;

-- Function to get workflow health score
CREATE OR REPLACE FUNCTION calculate_workflow_health_score(
  p_workflow_id UUID
)
RETURNS TABLE (
  overall_score DECIMAL(3,2),
  performance_score DECIMAL(3,2),
  reliability_score DECIMAL(3,2),
  efficiency_score DECIMAL(3,2),
  cost_score DECIMAL(3,2)
) AS $$
DECLARE
  v_performance_score DECIMAL(3,2);
  v_reliability_score DECIMAL(3,2);
  v_efficiency_score DECIMAL(3,2);
  v_cost_score DECIMAL(3,2);
  v_overall_score DECIMAL(3,2);
BEGIN
  -- Calculate performance score based on execution time
  SELECT 
    CASE 
      WHEN AVG(execution_time_ms) <= 1000 THEN 100
      WHEN AVG(execution_time_ms) <= 5000 THEN 80
      WHEN AVG(execution_time_ms) <= 10000 THEN 60
      WHEN AVG(execution_time_ms) <= 30000 THEN 40
      ELSE 20
    END
  INTO v_performance_score
  FROM workflow_execution_analytics
  WHERE workflow_id = p_workflow_id
    AND executed_at >= NOW() - INTERVAL '30 days';

  -- Calculate reliability score based on success rate
  SELECT 
    ROUND(
      (COUNT(*) FILTER (WHERE success = true)::DECIMAL / COUNT(*)) * 100, 
      2
    )
  INTO v_reliability_score
  FROM workflow_execution_analytics
  WHERE workflow_id = p_workflow_id
    AND executed_at >= NOW() - INTERVAL '30 days';

  -- Calculate efficiency score based on resource usage
  SELECT 
    CASE 
      WHEN AVG(memory_usage_mb) <= 100 AND AVG(cpu_usage_percent) <= 50 THEN 100
      WHEN AVG(memory_usage_mb) <= 200 AND AVG(cpu_usage_percent) <= 70 THEN 80
      WHEN AVG(memory_usage_mb) <= 500 AND AVG(cpu_usage_percent) <= 85 THEN 60
      ELSE 40
    END
  INTO v_efficiency_score
  FROM workflow_execution_analytics
  WHERE workflow_id = p_workflow_id
    AND executed_at >= NOW() - INTERVAL '30 days';

  -- Calculate cost score (simplified)
  v_cost_score := 80; -- Default cost score

  -- Calculate overall score
  v_overall_score := (v_performance_score + v_reliability_score + v_efficiency_score + v_cost_score) / 4;

  RETURN QUERY SELECT 
    v_overall_score,
    v_performance_score,
    v_reliability_score,
    v_efficiency_score,
    v_cost_score;
END;
$$ LANGUAGE plpgsql;

-- Function to detect anomalies
CREATE OR REPLACE FUNCTION detect_workflow_anomalies(
  p_workflow_id UUID
)
RETURNS TABLE (
  anomaly_type TEXT,
  severity TEXT,
  baseline_value DECIMAL(15,4),
  actual_value DECIMAL(15,4),
  deviation_percent DECIMAL(5,2)
) AS $$
BEGIN
  -- This is a simplified anomaly detection
  -- In a real implementation, this would use more sophisticated ML algorithms
  RETURN QUERY
  SELECT 
    'execution_time_spike'::TEXT as anomaly_type,
    CASE 
      WHEN deviation > 200 THEN 'critical'::TEXT
      WHEN deviation > 100 THEN 'high'::TEXT
      WHEN deviation > 50 THEN 'medium'::TEXT
      ELSE 'low'::TEXT
    END as severity,
    baseline.avg_time as baseline_value,
    recent.avg_time as actual_value,
    ROUND(((recent.avg_time - baseline.avg_time) / baseline.avg_time) * 100, 2) as deviation_percent
  FROM (
    SELECT AVG(execution_time_ms) as avg_time
    FROM workflow_execution_analytics
    WHERE workflow_id = p_workflow_id
      AND executed_at >= NOW() - INTERVAL '30 days'
      AND executed_at < NOW() - INTERVAL '7 days'
  ) baseline,
  (
    SELECT AVG(execution_time_ms) as avg_time
    FROM workflow_execution_analytics
    WHERE workflow_id = p_workflow_id
      AND executed_at >= NOW() - INTERVAL '7 days'
  ) recent
  WHERE recent.avg_time > baseline.avg_time * 1.5; -- 50% increase threshold
END;
$$ LANGUAGE plpgsql;

-- Function to get optimization suggestions
CREATE OR REPLACE FUNCTION get_workflow_optimization_suggestions(
  p_workflow_id UUID
)
RETURNS TABLE (
  suggestion_type TEXT,
  title TEXT,
  description TEXT,
  potential_impact TEXT,
  implementation_effort TEXT,
  estimated_savings DECIMAL(10,4)
) AS $$
BEGIN
  -- This is a simplified suggestion system
  -- In a real implementation, this would use AI/ML to generate suggestions
  RETURN QUERY
  SELECT 
    'performance'::TEXT as suggestion_type,
    'Optimize Node Execution Order'::TEXT as title,
    'Reorder nodes to minimize data transfer and improve execution time'::TEXT as description,
    'high'::TEXT as potential_impact,
    'medium'::TEXT as implementation_effort,
    0.0::DECIMAL(10,4) as estimated_savings
  WHERE EXISTS (
    SELECT 1 FROM workflow_execution_analytics
    WHERE workflow_id = p_workflow_id
      AND execution_time_ms > 10000
  );
END;
$$ LANGUAGE plpgsql;
