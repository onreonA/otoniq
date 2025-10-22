-- ============================================================================
-- OTONIQ.AI - Manuel Odoo Company Setup
-- Güvenli SQL komutları - veri kaybı yok
-- ============================================================================

-- 1. Odoo company alanlarını ekle (eğer yoksa)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS odoo_company_id INTEGER,
ADD COLUMN IF NOT EXISTS odoo_company_name TEXT,
ADD COLUMN IF NOT EXISTS odoo_connection_status TEXT DEFAULT 'not_configured' 
  CHECK (odoo_connection_status IN ('not_configured', 'connected', 'failed', 'testing'));

-- 2. Index'leri ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_tenants_odoo_company_id ON tenants(odoo_company_id);
CREATE INDEX IF NOT EXISTS idx_tenants_odoo_connection_status ON tenants(odoo_connection_status);

-- 3. Mevcut tenant'lara company_id ata
-- NSL Savunma için company_id = 1
UPDATE tenants 
SET 
  odoo_company_id = 1,
  odoo_company_name = 'NSL Savunma Ve Bilişim AŞ',
  odoo_connection_status = 'not_configured'
WHERE company_name ILIKE '%NSL%' 
  AND odoo_company_id IS NULL;

-- Woodntry için company_id = 2  
UPDATE tenants 
SET 
  odoo_company_id = 2,
  odoo_company_name = 'Woodntry E-ticaret Pazarlama AŞ',
  odoo_connection_status = 'not_configured'
WHERE company_name ILIKE '%Woodntry%' 
  AND odoo_company_id IS NULL;

-- 4. Diğer tenant'lar için varsayılan değer
UPDATE tenants 
SET 
  odoo_company_id = 1,
  odoo_company_name = company_name,
  odoo_connection_status = 'not_configured'
WHERE odoo_company_id IS NULL;

-- 5. Kontrol sorgusu - sonucu göster
SELECT 
  id,
  company_name,
  odoo_company_id,
  odoo_company_name,
  odoo_connection_status
FROM tenants 
ORDER BY created_at;
