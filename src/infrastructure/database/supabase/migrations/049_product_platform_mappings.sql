-- ============================================================================
-- Migration 049: Product Platform Mappings for Multi-Platform Sync
-- ============================================================================
-- This table maps master products (by barcode) to external platform product IDs
-- enabling cross-platform synchronization and unified inventory management

CREATE TABLE IF NOT EXISTS public.product_platform_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Master product reference (barcode ile eşleşen)
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Platform bilgisi
  platform TEXT NOT NULL CHECK (platform IN (
    'odoo', 'shopify', 'alibaba', 'trendyol', 'amazon', 'n11', 'hepsiburada'
  )),
  
  -- Platform'daki ürün ID'si
  external_id TEXT NOT NULL,
  
  -- Platform'dan gelen raw data (JSONB)
  external_data JSONB DEFAULT '{}',
  
  -- Senkronizasyon durumu
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'paused', 'error', 'deleted')),
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  
  -- Platform'daki son güncelleme tarihi
  external_created_at TIMESTAMPTZ,
  external_updated_at TIMESTAMPTZ,
  
  -- Platform'daki aktif bilgiler (snapshot)
  platform_stock_quantity INTEGER,
  platform_price DECIMAL(10, 2),
  platform_status TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(tenant_id, platform, external_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_mappings_product_id 
  ON public.product_platform_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_platform_mappings_platform 
  ON public.product_platform_mappings(platform);
CREATE INDEX IF NOT EXISTS idx_platform_mappings_tenant_platform 
  ON public.product_platform_mappings(tenant_id, platform);
CREATE INDEX IF NOT EXISTS idx_platform_mappings_sync_status 
  ON public.product_platform_mappings(sync_status);

-- RLS Policies
ALTER TABLE public.product_platform_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their tenant's mappings" ON public.product_platform_mappings;
DROP POLICY IF EXISTS "Users can manage their tenant's mappings" ON public.product_platform_mappings;

CREATE POLICY "Users can view their tenant's mappings"
  ON public.product_platform_mappings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their tenant's mappings"
  ON public.product_platform_mappings FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.product_platform_mappings TO authenticated;
GRANT ALL ON public.product_platform_mappings TO service_role;

-- Comments
COMMENT ON TABLE public.product_platform_mappings IS 'Maps master products to external platform product IDs';
COMMENT ON COLUMN public.product_platform_mappings.external_data IS 'Full raw JSON data from external platform';
COMMENT ON COLUMN public.product_platform_mappings.platform_stock_quantity IS 'Snapshot of stock quantity on external platform';
COMMENT ON COLUMN public.product_platform_mappings.platform_price IS 'Snapshot of price on external platform';
