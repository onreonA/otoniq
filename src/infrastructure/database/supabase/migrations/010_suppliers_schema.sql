-- =============================================
-- Migration 010: Suppliers Schema
-- Description: Supplier management for procurement and inventory
-- Dependencies: 002_tenants_schema.sql
-- =============================================

-- =============================================
-- SUPPLIERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS suppliers (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basic information
  supplier_code VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  
  -- Tax information
  tax_number VARCHAR(50),
  tax_office VARCHAR(255),
  
  -- Contact information
  primary_contact_name VARCHAR(255),
  primary_contact_title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  fax VARCHAR(50),
  website VARCHAR(255),
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Türkiye',
  country_code VARCHAR(2) DEFAULT 'TR',
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'pending')),
  
  -- Supplier type
  supplier_type VARCHAR(50) DEFAULT 'manufacturer' CHECK (supplier_type IN (
    'manufacturer',
    'distributor',
    'wholesaler',
    'importer',
    'agent',
    'other'
  )),
  
  -- Categories and tags
  product_categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Payment terms
  payment_terms VARCHAR(50), -- 'net_30', 'net_60', 'cash', 'on_delivery'
  payment_method VARCHAR(50), -- 'bank_transfer', 'check', 'cash', 'credit'
  currency VARCHAR(3) DEFAULT 'TRY',
  
  -- Banking information (encrypted recommended)
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  iban VARCHAR(50),
  swift_code VARCHAR(20),
  
  -- Credit and limits
  credit_limit DECIMAL(12, 2),
  current_balance DECIMAL(12, 2) DEFAULT 0,
  
  -- Performance metrics (computed/cached)
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  average_lead_time_days INTEGER, -- Average delivery time
  on_time_delivery_rate DECIMAL(5, 2), -- Percentage
  quality_rating DECIMAL(3, 2), -- 1-5 rating
  
  -- Important dates
  first_order_date TIMESTAMP WITH TIME ZONE,
  last_order_date TIMESTAMP WITH TIME ZONE,
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Documents and certifications
  certifications TEXT[], -- ISO, quality certs, etc.
  documents JSONB DEFAULT '[]'::jsonb, -- [{name, url, type, uploaded_at}]
  
  -- External IDs
  external_ids JSONB DEFAULT '{}'::jsonb,
  
  -- Notes
  notes TEXT,
  
  -- Custom fields
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_suppliers_tenant_id ON suppliers(tenant_id);
CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_company_name ON suppliers(company_name);

-- Unique constraint
CREATE UNIQUE INDEX unique_suppliers_tenant_code ON suppliers(tenant_id, supplier_code);

-- Full-text search index
CREATE INDEX idx_suppliers_search ON suppliers USING gin(
  to_tsvector('simple', 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(trade_name, '') || ' ' || 
    COALESCE(supplier_code, '')
  )
);

-- Comments
COMMENT ON TABLE suppliers IS 'Supplier master data for procurement management';
COMMENT ON COLUMN suppliers.on_time_delivery_rate IS 'Percentage of orders delivered on time';
COMMENT ON COLUMN suppliers.quality_rating IS 'Quality rating from 1 to 5';
COMMENT ON COLUMN suppliers.payment_terms IS 'Payment terms like net_30, net_60, etc.';

-- =============================================
-- SUPPLIER CONTACTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS supplier_contacts (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Contact details
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  department VARCHAR(100),
  
  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  
  -- Settings
  is_primary BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_supplier_contacts_tenant_id ON supplier_contacts(tenant_id);
CREATE INDEX idx_supplier_contacts_supplier_id ON supplier_contacts(supplier_id);
CREATE INDEX idx_supplier_contacts_is_primary ON supplier_contacts(is_primary);

-- Comments
COMMENT ON TABLE supplier_contacts IS 'Additional contacts for suppliers';

-- =============================================
-- SUPPLIER PRODUCTS TABLE (Product-Supplier Relationship)
-- =============================================
CREATE TABLE IF NOT EXISTS supplier_products (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Supplier-specific product info
  supplier_sku VARCHAR(100),
  supplier_product_name VARCHAR(255),
  
  -- Pricing
  unit_cost DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'TRY',
  minimum_order_quantity DECIMAL(12, 3) DEFAULT 1,
  
  -- Lead time
  lead_time_days INTEGER,
  
  -- Settings
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_supplier_products_tenant_id ON supplier_products(tenant_id);
CREATE INDEX idx_supplier_products_supplier_id ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_product_id ON supplier_products(product_id);
CREATE INDEX idx_supplier_products_is_preferred ON supplier_products(is_preferred);

-- Unique constraint (one product-supplier relationship)
CREATE UNIQUE INDEX unique_supplier_products ON supplier_products(supplier_id, product_id);

-- Comments
COMMENT ON TABLE supplier_products IS 'Product-supplier relationships with pricing and lead times';
COMMENT ON COLUMN supplier_products.is_preferred IS 'Preferred supplier for this product';

-- =============================================
-- TRIGGERS
-- =============================================

-- Update suppliers updated_at
CREATE TRIGGER trigger_update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update supplier_contacts updated_at
CREATE TRIGGER trigger_update_supplier_contacts_updated_at
  BEFORE UPDATE ON supplier_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update supplier_products updated_at
CREATE TRIGGER trigger_update_supplier_products_updated_at
  BEFORE UPDATE ON supplier_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- Suppliers Policies
CREATE POLICY "Users can view their tenant's suppliers"
  ON suppliers FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage suppliers"
  ON suppliers FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Supplier Contacts Policies
CREATE POLICY "Users can view their tenant's supplier contacts"
  ON supplier_contacts FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage supplier contacts"
  ON supplier_contacts FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Supplier Products Policies
CREATE POLICY "Users can view their tenant's supplier products"
  ON supplier_products FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage supplier products"
  ON supplier_products FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Supplier performance summary
CREATE OR REPLACE VIEW supplier_performance_view AS
SELECT 
  s.id,
  s.tenant_id,
  s.supplier_code,
  s.company_name,
  s.status,
  s.total_orders,
  s.total_spent,
  s.on_time_delivery_rate,
  s.quality_rating,
  s.average_lead_time_days,
  (SELECT COUNT(*) FROM supplier_products WHERE supplier_id = s.id AND is_active = true) AS active_products_count
FROM suppliers s;

-- View: Product supplier options (for purchasing)
CREATE OR REPLACE VIEW product_supplier_options_view AS
SELECT 
  sp.product_id,
  sp.tenant_id,
  p.sku,
  p.name AS product_name,
  s.id AS supplier_id,
  s.company_name AS supplier_name,
  sp.unit_cost,
  sp.currency,
  sp.lead_time_days,
  sp.minimum_order_quantity,
  sp.is_preferred,
  s.on_time_delivery_rate,
  s.quality_rating
FROM supplier_products sp
INNER JOIN suppliers s ON sp.supplier_id = s.id
INNER JOIN products p ON sp.product_id = p.id
WHERE sp.is_active = true AND s.status = 'active'
ORDER BY sp.is_preferred DESC, sp.unit_cost ASC;

-- Add table comments
COMMENT ON TABLE suppliers IS 'Supplier master data for procurement';
COMMENT ON TABLE supplier_contacts IS 'Additional contact persons for suppliers';
COMMENT ON TABLE supplier_products IS 'Product-supplier relationships with pricing';

