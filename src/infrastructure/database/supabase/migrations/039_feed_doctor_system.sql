-- Week 5: Feed Doctor Core - Product Analysis & Optimization System

-- 1. Feed analysis results
CREATE TABLE IF NOT EXISTS feed_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  content_score INTEGER CHECK (content_score >= 0 AND content_score <= 100),
  image_score INTEGER CHECK (image_score >= 0 AND image_score <= 100),
  pricing_score INTEGER CHECK (pricing_score >= 0 AND pricing_score <= 100),
  -- Issues found
  issues JSONB DEFAULT '[]'::jsonb,
  critical_issues_count INTEGER DEFAULT 0,
  warning_issues_count INTEGER DEFAULT 0,
  info_issues_count INTEGER DEFAULT 0,
  -- Suggestions
  suggestions JSONB DEFAULT '[]'::jsonb,
  auto_fix_available BOOLEAN DEFAULT false,
  -- AI Analysis
  ai_analysis_text TEXT,
  ai_model_used VARCHAR(100) DEFAULT 'gpt-4-turbo',
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'analyzing', 'completed', 'failed'
  applied_fixes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Optimization rules
CREATE TABLE IF NOT EXISTS optimization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'seo', 'content', 'image', 'pricing', 'category'
  severity VARCHAR(20) NOT NULL, -- 'critical', 'warning', 'info'
  rule_condition JSONB NOT NULL, -- Condition to check
  suggestion_template TEXT NOT NULL,
  auto_fix_enabled BOOLEAN DEFAULT false,
  auto_fix_action JSONB, -- Action to take for auto-fix
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bulk optimization jobs
CREATE TABLE IF NOT EXISTS bulk_optimization_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(50) NOT NULL, -- 'analyze', 'optimize', 'sync'
  filters JSONB DEFAULT '{}'::jsonb, -- Product filters
  total_products INTEGER DEFAULT 0,
  processed_products INTEGER DEFAULT 0,
  successful_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  results JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Feed sync history
CREATE TABLE IF NOT EXISTS feed_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL, -- 'shopify', 'amazon', 'trendyol', etc.
  sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'optimized'
  products_synced INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  optimizations_applied INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  sync_duration_ms INTEGER,
  error_log JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Product optimization history
CREATE TABLE IF NOT EXISTS product_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES feed_analysis(id) ON DELETE SET NULL,
  optimization_type VARCHAR(100) NOT NULL, -- 'title', 'description', 'images', 'price', 'category'
  old_value TEXT,
  new_value TEXT,
  improvement_score INTEGER,
  applied_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reverted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default optimization rules
INSERT INTO optimization_rules (rule_name, rule_type, severity, rule_condition, suggestion_template, auto_fix_enabled) VALUES
  ('Short Product Title', 'seo', 'critical', '{"field": "name", "operator": "length_lt", "value": 20}', 'Ürün başlığı çok kısa. En az 20 karakter olmalı. Marka, model ve önemli özellikleri ekleyin.', false),
  ('Long Product Title', 'seo', 'warning', '{"field": "name", "operator": "length_gt", "value": 150}', 'Ürün başlığı çok uzun. Maksimum 150 karakter olmalı.', false),
  ('Missing Description', 'content', 'critical', '{"field": "description", "operator": "is_empty"}', 'Ürün açıklaması eksik. Detaylı bir açıklama ekleyin.', false),
  ('Short Description', 'content', 'warning', '{"field": "description", "operator": "length_lt", "value": 100}', 'Ürün açıklaması çok kısa. En az 100 karakter detaylı açıklama ekleyin.', false),
  ('No Images', 'image', 'critical', '{"field": "images", "operator": "is_empty"}', 'Ürün görseli yok. En az 1 görsel ekleyin.', false),
  ('Few Images', 'image', 'warning', '{"field": "images", "operator": "count_lt", "value": 3}', 'Ürün görseli az. En az 3-5 görsel eklemeniz önerilir.', false),
  ('Low Quality Image', 'image', 'warning', '{"field": "images", "operator": "quality_lt", "value": 0.7}', 'Görsel kalitesi düşük. Daha yüksek çözünürlüklü görseller kullanın.', false),
  ('Price Not Set', 'pricing', 'critical', '{"field": "price", "operator": "is_null"}', 'Ürün fiyatı belirlenmemiş.', false),
  ('Price Too Low', 'pricing', 'warning', '{"field": "price", "operator": "lt", "value": 10}', 'Fiyat çok düşük olabilir. Pazar araştırması yapın.', false),
  ('Missing Category', 'category', 'critical', '{"field": "category_id", "operator": "is_null"}', 'Ürün kategorisi belirlenmemiş.', false),
  ('No Keywords', 'seo', 'warning', '{"field": "tags", "operator": "is_empty"}', 'SEO etiketleri eksik. Anahtar kelimeler ekleyin.', false),
  ('Missing Brand', 'content', 'warning', '{"field": "brand", "operator": "is_empty"}', 'Marka bilgisi eksik.', false)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX idx_feed_analysis_tenant ON feed_analysis(tenant_id);
CREATE INDEX idx_feed_analysis_product ON feed_analysis(product_id);
CREATE INDEX idx_feed_analysis_date ON feed_analysis(created_at);
CREATE INDEX idx_feed_analysis_score ON feed_analysis(overall_score);
CREATE INDEX idx_optimization_rules_tenant ON optimization_rules(tenant_id);
CREATE INDEX idx_optimization_rules_type ON optimization_rules(rule_type, is_active);
CREATE INDEX idx_bulk_jobs_tenant ON bulk_optimization_jobs(tenant_id, status);
CREATE INDEX idx_feed_sync_tenant ON feed_sync_history(tenant_id);
CREATE INDEX idx_product_optimization_product ON product_optimization_history(product_id);

-- RLS Policies
ALTER TABLE feed_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_optimization_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_optimization_history ENABLE ROW LEVEL SECURITY;

-- Feed analysis policies
CREATE POLICY "Users can view feed analysis in their tenant"
  ON feed_analysis FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create feed analysis"
  ON feed_analysis FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Optimization rules policies
CREATE POLICY "Users can view optimization rules in their tenant"
  ON optimization_rules FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR tenant_id IS NULL);

CREATE POLICY "Admins can manage optimization rules"
  ON optimization_rules FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Bulk jobs policies
CREATE POLICY "Users can view their bulk jobs"
  ON bulk_optimization_jobs FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Update triggers
CREATE TRIGGER update_feed_analysis_updated_at
  BEFORE UPDATE ON feed_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimization_rules_updated_at
  BEFORE UPDATE ON optimization_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_jobs_updated_at
  BEFORE UPDATE ON bulk_optimization_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get products needing analysis
CREATE OR REPLACE FUNCTION get_products_needing_analysis(
  p_tenant_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  last_analysis_date TIMESTAMP WITH TIME ZONE,
  days_since_analysis INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    fa.created_at,
    EXTRACT(DAY FROM NOW() - COALESCE(fa.created_at, p.created_at))::INTEGER
  FROM products p
  LEFT JOIN LATERAL (
    SELECT created_at
    FROM feed_analysis
    WHERE product_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) fa ON true
  WHERE p.tenant_id = p_tenant_id
    AND (fa.created_at IS NULL OR fa.created_at < NOW() - INTERVAL '7 days')
  ORDER BY fa.created_at ASC NULLS FIRST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get feed doctor statistics
CREATE OR REPLACE FUNCTION get_feed_doctor_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_products INTEGER,
  analyzed_products INTEGER,
  avg_overall_score DECIMAL,
  critical_issues INTEGER,
  products_needing_attention INTEGER,
  last_analysis_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT p.id)::INTEGER,
    COUNT(DISTINCT fa.product_id)::INTEGER,
    AVG(fa.overall_score)::DECIMAL,
    SUM(fa.critical_issues_count)::INTEGER,
    COUNT(DISTINCT CASE WHEN fa.overall_score < 70 THEN fa.product_id END)::INTEGER,
    MAX(fa.created_at)
  FROM products p
  LEFT JOIN LATERAL (
    SELECT *
    FROM feed_analysis
    WHERE product_id = p.id
    ORDER BY created_at DESC
    LIMIT 1
  ) fa ON true
  WHERE p.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to apply optimization
CREATE OR REPLACE FUNCTION apply_product_optimization(
  p_product_id UUID,
  p_optimization_type VARCHAR,
  p_new_value TEXT,
  p_analysis_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_old_value TEXT;
  v_tenant_id UUID;
BEGIN
  -- Get current value and tenant_id
  SELECT 
    CASE p_optimization_type
      WHEN 'title' THEN name
      WHEN 'description' THEN description
      WHEN 'price' THEN price::TEXT
      ELSE NULL
    END,
    tenant_id
  INTO v_old_value, v_tenant_id
  FROM products
  WHERE id = p_product_id;

  -- Update product
  CASE p_optimization_type
    WHEN 'title' THEN
      UPDATE products SET name = p_new_value WHERE id = p_product_id;
    WHEN 'description' THEN
      UPDATE products SET description = p_new_value WHERE id = p_product_id;
    WHEN 'price' THEN
      UPDATE products SET price = p_new_value::DECIMAL WHERE id = p_product_id;
  END CASE;

  -- Log optimization
  INSERT INTO product_optimization_history (
    tenant_id, product_id, analysis_id, optimization_type,
    old_value, new_value, applied_by
  ) VALUES (
    v_tenant_id, p_product_id, p_analysis_id, p_optimization_type,
    v_old_value, p_new_value, auth.uid()
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

