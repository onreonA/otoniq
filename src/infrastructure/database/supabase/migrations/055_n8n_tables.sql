-- ================================================
-- N8N Workflows and Executions Tables
-- ================================================
-- Created: 2025-01-16
-- Purpose: Store N8N workflow configurations and execution history

-- ================================================
-- STEP 1: Create n8n_workflows table
-- ================================================
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES profiles(tenant_id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  workflow_description TEXT,
  n8n_workflow_id TEXT, -- N8N Cloud'daki workflow ID
  workflow_json JSONB,
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'webhook', 'cron', 'event')),
  trigger_config JSONB,
  webhook_url TEXT, -- N8N webhook URL'i
  is_active BOOLEAN DEFAULT true,
  execution_count INT DEFAULT 0,
  last_execution_at TIMESTAMPTZ,
  last_execution_status TEXT CHECK (last_execution_status IN ('success', 'failed', 'running', 'waiting')),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 2: Create n8n_executions table
-- ================================================
CREATE TABLE IF NOT EXISTS n8n_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  n8n_execution_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_data JSONB,
  status TEXT CHECK (status IN ('running', 'success', 'failed', 'waiting', 'canceled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_ms INT,
  error_message TEXT,
  execution_data JSONB,
  steps_completed INT,
  steps_total INT,
  output_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- STEP 3: Create indexes for performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_tenant_id ON n8n_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_n8n_workflow_id ON n8n_workflows(n8n_workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_is_active ON n8n_workflows(is_active);

CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow_id ON n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_tenant_id ON n8n_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_started_at ON n8n_executions(started_at);

-- ================================================
-- STEP 4: Enable Row Level Security
-- ================================================
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_executions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 5: Create RLS Policies
-- ================================================

-- Users can view their tenant workflows
CREATE POLICY "Users can view their tenant workflows"
  ON n8n_workflows FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can insert workflows for their tenant
CREATE POLICY "Users can insert workflows for their tenant"
  ON n8n_workflows FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can update their tenant workflows
CREATE POLICY "Users can update their tenant workflows"
  ON n8n_workflows FOR UPDATE
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can delete their tenant workflows
CREATE POLICY "Users can delete their tenant workflows"
  ON n8n_workflows FOR DELETE
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can view their tenant executions
CREATE POLICY "Users can view their tenant executions"
  ON n8n_executions FOR SELECT
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can insert executions for their tenant
CREATE POLICY "Users can insert executions for their tenant"
  ON n8n_executions FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- Users can update their tenant executions
CREATE POLICY "Users can update their tenant executions"
  ON n8n_executions FOR UPDATE
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::UUID);

-- ================================================
-- STEP 6: Create updated_at trigger function
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to n8n_workflows
CREATE TRIGGER update_n8n_workflows_updated_at
  BEFORE UPDATE ON n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STEP 7: Comments
-- ================================================
COMMENT ON TABLE n8n_workflows IS 'N8N workflow configurations and metadata';
COMMENT ON TABLE n8n_executions IS 'N8N workflow execution history and results';

COMMENT ON COLUMN n8n_workflows.n8n_workflow_id IS 'N8N Cloud workflow ID for API calls';
COMMENT ON COLUMN n8n_workflows.webhook_url IS 'N8N webhook URL for triggering workflows';
COMMENT ON COLUMN n8n_workflows.trigger_config IS 'JSON configuration for workflow triggers (cron, webhook, etc.)';

COMMENT ON COLUMN n8n_executions.n8n_execution_id IS 'N8N Cloud execution ID for tracking';
COMMENT ON COLUMN n8n_executions.duration_ms IS 'Execution duration in milliseconds';
COMMENT ON COLUMN n8n_executions.output_data IS 'Workflow output data and results';

-- ================================================
-- STEP 8: Grant permissions
-- ================================================
GRANT ALL ON n8n_workflows TO authenticated;
GRANT ALL ON n8n_executions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
