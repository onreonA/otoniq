-- ============================================================================
-- OTONIQ.AI - Initial Database Schema
-- Migration 001: Core tables (tenants, users)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TENANTS TABLE (Multi-tenant core)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  domain TEXT UNIQUE, -- subdomain için: firma-a.otoniq.ai
  subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
  
  -- External integrations
  n8n_webhook_url TEXT,
  odoo_api_config JSONB, -- {url, db, username, password (encrypted)}
  shopify_store_config JSONB, -- {store_url, api_key, access_token}
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenants_domain ON tenants(domain);
CREATE INDEX idx_tenants_subscription_status ON tenants(subscription_status);

-- Comments
COMMENT ON TABLE tenants IS 'Multi-tenant organizasyonları (müşteriler/firmalar)';
COMMENT ON COLUMN tenants.domain IS 'Subdomain veya custom domain';
COMMENT ON COLUMN tenants.odoo_api_config IS 'Odoo ERP API konfigürasyonu (encrypted)';
COMMENT ON COLUMN tenants.shopify_store_config IS 'Shopify mağaza konfigürasyonu (encrypted)';

-- ============================================================================
-- USERS TABLE (Hem super admin hem tenant kullanıcıları)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL ise super admin
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'tenant_user' CHECK (role IN ('super_admin', 'tenant_admin', 'tenant_user')),
  full_name TEXT,
  avatar_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Comments
COMMENT ON TABLE users IS 'Kullanıcılar (super admin + tenant kullanıcıları)';
COMMENT ON COLUMN users.tenant_id IS 'NULL ise super admin, değer varsa tenant kullanıcısı';
COMMENT ON COLUMN users.role IS 'super_admin: tüm sistem erişimi, tenant_admin: tenant yönetimi, tenant_user: kısıtlı erişim';

-- ============================================================================
-- TRIGGERS (Updated_at otomatik güncelleme)
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - Temel politikalar
-- ============================================================================

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- TENANTS POLICIES
-- Super admin tüm tenant'ları görebilir
CREATE POLICY "Super admins can view all tenants"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Super admin tenant oluşturabilir
CREATE POLICY "Super admins can create tenants"
  ON tenants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Super admin tenant güncelleyebilir
CREATE POLICY "Super admins can update tenants"
  ON tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Tenant admin kendi tenant'ını görebilir
CREATE POLICY "Tenant admins can view their tenant"
  ON tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- USERS POLICIES
-- Super admin tüm kullanıcıları görebilir
CREATE POLICY "Super admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'super_admin'
    )
  );

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Kullanıcılar kendi tenant'larındaki diğer kullanıcıları görebilir
CREATE POLICY "Users can view same tenant users"
  ON users FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Tenant admin kendi tenant'ındaki kullanıcıları yönetebilir
CREATE POLICY "Tenant admins can manage their tenant users"
  ON users FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('tenant_admin', 'super_admin')
    )
  );

-- ============================================================================
-- SEED DATA (İlk super admin kullanıcısı)
-- ============================================================================
-- NOT: Bu manuel olarak çalıştırılmalı ve gerçek user ID ile değiştirilmeli
-- 
-- INSERT INTO users (id, tenant_id, email, role, full_name)
-- VALUES (
--   'auth_user_uuid_here', -- Supabase auth'dan alınacak
--   NULL, -- super admin için tenant_id NULL
--   'admin@otoniq.ai',
--   'super_admin',
--   'Super Admin'
-- );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin'
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMPLETED: Migration 001
-- ============================================================================

