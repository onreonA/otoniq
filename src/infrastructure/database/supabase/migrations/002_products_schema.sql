-- ============================================================================
-- OTONIQ.AI - Products Schema
-- Migration 002: Products tables
-- ============================================================================

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basic info
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Status and type
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  product_type TEXT NOT NULL DEFAULT 'simple' CHECK (product_type IN ('simple', 'variable', 'grouped', 'external')),
  
  -- Categories and tags
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Physical properties
  weight DECIMAL(8, 3),
  dimensions JSONB,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- External sync IDs
  odoo_product_id TEXT,
  shopify_product_id TEXT,
  
  -- Media & Attributes
  images JSONB DEFAULT '[]'::jsonb, -- [{url, alt, order}]
  attributes JSONB DEFAULT '{}'::jsonb, -- {color, size, weight, etc}
  variants JSONB DEFAULT '[]'::jsonb, -- [{sku, attributes, price, stock}]
  
  -- Categories & Tags
  category TEXT,
  tags TEXT[], -- Array of tags
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: SKU per tenant
  UNIQUE(tenant_id, sku)
);

-- Indexes
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('turkish', title));
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_tags ON products USING gin(tags);
CREATE INDEX idx_products_odoo_id ON products(odoo_product_id) WHERE odoo_product_id IS NOT NULL;
CREATE INDEX idx_products_shopify_id ON products(shopify_product_id) WHERE shopify_product_id IS NOT NULL;
CREATE INDEX idx_products_low_stock ON products(stock_quantity) WHERE stock_quantity <= low_stock_threshold;

-- Comments
COMMENT ON TABLE products IS 'Ürünler (multi-tenant, RLS ile izole)';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - Tenant içinde unique';
COMMENT ON COLUMN products.images IS 'Ürün görselleri: [{url, alt, order}]';
COMMENT ON COLUMN products.attributes IS 'Ürün özellikleri: {color, size, weight, ...}';
COMMENT ON COLUMN products.variants IS 'Ürün varyantları: [{sku, attributes, price, stock}]';

-- ============================================================================
-- PRODUCT HISTORY TABLE (Audit log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Change tracking
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'price_changed', 'stock_changed')),
  changes JSONB NOT NULL, -- {field: {old, new}}
  
  -- User who made the change
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_history_product_id ON product_history(product_id);
CREATE INDEX idx_product_history_tenant_id ON product_history(tenant_id);
CREATE INDEX idx_product_history_action ON product_history(action);
CREATE INDEX idx_product_history_changed_at ON product_history(changed_at DESC);

-- Comments
COMMENT ON TABLE product_history IS 'Ürün değişiklik geçmişi (audit log)';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}'::jsonb;
  action_type TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes := jsonb_build_object('product', row_to_json(NEW));
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detect specific changes
    IF OLD.price != NEW.price THEN
      action_type := 'price_changed';
      changes := jsonb_build_object(
        'price', jsonb_build_object('old', OLD.price, 'new', NEW.price)
      );
    ELSIF OLD.stock_quantity != NEW.stock_quantity THEN
      action_type := 'stock_changed';
      changes := jsonb_build_object(
        'stock_quantity', jsonb_build_object('old', OLD.stock_quantity, 'new', NEW.stock_quantity)
      );
    ELSE
      action_type := 'updated';
      -- Track all changed fields
      IF OLD.title != NEW.title THEN
        changes := changes || jsonb_build_object('title', jsonb_build_object('old', OLD.title, 'new', NEW.title));
      END IF;
      IF OLD.description != NEW.description THEN
        changes := changes || jsonb_build_object('description', jsonb_build_object('old', OLD.description, 'new', NEW.description));
      END IF;
      -- Add more fields as needed
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    changes := jsonb_build_object('product', row_to_json(OLD));
  END IF;
  
  -- Insert into history
  INSERT INTO product_history (product_id, tenant_id, action, changes, changed_by)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.tenant_id, OLD.tenant_id),
    action_type,
    changes,
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger
CREATE TRIGGER product_audit_log
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_product_changes();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES

-- Tenant isolation: Users can only see their tenant's products
CREATE POLICY "Tenant isolation for products"
  ON products FOR ALL
  USING (
    tenant_id = get_current_tenant_id()
    OR is_super_admin()
  );

-- Super admin can do everything
CREATE POLICY "Super admins have full access to products"
  ON products FOR ALL
  USING (is_super_admin());

-- PRODUCT HISTORY POLICIES

-- Users can view their tenant's product history
CREATE POLICY "Users can view their tenant product history"
  ON product_history FOR SELECT
  USING (
    tenant_id = get_current_tenant_id()
    OR is_super_admin()
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if product is low on stock
CREATE OR REPLACE FUNCTION is_low_stock(product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT stock_quantity <= low_stock_threshold
    FROM products
    WHERE id = product_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get products low on stock for a tenant
CREATE OR REPLACE FUNCTION get_low_stock_products(p_tenant_id UUID)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  title TEXT,
  stock_quantity INTEGER,
  low_stock_threshold INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.sku,
    p.title,
    p.stock_quantity,
    p.low_stock_threshold
  FROM products p
  WHERE p.tenant_id = p_tenant_id
    AND p.stock_quantity <= p.low_stock_threshold
    AND p.status = 'active'
  ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate product profit margin
CREATE OR REPLACE FUNCTION calculate_profit_margin(p_price DECIMAL, p_cost DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF p_cost IS NULL OR p_cost = 0 THEN
    RETURN NULL;
  END IF;
  RETURN ROUND(((p_price - p_cost) / p_price * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMPLETED: Migration 002
-- ============================================================================

