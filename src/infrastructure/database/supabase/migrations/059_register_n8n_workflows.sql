-- ================================================
-- Register N8N Workflows for All Tenants
-- ================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT tenant_id FROM profiles WHERE tenant_id IS NOT NULL LOOP
    -- Daily Sales Report Workflow
    INSERT INTO n8n_workflows (
      tenant_id,
      workflow_name,
      workflow_description,
      n8n_workflow_id,
      webhook_url,
      trigger_type,
      trigger_config,
      is_active,
      metadata
    ) VALUES (
      r.tenant_id,
      '📊 Günlük Satış Raporu',
      'Her sabah saat 09:00''da günlük satış performans raporu oluşturur ve gönderir',
      'daily-sales-report-n8n',
      'https://otoniq.app.n8n.cloud/webhook/atI6tzx75ieHfjrX',
      'webhook',
      '{"schedule": "0 9 * * *"}'::jsonb,
      true,
      '{"category": "reports", "icon": "ri-file-chart-line", "color": "from-blue-500 to-purple-500"}'::jsonb
    )
    ON CONFLICT (tenant_id, n8n_workflow_id) DO UPDATE SET
      workflow_name = EXCLUDED.workflow_name,
      workflow_description = EXCLUDED.workflow_description,
      webhook_url = EXCLUDED.webhook_url,
      trigger_config = EXCLUDED.trigger_config,
      is_active = EXCLUDED.is_active,
      metadata = EXCLUDED.metadata;

    -- Low Stock Alert Workflow
    INSERT INTO n8n_workflows (
      tenant_id,
      workflow_name,
      workflow_description,
      n8n_workflow_id,
      webhook_url,
      trigger_type,
      trigger_config,
      is_active,
      metadata
    ) VALUES (
      r.tenant_id,
      '⚠️ Düşük Stok Uyarısı',
      'Stok seviyesi belirlenen eşiğin altına düştüğünde otomatik uyarı gönderir',
      'low-stock-alert-n8n',
      'https://otoniq.app.n8n.cloud/webhook/rqn2AxkOapqUKpCm',
      'webhook',
      '{"schedule": "0 */6 * * *", "threshold": 10}'::jsonb,
      true,
      '{"category": "inventory", "icon": "ri-alarm-warning-line", "color": "from-orange-500 to-red-500"}'::jsonb
    )
    ON CONFLICT (tenant_id, n8n_workflow_id) DO UPDATE SET
      workflow_name = EXCLUDED.workflow_name,
      workflow_description = EXCLUDED.workflow_description,
      webhook_url = EXCLUDED.webhook_url,
      trigger_config = EXCLUDED.trigger_config,
      is_active = EXCLUDED.is_active,
      metadata = EXCLUDED.metadata;

  END LOOP;
END $$;

