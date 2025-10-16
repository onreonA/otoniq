-- ============================================================================
-- Migration 048: Add Missing Product Fields for Multi-Platform Sync
-- ============================================================================
-- This migration adds missing fields from Odoo and Shopify integrations
-- to the products table for comprehensive multi-platform sync support

-- 1. BARCODE & INTEGRATION FIELDS (KRİTİK)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. PRICING FIELDS
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5, 2) 
  GENERATED ALWAYS AS (
    CASE 
      WHEN compare_at_price IS NOT NULL AND compare_at_price > 0 AND price > 0
      THEN ROUND(((compare_at_price - price) / compare_at_price * 100)::numeric, 2)
      ELSE 0
    END
  ) STORED,
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2)
  GENERATED ALWAYS AS (
    CASE 
      WHEN is_taxable = true AND price > 0
      THEN ROUND((price * (1 + (tax_rate / 100)))::numeric, 2)
      ELSE price
    END
  ) STORED;

-- 3. PHYSICAL PROPERTIES
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS volume DECIMAL(10, 3), -- m³ or L
ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN DEFAULT true;

-- 4. BUSINESS RULES
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_taxable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sale_ok BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS purchase_ok BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS inventory_policy TEXT DEFAULT 'continue' 
  CHECK (inventory_policy IN ('continue', 'deny'));

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_barcode 
  ON public.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor 
  ON public.products(vendor) WHERE vendor IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_published_at 
  ON public.products(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sale_ok 
  ON public.products(sale_ok);

-- 6. UNIQUE CONSTRAINT ON BARCODE (per tenant)
CREATE UNIQUE INDEX IF NOT EXISTS unique_product_barcode 
  ON public.products(tenant_id, barcode)
  WHERE barcode IS NOT NULL AND barcode != '';

-- 7. COMMENTS
COMMENT ON COLUMN public.products.barcode IS 'Universal barcode - primary key for multi-platform sync';
COMMENT ON COLUMN public.products.vendor IS 'Vendor/Brand/Manufacturer name';
COMMENT ON COLUMN public.products.compare_at_price IS 'Original price before discount';
COMMENT ON COLUMN public.products.tax_rate IS 'Tax rate percentage (e.g., 20 for 20% VAT)';
COMMENT ON COLUMN public.products.discount_percentage IS 'Auto-calculated discount % from compare_at_price';
COMMENT ON COLUMN public.products.final_price IS 'Auto-calculated price including tax';
COMMENT ON COLUMN public.products.volume IS 'Product volume in cubic meters or liters';
COMMENT ON COLUMN public.products.requires_shipping IS 'Does this product require physical shipping?';
COMMENT ON COLUMN public.products.is_taxable IS 'Is this product subject to tax?';
COMMENT ON COLUMN public.products.sale_ok IS 'Can this product be sold? (Odoo compatibility)';
COMMENT ON COLUMN public.products.purchase_ok IS 'Can this product be purchased? (Odoo compatibility)';
COMMENT ON COLUMN public.products.inventory_policy IS 'What to do when out of stock: continue (oversell) or deny';
