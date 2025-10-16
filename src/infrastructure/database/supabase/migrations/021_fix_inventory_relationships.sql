/**
 * Fix Inventory Foreign Key Relationships
 * 
 * Purpose: Add missing foreign key constraints and ensure PostgREST can properly embed relationships
 */

-- =====================================================
-- 1. Add foreign key constraints if not exist
-- =====================================================

-- stock_movements -> products relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stock_movements_product_id_fkey'
  ) THEN
    ALTER TABLE stock_movements 
    ADD CONSTRAINT stock_movements_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- stock_movements -> warehouses relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stock_movements_warehouse_id_fkey'
  ) THEN
    ALTER TABLE stock_movements 
    ADD CONSTRAINT stock_movements_warehouse_id_fkey 
    FOREIGN KEY (warehouse_id) 
    REFERENCES warehouses(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- stock_movements -> related_warehouse relationship (optional)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stock_movements_related_warehouse_id_fkey'
  ) THEN
    ALTER TABLE stock_movements 
    ADD CONSTRAINT stock_movements_related_warehouse_id_fkey 
    FOREIGN KEY (related_warehouse_id) 
    REFERENCES warehouses(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- stock_levels -> products relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stock_levels_product_id_fkey'
  ) THEN
    ALTER TABLE stock_levels 
    ADD CONSTRAINT stock_levels_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- stock_levels -> warehouses relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stock_levels_warehouse_id_fkey'
  ) THEN
    ALTER TABLE stock_levels 
    ADD CONSTRAINT stock_levels_warehouse_id_fkey 
    FOREIGN KEY (warehouse_id) 
    REFERENCES warehouses(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 2. Add indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id 
ON stock_movements(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id 
ON stock_movements(warehouse_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at 
ON stock_movements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_levels_product_id 
ON stock_levels(product_id);

CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse_id 
ON stock_levels(warehouse_id);

-- =====================================================
-- 3. Verify relationships are working
-- =====================================================

-- Test query to verify relationships
DO $$ 
BEGIN
  -- Test stock_movements join
  PERFORM 1 FROM stock_movements sm
  LEFT JOIN products p ON sm.product_id = p.id
  LEFT JOIN warehouses w ON sm.warehouse_id = w.id
  LIMIT 1;
  
  -- Test stock_levels join
  PERFORM 1 FROM stock_levels sl
  LEFT JOIN products p ON sl.product_id = p.id
  LEFT JOIN warehouses w ON sl.warehouse_id = w.id
  LIMIT 1;
  
  RAISE NOTICE '✅ Inventory foreign key relationships verified successfully';
END $$;

