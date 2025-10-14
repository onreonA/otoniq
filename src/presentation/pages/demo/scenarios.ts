/**
 * Interactive Demo Scenarios
 * Pre-configured demo scenarios for different user personas
 */

import { format } from 'date-fns';

export type DemoPersona = 'ecommerce-owner' | 'retail-manager' | 'system-admin';

export interface DemoScenario {
  id: string;
  persona: DemoPersona;
  name: string;
  description: string;
  avatar: string;
  role: string;
  company: string;
  goals: string[];
  features: string[];
  journey: DemoStep[];
}

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  page: string;
  action: string;
  highlight: string[];
  duration: number; // seconds
  screenshot?: string;
}

// ============================================
// SCENARIO 1: E-TİCARET SAHİBİ
// ============================================
export const ecommerceOwnerScenario: DemoScenario = {
  id: 'ecommerce-owner',
  persona: 'ecommerce-owner',
  name: 'Ayşe Yılmaz',
  description:
    'Orta ölçekli bir e-ticaret sitesinin sahibi. Shopify kullanıyor ve 5 farklı pazaryerinde satış yapıyor.',
  avatar: '👩‍💼',
  role: 'E-ticaret Sahibi & CEO',
  company: 'Fashion Store Turkey',
  goals: [
    'Ürünleri tüm kanallara hızlıca listelemek',
    'Stok senkronizasyonunu otomatikleştirmek',
    'Sosyal medya paylaşımlarını otomatikleştirmek',
    'Müşteri sorularını hızlı yanıtlamak',
  ],
  features: [
    'Ürün Yönetimi',
    'Marketplace Entegrasyonları',
    'Görsel Otomasyon',
    'Chat Otomasyonu',
  ],
  journey: [
    {
      id: 'step-1',
      title: 'Dashboard Genel Bakış',
      description:
        'Ayşe gün içinde işlerin nasıl gittiğini kontrol ediyor. Bugünkü satışlar, sipariş durumu ve AI önerilerini görüyor.',
      page: '/dashboard',
      action: 'Dashboard sayfasını incele',
      highlight: ['stats-cards', 'ai-assistant', 'recent-activity'],
      duration: 30,
    },
    {
      id: 'step-2',
      title: 'Yeni Ürün Ekleme',
      description:
        "Shopify'dan otomatik olarak çekilen yeni ürünleri kontrol ediyor ve onaylıyor.",
      page: '/products',
      action: 'Ürünler sayfasına git ve yeni ürünleri gör',
      highlight: ['product-list', 'sync-button', 'product-modal'],
      duration: 45,
    },
    {
      id: 'step-3',
      title: 'Marketplace Senkronizasyonu',
      description:
        "Onaylanan ürünleri Trendyol, N11 ve Hepsiburada'ya tek tıkla gönderiyor.",
      page: '/marketplace',
      action: 'Pazaryerleri sayfasına git ve ürünleri senkronize et',
      highlight: ['marketplace-connections', 'sync-products', 'sync-status'],
      duration: 60,
    },
    {
      id: 'step-4',
      title: 'Görsel Otomasyon',
      description:
        'Yeni ürünler için Instagram ve Facebook paylaşımlarını otomatik oluşturuyor.',
      page: '/creative',
      action:
        'Görsel Otomasyon sayfasına git ve sosyal medya içeriklerini oluştur',
      highlight: ['content-generator', 'templates', 'social-preview'],
      duration: 90,
    },
    {
      id: 'step-5',
      title: 'Müşteri Destek Otomasyonu',
      description:
        'WhatsApp\'tan gelen "Kargom nerede?" sorularını AI otomatik yanıtlıyor.',
      page: '/chat-automation',
      action: 'Chat Otomasyonu sayfasına git ve müşteri konuşmalarını incele',
      highlight: ['conversation-list', 'chat-templates', 'bot-responses'],
      duration: 60,
    },
    {
      id: 'step-6',
      title: 'AI İş Zekası',
      description:
        'Hangi ürünlerin iyi sattığını, hangi saatlerde sipariş yoğunluğu olduğunu AI analiz ediyor.',
      page: '/analytics',
      action: 'AI İş Zekası sayfasına git ve raporları incele',
      highlight: ['kpi-cards', 'forecast-chart', 'anomaly-detection'],
      duration: 45,
    },
  ],
};

// ============================================
// SCENARIO 2: PERAKENDE MÜDÜRÜ
// ============================================
export const retailManagerScenario: DemoScenario = {
  id: 'retail-manager',
  persona: 'retail-manager',
  name: 'Mehmet Demir',
  description:
    'Zincir mağazaların operasyon müdürü. 12 şubedeki stok ve satış süreçlerini yönetiyor.',
  avatar: '👨‍💼',
  role: 'Operasyon Müdürü',
  company: 'Teknoloji Perakende A.Ş.',
  goals: [
    'Tüm şubelerin stok durumunu gerçek zamanlı takip etmek',
    'Depo sensörlerini izlemek (sıcaklık, nem)',
    'Şubeler arası stok transferlerini optimize etmek',
    'Satış performansını analiz etmek',
  ],
  features: [
    'Stok Yönetimi',
    'IoT Monitoring',
    'AI İş Zekası',
    'Otomasyon Merkezi',
  ],
  journey: [
    {
      id: 'step-1',
      title: 'Dashboard Genel Bakış',
      description:
        'Mehmet sabah işe geldiğinde tüm şubelerin durumunu tek ekrandan görüyor.',
      page: '/dashboard',
      action: 'Dashboard sayfasını incele',
      highlight: ['stats-cards', 'performance-chart', 'recent-activity'],
      duration: 30,
    },
    {
      id: 'step-2',
      title: 'IoT Sensör Takibi',
      description:
        'Depo ve mağazalardaki sıcaklık, nem sensörlerini kontrol ediyor. Kritik bir uyarı var!',
      page: '/iot',
      action: 'IoT Monitoring sayfasına git ve sensör durumlarını incele',
      highlight: ['sensor-grid', 'alert-section', 'critical-sensors'],
      duration: 75,
    },
    {
      id: 'step-3',
      title: 'Stok Durumu Analizi',
      description:
        'Hangi ürünlerin hangi şubelerde tükenmek üzere olduğunu görüyor.',
      page: '/products',
      action: 'Ürünler sayfasına git ve stok kritik ürünleri filtrele',
      highlight: ['product-list', 'filters', 'stock-warnings'],
      duration: 60,
    },
    {
      id: 'step-4',
      title: 'Otomatik Transfer Önerileri',
      description:
        'AI, stok fazlası olan şubeden stok kritik şubeye transfer öneriyor.',
      page: '/automation',
      action: 'Otomasyon Merkezi sayfasına git ve transfer önerilerini gör',
      highlight: ['workflow-list', 'transfer-automation', 'ai-suggestions'],
      duration: 90,
    },
    {
      id: 'step-5',
      title: 'Satış Performans Raporu',
      description:
        'Hangi şubenin hangi kategoride iyi performans gösterdiğini AI analiz ediyor.',
      page: '/analytics',
      action: 'AI İş Zekası sayfasına git ve şube bazlı raporları incele',
      highlight: ['kpi-cards', 'trend-analysis', 'branch-comparison'],
      duration: 60,
    },
    {
      id: 'step-6',
      title: 'AR Ürün Görüntüleme',
      description:
        'Yeni ürünlerin mağazada nasıl görüneceğini AR ile simüle ediyor.',
      page: '/ar-vr',
      action: 'AR/VR Deneyimleri sayfasına git ve 3D modelleri incele',
      highlight: ['3d-models', 'ar-preview', 'virtual-showroom'],
      duration: 45,
    },
  ],
};

// ============================================
// SCENARIO 3: SİSTEM YÖNETİCİSİ
// ============================================
export const systemAdminScenario: DemoScenario = {
  id: 'system-admin',
  persona: 'system-admin',
  name: 'Zeynep Kaya',
  description:
    "Otoniq.ai'ın super admin'i. Tüm müşterileri (tenant'ları) yönetiyor ve sistem sağlığını izliyor.",
  avatar: '👩‍💻',
  role: 'Super Admin & CTO',
  company: 'Otoniq.ai',
  goals: [
    "Tüm tenant'ları yönetmek",
    'Sistem sağlığını ve performansını izlemek',
    'API kullanımını ve maliyetleri takip etmek',
    'Yeni müşterileri (tenant) eklemek',
  ],
  features: [
    'Admin Panel',
    'Tenant Yönetimi',
    'Sistem Monitoring',
    'API Analytics',
  ],
  journey: [
    {
      id: 'step-1',
      title: 'Admin Dashboard',
      description:
        'Zeynep sistemin genel sağlığını, aktif tenant sayısını ve gelir durumunu görüyor.',
      page: '/admin',
      action: 'Admin Panel sayfasını incele',
      highlight: ['admin-stats', 'revenue-chart', 'system-health'],
      duration: 30,
    },
    {
      id: 'step-2',
      title: 'Tenant Yönetimi',
      description:
        "Aktif tenant'ları görüyor, yeni müşteri ekliyor, mevcut planları düzenliyor.",
      page: '/admin',
      action: 'Tenant listesini incele ve yeni tenant ekle',
      highlight: ['tenant-table', 'add-tenant-button', 'tenant-details'],
      duration: 75,
    },
    {
      id: 'step-3',
      title: 'Sistem Performans İzleme',
      description:
        "API response time'larını, error rate'leri ve database performansını kontrol ediyor.",
      page: '/admin',
      action: 'Sistem Monitoring bölümünü incele',
      highlight: ['monitoring-metrics', 'error-logs', 'performance-graphs'],
      duration: 60,
    },
    {
      id: 'step-4',
      title: 'AI Model Durumu',
      description:
        'Kullanılan AI modellerin (GPT-4, Claude, Midjourney) API kullanım ve maliyetlerini görüyor.',
      page: '/admin',
      action: 'AI Model Status bölümünü incele',
      highlight: ['ai-models', 'api-usage', 'cost-analysis'],
      duration: 45,
    },
    {
      id: 'step-5',
      title: 'Gelir Analizi',
      description:
        'Aylık gelir, müşteri bazında MRR, churn rate gibi metrikleri izliyor.',
      page: '/admin',
      action: 'Revenue Analytics bölümünü incele',
      highlight: ['revenue-chart', 'mrr-metrics', 'customer-ltv'],
      duration: 60,
    },
    {
      id: 'step-6',
      title: 'Kullanıcı Desteği',
      description:
        "Tenant'lardan gelen destek taleplerini AI önceliklendiriyor ve atama yapıyor.",
      page: '/chat-automation',
      action: 'Chat Otomasyonu sayfasına git ve destek ticketlarını incele',
      highlight: ['support-tickets', 'priority-sorting', 'ai-responses'],
      duration: 45,
    },
  ],
};

// ============================================
// EXPORT ALL SCENARIOS
// ============================================
export const demoScenarios: DemoScenario[] = [
  ecommerceOwnerScenario,
  retailManagerScenario,
  systemAdminScenario,
];

export function getScenarioByPersona(
  persona: DemoPersona
): DemoScenario | undefined {
  return demoScenarios.find(s => s.persona === persona);
}

export function getTotalDemoTime(scenario: DemoScenario): number {
  return scenario.journey.reduce((total, step) => total + step.duration, 0);
}

export function formatDemoTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
