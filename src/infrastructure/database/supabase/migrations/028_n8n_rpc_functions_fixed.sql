-- ================================================
-- N8N RPC Functions for Workflow Data Access (FIXED)
-- ================================================
-- Created: 2025-10-16
-- Purpose: RPC functions that N8N workflows can call via HTTP Request

-- ================================================
-- STEP 1: Drop existing conflicting functions
-- ================================================
DROP FUNCTION IF EXISTS get_daily_sales_report(UUID);
DROP FUNCTION IF EXISTS get_low_stock_products(UUID, INT);
DROP FUNCTION IF EXISTS get_low_stock_products(UUID);
DROP FUNCTION IF EXISTS get_order_notification_data(UUID);

-- ================================================
-- STEP 2: Daily Sales Report Function
-- ================================================
CREATE OR REPLACE FUNCTION get_daily_sales_report(
  p_tenant_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_total_sales NUMERIC;
  v_total_orders BIGINT;
  v_avg_order_value NUMERIC;
  v_top_product TEXT;
  v_tenant_email TEXT;
BEGIN
  -- Get tenant email
  SELECT email INTO v_tenant_email
  FROM profiles 
  WHERE tenant_id = p_tenant_id 
  LIMIT 1;

  -- If no email found, use a default
  IF v_tenant_email IS NULL THEN
    v_tenant_email := 'admin@otoniq.ai';
  END IF;

  -- Get yesterday's sales data
  SELECT 
    COALESCE(SUM(o.total_amount), 0),
    COUNT(o.id),
    COALESCE(AVG(o.total_amount), 0)
  INTO v_total_sales, v_total_orders, v_avg_order_value
  FROM orders o
  WHERE o.tenant_id = p_tenant_id
    AND DATE(o.created_at) = CURRENT_DATE - INTERVAL '1 day';

  -- Get top product
  SELECT p.name INTO v_top_product
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE oi.order_id IN (
    SELECT id FROM orders 
    WHERE tenant_id = p_tenant_id 
    AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
  )
  GROUP BY p.id, p.name
  ORDER BY SUM(oi.quantity) DESC
  LIMIT 1;

  -- Build JSON response
  v_result := json_build_object(
    'tenant_id', p_tenant_id,
    'tenant_email', v_tenant_email,
    'report_date', (CURRENT_DATE - INTERVAL '1 day')::TEXT,
    'total_sales', ROUND(v_total_sales, 2),
    'total_orders', v_total_orders,
    'avg_order_value', ROUND(v_avg_order_value, 2),
    'top_product', COALESCE(v_top_product, 'N/A'),
    'currency', 'TRY'
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'tenant_id', p_tenant_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_daily_sales_report(UUID) TO anon, authenticated;

-- ================================================
-- STEP 3: Low Stock Products Function
-- ================================================
CREATE OR REPLACE FUNCTION get_low_stock_products(
  p_tenant_id UUID,
  p_threshold INT DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_products JSON;
  v_low_stock_count BIGINT;
  v_tenant_email TEXT;
BEGIN
  -- Get tenant email
  SELECT email INTO v_tenant_email
  FROM profiles 
  WHERE tenant_id = p_tenant_id 
  LIMIT 1;

  -- If no email found, use a default
  IF v_tenant_email IS NULL THEN
    v_tenant_email := 'admin@otoniq.ai';
  END IF;

  -- Get products with stock below threshold
  SELECT 
    COUNT(*),
    json_agg(
      json_build_object(
        'product_id', p.id,
        'name', p.name,
        'sku', p.sku,
        'stock', COALESCE(s.available_quantity, 0),
        'price', p.price,
        'currency', 'TRY'
      )
    )
  INTO v_low_stock_count, v_products
  FROM products p
  LEFT JOIN (
    SELECT 
      product_id,
      SUM(available_quantity) as available_quantity
    FROM stock_levels
    GROUP BY product_id
  ) s ON s.product_id = p.id
  WHERE p.tenant_id = p_tenant_id
    AND COALESCE(s.available_quantity, 0) < p_threshold;

  -- Build JSON response
  v_result := json_build_object(
    'tenant_id', p_tenant_id,
    'tenant_email', v_tenant_email,
    'threshold', p_threshold,
    'low_stock_count', COALESCE(v_low_stock_count, 0),
    'products', COALESCE(v_products, '[]'::json),
    'timestamp', NOW()
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'tenant_id', p_tenant_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_low_stock_products(UUID, INT) TO anon, authenticated;

-- ================================================
-- STEP 4: New Order Notification Function
-- ================================================
CREATE OR REPLACE FUNCTION get_order_notification_data(
  p_order_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_tenant_id UUID;
  v_tenant_email TEXT;
BEGIN
  -- Get tenant_id from order
  SELECT tenant_id INTO v_tenant_id
  FROM orders
  WHERE id = p_order_id;

  -- Get tenant email
  SELECT email INTO v_tenant_email
  FROM profiles 
  WHERE tenant_id = v_tenant_id 
  LIMIT 1;

  -- If no email found, use a default
  IF v_tenant_email IS NULL THEN
    v_tenant_email := 'admin@otoniq.ai';
  END IF;

  -- Get order details with customer and items
  SELECT json_build_object(
    'order_id', o.id,
    'order_number', o.order_number,
    'tenant_id', o.tenant_id,
    'tenant_email', v_tenant_email,
    'customer_name', COALESCE(c.full_name, 'N/A'),
    'customer_email', COALESCE(c.email, 'N/A'),
    'customer_phone', COALESCE(c.phone, 'N/A'),
    'total_amount', o.total_amount,
    'currency', 'TRY',
    'payment_status', o.payment_status,
    'shipping_status', o.shipping_status,
    'items_count', (SELECT COUNT(*) FROM order_items WHERE order_id = o.id),
    'items', COALESCE((
      SELECT json_agg(
        json_build_object(
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price
        )
      )
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = o.id
    ), '[]'::json),
    'created_at', o.created_at,
    'timestamp', NOW()
  ) INTO v_result
  FROM orders o
  LEFT JOIN customers c ON c.id = o.customer_id
  WHERE o.id = p_order_id;

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'order_id', p_order_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_order_notification_data(UUID) TO anon, authenticated;

-- ================================================
-- Comments
-- ================================================
COMMENT ON FUNCTION get_daily_sales_report(UUID) IS 'Returns daily sales report for N8N workflow automation. Returns JSON with sales data or error.';
COMMENT ON FUNCTION get_low_stock_products(UUID, INT) IS 'Returns list of products with stock below threshold for N8N alerts. Returns JSON with product list or error.';
COMMENT ON FUNCTION get_order_notification_data(UUID) IS 'Returns order details for N8N notification workflow. Returns JSON with order data or error.';

-- ================================================
-- Verification Query (for testing)
-- ================================================
-- Test daily sales report:
-- SELECT get_daily_sales_report('test-tenant-id'::UUID);

-- Test low stock alert:
-- SELECT get_low_stock_products('test-tenant-id'::UUID, 10);

