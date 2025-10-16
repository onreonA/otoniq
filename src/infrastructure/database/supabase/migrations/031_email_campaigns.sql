-- ================================================
-- Email Campaign System
-- ================================================
-- Created: 2025-10-16
-- Purpose: Email marketing campaigns, drip campaigns, and analytics

-- ================================================
-- Drop existing objects if they exist
-- ================================================
DROP TABLE IF EXISTS email_click_tracking CASCADE;
DROP TABLE IF EXISTS drip_campaign_sequences CASCADE;
DROP TABLE IF EXISTS email_campaign_recipients CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;
DROP FUNCTION IF EXISTS update_campaign_stats(UUID);

-- ================================================
-- Email Campaigns Table
-- ================================================
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Campaign Info
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  
  -- Content
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  
  -- Type & Settings
  campaign_type TEXT NOT NULL DEFAULT 'one-time', -- 'one-time', 'drip', 'automated'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Targeting
  segment_filter JSONB, -- Customer segmentation rules
  total_recipients INTEGER DEFAULT 0,
  
  -- Analytics
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  
  -- Metrics
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Metadata
  from_name TEXT,
  from_email TEXT,
  reply_to_email TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Email Campaign Recipients Table
-- ================================================
CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  
  -- Recipient Info
  customer_id UUID, -- Optional reference to customers table
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  
  -- Personalization Data
  personalization_data JSONB, -- Dynamic fields for email template
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  -- Analytics
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Email Click Tracking Table
-- ================================================
CREATE TABLE email_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
  
  -- Click Info
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Device & Location
  user_agent TEXT,
  ip_address INET,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Drip Campaign Sequences Table
-- ================================================
CREATE TABLE drip_campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  
  -- Sequence Info
  sequence_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  
  -- Content
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  
  -- Timing
  delay_days INTEGER NOT NULL DEFAULT 0, -- Days after previous email or subscription
  delay_hours INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Indexes
-- ================================================
CREATE INDEX idx_campaigns_tenant ON email_campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_campaigns_type ON email_campaigns(campaign_type);
CREATE INDEX idx_campaigns_scheduled ON email_campaigns(scheduled_at);

CREATE INDEX idx_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX idx_recipients_email ON email_campaign_recipients(email);
CREATE INDEX idx_recipients_status ON email_campaign_recipients(status);
CREATE INDEX idx_recipients_customer ON email_campaign_recipients(customer_id);

CREATE INDEX idx_clicks_campaign ON email_click_tracking(campaign_id);
CREATE INDEX idx_clicks_recipient ON email_click_tracking(recipient_id);
CREATE INDEX idx_clicks_date ON email_click_tracking(clicked_at);

CREATE INDEX idx_drip_sequences_campaign ON drip_campaign_sequences(campaign_id);
CREATE INDEX idx_drip_sequences_number ON drip_campaign_sequences(sequence_number);

-- ================================================
-- RLS Policies
-- ================================================
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_click_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_campaign_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tenant campaigns"
  ON email_campaigns
  FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage campaign recipients"
  ON email_campaign_recipients
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM email_campaigns 
      WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view click tracking"
  ON email_click_tracking
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM email_campaigns 
      WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage drip sequences"
  ON drip_campaign_sequences
  FOR ALL
  USING (
    campaign_id IN (
      SELECT id FROM email_campaigns 
      WHERE tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- ================================================
-- Helper Functions
-- ================================================

-- Update campaign statistics
CREATE OR REPLACE FUNCTION update_campaign_stats(p_campaign_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
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

  UPDATE email_campaigns
  SET
    total_recipients = v_stats.total,
    sent_count = v_stats.sent,
    delivered_count = v_stats.delivered,
    opened_count = v_stats.opened,
    clicked_count = v_stats.clicked,
    bounced_count = v_stats.bounced,
    unsubscribed_count = v_stats.unsubscribed,
    open_rate = CASE WHEN v_stats.delivered > 0 
                THEN ROUND((v_stats.opened::DECIMAL / v_stats.delivered * 100), 2)
                ELSE 0 END,
    click_rate = CASE WHEN v_stats.opened > 0
                THEN ROUND((v_stats.clicked::DECIMAL / v_stats.opened * 100), 2)
                ELSE 0 END,
    bounce_rate = CASE WHEN v_stats.sent > 0
                 THEN ROUND((v_stats.bounced::DECIMAL / v_stats.sent * 100), 2)
                 ELSE 0 END,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$;

GRANT EXECUTE ON FUNCTION update_campaign_stats TO anon, authenticated;

-- ================================================
-- Triggers
-- ================================================
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at
  BEFORE UPDATE ON email_campaign_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drip_sequences_updated_at
  BEFORE UPDATE ON drip_campaign_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- Comments
-- ================================================
COMMENT ON TABLE email_campaigns IS 'Email marketing campaigns with analytics and tracking';
COMMENT ON TABLE email_campaign_recipients IS 'Individual recipients for each campaign with delivery status';
COMMENT ON TABLE email_click_tracking IS 'Track email link clicks for engagement analytics';
COMMENT ON TABLE drip_campaign_sequences IS 'Automated drip campaign sequence emails';

