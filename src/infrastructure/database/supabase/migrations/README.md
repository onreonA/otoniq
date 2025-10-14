# Database Migrations

## Migration Order

All migrations must be run in the following order:

### Core Migrations (Already Applied)

1. **001_initial_schema.sql** - Tenants and Users
2. **002_products_schema.sql** - Products and variants
3. **003_marketplace_schema.sql** - Marketplace connections
4. **004_orders_automation_schema.sql** - Orders and automation
5. **005_fix_products_schema.sql** - Product fixes

### New Migrations (Phase 5)

6. **006_categories_schema.sql** ✅ - Product categories with tree structure
7. **007_inventory_schema.sql** ✅ - Warehouses, stock levels, movements
8. **008_customers_crm_schema.sql** ✅ - Customers, addresses, notes (B2C/B2B)
9. **009_orders_extended_schema.sql** ✅ - Extended orders: items, shipments, payments, returns
10. **010_suppliers_schema.sql** ✅ - Suppliers and product-supplier relationships

## Migration Status

✅ **All Phase 5 migrations successfully applied!**

## Database Structure Overview

### Multi-Tenant Architecture

- All tables include `tenant_id` for data isolation
- Row Level Security (RLS) policies enforce tenant boundaries
- Super admins can see all data, tenant users only their own

### Key Tables

#### Categories (006)

- `categories` - Hierarchical product categories
- `category_tree_view` - Recursive view for tree navigation

#### Inventory (007)

- `warehouses` - Storage locations
- `stock_levels` - Current stock per product per warehouse
- `stock_movements` - All stock transactions history
- `stock_status_view` - Aggregated stock status
- `stock_alerts_view` - Low stock alerts

#### Customers (008)

- `customers` - Master customer data (B2C/B2B)
- `customer_addresses` - Billing and shipping addresses
- `customer_notes` - Activity log and notes
- `customers_summary_view` - Display names and key metrics
- `customer_segment_stats_view` - Segmentation analytics

#### Orders (009)

- `orders` - Extended with new columns
- `order_items` - Line items
- `shipments` - Tracking information
- `payments` - Payment transactions
- `returns` - Return requests
- `orders_summary_view` - Orders with customer info
- `order_fulfillment_view` - Fulfillment status

#### Suppliers (010)

- `suppliers` - Supplier master data
- `supplier_contacts` - Contact persons
- `supplier_products` - Product-supplier pricing
- `supplier_performance_view` - Performance metrics
- `product_supplier_options_view` - Purchasing options

## Testing Migrations

### 1. Verify Tables Exist

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check specific tables
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'categories'
);
```

### 2. Check RLS Policies

```sql
-- View all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Verify Indexes

```sql
-- List all indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 4. Check Foreign Keys

```sql
-- View foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

## Sample Data Insertion

### Categories Sample Data

```sql
-- Get your tenant_id first
SELECT id FROM tenants LIMIT 1;

-- Insert sample categories (replace {tenant_id})
INSERT INTO categories (tenant_id, name, slug, description, display_order, is_active, is_featured)
VALUES
  ('{tenant_id}', 'Elektronik', 'elektronik', 'Elektronik ürünler', 1, true, true),
  ('{tenant_id}', 'Giyim', 'giyim', 'Giyim ürünleri', 2, true, true),
  ('{tenant_id}', 'Ev & Yaşam', 'ev-yasam', 'Ev ve yaşam ürünleri', 3, true, false);

-- Insert subcategories
INSERT INTO categories (tenant_id, parent_id, name, slug, description, display_order, is_active)
SELECT
  c.tenant_id,
  c.id,
  'Cep Telefonu',
  'cep-telefonu',
  'Akıllı telefonlar',
  1,
  true
FROM categories c
WHERE c.slug = 'elektronik' AND c.tenant_id = '{tenant_id}';
```

### Warehouse Sample Data

```sql
-- Insert main warehouse (already created by migration seed data)
-- Verify it exists:
SELECT * FROM warehouses WHERE tenant_id = '{tenant_id}';
```

### Customer Sample Data

```sql
-- Insert sample customers
INSERT INTO customers (
  tenant_id,
  customer_type,
  first_name,
  last_name,
  email,
  phone,
  segment,
  status
)
VALUES
  ('{tenant_id}', 'individual', 'Ahmet', 'Yılmaz', 'ahmet@example.com', '+905551234567', 'new', 'active'),
  ('{tenant_id}', 'individual', 'Ayşe', 'Demir', 'ayse@example.com', '+905557654321', 'repeat', 'active'),
  ('{tenant_id}', 'business', NULL, NULL, 'info@example.com', '+902121234567', 'b2b', 'active');

-- Update company name for business customer
UPDATE customers
SET company_name = 'Örnek Ltd. Şti.', tax_number = '1234567890'
WHERE customer_type = 'business' AND tenant_id = '{tenant_id}';
```

### Supplier Sample Data

```sql
-- Insert sample suppliers
INSERT INTO suppliers (
  tenant_id,
  supplier_code,
  company_name,
  email,
  phone,
  city,
  country,
  status,
  supplier_type
)
VALUES
  ('{tenant_id}', 'SUP001', 'ABC Tedarik A.Ş.', 'abc@tedarik.com', '+902121111111', 'İstanbul', 'Türkiye', 'active', 'manufacturer'),
  ('{tenant_id}', 'SUP002', 'XYZ Dağıtım Ltd.', 'xyz@dagitim.com', '+903122222222', 'Ankara', 'Türkiye', 'active', 'distributor');
```

## Useful Queries

### View Category Tree

```sql
SELECT * FROM category_tree_view
WHERE tenant_id = '{tenant_id}'
ORDER BY path;
```

### Check Stock Levels

```sql
SELECT
  p.name AS product_name,
  w.name AS warehouse_name,
  sl.quantity,
  sl.reserved_quantity,
  sl.available_quantity
FROM stock_levels sl
JOIN products p ON sl.product_id = p.id
JOIN warehouses w ON sl.warehouse_id = w.id
WHERE sl.tenant_id = '{tenant_id}';
```

### Customer Segments

```sql
SELECT * FROM customer_segment_stats_view
WHERE tenant_id = '{tenant_id}';
```

### Orders with Customer Info

```sql
SELECT * FROM orders_summary_view
WHERE tenant_id = '{tenant_id}'
ORDER BY order_date DESC
LIMIT 10;
```

### Supplier Performance

```sql
SELECT * FROM supplier_performance_view
WHERE tenant_id = '{tenant_id}'
ORDER BY quality_rating DESC;
```

## Rollback Instructions

If you need to rollback migrations (⚠️ use with caution):

```sql
-- Rollback in reverse order
DROP TABLE IF EXISTS supplier_products CASCADE;
DROP TABLE IF EXISTS supplier_contacts CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;

DROP TABLE IF EXISTS returns CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
-- Note: orders table existed before, only drop new columns

DROP TABLE IF EXISTS customer_notes CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;

DROP TABLE IF EXISTS categories CASCADE;
```

## Next Steps

1. ✅ All migrations applied successfully
2. ⏭️ Insert sample data for testing
3. ⏭️ Create repository and service layers (Phase 6)
4. ⏭️ Connect frontend pages to real data (Phase 7)

## Notes

- All tables have RLS enabled for security
- Indexes are created for performance
- Helpful views simplify complex queries
- Seed data is automatically inserted for tenants
- Foreign keys ensure data integrity
- Triggers auto-update timestamps

## Support

For issues or questions:

- Check Supabase logs: Dashboard > Logs
- Verify RLS policies: Dashboard > Authentication > Policies
- Test queries: Dashboard > SQL Editor
