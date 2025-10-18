-- ================================================
-- Update N8N Workflow Webhook URLs to Production URLs
-- ================================================

-- Update Low Stock Alert workflow webhook URL
UPDATE n8n_workflows 
SET webhook_url = 'https://otoniq.app.n8n.cloud/webhook/rqn2AxkOapqUKpCm'
WHERE n8n_workflow_id = 'low-stock-alert-n8n';

-- Update Daily Sales Report workflow webhook URL
UPDATE n8n_workflows 
SET webhook_url = 'https://otoniq.app.n8n.cloud/webhook/atI6tzx75ieHfjrX'
WHERE n8n_workflow_id = 'daily-sales-report-n8n';

-- Verify the updates
SELECT 
  workflow_name,
  webhook_url,
  is_active
FROM n8n_workflows 
WHERE n8n_workflow_id IN ('low-stock-alert-n8n', 'daily-sales-report-n8n');

