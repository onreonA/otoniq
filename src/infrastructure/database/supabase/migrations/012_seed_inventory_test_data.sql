-- 012_seed_inventory_test_data.sql
-- Bu migration, mevcut Products tablosundan inventory test verisi oluşturur

-- ADIM 1: Tüm tenant'lara "Ana Depo" oluştur
INSERT INTO public.warehouses (
  tenant_id,
  code,
  name,
  description,
  address,
  city,
  state,
  country,
  postal_code,
  phone,
  email,
  manager_name,
  is_active,
  is_primary,
  total_capacity,
  current_usage,
  created_by,
  updated_by
)
SELECT DISTINCT
  p.tenant_id,
  'WH-MAIN-001',
  'Ana Depo',
  'Merkezi ana depo',
  'Ana Cadde No:123',
  'İstanbul',
  'Marmara',
  'Türkiye',
  '34000',
  '+90 212 555 0001',
  'ana.depo@otoniq.ai',
  'Depo Müdürü',
  true,
  true,
  10000.00,
  0.00,
  -- created_by = ilk user veya NULL
  (SELECT id FROM public.users WHERE tenant_id = p.tenant_id LIMIT 1),
  -- updated_by = ilk user veya NULL
  (SELECT id FROM public.users WHERE tenant_id = p.tenant_id LIMIT 1)
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.warehouses w
  WHERE w.tenant_id = p.tenant_id AND w.code = 'WH-MAIN-001'
)
GROUP BY p.tenant_id;

-- ADIM 2: İkincil depo ekle (opsiyonel)
INSERT INTO public.warehouses (
  tenant_id,
  code,
  name,
  description,
  city,
  is_active,
  is_primary,
  total_capacity,
  created_by,
  updated_by
)
SELECT DISTINCT
  p.tenant_id,
  'WH-SEC-002',
  'Yedek Depo',
  'İkincil yedek depo',
  'Ankara',
  true,
  false,
  5000.00,
  (SELECT id FROM public.users WHERE tenant_id = p.tenant_id LIMIT 1),
  (SELECT id FROM public.users WHERE tenant_id = p.tenant_id LIMIT 1)
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.warehouses w
  WHERE w.tenant_id = p.tenant_id AND w.code = 'WH-SEC-002'
)
GROUP BY p.tenant_id;

-- ADIM 3: Products tablosundaki her ürün için stock_levels oluştur
-- Ana depoda stok oluştur
INSERT INTO public.stock_levels (
  tenant_id,
  product_id,
  warehouse_id,
  quantity,
  reserved_quantity,
  minimum_quantity,
  maximum_quantity,
  aisle,
  rack,
  shelf,
  bin
)
SELECT
  p.tenant_id,
  p.id,
  w.id,
  -- Rastgele stok miktarları (50-500 arası)
  (RANDOM() * 450 + 50)::INTEGER,
  -- Reserved quantity (0-50 arası)
  (RANDOM() * 50)::INTEGER,
  -- Minimum quantity / reorder point (10-50 arası)
  (RANDOM() * 40 + 10)::INTEGER,
  -- Maximum quantity (500-1000 arası)
  (RANDOM() * 500 + 500)::INTEGER,
  -- Location bilgileri (A-Z arası aisle, 1-10 raf, 1-5 shelf, 1-20 bin)
  CHR(65 + (RANDOM() * 25)::INTEGER), -- A-Z
  (RANDOM() * 9 + 1)::INTEGER::TEXT,  -- 1-10
  (RANDOM() * 4 + 1)::INTEGER::TEXT,  -- 1-5
  (RANDOM() * 19 + 1)::INTEGER::TEXT  -- 1-20
FROM public.products p
INNER JOIN public.warehouses w ON w.tenant_id = p.tenant_id AND w.is_primary = true
WHERE NOT EXISTS (
  SELECT 1 FROM public.stock_levels sl
  WHERE sl.product_id = p.id AND sl.warehouse_id = w.id
);

-- ADIM 4: İkincil depoda da stok oluştur (daha düşük miktarlar)
INSERT INTO public.stock_levels (
  tenant_id,
  product_id,
  warehouse_id,
  quantity,
  reserved_quantity,
  minimum_quantity,
  maximum_quantity,
  aisle,
  rack,
  shelf,
  bin
)
SELECT
  p.tenant_id,
  p.id,
  w.id,
  -- Daha düşük stok miktarları (10-200 arası)
  (RANDOM() * 190 + 10)::INTEGER,
  -- Reserved quantity (0-20 arası)
  (RANDOM() * 20)::INTEGER,
  -- Minimum quantity / reorder point (5-20 arası)
  (RANDOM() * 15 + 5)::INTEGER,
  -- Maximum quantity (200-500 arası)
  (RANDOM() * 300 + 200)::INTEGER,
  -- Location bilgileri
  CHR(65 + (RANDOM() * 25)::INTEGER),
  (RANDOM() * 9 + 1)::INTEGER::TEXT,
  (RANDOM() * 4 + 1)::INTEGER::TEXT,
  (RANDOM() * 19 + 1)::INTEGER::TEXT
FROM public.products p
INNER JOIN public.warehouses w ON w.tenant_id = p.tenant_id AND w.is_primary = false
WHERE NOT EXISTS (
  SELECT 1 FROM public.stock_levels sl
  WHERE sl.product_id = p.id AND sl.warehouse_id = w.id
)
-- Sadece her 2 üründen birini ikincil depoda da oluştur (rastgele seçim)
AND RANDOM() > 0.5;

-- ADIM 5: İlk stok hareketi kayıtları oluştur (initial stock)
INSERT INTO public.stock_movements (
  tenant_id,
  product_id,
  warehouse_id,
  movement_type,
  quantity,
  quantity_before,
  quantity_after,
  unit_cost,
  total_cost,
  reference_type,
  reference_number,
  notes,
  created_by
)
SELECT
  sl.tenant_id,
  sl.product_id,
  sl.warehouse_id,
  'purchase'::text, -- İlk stok girişi
  sl.quantity,
  0, -- Quantity before (başlangıç 0)
  sl.quantity, -- Quantity after
  (RANDOM() * 100 + 20)::NUMERIC(10,2), -- Unit cost (20-120 arası)
  (sl.quantity * (RANDOM() * 100 + 20))::NUMERIC(10,2), -- Total cost
  'initial_stock',
  'INIT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 5, '0'),
  'İlk stok girişi (otomatik oluşturuldu)',
  (SELECT id FROM public.users WHERE tenant_id = sl.tenant_id LIMIT 1)
FROM public.stock_levels sl
WHERE NOT EXISTS (
  SELECT 1 FROM public.stock_movements sm
  WHERE sm.product_id = sl.product_id
  AND sm.warehouse_id = sl.warehouse_id
  AND sm.movement_type = 'purchase'
);

-- ADIM 6: Warehouse capacity'yi güncelle
UPDATE public.warehouses w
SET current_usage = (
  SELECT COALESCE(SUM(sl.quantity), 0)
  FROM public.stock_levels sl
  WHERE sl.warehouse_id = w.id
  AND sl.tenant_id = w.tenant_id
);

-- Doğrulama Log'ları
DO $$
DECLARE
  warehouse_count INTEGER;
  stock_level_count INTEGER;
  stock_movement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO warehouse_count FROM public.warehouses;
  SELECT COUNT(*) INTO stock_level_count FROM public.stock_levels;
  SELECT COUNT(*) INTO stock_movement_count FROM public.stock_movements;

  RAISE NOTICE '✅ Inventory Test Data Seed Complete!';
  RAISE NOTICE '   - Warehouses created: %', warehouse_count;
  RAISE NOTICE '   - Stock levels created: %', stock_level_count;
  RAISE NOTICE '   - Stock movements created: %', stock_movement_count;
END $$;

