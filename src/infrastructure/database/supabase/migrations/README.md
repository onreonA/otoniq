# 🗄️ Database Migrations

Bu klasör Supabase PostgreSQL database schema migration dosyalarını içerir.

## 📋 Migration Dosyaları

| Dosya                              | Açıklama                 | İçerik                                       |
| ---------------------------------- | ------------------------ | -------------------------------------------- |
| `001_initial_schema.sql`           | Temel tablolar           | tenants, users, RLS, triggers                |
| `002_products_schema.sql`          | Ürün yönetimi            | products, product_history, audit logs        |
| `003_marketplace_schema.sql`       | Marketplace entegrasyonu | marketplace_connections, listings, sync_jobs |
| `004_orders_automation_schema.sql` | Sipariş & otomasyon      | orders, n8n_workflows, automation_logs       |

## 🚀 Migration'ları Çalıştırma

### Yöntem 1: Supabase SQL Editor (Önerilen - İlk Sefer)

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projenize gidin
2. Sol menüden **SQL Editor** sekmesine tıklayın
3. **New query** butonuna tıklayın
4. Migration dosyalarını **sırayla** kopyalayıp çalıştırın:

```bash
# Sıra önemli! 001'den başlayın
1. 001_initial_schema.sql
2. 002_products_schema.sql
3. 003_marketplace_schema.sql
4. 004_orders_automation_schema.sql
```

5. Her dosyayı yapıştırın ve **Run** butonuna tıklayın
6. Hata olmadığını kontrol edin (yeşil ✓ işareti göreceksiniz)

### Yöntem 2: Supabase CLI (Gelişmiş Kullanım)

```bash
# 1. Supabase CLI kurulumu (eğer yoksa)
npm install -g supabase

# 2. Login
supabase login

# 3. Projeyi link et
supabase link --project-ref ydqqmyhkxczmdnqkswro

# 4. Migration'ları push et
supabase db push

# 5. Migration history'yi görmek için
supabase migration list
```

## ✅ Kontrol Listesi

Migration'lar başarıyla çalıştırıldıysa:

- [ ] **Database** → **Tables** sekmesinde tüm tabloları görebiliyorsunuz:
  - ✅ tenants
  - ✅ users
  - ✅ products
  - ✅ product_history
  - ✅ marketplace_connections
  - ✅ marketplace_listings
  - ✅ sync_jobs
  - ✅ orders
  - ✅ order_status_history
  - ✅ n8n_workflows
  - ✅ automation_logs

- [ ] Her tabloda **RLS (Row Level Security)** aktif
- [ ] **Policies** tab'ında güvenlik politikaları görünüyor
- [ ] **Database** → **Functions** sekmesinde helper functions var

## 🔐 İlk Super Admin Kullanıcısı Oluşturma

Migration'lar tamamlandıktan sonra ilk super admin kullanıcısını manuel oluşturmalısınız:

### Adım 1: Supabase Auth ile kullanıcı oluşturun

1. **Authentication** → **Users** sekmesine gidin
2. **Add user** butonuna tıklayın
3. Email ve şifre girin (örn: admin@otoniq.ai)
4. Kullanıcı oluşturulduktan sonra **User ID**'sini kopyalayın

### Adım 2: Users tablosuna super admin ekleyin

SQL Editor'da şu komutu çalıştırın (USER_ID'yi değiştirin):

```sql
INSERT INTO users (id, tenant_id, email, role, full_name)
VALUES (
  'BURAYA_USER_ID_YAPIŞTIRIN', -- Yukarıda kopyaladığınız User ID
  NULL, -- super admin için tenant_id NULL olmalı
  'admin@otoniq.ai',
  'super_admin',
  'Super Admin'
);
```

## 🧪 Test Verileri (Opsiyonel)

Development ortamında test için örnek veriler:

```sql
-- Test tenant oluştur
INSERT INTO tenants (company_name, subscription_plan, subscription_status)
VALUES ('Test Şirketi A.Ş.', 'professional', 'active')
RETURNING id; -- Bu ID'yi not edin

-- Test kullanıcısı oluştur (önce auth.users'ta olmalı!)
INSERT INTO users (id, tenant_id, email, role, full_name)
VALUES (
  'test_user_id', -- Auth'dan alınacak
  'yukarıdaki_tenant_id',
  'test@test.com',
  'tenant_admin',
  'Test Kullanıcısı'
);
```

## 🔄 Migration Güncelleme

Eğer schema'da değişiklik yapmak isterseniz:

1. **ASLA** mevcut migration dosyalarını değiştirmeyin!
2. Yeni bir migration dosyası oluşturun: `005_description.sql`
3. Yeni dosyayı çalıştırın

## ⚠️ Önemli Notlar

- **Migration sırası**: Dosyaları mutlaka sırayla (001, 002, 003, 004) çalıştırın
- **RLS**: Row Level Security tüm tablolarda aktif olmalı
- **Backup**: Önemli değişikliklerden önce database backup alın
- **Production**: Production'a geçmeden önce tüm migration'ları staging'de test edin

## 🆘 Sorun Giderme

### "relation does not exist" hatası

- Önceki migration'lar çalıştırılmamış olabilir
- Migration sırasına dikkat edin

### "permission denied" hatası

- RLS politikaları ile çakışma olabilir
- Super admin kullanıcısı ile çalıştırın

### "duplicate key value" hatası

- Migration daha önce çalıştırılmış
- Tabloyu drop edip tekrar çalıştırabilirsiniz (dikkatli!)

```sql
-- Dikkat: Veri kaybı riski!
DROP TABLE IF EXISTS table_name CASCADE;
-- Sonra migration'ı tekrar çalıştırın
```

## 📝 Migration History Takibi

Supabase otomatik olarak `supabase_migrations.schema_migrations` tablosunda migration history tutar.

```sql
-- Hangi migration'lar çalıştırıldı?
SELECT * FROM supabase_migrations.schema_migrations;
```

## ✅ Sonraki Adımlar

Migration'lar tamamlandıktan sonra:

1. ✅ Environment variables kontrol edin (`.env.local`)
2. ✅ Frontend uygulamasını çalıştırın: `npm run dev`
3. ✅ Supabase connection test edin
4. ✅ İlk super admin ile login olun

---

**Hazır mısınız?** Migration'ları çalıştırın ve projeye devam edin! 🚀
