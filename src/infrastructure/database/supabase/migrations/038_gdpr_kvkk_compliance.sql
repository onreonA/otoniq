-- Week 13: International & Final - GDPR & KVKK Compliance

-- 1. Data processing consents
CREATE TABLE IF NOT EXISTS data_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL, -- 'marketing', 'analytics', 'third_party_sharing', 'cookies'
  consent_given BOOLEAN NOT NULL,
  consent_method VARCHAR(50), -- 'web_form', 'email', 'phone', 'in_person'
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT, -- Exact text shown to user
  consent_version VARCHAR(50), -- Version of terms/privacy policy
  expires_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Data access requests (GDPR Article 15)
CREATE TABLE IF NOT EXISTS data_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  request_type VARCHAR(50) NOT NULL, -- 'access', 'export', 'delete', 'rectify', 'restrict'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  reason TEXT,
  -- Request details
  requested_data JSONB DEFAULT '[]'::jsonb, -- Which data categories requested
  response_data JSONB,
  response_file_url TEXT,
  -- Processing info
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  -- Compliance
  due_date TIMESTAMP WITH TIME ZONE, -- Must respond within 30 days (GDPR)
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Data deletion logs (right to be forgotten)
CREATE TABLE IF NOT EXISTS data_deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'customer', 'order', 'review'
  entity_id UUID NOT NULL,
  deletion_type VARCHAR(50) NOT NULL, -- 'anonymization', 'soft_delete', 'hard_delete'
  deletion_reason VARCHAR(100), -- 'user_request', 'gdpr', 'retention_policy', 'account_closure'
  data_snapshot JSONB, -- Store snapshot before deletion
  deleted_by UUID REFERENCES auth.users(id),
  legal_basis TEXT, -- Legal reason for deletion or retention
  retention_end_date DATE, -- If data must be retained
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Data processing activities (GDPR Article 30)
CREATE TABLE IF NOT EXISTS data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  activity_name VARCHAR(255) NOT NULL,
  purpose TEXT NOT NULL, -- Why processing this data
  legal_basis VARCHAR(100) NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'legitimate_interest'
  data_categories JSONB DEFAULT '[]'::jsonb, -- ['personal_data', 'financial_data', 'location_data']
  data_subjects JSONB DEFAULT '[]'::jsonb, -- ['customers', 'employees', 'suppliers']
  recipients JSONB DEFAULT '[]'::jsonb, -- Who receives the data
  retention_period VARCHAR(100), -- How long data is kept
  security_measures TEXT, -- Technical/organizational measures
  third_country_transfers BOOLEAN DEFAULT false,
  third_countries JSONB DEFAULT '[]'::jsonb,
  dpo_contact VARCHAR(255), -- Data Protection Officer contact
  is_active BOOLEAN DEFAULT true,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Cookie consent tracking
CREATE TABLE IF NOT EXISTS cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  necessary_cookies BOOLEAN DEFAULT true, -- Always required
  functional_cookies BOOLEAN DEFAULT false,
  analytics_cookies BOOLEAN DEFAULT false,
  marketing_cookies BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  consent_banner_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Privacy policy versions
CREATE TABLE IF NOT EXISTS privacy_policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  version VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  summary_of_changes TEXT,
  is_active BOOLEAN DEFAULT false,
  effective_date DATE,
  language_code VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, version, language_code)
);

-- 7. Data breach incidents
CREATE TABLE IF NOT EXISTS data_breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  discovered_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  breach_type VARCHAR(100) NOT NULL, -- 'unauthorized_access', 'data_loss', 'ransomware'
  affected_data_types JSONB DEFAULT '[]'::jsonb,
  affected_users_count INTEGER DEFAULT 0,
  affected_user_ids JSONB DEFAULT '[]'::jsonb,
  -- Response
  containment_actions TEXT,
  notification_required BOOLEAN DEFAULT false,
  authority_notified BOOLEAN DEFAULT false,
  authority_notified_at TIMESTAMP WITH TIME ZONE,
  users_notified BOOLEAN DEFAULT false,
  users_notified_at TIMESTAMP WITH TIME ZONE,
  -- Details
  root_cause TEXT,
  remediation_actions TEXT,
  status VARCHAR(50) DEFAULT 'investigating', -- 'investigating', 'contained', 'resolved'
  resolved_at TIMESTAMP WITH TIME ZONE,
  -- Compliance
  reported_by UUID REFERENCES auth.users(id),
  dpo_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Automated decision logging (GDPR Article 22)
CREATE TABLE IF NOT EXISTS automated_decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  decision_type VARCHAR(100) NOT NULL, -- 'credit_scoring', 'fraud_detection', 'price_optimization'
  decision_outcome TEXT NOT NULL,
  ai_model_used VARCHAR(255),
  model_version VARCHAR(50),
  confidence_score DECIMAL(3,2),
  input_data JSONB,
  explanation TEXT, -- Human-readable explanation
  human_review_required BOOLEAN DEFAULT false,
  human_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_data_consents_user ON data_consents(user_id);
CREATE INDEX idx_data_consents_customer ON data_consents(customer_id);
CREATE INDEX idx_data_consents_type ON data_consents(consent_type, consent_given);
CREATE INDEX idx_data_access_requests_tenant ON data_access_requests(tenant_id, status);
CREATE INDEX idx_data_access_requests_due ON data_access_requests(due_date) WHERE status = 'pending';
CREATE INDEX idx_data_deletion_logs_entity ON data_deletion_logs(entity_type, entity_id);
CREATE INDEX idx_cookie_consents_session ON cookie_consents(session_id);
CREATE INDEX idx_data_breach_incidents_tenant ON data_breach_incidents(tenant_id, status);
CREATE INDEX idx_automated_decision_logs_tenant ON automated_decision_logs(tenant_id, decision_type);

-- RLS Policies
ALTER TABLE data_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_decision_logs ENABLE ROW LEVEL SECURITY;

-- Data consents policies
CREATE POLICY "Users can view their own consents"
  ON data_consents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own consents"
  ON data_consents FOR ALL
  USING (user_id = auth.uid());

-- Data access requests policies
CREATE POLICY "Users can view their own access requests"
  ON data_access_requests FOR SELECT
  USING (user_id = auth.uid() OR tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Admins can manage access requests"
  ON data_access_requests FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Privacy policy policies (public read)
CREATE POLICY "Anyone can view active privacy policies"
  ON privacy_policy_versions FOR SELECT
  USING (is_active = true);

-- Update triggers
CREATE TRIGGER update_data_consents_updated_at
  BEFORE UPDATE ON data_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_access_requests_updated_at
  BEFORE UPDATE ON data_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_processing_activities_updated_at
  BEFORE UPDATE ON data_processing_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cookie_consents_updated_at
  BEFORE UPDATE ON cookie_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set due date for access requests (30 days per GDPR)
CREATE OR REPLACE FUNCTION set_access_request_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NULL THEN
    NEW.due_date := NEW.created_at + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_access_request_due_date
  BEFORE INSERT ON data_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_access_request_due_date();

-- RPC function to export user data (GDPR data portability)
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u.*) FROM auth.users u WHERE id = p_user_id),
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE id = p_user_id),
    'orders', (SELECT jsonb_agg(o.*) FROM orders o WHERE customer_id IN (SELECT id FROM customers WHERE email = (SELECT email FROM auth.users WHERE id = p_user_id))),
    'consents', (SELECT jsonb_agg(c.*) FROM data_consents c WHERE user_id = p_user_id),
    'export_date', CURRENT_TIMESTAMP
  ) INTO v_data;

  RETURN v_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Log the deletion
  INSERT INTO data_deletion_logs (
    entity_type, entity_id, deletion_type, deletion_reason, deleted_by
  ) VALUES (
    'user', p_user_id, 'anonymization', 'user_request', p_user_id
  );

  -- Anonymize profile
  UPDATE profiles SET
    full_name = 'Anonymized User',
    email = 'anonymized_' || gen_random_uuid() || '@example.com',
    phone = NULL,
    avatar_url = NULL
  WHERE id = p_user_id;

  -- Mark as anonymized
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to check consent
CREATE OR REPLACE FUNCTION check_user_consent(
  p_user_id UUID,
  p_consent_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_consent_given BOOLEAN;
BEGIN
  SELECT consent_given INTO v_consent_given
  FROM data_consents
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND withdrawn_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_consent_given, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

