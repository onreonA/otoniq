/**
 * Mock data for Odoo Integration
 */

export interface OdooConnection {
  url: string;
  database: string;
  username: string;
  isConnected: boolean;
  lastTest: Date;
  version: string;
}

export interface OdooSyncStats {
  totalSyncs: number;
  todaySyncs: number;
  successRate: number;
  lastSyncTime: Date;
  avgSyncDuration: number;
}

export interface OdooSyncHistory {
  id: string;
  timestamp: Date;
  type: 'manual' | 'automatic';
  operation: 'full_sync' | 'stock_update' | 'price_update' | 'new_products';
  recordsProcessed: number;
  successCount: number;
  failedCount: number;
  duration: number;
  status: 'completed' | 'failed' | 'partial';
}

export interface OdooProductMapping {
  odooProductId: string;
  odooProductName: string;
  otoniqProductId?: string;
  otoniqProductName?: string;
  matchType: 'sku' | 'barcode' | 'name' | 'manual' | 'unmapped';
  lastSync: Date;
}

export interface OdooLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const mockOdooConnection: OdooConnection = {
  url: 'https://demo.odoo.com',
  database: 'otoniq_db',
  username: 'admin@otoniq.com',
  isConnected: true,
  lastTest: new Date(Date.now() - 10 * 60 * 1000),
  version: 'Odoo 17.0',
};

export const mockOdooSyncStats: OdooSyncStats = {
  totalSyncs: 1250,
  todaySyncs: 15,
  successRate: 96.5,
  lastSyncTime: new Date(Date.now() - 5 * 60 * 1000),
  avgSyncDuration: 45,
};

export const mockOdooSyncHistory: OdooSyncHistory[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: 'automatic',
    operation: 'stock_update',
    recordsProcessed: 120,
    successCount: 120,
    failedCount: 0,
    duration: 35,
    status: 'completed',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    type: 'manual',
    operation: 'full_sync',
    recordsProcessed: 450,
    successCount: 445,
    failedCount: 5,
    duration: 180,
    status: 'partial',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: 'automatic',
    operation: 'price_update',
    recordsProcessed: 85,
    successCount: 85,
    failedCount: 0,
    duration: 28,
    status: 'completed',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'automatic',
    operation: 'new_products',
    recordsProcessed: 25,
    successCount: 25,
    failedCount: 0,
    duration: 52,
    status: 'completed',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    type: 'manual',
    operation: 'full_sync',
    recordsProcessed: 500,
    successCount: 480,
    failedCount: 20,
    duration: 220,
    status: 'partial',
  },
];

export const mockOdooProductMappings: OdooProductMapping[] = [
  {
    odooProductId: 'odoo_001',
    odooProductName: 'Apple iPhone 15 Pro',
    otoniqProductId: 'prod_123',
    otoniqProductName: 'iPhone 15 Pro 256GB',
    matchType: 'sku',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    odooProductId: 'odoo_002',
    odooProductName: 'Samsung Galaxy S24 Ultra',
    otoniqProductId: 'prod_124',
    otoniqProductName: 'Galaxy S24 Ultra 512GB',
    matchType: 'barcode',
    lastSync: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    odooProductId: 'odoo_003',
    odooProductName: 'MacBook Pro M3',
    otoniqProductId: 'prod_125',
    otoniqProductName: 'MacBook Pro 14" M3',
    matchType: 'manual',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    odooProductId: 'odoo_004',
    odooProductName: 'Sony WH-1000XM5',
    matchType: 'unmapped',
    lastSync: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    odooProductId: 'odoo_005',
    odooProductName: 'iPad Pro 12.9"',
    otoniqProductId: 'prod_126',
    otoniqProductName: 'iPad Pro 12.9" 256GB',
    matchType: 'sku',
    lastSync: new Date(Date.now() - 25 * 60 * 1000),
  },
];

export const mockOdooLogs: OdooLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    level: 'info',
    message: 'Stok senkronizasyonu başarıyla tamamlandı',
    details: '120 ürün güncellendi',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    level: 'warning',
    message: '5 ürün eşleştirilemedi',
    details: 'SKU bilgisi eksik olan ürünler atlandı',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    level: 'info',
    message: 'Fiyat güncelleme tamamlandı',
    details: '85 ürün fiyatı güncellendi',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    level: 'error',
    message: 'API bağlantı hatası',
    details: 'Timeout: Odoo sunucusuna ulaşılamadı',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    level: 'info',
    message: '25 yeni ürün eklendi',
    details: "Odoo'dan otomatik ürün çekimi başarılı",
  },
];

export const getOperationLabel = (
  operation: OdooSyncHistory['operation']
): string => {
  const labels = {
    full_sync: 'Tam Senkronizasyon',
    stock_update: 'Stok Güncelleme',
    price_update: 'Fiyat Güncelleme',
    new_products: 'Yeni Ürünler',
  };
  return labels[operation];
};

export const getStatusColor = (status: OdooSyncHistory['status']): string => {
  const colors = {
    completed: 'bg-green-100 text-green-800 border-green-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };
  return colors[status];
};

export const getLogLevelColor = (level: OdooLog['level']): string => {
  const colors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  return colors[level];
};
