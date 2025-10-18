/**
 * Competitor Analysis Mock Data
 * Rakip analizi için mock veriler
 */

export interface CompetitorProfile {
  id: string;
  name: string;
  website: string;
  platform: 'shopify' | 'amazon' | 'etsy' | 'woocommerce' | 'other';
  logo?: string;
  description: string;
  isActive: boolean;
  lastAnalyzed: string;
  totalReviews: number;
  sentimentScore: number; // 0-100
  opportunities: number;
  status: 'active' | 'warning' | 'critical';
}

export interface CompetitorInsight {
  id: string;
  competitorId: string;
  category: 'shipping' | 'quality' | 'price' | 'support' | 'packaging';
  complaintCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trend: 'increasing' | 'stable' | 'decreasing';
  opportunityLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  aiRecommendation: string;
}

export interface CompetitorStrategy {
  id: string;
  competitorId: string;
  type: 'instagram_post' | 'blog_article' | 'ad_campaign' | 'product_campaign';
  title: string;
  content: string;
  targetAudience: string;
  budget?: number;
  expectedROI?: number;
  status: 'draft' | 'ready' | 'published' | 'paused';
  createdAt: string;
}

export interface CompetitorAlert {
  id: string;
  competitorId: string;
  type: 'stock_out' | 'price_increase' | 'negative_trend' | 'new_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  createdAt: string;
}

// Mock Competitor Profiles
export const mockCompetitors: CompetitorProfile[] = [
  {
    id: 'comp-001',
    name: 'TechGadgetStore',
    website: 'https://techgadgetstore.com',
    platform: 'shopify',
    logo: '🔧',
    description: 'Elektronik ürünler satan büyük rakip',
    isActive: true,
    lastAnalyzed: '2025-01-17T09:30:00Z',
    totalReviews: 2847,
    sentimentScore: 68,
    opportunities: 3,
    status: 'warning',
  },
  {
    id: 'comp-002',
    name: 'HomeDecorPlus',
    website: 'https://homedecorplus.com',
    platform: 'amazon',
    logo: '🏠',
    description: 'Ev dekorasyon ürünleri',
    isActive: true,
    lastAnalyzed: '2025-01-17T08:15:00Z',
    totalReviews: 1523,
    sentimentScore: 45,
    opportunities: 5,
    status: 'critical',
  },
  {
    id: 'comp-003',
    name: 'FashionTrends',
    website: 'https://fashiontrends.etsy.com',
    platform: 'etsy',
    logo: '👗',
    description: 'Moda ve aksesuar ürünleri',
    isActive: true,
    lastAnalyzed: '2025-01-17T07:45:00Z',
    totalReviews: 892,
    sentimentScore: 72,
    opportunities: 2,
    status: 'active',
  },
];

// Mock Competitor Insights
export const mockInsights: CompetitorInsight[] = [
  {
    id: 'insight-001',
    competitorId: 'comp-001',
    category: 'shipping',
    complaintCount: 127,
    sentiment: 'negative',
    trend: 'increasing',
    opportunityLevel: 'critical',
    description: 'Kargo gecikmesi şikayetleri %43 artış gösteriyor',
    aiRecommendation: 'Hızlı kargo garantisi vererek bu segmenti hedefleyin!',
  },
  {
    id: 'insight-002',
    competitorId: 'comp-001',
    category: 'quality',
    complaintCount: 89,
    sentiment: 'negative',
    trend: 'stable',
    opportunityLevel: 'high',
    description: 'Ürün kalitesi düşük şikayetleri',
    aiRecommendation: 'Kaliteli ürün vurgusu yapan kampanya oluşturun',
  },
  {
    id: 'insight-003',
    competitorId: 'comp-002',
    category: 'price',
    complaintCount: 65,
    sentiment: 'negative',
    trend: 'increasing',
    opportunityLevel: 'high',
    description: 'Fiyat yüksekliği şikayetleri artıyor',
    aiRecommendation: 'Fiyat avantajı kampanyası başlatın',
  },
  {
    id: 'insight-004',
    competitorId: 'comp-002',
    category: 'support',
    complaintCount: 54,
    sentiment: 'negative',
    trend: 'increasing',
    opportunityLevel: 'medium',
    description: 'Müşteri desteği yetersizliği',
    aiRecommendation: '7/24 destek hizmeti vurgusu yapın',
  },
];

// Mock Strategies
export const mockStrategies: CompetitorStrategy[] = [
  {
    id: 'strategy-001',
    competitorId: 'comp-001',
    type: 'instagram_post',
    title: 'Hızlı Kargo Garantisi Post',
    content:
      'Siparişiniz bekletmeden kapınızda! 🚀\n❌ 2 hafta bekleme yok\n✅ Aynı gün kargo garantisi\n[Ürün linki] #hizlikargo #aynigun #guvenli',
    targetAudience: 'Rakip müşterileri (retargeting)',
    budget: 500,
    expectedROI: 320,
    status: 'ready',
    createdAt: '2025-01-17T10:00:00Z',
  },
  {
    id: 'strategy-002',
    competitorId: 'comp-001',
    type: 'blog_article',
    title: 'Online Alışverişte Kargo Kabusu Yaşamayın',
    content:
      'Birçok müşteri online alışverişte en çok kargo gecikmelerinden şikayet ediyor. İşte bizim çözümlerimiz...',
    targetAudience: 'Kargo sorunu yaşayan müşteriler',
    budget: 0,
    expectedROI: 150,
    status: 'draft',
    createdAt: '2025-01-17T09:45:00Z',
  },
  {
    id: 'strategy-003',
    competitorId: 'comp-002',
    type: 'ad_campaign',
    title: 'Fiyat Avantajı Kampanyası',
    content:
      'Rakiplerimizde 2 hafta beklerken, biz aynı gün kapınıza getiriyoruz. %20 indirimle!',
    targetAudience: 'Rakip web sitesi ziyaretçileri',
    budget: 1500,
    expectedROI: 450,
    status: 'ready',
    createdAt: '2025-01-17T09:30:00Z',
  },
  {
    id: 'strategy-004',
    competitorId: 'comp-002',
    type: 'product_campaign',
    title: 'Hızlı & Kaliteli Alışveriş Fırsatı',
    content:
      'Rakibinizin en çok şikayet edilen ürünlerine benzer ürünlerinizi öne çıkarın!',
    targetAudience: 'Rakip müşterileri',
    budget: 2000,
    expectedROI: 600,
    status: 'draft',
    createdAt: '2025-01-17T09:15:00Z',
  },
];

// Mock Alerts
export const mockAlerts: CompetitorAlert[] = [
  {
    id: 'alert-001',
    competitorId: 'comp-001',
    type: 'stock_out',
    severity: 'high',
    title: "TechGadgetStore'da Toplu Stok Tükenmesi!",
    description: '3 popüler ürün stokta yok. Bu ürünleri öne çıkarın!',
    actionRequired: true,
    createdAt: '2025-01-17T10:30:00Z',
  },
  {
    id: 'alert-002',
    competitorId: 'comp-002',
    type: 'price_increase',
    severity: 'medium',
    title: "HomeDecorPlus'da Fiyat Artışı",
    description:
      'Rakip %35 fiyat artışı yaptı. Fiyat avantajı kampanyası önerilir!',
    actionRequired: false,
    createdAt: '2025-01-17T09:45:00Z',
  },
  {
    id: 'alert-003',
    competitorId: 'comp-003',
    type: 'negative_trend',
    severity: 'critical',
    title: "FashionTrends'de Negatif Trend",
    description:
      'Müşteri memnuniyeti %15 düştü. Müşteri desteği kampanyası başlatın!',
    actionRequired: true,
    createdAt: '2025-01-17T08:20:00Z',
  },
];

// Helper Functions
export const getCompetitorById = (
  id: string
): CompetitorProfile | undefined => {
  return mockCompetitors.find(comp => comp.id === id);
};

export const getInsightsByCompetitor = (
  competitorId: string
): CompetitorInsight[] => {
  return mockInsights.filter(insight => insight.competitorId === competitorId);
};

export const getStrategiesByCompetitor = (
  competitorId: string
): CompetitorStrategy[] => {
  return mockStrategies.filter(
    strategy => strategy.competitorId === competitorId
  );
};

export const getAlertsByCompetitor = (
  competitorId: string
): CompetitorAlert[] => {
  return mockAlerts.filter(alert => alert.competitorId === competitorId);
};

export const getTotalOpportunities = (): number => {
  return mockCompetitors.reduce((total, comp) => total + comp.opportunities, 0);
};

export const getCriticalAlerts = (): CompetitorAlert[] => {
  return mockAlerts.filter(
    alert => alert.severity === 'critical' || alert.severity === 'high'
  );
};
