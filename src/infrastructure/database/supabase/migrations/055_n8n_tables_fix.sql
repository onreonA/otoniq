-- ================================================
-- N8N Tables - Quick Fix for Existing Installation
-- ================================================
-- Only create what doesn't exist

-- Drop and recreate trigger to avoid conflicts
DROP TRIGGER IF EXISTS update_n8n_workflows_updated_at ON n8n_workflows;

-- Apply trigger to n8n_workflows
CREATE TRIGGER update_n8n_workflows_updated_at
  BEFORE UPDATE ON n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify tables exist and show counts
DO $$
BEGIN
  RAISE NOTICE 'n8n_workflows table rows: %', (SELECT COUNT(*) FROM n8n_workflows);
  RAISE NOTICE 'n8n_executions table rows: %', (SELECT COUNT(*) FROM n8n_executions);
  RAISE NOTICE '✅ N8N tables are ready!';
END $$;

