-- =============================================
-- Migration 009: Extended Orders Schema
-- Description: Complete order management with items, shipments, payments, and returns
-- Dependencies: 002_products_schema.sql, 008_customers_crm_schema.sql, 007_inventory_schema.sql
-- =============================================

-- =============================================
-- EXTEND ORDERS TABLE (Add missing columns to existing table)
-- =============================================

-- Note: orders table already exists from migration 004
-- We only add new columns that don't exist

DO $$
BEGIN
  -- Add customer_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_id') THEN
    ALTER TABLE orders ADD COLUMN customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
    CREATE INDEX idx_orders_customer_id ON orders(customer_id);
  END IF;
  
  -- Add fulfillment_status if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'fulfillment_status') THEN
    ALTER TABLE orders ADD COLUMN fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled' 
      CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled'));
  END IF;
  
  -- Add channel if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'channel') THEN
    ALTER TABLE orders ADD COLUMN channel VARCHAR(50) DEFAULT 'direct' 
      CHECK (channel IN ('direct', 'shopify', 'marketplace', 'phone', 'email', 'social', 'pos'));
    CREATE INDEX idx_orders_channel ON orders(channel);
  END IF;
  
  -- Add addresses if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address_id') THEN
    ALTER TABLE orders ADD COLUMN billing_address_id UUID REFERENCES customer_addresses(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_address_id') THEN
    ALTER TABLE orders ADD COLUMN shipping_address_id UUID REFERENCES customer_addresses(id) ON DELETE SET NULL;
  END IF;
  
  -- Add discount fields if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_code') THEN
    ALTER TABLE orders ADD COLUMN discount_code VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_type') THEN
    ALTER TABLE orders ADD COLUMN discount_type VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_value') THEN
    ALTER TABLE orders ADD COLUMN discount_value DECIMAL(12, 2);
  END IF;
  
  -- Add additional date fields if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'confirmed_at') THEN
    ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
    ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
    ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add tags if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tags') THEN
    ALTER TABLE orders ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add risk_level if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'risk_level') THEN
    ALTER TABLE orders ADD COLUMN risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high'));
  END IF;
  
  -- Add is_test if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'is_test') THEN
    ALTER TABLE orders ADD COLUMN is_test BOOLEAN DEFAULT false;
  END IF;
  
  -- Add created_by and updated_by if not exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_by') THEN
    ALTER TABLE orders ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'updated_by') THEN
    ALTER TABLE orders ADD COLUMN updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
END $$;

-- Update comment
COMMENT ON TABLE orders IS 'Order master records with full lifecycle management';

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Product reference
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Product details (snapshot at order time)
  sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  variant_title VARCHAR(255),
  
  -- Quantity and pricing
  quantity DECIMAL(12, 3) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  
  -- Tax
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_included BOOLEAN DEFAULT true,
  
  -- Fulfillment
  fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled',
  fulfilled_quantity DECIMAL(12, 3) DEFAULT 0,
  refunded_quantity DECIMAL(12, 3) DEFAULT 0,
  
  -- Product snapshot
  product_snapshot JSONB, -- Full product data at order time
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_order_items_tenant_id ON order_items(tenant_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Comments
COMMENT ON TABLE order_items IS 'Line items for orders';

-- =============================================
-- SHIPMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS shipments (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Shipment details
  shipment_number VARCHAR(50) NOT NULL,
  tracking_number VARCHAR(255),
  carrier VARCHAR(100),
  service_level VARCHAR(100), -- 'standard', 'express', 'overnight'
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'picked',
    'packed',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned'
  )),
  
  -- Warehouse
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  -- Dimensions and weight
  weight DECIMAL(10, 3),
  length DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  
  -- Cost
  shipping_cost DECIMAL(12, 2),
  
  -- Important dates
  estimated_delivery_date DATE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_shipments_tenant_id ON shipments(tenant_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX idx_shipments_status ON shipments(status);

-- Comments
COMMENT ON TABLE shipments IS 'Shipment tracking for orders';

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_number VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
    'credit_card',
    'debit_card',
    'bank_transfer',
    'cash',
    'paypal',
    'stripe',
    'iyzico',
    'other'
  )),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'authorized',
    'captured',
    'paid',
    'failed',
    'refunded',
    'cancelled'
  )),
  
  -- Amount
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  
  -- Transaction details
  transaction_id VARCHAR(255),
  authorization_code VARCHAR(255),
  
  -- Card details (last 4 digits only for security)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  
  -- Gateway
  gateway VARCHAR(50), -- 'stripe', 'iyzico', 'paytr', etc.
  gateway_response JSONB,
  
  -- Important dates
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Comments
COMMENT ON TABLE payments IS 'Payment transactions for orders';

-- =============================================
-- RETURNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS returns (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Return details
  return_number VARCHAR(50) NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN (
    'requested',
    'approved',
    'rejected',
    'received',
    'inspected',
    'refunded',
    'cancelled'
  )),
  
  -- Return reason
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'defective',
    'damaged',
    'wrong_item',
    'not_as_described',
    'changed_mind',
    'size_fit',
    'other'
  )),
  reason_details TEXT,
  
  -- Refund details
  refund_amount DECIMAL(12, 2),
  refund_method VARCHAR(50), -- Same as payment_method
  refund_status VARCHAR(20) DEFAULT 'pending',
  
  -- Restocking
  restock_items BOOLEAN DEFAULT true,
  restocking_fee DECIMAL(12, 2) DEFAULT 0,
  
  -- Important dates
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  customer_note TEXT,
  internal_note TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_returns_tenant_id ON returns(tenant_id);
CREATE INDEX idx_returns_order_id ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(status);

-- Comments
COMMENT ON TABLE returns IS 'Return and refund requests';

-- =============================================
-- TRIGGERS
-- =============================================

-- Update orders updated_at
CREATE TRIGGER trigger_update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update shipments updated_at
CREATE TRIGGER trigger_update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update payments updated_at
CREATE TRIGGER trigger_update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update returns updated_at
CREATE TRIGGER trigger_update_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Users can view their tenant's orders"
  ON orders FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Order Items Policies (inherit from orders)
CREATE POLICY "Users can view their tenant's order items"
  ON order_items FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Shipments Policies
CREATE POLICY "Users can view their tenant's shipments"
  ON shipments FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage shipments"
  ON shipments FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Payments Policies
CREATE POLICY "Users can view their tenant's payments"
  ON payments FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Returns Policies
CREATE POLICY "Users can view their tenant's returns"
  ON returns FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage returns"
  ON returns FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Order summary with customer info
CREATE OR REPLACE VIEW orders_summary_view AS
SELECT 
  o.id,
  o.tenant_id,
  o.order_number,
  o.status,
  o.payment_status,
  COALESCE(o.channel, 'direct') AS channel,
  o.total_amount AS total,
  o.currency,
  o.order_date,
  c.id AS customer_id,
  CASE 
    WHEN c.customer_type = 'business' THEN c.company_name
    ELSE CONCAT(COALESCE(c.first_name, ''), ' ', COALESCE(c.last_name, ''))
  END AS customer_name,
  c.email AS customer_email,
  (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;

-- View: Order fulfillment status
CREATE OR REPLACE VIEW order_fulfillment_view AS
SELECT 
  o.id AS order_id,
  o.tenant_id,
  o.order_number,
  o.status AS order_status,
  COUNT(DISTINCT s.id) AS shipment_count,
  SUM(CASE WHEN s.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_shipments,
  MAX(s.delivered_at) AS last_delivery_date
FROM orders o
LEFT JOIN shipments s ON o.id = s.order_id
GROUP BY o.id, o.tenant_id, o.order_number, o.status;

-- Add table comments
COMMENT ON TABLE orders IS 'Order master records with full lifecycle';
COMMENT ON TABLE order_items IS 'Line items within orders';
COMMENT ON TABLE shipments IS 'Shipment tracking for orders';
COMMENT ON TABLE payments IS 'Payment transactions for orders';
COMMENT ON TABLE returns IS 'Return and refund requests';

