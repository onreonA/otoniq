# 📊 AI İş Zekası (Analytics) Sayfası

## Genel Bakış

AI İş Zekası sayfası, işletmenizin performansını izlemek, tahminler yapmak ve anomalileri tespit etmek için kapsamlı bir analitik dashboard'udur.

## Özellikler

### 1. **KPI Kartları** (`AnalyticsKPICards`)
- **Toplam Gelir**: Animasyonlu gelir göstergesi
- **Toplam Sipariş**: Sipariş sayısı
- **Dönüşüm Oranı**: Ziyaretçi-müşteri dönüşüm yüzdesi
- **Ortalama Sepet**: Sipariş başına ortalama gelir

**Özellikler**:
- Sayı animasyonları (1.5 saniye)
- Değişim yüzdesi göstergeleri (+/-)
- Hover efektleri
- Progress bar'lar

### 2. **Satış Tahminleri** (`SalesForecastChart`)
- **7/30/90 Günlük** tahmin seçenekleri
- Gerçekleşen satışlar (yeşil çizgi)
- Tahmin edilen satışlar (mavi kesikli çizgi)
- Güven aralıkları (%85-115)

**Teknoloji**: Recharts `ComposedChart` + `LineChart` + `Area`

### 3. **Trend Analizi** (`TrendAnalysisChart`)
- Kanal bazlı trend analizi (Web, Mobile, Marketplace, Social)
- **Gelir** veya **Sipariş** görünüm modu
- 7/30/90 günlük periyot seçimi
- Stacked area chart

**Teknoloji**: Recharts `AreaChart`

### 4. **Anomali Tespiti** (`AnomalyDetection`)
- AI tarafından tespit edilen anormal durumlar
- Şiddet seviyeleri: Yüksek / Orta / Düşük
- Metrik tipleri: Gelir, Sipariş, Dönüşüm, Trafik
- AI önerileri ve aksiyonlar

## Dosya Yapısı

```
src/presentation/
├── pages/analytics/
│   ├── page.tsx                        # Ana sayfa
│   └── components/
│       ├── AnalyticsKPICards.tsx       # KPI kartları
│       ├── SalesForecastChart.tsx      # Satış tahminleri
│       ├── TrendAnalysisChart.tsx      # Trend analizi
│       └── AnomalyDetection.tsx        # Anomali tespiti
├── mocks/
│   └── analytics.ts                    # Mock data
```

## Kullanım

```tsx
import AnalyticsPage from './presentation/pages/analytics/page';

// Router'da
{
  path: '/analytics',
  element: <AnalyticsPage />,
}
```

## Mock Data

```typescript
// KPI Data
export interface KPIData {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  conversionRate: number;
  conversionChange: number;
  averageOrderValue: number;
  aovChange: number;
}

// Trend Data
export interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
  channel: string;
}

// Anomaly Data
export interface AnomalyData {
  id: string;
  date: string;
  metric: 'revenue' | 'orders' | 'conversion' | 'traffic';
  value: number;
  expectedValue: number;
  delta: number;
  deltaPercent: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}
```

## Roadmap

- [ ] Gerçek API entegrasyonu
- [ ] Export to PDF/Excel
- [ ] Real-time updates (WebSocket)
- [ ] Custom date range picker
- [ ] Advanced filtering
- [ ] Karşılaştırmalı analiz (dönem vs dönem)
- [ ] AI chatbot entegrasyonu

