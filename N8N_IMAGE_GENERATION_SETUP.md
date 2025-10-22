# 🎨 N8N Image Generation Setup Guide

## 📋 **OVERVIEW**

Bu guide, Otoniq Creative Studio için N8N tabanlı görsel üretim sistemini kurmanızı sağlar.

## 🚀 **ADVANTAGES**

- **🆓 Ücretsiz** - Google AI free tier kullanımı
- **🌐 Browser uyumlu** - HTTP webhook'lar
- **⚡ Hızlı** - N8N'in optimize pipeline'ı
- **🔄 Otomatik** - Workflow ile entegre
- **📊 Monitoring** - N8N dashboard'da takip

## 🔧 **SETUP STEPS**

### **1. N8N Installation**

```bash
# N8N'i global olarak yükleyin
npm install -g n8n

# N8N'i başlatın
n8n start

# N8N webhook URL'i: http://localhost:5678
```

### **2. Google AI API Setup**

```bash
# Google AI Studio'ya gidin
# https://aistudio.google.com/

# API Key oluşturun
# .env.local dosyasına ekleyin:
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### **3. N8N Workflow Import**

```bash
# N8N dashboard'a gidin: http://localhost:5678
# "Import from File" seçin
# n8n-google-ai-simple.json dosyasını import edin
```

### **4. Environment Variables**

```bash
# .env.local dosyasına ekleyin:
VITE_N8N_WEBHOOK_URL=http://localhost:5678
VITE_N8N_API_KEY=your-n8n-api-key
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 🎯 **WORKFLOW FEATURES**

### **Input Parameters:**

- `prompt` - Görsel açıklaması
- `style` - Stil (realistic, artistic, minimalist, vibrant)
- `aspectRatio` - Boyut oranı (1:1, 16:9, 9:16, 4:3, 3:4)
- `quality` - Kalite (standard, high, ultra)
- `numImages` - Görsel sayısı
- `seed` - Rastgele tohum

### **Output Format:**

```json
{
  "success": true,
  "images": [
    {
      "url": "https://...",
      "base64": "data:image/png;base64,...",
      "metadata": {
        "prompt": "...",
        "style": "realistic",
        "aspectRatio": "1:1",
        "quality": "high",
        "seed": 123456,
        "generatedAt": "2024-01-01T00:00:00.000Z",
        "workflowId": "n8n-image-generation"
      }
    }
  ],
  "workflowId": "n8n-image-generation",
  "executionTime": 5000,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 **WORKFLOW FLOW**

1. **Webhook Trigger** - POST request alır
2. **Validate Input** - Prompt kontrolü
3. **Google AI Image** - Ana görsel üretimi
4. **OpenAI DALL-E** - Fallback seçenek
5. **Check Results** - Sonuç kontrolü
6. **Response** - JSON response döner

## 🛠️ **TROUBLESHOOTING**

### **Common Issues:**

1. **N8N Connection Failed**

   ```bash
   # N8N'in çalıştığını kontrol edin
   curl http://localhost:5678/webhook/health
   ```

2. **Google AI API Error**

   ```bash
   # API key'in doğru olduğunu kontrol edin
   # Google AI Studio'da quota kontrolü yapın
   ```

3. **Workflow Not Found**
   ```bash
   # N8N dashboard'da workflow'un aktif olduğunu kontrol edin
   # Webhook URL'in doğru olduğunu kontrol edin
   ```

## 📊 **MONITORING**

### **N8N Dashboard:**

- **Executions** - Workflow çalışma geçmişi
- **Logs** - Detaylı hata logları
- **Performance** - Çalışma süreleri

### **Frontend Integration:**

```typescript
// Test connection
const isConnected = await n8nImageService.testConnection();

// Get workflow status
const status = await n8nImageService.getWorkflowStatus(workflowId);
```

## 🎯 **USAGE**

### **Creative Studio'da:**

1. **AI Prompt Tab** - Metin prompt'larından görsel
2. **Product-Based Tab** - Ürün + şablon kombinasyonları
3. **Manual Upload Tab** - Görsel yükleme ve düzenleme

### **API Endpoints:**

- `POST /webhook/generate-image` - Görsel üretimi
- `GET /webhook/health` - Sağlık kontrolü
- `GET /webhook/workflow-status/{id}` - Workflow durumu

## 🔧 **ADVANCED CONFIGURATION**

### **Custom Models:**

```json
{
  "model": "imagen-3",
  "fallback": "dall-e-3",
  "custom": "your-custom-model"
}
```

### **Quality Settings:**

```json
{
  "standard": { "steps": 20, "guidance": 7 },
  "high": { "steps": 30, "guidance": 8 },
  "ultra": { "steps": 50, "guidance": 9 }
}
```

## 🚀 **DEPLOYMENT**

### **Production Setup:**

```bash
# N8N'i production'da çalıştırın
N8N_HOST=0.0.0.0 N8N_PORT=5678 n8n start

# Environment variables
N8N_WEBHOOK_URL=https://your-domain.com
N8N_API_KEY=your-production-api-key
```

## 📈 **PERFORMANCE**

### **Expected Times:**

- **Google AI Imagen**: 3-5 saniye
- **OpenAI DALL-E**: 5-10 saniye
- **Fallback**: 10-15 saniye

### **Costs:**

- **Google AI**: Free tier (1000 requests/month)
- **OpenAI**: $0.02/image
- **N8N**: Free (self-hosted)

## 🎉 **SUCCESS!**

N8N Image Generation sistemi başarıyla kuruldu! Creative Studio'da yüksek kaliteli görseller üretebilirsiniz.

## 📞 **SUPPORT**

Sorunlar için:

1. N8N logs kontrol edin
2. Google AI quota kontrol edin
3. Webhook URL kontrol edin
4. Environment variables kontrol edin
