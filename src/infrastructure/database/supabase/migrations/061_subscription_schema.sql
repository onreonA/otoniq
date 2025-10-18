-- ============================================================================
-- OTONIQ.AI - Subscription Management Schema
-- Migration 061: Subscription plans and tenant subscriptions
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Plan identification
  plan_name TEXT NOT NULL UNIQUE, -- 'starter', 'professional', 'enterprise', 'custom'
  display_name TEXT NOT NULL,
  description TEXT,
  tagline TEXT, -- Short marketing message
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'TRY',
  discount_yearly_percent INTEGER DEFAULT 0, -- e.g., 20 for 20% off
  
  -- Features & Limits
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  /* Example features structure:
  {
    "max_products": 100,
    "max_users": 5,
    "max_marketplaces": 2,
    "ai_credits_monthly": 1000,
    "storage_gb": 10,
    "api_calls_per_day": 1000,
    "n8n_workflows": 5,
    "advanced_analytics": true,
    "priority_support": false,
    "custom_integrations": false,
    "white_label": false
  }
  */
  
  -- Display settings
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  badge_text TEXT, -- e.g., "Most Popular", "Best Value"
  badge_color TEXT, -- e.g., "blue", "green"
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_plans_plan_name ON subscription_plans(plan_name);
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort_order ON subscription_plans(sort_order);

-- Comments
COMMENT ON TABLE subscription_plans IS 'Subscription plan definitions (Starter, Pro, Enterprise)';
COMMENT ON COLUMN subscription_plans.features IS 'JSONB object containing plan features and limits';
COMMENT ON COLUMN subscription_plans.discount_yearly_percent IS 'Percentage discount for yearly billing';

-- ============================================================================
-- TENANT SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription status
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN (
    'trial',        -- Free trial period
    'active',       -- Paid and active
    'past_due',     -- Payment failed, grace period
    'suspended',    -- Manually suspended by admin
    'cancelled',    -- Cancelled by user/admin
    'expired'       -- Trial or subscription expired
  )),
  
  -- Billing
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  billing_email TEXT,
  
  -- Period tracking
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  trial_ends_at DATE,
  cancelled_at TIMESTAMPTZ,
  
  -- Renewal settings
  auto_renew BOOLEAN DEFAULT true,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Payment tracking
  last_payment_date DATE,
  last_payment_amount DECIMAL(10, 2),
  next_payment_date DATE,
  next_payment_amount DECIMAL(10, 2),
  
  -- Usage tracking (current period)
  usage_data JSONB DEFAULT '{}'::jsonb,
  /* Example usage_data structure:
  {
    "products_count": 45,
    "users_count": 3,
    "ai_credits_used": 750,
    "storage_used_gb": 5.2,
    "api_calls_today": 450
  }
  */
  
  -- External IDs (for payment providers)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Notes
  cancellation_reason TEXT,
  admin_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_plan_id ON tenant_subscriptions(plan_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_current_period_end ON tenant_subscriptions(current_period_end);
CREATE INDEX idx_tenant_subscriptions_next_payment_date ON tenant_subscriptions(next_payment_date);

-- Unique constraint: One active subscription per tenant
CREATE UNIQUE INDEX idx_tenant_subscriptions_tenant_active 
  ON tenant_subscriptions(tenant_id) 
  WHERE status IN ('trial', 'active', 'past_due');

-- Comments
COMMENT ON TABLE tenant_subscriptions IS 'Tenant subscription records with billing and usage tracking';
COMMENT ON COLUMN tenant_subscriptions.usage_data IS 'Current period usage metrics (JSONB)';
COMMENT ON COLUMN tenant_subscriptions.cancel_at_period_end IS 'If true, subscription will not auto-renew';

-- ============================================================================
-- SUBSCRIPTION HISTORY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  
  -- Event tracking
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created',
    'plan_changed',
    'status_changed',
    'renewed',
    'cancelled',
    'suspended',
    'reactivated',
    'trial_started',
    'trial_ended',
    'trial_converted'
  )),
  
  -- Old and new values
  old_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  old_status TEXT,
  new_status TEXT,
  
  -- Details
  description TEXT,
  changed_by UUID REFERENCES auth.users(id), -- NULL = system
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscription_history_tenant_id ON subscription_history(tenant_id);
CREATE INDEX idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_event_type ON subscription_history(event_type);
CREATE INDEX idx_subscription_history_created_at ON subscription_history(created_at DESC);

-- Comments
COMMENT ON TABLE subscription_history IS 'Audit trail for subscription changes';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger for subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for tenant_subscriptions
CREATE TRIGGER update_tenant_subscriptions_updated_at
  BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track subscription changes
CREATE OR REPLACE FUNCTION track_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Track plan changes
  IF TG_OP = 'UPDATE' AND NEW.plan_id != OLD.plan_id THEN
    INSERT INTO subscription_history (
      tenant_id, subscription_id, event_type, 
      old_plan_id, new_plan_id, description
    ) VALUES (
      NEW.tenant_id, NEW.id, 'plan_changed',
      OLD.plan_id, NEW.plan_id,
      'Subscription plan changed'
    );
  END IF;
  
  -- Track status changes
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
    INSERT INTO subscription_history (
      tenant_id, subscription_id, event_type,
      old_status, new_status, description
    ) VALUES (
      NEW.tenant_id, NEW.id, 'status_changed',
      OLD.status, NEW.status,
      'Subscription status changed from ' || OLD.status || ' to ' || NEW.status
    );
  END IF;
  
  -- Track new subscriptions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO subscription_history (
      tenant_id, subscription_id, event_type, 
      new_plan_id, new_status, description
    ) VALUES (
      NEW.tenant_id, NEW.id, 'created',
      NEW.plan_id, NEW.status,
      'Subscription created'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_tenant_subscription_changes
  AFTER INSERT OR UPDATE ON tenant_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION track_subscription_changes();

-- ============================================================================
-- SEED DATA: Default Subscription Plans
-- ============================================================================

INSERT INTO subscription_plans (
  plan_name, display_name, description, tagline,
  price_monthly, price_yearly, discount_yearly_percent,
  features, is_popular, sort_order, badge_text, badge_color
) VALUES 
(
  'starter',
  'Starter',
  'Küçük işletmeler için ideal başlangıç planı',
  'Hemen başlayın',
  299.00,
  2990.00,
  17, -- ~17% discount
  '{
    "max_products": 100,
    "max_users": 3,
    "max_marketplaces": 2,
    "ai_credits_monthly": 500,
    "storage_gb": 5,
    "api_calls_per_day": 500,
    "n8n_workflows": 3,
    "advanced_analytics": false,
    "priority_support": false,
    "custom_integrations": false,
    "white_label": false
  }'::jsonb,
  false,
  1,
  NULL,
  NULL
),
(
  'professional',
  'Professional',
  'Büyüyen işletmeler için güçlü özellikler',
  'En popüler',
  799.00,
  7990.00,
  17,
  '{
    "max_products": 1000,
    "max_users": 10,
    "max_marketplaces": 5,
    "ai_credits_monthly": 2000,
    "storage_gb": 25,
    "api_calls_per_day": 2000,
    "n8n_workflows": 10,
    "advanced_analytics": true,
    "priority_support": true,
    "custom_integrations": false,
    "white_label": false
  }'::jsonb,
  true,
  2,
  'En Popüler',
  'blue'
),
(
  'enterprise',
  'Enterprise',
  'Kurumsal çözümler ve sınırsız özellikler',
  'Tam kontrol',
  1999.00,
  19990.00,
  17,
  '{
    "max_products": -1,
    "max_users": -1,
    "max_marketplaces": -1,
    "ai_credits_monthly": -1,
    "storage_gb": -1,
    "api_calls_per_day": -1,
    "n8n_workflows": -1,
    "advanced_analytics": true,
    "priority_support": true,
    "custom_integrations": true,
    "white_label": true
  }'::jsonb,
  false,
  3,
  'Kurumsal',
  'purple'
)
ON CONFLICT (plan_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  updated_at = NOW();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public read, super admin write
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Tenant Subscriptions: Tenant users can view their own, super admins can view all
CREATE POLICY "Users can view their tenant subscription"
  ON tenant_subscriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all subscriptions"
  ON tenant_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Subscription History: Same as tenant_subscriptions
CREATE POLICY "Users can view their subscription history"
  ON subscription_history FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Active subscriptions with plan details
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT 
  ts.id,
  ts.tenant_id,
  t.company_name,
  sp.plan_name,
  sp.display_name as plan_display_name,
  ts.status,
  ts.billing_cycle,
  ts.current_period_start,
  ts.current_period_end,
  ts.next_payment_date,
  ts.next_payment_amount,
  ts.auto_renew,
  ts.usage_data,
  sp.features as plan_features,
  ts.created_at
FROM tenant_subscriptions ts
JOIN tenants t ON t.id = ts.tenant_id
JOIN subscription_plans sp ON sp.id = ts.plan_id
WHERE ts.status IN ('trial', 'active', 'past_due');

COMMENT ON VIEW active_subscriptions_view IS 'Active subscriptions with tenant and plan details';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 061: Subscription schema created successfully!';
  RAISE NOTICE '📦 Created tables: subscription_plans, tenant_subscriptions, subscription_history';
  RAISE NOTICE '🌱 Seeded 3 default plans: Starter, Professional, Enterprise';
  RAISE NOTICE '🔒 RLS policies enabled';
END $$;

