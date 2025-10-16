-- ================================================
-- Social Media Automation System (FIXED ORDER)
-- ================================================
-- Created: 2025-10-16
-- Purpose: Social media account management, post scheduling, and analytics

-- ================================================
-- Drop existing objects if they exist
-- ================================================
DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_media_posts;
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_media_accounts;
DROP FUNCTION IF EXISTS get_scheduled_posts(UUID);

-- Drop all versions of update_post_analytics function
DO $$ 
BEGIN
  DROP FUNCTION IF EXISTS update_post_analytics(UUID, INTEGER, INTEGER, INTEGER, INTEGER);
  DROP FUNCTION IF EXISTS update_post_analytics(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER);
  DROP FUNCTION IF EXISTS update_post_analytics;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DROP TABLE IF EXISTS social_media_post_analytics CASCADE;
DROP TABLE IF EXISTS social_media_posts CASCADE;
DROP TABLE IF EXISTS social_media_accounts CASCADE;

-- ================================================
-- Social Media Accounts Table
-- ================================================
CREATE TABLE social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Platform Info
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_username TEXT NOT NULL,
  profile_url TEXT,
  
  -- Connection
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  
  -- Metadata
  account_data JSONB,
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Social Media Posts Table
-- ================================================
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  account_id UUID REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  
  -- Content
  caption TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  mentions TEXT[],
  
  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Platform Response
  platform_post_id TEXT,
  platform_url TEXT,
  error_message TEXT,
  
  -- Analytics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Post Analytics History (Daily snapshots)
-- ================================================
CREATE TABLE social_media_post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_media_posts(id) ON DELETE CASCADE,
  
  -- Metrics Snapshot
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Demographics
  demographics JSONB,
  
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE (post_id, snapshot_date)
);

-- ================================================
-- NOW: Create Indexes AFTER tables exist
-- ================================================
CREATE INDEX idx_social_accounts_tenant ON social_media_accounts(tenant_id);
CREATE INDEX idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_social_accounts_connected ON social_media_accounts(is_connected) WHERE is_connected = true;

CREATE INDEX idx_social_posts_tenant ON social_media_posts(tenant_id);
CREATE INDEX idx_social_posts_account ON social_media_posts(account_id);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_media_posts(scheduled_for);
CREATE INDEX idx_social_posts_published ON social_media_posts(published_at);

CREATE INDEX idx_post_analytics_post ON social_media_post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON social_media_post_analytics(snapshot_date);

-- ================================================
-- RLS Policies
-- ================================================
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_post_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tenant social accounts"
  ON social_media_accounts
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tenant social posts"
  ON social_media_posts
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can read tenant post analytics"
  ON social_media_post_analytics
  FOR SELECT
  USING (
    post_id IN (
      SELECT id FROM social_media_posts 
      WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ================================================
-- Helper Functions
-- ================================================
CREATE OR REPLACE FUNCTION update_post_analytics(
  p_post_id UUID,
  p_likes INTEGER,
  p_comments INTEGER,
  p_shares INTEGER,
  p_reach INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_engagement_rate DECIMAL(5,2);
BEGIN
  IF p_reach > 0 THEN
    v_engagement_rate := ((p_likes + p_comments + p_shares)::DECIMAL / p_reach * 100);
  ELSE
    v_engagement_rate := 0;
  END IF;

  UPDATE social_media_posts
  SET
    likes_count = p_likes,
    comments_count = p_comments,
    shares_count = p_shares,
    reach_count = p_reach,
    engagement_rate = v_engagement_rate,
    updated_at = NOW()
  WHERE id = p_post_id;

  INSERT INTO social_media_post_analytics (
    post_id,
    likes_count,
    comments_count,
    shares_count,
    reach_count,
    engagement_rate,
    snapshot_date
  ) VALUES (
    p_post_id,
    p_likes,
    p_comments,
    p_shares,
    p_reach,
    v_engagement_rate,
    CURRENT_DATE
  )
  ON CONFLICT (post_id, snapshot_date) DO UPDATE SET
    likes_count = EXCLUDED.likes_count,
    comments_count = EXCLUDED.comments_count,
    shares_count = EXCLUDED.shares_count,
    reach_count = EXCLUDED.reach_count,
    engagement_rate = EXCLUDED.engagement_rate;
END;
$$;

CREATE OR REPLACE FUNCTION get_scheduled_posts(p_tenant_id UUID)
RETURNS TABLE (
  post_id UUID,
  account_id UUID,
  platform TEXT,
  caption TEXT,
  media_urls TEXT[],
  scheduled_for TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.account_id,
    a.platform,
    p.caption,
    p.media_urls,
    p.scheduled_for
  FROM social_media_posts p
  JOIN social_media_accounts a ON a.id = p.account_id
  WHERE p.tenant_id = p_tenant_id
    AND p.status = 'scheduled'
    AND p.scheduled_for <= NOW() + INTERVAL '24 hours'
    AND p.scheduled_for >= NOW()
  ORDER BY p.scheduled_for ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION update_post_analytics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_scheduled_posts TO anon, authenticated;

-- ================================================
-- Updated_at triggers (using existing function)
-- ================================================
-- Note: update_updated_at_column() function already exists globally

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_media_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_media_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Comments
-- ================================================
COMMENT ON TABLE social_media_accounts IS 'Connected social media accounts for automated posting';
COMMENT ON TABLE social_media_posts IS 'Social media posts with scheduling and analytics';
COMMENT ON TABLE social_media_post_analytics IS 'Daily snapshots of post performance metrics';

