/**
 * Mock data for Shopify Integration
 */

export interface ShopifyConnection {
  storeUrl: string;
  storeName: string;
  isConnected: boolean;
  lastTest: Date;
  planName: string;
  apiVersion: string;
}

export interface ShopifySyncStats {
  totalSyncs: number;
  todaySyncs: number;
  successRate: number;
  lastSyncTime: Date;
  avgSyncDuration: number;
}

export interface ShopifySyncHistory {
  id: string;
  timestamp: Date;
  type: 'manual' | 'automatic' | 'webhook';
  operation:
    | 'full_sync'
    | 'stock_update'
    | 'price_update'
    | 'order_sync'
    | 'product_sync';
  recordsProcessed: number;
  successCount: number;
  failedCount: number;
  duration: number;
  status: 'completed' | 'failed' | 'partial';
}

export interface ShopifyWebhook {
  id: string;
  topic: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  format: 'json' | 'xml';
}

export interface ShopifyLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const mockShopifyConnection: ShopifyConnection = {
  storeUrl: 'otoniq-demo.myshopify.com',
  storeName: 'Otoniq Demo Store',
  isConnected: true,
  lastTest: new Date(Date.now() - 8 * 60 * 1000),
  planName: 'Shopify Plus',
  apiVersion: '2024-01',
};

export const mockShopifySyncStats: ShopifySyncStats = {
  totalSyncs: 850,
  todaySyncs: 12,
  successRate: 98.2,
  lastSyncTime: new Date(Date.now() - 10 * 60 * 1000),
  avgSyncDuration: 32,
};

export const mockShopifySyncHistory: ShopifySyncHistory[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    type: 'webhook',
    operation: 'order_sync',
    recordsProcessed: 5,
    successCount: 5,
    failedCount: 0,
    duration: 12,
    status: 'completed',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    type: 'automatic',
    operation: 'stock_update',
    recordsProcessed: 150,
    successCount: 150,
    failedCount: 0,
    duration: 45,
    status: 'completed',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 90 * 60 * 1000),
    type: 'manual',
    operation: 'full_sync',
    recordsProcessed: 320,
    successCount: 315,
    failedCount: 5,
    duration: 125,
    status: 'partial',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'automatic',
    operation: 'price_update',
    recordsProcessed: 80,
    successCount: 80,
    failedCount: 0,
    duration: 28,
    status: 'completed',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'webhook',
    operation: 'product_sync',
    recordsProcessed: 15,
    successCount: 15,
    failedCount: 0,
    duration: 18,
    status: 'completed',
  },
];

export const mockShopifyWebhooks: ShopifyWebhook[] = [
  {
    id: 'wh_001',
    topic: 'products/create',
    address: 'https://api.otoniq.ai/webhooks/shopify/products/create',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
    format: 'json',
  },
  {
    id: 'wh_002',
    topic: 'products/update',
    address: 'https://api.otoniq.ai/webhooks/shopify/products/update',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 45 * 60 * 1000),
    format: 'json',
  },
  {
    id: 'wh_003',
    topic: 'orders/create',
    address: 'https://api.otoniq.ai/webhooks/shopify/orders/create',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 10 * 60 * 1000),
    format: 'json',
  },
  {
    id: 'wh_004',
    topic: 'orders/updated',
    address: 'https://api.otoniq.ai/webhooks/shopify/orders/updated',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 25 * 60 * 1000),
    format: 'json',
  },
  {
    id: 'wh_005',
    topic: 'inventory_levels/update',
    address: 'https://api.otoniq.ai/webhooks/shopify/inventory/update',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastTriggered: new Date(Date.now() - 35 * 60 * 1000),
    format: 'json',
  },
];

export const mockShopifyLogs: ShopifyLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    level: 'info',
    message: 'Webhook alındı: orders/create',
    details: '3 yeni sipariş işlendi',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    level: 'info',
    message: 'Stok senkronizasyonu tamamlandı',
    details: '150 ürün stok bilgisi güncellendi',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 40 * 60 * 1000),
    level: 'warning',
    message: '5 ürün senkronize edilemedi',
    details: 'Ürün SKU eşleşmesi bulunamadı',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    level: 'info',
    message: 'Fiyat güncelleme başarılı',
    details: "80 ürün fiyatı Shopify'a aktarıldı",
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    level: 'error',
    message: 'Webhook doğrulama hatası',
    details: 'HMAC imza doğrulaması başarısız',
  },
];

export const getOperationLabel = (
  operation: ShopifySyncHistory['operation']
): string => {
  const labels = {
    full_sync: 'Tam Senkronizasyon',
    stock_update: 'Stok Güncelleme',
    price_update: 'Fiyat Güncelleme',
    order_sync: 'Sipariş Senkronizasyonu',
    product_sync: 'Ürün Senkronizasyonu',
  };
  return labels[operation];
};

export const getStatusColor = (
  status: ShopifySyncHistory['status']
): string => {
  const colors = {
    completed: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  return colors[status];
};

export const getLogLevelColor = (level: ShopifyLog['level']): string => {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  return colors[level];
};

export const getWebhookTopicLabel = (topic: string): string => {
  const labels: Record<string, string> = {
    'products/create': 'Ürün Oluşturma',
    'products/update': 'Ürün Güncelleme',
    'orders/create': 'Sipariş Oluşturma',
    'orders/updated': 'Sipariş Güncelleme',
    'inventory_levels/update': 'Stok Seviyesi Güncelleme',
  };
  return labels[topic] || topic;
};
