-- Week 6: Visual Automation - Canva & Image Processing System

-- 1. Design templates
CREATE TABLE IF NOT EXISTS design_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL, -- 'product_card', 'social_post', 'banner', 'story', 'ad'
  platform VARCHAR(50), -- 'instagram', 'facebook', 'twitter', 'pinterest', 'shopify'
  dimensions JSONB DEFAULT '{}'::jsonb, -- {"width": 1080, "height": 1080}
  canva_design_id VARCHAR(255),
  canva_template_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Generated visuals
CREATE TABLE IF NOT EXISTS generated_visuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  template_id UUID REFERENCES design_templates(id) ON DELETE SET NULL,
  generation_type VARCHAR(100) NOT NULL, -- 'canva', 'ai_generated', 'enhanced', 'resized'
  source_image_url TEXT,
  generated_image_url TEXT NOT NULL,
  canva_design_id VARCHAR(255),
  canva_export_url TEXT,
  -- Image properties
  width INTEGER,
  height INTEGER,
  file_size_kb INTEGER,
  format VARCHAR(10), -- 'jpg', 'png', 'webp'
  quality_score DECIMAL(3,2),
  -- AI enhancements applied
  enhancements JSONB DEFAULT '[]'::jsonb, -- ['background_removal', 'upscale', 'color_correction']
  -- Generation details
  generation_params JSONB DEFAULT '{}'::jsonb,
  generation_time_ms INTEGER,
  ai_model_used VARCHAR(100),
  cost_credits DECIMAL(8,4),
  -- Status
  status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  -- Usage
  is_published BOOLEAN DEFAULT false,
  published_to JSONB DEFAULT '[]'::jsonb, -- ['shopify', 'instagram', 'facebook']
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Batch visual jobs
CREATE TABLE IF NOT EXISTS batch_visual_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  job_name VARCHAR(255) NOT NULL,
  job_type VARCHAR(100) NOT NULL, -- 'bulk_generate', 'bulk_enhance', 'bulk_resize', 'bulk_watermark'
  template_id UUID REFERENCES design_templates(id) ON DELETE SET NULL,
  product_filters JSONB DEFAULT '{}'::jsonb,
  generation_settings JSONB DEFAULT '{}'::jsonb,
  -- Progress
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  successful_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_log JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Image optimization history
CREATE TABLE IF NOT EXISTS image_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  optimized_image_url TEXT NOT NULL,
  optimization_type VARCHAR(100) NOT NULL, -- 'compress', 'resize', 'format_convert', 'enhance', 'remove_bg'
  -- Before/After metrics
  original_size_kb INTEGER,
  optimized_size_kb INTEGER,
  size_reduction_pct DECIMAL(5,2),
  original_dimensions JSONB, -- {"width": 3000, "height": 2000}
  optimized_dimensions JSONB,
  -- Quality metrics
  quality_score_before DECIMAL(3,2),
  quality_score_after DECIMAL(3,2),
  -- Processing details
  processing_time_ms INTEGER,
  tool_used VARCHAR(100), -- 'sharp', 'imagemagick', 'canva', 'remove.bg'
  settings_used JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Canva integration settings
CREATE TABLE IF NOT EXISTS canva_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  api_key TEXT,
  brand_kit_id VARCHAR(255),
  team_id VARCHAR(255),
  default_template_folder VARCHAR(255),
  auto_publish BOOLEAN DEFAULT false,
  auto_publish_platforms JSONB DEFAULT '[]'::jsonb,
  watermark_enabled BOOLEAN DEFAULT false,
  watermark_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_design_templates_tenant ON design_templates(tenant_id);
CREATE INDEX idx_design_templates_type ON design_templates(template_type, platform);
CREATE INDEX idx_generated_visuals_tenant ON generated_visuals(tenant_id);
CREATE INDEX idx_generated_visuals_product ON generated_visuals(product_id);
CREATE INDEX idx_generated_visuals_template ON generated_visuals(template_id);
CREATE INDEX idx_generated_visuals_status ON generated_visuals(status, created_at);
CREATE INDEX idx_batch_visual_jobs_tenant ON batch_visual_jobs(tenant_id, status);
CREATE INDEX idx_image_optimization_product ON image_optimization_history(product_id);
CREATE INDEX idx_canva_integration_tenant ON canva_integration(tenant_id);

-- RLS Policies
ALTER TABLE design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_visuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_visual_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_optimization_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE canva_integration ENABLE ROW LEVEL SECURITY;

-- Design templates policies
CREATE POLICY "Users can view templates in their tenant or public"
  ON design_templates FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR is_public = true
  );

CREATE POLICY "Users can manage their tenant templates"
  ON design_templates FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Generated visuals policies
CREATE POLICY "Users can view visuals in their tenant"
  ON generated_visuals FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create visuals"
  ON generated_visuals FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Batch jobs policies
CREATE POLICY "Users can view their batch jobs"
  ON batch_visual_jobs FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Canva integration policies
CREATE POLICY "Users can view their canva settings"
  ON canva_integration FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage canva settings"
  ON canva_integration FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Update triggers
CREATE TRIGGER update_design_templates_updated_at
  BEFORE UPDATE ON design_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_visuals_updated_at
  BEFORE UPDATE ON generated_visuals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_visual_jobs_updated_at
  BEFORE UPDATE ON batch_visual_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canva_integration_updated_at
  BEFORE UPDATE ON canva_integration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get visual generation stats
CREATE OR REPLACE FUNCTION get_visual_generation_stats(p_tenant_id UUID)
RETURNS TABLE (
  total_visuals INTEGER,
  visuals_this_month INTEGER,
  total_templates INTEGER,
  avg_generation_time_ms INTEGER,
  total_cost_credits DECIMAL,
  popular_template_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW()))::INTEGER,
    (SELECT COUNT(*)::INTEGER FROM design_templates WHERE tenant_id = p_tenant_id),
    AVG(generation_time_ms)::INTEGER,
    SUM(cost_credits)::DECIMAL,
    (
      SELECT template_type 
      FROM design_templates dt
      JOIN generated_visuals gv ON dt.id = gv.template_id
      WHERE dt.tenant_id = p_tenant_id
      GROUP BY template_type
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  FROM generated_visuals
  WHERE tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get batch job progress
CREATE OR REPLACE FUNCTION get_batch_job_progress(p_job_id UUID)
RETURNS TABLE (
  job_id UUID,
  job_name VARCHAR,
  status VARCHAR,
  progress_pct DECIMAL,
  processed_items INTEGER,
  total_items INTEGER,
  estimated_time_remaining_sec INTEGER
) AS $$
DECLARE
  v_job RECORD;
  v_avg_time_per_item DECIMAL;
BEGIN
  SELECT * INTO v_job FROM batch_visual_jobs WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate average time per item
  IF v_job.processed_items > 0 AND v_job.started_at IS NOT NULL THEN
    v_avg_time_per_item := EXTRACT(EPOCH FROM (NOW() - v_job.started_at)) / v_job.processed_items;
  ELSE
    v_avg_time_per_item := 0;
  END IF;

  RETURN QUERY
  SELECT 
    v_job.id,
    v_job.job_name,
    v_job.status,
    CASE 
      WHEN v_job.total_items > 0 THEN (v_job.processed_items::DECIMAL / v_job.total_items * 100)
      ELSE 0
    END,
    v_job.processed_items,
    v_job.total_items,
    CASE 
      WHEN v_job.status = 'running' AND v_avg_time_per_item > 0 THEN
        ((v_job.total_items - v_job.processed_items) * v_avg_time_per_item)::INTEGER
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default templates
INSERT INTO design_templates (template_name, template_type, platform, dimensions, is_public, tags) VALUES
  ('Instagram Post - Product Showcase', 'product_card', 'instagram', '{"width": 1080, "height": 1080}', true, '["instagram", "square", "product"]'),
  ('Instagram Story - Product Feature', 'story', 'instagram', '{"width": 1080, "height": 1920}', true, '["instagram", "story", "vertical"]'),
  ('Facebook Ad - Product Promo', 'ad', 'facebook', '{"width": 1200, "height": 628}', true, '["facebook", "ad", "horizontal"]'),
  ('Twitter Post - Product Launch', 'social_post', 'twitter', '{"width": 1200, "height": 675}', true, '["twitter", "announcement"]'),
  ('Pinterest Pin - Product Display', 'product_card', 'pinterest', '{"width": 1000, "height": 1500}', true, '["pinterest", "vertical", "product"]'),
  ('Shopify Banner - Homepage Hero', 'banner', 'shopify', '{"width": 1920, "height": 600}', true, '["shopify", "banner", "hero"]')
ON CONFLICT DO NOTHING;

