-- Workflow Templates System
-- Community-driven template sharing and marketplace

-- Workflow Templates Table
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('marketing', 'social-media', 'inventory', 'analytics', 'customer-service', 'automation', 'integration', 'notification', 'data-processing', 'other')),
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER NOT NULL DEFAULT 0, -- in minutes
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  workflow_data JSONB NOT NULL,
  preview_image TEXT, -- base64 or URL
  documentation TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Statistics
CREATE TABLE IF NOT EXISTS template_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  downloads INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id)
);

-- Template Reviews
CREATE TABLE IF NOT EXISTS template_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Template Downloads
CREATE TABLE IF NOT EXISTS template_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Template Likes
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Template Categories
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO template_categories (name, description, icon, color, sort_order) VALUES
('Marketing', 'E-posta kampanyaları, sosyal medya otomasyonu', 'ri-megaphone-line', 'blue', 1),
('Social Media', 'Sosyal medya yönetimi ve otomasyonu', 'ri-share-line', 'purple', 2),
('Inventory', 'Stok takibi ve envanter yönetimi', 'ri-archive-line', 'green', 3),
('Analytics', 'Veri analizi ve raporlama', 'ri-bar-chart-line', 'orange', 4),
('Customer Service', 'Müşteri hizmetleri otomasyonu', 'ri-customer-service-line', 'red', 5),
('Automation', 'Genel otomasyon workflow\'ları', 'ri-robot-line', 'cyan', 6),
('Integration', 'Sistem entegrasyonları', 'ri-plug-line', 'yellow', 7),
('Notification', 'Bildirim sistemleri', 'ri-notification-line', 'pink', 8),
('Data Processing', 'Veri işleme ve dönüştürme', 'ri-database-line', 'indigo', 9),
('Other', 'Diğer kategoriler', 'ri-more-line', 'gray', 10)
ON CONFLICT (name) DO NOTHING;

-- Template Collections (User-created collections)
CREATE TABLE IF NOT EXISTS template_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Collection Items
CREATE TABLE IF NOT EXISTS template_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES template_collections(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, template_id)
);

-- Template Usage Tracking
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workflow_id UUID, -- Reference to actual workflow created from template
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_author ON workflow_templates(author_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_featured ON workflow_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_verified ON workflow_templates(is_verified);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_difficulty ON workflow_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_at ON workflow_templates(created_at);

CREATE INDEX IF NOT EXISTS idx_template_stats_template ON template_stats(template_id);
CREATE INDEX IF NOT EXISTS idx_template_stats_downloads ON template_stats(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_template_stats_rating ON template_stats(rating DESC);

CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON template_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_user ON template_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_rating ON template_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_template_downloads_template ON template_downloads(template_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_user ON template_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_template_downloads_date ON template_downloads(downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_template_likes_template ON template_likes(template_id);
CREATE INDEX IF NOT EXISTS idx_template_likes_user ON template_likes(user_id);

-- RLS Policies
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- Workflow Templates Policies
CREATE POLICY "Public templates are viewable by everyone" ON workflow_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON workflow_templates
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create templates" ON workflow_templates
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own templates" ON workflow_templates
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own templates" ON workflow_templates
  FOR DELETE USING (auth.uid() = author_id);

-- Template Stats Policies
CREATE POLICY "Template stats are viewable by everyone" ON template_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update template stats" ON template_stats
  FOR UPDATE USING (true);

-- Template Reviews Policies
CREATE POLICY "Template reviews are viewable by everyone" ON template_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON template_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON template_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON template_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Template Downloads Policies
CREATE POLICY "Users can view their own downloads" ON template_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create downloads" ON template_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Template Likes Policies
CREATE POLICY "Users can view their own likes" ON template_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create likes" ON template_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON template_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Template Categories Policies
CREATE POLICY "Template categories are viewable by everyone" ON template_categories
  FOR SELECT USING (true);

-- Template Collections Policies
CREATE POLICY "Public collections are viewable by everyone" ON template_collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create collections" ON template_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON template_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON template_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Template Collection Items Policies
CREATE POLICY "Collection items are viewable by collection owner" ON template_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM template_collections 
      WHERE id = collection_id 
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their collection items" ON template_collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM template_collections 
      WHERE id = collection_id 
      AND user_id = auth.uid()
    )
  );

-- Template Usage Policies
CREATE POLICY "Users can view their own usage" ON template_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create usage records" ON template_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for template statistics
CREATE OR REPLACE FUNCTION update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert template stats
  INSERT INTO template_stats (template_id, downloads, likes, rating, usage_count)
  VALUES (
    NEW.template_id,
    (SELECT COUNT(*) FROM template_downloads WHERE template_id = NEW.template_id),
    (SELECT COUNT(*) FROM template_likes WHERE template_id = NEW.template_id),
    (SELECT COALESCE(AVG(rating), 0) FROM template_reviews WHERE template_id = NEW.template_id),
    (SELECT COUNT(*) FROM template_usage WHERE template_id = NEW.template_id)
  )
  ON CONFLICT (template_id) DO UPDATE SET
    downloads = EXCLUDED.downloads,
    likes = EXCLUDED.likes,
    rating = EXCLUDED.rating,
    usage_count = EXCLUDED.usage_count,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating stats
CREATE TRIGGER update_template_stats_on_download
  AFTER INSERT ON template_downloads
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

CREATE TRIGGER update_template_stats_on_like
  AFTER INSERT OR DELETE ON template_likes
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

CREATE TRIGGER update_template_stats_on_review
  AFTER INSERT OR UPDATE OR DELETE ON template_reviews
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

CREATE TRIGGER update_template_stats_on_usage
  AFTER INSERT ON template_usage
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

-- Function to get popular templates
CREATE OR REPLACE FUNCTION get_popular_templates(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  template_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  author_name TEXT,
  downloads INTEGER,
  likes INTEGER,
  rating DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.name,
    wt.description,
    wt.category,
    wt.difficulty,
    wt.author_name,
    ts.downloads,
    ts.likes,
    ts.rating,
    wt.created_at
  FROM workflow_templates wt
  LEFT JOIN template_stats ts ON wt.id = ts.template_id
  WHERE wt.is_public = true
  ORDER BY ts.downloads DESC, ts.rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending templates
CREATE OR REPLACE FUNCTION get_trending_templates(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  template_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  author_name TEXT,
  downloads INTEGER,
  likes INTEGER,
  rating DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.name,
    wt.description,
    wt.category,
    wt.difficulty,
    wt.author_name,
    ts.downloads,
    ts.likes,
    ts.rating,
    wt.created_at
  FROM workflow_templates wt
  LEFT JOIN template_stats ts ON wt.id = ts.template_id
  WHERE wt.is_public = true
    AND wt.created_at >= NOW() - INTERVAL '30 days'
  ORDER BY ts.downloads DESC, ts.rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search templates
CREATE OR REPLACE FUNCTION search_templates(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  difficulty_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  template_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  author_name TEXT,
  downloads INTEGER,
  likes INTEGER,
  rating DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wt.id,
    wt.name,
    wt.description,
    wt.category,
    wt.difficulty,
    wt.author_name,
    ts.downloads,
    ts.likes,
    ts.rating,
    wt.created_at,
    (
      CASE 
        WHEN wt.name ILIKE '%' || search_query || '%' THEN 3.0
        WHEN wt.description ILIKE '%' || search_query || '%' THEN 2.0
        WHEN EXISTS (
          SELECT 1 FROM unnest(wt.tags) AS tag 
          WHERE tag ILIKE '%' || search_query || '%'
        ) THEN 1.5
        ELSE 0.0
      END
    ) AS relevance_score
  FROM workflow_templates wt
  LEFT JOIN template_stats ts ON wt.id = ts.template_id
  WHERE wt.is_public = true
    AND (
      wt.name ILIKE '%' || search_query || '%'
      OR wt.description ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(wt.tags) AS tag 
        WHERE tag ILIKE '%' || search_query || '%'
      )
    )
    AND (category_filter IS NULL OR wt.category = category_filter)
    AND (difficulty_filter IS NULL OR wt.difficulty = difficulty_filter)
  ORDER BY relevance_score DESC, ts.downloads DESC, ts.rating DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
