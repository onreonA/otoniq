-- ================================================
-- Audit Logs System (Fixed - with DROP IF EXISTS)
-- ================================================
-- Created: 2025-10-16
-- Purpose: Track all critical user actions for security and compliance

-- ================================================
-- Drop existing objects if they exist
-- ================================================
DROP TRIGGER IF EXISTS audit_product_changes_trigger ON products;
DROP FUNCTION IF EXISTS audit_product_changes();
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();
DROP FUNCTION IF EXISTS create_audit_log(UUID, TEXT, UUID, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, INET, TEXT);

DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_tenant_id;
DROP INDEX IF EXISTS idx_audit_logs_action;
DROP INDEX IF EXISTS idx_audit_logs_resource_type;
DROP INDEX IF EXISTS idx_audit_logs_resource_id;
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_logs_ip_address;

DROP TABLE IF EXISTS audit_logs CASCADE;

-- ================================================
-- Audit Logs Table
-- ================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  tenant_id UUID,
  
  -- What
  action TEXT NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'settings_change'
  resource_type TEXT NOT NULL, -- 'user', 'product', 'order', 'workflow', 'integration', etc.
  resource_id TEXT,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Additional context (IP, device, location, etc.)
  
  -- When & Where
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Indexes for Performance
-- ================================================
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- ================================================
-- RLS Policies
-- ================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ================================================
-- Helper Function: Create Audit Log
-- ================================================
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_user_email TEXT,
  p_tenant_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    tenant_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_user_email,
    p_tenant_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_audit_log TO anon, authenticated;

-- ================================================
-- Automatic Audit Triggers for Critical Tables
-- ================================================

-- Product Changes Audit Trigger
CREATE OR REPLACE FUNCTION audit_product_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NEW.tenant_id,
      'create',
      'product',
      NEW.id::TEXT,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'auto', 'operation', TG_OP),
      NULL,
      NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      NEW.tenant_id,
      'update',
      'product',
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'auto', 'operation', TG_OP),
      NULL,
      NULL
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      OLD.tenant_id,
      'delete',
      'product',
      OLD.id::TEXT,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('trigger', 'auto', 'operation', TG_OP),
      NULL,
      NULL
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply trigger to products table
CREATE TRIGGER audit_product_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION audit_product_changes();

-- ================================================
-- Audit Log Cleanup Function (Keep last 90 days)
-- ================================================
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- ================================================
-- Comments
-- ================================================
COMMENT ON TABLE audit_logs IS 'Stores audit trail of all critical user actions for security and compliance';
COMMENT ON FUNCTION create_audit_log IS 'Helper function to create audit log entries from application code';
COMMENT ON FUNCTION audit_product_changes IS 'Automatic trigger function to audit product table changes';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Cleanup function to remove audit logs older than 90 days';

