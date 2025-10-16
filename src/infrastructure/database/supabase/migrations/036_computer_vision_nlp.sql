-- Week 12: Advanced AI & ML - Computer Vision & NLP

-- Enable pgvector extension for image embeddings (optional, comment out if not available)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Image analysis results
CREATE TABLE IF NOT EXISTS image_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis_type VARCHAR(50) NOT NULL, -- 'quality', 'content', 'similarity', 'moderation'
  -- Object Detection
  detected_objects JSONB DEFAULT '[]'::jsonb, -- [{"label": "shoe", "confidence": 0.95, "bbox": [x,y,w,h]}]
  object_count INTEGER DEFAULT 0,
  -- Image Quality
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  resolution_width INTEGER,
  resolution_height INTEGER,
  file_size_kb INTEGER,
  is_blurry BOOLEAN DEFAULT false,
  blur_score DECIMAL(3,2),
  brightness_score DECIMAL(3,2),
  contrast_score DECIMAL(3,2),
  -- Content Analysis
  dominant_colors JSONB DEFAULT '[]'::jsonb, -- ["#FF5733", "#33FF57"]
  color_palette JSONB DEFAULT '[]'::jsonb,
  background_type VARCHAR(50), -- 'white', 'transparent', 'complex', 'studio'
  has_text BOOLEAN DEFAULT false,
  text_content TEXT,
  -- AI Tags & Labels
  ai_tags JSONB DEFAULT '[]'::jsonb, -- AI-generated tags
  categories JSONB DEFAULT '[]'::jsonb,
  style_tags JSONB DEFAULT '[]'::jsonb, -- 'modern', 'vintage', 'minimal'
  -- Moderation
  is_safe BOOLEAN DEFAULT true,
  moderation_labels JSONB DEFAULT '[]'::jsonb,
  -- Similarity (stored as JSONB array instead of vector for compatibility)
  image_embedding JSONB, -- Store as JSON array: [0.1, 0.2, ...]
  similar_images JSONB DEFAULT '[]'::jsonb,
  -- Metadata
  processing_time_ms INTEGER,
  ai_model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Text analysis (NLP)
CREATE TABLE IF NOT EXISTS text_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'product', 'review', 'description', 'support_ticket'
  entity_id UUID NOT NULL,
  text_content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'tr',
  -- Sentiment Analysis
  sentiment VARCHAR(20), -- 'positive', 'negative', 'neutral', 'mixed'
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  sentiment_confidence DECIMAL(3,2),
  -- Emotion Detection
  emotions JSONB DEFAULT '{}'::jsonb, -- {"joy": 0.8, "sadness": 0.1, "anger": 0.1}
  dominant_emotion VARCHAR(50),
  -- Entity Extraction
  entities JSONB DEFAULT '[]'::jsonb, -- [{"type": "BRAND", "text": "Nike", "confidence": 0.95}]
  brands JSONB DEFAULT '[]'::jsonb,
  locations JSONB DEFAULT '[]'::jsonb,
  -- Keywords & Topics
  keywords JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  key_phrases JSONB DEFAULT '[]'::jsonb,
  -- Content Quality
  readability_score DECIMAL(5,2), -- Flesch reading ease
  word_count INTEGER,
  sentence_count INTEGER,
  avg_word_length DECIMAL(4,2),
  unique_word_count INTEGER,
  -- SEO Analysis
  seo_score DECIMAL(3,2),
  seo_issues JSONB DEFAULT '[]'::jsonb,
  seo_suggestions JSONB DEFAULT '[]'::jsonb,
  -- Content Classification
  content_categories JSONB DEFAULT '[]'::jsonb,
  is_spam BOOLEAN DEFAULT false,
  spam_score DECIMAL(3,2),
  -- Metadata
  processing_time_ms INTEGER,
  ai_model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Product reviews sentiment
CREATE TABLE IF NOT EXISTS review_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  -- Sentiment Analysis
  sentiment VARCHAR(20) NOT NULL,
  sentiment_score DECIMAL(3,2) NOT NULL,
  -- Aspect-Based Sentiment
  aspects JSONB DEFAULT '[]'::jsonb, -- [{"aspect": "quality", "sentiment": "positive", "score": 0.9}]
  positive_aspects JSONB DEFAULT '[]'::jsonb,
  negative_aspects JSONB DEFAULT '[]'::jsonb,
  -- Intent & Category
  review_intent VARCHAR(50), -- 'complaint', 'praise', 'suggestion', 'question'
  review_category VARCHAR(50),
  -- Actionable Insights
  requires_action BOOLEAN DEFAULT false,
  action_type VARCHAR(50), -- 'customer_service', 'product_improvement', 'quality_check'
  priority VARCHAR(20) DEFAULT 'low',
  -- Metadata
  is_verified_purchase BOOLEAN DEFAULT false,
  helpfulness_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Visual search history
CREATE TABLE IF NOT EXISTS visual_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  search_image_url TEXT NOT NULL,
  search_type VARCHAR(50) DEFAULT 'similar', -- 'similar', 'exact', 'color', 'style'
  -- Results
  results_count INTEGER DEFAULT 0,
  top_results JSONB DEFAULT '[]'::jsonb, -- [{"product_id": "...", "similarity": 0.95}]
  -- Search Filters
  filters JSONB DEFAULT '{}'::jsonb,
  -- Metadata
  search_duration_ms INTEGER,
  clicked_product_id UUID REFERENCES products(id),
  resulted_in_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Content generation history
CREATE TABLE IF NOT EXISTS ai_content_generation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generation_type VARCHAR(100) NOT NULL, -- 'product_description', 'ad_copy', 'email_subject', 'blog_post'
  input_prompt TEXT,
  input_data JSONB DEFAULT '{}'::jsonb,
  -- Output
  generated_content TEXT NOT NULL,
  alternative_versions JSONB DEFAULT '[]'::jsonb, -- Multiple variations
  selected_version INTEGER DEFAULT 1,
  -- Quality Metrics
  content_quality_score DECIMAL(3,2),
  seo_score DECIMAL(3,2),
  readability_score DECIMAL(5,2),
  engagement_prediction DECIMAL(3,2),
  -- Usage
  was_used BOOLEAN DEFAULT false,
  was_edited BOOLEAN DEFAULT false,
  edit_distance INTEGER, -- How much it was edited
  entity_type VARCHAR(50),
  entity_id UUID,
  -- AI Model Info
  ai_model VARCHAR(100), -- 'gpt-4', 'claude-3', 'llama-2'
  model_version VARCHAR(50),
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  cost_usd DECIMAL(8,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Smart categorization suggestions
CREATE TABLE IF NOT EXISTS smart_categorization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  -- Current Category
  current_category_id UUID,
  -- AI Suggestions
  suggested_categories JSONB DEFAULT '[]'::jsonb, -- [{"category_id": "...", "confidence": 0.95, "reason": "..."}]
  top_suggestion_id UUID,
  confidence_score DECIMAL(3,2),
  -- Analysis Basis
  analyzed_fields JSONB DEFAULT '[]'::jsonb, -- ["name", "description", "images"]
  similarity_to_category DECIMAL(3,2),
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'auto_applied'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_image_analysis_product ON image_analysis(product_id);
CREATE INDEX idx_image_analysis_tenant_type ON image_analysis(tenant_id, analysis_type);
CREATE INDEX idx_text_analysis_entity ON text_analysis(entity_type, entity_id);
CREATE INDEX idx_text_analysis_sentiment ON text_analysis(sentiment, sentiment_score);
CREATE INDEX idx_review_sentiment_product ON review_sentiment(product_id);
CREATE INDEX idx_review_sentiment_rating ON review_sentiment(rating, sentiment);
CREATE INDEX idx_visual_search_customer ON visual_search_history(customer_id);
CREATE INDEX idx_ai_content_generation_type ON ai_content_generation(generation_type, created_at);
CREATE INDEX idx_smart_categorization_product ON smart_categorization(product_id, status);

-- RLS Policies
ALTER TABLE image_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE visual_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_categorization ENABLE ROW LEVEL SECURITY;

-- Image analysis policies
CREATE POLICY "Users can view image analysis in their tenant"
  ON image_analysis FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Text analysis policies
CREATE POLICY "Users can view text analysis in their tenant"
  ON text_analysis FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Review sentiment policies
CREATE POLICY "Users can view review sentiment in their tenant"
  ON review_sentiment FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- AI content generation policies
CREATE POLICY "Users can view their own AI content"
  ON ai_content_generation FOR SELECT
  USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM profiles WHERE id = auth.uid()
  ));

-- RPC function to get product sentiment summary
CREATE OR REPLACE FUNCTION get_product_sentiment_summary(p_product_id UUID)
RETURNS TABLE (
  total_reviews INTEGER,
  avg_rating DECIMAL,
  avg_sentiment_score DECIMAL,
  positive_count INTEGER,
  negative_count INTEGER,
  neutral_count INTEGER,
  top_positive_aspects JSONB,
  top_negative_aspects JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    AVG(rating)::DECIMAL,
    AVG(sentiment_score)::DECIMAL,
    COUNT(*) FILTER (WHERE sentiment = 'positive')::INTEGER,
    COUNT(*) FILTER (WHERE sentiment = 'negative')::INTEGER,
    COUNT(*) FILTER (WHERE sentiment = 'neutral')::INTEGER,
    (SELECT jsonb_agg(DISTINCT aspect) FROM review_sentiment, jsonb_array_elements(positive_aspects) AS aspect WHERE product_id = p_product_id LIMIT 5),
    (SELECT jsonb_agg(DISTINCT aspect) FROM review_sentiment, jsonb_array_elements(negative_aspects) AS aspect WHERE product_id = p_product_id LIMIT 5)
  FROM review_sentiment
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to find similar products by image (using JSONB similarity for now)
CREATE OR REPLACE FUNCTION find_similar_products_by_image(
  p_product_id UUID,
  p_similarity_threshold DECIMAL DEFAULT 0.70,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  similar_product_id UUID,
  product_name VARCHAR,
  similarity_score DECIMAL
) AS $$
BEGIN
  -- Simple implementation: return products from same category
  -- In production, this would use vector similarity search
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    0.85::DECIMAL -- Placeholder similarity score
  FROM products p
  WHERE p.id != p_product_id
    AND p.tenant_id = (SELECT tenant_id FROM products WHERE id = p_product_id)
    AND p.category_id = (SELECT category_id FROM products WHERE id = p_product_id)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: For production vector similarity search, enable pgvector extension:
-- CREATE EXTENSION IF NOT EXISTS vector;
-- ALTER TABLE image_analysis ADD COLUMN image_embedding_vector VECTOR(512);
-- CREATE INDEX ON image_analysis USING ivfflat (image_embedding_vector vector_cosine_ops);

