# 🚀 Supabase Database Migrations Deployment Guide

## 📋 Pre-Deployment Checklist

Before deploying migrations to production, ensure:

- ✅ All migrations are tested locally
- ✅ No syntax errors in SQL files
- ✅ Foreign key relationships are correct
- ✅ RLS policies are properly configured
- ✅ Indexes are optimized
- ✅ Backup strategy is in place

---

## 🗄️ Migrations to Deploy

### Migration Files (in order):

1. ✅ `001_initial_schema.sql` - Already deployed
2. ✅ `002_marketplace_schema.sql` - Already deployed
3. ✅ `003_marketplace_schema.sql` - Already deployed
4. ✅ `004_orders_automation_schema.sql` - Already deployed
5. ✅ `005_fix_products_schema.sql` - Already deployed
6. 🆕 `006_categories_schema.sql` - **PENDING**
7. 🆕 `007_inventory_schema.sql` - **PENDING**
8. 🆕 `008_customers_crm_schema.sql` - **PENDING**
9. 🆕 `009_orders_extended_schema.sql` - **PENDING**
10. 🆕 `010_suppliers_schema.sql` - **PENDING**
11. 🆕 `011_integration_logs_schema.sql` - **PENDING**

---

## 🔧 Deployment Methods

### Method 1: Supabase Dashboard (Recommended for Production)

#### Step 1: Access SQL Editor

1. Go to [https://supabase.com](https://supabase.com)
2. Login to your account
3. Select your project: **Otoniq Production**
4. Navigate to **SQL Editor** in the left sidebar

#### Step 2: Run Migrations One by One

**For each migration file (006-011):**

1. Open the migration file in your code editor
2. Copy the entire SQL content
3. In Supabase SQL Editor, click **New Query**
4. Paste the SQL content
5. Review the SQL carefully
6. Click **Run** (Ctrl/Cmd + Enter)
7. Wait for success confirmation
8. Check for any errors in the output

**⚠️ IMPORTANT**: Run migrations in order! Do not skip any migration.

#### Step 3: Verify Each Migration

After running each migration, verify:

```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'warehouses', 'stock_levels', 'customers', 'customer_addresses', 'suppliers', 'integration_logs')
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'warehouses', 'customers', 'integration_logs')
ORDER BY tablename, policyname;

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'warehouses', 'customers', 'integration_logs')
ORDER BY tablename, indexname;
```

---

### Method 2: Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Or run specific migration
supabase db execute --file src/infrastructure/database/supabase/migrations/006_categories_schema.sql
```

---

## 📝 Detailed Migration Instructions

### Migration 006: Categories Schema

**What it creates:**
- `categories` table with tree structure
- RLS policies for multi-tenancy
- Indexes for performance
- Helper functions for category tree queries

**Expected time**: 2-3 seconds

**Verification query:**
```sql
SELECT COUNT(*) FROM categories;
-- Should return 0 (empty table, ready for data)

SELECT * FROM pg_policies WHERE tablename = 'categories';
-- Should return 4 policies (SELECT, INSERT, UPDATE, DELETE)
```

---

### Migration 007: Inventory Schema

**What it creates:**
- `warehouses` table
- `stock_levels` table (with foreign keys to products and warehouses)
- `stock_movements` table (audit trail)
- Views for stock analytics
- RLS policies and indexes

**Expected time**: 3-4 seconds

**Verification query:**
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('warehouses', 'stock_levels', 'stock_movements')
ORDER BY table_name, ordinal_position;
```

---

### Migration 008: Customers CRM Schema

**What it creates:**
- `customers` table (B2C and B2B support)
- `customer_addresses` table
- `customer_notes` table
- RLS policies for data isolation
- Indexes for customer search and filtering
- Helper function for customer stats

**Expected time**: 3-4 seconds

**Verification query:**
```sql
SELECT * FROM customers LIMIT 1;
-- Should be empty but structure should exist
```

---

### Migration 009: Orders Extended Schema

**What it creates:**
- Extended `orders` table (if not exists, or alters existing)
- `order_items` table
- `shipments` table
- `payments` table
- `returns` table
- Complex relationships and constraints
- RLS policies
- Helper function for order summary

**Expected time**: 4-5 seconds

**⚠️ WARNING**: This migration modifies existing `orders` table. Review carefully before running!

**Verification query:**
```sql
SELECT * FROM order_items LIMIT 1;
SELECT * FROM shipments LIMIT 1;
SELECT * FROM payments LIMIT 1;
```

---

### Migration 010: Suppliers Schema

**What it creates:**
- `suppliers` table
- `supplier_contacts` table
- `supplier_products` table (pricing matrix)
- Performance tracking views
- RLS policies

**Expected time**: 2-3 seconds

**Verification query:**
```sql
SELECT COUNT(*) FROM suppliers;
```

---

### Migration 011: Integration Logs Schema

**What it creates:**
- `integration_logs` table (tracks all sync operations)
- `integration_sync_schedules` table
- `integration_field_mappings` table
- Helper functions for integration stats
- Views for analytics
- RLS policies and indexes

**Expected time**: 3-4 seconds

**Verification query:**
```sql
SELECT * FROM integration_logs ORDER BY created_at DESC LIMIT 5;

-- Test the stats function
SELECT * FROM get_integration_stats(
  'YOUR_TENANT_ID'::uuid,
  'odoo'::text,
  NOW() - INTERVAL '30 days'
);
```

---

## 🛡️ Safety Measures

### 1. Backup Before Deployment

```sql
-- Export existing data (if any)
-- Run in SQL Editor before migrations

-- Backup products
CREATE TABLE products_backup AS SELECT * FROM products;

-- Backup orders (if exists)
CREATE TABLE orders_backup AS SELECT * FROM orders;

-- You can drop backups after successful migration
-- DROP TABLE products_backup;
```

### 2. Test on Staging First

If you have a staging environment:
1. Deploy all migrations to staging
2. Test all CRUD operations
3. Verify RLS policies work correctly
4. Check performance with sample data
5. Only then deploy to production

### 3. Rollback Plan

If something goes wrong, you can rollback:

```sql
-- Drop created tables (CAREFUL!)
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS integration_sync_schedules CASCADE;
DROP TABLE IF EXISTS integration_field_mappings CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS supplier_contacts CASCADE;
DROP TABLE IF EXISTS supplier_products CASCADE;
-- ... etc

-- Restore from backup (if created)
-- INSERT INTO products SELECT * FROM products_backup;
```

---

## ✅ Post-Deployment Verification

### 1. Check All Tables Exist

```sql
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected new tables:
- ✅ categories
- ✅ customer_addresses
- ✅ customer_notes
- ✅ customers
- ✅ integration_field_mappings
- ✅ integration_logs
- ✅ integration_sync_schedules
- ✅ order_items
- ✅ payments
- ✅ returns
- ✅ shipments
- ✅ stock_levels
- ✅ stock_movements
- ✅ supplier_contacts
- ✅ supplier_products
- ✅ suppliers
- ✅ warehouses

### 2. Verify RLS is Enabled

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'customers', 'warehouses', 'integration_logs')
ORDER BY tablename;
```

All tables should have `rowsecurity = true`

### 3. Test with Sample Data

```sql
-- Insert a test category (replace YOUR_TENANT_ID and YOUR_USER_ID)
INSERT INTO categories (tenant_id, name, slug, created_by)
VALUES (
  'YOUR_TENANT_ID'::uuid,
  'Test Category',
  'test-category',
  'YOUR_USER_ID'::uuid
)
RETURNING *;

-- Try to query as that tenant
SELECT * FROM categories WHERE tenant_id = 'YOUR_TENANT_ID'::uuid;

-- Delete test data
DELETE FROM categories WHERE slug = 'test-category';
```

### 4. Check Foreign Key Relationships

```sql
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
  AND tc.table_name IN ('categories', 'stock_levels', 'order_items', 'integration_logs')
ORDER BY tc.table_name, kcu.column_name;
```

---

## 🚨 Troubleshooting

### Error: "relation already exists"

**Cause**: Table already exists from previous migration attempt

**Solution**:
```sql
-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'your_table_name';

-- If it exists, either:
-- 1. Skip that CREATE TABLE statement
-- 2. Or drop and recreate (CAREFUL!)
DROP TABLE IF EXISTS your_table_name CASCADE;
```

### Error: "column does not exist"

**Cause**: Migration trying to reference a column that doesn't exist

**Solution**:
```sql
-- Check table structure
\d your_table_name

-- Or
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table_name';

-- Add missing column manually
ALTER TABLE your_table_name ADD COLUMN column_name data_type;
```

### Error: "permission denied for schema public"

**Cause**: RLS policy blocking your query

**Solution**:
- Ensure you're authenticated as a valid user
- Check RLS policies are correctly configured
- Test with service_role key (bypasses RLS) temporarily

---

## 📊 Success Metrics

After deployment, you should have:

- ✅ **17 total tables** in public schema
- ✅ **50+ RLS policies** protecting data
- ✅ **60+ indexes** for performance
- ✅ **15+ foreign keys** maintaining referential integrity
- ✅ **10+ helper functions** for complex queries
- ✅ **5+ views** for analytics

---

## 🎉 Next Steps After Deployment

1. ✅ Verify all migrations successful
2. 🔄 Update `.env` with any new environment variables
3. 🚀 Deploy frontend to Vercel
4. 🧪 Test all pages in production
5. 📊 Monitor database performance
6. 🔍 Check logs for any errors

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs in Dashboard
2. Review this guide's troubleshooting section
3. Check migration files for syntax errors
4. Verify your Supabase project has sufficient resources

---

**Ready to deploy? Follow the steps above carefully!** 🚀

**Estimated total deployment time**: 15-20 minutes (careful review + execution)

