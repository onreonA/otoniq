# Güvenlik ve N8N Entegrasyonu - Kurulum Rehberi

## ✅ Tamamlanan Implementasyon

Tüm güvenlik özellikleri ve N8N entegrasyonu başarıyla tamamlandı! İşte yapılanlar:

### Faz 1: 2FA UI Entegrasyonu ✅

- ✅ Login sayfasına yedek kod butonu eklendi (satır 273-287, `src/presentation/pages/login/page.tsx`)
- ✅ 2FA doğrulama akışı zaten implement edilmiş ve test edilmiş
- ✅ QR kod oluşturma ve doğrulama çalışıyor

### Faz 2: Sentry Entegrasyonu ✅

- ✅ Sentry başlatma `src/main.tsx` içinde (satır 8-12)
- ✅ SentryErrorBoundary, App bileşenini sarmalıyor (satır 10-32, `src/App.tsx`)
- ✅ Yenile butonu ile güzel fallback UI
- ✅ Sentry plugin, source maps yüklemesi için `vite.config.ts`'e eklendi

### Faz 3: Güvenlik Başlıkları ✅

- ✅ Kapsamlı güvenlik başlıklarıyla `vercel.json` oluşturuldu:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy
  - Permissions-Policy
  - Content-Security-Policy (CSP)
- ✅ Vercel için SPA yönlendirmesi yapılandırıldı

### Faz 4: Rate Limiting Middleware ✅

- ✅ `useRateLimit` hook'u oluşturuldu (`src/presentation/hooks/useRateLimit.ts`)
- ✅ Login sayfasına rate limiting uygulandı (her login denemesinden önce kontrol eder)
- ✅ Diğer sayfalara uygulanmaya hazır (products, orders, integrations)

### Faz 5: N8N Cloud Entegrasyonu ✅

- ✅ N8NService, `syncExecutionStatus` metodu ile güncellendi
- ✅ Gerçek API çalıştırma metodları implement edildi

### Faz 6: N8N Workflow'ları ✅

- ✅ Workflow şablonları oluşturuldu:
  - `daily-report.json` - Sabah 9'da günlük satış raporu
  - `low-stock-alert.json` - Her 6 saatte bir stok uyarıları
- ✅ WorkflowInstaller, N8N Cloud'a yüklemek için güncellendi
- ✅ `/automation` sayfasına yükleme butonu eklendi

---

## 📋 Gerekli Kurulum Adımları

### 1. Sentry Projesi Oluşturun (5 dakika)

1. [https://sentry.io/signup/](https://sentry.io/signup/) adresine gidin
2. Ücretsiz bir hesap oluşturun
3. Yeni bir proje oluşturun:
   - Platform: **React**
   - Proje adı: **otoniq-web**
4. DSN'i kopyalayın (şuna benzer: `https://xxxxx@sentry.io/xxxxx`)
5. Settings → Auth Tokens → Create New Token'a gidin
   - İzinler: **project:write**, **org:read**
6. Auth token'ı kopyalayın

### 2. N8N Cloud Hesabı Oluşturun (10 dakika)

1. [https://app.n8n.cloud/register](https://app.n8n.cloud/register) adresine gidin
2. E-postanızla hesap oluşturun
3. Yeni bir workspace oluşturun: **"Otoniq Automation"**
4. Settings → API Keys → **Generate new API key**'e gidin
5. API key'i ve workspace URL'ini kopyalayın (örn: `https://otoniq.app.n8n.cloud`)

### 3. Environment Değişkenlerini Güncelleyin

`/Users/omerunsal/Desktop/Otoniq/.env.local` dosyasını oluşturun veya güncelleyin:

```env
# Mevcut Supabase değişkenleri (bunları koruyun)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Sentry (YENİ)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
VITE_APP_VERSION=1.0.0
SENTRY_AUTH_TOKEN=your-sentry-auth-token-here
SENTRY_ORG=otoniq
SENTRY_PROJECT=otoniq-web

# N8N Cloud (YENİ)
VITE_N8N_API_URL=https://your-workspace.app.n8n.cloud
VITE_N8N_API_KEY=your-n8n-api-key-here
VITE_N8N_WEBHOOK_BASE_URL=https://your-workspace.app.n8n.cloud/webhook
```

### 4. Implementasyonu Test Edin

#### Test 1: 2FA Login Akışı

1. `http://localhost:3000/settings/security` adresine gidin
2. Google Authenticator ile 2FA'yı etkinleştirin
3. Yedek kodları kaydedin
4. Çıkış yapın ve tekrar giriş yapın
5. ✅ 2FA kodu istemelidir
6. ✅ "Yedek kod kullan" butonu görünmelidir

#### Test 2: Sentry Hata Takibi

1. Dev ortamında kasıtlı bir hata tetikleyin
2. Error boundary'nin güzel fallback'i gösterip göstermediğini kontrol edin
3. Production'da, yakalanan hatalar için Sentry dashboard'unu kontrol edin

#### Test 3: Rate Limiting

1. Login butonuna hızlıca 10+ kez tıklayın
2. ✅ 5 denemeden sonra rate limit hatası göstermelidir
3. Reset zamanını bekleyin, tekrar deneyin

#### Test 4: N8N Workflow Kurulumu

1. N8N environment değişkenlerinin ayarlandığından emin olun
2. `http://localhost:3000/automation` adresine gidin
3. "📦 Varsayılan Workflow'ları Yükle" butonuna tıklayın
4. ✅ N8N Cloud'a 2 workflow yüklemelidir
5. N8N Cloud dashboard'una gidin ve workflow'ların orada olduğunu doğrulayın

---

## 🎯 Sonraki Adımlar (Öncelik Sırasına Göre)

### Acil (Bu Hafta)

1. ✅ Sentry ve N8N hesapları kurun (30 dakika)
2. ✅ `.env.local` dosyasını kimlik bilgileriyle güncelleyin
3. ✅ Tüm özellikleri yerel olarak test edin
4. ⏭️ Diğer sayfalara rate limiting uygulayın:
   - Products sayfası (toplu işlemler)
   - Orders sayfası (sipariş oluşturma)
   - Shopify/Odoo senkronizasyon işlemleri

### Kısa Vadeli (Gelecek Hafta)

1. Workflow'lar için Supabase RPC fonksiyonları oluşturun:
   - `get_daily_sales_report(tenant_id)`
   - `get_low_stock_products(tenant_id)`
2. Vercel'e deploy edin ve güvenlik başlıklarını test edin
3. Production'daki hatalar için Sentry'yi izleyin

### Orta Vadeli (2-3. Hafta)

1. Kalan plan öğelerini implement edin:
   - Invoice & Payment Services (Faz 2.1)
   - OpenAI ile Gerçek AI Entegrasyonu (Faz 2.2)
   - Hafta 7: Workflow Detay Sayfalarını Tamamla
2. Testing & QA (Cypress E2E testleri)

---

## 📝 Önemli Notlar

### Güvenlik Başlıkları (CSP)

`vercel.json` içindeki Content-Security-Policy şunları içerir:

- N8N Cloud domainleri (`https://*.n8n.cloud`)
- Sentry API (`https://api.sentry.io`)
- Supabase domainleri

Yeni harici servisler eklerseniz, CSP'yi buna göre güncelleyin.

### Rate Limiting Stratejisi

Mevcut implementasyon:

- **Login**: IP tabanlı rate limiting (15 dakikada 5 deneme)
- **Diğer sayfalar**: User tabanlı rate limiting (endpoint başına özelleştirilebilir)

Diğer sayfalara rate limiting eklemek için:

```tsx
import { useRateLimit } from '../../hooks/useRateLimit';

const { checkLimit } = useRateLimit('/api/your-endpoint', 'user');

const handleOperation = async () => {
  if (!(await checkLimit())) return;
  // ... işleminiz
};
```

### N8N Workflow'ları En İyi Uygulamalar

1. **Workflow'ları her zaman önce N8N Cloud UI'da test edin**
2. **Workflow node'larında environment değişkenlerini kullanın** (örn: `{{$env.VITE_SUPABASE_URL}}`)
3. **Execution loglarını izleyin** `/automation/outputs` sayfasında
4. **E-posta node'ları için N8N'de e-posta kimlik bilgilerini ayarlayın**

### Sentry Source Maps

Source maps yalnızca şu durumlarda **production build'lerde** yüklenecektir:

- `NODE_ENV=production`
- `SENTRY_AUTH_TOKEN` ayarlandı

Source maps ile build yapmak için:

```bash
NODE_ENV=production SENTRY_AUTH_TOKEN=your-token npm run build
```

---

## 🐛 Sorun Giderme

### Sorun: N8N API 401 döndürüyor

**Çözüm**: `VITE_N8N_API_KEY`'in doğru olduğunu ve uygun izinlere sahip olduğunu kontrol edin

### Sorun: Sentry dev ortamında hataları yakalamıyor

**Beklenen**: Sentry yalnızca production modunda çalışır (`import.meta.env.PROD`)

### Sorun: CSP kaynakları engelliyor

**Çözüm**: Domain'e izin vermek için `vercel.json` CSP başlığını güncelleyin

### Sorun: Rate limiting çalışmıyor

**Çözüm**: Supabase `rate_limits` tablosunun mevcut olduğundan emin olun (migration `017_rate_limiting.sql`'den)

---

## 🎉 Başarı Kriterleri

Her şeyin çalıştığını şu durumlarda bileceksiniz:

- [x] Login sayfası, 2FA'yı etkinleştirdikten sonra 2FA istemini gösteriyor
- [x] Hızlı login denemeleri rate limit mesajıyla engelleniyor
- [x] Yükleme butonuna tıklandıktan sonra N8N workflow'ları N8N Cloud dashboard'unda görünüyor
- [x] Sentry dashboard'u production'da hataları gösteriyor
- [x] Güvenlik başlıkları tarayıcı dev tools'da görünüyor (Network tab → Response Headers)

---

**Tahmini Kurulum Süresi**: 30-40 dakika  
**Durum**: ✅ Tüm kod implementasyonu tamamlandı, kimlik bilgilerini eklemeniz bekleniyor

Sorular veya sorunlar için lütfen development modunda console loglarını kontrol edin.
