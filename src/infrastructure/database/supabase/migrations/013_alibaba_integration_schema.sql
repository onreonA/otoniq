-- ============================================================================
-- 013_alibaba_integration_schema.sql
-- Alibaba.com B2B Marketplace Integration Schema
-- ============================================================================
-- This migration creates the necessary tables and policies for Alibaba.com
-- B2B marketplace integration, including:
-- - Connection management
-- - Product mappings
-- - Order synchronization
-- - Message/RFQ management
-- - Sync logging
-- ============================================================================

-- ============================================================================
-- 1. ALIBABA CONNECTIONS TABLE
-- ============================================================================
-- Stores Alibaba.com API connection credentials and settings for each tenant

CREATE TABLE IF NOT EXISTS public.alibaba_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  store_url TEXT NOT NULL,
  store_name TEXT,
  app_key TEXT NOT NULL,
  app_secret_encrypted TEXT NOT NULL, -- Encrypted using Supabase Vault or application-level encryption
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_frequency_minutes INTEGER DEFAULT 60,
  auto_sync_enabled BOOLEAN DEFAULT true,
  auto_sync_products BOOLEAN DEFAULT true,
  auto_sync_orders BOOLEAN DEFAULT true,
  auto_sync_inventory BOOLEAN DEFAULT true,
  webhook_url TEXT,
  webhook_secret TEXT,
  retry_failed_operations BOOLEAN DEFAULT true,
  notification_email TEXT,
  debug_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id) -- One Alibaba connection per tenant
);

COMMENT ON TABLE public.alibaba_connections IS 'Stores Alibaba.com API connection credentials and sync settings for each tenant';
COMMENT ON COLUMN public.alibaba_connections.app_secret_encrypted IS 'Encrypted API secret - should be encrypted before storage';
COMMENT ON COLUMN public.alibaba_connections.sync_frequency_minutes IS 'How often to run automatic sync (in minutes)';

-- ============================================================================
-- 2. ALIBABA PRODUCT MAPPINGS TABLE
-- ============================================================================
-- Maps Otoniq products to Alibaba products for synchronization

CREATE TABLE IF NOT EXISTS public.alibaba_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  otoniq_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alibaba_product_id TEXT NOT NULL,
  alibaba_sku TEXT,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_alibaba', 'from_alibaba', 'bidirectional')),
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  sync_error_message TEXT,
  price_sync_enabled BOOLEAN DEFAULT true,
  inventory_sync_enabled BOOLEAN DEFAULT true,
  metadata JSONB, -- Additional sync metadata (e.g., last_alibaba_update, conflict_resolution)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, otoniq_product_id), -- One mapping per Otoniq product
  UNIQUE(tenant_id, alibaba_product_id) -- One mapping per Alibaba product
);

COMMENT ON TABLE public.alibaba_product_mappings IS 'Maps Otoniq products to Alibaba products for bidirectional synchronization';
COMMENT ON COLUMN public.alibaba_product_mappings.sync_direction IS 'Direction of sync: to_alibaba (push only), from_alibaba (pull only), or bidirectional';
COMMENT ON COLUMN public.alibaba_product_mappings.metadata IS 'Additional JSON metadata for sync tracking and conflict resolution';

-- ============================================================================
-- 3. ALIBABA ORDERS TABLE
-- ============================================================================
-- Stores orders from Alibaba.com marketplace

CREATE TABLE IF NOT EXISTS public.alibaba_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  alibaba_order_id TEXT NOT NULL,
  alibaba_order_number TEXT NOT NULL,
  otoniq_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  buyer_id TEXT,
  buyer_name TEXT,
  buyer_company TEXT,
  buyer_country TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'escrow', 'released', 'refunded')),
  shipping_status TEXT CHECK (shipping_status IN ('pending', 'preparing', 'shipped', 'in_transit', 'delivered', 'returned')),
  order_status TEXT CHECK (order_status IN ('awaiting_payment', 'processing', 'shipped', 'completed', 'cancelled', 'refunded')),
  tracking_number TEXT,
  shipping_method TEXT,
  estimated_delivery TIMESTAMPTZ,
  notes TEXT,
  order_data JSONB, -- Full order payload from Alibaba API
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, alibaba_order_id)
);

COMMENT ON TABLE public.alibaba_orders IS 'Stores orders from Alibaba.com marketplace';
COMMENT ON COLUMN public.alibaba_orders.order_data IS 'Full JSON payload from Alibaba API for reference';
COMMENT ON COLUMN public.alibaba_orders.otoniq_order_id IS 'Reference to synchronized order in Otoniq orders table';

-- ============================================================================
-- 4. ALIBABA MESSAGES TABLE
-- ============================================================================
-- Stores messages, RFQs, and inquiries from Alibaba buyers

CREATE TABLE IF NOT EXISTS public.alibaba_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  alibaba_message_id TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('rfq', 'inquiry', 'general', 'negotiation')),
  sender_id TEXT,
  sender_name TEXT,
  sender_company TEXT,
  sender_country TEXT,
  sender_email TEXT,
  subject TEXT,
  content TEXT,
  product_id TEXT, -- Alibaba product ID if message is about a specific product
  otoniq_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER,
  target_price DECIMAL(10, 2),
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  reply_content TEXT,
  auto_replied BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB, -- Additional message metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tenant_id, alibaba_message_id)
);

COMMENT ON TABLE public.alibaba_messages IS 'Stores messages, RFQs, and inquiries from Alibaba buyers';
COMMENT ON COLUMN public.alibaba_messages.message_type IS 'Type of message: rfq (Request for Quotation), inquiry, general, or negotiation';
COMMENT ON COLUMN public.alibaba_messages.auto_replied IS 'Whether this message was auto-replied by AI/automation';

-- ============================================================================
-- 5. ALIBABA SYNC LOGS TABLE
-- ============================================================================
-- Logs all synchronization operations for debugging and monitoring

CREATE TABLE IF NOT EXISTS public.alibaba_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('products', 'orders', 'messages', 'inventory', 'prices', 'analytics', 'full')),
  operation TEXT, -- e.g., 'sync_all_products', 'sync_new_orders', 'push_inventory'
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'in_progress')),
  items_synced INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  items_skipped INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB, -- Detailed error information
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  triggered_by TEXT DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'automatic', 'webhook', 'scheduled')),
  metadata JSONB, -- Additional sync metadata (e.g., filters used, batch size)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.alibaba_sync_logs IS 'Logs all Alibaba synchronization operations for monitoring and debugging';
COMMENT ON COLUMN public.alibaba_sync_logs.sync_type IS 'Type of sync operation: products, orders, messages, inventory, prices, analytics, or full';
COMMENT ON COLUMN public.alibaba_sync_logs.triggered_by IS 'How the sync was triggered: manual, automatic, webhook, or scheduled';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Alibaba Connections
CREATE INDEX IF NOT EXISTS idx_alibaba_connections_tenant ON public.alibaba_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_connections_active ON public.alibaba_connections(is_active) WHERE is_active = true;

-- Alibaba Product Mappings
CREATE INDEX IF NOT EXISTS idx_alibaba_product_mappings_tenant ON public.alibaba_product_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_product_mappings_otoniq_product ON public.alibaba_product_mappings(otoniq_product_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_product_mappings_alibaba_product ON public.alibaba_product_mappings(alibaba_product_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_product_mappings_sync_status ON public.alibaba_product_mappings(sync_status);
CREATE INDEX IF NOT EXISTS idx_alibaba_product_mappings_last_synced ON public.alibaba_product_mappings(last_synced_at DESC);

-- Alibaba Orders
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_tenant ON public.alibaba_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_alibaba_id ON public.alibaba_orders(alibaba_order_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_otoniq_order ON public.alibaba_orders(otoniq_order_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_status ON public.alibaba_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_created_at ON public.alibaba_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alibaba_orders_buyer ON public.alibaba_orders(buyer_id);

-- Alibaba Messages
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_tenant ON public.alibaba_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_alibaba_id ON public.alibaba_messages(alibaba_message_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_type ON public.alibaba_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_read ON public.alibaba_messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_product ON public.alibaba_messages(otoniq_product_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_created_at ON public.alibaba_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alibaba_messages_priority ON public.alibaba_messages(priority) WHERE priority IN ('high', 'urgent');

-- Alibaba Sync Logs
CREATE INDEX IF NOT EXISTS idx_alibaba_sync_logs_tenant ON public.alibaba_sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alibaba_sync_logs_type ON public.alibaba_sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_alibaba_sync_logs_status ON public.alibaba_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_alibaba_sync_logs_started_at ON public.alibaba_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_alibaba_sync_logs_failed ON public.alibaba_sync_logs(status) WHERE status = 'failed';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.alibaba_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alibaba_product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alibaba_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alibaba_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alibaba_sync_logs ENABLE ROW LEVEL SECURITY;

-- Alibaba Connections Policies
CREATE POLICY "Tenants can manage their own alibaba connections" ON public.alibaba_connections
  FOR ALL USING (tenant_id = auth.uid());

-- Alibaba Product Mappings Policies
CREATE POLICY "Tenants can manage their own alibaba product mappings" ON public.alibaba_product_mappings
  FOR ALL USING (tenant_id = auth.uid());

-- Alibaba Orders Policies
CREATE POLICY "Tenants can view their own alibaba orders" ON public.alibaba_orders
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can insert their own alibaba orders" ON public.alibaba_orders
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update their own alibaba orders" ON public.alibaba_orders
  FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

-- Alibaba Messages Policies
CREATE POLICY "Tenants can view their own alibaba messages" ON public.alibaba_messages
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can insert their own alibaba messages" ON public.alibaba_messages
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Tenants can update their own alibaba messages" ON public.alibaba_messages
  FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

-- Alibaba Sync Logs Policies
CREATE POLICY "Tenants can view their own alibaba sync logs" ON public.alibaba_sync_logs
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Tenants can insert their own alibaba sync logs" ON public.alibaba_sync_logs
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Alibaba Connections
CREATE OR REPLACE FUNCTION public.update_alibaba_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alibaba_connections_updated_at_trigger
BEFORE UPDATE ON public.alibaba_connections
FOR EACH ROW EXECUTE FUNCTION public.update_alibaba_connections_updated_at();

-- Alibaba Product Mappings
CREATE OR REPLACE FUNCTION public.update_alibaba_product_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alibaba_product_mappings_updated_at_trigger
BEFORE UPDATE ON public.alibaba_product_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_alibaba_product_mappings_updated_at();

-- Alibaba Orders
CREATE OR REPLACE FUNCTION public.update_alibaba_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alibaba_orders_updated_at_trigger
BEFORE UPDATE ON public.alibaba_orders
FOR EACH ROW EXECUTE FUNCTION public.update_alibaba_orders_updated_at();

-- Alibaba Messages
CREATE OR REPLACE FUNCTION public.update_alibaba_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_alibaba_messages_updated_at_trigger
BEFORE UPDATE ON public.alibaba_messages
FOR EACH ROW EXECUTE FUNCTION public.update_alibaba_messages_updated_at();

-- ============================================================================
-- HELPER VIEWS (OPTIONAL)
-- ============================================================================

-- View for active Alibaba connections with last sync info
CREATE OR REPLACE VIEW public.alibaba_connections_status AS
SELECT 
  ac.id,
  ac.tenant_id,
  ac.store_name,
  ac.store_url,
  ac.is_active,
  ac.last_sync_at,
  ac.auto_sync_enabled,
  ac.sync_frequency_minutes,
  (
    SELECT COUNT(*) 
    FROM public.alibaba_product_mappings apm 
    WHERE apm.tenant_id = ac.tenant_id
  ) AS total_products_mapped,
  (
    SELECT COUNT(*) 
    FROM public.alibaba_orders ao 
    WHERE ao.tenant_id = ac.tenant_id
  ) AS total_orders,
  (
    SELECT COUNT(*) 
    FROM public.alibaba_messages am 
    WHERE am.tenant_id = ac.tenant_id AND am.is_read = false
  ) AS unread_messages,
  (
    SELECT status 
    FROM public.alibaba_sync_logs asl 
    WHERE asl.tenant_id = ac.tenant_id 
    ORDER BY asl.started_at DESC 
    LIMIT 1
  ) AS last_sync_status
FROM public.alibaba_connections ac;

COMMENT ON VIEW public.alibaba_connections_status IS 'Provides a summary view of Alibaba connections with sync statistics';

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT ONLY)
-- ============================================================================
-- Uncomment to insert sample data for testing

/*
-- Sample Alibaba connection (replace with real tenant_id)
INSERT INTO public.alibaba_connections (
  tenant_id,
  store_url,
  store_name,
  app_key,
  app_secret_encrypted,
  is_active,
  auto_sync_enabled
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with real tenant_id
  'https://otoniq.en.alibaba.com',
  'Otoniq Global Trading',
  'test_app_key_123',
  'encrypted_secret_456', -- Should be properly encrypted
  true,
  true
);
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

