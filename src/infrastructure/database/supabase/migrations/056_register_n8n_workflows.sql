-- ================================================
-- Register N8N Workflows to Database
-- ================================================
-- Insert your existing N8N workflows

-- Get admin tenant_id (assuming admin@otoniq.ai or bilgi@omerfarukunsal.com)
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Try to get tenant_id from admin user
  SELECT tenant_id INTO v_tenant_id
  FROM profiles 
  WHERE email IN ('admin@otoniq.ai', 'bilgi@omerfarukunsal.com')
  LIMIT 1;

  -- If no tenant found, raise error
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found. Please create a user first.';
  END IF;

  -- Insert Daily Sales Report workflow
  INSERT INTO n8n_workflows (
    tenant_id,
    workflow_name,
    workflow_description,
    n8n_workflow_id,
    trigger_type,
    trigger_config,
    webhook_url,
    is_active,
    metadata
  ) VALUES (
    v_tenant_id,
    '📊 Günlük Satış Raporu',
    'Her sabah saat 09:00''da otomatik günlük satış performans raporu oluşturur ve e-posta ile gönderir',
    'atI6tzx75ieHfjrX',
    'cron',
    jsonb_build_object(
      'schedule', '0 9 * * *',
      'timezone', 'Europe/Istanbul'
    ),
    'https://otoniq.app.n8n.cloud/webhook/atI6tzx75ieHfjrX',
    true,
    jsonb_build_object(
      'category', 'reports',
      'icon', 'ri-file-chart-line',
      'color', 'from-blue-500 to-purple-500'
    )
  )
  ON CONFLICT (tenant_id, n8n_workflow_id) DO UPDATE
  SET 
    workflow_name = EXCLUDED.workflow_name,
    webhook_url = EXCLUDED.webhook_url,
    updated_at = NOW();

  -- Insert Low Stock Alert workflow
  INSERT INTO n8n_workflows (
    tenant_id,
    workflow_name,
    workflow_description,
    n8n_workflow_id,
    trigger_type,
    trigger_config,
    webhook_url,
    is_active,
    metadata
  ) VALUES (
    v_tenant_id,
    '⚠️ Düşük Stok Uyarısı',
    'Stok seviyesi belirlenen eşiğin altına düştüğünde otomatik uyarı gönderir',
    'rqn2AxkOapqUKpCm',
    'cron',
    jsonb_build_object(
      'schedule', '0 */6 * * *',
      'threshold', 10,
      'checkInterval', 6
    ),
    'https://otoniq.app.n8n.cloud/webhook/rqn2AxkOapqUKpCm',
    true,
    jsonb_build_object(
      'category', 'inventory',
      'icon', 'ri-alarm-warning-line',
      'color', 'from-orange-500 to-red-500'
    )
  )
  ON CONFLICT (tenant_id, n8n_workflow_id) DO UPDATE
  SET 
    workflow_name = EXCLUDED.workflow_name,
    webhook_url = EXCLUDED.webhook_url,
    updated_at = NOW();

  RAISE NOTICE '✅ N8N workflows registered successfully for tenant: %', v_tenant_id;
END $$;

-- Verify registration
SELECT 
  workflow_name,
  n8n_workflow_id,
  trigger_type,
  webhook_url,
  is_active,
  created_at
FROM n8n_workflows
ORDER BY created_at DESC;

