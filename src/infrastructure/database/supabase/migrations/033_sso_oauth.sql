-- Week 11: Enterprise Features - SSO & OAuth

-- 1. SSO providers configuration
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type VARCHAR(50) NOT NULL, -- 'google', 'microsoft', 'saml', 'okta'
  provider_name VARCHAR(100) NOT NULL,
  client_id TEXT,
  client_secret TEXT, -- Encrypted
  auth_url TEXT,
  token_url TEXT,
  user_info_url TEXT,
  saml_metadata_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, provider_type, provider_name)
);

-- 2. SSO sessions table
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES sso_providers(id) ON DELETE CASCADE,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  session_data JSONB DEFAULT '{}'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. OAuth tokens table (for external API integrations)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL, -- 'shopify', 'facebook', 'google', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, user_id, provider)
);

-- 4. Domain whitelist for SSO (email domain-based access)
CREATE TABLE IF NOT EXISTS sso_domain_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL, -- e.g., 'company.com'
  sso_provider_id UUID REFERENCES sso_providers(id) ON DELETE CASCADE,
  auto_provision BOOLEAN DEFAULT true, -- Auto-create user on first login
  default_role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, domain)
);

-- Indexes
CREATE INDEX idx_sso_providers_tenant_id ON sso_providers(tenant_id);
CREATE INDEX idx_sso_sessions_user_id ON sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_provider_id ON sso_sessions(provider_id);
CREATE INDEX idx_oauth_tokens_tenant_id ON oauth_tokens(tenant_id);
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_sso_domain_whitelist_tenant_id ON sso_domain_whitelist(tenant_id);

-- RLS Policies
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_domain_whitelist ENABLE ROW LEVEL SECURITY;

-- SSO providers policies
CREATE POLICY "Admins can manage SSO providers"
  ON sso_providers FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- SSO sessions policies
CREATE POLICY "Users can view their own SSO sessions"
  ON sso_sessions FOR SELECT
  USING (user_id = auth.uid());

-- OAuth tokens policies
CREATE POLICY "Users can manage their own OAuth tokens"
  ON oauth_tokens FOR ALL
  USING (user_id = auth.uid());

-- Update triggers
CREATE TRIGGER update_sso_providers_updated_at
  BEFORE UPDATE ON sso_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to validate SSO domain
CREATE OR REPLACE FUNCTION validate_sso_domain(
  p_email VARCHAR,
  p_tenant_id UUID
) RETURNS TABLE (
  is_allowed BOOLEAN,
  provider_id UUID,
  auto_provision BOOLEAN,
  default_role_id UUID
) AS $$
DECLARE
  v_domain VARCHAR;
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);

  RETURN QUERY
  SELECT 
    true,
    sdw.sso_provider_id,
    sdw.auto_provision,
    sdw.default_role_id
  FROM sso_domain_whitelist sdw
  WHERE sdw.tenant_id = p_tenant_id
    AND sdw.domain = v_domain
    AND sdw.is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, false, NULL::UUID;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to refresh OAuth token
CREATE OR REPLACE FUNCTION refresh_oauth_token(
  p_token_id UUID,
  p_new_access_token TEXT,
  p_new_refresh_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE oauth_tokens
  SET 
    access_token = p_new_access_token,
    refresh_token = COALESCE(p_new_refresh_token, refresh_token),
    expires_at = p_expires_at,
    updated_at = NOW()
  WHERE id = p_token_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

