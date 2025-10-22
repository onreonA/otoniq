-- ============================================================================
-- OTONIQ.AI - Feed Doktoru System
-- Migration 083: AI-powered product quality analysis and optimization
-- ============================================================================

-- ============================================================================
-- FEED_ANALYSIS TABLE
-- Stores AI analysis results for products
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Scores (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  title_score INTEGER CHECK (title_score >= 0 AND title_score <= 100),
  description_score INTEGER CHECK (description_score >= 0 AND description_score <= 100),
  image_score INTEGER CHECK (image_score >= 0 AND image_score <= 100),
  category_score INTEGER CHECK (category_score >= 0 AND category_score <= 100),
  price_score INTEGER CHECK (price_score >= 0 AND price_score <= 100),
  
  -- Analysis data
  analysis_data JSONB DEFAULT '{}'::jsonb, -- Detailed analysis results
  issues JSONB DEFAULT '[]'::jsonb, -- [{type, severity, message, field}]
  suggestions JSONB DEFAULT '[]'::jsonb, -- [{type, message, autoFixable, fixAction}]
  
  -- Optimizations
  optimized_title TEXT,
  optimized_description TEXT,
  optimized_keywords TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Review
  is_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Timestamps
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one analysis per product per tenant
  UNIQUE(tenant_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feed_analysis_tenant_id ON feed_analysis(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_product_id ON feed_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_status ON feed_analysis(status);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_overall_score ON feed_analysis(overall_score);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_analyzed_at ON feed_analysis(analyzed_at DESC);

-- Comments
COMMENT ON TABLE feed_analysis IS 'AI-powered product quality analysis results';
COMMENT ON COLUMN feed_analysis.overall_score IS 'Overall quality score (0-100)';
COMMENT ON COLUMN feed_analysis.issues IS 'Array of detected issues with severity levels';
COMMENT ON COLUMN feed_analysis.suggestions IS 'Array of optimization suggestions';

-- ============================================================================
-- FEED_OPTIMIZATION_RULES TABLE
-- Configurable rules for product quality analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_optimization_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global rule
  
  -- Rule definition
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  rule_category TEXT NOT NULL CHECK (rule_category IN ('title', 'description', 'image', 'category', 'price', 'general')),
  channel_type TEXT, -- NULL = applies to all channels
  
  -- Rule type and config
  rule_type TEXT NOT NULL CHECK (rule_type IN ('length', 'keyword', 'format', 'regex', 'ai_check', 'custom')),
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- Rule-specific configuration
  
  -- Scoring
  weight DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  penalty_points INTEGER NOT NULL DEFAULT 10 CHECK (penalty_points >= 0 AND penalty_points <= 100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  -- Auto-fix
  is_auto_fixable BOOLEAN DEFAULT false,
  auto_fix_template TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feed_rules_tenant_id ON feed_optimization_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feed_rules_category ON feed_optimization_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_feed_rules_channel ON feed_optimization_rules(channel_type);
CREATE INDEX IF NOT EXISTS idx_feed_rules_active ON feed_optimization_rules(is_active);

-- Comments
COMMENT ON TABLE feed_optimization_rules IS 'Configurable rules for product quality analysis';
COMMENT ON COLUMN feed_optimization_rules.tenant_id IS 'NULL for global rules, UUID for tenant-specific rules';
COMMENT ON COLUMN feed_optimization_rules.rule_config IS 'Rule-specific configuration (e.g., min_length, max_length, regex_pattern)';
COMMENT ON COLUMN feed_optimization_rules.weight IS 'Rule weight in overall score calculation (0-1)';

-- ============================================================================
-- FEED_CHANNEL_CONTENT TABLE
-- Multi-channel content variations for products
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_channel_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  feed_analysis_id UUID REFERENCES feed_analysis(id) ON DELETE SET NULL,
  
  -- Channel info
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'shopify', 'odoo', 'trendyol', 'amazon', 'hepsiburada', 
    'n11', 'etsy', 'facebook', 'instagram', 'google_shopping'
  )),
  channel_id TEXT, -- External channel ID
  
  -- Channel-specific content
  channel_title TEXT NOT NULL,
  channel_description TEXT,
  channel_category TEXT,
  channel_price DECIMAL(10, 2),
  channel_currency TEXT DEFAULT 'TRY',
  channel_metadata JSONB DEFAULT '{}'::jsonb,
  channel_tags TEXT[] DEFAULT '{}',
  channel_attributes JSONB DEFAULT '{}'::jsonb,
  
  -- SEO
  seo_keywords TEXT[] DEFAULT '{}',
  seo_meta_title TEXT,
  seo_meta_description TEXT,
  
  -- Sync status
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  
  -- External references
  external_product_id TEXT,
  external_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one content per product per channel per tenant
  UNIQUE(tenant_id, product_id, channel_type)
);

-- Indexes
CREATE INDEX idx_feed_channel_tenant_id ON feed_channel_content(tenant_id);
CREATE INDEX idx_feed_channel_product_id ON feed_channel_content(product_id);
CREATE INDEX idx_feed_channel_type ON feed_channel_content(channel_type);
CREATE INDEX idx_feed_channel_sync_status ON feed_channel_content(sync_status);
CREATE INDEX idx_feed_channel_active ON feed_channel_content(is_active);

-- Comments
COMMENT ON TABLE feed_channel_content IS 'Multi-channel content variations for products';
COMMENT ON COLUMN feed_channel_content.channel_type IS 'Target marketplace or platform';
COMMENT ON COLUMN feed_channel_content.channel_metadata IS 'Channel-specific metadata and settings';
COMMENT ON COLUMN feed_channel_content.sync_status IS 'Current synchronization status with external channel';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE feed_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_optimization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_channel_content ENABLE ROW LEVEL SECURITY;

-- Feed Analysis Policies
CREATE POLICY "Users can view their tenant's feed analyses"
  ON feed_analysis FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feed analyses for their tenant"
  ON feed_analysis FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's feed analyses"
  ON feed_analysis FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their tenant's feed analyses"
  ON feed_analysis FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Super Admin: Full access
CREATE POLICY "Super admins can manage all feed analyses"
  ON feed_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Feed Optimization Rules Policies
CREATE POLICY "Users can view global and their tenant's rules"
  ON feed_optimization_rules FOR SELECT
  USING (
    tenant_id IS NULL OR 
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rules for their tenant"
  ON feed_optimization_rules FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's rules"
  ON feed_optimization_rules FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their tenant's rules"
  ON feed_optimization_rules FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Super Admin: Full access
CREATE POLICY "Super admins can manage all optimization rules"
  ON feed_optimization_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Feed Channel Content Policies
CREATE POLICY "Users can view their tenant's channel content"
  ON feed_channel_content FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert channel content for their tenant"
  ON feed_channel_content FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their tenant's channel content"
  ON feed_channel_content FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their tenant's channel content"
  ON feed_channel_content FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Super Admin: Full access
CREATE POLICY "Super admins can manage all channel content"
  ON feed_channel_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_feed_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feed_analysis_updated_at
  BEFORE UPDATE ON feed_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_analysis_timestamp();

CREATE TRIGGER trigger_feed_rules_updated_at
  BEFORE UPDATE ON feed_optimization_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_analysis_timestamp();

CREATE TRIGGER trigger_feed_channel_updated_at
  BEFORE UPDATE ON feed_channel_content
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_analysis_timestamp();

-- ============================================================================
-- SEED DATA: Default Optimization Rules
-- ============================================================================

-- Title Rules
INSERT INTO feed_optimization_rules (tenant_id, rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable) VALUES
  (NULL, 'Title Length Check', 'Title should be between 30-80 characters', 'title', 'length', '{"min_length": 30, "max_length": 80, "optimal_min": 40, "optimal_max": 60}'::jsonb, 1.0, 15, 'warning', false),
  (NULL, 'Title Special Characters', 'Avoid excessive special characters in title', 'title', 'regex', '{"pattern": "[!@#$%^&*()]{3,}", "message": "Too many special characters"}'::jsonb, 0.8, 10, 'warning', true),
  (NULL, 'Title Capitalization', 'Title should use proper title case', 'title', 'format', '{"check_type": "title_case"}'::jsonb, 0.5, 5, 'info', true);

-- Description Rules
INSERT INTO feed_optimization_rules (tenant_id, rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable) VALUES
  (NULL, 'Description Length Check', 'Description should be at least 150 characters', 'description', 'length', '{"min_length": 150, "optimal_min": 300}'::jsonb, 1.0, 40, 'error', false),
  (NULL, 'Description Structure', 'Description should have paragraph structure', 'description', 'format', '{"check_type": "paragraph_structure", "min_paragraphs": 2}'::jsonb, 0.7, 10, 'info', true);

-- Image Rules
INSERT INTO feed_optimization_rules (tenant_id, rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable) VALUES
  (NULL, 'Image Count Check', 'Product should have at least 3 images', 'image', 'custom', '{"min_images": 3, "optimal_images": 5}'::jsonb, 1.0, 20, 'warning', false),
  (NULL, 'Image Quality Check', 'Images should be high resolution', 'image', 'custom', '{"min_width": 800, "min_height": 800}'::jsonb, 0.8, 15, 'warning', false);

-- Category Rules
INSERT INTO feed_optimization_rules (tenant_id, rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable) VALUES
  (NULL, 'Category Assignment', 'Product must be assigned to a category', 'category', 'custom', '{"required": true}'::jsonb, 1.0, 30, 'error', false);

-- Price Rules
INSERT INTO feed_optimization_rules (tenant_id, rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable) VALUES
  (NULL, 'Price Validity', 'Product must have a valid price', 'price', 'custom', '{"min_price": 0.01}'::jsonb, 1.0, 50, 'critical', false);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- Feed Analysis Summary View
CREATE OR REPLACE VIEW feed_analysis_summary AS
SELECT 
  fa.tenant_id,
  COUNT(DISTINCT fa.product_id) as total_analyzed,
  AVG(fa.overall_score) as avg_overall_score,
  AVG(fa.title_score) as avg_title_score,
  AVG(fa.description_score) as avg_description_score,
  AVG(fa.image_score) as avg_image_score,
  AVG(fa.category_score) as avg_category_score,
  AVG(fa.price_score) as avg_price_score,
  COUNT(*) FILTER (WHERE fa.overall_score < 50) as low_quality_count,
  COUNT(*) FILTER (WHERE fa.overall_score >= 50 AND fa.overall_score <= 75) as medium_quality_count,
  COUNT(*) FILTER (WHERE fa.overall_score > 75) as high_quality_count,
  COUNT(*) FILTER (WHERE fa.status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE fa.status = 'failed') as failed_count
FROM feed_analysis fa
GROUP BY fa.tenant_id;

COMMENT ON VIEW feed_analysis_summary IS 'Aggregated feed analysis statistics per tenant';

-- ============================================================================
-- COMPLETE
-- ============================================================================

