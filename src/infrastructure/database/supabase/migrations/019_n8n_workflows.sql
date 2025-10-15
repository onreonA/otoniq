-- Migration: 019_n8n_workflows.sql
-- Description: N8N workflow management and execution tracking

-- Create n8n_credentials table
CREATE TABLE IF NOT EXISTS n8n_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    credential_name TEXT NOT NULL,
    credential_type TEXT NOT NULL, -- 'httpBasicAuth', 'httpHeaderAuth', 'oAuth2Api', etc.
    credential_data JSONB NOT NULL, -- Encrypted credential data
    n8n_credential_id TEXT, -- ID in N8N system
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, credential_name)
);

-- Create n8n_workflows table
CREATE TABLE IF NOT EXISTS n8n_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    workflow_description TEXT,
    n8n_workflow_id TEXT, -- ID in N8N system
    workflow_json JSONB, -- Complete N8N workflow definition
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'webhook', 'cron', 'event')),
    trigger_config JSONB, -- Cron expression or webhook URL
    webhook_url TEXT, -- If trigger_type is webhook
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_execution_at TIMESTAMPTZ,
    last_execution_status TEXT CHECK (last_execution_status IN ('success', 'failed', 'running', 'waiting')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(tenant_id, workflow_name)
);

-- Create n8n_executions table
CREATE TABLE IF NOT EXISTS n8n_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    n8n_execution_id TEXT NOT NULL, -- ID in N8N system
    trigger_type TEXT NOT NULL,
    trigger_data JSONB, -- Input data that triggered the execution
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'waiting', 'canceled')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER, -- Execution duration in milliseconds
    error_message TEXT,
    execution_data JSONB, -- Complete execution result from N8N
    steps_completed INTEGER DEFAULT 0,
    steps_total INTEGER DEFAULT 0,
    output_data JSONB, -- Final output data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create n8n_workflow_outputs table
CREATE TABLE IF NOT EXISTS n8n_workflow_outputs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES n8n_executions(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    output_type TEXT NOT NULL, -- 'file', 'email', 'message', 'data', 'image'
    output_format TEXT, -- 'pdf', 'csv', 'xlsx', 'png', 'jpg', 'json'
    file_url TEXT, -- Supabase Storage URL
    file_size INTEGER, -- File size in bytes
    output_data JSONB, -- Structured output data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- Auto-delete after retention period
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_n8n_credentials_tenant ON n8n_credentials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_credentials_active ON n8n_credentials(is_active);

CREATE INDEX IF NOT EXISTS idx_n8n_workflows_tenant ON n8n_workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_active ON n8n_workflows(is_active);

CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow ON n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_tenant ON n8n_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_created ON n8n_executions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_n8n_outputs_execution ON n8n_workflow_outputs(execution_id);
CREATE INDEX IF NOT EXISTS idx_n8n_outputs_workflow ON n8n_workflow_outputs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_outputs_tenant ON n8n_workflow_outputs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_n8n_outputs_created ON n8n_workflow_outputs(created_at DESC);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_json ON n8n_workflows USING GIN (workflow_json);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_data ON n8n_executions USING GIN (execution_data);

-- Enable RLS
ALTER TABLE n8n_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflow_outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for n8n_credentials
CREATE POLICY "Tenant users can view own credentials" ON n8n_credentials
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Tenant admins can manage credentials" ON n8n_credentials
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('tenant_admin', 'super_admin')
        )
    );

-- RLS Policies for n8n_workflows
CREATE POLICY "Tenant users can view own workflows" ON n8n_workflows
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Tenant admins can manage workflows" ON n8n_workflows
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('tenant_admin', 'super_admin')
        )
    );

-- RLS Policies for n8n_executions
CREATE POLICY "Tenant users can view own executions" ON n8n_executions
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- RLS Policies for n8n_workflow_outputs
CREATE POLICY "Tenant users can view own outputs" ON n8n_workflow_outputs
    FOR SELECT USING (
        tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Function to get workflow statistics
CREATE OR REPLACE FUNCTION get_workflow_stats(
    p_workflow_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_executions BIGINT,
    successful_executions BIGINT,
    failed_executions BIGINT,
    average_duration_ms NUMERIC,
    success_rate NUMERIC,
    total_outputs BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH execution_stats AS (
        SELECT * FROM n8n_executions
        WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
        AND (p_workflow_id IS NULL OR workflow_id = p_workflow_id)
        AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
    )
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'success') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(duration_ms) as avg_duration,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'success')::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
            ELSE 0
        END as success_rate,
        (SELECT COUNT(*) FROM n8n_workflow_outputs 
         WHERE (p_workflow_id IS NULL OR workflow_id = p_workflow_id)
         AND (p_tenant_id IS NULL OR tenant_id = p_tenant_id)
         AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ) as total_outputs
    FROM execution_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get execution history
CREATE OR REPLACE FUNCTION get_execution_history(
    p_workflow_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    n8n_execution_id TEXT,
    status TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER,
    error_message TEXT,
    steps_completed INTEGER,
    steps_total INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.n8n_execution_id,
        e.status,
        e.started_at,
        e.finished_at,
        e.duration_ms,
        e.error_message,
        e.steps_completed,
        e.steps_total
    FROM n8n_executions e
    WHERE e.workflow_id = p_workflow_id
    ORDER BY e.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old executions and outputs
CREATE OR REPLACE FUNCTION cleanup_old_workflow_data()
RETURNS TABLE (
    deleted_executions INTEGER,
    deleted_outputs INTEGER
) AS $$
DECLARE
    exec_count INTEGER;
    output_count INTEGER;
BEGIN
    -- Delete executions older than 90 days
    DELETE FROM n8n_executions 
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS exec_count = ROW_COUNT;
    
    -- Delete expired outputs
    DELETE FROM n8n_workflow_outputs
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    GET DIAGNOSTICS output_count = ROW_COUNT;
    
    RETURN QUERY SELECT exec_count, output_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at
CREATE TRIGGER update_n8n_credentials_updated_at
    BEFORE UPDATE ON n8n_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_workflows_updated_at
    BEFORE UPDATE ON n8n_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE n8n_credentials IS 'N8N credentials for multi-tenant workflow automation';
COMMENT ON TABLE n8n_workflows IS 'N8N workflows with tenant isolation';
COMMENT ON TABLE n8n_executions IS 'N8N workflow execution history and status tracking';
COMMENT ON TABLE n8n_workflow_outputs IS 'Generated outputs from workflow executions (reports, files, etc.)';
COMMENT ON COLUMN n8n_workflows.workflow_json IS 'Complete N8N workflow definition in JSON format';
COMMENT ON COLUMN n8n_executions.execution_data IS 'Complete execution result from N8N API';
