-- Week 11: Enterprise Features - White-Label & Custom Branding

-- 1. Tenant branding configuration
CREATE TABLE IF NOT EXISTS tenant_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  -- Logo & Images
  logo_url TEXT,
  logo_dark_url TEXT, -- For dark mode
  favicon_url TEXT,
  login_background_url TEXT,
  email_header_url TEXT,
  -- Colors
  primary_color VARCHAR(7) DEFAULT '#4F46E5', -- Hex color
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  text_color VARCHAR(7) DEFAULT '#1F2937',
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  -- Typography
  font_family VARCHAR(100) DEFAULT 'Inter',
  font_url TEXT,
  -- Custom Domain
  custom_domain VARCHAR(255),
  custom_domain_verified BOOLEAN DEFAULT false,
  ssl_certificate_id TEXT,
  -- Email Branding
  email_from_name VARCHAR(100),
  email_from_address VARCHAR(255),
  email_reply_to VARCHAR(255),
  email_footer_html TEXT,
  -- Metadata
  theme_config JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT,
  custom_js TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Custom pages (Terms, Privacy, About, etc.)
CREATE TABLE IF NOT EXISTS custom_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  page_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'about', 'contact', 'custom'
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, slug)
);

-- 3. Email templates (custom branding)
CREATE TABLE IF NOT EXISTS custom_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  template_type VARCHAR(100) NOT NULL, -- 'welcome', 'order_confirmation', 'password_reset', etc.
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Available template variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, template_type)
);

-- 4. Feature flags (per-tenant feature control)
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL, -- 'ai_analysis', 'marketplace_sync', 'advanced_reports'
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, feature_key)
);

-- 5. White-label settings
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  -- General
  company_name VARCHAR(255),
  company_tagline TEXT,
  company_description TEXT,
  company_address TEXT,
  company_phone VARCHAR(50),
  company_email VARCHAR(255),
  company_website VARCHAR(255),
  -- Social Links
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  -- Business Info
  tax_id VARCHAR(50),
  registration_number VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'TRY',
  timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
  language VARCHAR(5) DEFAULT 'tr',
  -- Advanced
  api_rate_limit INTEGER DEFAULT 100,
  max_users INTEGER,
  max_products INTEGER,
  max_storage_gb INTEGER DEFAULT 10,
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tenant_branding_tenant_id ON tenant_branding(tenant_id);
CREATE INDEX idx_tenant_branding_custom_domain ON tenant_branding(custom_domain);
CREATE INDEX idx_custom_pages_tenant_id ON custom_pages(tenant_id);
CREATE INDEX idx_custom_pages_slug ON custom_pages(slug);
CREATE INDEX idx_custom_email_templates_tenant_id ON custom_email_templates(tenant_id);
CREATE INDEX idx_tenant_feature_flags_tenant_id ON tenant_feature_flags(tenant_id);
CREATE INDEX idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);

-- RLS Policies
ALTER TABLE tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- Tenant branding policies
CREATE POLICY "Users can view their tenant branding"
  ON tenant_branding FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage tenant branding"
  ON tenant_branding FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Custom pages policies (public read for published pages)
CREATE POLICY "Anyone can view published custom pages"
  ON custom_pages FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage custom pages"
  ON custom_pages FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Feature flags policies
CREATE POLICY "Users can view their tenant feature flags"
  ON tenant_feature_flags FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Update triggers
CREATE TRIGGER update_tenant_branding_updated_at
  BEFORE UPDATE ON tenant_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_email_templates_updated_at
  BEFORE UPDATE ON custom_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get tenant branding by domain
CREATE OR REPLACE FUNCTION get_tenant_branding_by_domain(p_domain VARCHAR)
RETURNS TABLE (
  tenant_id UUID,
  logo_url TEXT,
  primary_color VARCHAR,
  company_name VARCHAR,
  theme_config JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tb.tenant_id,
    tb.logo_url,
    tb.primary_color,
    ts.company_name,
    tb.theme_config
  FROM tenant_branding tb
  JOIN tenant_settings ts ON tb.tenant_id = ts.tenant_id
  WHERE tb.custom_domain = p_domain
    AND tb.custom_domain_verified = true
    AND tb.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to check feature flag
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_tenant_id UUID,
  p_feature_key VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_enabled BOOLEAN;
BEGIN
  SELECT is_enabled INTO v_is_enabled
  FROM tenant_feature_flags
  WHERE tenant_id = p_tenant_id
    AND feature_key = p_feature_key;

  RETURN COALESCE(v_is_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default branding for existing tenants
INSERT INTO tenant_branding (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM tenant_branding)
ON CONFLICT DO NOTHING;

INSERT INTO tenant_settings (tenant_id)
SELECT id FROM tenants
WHERE id NOT IN (SELECT tenant_id FROM tenant_settings)
ON CONFLICT DO NOTHING;

