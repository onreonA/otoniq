-- ============================================================================
-- OTONIQ.AI - Marketplace Enhancements
-- Migration 064: Additional marketplace tables and enhancements
-- ============================================================================

-- ============================================================================
-- MARKETPLACE ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  marketplace_connection_id UUID NOT NULL REFERENCES marketplace_connections(id) ON DELETE CASCADE,
  
  -- External order identifiers
  external_order_id TEXT NOT NULL, -- Marketplace order ID
  external_order_number TEXT, -- Marketplace order number
  
  -- Order details
  order_status TEXT NOT NULL CHECK (order_status IN (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 
    'cancelled', 'returned', 'refunded'
  )),
  payment_status TEXT NOT NULL CHECK (payment_status IN (
    'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  )),
  
  -- Customer info
  customer_info JSONB NOT NULL, -- {name, email, phone, address}
  
  -- Order items
  items JSONB NOT NULL, -- [{product_id, sku, title, quantity, price, total}]
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  commission DECIMAL(10, 2) DEFAULT 0, -- Marketplace commission
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Shipping info
  shipping_method TEXT,
  shipping_tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  
  -- Sync info
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN (
    'pending', 'synced', 'error', 'manual'
  )),
  sync_error TEXT,
  
  -- Timestamps
  order_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One external order per marketplace connection
  UNIQUE(marketplace_connection_id, external_order_id)
);

-- Indexes
CREATE INDEX idx_marketplace_orders_tenant_id ON marketplace_orders(tenant_id);
CREATE INDEX idx_marketplace_orders_marketplace_id ON marketplace_orders(marketplace_connection_id);
CREATE INDEX idx_marketplace_orders_external_id ON marketplace_orders(external_order_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(order_status);
CREATE INDEX idx_marketplace_orders_order_date ON marketplace_orders(order_date);

-- Comments
COMMENT ON TABLE marketplace_orders IS 'Pazaryeri siparişleri (Trendyol, Amazon, vb.)';
COMMENT ON COLUMN marketplace_orders.commission IS 'Pazaryeri komisyonu';

-- ============================================================================
-- MARKETPLACE SYNC LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  marketplace_connection_id UUID REFERENCES marketplace_connections(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'products', 'orders', 'inventory', 'prices', 'full'
  )),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN (
    'to_marketplace', 'from_marketplace', 'bidirectional'
  )),
  
  -- Status
  status TEXT NOT NULL CHECK (status IN (
    'started', 'in_progress', 'completed', 'failed', 'cancelled'
  )),
  
  -- Results
  items_processed INTEGER DEFAULT 0,
  items_successful INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  
  -- Error details
  error_message TEXT,
  error_details JSONB,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marketplace_sync_logs_tenant_id ON marketplace_sync_logs(tenant_id);
CREATE INDEX idx_marketplace_sync_logs_marketplace_id ON marketplace_sync_logs(marketplace_connection_id);
CREATE INDEX idx_marketplace_sync_logs_type ON marketplace_sync_logs(sync_type);
CREATE INDEX idx_marketplace_sync_logs_status ON marketplace_sync_logs(status);
CREATE INDEX idx_marketplace_sync_logs_started_at ON marketplace_sync_logs(started_at);

-- Comments
COMMENT ON TABLE marketplace_sync_logs IS 'Pazaryeri senkronizasyon logları';

-- ============================================================================
-- MARKETPLACE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marketplace_connection_id UUID NOT NULL REFERENCES marketplace_connections(id) ON DELETE CASCADE,
  
  -- Category info
  external_category_id TEXT NOT NULL, -- Marketplace category ID
  category_name TEXT NOT NULL,
  category_path TEXT NOT NULL, -- Full category path
  parent_category_id TEXT, -- Parent category ID
  
  -- Mapping
  internal_category TEXT, -- Our internal category mapping
  is_active BOOLEAN DEFAULT true,
  
  -- Attributes
  required_attributes JSONB DEFAULT '[]'::jsonb, -- Required attributes for this category
  optional_attributes JSONB DEFAULT '[]'::jsonb, -- Optional attributes
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One category per marketplace connection
  UNIQUE(marketplace_connection_id, external_category_id)
);

-- Indexes
CREATE INDEX idx_marketplace_categories_marketplace_id ON marketplace_categories(marketplace_connection_id);
CREATE INDEX idx_marketplace_categories_external_id ON marketplace_categories(external_category_id);
CREATE INDEX idx_marketplace_categories_active ON marketplace_categories(is_active);

-- Comments
COMMENT ON TABLE marketplace_categories IS 'Pazaryeri kategori eşleştirmeleri';

-- ============================================================================
-- MARKETPLACE SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  marketplace_connection_id UUID REFERENCES marketplace_connections(id) ON DELETE CASCADE,
  
  -- Settings type
  setting_type TEXT NOT NULL CHECK (setting_type IN (
    'global', 'marketplace_specific', 'product_specific'
  )),
  
  -- Settings data
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One setting type per scope
  UNIQUE(tenant_id, marketplace_connection_id, setting_type)
);

-- Indexes
CREATE INDEX idx_marketplace_settings_tenant_id ON marketplace_settings(tenant_id);
CREATE INDEX idx_marketplace_settings_marketplace_id ON marketplace_settings(marketplace_connection_id);
CREATE INDEX idx_marketplace_settings_type ON marketplace_settings(setting_type);

-- Comments
COMMENT ON TABLE marketplace_settings IS 'Pazaryeri ayarları ve konfigürasyonları';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_settings ENABLE ROW LEVEL SECURITY;

-- Marketplace Orders RLS
CREATE POLICY "Users can view their marketplace orders"
  ON marketplace_orders FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their marketplace orders"
  ON marketplace_orders FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update their marketplace orders"
  ON marketplace_orders FOR UPDATE
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

-- Marketplace Sync Logs RLS
CREATE POLICY "Users can view their sync logs"
  ON marketplace_sync_logs FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert their sync logs"
  ON marketplace_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

-- Marketplace Categories RLS
CREATE POLICY "Users can view marketplace categories"
  ON marketplace_categories FOR SELECT
  TO authenticated
  USING (marketplace_connection_id IN (
    SELECT mc.id FROM marketplace_connections mc
    JOIN profiles p ON mc.tenant_id = p.tenant_id
    WHERE p.id = auth.uid()
  ));

CREATE POLICY "Users can manage marketplace categories"
  ON marketplace_categories FOR ALL
  TO authenticated
  USING (marketplace_connection_id IN (
    SELECT mc.id FROM marketplace_connections mc
    JOIN profiles p ON mc.tenant_id = p.tenant_id
    WHERE p.id = auth.uid()
  ));

-- Marketplace Settings RLS
CREATE POLICY "Users can view their marketplace settings"
  ON marketplace_settings FOR SELECT
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their marketplace settings"
  ON marketplace_settings FOR ALL
  TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_marketplace_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_marketplace_orders_updated_at
  BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION update_marketplace_tables_updated_at();

CREATE TRIGGER update_marketplace_categories_updated_at
  BEFORE UPDATE ON marketplace_categories
  FOR EACH ROW EXECUTE FUNCTION update_marketplace_tables_updated_at();

CREATE TRIGGER update_marketplace_settings_updated_at
  BEFORE UPDATE ON marketplace_settings
  FOR EACH ROW EXECUTE FUNCTION update_marketplace_tables_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get marketplace connection stats
CREATE OR REPLACE FUNCTION get_marketplace_connection_stats(connection_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_listings', COUNT(ml.id),
    'active_listings', COUNT(ml.id) FILTER (WHERE ml.status = 'active'),
    'total_orders', COUNT(mo.id),
    'pending_orders', COUNT(mo.id) FILTER (WHERE mo.order_status = 'pending'),
    'last_sync', MAX(msl.completed_at)
  ) INTO result
  FROM marketplace_connections mc
  LEFT JOIN marketplace_listings ml ON ml.marketplace_connection_id = mc.id
  LEFT JOIN marketplace_orders mo ON mo.marketplace_connection_id = mc.id
  LEFT JOIN marketplace_sync_logs msl ON msl.marketplace_connection_id = mc.id
  WHERE mc.id = connection_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get marketplace performance metrics
CREATE OR REPLACE FUNCTION get_marketplace_performance(tenant_id UUID, days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_orders', COUNT(mo.id),
    'total_revenue', COALESCE(SUM(mo.total_amount), 0),
    'average_order_value', COALESCE(AVG(mo.total_amount), 0),
    'top_marketplace', (
      SELECT mc.marketplace_type
      FROM marketplace_connections mc
      LEFT JOIN marketplace_orders mo2 ON mo2.marketplace_connection_id = mc.id
      WHERE mc.tenant_id = tenant_id
        AND mo2.order_date >= NOW() - INTERVAL '1 day' * days
      GROUP BY mc.marketplace_type
      ORDER BY COUNT(mo2.id) DESC
      LIMIT 1
    )
  ) INTO result
  FROM marketplace_orders mo
  JOIN marketplace_connections mc ON mo.marketplace_connection_id = mc.id
  WHERE mc.tenant_id = tenant_id
    AND mo.order_date >= NOW() - INTERVAL '1 day' * days;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
