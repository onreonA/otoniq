# ⚡ Otomasyon Merkezi (Automation) Sayfası

## Genel Bakış

Otomasyon Merkezi, N8N ile güçlendirilmiş iş akışlarını yönetmek, izlemek ve çalıştırmak için merkezi hub'dır.

## Özellikler

### 1. **Workflow Kartları** (`WorkflowCard`)
- Workflow bilgileri ve ikonlar
- Durum göstergeleri (Aktif / Duraklatıldı / Hata)
- İstatistikler (Toplam Koşum, Başarı Oranı, Son Koşum)
- Aksiyonlar: Çalıştır, Duraklat, Test

**Kategoriler**:
- Sosyal Medya
- E-posta Marketing
- Müşteri Desteği
- Stok Yönetimi
- Analitik

### 2. **Workflow Detay Modalı** (`WorkflowDetailModal`)

**Tab'ler**:
- **Genel Bakış**: Workflow yapılandırması ve istatistikler
- **Koşum Geçmişi**: Son 10 koşum, süre, durum
- **Loglar**: Real-time log viewer (info, warning, error, success)

### 3. **İstatistikler**
- Toplam Workflow sayısı
- Aktif workflow sayısı
- Son 24 saatteki toplam koşum
- Başarı oranı (%)
- Ortalama süre (saniye)
- İşlenen toplam öğe

## Dosya Yapısı

```
src/presentation/
├── pages/automation/
│   ├── page.tsx                        # Ana sayfa
│   └── components/
│       ├── WorkflowCard.tsx            # Workflow kartı
│       └── WorkflowDetailModal.tsx     # Detay modalı
├── mocks/
│   └── automation.ts                   # Mock data
```

## Mock Data

```typescript
// Workflow Data
export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  category: 'social-media' | 'email-marketing' | 'customer-support' | 'inventory' | 'analytics';
  lastRunAt: string;
  lastResult: 'success' | 'fail' | 'partial';
  totalRuns: number;
  successRate: number;
  icon: string;
  color: string;
}

// Workflow Run Data
export interface WorkflowRunData {
  id: string;
  workflowId: string;
  startedAt: string;
  completedAt: string;
  duration: number; // seconds
  status: 'success' | 'fail' | 'running';
  itemsProcessed: number;
  errorMessage?: string;
}

// Workflow Log
export interface WorkflowLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
}
```

## Workflow Aksiyonları

```typescript
// Çalıştır
const handleRun = () => {
  toast.success('Workflow başlatıldı...');
};

// Duraklat
const handlePause = () => {
  toast.success('Workflow duraklatıldı');
};

// Test
const handleTest = () => {
  toast.loading('Test çalışması...');
  setTimeout(() => toast.success('Test başarılı!'), 1500);
};
```

## N8N Entegrasyonu

### Webhook URL'leri
```
https://n8n.otoniq.ai/webhook/{workflow_id}
```

### Test Endpoint
```
POST /api/automation/test
{
  "workflowId": "1",
  "testData": {...}
}
```

## Roadmap

- [ ] N8N API entegrasyonu
- [ ] Workflow editor (visual flow builder)
- [ ] Webhook management
- [ ] Schedule management (cron)
- [ ] Error recovery strategies
- [ ] Notification preferences
- [ ] Custom workflow templates
- [ ] Version control for workflows

