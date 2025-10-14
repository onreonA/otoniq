-- =============================================
-- Migration 006: Categories Schema
-- Description: Product categories with hierarchical tree structure
-- Dependencies: 002_tenants_schema.sql, 003_products_schema.sql
-- =============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Tree structure
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Basic information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Media
  image_url TEXT,
  icon VARCHAR(100), -- Icon name or emoji
  
  -- SEO fields
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Display settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Statistics (computed/cached)
  product_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Create unique constraint on tenant_id + slug
CREATE UNIQUE INDEX unique_categories_tenant_slug ON categories(tenant_id, slug);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Create function to update product_count
CREATE OR REPLACE FUNCTION update_category_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories 
    SET product_count = product_count + 1 
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories 
    SET product_count = product_count - 1 
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE categories 
    SET product_count = product_count - 1 
    WHERE id = OLD.category_id;
    UPDATE categories 
    SET product_count = product_count + 1 
    WHERE id = NEW.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on products table to auto-update category product_count
-- Note: This assumes products table has a category_id column
-- If not exists, this trigger will be skipped during migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    CREATE TRIGGER trigger_update_category_product_count
      AFTER INSERT OR UPDATE OR DELETE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_category_product_count();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see categories from their tenant
CREATE POLICY "Users can view their tenant's categories"
  ON categories FOR SELECT
  USING (
    tenant_id = (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Super admins can see all categories
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role = 'super_admin'
    )
  );

-- RLS Policy: Tenant admins can insert categories
CREATE POLICY "Tenant admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    tenant_id = (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('tenant_admin', 'super_admin')
    )
  );

-- RLS Policy: Tenant admins can update categories
CREATE POLICY "Tenant admins can update categories"
  ON categories FOR UPDATE
  USING (
    tenant_id = (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('tenant_admin', 'super_admin')
    )
  );

-- RLS Policy: Tenant admins can delete categories
CREATE POLICY "Tenant admins can delete categories"
  ON categories FOR DELETE
  USING (
    tenant_id = (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
    AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
        AND role IN ('tenant_admin', 'super_admin')
    )
  );

-- Add category_id to products table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX idx_products_category_id ON products(category_id);
  END IF;
END $$;

-- Create helpful view for category tree with levels
CREATE OR REPLACE VIEW category_tree_view AS
WITH RECURSIVE category_path AS (
  -- Base case: root categories (no parent)
  SELECT 
    id,
    tenant_id,
    parent_id,
    name,
    slug,
    image_url,
    is_active,
    display_order,
    product_count,
    0 AS level,
    name::TEXT AS path,
    ARRAY[id] AS id_path
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: child categories
  SELECT 
    c.id,
    c.tenant_id,
    c.parent_id,
    c.name,
    c.slug,
    c.image_url,
    c.is_active,
    c.display_order,
    c.product_count,
    cp.level + 1,
    (cp.path || ' > ' || c.name)::TEXT,
    cp.id_path || c.id
  FROM categories c
  INNER JOIN category_path cp ON c.parent_id = cp.id
)
SELECT * FROM category_path
ORDER BY tenant_id, id_path;

-- Insert some sample categories for testing (optional, can be removed)
-- These will only be inserted if no categories exist yet
INSERT INTO categories (tenant_id, name, slug, description, display_order, is_active, is_featured)
SELECT 
  t.id,
  'Elektronik',
  'elektronik',
  'Tüm elektronik ürünler',
  1,
  true,
  true
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE tenant_id = t.id LIMIT 1);

-- Add comment to table
COMMENT ON TABLE categories IS 'Product categories with hierarchical tree structure support';
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category for tree structure (NULL for root categories)';
COMMENT ON COLUMN categories.product_count IS 'Cached count of products in this category (auto-updated via trigger)';
COMMENT ON COLUMN categories.display_order IS 'Order for displaying categories (lower numbers first)';

