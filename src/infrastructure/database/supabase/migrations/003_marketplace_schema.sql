-- ============================================================================
-- OTONIQ.AI - Marketplace Schema
-- Migration 003: Marketplace connections and listings
-- ============================================================================

-- ============================================================================
-- MARKETPLACE CONNECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Marketplace info
  marketplace_type TEXT NOT NULL CHECK (marketplace_type IN (
    'trendyol', 'amazon', 'hepsiburada', 'n11', 'gittigidiyor', 'ciceksepeti', 'other'
  )),
  marketplace_name TEXT, -- Custom name for "other"
  
  -- API Credentials (ENCRYPTED in application layer)
  credentials JSONB NOT NULL, -- {api_key, api_secret, seller_id, etc}
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'testing')),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb, -- {auto_sync: true, sync_interval: 3600, etc}
  
  -- Stats
  total_listed_products INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One marketplace type per tenant (can be relaxed if needed)
  UNIQUE(tenant_id, marketplace_type)
);

-- Indexes
CREATE INDEX idx_marketplace_connections_tenant_id ON marketplace_connections(tenant_id);
CREATE INDEX idx_marketplace_connections_type ON marketplace_connections(marketplace_type);
CREATE INDEX idx_marketplace_connections_status ON marketplace_connections(status);

-- Comments
COMMENT ON TABLE marketplace_connections IS 'Pazaryeri bağlantıları (Trendyol, Amazon, vb.)';
COMMENT ON COLUMN marketplace_connections.credentials IS 'API credentials (encrypted)';

-- ============================================================================
-- MARKETPLACE LISTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  marketplace_connection_id UUID NOT NULL REFERENCES marketplace_connections(id) ON DELETE CASCADE,
  
  -- External IDs
  external_product_id TEXT, -- Marketplace'teki product ID
  external_listing_id TEXT, -- Marketplace'teki listing/offer ID
  external_url TEXT, -- Product URL on marketplace
  
  -- Overrides (NULL ise product'tan alınır)
  price_override DECIMAL(10, 2),
  stock_override INTEGER,
  title_override TEXT,
  description_override TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'active', 'inactive', 'error', 'rejected', 'out_of_stock'
  )),
  error_message TEXT,
  
  -- Sync info
  last_synced_at TIMESTAMPTZ,
  sync_frequency INTEGER DEFAULT 3600, -- seconds
  auto_sync BOOLEAN DEFAULT true,
  
  -- Stats
  views INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique: One product per marketplace connection
  UNIQUE(product_id, marketplace_connection_id)
);

-- Indexes
CREATE INDEX idx_marketplace_listings_product_id ON marketplace_listings(product_id);
CREATE INDEX idx_marketplace_listings_marketplace_id ON marketplace_listings(marketplace_connection_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_external_id ON marketplace_listings(external_product_id) WHERE external_product_id IS NOT NULL;
CREATE INDEX idx_marketplace_listings_sync_due ON marketplace_listings(last_synced_at, sync_frequency) WHERE auto_sync = true AND status = 'active';

-- Comments
COMMENT ON TABLE marketplace_listings IS 'Ürünlerin pazaryerlerindeki listelemeleri';
COMMENT ON COLUMN marketplace_listings.price_override IS 'NULL ise product.price kullanılır';
COMMENT ON COLUMN marketplace_listings.stock_override IS 'NULL ise product.stock_quantity kullanılır';

-- ============================================================================
-- SYNC JOBS TABLE (Track sync operations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Job info
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'products', 'orders', 'inventory', 'prices', 'full'
  )),
  source TEXT NOT NULL, -- 'odoo', 'shopify', 'trendyol', etc
  direction TEXT NOT NULL CHECK (direction IN ('import', 'export', 'bidirectional')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'cancelled'
  )),
  
  -- Progress
  total_items INTEGER,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  
  -- Results
  errors JSONB DEFAULT '[]'::jsonb, -- [{item_id, error_message}]
  summary JSONB, -- {created: 5, updated: 10, failed: 2}
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Metadata
  triggered_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sync_jobs_tenant_id ON sync_jobs(tenant_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_sync_jobs_type ON sync_jobs(sync_type);
CREATE INDEX idx_sync_jobs_created_at ON sync_jobs(created_at DESC);

-- Comments
COMMENT ON TABLE sync_jobs IS 'Senkronizasyon işlerinin takibi';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_marketplace_connections_updated_at
  BEFORE UPDATE ON marketplace_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate sync job duration
CREATE OR REPLACE FUNCTION calculate_sync_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' OR NEW.status = 'failed' THEN
    NEW.completed_at := NOW();
    IF NEW.started_at IS NOT NULL THEN
      NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_job_duration
  BEFORE UPDATE ON sync_jobs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sync_duration();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE marketplace_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Tenant isolation for marketplace_connections"
  ON marketplace_connections FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY "Tenant isolation for marketplace_listings"
  ON marketplace_listings FOR ALL
  USING (
    marketplace_connection_id IN (
      SELECT id FROM marketplace_connections 
      WHERE tenant_id = get_current_tenant_id()
    )
    OR is_super_admin()
  );

CREATE POLICY "Tenant isolation for sync_jobs"
  ON sync_jobs FOR ALL
  USING (tenant_id = get_current_tenant_id() OR is_super_admin());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get effective price for a listing (with override support)
CREATE OR REPLACE FUNCTION get_listing_price(listing_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ml.price_override, p.price)
    FROM marketplace_listings ml
    JOIN products p ON p.id = ml.product_id
    WHERE ml.id = listing_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get effective stock for a listing (with override support)
CREATE OR REPLACE FUNCTION get_listing_stock(listing_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ml.stock_override, p.stock_quantity)
    FROM marketplace_listings ml
    JOIN products p ON p.id = ml.product_id
    WHERE ml.id = listing_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get listings that need sync
CREATE OR REPLACE FUNCTION get_listings_needing_sync(p_tenant_id UUID)
RETURNS TABLE (
  listing_id UUID,
  product_id UUID,
  marketplace_type TEXT,
  last_synced_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ml.id,
    ml.product_id,
    mc.marketplace_type,
    ml.last_synced_at
  FROM marketplace_listings ml
  JOIN marketplace_connections mc ON mc.id = ml.marketplace_connection_id
  WHERE mc.tenant_id = p_tenant_id
    AND ml.auto_sync = true
    AND ml.status = 'active'
    AND (
      ml.last_synced_at IS NULL
      OR EXTRACT(EPOCH FROM (NOW() - ml.last_synced_at)) > ml.sync_frequency
    )
  ORDER BY ml.last_synced_at NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETED: Migration 003
-- ============================================================================

