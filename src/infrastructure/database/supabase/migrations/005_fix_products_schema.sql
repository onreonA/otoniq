-- ============================================================================
-- OTONIQ.AI - Fix Products Schema
-- Migration 005: Fix products table schema to match entity
-- ============================================================================

-- Drop existing products table if it exists (for clean migration)
DROP TABLE IF EXISTS products CASCADE;

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
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, sku)
);

-- ============================================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant info
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost DECIMAL(10, 2) CHECK (cost >= 0),
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  
  -- Physical properties
  weight DECIMAL(8, 3),
  dimensions JSONB,
  
  -- Variant attributes (color, size, etc.)
  attributes JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(product_id, sku)
);

-- ============================================================================
-- PRODUCT IMAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Image info
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PRODUCT CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Category info
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, slug)
);

-- ============================================================================
-- PRODUCT AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Audit info
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'price_changed', 'stock_changed')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  
  -- Timestamps
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(product_id, sku);

-- Product images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

-- Product categories indexes
CREATE INDEX IF NOT EXISTS idx_product_categories_tenant_id ON product_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

-- Product audit logs indexes
CREATE INDEX IF NOT EXISTS idx_product_audit_logs_product_id ON product_audit_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_audit_logs_changed_at ON product_audit_logs(changed_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_audit_logs ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies
CREATE POLICY "Tenants can view own products" ON products
  FOR SELECT USING (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenants can insert own products" ON products
  FOR INSERT WITH CHECK (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenants can update own products" ON products
  FOR UPDATE USING (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenants can delete own products" ON products
  FOR DELETE USING (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Product variants RLS Policies
CREATE POLICY "Tenants can view own product variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id 
      AND (
        tenant_id::text IN (
          SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role = 'super_admin'
        )
      )
    )
  );

CREATE POLICY "Tenants can manage own product variants" ON product_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id 
      AND (
        tenant_id::text IN (
          SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role = 'super_admin'
        )
      )
    )
  );

-- Product images RLS Policies
CREATE POLICY "Tenants can view own product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id 
      AND (
        tenant_id::text IN (
          SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role = 'super_admin'
        )
      )
    )
  );

CREATE POLICY "Tenants can manage own product images" ON product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id 
      AND (
        tenant_id::text IN (
          SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role = 'super_admin'
        )
      )
    )
  );

-- Product categories RLS Policies
CREATE POLICY "Tenants can view own product categories" ON product_categories
  FOR SELECT USING (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Tenants can manage own product categories" ON product_categories
  FOR ALL USING (
    tenant_id::text IN (
      SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Product audit logs RLS Policies
CREATE POLICY "Tenants can view own product audit logs" ON product_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_id 
      AND (
        tenant_id::text IN (
          SELECT id::text FROM tenants WHERE id::text = auth.jwt() ->> 'tenant_id'
        ) OR
        EXISTS (
          SELECT 1 FROM users 
          WHERE id = auth.uid() 
          AND role = 'super_admin'
        )
      )
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at trigger for products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Update updated_at trigger for product_variants
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_product_variants_updated_at();

-- Update updated_at trigger for product_categories
CREATE OR REPLACE FUNCTION update_product_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_product_categories_updated_at();
