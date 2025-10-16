-- ============================================================================
-- OTONIQ.AI - Notifications Schema
-- Migration 018: Notifications, notification preferences, notification types
-- ============================================================================

-- ============================================================================
-- NOTIFICATION TYPES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default notification types
INSERT INTO notification_types (type_name, display_name, description, icon, color) VALUES
('order_created', 'Yeni Sipariş', 'Yeni sipariş oluşturulduğunda bildirim', 'shopping-cart', '#10B981'),
('order_status_changed', 'Sipariş Durumu Değişti', 'Sipariş durumu güncellendiğinde bildirim', 'package', '#F59E0B'),
('low_stock', 'Düşük Stok', 'Ürün stoku düşük seviyeye geldiğinde bildirim', 'alert-triangle', '#EF4444'),
('product_created', 'Yeni Ürün', 'Yeni ürün eklendiğinde bildirim', 'plus-circle', '#8B5CF6'),
('product_updated', 'Ürün Güncellendi', 'Ürün bilgileri güncellendiğinde bildirim', 'edit', '#06B6D4'),
('sync_completed', 'Senkronizasyon Tamamlandı', 'Pazaryeri senkronizasyonu tamamlandığında bildirim', 'refresh-cw', '#84CC16'),
('sync_failed', 'Senkronizasyon Hatası', 'Pazaryeri senkronizasyonu başarısız olduğunda bildirim', 'x-circle', '#F97316'),
('workflow_completed', 'Otomasyon Tamamlandı', 'N8N workflow tamamlandığında bildirim', 'zap', '#EC4899'),
('workflow_failed', 'Otomasyon Hatası', 'N8N workflow başarısız olduğunda bildirim', 'alert-circle', '#DC2626'),
('payment_received', 'Ödeme Alındı', 'Yeni ödeme alındığında bildirim', 'credit-card', '#059669'),
('invoice_generated', 'Fatura Oluşturuldu', 'Yeni fatura oluşturulduğunda bildirim', 'file-text', '#7C3AED'),
('system_alert', 'Sistem Uyarısı', 'Sistem uyarıları ve önemli bildirimler', 'bell', '#6B7280')
ON CONFLICT (type_name) DO NOTHING;

-- ============================================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Notification type preferences
  notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  
  -- Timing preferences
  immediate BOOLEAN DEFAULT true,
  daily_digest BOOLEAN DEFAULT false,
  weekly_digest BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  -- Priority settings
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, tenant_id, notification_type_id)
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type_id UUID NOT NULL REFERENCES notification_types(id),
  
  -- Priority and status
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
  
  -- Channels
  channels JSONB DEFAULT '[]'::jsonb, -- ['email', 'sms', 'push', 'in_app', 'whatsapp']
  channel_status JSONB DEFAULT '{}'::jsonb, -- {email: 'sent', sms: 'failed', push: 'pending'}
  
  -- Related entities
  related_entity_type TEXT, -- 'order', 'product', 'workflow', 'sync'
  related_entity_id UUID,
  
  -- Action data
  action_url TEXT,
  action_text TEXT,
  action_data JSONB DEFAULT '{}'::jsonb,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global template
  notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  
  -- Template content
  template_name TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  
  -- Channel-specific templates
  email_template TEXT,
  sms_template TEXT,
  push_template TEXT,
  whatsapp_template TEXT,
  
  -- Template variables
  variables JSONB DEFAULT '[]'::jsonb, -- Available variables for this template
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(tenant_id, notification_type_id, template_name)
);

-- Insert default templates
INSERT INTO notification_templates (tenant_id, notification_type_id, template_name, subject_template, message_template, email_template, sms_template, push_template, whatsapp_template, variables, is_default) VALUES
(NULL, (SELECT id FROM notification_types WHERE type_name = 'order_created'), 'default', 'Yeni Sipariş: {{order_number}}', '{{customer_name}} tarafından {{order_number}} numaralı sipariş oluşturuldu. Toplam: {{total_amount}} {{currency}}', 'Yeni sipariş: {{order_number}}<br>Müşteri: {{customer_name}}<br>Tutar: {{total_amount}} {{currency}}', 'Yeni sipariş: {{order_number}} - {{total_amount}} {{currency}}', 'Yeni sipariş: {{order_number}}', '🛒 Yeni Sipariş!\n\nSipariş No: {{order_number}}\nMüşteri: {{customer_name}}\nTutar: {{total_amount}} {{currency}}', '["order_number", "customer_name", "total_amount", "currency"]', true),
(NULL, (SELECT id FROM notification_types WHERE type_name = 'low_stock'), 'default', 'Düşük Stok Uyarısı: {{product_name}}', '{{product_name}} ürününün stoku {{current_stock}} adede düştü. Minimum stok: {{min_stock}}', 'Düşük stok uyarısı: {{product_name}}<br>Mevcut stok: {{current_stock}}<br>Minimum stok: {{min_stock}}', 'Düşük stok: {{product_name}} ({{current_stock}} adet)', 'Düşük stok: {{product_name}}', '⚠️ Düşük Stok Uyarısı!\n\nÜrün: {{product_name}}\nMevcut Stok: {{current_stock}}\nMinimum Stok: {{min_stock}}', '["product_name", "current_stock", "min_stock"]', true),
(NULL, (SELECT id FROM notification_types WHERE type_name = 'sync_completed'), 'default', 'Senkronizasyon Tamamlandı: {{marketplace_name}}', '{{marketplace_name}} ile senkronizasyon başarıyla tamamlandı. {{synced_count}} ürün güncellendi.', 'Senkronizasyon tamamlandı: {{marketplace_name}}<br>Güncellenen ürün sayısı: {{synced_count}}', 'Senkronizasyon tamamlandı: {{marketplace_name}}', 'Senkronizasyon tamamlandı: {{marketplace_name}}', '✅ Senkronizasyon Tamamlandı!\n\nPazaryeri: {{marketplace_name}}\nGüncellenen Ürün: {{synced_count}}', '["marketplace_name", "synced_count"]', true)
ON CONFLICT (tenant_id, notification_type_id, template_name) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);

CREATE INDEX idx_notification_preferences_user_tenant ON notification_preferences(user_id, tenant_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type_id);

CREATE INDEX idx_notification_templates_tenant_type ON notification_templates(tenant_id, notification_type_id);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Notifications RLS
CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- Notification preferences RLS
CREATE POLICY notification_preferences_tenant_isolation ON notification_preferences
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- Notification templates RLS
CREATE POLICY notification_templates_tenant_isolation ON notification_templates
  FOR ALL
  USING (
    tenant_id IS NULL -- Global templates
    OR
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(p_user_id UUID, p_tenant_id UUID)
RETURNS TABLE (
  notification_type_id UUID,
  type_name TEXT,
  display_name TEXT,
  email_enabled BOOLEAN,
  sms_enabled BOOLEAN,
  push_enabled BOOLEAN,
  in_app_enabled BOOLEAN,
  whatsapp_enabled BOOLEAN,
  priority_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nt.id,
    nt.type_name,
    nt.display_name,
    COALESCE(np.email_enabled, true),
    COALESCE(np.sms_enabled, false),
    COALESCE(np.push_enabled, true),
    COALESCE(np.in_app_enabled, true),
    COALESCE(np.whatsapp_enabled, false),
    COALESCE(np.priority_level, 'medium')
  FROM notification_types nt
  LEFT JOIN notification_preferences np ON (
    np.notification_type_id = nt.id 
    AND np.user_id = p_user_id 
    AND np.tenant_id = p_tenant_id
  )
  WHERE nt.is_active = true
  ORDER BY nt.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID, p_tenant_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
      AND tenant_id = p_tenant_id
      AND status = 'unread'
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id UUID, p_tenant_id UUID, p_notification_ids UUID[] DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    -- Mark all unread notifications as read
    UPDATE notifications
    SET status = 'read', read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id
      AND tenant_id = p_tenant_id
      AND status = 'unread';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications
    SET status = 'read', read_at = NOW(), updated_at = NOW()
    WHERE user_id = p_user_id
      AND tenant_id = p_tenant_id
      AND id = ANY(p_notification_ids)
      AND status = 'unread';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  END IF;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete notifications older than 90 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('read', 'archived', 'deleted');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE notifications IS 'User notifications with multi-channel support';
COMMENT ON TABLE notification_preferences IS 'User notification preferences per type and channel';
COMMENT ON TABLE notification_templates IS 'Notification templates for different types and channels';
COMMENT ON TABLE notification_types IS 'Available notification types in the system';

COMMENT ON COLUMN notifications.channels IS 'Array of channels to send notification through';
COMMENT ON COLUMN notifications.channel_status IS 'Status of each channel delivery';
COMMENT ON COLUMN notifications.related_entity_type IS 'Type of related entity (order, product, workflow, etc.)';
COMMENT ON COLUMN notifications.related_entity_id IS 'ID of related entity';
COMMENT ON COLUMN notifications.action_url IS 'URL to navigate when notification is clicked';
COMMENT ON COLUMN notifications.action_text IS 'Text for action button';
COMMENT ON COLUMN notifications.action_data IS 'Additional data for action handling';
