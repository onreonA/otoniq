-- Migration: 027_feed_doctor.sql
-- Description: Feed Doctor AI-powered product quality analysis system

-- Create feed_analysis table
-- Stores AI analysis results for products with quality scores
CREATE TABLE IF NOT EXISTS feed_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Overall quality score (0-100)
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Individual component scores (0-100)
    title_score INTEGER CHECK (title_score >= 0 AND title_score <= 100),
    description_score INTEGER CHECK (description_score >= 0 AND description_score <= 100),
    image_score INTEGER CHECK (image_score >= 0 AND image_score <= 100),
    category_score INTEGER CHECK (category_score >= 0 AND category_score <= 100),
    price_score INTEGER CHECK (price_score >= 0 AND price_score <= 100),
    
    -- Detailed analysis results
    analysis_data JSONB DEFAULT '{}'::jsonb, -- Full AI analysis with issues and suggestions
    
    -- Issues found
    issues JSONB DEFAULT '[]'::jsonb, -- Array of issues: [{type, severity, message}]
    
    -- Suggestions for improvement
    suggestions JSONB DEFAULT '[]'::jsonb, -- Array of suggestions: [{type, message, auto_fixable}]
    
    -- AI-generated optimizations
    optimized_title TEXT,
    optimized_description TEXT,
    optimized_keywords TEXT[], -- SEO keywords
    
    -- Analysis metadata
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_version TEXT DEFAULT '1.0', -- Track analysis algorithm version
    ai_model TEXT DEFAULT 'gpt-4', -- AI model used
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Approval workflow
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one analysis per product (replace on re-analysis)
    UNIQUE(tenant_id, product_id)
);

-- Create channel_content table
-- Stores channel-specific optimized content for multi-marketplace sync
CREATE TABLE IF NOT EXISTS channel_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    feed_analysis_id UUID REFERENCES feed_analysis(id) ON DELETE CASCADE,
    
    -- Channel identification
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'shopify', 'odoo', 'trendyol', 'amazon', 'hepsiburada', 
        'n11', 'etsy', 'facebook', 'instagram', 'google_shopping'
    )),
    channel_id TEXT, -- External channel account/store ID
    
    -- Channel-specific optimized content
    channel_title TEXT NOT NULL,
    channel_description TEXT,
    channel_category TEXT,
    channel_price NUMERIC(12, 2),
    channel_currency TEXT DEFAULT 'TRY',
    
    -- Channel-specific metadata
    channel_metadata JSONB DEFAULT '{}'::jsonb, -- Platform-specific fields
    channel_tags TEXT[], -- Platform-specific tags
    channel_attributes JSONB, -- Size, color, material, etc.
    
    -- SEO for channel
    seo_keywords TEXT[],
    seo_meta_title TEXT,
    seo_meta_description TEXT,
    
    -- Sync status
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN (
        'pending', 'syncing', 'synced', 'failed', 'conflict'
    )),
    last_synced_at TIMESTAMPTZ,
    sync_error TEXT,
    external_product_id TEXT, -- ID in external channel
    external_url TEXT, -- URL to product in channel
    
    -- Version control
    content_version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One content per product per channel
    UNIQUE(tenant_id, product_id, channel_type)
);

-- Create feed_optimization_rules table
-- Stores channel-specific quality rules and scoring logic
CREATE TABLE IF NOT EXISTS feed_optimization_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL = global rules
    
    -- Rule identification
    rule_name TEXT NOT NULL,
    rule_description TEXT,
    rule_category TEXT NOT NULL CHECK (rule_category IN (
        'title', 'description', 'image', 'category', 'price', 'general'
    )),
    
    -- Channel scope
    channel_type TEXT, -- NULL = applies to all channels
    
    -- Rule logic
    rule_type TEXT NOT NULL CHECK (rule_type IN (
        'length', 'keyword', 'format', 'regex', 'ai_check', 'custom'
    )),
    rule_config JSONB NOT NULL, -- Configuration for the rule
    
    -- Scoring
    weight INTEGER DEFAULT 10, -- Weight in overall score (1-100)
    penalty_points INTEGER DEFAULT 10, -- Points deducted if rule fails
    
    -- Rule status
    is_active BOOLEAN DEFAULT TRUE,
    severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Auto-fix capability
    is_auto_fixable BOOLEAN DEFAULT FALSE,
    auto_fix_template TEXT, -- Template for automatic fixes
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feed_analysis_history table
-- Track analysis history for trend analysis
CREATE TABLE IF NOT EXISTS feed_analysis_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    feed_analysis_id UUID REFERENCES feed_analysis(id) ON DELETE CASCADE,
    
    -- Historical scores
    overall_score INTEGER NOT NULL,
    title_score INTEGER,
    description_score INTEGER,
    image_score INTEGER,
    category_score INTEGER,
    price_score INTEGER,
    
    -- Changes made
    changes_applied JSONB DEFAULT '[]'::jsonb, -- [{field, old_value, new_value}]
    
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feed_analysis_tenant_product ON feed_analysis(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_overall_score ON feed_analysis(overall_score);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_status ON feed_analysis(status);
CREATE INDEX IF NOT EXISTS idx_feed_analysis_analyzed_at ON feed_analysis(analyzed_at DESC);

CREATE INDEX IF NOT EXISTS idx_channel_content_tenant_product ON channel_content(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_channel_content_channel_type ON channel_content(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_content_sync_status ON channel_content(sync_status);
CREATE INDEX IF NOT EXISTS idx_channel_content_external_id ON channel_content(external_product_id);

CREATE INDEX IF NOT EXISTS idx_feed_rules_category ON feed_optimization_rules(rule_category);
CREATE INDEX IF NOT EXISTS idx_feed_rules_channel ON feed_optimization_rules(channel_type);
CREATE INDEX IF NOT EXISTS idx_feed_rules_active ON feed_optimization_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_feed_history_product ON feed_analysis_history(product_id, analyzed_at DESC);

-- Insert default global optimization rules
INSERT INTO feed_optimization_rules (rule_name, rule_description, rule_category, rule_type, rule_config, weight, penalty_points, severity, is_auto_fixable, auto_fix_template) VALUES
-- Title rules
('Title Length - Optimal', 'Title should be between 30-60 characters for best SEO', 'title', 'length', '{"min": 30, "max": 60, "optimal": 50}'::jsonb, 15, 15, 'warning', FALSE, NULL),
('Title Capitalization', 'Title should have proper capitalization (title case)', 'title', 'format', '{"type": "title_case"}'::jsonb, 5, 5, 'info', TRUE, NULL),
('Title Contains Keywords', 'Title should contain at least 2-3 relevant keywords', 'title', 'keyword', '{"min_keywords": 2}'::jsonb, 20, 20, 'error', FALSE, NULL),
('Title No Special Chars', 'Title should not contain excessive special characters', 'title', 'regex', '{"pattern": "[!@#$%^&*()]{3,}", "should_not_match": true}'::jsonb, 10, 10, 'warning', TRUE, NULL),

-- Description rules
('Description Length - Optimal', 'Description should be at least 150 characters', 'description', 'length', '{"min": 150, "max": 5000}'::jsonb, 15, 15, 'warning', FALSE, NULL),
('Description Has Paragraphs', 'Description should be well-structured with paragraphs', 'description', 'format', '{"type": "has_paragraphs"}'::jsonb, 10, 10, 'info', TRUE, NULL),
('Description Contains Benefits', 'Description should highlight product benefits', 'description', 'ai_check', '{"check_type": "benefits"}'::jsonb, 20, 20, 'warning', FALSE, NULL),
('Description SEO Keywords', 'Description should contain SEO-friendly keywords', 'description', 'keyword', '{"min_keywords": 5}'::jsonb, 15, 15, 'warning', FALSE, NULL),

-- Image rules
('Image Resolution', 'Images should be high resolution (min 800x800)', 'image', 'custom', '{"min_width": 800, "min_height": 800}'::jsonb, 20, 20, 'error', FALSE, NULL),
('Image Format', 'Images should be in modern formats (WebP, JPEG, PNG)', 'image', 'format', '{"allowed_formats": ["webp", "jpeg", "jpg", "png"]}'::jsonb, 10, 10, 'warning', TRUE, NULL),
('Multiple Images', 'Product should have at least 3 high-quality images', 'image', 'custom', '{"min_count": 3}'::jsonb, 15, 15, 'warning', FALSE, NULL),

-- Category rules
('Category Depth', 'Product should be in a specific category (not root)', 'category', 'custom', '{"min_depth": 2}'::jsonb, 15, 15, 'error', FALSE, NULL),
('Category Relevance', 'Category should be relevant to product', 'category', 'ai_check', '{"check_type": "relevance"}'::jsonb, 20, 20, 'critical', FALSE, NULL),

-- Price rules
('Price Not Zero', 'Price should be greater than zero', 'price', 'custom', '{"min": 0.01}'::jsonb, 25, 25, 'critical', FALSE, NULL),
('Price Competitive', 'Price should be competitive in market', 'price', 'ai_check', '{"check_type": "market_price"}'::jsonb, 10, 10, 'info', FALSE, NULL),
('Price Has Decimals', 'Price should include decimal points for accuracy', 'price', 'format', '{"has_decimals": true}'::jsonb, 5, 5, 'info', TRUE, NULL);

-- Enable RLS
ALTER TABLE feed_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_optimization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_analysis_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feed_analysis
CREATE POLICY "Users can view their tenant's feed analysis"
    ON feed_analysis FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their tenant's feed analysis"
    ON feed_analysis FOR INSERT
    WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their tenant's feed analysis"
    ON feed_analysis FOR UPDATE
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for channel_content
CREATE POLICY "Users can view their tenant's channel content"
    ON channel_content FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can manage their tenant's channel content"
    ON channel_content FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- RLS Policies for feed_optimization_rules
CREATE POLICY "Users can view optimization rules"
    ON feed_optimization_rules FOR SELECT
    USING (tenant_id IS NULL OR tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Admins can manage optimization rules"
    ON feed_optimization_rules FOR ALL
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- RLS Policies for feed_analysis_history
CREATE POLICY "Users can view their tenant's analysis history"
    ON feed_analysis_history FOR SELECT
    USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- Create function to update analysis timestamps
CREATE OR REPLACE FUNCTION update_feed_analysis_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feed_analysis_updated_at
    BEFORE UPDATE ON feed_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_feed_analysis_timestamp();

CREATE TRIGGER channel_content_updated_at
    BEFORE UPDATE ON channel_content
    FOR EACH ROW
    EXECUTE FUNCTION update_feed_analysis_timestamp();

