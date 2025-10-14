-- ============================================================================
-- OTONIQ.AI - Add cost column to products table
-- Migration 009: Add cost column to products table for pricing
-- ============================================================================

-- Add cost column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) CHECK (cost >= 0);

-- Add price column to products table (for base price)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) CHECK (price >= 0);

-- Add comment
COMMENT ON COLUMN products.cost IS 'Product cost for pricing calculations';
COMMENT ON COLUMN products.price IS 'Product base price';
