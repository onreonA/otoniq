-- ================================================
-- Add Unique Constraint for N8N Workflow ID
-- ================================================

-- Add unique constraint to prevent duplicate n8n_workflow_id per tenant
ALTER TABLE n8n_workflows 
  DROP CONSTRAINT IF EXISTS unique_tenant_n8n_workflow;

ALTER TABLE n8n_workflows 
  ADD CONSTRAINT unique_tenant_n8n_workflow 
  UNIQUE (tenant_id, n8n_workflow_id);

-- Verify
SELECT 
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'n8n_workflows'::regclass
  AND conname = 'unique_tenant_n8n_workflow';

