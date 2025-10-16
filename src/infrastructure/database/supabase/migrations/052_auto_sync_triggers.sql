-- ============================================================================
-- Migration 052: Auto-Sync Triggers for Stock and Price Changes
-- ============================================================================
-- This migration adds triggers that automatically create sync queue entries
-- when stock movements or product prices change

-- Function: When stock_movements happens, create sync queue
CREATE OR REPLACE FUNCTION trigger_platform_sync_on_stock_change()
RETURNS TRIGGER AS $$
DECLARE
  v_product_barcode TEXT;
  v_product_id UUID;
  v_tenant_id UUID;
  v_new_quantity DECIMAL;
BEGIN
  -- Get product details
  SELECT p.barcode, p.id, p.tenant_id, sl.quantity
  INTO v_product_barcode, v_product_id, v_tenant_id, v_new_quantity
  FROM products p
  LEFT JOIN stock_levels sl ON sl.product_id = p.id
  WHERE p.id = NEW.product_id
  LIMIT 1;
  
  -- Only sync if barcode exists
  IF v_product_barcode IS NOT NULL AND v_product_barcode != '' THEN
    -- Insert into sync queue
    INSERT INTO platform_sync_queue (
      tenant_id,
      product_id,
      barcode,
      change_type,
      source_platform,
      target_platforms,
      change_data,
      priority
    )
    SELECT
      v_tenant_id,
      v_product_id,
      v_product_barcode,
      'stock',
      'otoniq', -- Source is internal system
      ARRAY_AGG(DISTINCT platform), -- Get all platforms for this product
      jsonb_build_object(
        'movement_type', NEW.movement_type,
        'quantity_change', NEW.quantity,
        'new_total_quantity', v_new_quantity,
        'warehouse_id', NEW.warehouse_id,
        'reference', NEW.reference_number
      ),
      2 -- High priority for stock changes
    FROM product_platform_mappings
    WHERE product_id = v_product_id
      AND sync_status = 'active'
    HAVING COUNT(*) > 0; -- Only if product is synced to at least one platform
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After stock movement insert
DROP TRIGGER IF EXISTS after_stock_movement_sync ON stock_movements;
CREATE TRIGGER after_stock_movement_sync
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_platform_sync_on_stock_change();

-- Function: When product price changes, create sync queue
CREATE OR REPLACE FUNCTION trigger_platform_sync_on_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price OR 
     OLD.compare_at_price IS DISTINCT FROM NEW.compare_at_price THEN
    
    -- Only sync if barcode exists
    IF NEW.barcode IS NOT NULL AND NEW.barcode != '' THEN
      INSERT INTO platform_sync_queue (
        tenant_id,
        product_id,
        barcode,
        change_type,
        source_platform,
        target_platforms,
        change_data,
        priority
      )
      SELECT
        NEW.tenant_id,
        NEW.id,
        NEW.barcode,
        'price',
        'otoniq',
        ARRAY_AGG(DISTINCT platform),
        jsonb_build_object(
          'old_price', OLD.price,
          'new_price', NEW.price,
          'old_compare_at_price', OLD.compare_at_price,
          'new_compare_at_price', NEW.compare_at_price
        ),
        3 -- Medium priority for price changes
      FROM product_platform_mappings
      WHERE product_id = NEW.id
        AND sync_status = 'active'
      HAVING COUNT(*) > 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After product price update
DROP TRIGGER IF EXISTS after_product_price_sync ON products;
CREATE TRIGGER after_product_price_sync
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_platform_sync_on_price_change();

-- Comments
COMMENT ON FUNCTION trigger_platform_sync_on_stock_change() IS 'Auto-creates sync queue entries when stock changes';
COMMENT ON FUNCTION trigger_platform_sync_on_price_change() IS 'Auto-creates sync queue entries when price changes';
