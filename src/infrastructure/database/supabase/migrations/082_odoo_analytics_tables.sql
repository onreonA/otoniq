-- 082_odoo_analytics_tables.sql
-- Odoo entegrasyonu için analitik tabloları

-- Senkronizasyon geçmişi tablosu
CREATE TABLE IF NOT EXISTS public.odoo_sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'products', 'prices', 'both'
    sync_status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    total_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    error_message TEXT,
    sync_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ürün eşleştirme istatistikleri
CREATE TABLE IF NOT EXISTS public.odoo_product_matching (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    odoo_product_id INTEGER NOT NULL,
    odoo_product_name VARCHAR(500),
    odoo_sku VARCHAR(100),
    otoniq_product_id UUID,
    otoniq_product_name VARCHAR(500),
    otoniq_sku VARCHAR(100),
    match_type VARCHAR(50), -- 'perfect', 'sku', 'name_similarity', 'manual', 'no_match'
    confidence_score DECIMAL(5,2), -- 0-100
    is_imported BOOLEAN DEFAULT FALSE,
    matched_at TIMESTAMPTZ,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hata logları tablosu
CREATE TABLE IF NOT EXISTS public.odoo_error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    error_type VARCHAR(100) NOT NULL, -- 'connection', 'auth', 'data_format', 'timeout'
    error_message TEXT NOT NULL,
    error_details JSONB,
    sync_id UUID REFERENCES public.odoo_sync_history(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    is_resolved BOOLEAN DEFAULT FALSE
);

-- Performans metrikleri tablosu
CREATE TABLE IF NOT EXISTS public.odoo_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    avg_response_time DECIMAL(8,3), -- saniye
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    data_transfer_mb DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, metric_date)
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_odoo_sync_history_tenant_id ON public.odoo_sync_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odoo_sync_history_started_at ON public.odoo_sync_history(started_at);
CREATE INDEX IF NOT EXISTS idx_odoo_sync_history_status ON public.odoo_sync_history(sync_status);

CREATE INDEX IF NOT EXISTS idx_odoo_product_matching_tenant_id ON public.odoo_product_matching(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odoo_product_matching_odoo_id ON public.odoo_product_matching(odoo_product_id);
CREATE INDEX IF NOT EXISTS idx_odoo_product_matching_type ON public.odoo_product_matching(match_type);

CREATE INDEX IF NOT EXISTS idx_odoo_error_logs_tenant_id ON public.odoo_error_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odoo_error_logs_type ON public.odoo_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_odoo_error_logs_occurred_at ON public.odoo_error_logs(occurred_at);

CREATE INDEX IF NOT EXISTS idx_odoo_performance_tenant_id ON public.odoo_performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odoo_performance_date ON public.odoo_performance_metrics(metric_date);

-- RLS Policies
ALTER TABLE public.odoo_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odoo_product_matching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odoo_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odoo_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Sync History Policies
CREATE POLICY "Users can view their tenant sync history" ON public.odoo_sync_history
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert sync history for their tenant" ON public.odoo_sync_history
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Product Matching Policies
CREATE POLICY "Users can view their tenant product matching" ON public.odoo_product_matching
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert product matching for their tenant" ON public.odoo_product_matching
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can update product matching for their tenant" ON public.odoo_product_matching
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Error Logs Policies
CREATE POLICY "Users can view their tenant error logs" ON public.odoo_error_logs
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert error logs for their tenant" ON public.odoo_error_logs
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Performance Metrics Policies
CREATE POLICY "Users can view their tenant performance metrics" ON public.odoo_performance_metrics
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert performance metrics for their tenant" ON public.odoo_performance_metrics
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM public.tenants 
            WHERE id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
        )
    );

-- Analytics View
CREATE OR REPLACE VIEW public.odoo_analytics_summary AS
SELECT 
    t.id as tenant_id,
    t.company_name,
    COUNT(DISTINCT sh.id) as total_syncs,
    COUNT(DISTINCT CASE WHEN sh.sync_status = 'success' THEN sh.id END) as successful_syncs,
    COUNT(DISTINCT CASE WHEN sh.sync_status = 'failed' THEN sh.id END) as failed_syncs,
    COUNT(DISTINCT pm.id) as total_products,
    COUNT(DISTINCT CASE WHEN pm.match_type != 'no_match' THEN pm.id END) as matched_products,
    COUNT(DISTINCT CASE WHEN pm.is_imported = true THEN pm.id END) as imported_products,
    AVG(sh.duration_seconds) as avg_sync_time,
    COUNT(DISTINCT el.id) as total_errors,
    COUNT(DISTINCT CASE WHEN el.error_type = 'connection' THEN el.id END) as connection_errors,
    COUNT(DISTINCT CASE WHEN el.error_type = 'auth' THEN el.id END) as auth_errors,
    COUNT(DISTINCT CASE WHEN el.error_type = 'data_format' THEN el.id END) as data_format_errors,
    COUNT(DISTINCT CASE WHEN el.error_type = 'timeout' THEN el.id END) as timeout_errors
FROM public.tenants t
LEFT JOIN public.odoo_sync_history sh ON t.id = sh.tenant_id
LEFT JOIN public.odoo_product_matching pm ON t.id = pm.tenant_id
LEFT JOIN public.odoo_error_logs el ON t.id = el.tenant_id
GROUP BY t.id, t.company_name;

COMMENT ON TABLE public.odoo_sync_history IS 'Odoo senkronizasyon geçmişi ve istatistikleri';
COMMENT ON TABLE public.odoo_product_matching IS 'Odoo ürün eşleştirme kayıtları';
COMMENT ON TABLE public.odoo_error_logs IS 'Odoo entegrasyon hata logları';
COMMENT ON TABLE public.odoo_performance_metrics IS 'Odoo entegrasyon performans metrikleri';
COMMENT ON VIEW public.odoo_analytics_summary IS 'Odoo entegrasyon analitik özeti';
