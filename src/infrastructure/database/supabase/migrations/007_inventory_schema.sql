-- =============================================
-- Migration 007: Inventory Management Schema
-- Description: Warehouses, stock levels, and stock movements
-- Dependencies: 002_products_schema.sql
-- =============================================

-- =============================================
-- WAREHOUSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS warehouses (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Basic information
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location details
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  
  -- Contact information
  phone VARCHAR(50),
  email VARCHAR(255),
  manager_name VARCHAR(255),
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  
  -- Capacity and metrics
  total_capacity DECIMAL(12, 2), -- Square meters or cubic meters
  current_usage DECIMAL(12, 2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_warehouses_tenant_id ON warehouses(tenant_id);
CREATE INDEX idx_warehouses_is_active ON warehouses(is_active);
CREATE INDEX idx_warehouses_code ON warehouses(code);

-- Unique constraint
CREATE UNIQUE INDEX unique_warehouses_tenant_code ON warehouses(tenant_id, code);

-- Comments
COMMENT ON TABLE warehouses IS 'Warehouse/depot locations for inventory management';
COMMENT ON COLUMN warehouses.is_primary IS 'Primary/default warehouse for tenant';
COMMENT ON COLUMN warehouses.total_capacity IS 'Total storage capacity (m² or m³)';

-- =============================================
-- STOCK LEVELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stock_levels (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- References
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Stock quantities
  quantity DECIMAL(12, 3) NOT NULL DEFAULT 0,
  reserved_quantity DECIMAL(12, 3) NOT NULL DEFAULT 0,
  available_quantity DECIMAL(12, 3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  
  -- Stock thresholds
  minimum_quantity DECIMAL(12, 3) DEFAULT 0, -- Reorder point
  maximum_quantity DECIMAL(12, 3), -- Maximum stock level
  
  -- Location details (within warehouse)
  aisle VARCHAR(50),
  rack VARCHAR(50),
  shelf VARCHAR(50),
  bin VARCHAR(50),
  
  -- Last stock count
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_counted_quantity DECIMAL(12, 3),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_stock_levels_tenant_id ON stock_levels(tenant_id);
CREATE INDEX idx_stock_levels_product_id ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_warehouse_id ON stock_levels(warehouse_id);
CREATE INDEX idx_stock_levels_available_quantity ON stock_levels(available_quantity);

-- Unique constraint (one record per product per warehouse)
CREATE UNIQUE INDEX unique_stock_levels_product_warehouse ON stock_levels(product_id, warehouse_id);

-- Check constraints
ALTER TABLE stock_levels ADD CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0);
ALTER TABLE stock_levels ADD CONSTRAINT check_reserved_non_negative CHECK (reserved_quantity >= 0);
ALTER TABLE stock_levels ADD CONSTRAINT check_reserved_not_exceed CHECK (reserved_quantity <= quantity);

-- Comments
COMMENT ON TABLE stock_levels IS 'Current stock levels for products in warehouses';
COMMENT ON COLUMN stock_levels.available_quantity IS 'Computed as quantity - reserved_quantity';
COMMENT ON COLUMN stock_levels.reserved_quantity IS 'Quantity reserved for orders/shipments';
COMMENT ON COLUMN stock_levels.minimum_quantity IS 'Reorder point - alert when stock falls below this';

-- =============================================
-- STOCK MOVEMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS stock_movements (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- References
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  
  -- Movement details
  movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
    'purchase',       -- Incoming from supplier
    'sale',          -- Outgoing from order
    'transfer_in',   -- Transfer from another warehouse
    'transfer_out',  -- Transfer to another warehouse
    'adjustment',    -- Manual adjustment
    'return',        -- Return from customer
    'production',    -- Manufactured/assembled
    'damage',        -- Damaged/lost stock
    'count',         -- Stock count adjustment
    'reservation',   -- Reserve stock
    'release'        -- Release reservation
  )),
  
  -- Quantity (positive for in, negative for out)
  quantity DECIMAL(12, 3) NOT NULL,
  
  -- Related warehouse (for transfers)
  related_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  
  -- Reference information
  reference_type VARCHAR(50), -- 'order', 'purchase_order', 'transfer', 'adjustment'
  reference_id UUID, -- ID of related order/transfer/etc
  reference_number VARCHAR(100), -- Human-readable reference
  
  -- Cost information (optional)
  unit_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),
  
  -- Stock levels snapshot
  quantity_before DECIMAL(12, 3),
  quantity_after DECIMAL(12, 3),
  
  -- Additional information
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_stock_movements_tenant_id ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- Comments
COMMENT ON TABLE stock_movements IS 'History of all stock movements (in/out/adjustments)';
COMMENT ON COLUMN stock_movements.quantity IS 'Positive for incoming, negative for outgoing';
COMMENT ON COLUMN stock_movements.related_warehouse_id IS 'For transfers: source or destination warehouse';

-- =============================================
-- TRIGGERS
-- =============================================

-- Update warehouses updated_at
CREATE TRIGGER trigger_update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update stock_levels updated_at
CREATE TRIGGER trigger_update_stock_levels_updated_at
  BEFORE UPDATE ON stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically log stock movements when stock_levels change
CREATE OR REPLACE FUNCTION log_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if quantity actually changed
  IF (TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity) THEN
    INSERT INTO stock_movements (
      tenant_id,
      product_id,
      warehouse_id,
      movement_type,
      quantity,
      quantity_before,
      quantity_after,
      notes,
      created_by
    ) VALUES (
      NEW.tenant_id,
      NEW.product_id,
      NEW.warehouse_id,
      'adjustment',
      NEW.quantity - OLD.quantity,
      OLD.quantity,
      NEW.quantity,
      'Automatic adjustment log',
      NEW.updated_by
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-log stock movements (optional, can be disabled if manual logging is preferred)
-- CREATE TRIGGER trigger_log_stock_movement
--   AFTER UPDATE ON stock_levels
--   FOR EACH ROW
--   EXECUTE FUNCTION log_stock_movement();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Warehouses Policies
CREATE POLICY "Users can view their tenant's warehouses"
  ON warehouses FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage warehouses"
  ON warehouses FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Stock Levels Policies
CREATE POLICY "Users can view their tenant's stock levels"
  ON stock_levels FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can manage stock levels"
  ON stock_levels FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- Stock Movements Policies (read-only for most users, write for admins)
CREATE POLICY "Users can view their tenant's stock movements"
  ON stock_movements FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admins can create stock movements"
  ON stock_movements FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('tenant_admin', 'super_admin'))
  );

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Stock status summary per product
CREATE OR REPLACE VIEW stock_status_view AS
SELECT 
  sl.tenant_id,
  sl.product_id,
  p.sku,
  p.name AS product_name,
  SUM(sl.quantity) AS total_quantity,
  SUM(sl.reserved_quantity) AS total_reserved,
  SUM(sl.available_quantity) AS total_available,
  COUNT(DISTINCT sl.warehouse_id) AS warehouse_count,
  CASE 
    WHEN SUM(sl.available_quantity) <= 0 THEN 'out_of_stock'
    WHEN SUM(sl.available_quantity) < MIN(sl.minimum_quantity) THEN 'low_stock'
    WHEN SUM(sl.available_quantity) > MAX(sl.maximum_quantity) THEN 'overstock'
    ELSE 'in_stock'
  END AS stock_status
FROM stock_levels sl
INNER JOIN products p ON sl.product_id = p.id
GROUP BY sl.tenant_id, sl.product_id, p.sku, p.name;

-- View: Stock alerts (products below minimum)
CREATE OR REPLACE VIEW stock_alerts_view AS
SELECT 
  sl.tenant_id,
  sl.product_id,
  p.sku,
  p.name AS product_name,
  w.name AS warehouse_name,
  sl.available_quantity,
  sl.minimum_quantity,
  sl.minimum_quantity - sl.available_quantity AS shortage
FROM stock_levels sl
INNER JOIN products p ON sl.product_id = p.id
INNER JOIN warehouses w ON sl.warehouse_id = w.id
WHERE sl.available_quantity < sl.minimum_quantity
  AND sl.minimum_quantity > 0
ORDER BY (sl.minimum_quantity - sl.available_quantity) DESC;

-- =============================================
-- SEED DATA (Optional)
-- =============================================

-- Insert default warehouse for each tenant
INSERT INTO warehouses (tenant_id, code, name, description, is_primary)
SELECT 
  t.id,
  'WH-MAIN',
  'Ana Depo',
  'Varsayılan merkezi depo',
  true
FROM tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM warehouses WHERE tenant_id = t.id AND code = 'WH-MAIN'
);

-- Add table comments
COMMENT ON TABLE warehouses IS 'Warehouse/depot locations';
COMMENT ON TABLE stock_levels IS 'Current stock levels per product per warehouse';
COMMENT ON TABLE stock_movements IS 'Historical record of all stock changes';

