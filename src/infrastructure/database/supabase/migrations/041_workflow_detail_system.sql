-- Week 7: Workflow Detail Pages - Complete workflow management system

-- 1. Workflow configurations (input/output schemas)
CREATE TABLE IF NOT EXISTS workflow_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE UNIQUE,
  input_schema JSONB DEFAULT '{}'::jsonb, -- JSON schema for inputs
  output_schema JSONB DEFAULT '{}'::jsonb, -- JSON schema for outputs
  default_inputs JSONB DEFAULT '{}'::jsonb,
  validation_rules JSONB DEFAULT '[]'::jsonb,
  environment_variables JSONB DEFAULT '{}'::jsonb,
  retry_config JSONB DEFAULT '{"max_retries": 3, "retry_delay_ms": 1000}'::jsonb,
  timeout_ms INTEGER DEFAULT 300000, -- 5 minutes default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workflow versions (for version control)
CREATE TABLE IF NOT EXISTS workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  workflow_json JSONB NOT NULL,
  configuration JSONB DEFAULT '{}'::jsonb,
  change_summary TEXT,
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, version_number)
);

-- 3. Workflow analytics (aggregated metrics)
CREATE TABLE IF NOT EXISTS workflow_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,
  min_duration_ms INTEGER,
  max_duration_ms INTEGER,
  total_duration_ms BIGINT DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, date)
);

-- 4. Workflow triggers (webhook/schedule details)
CREATE TABLE IF NOT EXISTS workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL, -- 'webhook', 'schedule', 'manual', 'event'
  trigger_config JSONB NOT NULL,
  webhook_url TEXT,
  webhook_method VARCHAR(10), -- 'GET', 'POST', 'PUT', 'DELETE'
  webhook_auth_type VARCHAR(50), -- 'none', 'basic', 'bearer', 'api_key'
  schedule_cron VARCHAR(100),
  schedule_timezone VARCHAR(50) DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Workflow execution logs (detailed logs)
CREATE TABLE IF NOT EXISTS workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID REFERENCES n8n_executions(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  log_level VARCHAR(20) NOT NULL, -- 'debug', 'info', 'warning', 'error'
  node_name VARCHAR(255),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Workflow dependencies (workflow relationships)
CREATE TABLE IF NOT EXISTS workflow_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  child_workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) NOT NULL, -- 'triggers', 'calls', 'requires'
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_workflow_id, child_workflow_id)
);

-- 7. Workflow tags (for organization)
CREATE TABLE IF NOT EXISTS workflow_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  tag_color VARCHAR(7), -- Hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workflow_id, tag_name)
);

-- Indexes
CREATE INDEX idx_workflow_configurations_workflow ON workflow_configurations(workflow_id);
CREATE INDEX idx_workflow_versions_workflow ON workflow_versions(workflow_id, version_number);
CREATE INDEX idx_workflow_versions_active ON workflow_versions(workflow_id, is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_analytics_workflow ON workflow_analytics(workflow_id, date);
CREATE INDEX idx_workflow_analytics_date ON workflow_analytics(date);
CREATE INDEX idx_workflow_triggers_workflow ON workflow_triggers(workflow_id);
CREATE INDEX idx_workflow_triggers_type ON workflow_triggers(trigger_type, is_active);
CREATE INDEX idx_workflow_execution_logs_execution ON workflow_execution_logs(execution_id);
CREATE INDEX idx_workflow_execution_logs_workflow ON workflow_execution_logs(workflow_id, logged_at);
CREATE INDEX idx_workflow_execution_logs_level ON workflow_execution_logs(log_level);
CREATE INDEX idx_workflow_dependencies_parent ON workflow_dependencies(parent_workflow_id);
CREATE INDEX idx_workflow_dependencies_child ON workflow_dependencies(child_workflow_id);
CREATE INDEX idx_workflow_tags_workflow ON workflow_tags(workflow_id);

-- RLS Policies
ALTER TABLE workflow_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tags ENABLE ROW LEVEL SECURITY;

-- Workflow configurations policies
CREATE POLICY "Users can view configurations for their tenant workflows"
  ON workflow_configurations FOR SELECT
  USING (workflow_id IN (
    SELECT id FROM n8n_workflows WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage configurations for their tenant workflows"
  ON workflow_configurations FOR ALL
  USING (workflow_id IN (
    SELECT id FROM n8n_workflows WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Workflow versions policies
CREATE POLICY "Users can view versions for their tenant workflows"
  ON workflow_versions FOR SELECT
  USING (workflow_id IN (
    SELECT id FROM n8n_workflows WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Workflow analytics policies
CREATE POLICY "Users can view analytics for their tenant workflows"
  ON workflow_analytics FOR SELECT
  USING (workflow_id IN (
    SELECT id FROM n8n_workflows WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Workflow execution logs policies
CREATE POLICY "Users can view logs for their tenant workflows"
  ON workflow_execution_logs FOR SELECT
  USING (workflow_id IN (
    SELECT id FROM n8n_workflows WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Update triggers
CREATE TRIGGER update_workflow_configurations_updated_at
  BEFORE UPDATE ON workflow_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_analytics_updated_at
  BEFORE UPDATE ON workflow_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_triggers_updated_at
  BEFORE UPDATE ON workflow_triggers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update workflow analytics
CREATE OR REPLACE FUNCTION update_workflow_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when execution completes
  IF NEW.status IN ('success', 'failed') AND OLD.status = 'running' THEN
    INSERT INTO workflow_analytics (
      workflow_id,
      date,
      total_executions,
      successful_executions,
      failed_executions,
      avg_duration_ms,
      min_duration_ms,
      max_duration_ms,
      total_duration_ms
    ) VALUES (
      NEW.workflow_id,
      CURRENT_DATE,
      1,
      CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
      NEW.duration_ms,
      NEW.duration_ms,
      NEW.duration_ms,
      NEW.duration_ms
    )
    ON CONFLICT (workflow_id, date)
    DO UPDATE SET
      total_executions = workflow_analytics.total_executions + 1,
      successful_executions = workflow_analytics.successful_executions + 
        CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
      failed_executions = workflow_analytics.failed_executions + 
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
      total_duration_ms = workflow_analytics.total_duration_ms + NEW.duration_ms,
      avg_duration_ms = (workflow_analytics.total_duration_ms + NEW.duration_ms) / 
        (workflow_analytics.total_executions + 1),
      min_duration_ms = LEAST(workflow_analytics.min_duration_ms, NEW.duration_ms),
      max_duration_ms = GREATEST(workflow_analytics.max_duration_ms, NEW.duration_ms),
      success_rate = ((workflow_analytics.successful_executions + 
        CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END)::DECIMAL / 
        (workflow_analytics.total_executions + 1) * 100),
      error_rate = ((workflow_analytics.failed_executions + 
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END)::DECIMAL / 
        (workflow_analytics.total_executions + 1) * 100);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_analytics
  AFTER UPDATE ON n8n_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_analytics();

-- RPC function to get workflow statistics
CREATE OR REPLACE FUNCTION get_workflow_statistics(
  p_workflow_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  avg_duration_ms INTEGER,
  success_rate DECIMAL,
  error_rate DECIMAL,
  last_execution_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(wa.total_executions)::BIGINT,
    SUM(wa.successful_executions)::BIGINT,
    SUM(wa.failed_executions)::BIGINT,
    AVG(wa.avg_duration_ms)::INTEGER,
    (SUM(wa.successful_executions)::DECIMAL / NULLIF(SUM(wa.total_executions), 0) * 100)::DECIMAL,
    (SUM(wa.failed_executions)::DECIMAL / NULLIF(SUM(wa.total_executions), 0) * 100)::DECIMAL,
    (SELECT MAX(finished_at) FROM n8n_executions WHERE workflow_id = p_workflow_id)
  FROM workflow_analytics wa
  WHERE wa.workflow_id = p_workflow_id
    AND wa.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get workflow execution timeline
CREATE OR REPLACE FUNCTION get_workflow_execution_timeline(
  p_workflow_id UUID,
  p_days INTEGER DEFAULT 30
) RETURNS TABLE (
  date DATE,
  total_executions INTEGER,
  successful_executions INTEGER,
  failed_executions INTEGER,
  avg_duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wa.date,
    wa.total_executions,
    wa.successful_executions,
    wa.failed_executions,
    wa.avg_duration_ms
  FROM workflow_analytics wa
  WHERE wa.workflow_id = p_workflow_id
    AND wa.date >= CURRENT_DATE - p_days
  ORDER BY wa.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get recent execution logs
CREATE OR REPLACE FUNCTION get_recent_execution_logs(
  p_execution_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  log_level VARCHAR,
  node_name VARCHAR,
  message TEXT,
  details JSONB,
  logged_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wel.id,
    wel.log_level,
    wel.node_name,
    wel.message,
    wel.details,
    wel.logged_at
  FROM workflow_execution_logs wel
  WHERE wel.execution_id = p_execution_id
  ORDER BY wel.logged_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

