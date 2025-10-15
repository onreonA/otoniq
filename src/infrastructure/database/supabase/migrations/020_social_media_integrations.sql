-- =====================================================
-- Social Media & Email Integration Tables
-- =====================================================
-- Description: Tables for managing social media accounts, 
--              posts, email campaigns, and their analytics
-- Version: 1.0
-- =====================================================

-- Social Media Accounts
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube')),
  account_name TEXT NOT NULL,
  account_handle TEXT NOT NULL,
  access_token TEXT, -- Encrypted token
  refresh_token TEXT, -- Encrypted refresh token
  token_expires_at TIMESTAMPTZ,
  account_metadata JSONB DEFAULT '{}', -- Profile info, followers count, etc.
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, platform, account_handle)
);

-- Social Media Posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  
  -- Content
  post_type TEXT NOT NULL CHECK (post_type IN ('image', 'video', 'carousel', 'story', 'reel', 'text')),
  caption TEXT,
  media_urls TEXT[], -- Array of image/video URLs
  hashtags TEXT[],
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed', 'deleted')),
  
  -- Analytics
  platform_post_id TEXT, -- ID from social media platform
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- AI Generated
  is_ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE SET NULL,
  
  -- Campaign Details
  campaign_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to_email TEXT,
  
  -- Content
  html_content TEXT,
  plain_text_content TEXT,
  template_id TEXT, -- External template ID (SendGrid/Mailchimp)
  
  -- Targeting
  segment_type TEXT CHECK (segment_type IN ('all', 'custom', 'customers', 'subscribers')),
  segment_filter JSONB, -- Filter criteria for recipients
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  
  -- Analytics
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaign Recipients
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  email TEXT NOT NULL,
  customer_name TEXT,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  bounce_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_tenant ON social_media_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_media_accounts_platform ON social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_tenant ON social_media_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_account ON social_media_posts(account_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_status ON social_media_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON social_media_posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_email_campaigns_tenant ON email_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);

-- Enable Row Level Security
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_accounts
CREATE POLICY "Users can view their tenant's social media accounts"
  ON social_media_accounts FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert social media accounts for their tenant"
  ON social_media_accounts FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's social media accounts"
  ON social_media_accounts FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's social media accounts"
  ON social_media_accounts FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for social_media_posts
CREATE POLICY "Users can view their tenant's social media posts"
  ON social_media_posts FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert social media posts for their tenant"
  ON social_media_posts FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's social media posts"
  ON social_media_posts FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's social media posts"
  ON social_media_posts FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for email_campaigns
CREATE POLICY "Users can view their tenant's email campaigns"
  ON email_campaigns FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert email campaigns for their tenant"
  ON email_campaigns FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's email campaigns"
  ON email_campaigns FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's email campaigns"
  ON email_campaigns FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for email_campaign_recipients
CREATE POLICY "Users can view their tenant's email recipients"
  ON email_campaign_recipients FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert email recipients for their tenant"
  ON email_campaign_recipients FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's email recipients"
  ON email_campaign_recipients FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- SQL Functions

-- Get social media analytics summary
CREATE OR REPLACE FUNCTION get_social_media_analytics(
  p_tenant_id UUID,
  p_platform TEXT DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  platform TEXT,
  total_posts BIGINT,
  total_likes BIGINT,
  total_comments BIGINT,
  total_shares BIGINT,
  total_views BIGINT,
  avg_engagement_rate NUMERIC,
  most_engaging_post_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sma.platform,
    COUNT(smp.id)::BIGINT as total_posts,
    SUM(smp.likes_count)::BIGINT as total_likes,
    SUM(smp.comments_count)::BIGINT as total_comments,
    SUM(smp.shares_count)::BIGINT as total_shares,
    SUM(smp.views_count)::BIGINT as total_views,
    AVG(smp.engagement_rate) as avg_engagement_rate,
    (
      SELECT id FROM social_media_posts
      WHERE account_id = sma.id
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL
      ORDER BY engagement_rate DESC
      LIMIT 1
    ) as most_engaging_post_id
  FROM social_media_accounts sma
  LEFT JOIN social_media_posts smp ON smp.account_id = sma.id
  WHERE sma.tenant_id = p_tenant_id
    AND (p_platform IS NULL OR sma.platform = p_platform)
    AND smp.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND smp.status = 'posted'
  GROUP BY sma.platform, sma.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get email campaign analytics summary
CREATE OR REPLACE FUNCTION get_email_campaign_analytics(
  p_tenant_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_campaigns BIGINT,
  total_sent BIGINT,
  total_opened BIGINT,
  total_clicked BIGINT,
  avg_open_rate NUMERIC,
  avg_click_rate NUMERIC,
  best_performing_campaign_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_campaigns,
    SUM(sent_count)::BIGINT as total_sent,
    SUM(opened_count)::BIGINT as total_opened,
    SUM(clicked_count)::BIGINT as total_clicked,
    AVG(open_rate) as avg_open_rate,
    AVG(click_rate) as avg_click_rate,
    (
      SELECT id FROM email_campaigns
      WHERE tenant_id = p_tenant_id
      AND sent_at >= NOW() - (p_days || ' days')::INTERVAL
      AND status = 'sent'
      ORDER BY (open_rate + click_rate) DESC
      LIMIT 1
    ) as best_performing_campaign_id
  FROM email_campaigns
  WHERE tenant_id = p_tenant_id
    AND sent_at >= NOW() - (p_days || ' days')::INTERVAL
    AND status = 'sent';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update post analytics from platform
CREATE OR REPLACE FUNCTION update_post_analytics(
  p_post_id UUID,
  p_likes INTEGER,
  p_comments INTEGER,
  p_shares INTEGER,
  p_views INTEGER,
  p_reach INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE social_media_posts
  SET 
    likes_count = p_likes,
    comments_count = p_comments,
    shares_count = p_shares,
    views_count = p_views,
    reach = p_reach,
    engagement_rate = CASE 
      WHEN p_reach > 0 THEN 
        ((p_likes + p_comments + p_shares)::DECIMAL / p_reach * 100)
      ELSE 0 
    END,
    updated_at = NOW()
  WHERE id = p_post_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update campaign analytics
CREATE OR REPLACE FUNCTION update_campaign_analytics(
  p_campaign_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stats RECORD;
BEGIN
  -- Calculate stats from recipients
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'opened', 'clicked')) as sent,
    COUNT(*) FILTER (WHERE status IN ('delivered', 'opened', 'clicked')) as delivered,
    COUNT(*) FILTER (WHERE status IN ('opened', 'clicked')) as opened,
    COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed
  INTO v_stats
  FROM email_campaign_recipients
  WHERE campaign_id = p_campaign_id;
  
  -- Update campaign
  UPDATE email_campaigns
  SET 
    total_recipients = v_stats.total,
    sent_count = v_stats.sent,
    delivered_count = v_stats.delivered,
    opened_count = v_stats.opened,
    clicked_count = v_stats.clicked,
    bounced_count = v_stats.bounced,
    unsubscribed_count = v_stats.unsubscribed,
    open_rate = CASE WHEN v_stats.delivered > 0 THEN (v_stats.opened::DECIMAL / v_stats.delivered * 100) ELSE 0 END,
    click_rate = CASE WHEN v_stats.delivered > 0 THEN (v_stats.clicked::DECIMAL / v_stats.delivered * 100) ELSE 0 END,
    bounce_rate = CASE WHEN v_stats.sent > 0 THEN (v_stats.bounced::DECIMAL / v_stats.sent * 100) ELSE 0 END,
    updated_at = NOW()
  WHERE id = p_campaign_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE social_media_accounts IS 'Social media account connections for multi-platform posting';
COMMENT ON TABLE social_media_posts IS 'Social media posts with scheduling and analytics';
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns with analytics';
COMMENT ON TABLE email_campaign_recipients IS 'Individual recipients and their engagement metrics';

