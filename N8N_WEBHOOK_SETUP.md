# N8N Webhook Entegrasyonu - Kurulum Rehberi

## ✅ Tamamlandı!

Webhook tabanlı N8N entegrasyonu başarıyla implement edildi! 🎉

### Webhook URL'leri:

- **Daily Report**: `https://otoniq.app.n8n.cloud/workflow/atI6tzx75ieHfjrX`
- **Low Stock Alert**: `https://otoniq.app.n8n.cloud/workflow/rqn2AxkOapqUKpCm`

---

## 📋 Manuel Kurulum Adımları

### 1. .env.local Dosyası Oluşturun

Proje kök dizininde (`/Users/omerunsal/Desktop/Otoniq/`) yeni bir `.env.local` dosyası oluşturun:

```env
# Supabase Configuration (Mevcut)
VITE_SUPABASE_URL=https://lmhzgswhsjobztlaxefw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtaHpnc3doc2pvYnp0bGF4ZWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MzY3OTUsImV4cCI6MjA0OTUxMjc5NX0.vwhB-v_BI5lOwDSb0Ug7vWQ6BfKdC1rRwWYNbqhzBJk

# Sentry Configuration ✨
VITE_SENTRY_DSN=https://172f74acd4680036f47bcad50e15e93d@o4510196115701760.ingest.de.sentry.io/4510196124745808
VITE_APP_VERSION=1.0.0
SENTRY_AUTH_TOKEN=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
SENTRY_ORG=otoniq
SENTRY_PROJECT=otoniq-web
```

**NOT**: N8N için API key gerekmez, webhook'lar direkt çalışır!

### 2. Dev Server'ı Yeniden Başlatın

```bash
npm run dev
```

---

## 🎯 N8N Workflow'larını Manuel Yapılandırın

### Daily Report Workflow (Sabah 9'da)

N8N Cloud'da zaten oluşturduğunuz workflow'a şu node'ları ekleyin:

#### 1. Schedule Trigger

- **Trigger Type**: Cron
- **Expression**: `0 9 * * *` (her gün sabah 9'da)

#### 2. HTTP Request - Supabase'den Veri Çek

- **Method**: POST
- **URL**: `https://lmhzgswhsjobztlaxefw.supabase.co/rest/v1/rpc/get_daily_sales_report`
- **Headers**:
  - `apikey`: Supabase ANON_KEY (yukarıdaki)
  - `Content-Type`: `application/json`
- **Body**:

```json
{
  "tenant_id": "{{$json.tenant_id}}"
}
```

#### 3. Email Node - Rapor Gönder

- **From**: `noreply@otoniq.ai`
- **To**: `{{$json.tenant_email}}`
- **Subject**: `📊 Günlük Satış Raporu`
- **Body**:

```
Merhaba,

Dünkü satış performansınız:

- Toplam Gelir: ₺{{$json.total_sales}}
- Sipariş Sayısı: {{$json.total_orders}}
- Ortalama Sepet: ₺{{$json.avg_order_value}}

İyi çalışmalar!
Otoniq.ai
```

**Save & Activate edin!**

---

### Low Stock Alert Workflow (6 saatte bir)

#### 1. Schedule Trigger

- **Trigger Type**: Cron
- **Expression**: `0 */6 * * *` (her 6 saatte bir)

#### 2. HTTP Request - Düşük Stokları Çek

- **Method**: POST
- **URL**: `https://lmhzgswhsjobztlaxefw.supabase.co/rest/v1/rpc/get_low_stock_products`
- **Headers**:
  - `apikey`: Supabase ANON_KEY
  - `Content-Type`: `application/json`
- **Body**:

```json
{
  "tenant_id": "{{$json.tenant_id}}",
  "threshold": 10
}
```

#### 3. IF Node - Düşük Stok Var mı?

- **Condition**: `{{$json.products.length}} > 0`

#### 4. Email Node - Uyarı Gönder

- **From**: `alerts@otoniq.ai`
- **To**: `{{$json.tenant_email}}`
- **Subject**: `⚠️ Düşük Stok Uyarısı`
- **Body**:

```
Merhaba,

Aşağıdaki ürünlerinizin stoğu kritik seviyede:

{{$json.products.map(p => `- ${p.name}: ${p.stock} adet kaldı`).join('\n')}}

Lütfen stok yenilemesi yapın.

Otoniq.ai
```

**Save & Activate edin!**

---

## 🚀 Otoniq'den Test Edin

### 1. Workflow'ları Yükleyin

1. Dev server'ı başlatın: `npm run dev`
2. Giriş yapın: `http://localhost:3000/login`
3. Automation sayfasına gidin: `http://localhost:3000/automation`
4. **"📦 Varsayılan Workflow'ları Yükle"** butonuna tıklayın
5. ✅ 2 workflow database'e kaydedildi!

### 2. Manuel Tetikleme (Test)

Workflow'ları manuel test etmek için webhook URL'lerine POST request gönderin:

```bash
# Daily Report Test
curl -X POST https://otoniq.app.n8n.cloud/workflow/atI6tzx75ieHfjrX \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant-id",
    "tenant_email": "your-email@example.com"
  }'

# Low Stock Alert Test
curl -X POST https://otoniq.app.n8n.cloud/workflow/rqn2AxkOapqUKpCm \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant-id",
    "tenant_email": "your-email@example.com",
    "threshold": 10
  }'
```

---

## 📊 Supabase RPC Fonksiyonları Oluşturun

N8N workflow'ları bu fonksiyonları çağırıyor, onları da oluşturmanız gerekiyor:

### 1. get_daily_sales_report

Supabase SQL Editor'de çalıştırın:

```sql
CREATE OR REPLACE FUNCTION get_daily_sales_report(
  p_tenant_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tenant_id', p_tenant_id,
    'tenant_email', (SELECT email FROM profiles WHERE tenant_id = p_tenant_id LIMIT 1),
    'total_sales', COALESCE(SUM(total_amount), 0),
    'total_orders', COUNT(*),
    'avg_order_value', COALESCE(AVG(total_amount), 0)
  ) INTO result
  FROM orders
  WHERE tenant_id = p_tenant_id
    AND created_at >= CURRENT_DATE - INTERVAL '1 day'
    AND created_at < CURRENT_DATE
    AND status != 'cancelled';

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. get_low_stock_products

```sql
CREATE OR REPLACE FUNCTION get_low_stock_products(
  p_tenant_id UUID,
  p_threshold INTEGER DEFAULT 10
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'tenant_id', p_tenant_id,
    'tenant_email', (SELECT email FROM profiles WHERE tenant_id = p_tenant_id LIMIT 1),
    'threshold', p_threshold,
    'products', COALESCE(
      json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'sku', p.sku,
          'stock', COALESCE(s.quantity, 0)
        )
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::json
    )
  ) INTO result
  FROM products p
  LEFT JOIN stock_levels s ON s.product_id = p.id
  WHERE p.tenant_id = p_tenant_id
    AND COALESCE(s.quantity, 0) <= p_threshold;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Test Checklist

- [ ] `.env.local` dosyası oluşturuldu
- [ ] Dev server yeniden başlatıldı
- [ ] N8N workflow'larına Schedule Trigger eklendi
- [ ] N8N workflow'larına HTTP Request node'ları eklendi
- [ ] N8N workflow'larına Email node'ları eklendi
- [ ] N8N workflow'ları aktifleştirildi (Save & Activate)
- [ ] Supabase RPC fonksiyonları oluşturuldu
- [ ] `/automation` sayfasından workflow'lar yüklendi
- [ ] Webhook'lar curl ile test edildi
- [ ] Email'ler geldi mi kontrol edildi

---

## 🎉 Başarı!

Artık:

- ✅ Her gün sabah 9'da otomatik satış raporu gönderilecek
- ✅ Her 6 saatte bir düşük stok kontrolü yapılacak
- ✅ Webhook'lar üzerinden manuel tetikleme yapılabilir
- ✅ N8N Cloud ücretsiz trial ile çalışıyor

### Avantajlar:

- 💰 **Ücretsiz** (N8N trial + webhook)
- ⚡ **Hızlı** (API key gereksiz)
- 🔒 **Güvenli** (Webhook URL'leri özel)
- 📊 **İzlenebilir** (N8N Cloud'da execution history)

---

**Sorularınız için**: Lütfen development console'da hata loglarını kontrol edin.

**N8N Email Setup**: N8N Cloud'da Settings → Credentials → SMTP ayarlarını yapın (Gmail/SendGrid).
