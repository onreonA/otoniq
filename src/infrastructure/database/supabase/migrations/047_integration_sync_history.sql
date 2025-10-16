-- Create integration_sync_history table
CREATE TABLE IF NOT EXISTS public.integration_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  sync_type TEXT NOT NULL, -- 'full', 'stock', 'price', etc.
  status TEXT NOT NULL, -- 'completed', 'partial', 'failed'
  items_processed INTEGER DEFAULT 0,
  items_successful INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_sync_history_tenant_id 
  ON public.integration_sync_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_history_integration_type 
  ON public.integration_sync_history(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_sync_history_completed_at 
  ON public.integration_sync_history(completed_at DESC);

-- Enable RLS
ALTER TABLE public.integration_sync_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their tenant's sync history" ON public.integration_sync_history;
DROP POLICY IF EXISTS "Users can insert their tenant's sync history" ON public.integration_sync_history;

-- RLS Policies
CREATE POLICY "Users can view their tenant's sync history"
  ON public.integration_sync_history
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their tenant's sync history"
  ON public.integration_sync_history
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON public.integration_sync_history TO authenticated;
GRANT SELECT, INSERT ON public.integration_sync_history TO service_role;

