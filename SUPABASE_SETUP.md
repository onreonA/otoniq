# 🗄️ SUPABASE KURULUM REHBERİ

## Adım 1: Supabase Hesabı Oluşturma

1. [https://supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub veya email ile kayıt olun

## Adım 2: Yeni Proje Oluşturma

1. Dashboard'da "New Project" butonuna tıklayın
2. Organization seçin (yoksa önce oluşturun)
3. Proje bilgilerini doldurun:
   - **Project Name:** `otoniq-ai` (veya istediğiniz isim)
   - **Database Password:** Güçlü bir şifre oluşturun (kaydedin!)
   - **Region:** Europe (West) - `eu-west-1` (size en yakın)
   - **Pricing Plan:** Free (başlangıç için yeterli)

4. "Create new project" butonuna tıklayın
5. Proje oluşturulmasını bekleyin (~2 dakika)

## Adım 3: API Keys'leri Alma

1. Proje oluşturulduktan sonra **Settings** → **API** sayfasına gidin
2. Aşağıdaki bilgileri kopyalayın:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (gizli tutun!)
   ```

## Adım 4: Environment Variables Ayarlama

1. Proje root dizininde `.env.local` dosyası oluşturun
2. `.env.example` dosyasındaki template'i kopyalayın
3. Supabase bilgilerinizi doldurun:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_KEY=eyJhbGc...
```

## Adım 5: Database Schema Kurulumu

Database şemasını oluşturmak için Supabase SQL Editor'ı kullanacağız.

### Yöntem 1: SQL Editor (Önerilen)

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. "New query" butonuna tıklayın
3. `src/infrastructure/database/supabase/migrations/` klasöründeki migration dosyalarını sırayla çalıştırın:
   - `001_initial_schema.sql`
   - `002_products_schema.sql` 
   - `003_marketplace_schema.sql`
   - vb.

4. Her dosyayı kopyalayıp SQL Editor'a yapıştırın
5. "Run" butonuna tıklayın
6. Hata olmadığını kontrol edin

### Yöntem 2: Supabase CLI (Alternatif)

```bash
# Supabase CLI kurulumu
npm install -g supabase

# Login
supabase login

# Projeyi link et
supabase link --project-ref xxxxxxxxxxxxx

# Migration'ları çalıştır
supabase db push
```

## Adım 6: Row Level Security (RLS) Aktivasyonu

RLS politikaları migration dosyalarında zaten tanımlı. Kontrol etmek için:

1. **Database** → **Tables** sekmesine gidin
2. Herhangi bir tabloyu seçin (örn: `products`)
3. "Policies" tab'ına tıklayın
4. RLS politikalarının aktif olduğunu göreceksiniz

## Adım 7: Authentication Ayarları

1. **Authentication** → **Providers** sayfasına gidin
2. Email provider'ı aktif edin (default aktif olmalı)
3. (Opsiyonel) Google ve Microsoft OAuth provider'larını aktif edin:
   - Her provider için client ID ve secret gerekir
   - [Google Console](https://console.cloud.google.com/) ve [Azure Portal](https://portal.azure.com/) üzerinden oluşturulur

### Email Templates (Opsiyonel)

1. **Authentication** → **Email Templates** sayfasına gidin
2. Confirm signup, Reset password, Magic Link template'lerini özelleştirin
3. Türkçe çeviriler ekleyebilirsiniz

## Adım 8: Storage Bucket (Image Upload için)

1. **Storage** sekmesine gidin
2. "New bucket" butonuna tıklayın
3. Bucket bilgileri:
   - **Name:** `product-images`
   - **Public:** ✓ (işaretleyin - ürün resimleri herkese açık)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/*`

4. Bucket policies:
   ```sql
   -- Herkes okuyabilir
   CREATE POLICY "Public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-images');
   
   -- Sadece authenticated user'lar yükleyebilir
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'product-images' 
     AND auth.role() = 'authenticated'
   );
   ```

## Adım 9: Test Connection

Supabase bağlantısını test etmek için:

```bash
npm run dev
```

Browser console'da Supabase client'ın başarıyla oluşturulduğunu göreceksiniz.

## Adım 10: Database Monitoring

1. **Database** → **Roles** → Varsayılan roller kontrol
2. **Database** → **Extensions** → `uuid-ossp` extension'ının aktif olduğunu kontrol
3. **Database** → **Replication** → Backup ayarları (optional)

## Önemli Notlar

### Güvenlik
- ⚠️ **Service Role Key'i asla client-side'da kullanmayın!**
- ⚠️ **`.env.local` dosyasını Git'e commit etmeyin!**
- ✅ Row Level Security (RLS) tüm tablolarda aktif olmalı
- ✅ Production'da HTTPS kullanın

### Free Plan Limitleri
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- Sınırlar aşılırsa Pro plan'a geçin ($25/month)

### Backup Stratejisi
- Supabase otomatik daily backup yapar (7 gün)
- Pro plan ile point-in-time recovery
- Önemli data değişikliklerinden önce manuel backup:
  ```bash
  supabase db dump -f backup.sql
  ```

## Sorun Giderme

### Bağlantı Hatası
- Supabase URL ve keys doğru mu kontrol edin
- `.env.local` dosyası root dizinde mi?
- Dev server'ı restart edin: `npm run dev`

### RLS Hatası ("Row Level Security" error)
- RLS politikaları migration'larda çalıştırıldı mı kontrol edin
- User authenticated mi kontrol edin
- Policy'lerin doğru yazıldığından emin olun

### Migration Hatası
- SQL syntax hatası kontrol edin
- Migration'ları sırayla çalıştırın
- Daha önce çalışmış migration'ları tekrar çalıştırmayın

## Yararlı Linkler

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## Sonraki Adım

Supabase kurulumu tamamlandıktan sonra:
→ Database migration dosyalarını oluşturacağız
→ Supabase client'ı kod içinde configure edeceğiz

**Hazır olduğunuzda devam edebiliriz!** 🚀

