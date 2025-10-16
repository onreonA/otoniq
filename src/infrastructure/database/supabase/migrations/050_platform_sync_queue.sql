-- ============================================================================
-- Migration 050: Platform Sync Queue for Real-Time Stock Sync
-- ============================================================================
-- This table manages cross-platform synchronization queue for real-time updates
-- when products change on one platform, other platforms are automatically updated

CREATE TABLE IF NOT EXISTS public.platform_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Hangi ürün
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  
  -- Ne değişti?
  change_type TEXT NOT NULL CHECK (change_type IN (
    'stock', 'price', 'status', 'metadata', 'images', 'full_sync'
  )),
  
  -- Hangi platformda değişti? (source)
  source_platform TEXT NOT NULL,
  
  -- Hangi platformlara senkronize edilecek? (targets)
  target_platforms TEXT[] NOT NULL,
  
  -- Değişiklik detayları (JSONB)
  change_data JSONB NOT NULL,
  
  -- Queue status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'retry'
  )),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Priority (1 = highest, 10 = lowest)
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sync_queue_status 
  ON public.platform_sync_queue(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_barcode 
  ON public.platform_sync_queue(barcode);
CREATE INDEX IF NOT EXISTS idx_sync_queue_product_id 
  ON public.platform_sync_queue(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at 
  ON public.platform_sync_queue(created_at DESC);

-- RLS
ALTER TABLE public.platform_sync_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their tenant's queue" ON public.platform_sync_queue;
DROP POLICY IF EXISTS "System can manage sync queue" ON public.platform_sync_queue;

CREATE POLICY "Users can view their tenant's queue"
  ON public.platform_sync_queue FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage sync queue"
  ON public.platform_sync_queue FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.platform_sync_queue TO authenticated;
GRANT ALL ON public.platform_sync_queue TO service_role;

-- Comments
COMMENT ON TABLE public.platform_sync_queue IS 'Queue for cross-platform product synchronization';
COMMENT ON COLUMN public.platform_sync_queue.change_data IS 'JSON containing what changed (e.g., {"old_stock": 10, "new_stock": 5})';
COMMENT ON COLUMN public.platform_sync_queue.priority IS '1=highest priority (stock changes), 10=lowest priority (metadata updates)';
