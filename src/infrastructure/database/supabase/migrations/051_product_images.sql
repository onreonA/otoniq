-- ============================================================================
-- Migration 051: Product Images Table
-- ============================================================================
-- This table stores product images from various platforms
-- supporting multiple images per product with ordering and metadata

-- Drop existing table if it exists (to ensure clean migration)
DROP TABLE IF EXISTS public.product_images CASCADE;

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Image details
  url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  
  -- Image metadata
  width INTEGER,
  height INTEGER,
  format TEXT, -- 'jpg', 'png', 'webp', etc.
  size_bytes INTEGER,
  
  -- Platform source
  source_platform TEXT,
  external_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (created immediately after table creation)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
  ON public.product_images(product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_is_primary 
  ON public.product_images(is_primary) 
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_product_images_position 
  ON public.product_images(product_id, position);

CREATE INDEX IF NOT EXISTS idx_product_images_source_platform 
  ON public.product_images(source_platform) 
  WHERE source_platform IS NOT NULL;

-- RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their tenant's images" ON public.product_images;
DROP POLICY IF EXISTS "Users can manage their tenant's images" ON public.product_images;

CREATE POLICY "Users can view their tenant's images"
  ON public.product_images FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their tenant's images"
  ON public.product_images FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;

-- Comments
COMMENT ON TABLE public.product_images IS 'Product images from various platforms';
COMMENT ON COLUMN public.product_images.position IS 'Display order (0 = first, 1 = second, etc.)';
COMMENT ON COLUMN public.product_images.is_primary IS 'Primary image for product display';
COMMENT ON COLUMN public.product_images.source_platform IS 'Platform where image was imported from (odoo, shopify, etc.)';
