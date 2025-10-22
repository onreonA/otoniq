-- ============================================================================
-- OTONIQ.AI - Add Odoo Company Fields
-- Migration 081: Add Odoo company-specific fields to tenants table
-- ============================================================================

-- Add Odoo company-specific fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS odoo_company_id INTEGER,
ADD COLUMN IF NOT EXISTS odoo_company_name TEXT,
ADD COLUMN IF NOT EXISTS odoo_connection_status TEXT DEFAULT 'not_configured' 
  CHECK (odoo_connection_status IN ('not_configured', 'connected', 'failed', 'testing'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_odoo_company_id ON tenants(odoo_company_id);
CREATE INDEX IF NOT EXISTS idx_tenants_odoo_connection_status ON tenants(odoo_connection_status);

-- Add comments for documentation
COMMENT ON COLUMN tenants.odoo_company_id IS 'Odoo company ID (1=NSL, 2=Woodntry)';
COMMENT ON COLUMN tenants.odoo_company_name IS 'Odoo company name for display';
COMMENT ON COLUMN tenants.odoo_connection_status IS 'Odoo connection status';

-- Update existing tenants with default Odoo company info if they have odoo_api_config
UPDATE tenants 
SET 
  odoo_company_id = CASE 
    WHEN company_name ILIKE '%NSL%' THEN 1
    WHEN company_name ILIKE '%Woodntry%' THEN 2
    ELSE 1
  END,
  odoo_company_name = CASE 
    WHEN company_name ILIKE '%NSL%' THEN 'NSL Savunma Ve Bilişim AŞ'
    WHEN company_name ILIKE '%Woodntry%' THEN 'Woodntry E-ticaret Pazarlama AŞ'
    ELSE company_name
  END
WHERE odoo_api_config IS NOT NULL;

-- Create a function to get Odoo company options
CREATE OR REPLACE FUNCTION get_odoo_company_options()
RETURNS TABLE(
  id INTEGER,
  name TEXT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    1::INTEGER as id,
    'NSL Savunma Ve Bilişim AŞ'::TEXT as name,
    'NSL Savunma Ve Bilişim Sanayi Ve Ticaret Anonim Şirketi'::TEXT as description
  UNION ALL
  SELECT 
    2::INTEGER as id,
    'Woodntry E-ticaret Pazarlama AŞ'::TEXT as name,
    'Woodntry Mobilya E-ticaret Pazarlama Anonim Şirketi'::TEXT as description;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for Odoo company access
CREATE POLICY "Users can view Odoo company info" ON tenants
  FOR SELECT
  USING (
    id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- Add RLS policy for updating Odoo company info
CREATE POLICY "Super admins can update Odoo company info" ON tenants
  FOR UPDATE
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );
