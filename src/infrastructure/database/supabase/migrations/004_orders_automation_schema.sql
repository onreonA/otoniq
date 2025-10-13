-- ============================================================================
-- OTONIQ.AI - Orders & Automation Schema
-- Migration 004: Orders, N8N workflows, automation logs
-- ============================================================================

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  marketplace_connection_id UUID REFERENCES marketplace_connections(id),
  
  -- Order identifiers
  order_number TEXT NOT NULL, -- Internal order number
  external_order_id TEXT, -- Marketplace order ID
  
  -- Customer info
  customer_info JSONB NOT NULL, -- {name, email, phone, address}
  
  -- Order items
  items JSONB NOT NULL, -- [{product_id, sku, title, quantity, price, total}]
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'confirmed', 'shipped', 'delivered', 
    'cancelled', 'refunded', 'failed'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  
  -- Shipping
  shipping_method TEXT,
  shipping_tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  
  -- External system IDs
  odoo_sale_order_id TEXT, -- Odoo'daki sale.order ID
  odoo_invoice_id TEXT,
  
  -- Automation
  n8n_workflow_triggered BOOLEAN DEFAULT false,
  n8n_workflow_status TEXT,
  
  -- Notes
  customer_note TEXT,
  internal_note TEXT,
  
  -- Timestamps
  order_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: order_number per tenant
  UNIQUE(tenant_id, order_number)
);

-- Indexes
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_orders_marketplace_id ON orders(marketplace_connection_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_external_id ON orders(external_order_id) WHERE external_order_id IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_customer ON orders USING gin(customer_info);

-- Comments
COMMENT ON TABLE orders IS 'Siparişler (marketplace ve direkt)';
COMMENT ON COLUMN orders.items IS '[{product_id, sku, title, quantity, price, total}]';
COMMENT ON COLUMN orders.customer_info IS '{name, email, phone, address: {street, city, country, postal_code}}';

-- ============================================================================
-- ORDER STATUS HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Status change
  old_status TEXT,
  new_status TEXT NOT NULL,
  
  -- Note
  note TEXT,
  
  -- Metadata
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at DESC);

-- ============================================================================
-- N8N WORKFLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global workflow
  
  -- Workflow info
  workflow_name TEXT NOT NULL,
  workflow_description TEXT,
  n8n_workflow_id TEXT NOT NULL, -- N8N'deki workflow ID
  webhook_url TEXT NOT NULL,
  
  -- Trigger config
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'order_created', 'order_status_changed', 'product_created', 
    'product_updated', 'low_stock', 'price_changed', 'manual', 'scheduled'
  )),
  trigger_condition JSONB, -- {status: 'confirmed', amount_gt: 100}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  total_executions INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_n8n_workflows_tenant_id ON n8n_workflows(tenant_id);
CREATE INDEX idx_n8n_workflows_trigger_event ON n8n_workflows(trigger_event);
CREATE INDEX idx_n8n_workflows_is_active ON n8n_workflows(is_active);

-- Comments
COMMENT ON TABLE n8n_workflows IS 'N8N automation workflows';
COMMENT ON COLUMN n8n_workflows.tenant_id IS 'NULL = global workflow for all tenants';

-- ============================================================================
-- AUTOMATION LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  
  -- Event info
  trigger_event TEXT NOT NULL,
  event_data JSONB, -- Original event data
  
  -- Execution
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running', 'cancelled')),
  
  -- Request/Response
  payload JSONB, -- Sent to N8N
  response JSONB, -- Received from N8N
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timing
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_logs_tenant_id ON automation_logs(tenant_id);
CREATE INDEX idx_automation_logs_workflow_id ON automation_logs(workflow_id);
CREATE INDEX idx_automation_logs_status ON automation_logs(status);
CREATE INDEX idx_automation_logs_trigger_event ON automation_logs(trigger_event);
CREATE INDEX idx_automation_logs_created_at ON automation_logs(created_at DESC);

-- Comments
COMMENT ON TABLE automation_logs IS 'Otomasyon execution logları';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_workflows_updated_at
  BEFORE UPDATE ON n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Order status history trigger
CREATE OR REPLACE FUNCTION track_order_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO order_status_history (order_id, tenant_id, old_status, new_status, changed_by)
    VALUES (NEW.id, NEW.tenant_id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_tracker
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_order_status_changes();

-- Trigger N8N workflow on order creation
CREATE OR REPLACE FUNCTION trigger_order_workflows()
RETURNS TRIGGER AS $$
DECLARE
  workflow RECORD;
BEGIN
  -- Find active workflows for this trigger
  FOR workflow IN 
    SELECT * FROM n8n_workflows 
    WHERE (tenant_id = NEW.tenant_id OR tenant_id IS NULL)
      AND is_active = true
      AND trigger_event = 'order_created'
  LOOP
    -- Log the trigger (actual webhook call will be done by application)
    INSERT INTO automation_logs (tenant_id, workflow_id, trigger_event, event_data, status)
    VALUES (
      NEW.tenant_id,
      workflow.id,
      'order_created',
      row_to_json(NEW),
      'running'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_created_workflow_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_workflows();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Tenant isolation for orders"
  ON orders FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY "Tenant isolation for order_status_history"
  ON order_status_history FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY "Users can view their tenant workflows"
  ON n8n_workflows FOR SELECT
  USING (tenant_id = get_current_tenant_id() OR tenant_id IS NULL OR is_super_admin());

CREATE POLICY "Tenant admins can manage workflows"
  ON n8n_workflows FOR ALL
  USING (
    tenant_id = get_current_tenant_id() 
    OR is_super_admin()
  );

CREATE POLICY "Tenant isolation for automation_logs"
  ON automation_logs FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_super_admin());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  today_count INTEGER;
  order_num TEXT;
BEGIN
  -- Count today's orders for this tenant
  SELECT COUNT(*) INTO today_count
  FROM orders
  WHERE tenant_id = p_tenant_id
    AND DATE(order_date) = CURRENT_DATE;
  
  -- Format: ORD-YYYYMMDD-0001
  order_num := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((today_count + 1)::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Get order statistics for a tenant
CREATE OR REPLACE FUNCTION get_order_stats(p_tenant_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  avg_order_value DECIMAL,
  pending_orders BIGINT,
  completed_orders BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(*) FILTER (WHERE status IN ('pending', 'processing'))::BIGINT as pending_orders,
    COUNT(*) FILTER (WHERE status IN ('delivered', 'completed'))::BIGINT as completed_orders
  FROM orders
  WHERE tenant_id = p_tenant_id
    AND order_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETED: Migration 004
-- ============================================================================

