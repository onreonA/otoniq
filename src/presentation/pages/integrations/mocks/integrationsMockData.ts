/**
 * Mock data for Integrations Hub
 */

export interface Integration {
  id: string;
  name: string;
  category:
    | 'erp'
    | 'ecommerce'
    | 'marketplace'
    | 'b2b'
    | 'payment'
    | 'shipping'
    | 'social';
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  icon: string;
  description: string;
  lastSync?: Date;
  syncCount?: number;
  errorMessage?: string;
  features: string[];
  link?: string;
}

export interface SyncActivity {
  id: string;
  integrationName: string;
  type: 'sync' | 'error' | 'connect' | 'disconnect';
  message: string;
  timestamp: Date;
  details?: string;
}

export const mockIntegrations: Integration[] = [
  // ERP Systems
  {
    id: 'odoo',
    name: 'Odoo ERP',
    category: 'erp',
    status: 'connected',
    icon: '🏢',
    description: 'Enterprise Resource Planning sistemi',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    syncCount: 1250,
    features: [
      'Ürün Senkronizasyonu',
      'Stok Yönetimi',
      'Fiyat Güncelleme',
      'Kategori Eşleştirme',
    ],
  },
  {
    id: 'sap',
    name: 'SAP ERP',
    category: 'erp',
    status: 'disconnected',
    icon: '💼',
    description: 'SAP Business One entegrasyonu',
    features: ['Ürün Yönetimi', 'Finans Entegrasyonu', 'Tedarik Zinciri'],
  },

  // E-Commerce Platforms
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    status: 'connected',
    icon: '🛍️',
    description: 'E-ticaret mağaza platformu',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
    syncCount: 850,
    features: [
      'Ürün Senkronizasyonu',
      'Sipariş Yönetimi',
      'Stok Güncelleme',
      'Webhook Desteği',
    ],
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    status: 'disconnected',
    icon: '🛒',
    description: 'WordPress e-ticaret eklentisi',
    features: ['Ürün Yönetimi', 'Sipariş Senkronizasyonu', 'Stok Kontrolü'],
  },

  // B2B Marketplaces
  {
    id: 'alibaba',
    name: 'Alibaba.com',
    category: 'b2b',
    status: 'connected',
    icon: '🌐',
    description: 'Global B2B marketplace platformu',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    syncCount: 1850,
    link: '/integrations/alibaba',
    features: [
      'B2B Ürün Listeleme',
      'RFQ Yönetimi',
      'Sipariş Takibi',
      'Navlun Hesaplama',
      'Mesajlaşma Otomasyonu',
      'Analitik & Raporlama',
    ],
  },

  // Marketplaces
  {
    id: 'trendyol',
    name: 'Trendyol',
    category: 'marketplace',
    status: 'connected',
    icon: '🏪',
    description: "Türkiye'nin önde gelen e-ticaret platformu",
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    syncCount: 3420,
    features: [
      'Ürün Listeleme',
      'Sipariş Yönetimi',
      'Fiyat/Stok Güncelleme',
      'Kargo Entegrasyonu',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'marketplace',
    status: 'error',
    icon: '📦',
    description: 'Global e-ticaret devi',
    errorMessage: 'API bağlantı hatası - Credentials geçersiz',
    features: ['FBA Entegrasyonu', 'Çoklu Marketplace', 'Raporlama'],
  },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    category: 'marketplace',
    status: 'disconnected',
    icon: '🏬',
    description: "Türkiye'nin en büyük e-ticaret platformu",
    features: ['Ürün Listeleme', 'Sipariş Yönetimi', 'Kargo Takibi'],
  },
  {
    id: 'n11',
    name: 'N11',
    category: 'marketplace',
    status: 'disconnected',
    icon: '🛒',
    description: 'Online alışveriş sitesi',
    features: ['Ürün Yönetimi', 'Sipariş Takibi', 'Komisyon Hesaplama'],
  },

  // Payment Systems
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    status: 'disconnected',
    icon: '💳',
    description: 'Global ödeme altyapısı',
    features: ['Kredi Kartı', 'Apple Pay', 'Google Pay', 'Abonelik Yönetimi'],
  },
  {
    id: 'iyzico',
    name: 'İyzico',
    category: 'payment',
    status: 'disconnected',
    icon: '💰',
    description: 'Türkiye ödeme çözümleri',
    features: ['Kredi Kartı', 'BKM Express', 'Taksit Seçenekleri'],
  },

  // Shipping
  {
    id: 'aras',
    name: 'Aras Kargo',
    category: 'shipping',
    status: 'disconnected',
    icon: '📦',
    description: 'Kargo ve lojistik hizmetleri',
    features: ['Kargo Takibi', 'Etiket Oluşturma', 'Toplu Gönderim'],
  },
  {
    id: 'yurtici',
    name: 'Yurtiçi Kargo',
    category: 'shipping',
    status: 'disconnected',
    icon: '🚚',
    description: 'Kargo hizmetleri',
    features: ['Kargo Takibi', 'Etiket Yazdırma', 'Fiyat Hesaplama'],
  },

  // Social Media
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    status: 'disconnected',
    icon: '📱',
    description: 'Instagram Shopping entegrasyonu',
    features: ['Ürün Etiketleme', 'Story Paylaşımı', 'Analytics'],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    status: 'disconnected',
    icon: '👥',
    description: 'Facebook Marketplace entegrasyonu',
    features: ['Marketplace Listeleme', 'Otomatik Paylaşım', 'Reklam Yönetimi'],
  },
];

export const mockSyncActivities: SyncActivity[] = [
  {
    id: '1',
    integrationName: 'Shopify',
    type: 'sync',
    message: '50 ürün başarıyla senkronize edildi',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    details: '50 ürün güncellendi, 0 hata',
  },
  {
    id: '2',
    integrationName: 'Amazon',
    type: 'error',
    message: 'Bağlantı hatası',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    details: 'API credentials geçersiz, lütfen ayarları kontrol edin',
  },
  {
    id: '3',
    integrationName: 'Trendyol',
    type: 'sync',
    message: '3 yeni sipariş alındı',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    details: 'Toplam tutar: ₺2,450',
  },
  {
    id: '4',
    integrationName: 'Odoo',
    type: 'sync',
    message: 'Stok seviyeleri güncellendi',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    details: '120 ürün stok bilgisi güncellendi',
  },
  {
    id: '5',
    integrationName: 'Shopify',
    type: 'sync',
    message: '15 ürün fiyatı güncellendi',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    details: 'Otomatik fiyat senkronizasyonu',
  },
  {
    id: '6',
    integrationName: 'Trendyol',
    type: 'sync',
    message: 'Sipariş durumu güncellendi',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    details: '5 sipariş "kargoda" durumuna geçti',
  },
  {
    id: '7',
    integrationName: 'Odoo',
    type: 'sync',
    message: '25 yeni ürün eklendi',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    details: "Odoo'dan otomatik ürün çekimi",
  },
];

export const getCategoryLabel = (category: Integration['category']): string => {
  const labels = {
    erp: 'ERP Sistemleri',
    ecommerce: 'E-Ticaret Platformları',
    marketplace: 'Pazaryerleri',
    b2b: 'B2B Pazaryerleri',
    payment: 'Ödeme Sistemleri',
    shipping: 'Kargo Firmaları',
    social: 'Sosyal Medya',
  };
  return labels[category];
};

export const getStatusLabel = (status: Integration['status']): string => {
  const labels = {
    connected: 'Bağlı',
    disconnected: 'Bağlı Değil',
    error: 'Hata',
    configuring: 'Yapılandırılıyor',
  };
  return labels[status];
};

export const getStatusColor = (status: Integration['status']): string => {
  const colors = {
    connected: 'bg-green-100 text-green-800 border-green-300',
    disconnected: 'bg-gray-100 text-gray-800 border-gray-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    configuring: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  return colors[status];
};
