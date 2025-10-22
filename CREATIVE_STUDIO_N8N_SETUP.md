# 🎨 Creative Studio - N8N Entegrasyon Kurulum Rehberi

## 📋 **İÇERİK**

- [Genel Bakış](#genel-bakış)
- [N8N Workflow Kurulumu](#n8n-workflow-kurulumu)
- [Environment Yapılandırması](#environment-yapılandırması)
- [Creative Studio Kullanımı](#creative-studio-kullanımı)
- [Sorun Giderme](#sorun-giderme)

---

## 🎯 **GENEL BAKIŞ**

Creative Studio, 3 farklı tab ile görsel otomasyon sunar:

### **1. 📦 Ürün Bazlı (Product-Based)**

- Mevcut ürünlerden görsel oluşturma
- Template bazlı otomatik tasarım
- Toplu görsel üretimi

### **2. 📤 Manuel Yükleme (Manual Upload)**

- Drag & Drop görsel yükleme
- Görsel düzenleme (yakında)
- Toplu işleme

### **3. ✨ AI Prompt (AI İstemi)**

- Metinden görsel üretme
- Google AI Imagen 3 entegrasyonu
- Stil, kalite, boyut ayarları

---

## 🚀 **N8N WORKFLOW KURULUMU**

### **Adım 1: N8N Cloud Dashboard**

1. **N8N Cloud'a Giriş Yapın:**

   ```
   https://otoniq.app.n8n.cloud
   ```

2. **Yeni Workflow Oluşturun:**
   - Sol menüden "Workflows" → "Create new"
   - "Import from file" seçeneğini seçin

### **Adım 2: Workflow JSON İmport**

1. **JSON Dosyasını Seçin:**

   ```
   src/infrastructure/workflows/n8n-image-generation-final.json
   ```

2. **Import Edin ve Kaydedin**

### **Adım 3: Google AI API Key Yapılandırması**

1. **Environment Variable Ekleyin:**
   - N8N Dashboard → Settings → Environment Variables
   - Yeni variable oluşturun:
     ```
     Name: GOOGLE_AI_API_KEY
     Value: AIzaSyBzRd_Cs7c02_ofLIGFXiM2K-HyAfIyHp0
     ```

2. **Alternatif: Node İçinde Direkt Ayarlama:**
   - "Google AI HTTP Request" node'una tıklayın
   - Headers → "x-goog-api-key" → API key'i yapıştırın

### **Adım 4: Workflow'u Aktif Hale Getirin**

1. **Sağ üstteki "Inactive" toggle'ını "Active" yapın**
2. **"Save" butonuna tıklayın**

### **Adım 5: Webhook URL'ini Kopyalayın**

1. **"Webhook Trigger" node'una tıklayın**
2. **"Test URL" veya "Production URL"'i kopyalayın**
   - Test: `https://otoniq.app.n8n.cloud/webhook-test/generate-image`
   - Production: `https://otoniq.app.n8n.cloud/webhook/generate-image`

---

## ⚙️ **ENVIRONMENT YAPILAN DIRMASI**

### **Adım 1: .env.local Dosyası**

1. **Proje root dizininde `.env.local` dosyasını açın**

2. **N8N Webhook URL'ini Ekleyin:**

   ```bash
   # N8N Configuration
   VITE_N8N_WEBHOOK_URL=https://otoniq.app.n8n.cloud/webhook-test/generate-image

   # Google AI Configuration (Opsiyonel - N8N içinde de yapılandırılabilir)
   VITE_GOOGLE_AI_API_KEY=AIzaSyBzRd_Cs7c02_ofLIGFXiM2K-HyAfIyHp0
   ```

3. **Dosyayı Kaydedin**

### **Adım 2: Vite Dev Server'ı Yeniden Başlatın**

```bash
# Terminal'de:
npm run dev
```

---

## 🎨 **CREATIVE STUDIO KULLANIMI**

### **1. AI Prompt Tab Kullanımı**

1. **Creative Studio'ya Gidin:**

   ```
   http://localhost:3001/creative
   ```

2. **"AI Prompt" Tab'ını Seçin**

3. **Prompt Girin:**

   ```
   Minimal plaj temalı ürün görseli, pastel renkler, photorealistic, high resolution
   ```

4. **Ayarları Yapılandırın:**
   - **Stil:** Realistik
   - **Kalite:** Yüksek
   - **Boyut Oranı:** Kare (1:1)
   - **Görsel Sayısı:** 4

5. **"AI ile Oluştur" Butonuna Tıklayın**

6. **Görseller Oluşacak:**
   - N8N workflow çalışacak
   - Google AI görselleri üretecek
   - Sonuçlar ekranda görünecek

### **2. Ürün Bazlı Tab Kullanımı**

1. **"Ürün Bazlı" Tab'ını Seçin**

2. **Adım 1: Ürün Seçimi**
   - Listeden ürünleri seçin
   - Toplu seçim yapabilirsiniz

3. **Adım 2: Template Seçimi**
   - Instagram Post
   - Facebook Ad
   - Marketplace Image
   - Email Banner

4. **Adım 3: AI Ayarları**
   - Stil, kalite, boyut ayarları

5. **Adım 4: Oluştur ve Önizle**
   - Her ürün x template kombinasyonu için görsel üretilir

### **3. Manuel Yükleme Tab Kullanımı**

1. **"Manuel Yükleme" Tab'ını Seçin**

2. **Görselleri Yükleyin:**
   - Drag & Drop ile sürükleyin
   - veya "Dosya Seç" ile yükleyin

3. **Düzenleme (Yakında):**
   - Boyutlandırma
   - Filtreler
   - Metin ekleme

---

## 🔧 **WORKFLOW NODE DETAYLARI**

### **1. Webhook Trigger**

```json
{
  "httpMethod": "POST",
  "path": "generate-image",
  "responseMode": "responseNode",
  "options": {
    "allowedOrigins": "*"
  }
}
```

- **CORS:** Wildcard (\*) ile tüm originlere izin
- **Response Mode:** responseNode (Success/Error Response node kullanacak)

### **2. Validate Input**

```javascript
// Prompt boş olmamalı
$json.prompt !== '';
```

- Input validation
- True → Google AI Request
- False → Validation Error Response

### **3. Google AI HTTP Request**

```json
{
  "url": "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "x-goog-api-key": "{{ $env.GOOGLE_AI_API_KEY }}"
  },
  "body": {
    "prompt": "{{ $json.prompt }}",
    "number_of_images": "{{ $json.numImages || 1 }}",
    "aspect_ratio": "{{ $json.aspectRatio || '1:1' }}"
  }
}
```

### **4. Transform Response (Code Node)**

```javascript
// Google AI response'u frontend formatına çevir
const images = aiResponse.predictions.map(pred => ({
  url: `data:image/png;base64,${pred.bytesBase64Encoded}`,
  metadata: {
    prompt, style, aspectRatio, quality, ...
  }
}));
```

### **5. Success Response**

```json
{
  "success": true,
  "images": [...],
  "usage": {
    "tokensUsed": 123,
    "cost": 0,
    "workflowExecutionTime": 3500
  }
}
```

- **CORS Headers:** Otomatik ekleniyor
- **200 OK:** Başarılı yanıt

---

## 🐛 **SORUN GİDERME**

### **Sorun 1: CORS Hatası**

**Hata:**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Çözüm:**

1. N8N workflow'unda "Success Response", "Error Response", "Validation Error" node'larının HEPS İNDE CORS headers ekli olmalı:
   ```json
   "responseHeaders": {
     "entries": [
       {"name": "Access-Control-Allow-Origin", "value": "*"},
       {"name": "Access-Control-Allow-Methods", "value": "GET, POST, OPTIONS"},
       {"name": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization"}
     ]
   }
   ```

### **Sorun 2: 401 Unauthorized**

**Hata:**

```
POST https://otoniq.app.n8n.cloud/webhook-test/generate-image 401 (Unauthorized)
```

**Çözüm:**

1. **N8N Workflow "Active" olmalı**
2. **Google AI API Key doğru olmalı**
3. **Webhook URL doğru olmalı**

### **Sorun 3: "No images returned"**

**Hata:**

```
No images returned from N8N workflow
```

**Çözüm:**

1. **Transform Response node'unu kontrol edin**
2. **Google AI API yanıtını console'da inceleyin**
3. **Response format'ı frontend ile uyumlu olmalı:**
   ```javascript
   {
     images: [
       {
         url: 'data:image/png;base64,...', // veya HTTP URL
       },
     ];
   }
   ```

### **Sorun 4: Mock Görseller Geliyor**

**Sebep:**

```javascript
// N8NImageService.ts içinde:
if (!this.n8nWebhookUrl || this.n8nWebhookUrl.includes('localhost')) {
  return await mockN8NService.generateImages(request);
}
```

**Çözüm:**

1. `.env.local` dosyasında `VITE_N8N_WEBHOOK_URL` doğru ayarlanmış olmalı
2. Vite dev server'ı yeniden başlatın
3. Browser'da hard refresh yapın (Ctrl+Shift+R)

---

## ✅ **TEST CHECKLIST**

### **N8N Workflow Testi:**

- [ ] Workflow "Active" durumda
- [ ] Google AI API key yapılandırılmış
- [ ] Webhook Trigger "Test" modunda çalışıyor
- [ ] Test isteği başarılı yanıt veriyor

### **Frontend Testi:**

- [ ] `.env.local` dosyasında `VITE_N8N_WEBHOOK_URL` ayarlanmış
- [ ] Creative Studio sayfası açılıyor
- [ ] 3 tab geçişleri çalışıyor
- [ ] AI Prompt tab'ında görsel üretiliyor
- [ ] Ürün Bazlı tab'ında mock ürünler görünüyor
- [ ] Manuel Yükleme tab'ında drag & drop çalışıyor

### **Entegrasyon Testi:**

- [ ] AI Prompt → N8N → Google AI → Frontend (gerçek görseller)
- [ ] CORS hatası yok
- [ ] Response parsing başarılı
- [ ] Görseller ekranda görünüyor
- [ ] Download butonu çalışıyor

---

## 📞 **DESTEK**

Sorun yaşıyorsanız:

1. **Console log'larını kontrol edin**
2. **N8N workflow execution log'larını inceleyin**
3. **Bu dokümantasyondaki adımları tekrar gözden geçirin**

---

## 🚀 **SONRAKI ADIMLAR**

1. **Production URL'e Geçiş:**
   - Test başarılı olduktan sonra
   - `.env.local` → `webhook-test` → `webhook`

2. **Ürün Entegrasyonu:**
   - ProductBasedTab'a gerçek ürün veritabanı entegrasyonu

3. **Gelişmiş Özellikler:**
   - Manuel Upload tab'a canvas editing
   - Toplu indirme
   - Gallery sistemi

---

**Son Güncelleme:** 21 Ocak 2025
**Versiyon:** 1.0.0
