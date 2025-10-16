-- ============================================================================
-- Migration 053: Fix Barcode Unique Constraint for ON CONFLICT Support
-- ============================================================================
-- PostgreSQL does not support partial indexes (with WHERE clause) in ON CONFLICT
-- We need to drop the partial index and create a full unique constraint

-- Drop the existing partial unique index
DROP INDEX IF EXISTS public.unique_product_barcode;

-- Create a full unique constraint without WHERE clause
-- This allows ON CONFLICT (tenant_id, barcode) to work
CREATE UNIQUE INDEX unique_product_barcode 
  ON public.products(tenant_id, barcode);

-- Note: This means NULL barcodes can appear multiple times per tenant
-- which is acceptable as products without barcodes won't use cross-platform sync

