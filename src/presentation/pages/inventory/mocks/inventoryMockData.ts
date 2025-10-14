/**
 * Mock data for Inventory Management
 */

export interface StockLevel {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  reason: string;
  reference: string;
  createdBy: string;
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  totalProducts: number;
  totalStock: number;
  capacity: number;
  isActive: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

export const mockInventoryStats: InventoryStats = {
  totalProducts: 324,
  totalStock: 15847,
  lowStockItems: 23,
  outOfStockItems: 8,
  totalValue: 2847650,
};

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh_001',
    name: 'Ana Depo - İstanbul',
    code: 'IST-01',
    address: 'Atatürk Mahallesi, Organize Sanayi Bölgesi',
    city: 'İstanbul',
    country: 'Türkiye',
    totalProducts: 280,
    totalStock: 12450,
    capacity: 20000,
    isActive: true,
  },
  {
    id: 'wh_002',
    name: 'Bölge Deposu - Ankara',
    code: 'ANK-01',
    address: 'İvedik Organize Sanayi',
    city: 'Ankara',
    country: 'Türkiye',
    totalProducts: 156,
    totalStock: 2340,
    capacity: 5000,
    isActive: true,
  },
  {
    id: 'wh_003',
    name: 'Bölge Deposu - İzmir',
    code: 'IZM-01',
    address: 'Atatürk Organize Sanayi Bölgesi',
    city: 'İzmir',
    country: 'Türkiye',
    totalProducts: 98,
    totalStock: 1057,
    capacity: 3000,
    isActive: true,
  },
];

export const mockStockLevels: StockLevel[] = [
  {
    id: 'sl_001',
    productId: 'prod_001',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APPLE-IP15PM-256-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    quantity: 45,
    reserved: 8,
    available: 37,
    minStock: 20,
    maxStock: 100,
    status: 'in_stock',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'sl_002',
    productId: 'prod_002',
    productName: 'Samsung Galaxy S24 Ultra',
    sku: 'SAMSUNG-S24U-512-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    quantity: 12,
    reserved: 3,
    available: 9,
    minStock: 15,
    maxStock: 80,
    status: 'low_stock',
    lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'sl_003',
    productId: 'prod_003',
    productName: 'MacBook Pro 14" M3',
    sku: 'APPLE-MBP14-M3-512',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    quantity: 0,
    reserved: 0,
    available: 0,
    minStock: 5,
    maxStock: 30,
    status: 'out_of_stock',
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'sl_004',
    productId: 'prod_004',
    productName: 'Sony WH-1000XM5 Kulaklık',
    sku: 'SONY-WH1000XM5-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    quantity: 156,
    reserved: 12,
    available: 144,
    minStock: 30,
    maxStock: 100,
    status: 'overstock',
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'sl_005',
    productId: 'prod_005',
    productName: 'iPad Air 11" M2',
    sku: 'APPLE-IPAD-AIR11-M2',
    warehouseId: 'wh_002',
    warehouseName: 'Bölge Deposu - Ankara',
    quantity: 23,
    reserved: 5,
    available: 18,
    minStock: 10,
    maxStock: 50,
    status: 'in_stock',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
];

export const mockStockMovements: StockMovement[] = [
  {
    id: 'sm_001',
    productId: 'prod_001',
    productName: 'iPhone 15 Pro Max 256GB',
    sku: 'APPLE-IP15PM-256-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    type: 'in',
    quantity: 50,
    reason: 'Tedarikçi Girişi',
    reference: 'PO-2024-001',
    createdBy: 'Ahmet Yılmaz',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'sm_002',
    productId: 'prod_002',
    productName: 'Samsung Galaxy S24 Ultra',
    sku: 'SAMSUNG-S24U-512-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    type: 'out',
    quantity: 8,
    reason: 'Müşteri Siparişi',
    reference: 'SO-2024-156',
    createdBy: 'Sistem',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'sm_003',
    productId: 'prod_004',
    productName: 'Sony WH-1000XM5 Kulaklık',
    sku: 'SONY-WH1000XM5-BLK',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    type: 'transfer',
    quantity: 20,
    reason: 'Depolar Arası Transfer',
    reference: 'TR-2024-045',
    createdBy: 'Mehmet Demir',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'sm_004',
    productId: 'prod_005',
    productName: 'iPad Air 11" M2',
    sku: 'APPLE-IPAD-AIR11-M2',
    warehouseId: 'wh_002',
    warehouseName: 'Bölge Deposu - Ankara',
    type: 'adjustment',
    quantity: -2,
    reason: 'Sayım Düzeltmesi',
    reference: 'ADJ-2024-012',
    createdBy: 'Ayşe Kaya',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'sm_005',
    productId: 'prod_003',
    productName: 'MacBook Pro 14" M3',
    sku: 'APPLE-MBP14-M3-512',
    warehouseId: 'wh_001',
    warehouseName: 'Ana Depo - İstanbul',
    type: 'out',
    quantity: 5,
    reason: 'Toplu Sipariş',
    reference: 'SO-2024-187',
    createdBy: 'Sistem',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export const getStockStatusColor = (status: StockLevel['status']): string => {
  const colors = {
    in_stock: 'bg-green-100 text-green-800 border-green-300',
    low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    out_of_stock: 'bg-red-100 text-red-800 border-red-300',
    overstock: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return colors[status];
};

export const getStockStatusLabel = (status: StockLevel['status']): string => {
  const labels = {
    in_stock: 'Stokta',
    low_stock: 'Düşük Stok',
    out_of_stock: 'Tükendi',
    overstock: 'Fazla Stok',
  };
  return labels[status];
};

export const getMovementTypeColor = (type: StockMovement['type']): string => {
  const colors = {
    in: 'bg-green-500/20 text-green-400',
    out: 'bg-red-500/20 text-red-400',
    transfer: 'bg-blue-500/20 text-blue-400',
    adjustment: 'bg-yellow-500/20 text-yellow-400',
  };
  return colors[type];
};

export const getMovementTypeLabel = (type: StockMovement['type']): string => {
  const labels = {
    in: 'Giriş',
    out: 'Çıkış',
    transfer: 'Transfer',
    adjustment: 'Düzeltme',
  };
  return labels[type];
};
