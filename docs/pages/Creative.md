# 🎨 Görsel Otomasyon Stüdyosu (Creative) Sayfası

## Genel Bakış

Görsel Otomasyon Stüdyosu, ürün görsellerinizi AI ile otomatik olarak farklı platformlar için optimize etmenizi ve dönüştürmenizi sağlar.

## Özellikler

### 1. **Şablon Galerisi**
- **Sosyal Medya**: Instagram Story, Post, Facebook Cover, Twitter Header
- **Marketplace**: Trendyol, Amazon, Hepsiburada ürün görselleri
- **E-posta**: Email banner'ları
- **Reklam**: Google Ads, Facebook Ads banner'ları

### 2. **Şablon Özellikleri**
- Thumbnail preview
- Platform uyumluluğu
- Boyut bilgisi (dimensions)
- Format bilgisi (PNG/JPG)
- Tek tık görsel üretimi

### 3. **Son İşlemler (Recent Jobs)**
- İşleme durumu (Processing / Completed / Failed)
- Ürün adı
- Şablon adı
- Oluşturulma tarihi
- İndirme linki (completed için)

### 4. **İstatistikler**
- Toplam üretilen görsel sayısı
- Toplam şablon sayısı
- Başarı oranı (%)
- Ortalama işlem süresi

## Dosya Yapısı

```
src/presentation/
├── pages/creative/
│   └── page.tsx                        # Ana sayfa
├── mocks/
│   └── creative.ts                     # Mock data
```

## Mock Data

```typescript
// Template Data
export interface TemplateData {
  id: string;
  name: string;
  category: 'social' | 'marketplace' | 'email' | 'ad';
  thumbnail: string;
  platform: string[];
  dimensions: string;
  format: string;
}

// Creative Job Data
export interface CreativeJobData {
  id: string;
  templateId: string;
  templateName: string;
  status: 'processing' | 'completed' | 'failed';
  productName: string;
  createdAt: string;
  completedAt?: string;
  outputUrl?: string;
}
```

## Kullanım Senaryoları

### 1. **Tek Görsel Üretimi**
```typescript
const handleGenerateClick = (template: TemplateData) => {
  // API çağrısı
  toast.loading('Görsel oluşturuluyor...');
  
  await creativeAPI.generate({
    templateId: template.id,
    productId: selectedProduct.id,
  });
  
  toast.success('Görsel oluşturuldu!');
};
```

### 2. **Toplu İşlem**
```typescript
const handleBulkGenerate = (productIds: string[], templateIds: string[]) => {
  // Toplu işlem başlat
  await creativeAPI.bulkGenerate({
    products: productIds,
    templates: templateIds,
  });
};
```

## AI Entegrasyonu

### Desteklenen AI Araçları
- **Canva API**: Template-based design
- **Remove.bg**: Background removal
- **DeepAI**: Image enhancement
- **DALL-E**: AI-generated product images
- **Stable Diffusion**: Custom image generation

### API Endpoint
```
POST /api/creative/generate
{
  "templateId": "1",
  "productId": "123",
  "options": {
    "backgroundColor": "#ffffff",
    "overlayText": "50% İNDİRİM",
    "logo": true
  }
}
```

## Roadmap

- [ ] Canva API entegrasyonu
- [ ] Custom template editor
- [ ] Bulk image processing
- [ ] Background removal
- [ ] Text overlay editor
- [ ] Brand kit management
- [ ] A/B testing for creatives
- [ ] Performance analytics
- [ ] Auto-posting to social media
- [ ] Video generation support

