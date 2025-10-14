/**
 * Mock data for Orders Management
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  channel: 'website' | 'marketplace' | 'mobile' | 'phone';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  cancelledRate: number;
}

export const mockOrderStats: OrderStats = {
  totalOrders: 1847,
  pendingOrders: 23,
  totalRevenue: 2847650,
  averageOrderValue: 1542,
  todayOrders: 18,
  cancelledRate: 2.3,
};

export const mockOrders: Order[] = [
  {
    id: 'ord_001',
    orderNumber: 'ORD-2024-001847',
    customerId: 'cust_001',
    customerName: 'Ahmet Yılmaz',
    customerEmail: 'ahmet.yilmaz@example.com',
    customerPhone: '+90 532 123 4567',
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingMethod: 'express',
    channel: 'website',
    items: [
      {
        id: 'item_001',
        productId: 'prod_001',
        productName: 'iPhone 15 Pro Max 256GB',
        sku: 'APPLE-IP15PM-256-BLK',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 1,
        unitPrice: 54999,
        discount: 2000,
        tax: 9179.83,
        total: 62178.83,
      },
      {
        id: 'item_002',
        productId: 'prod_004',
        productName: 'Sony WH-1000XM5 Kulaklık',
        sku: 'SONY-WH1000XM5-BLK',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 1,
        unitPrice: 12999,
        discount: 0,
        tax: 2249.83,
        total: 15248.83,
      },
    ],
    subtotal: 65998,
    shippingCost: 0,
    tax: 11429.66,
    discount: 2000,
    total: 77427.66,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Ahmet Yılmaz',
      address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:42 Daire:5',
      city: 'İstanbul',
      postalCode: '34000',
      country: 'Türkiye',
      phone: '+90 532 123 4567',
    },
    billingAddress: {
      fullName: 'Ahmet Yılmaz',
      address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:42 Daire:5',
      city: 'İstanbul',
      postalCode: '34000',
      country: 'Türkiye',
      phone: '+90 532 123 4567',
    },
    notes: 'Lütfen mesai saatlerinde teslim edin',
    trackingNumber: 'TR1234567890',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'ord_002',
    orderNumber: 'ORD-2024-001846',
    customerId: 'cust_002',
    customerName: 'Ayşe Demir',
    customerEmail: 'ayse.demir@example.com',
    customerPhone: '+90 533 234 5678',
    status: 'preparing',
    paymentStatus: 'paid',
    shippingMethod: 'standard',
    channel: 'marketplace',
    items: [
      {
        id: 'item_003',
        productId: 'prod_003',
        productName: 'MacBook Pro 14" M3',
        sku: 'APPLE-MBP14-M3-512',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 1,
        unitPrice: 84999,
        discount: 5000,
        tax: 13849.83,
        total: 93848.83,
      },
    ],
    subtotal: 84999,
    shippingCost: 29.9,
    tax: 13849.83,
    discount: 5000,
    total: 93878.73,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Ayşe Demir',
      address: 'İnönü Mahallesi, Fatih Sokak No:12',
      city: 'Ankara',
      postalCode: '06000',
      country: 'Türkiye',
      phone: '+90 533 234 5678',
    },
    billingAddress: {
      fullName: 'Ayşe Demir',
      address: 'İnönü Mahallesi, Fatih Sokak No:12',
      city: 'Ankara',
      postalCode: '06000',
      country: 'Türkiye',
      phone: '+90 533 234 5678',
    },
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'ord_003',
    orderNumber: 'ORD-2024-001845',
    customerId: 'cust_003',
    customerName: 'Mehmet Kaya',
    customerEmail: 'mehmet.kaya@example.com',
    customerPhone: '+90 534 345 6789',
    status: 'shipped',
    paymentStatus: 'paid',
    shippingMethod: 'express',
    channel: 'mobile',
    items: [
      {
        id: 'item_004',
        productId: 'prod_002',
        productName: 'Samsung Galaxy S24 Ultra',
        sku: 'SAMSUNG-S24U-512-BLK',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 2,
        unitPrice: 49999,
        discount: 3000,
        tax: 16849.65,
        total: 113847.65,
      },
    ],
    subtotal: 99998,
    shippingCost: 0,
    tax: 16849.65,
    discount: 3000,
    total: 113847.65,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Mehmet Kaya',
      address: 'Alsancak Mahallesi, Kordon Bulvarı No:156',
      city: 'İzmir',
      postalCode: '35000',
      country: 'Türkiye',
      phone: '+90 534 345 6789',
    },
    billingAddress: {
      fullName: 'Mehmet Kaya',
      address: 'Alsancak Mahallesi, Kordon Bulvarı No:156',
      city: 'İzmir',
      postalCode: '35000',
      country: 'Türkiye',
      phone: '+90 534 345 6789',
    },
    trackingNumber: 'TR0987654321',
    estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 'ord_004',
    orderNumber: 'ORD-2024-001844',
    customerId: 'cust_004',
    customerName: 'Fatma Özkan',
    customerEmail: 'fatma.ozkan@example.com',
    customerPhone: '+90 535 456 7890',
    status: 'delivered',
    paymentStatus: 'paid',
    shippingMethod: 'standard',
    channel: 'website',
    items: [
      {
        id: 'item_005',
        productId: 'prod_005',
        productName: 'iPad Air 11" M2',
        sku: 'APPLE-IPAD-AIR11-M2',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 1,
        unitPrice: 28999,
        discount: 1000,
        tax: 4849.83,
        total: 32848.83,
      },
    ],
    subtotal: 28999,
    shippingCost: 29.9,
    tax: 4849.83,
    discount: 1000,
    total: 32878.73,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Fatma Özkan',
      address: 'Güzelyalı Mahallesi, Sahil Yolu No:78',
      city: 'Antalya',
      postalCode: '07000',
      country: 'Türkiye',
      phone: '+90 535 456 7890',
    },
    billingAddress: {
      fullName: 'Fatma Özkan',
      address: 'Güzelyalı Mahallesi, Sahil Yolu No:78',
      city: 'Antalya',
      postalCode: '07000',
      country: 'Türkiye',
      phone: '+90 535 456 7890',
    },
    trackingNumber: 'TR5555666677',
    deliveredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: 'ord_005',
    orderNumber: 'ORD-2024-001843',
    customerId: 'cust_005',
    customerName: 'Ali Şahin',
    customerEmail: 'ali.sahin@example.com',
    customerPhone: '+90 536 567 8901',
    status: 'pending',
    paymentStatus: 'pending',
    shippingMethod: 'standard',
    channel: 'phone',
    items: [
      {
        id: 'item_006',
        productId: 'prod_001',
        productName: 'iPhone 15 Pro Max 256GB',
        sku: 'APPLE-IP15PM-256-BLK',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 1,
        unitPrice: 54999,
        discount: 0,
        tax: 9524.83,
        total: 64523.83,
      },
    ],
    subtotal: 54999,
    shippingCost: 29.9,
    tax: 9524.83,
    discount: 0,
    total: 64553.73,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Ali Şahin',
      address: 'Kültür Mahallesi, Barış Sokak No:23',
      city: 'Bursa',
      postalCode: '16000',
      country: 'Türkiye',
      phone: '+90 536 567 8901',
    },
    billingAddress: {
      fullName: 'Ali Şahin',
      address: 'Kültür Mahallesi, Barış Sokak No:23',
      city: 'Bursa',
      postalCode: '16000',
      country: 'Türkiye',
      phone: '+90 536 567 8901',
    },
    notes: 'Ödeme onayı bekleniyor',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'ord_006',
    orderNumber: 'ORD-2024-001842',
    customerId: 'cust_006',
    customerName: 'Zeynep Arslan',
    customerEmail: 'zeynep.arslan@example.com',
    customerPhone: '+90 537 678 9012',
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingMethod: 'express',
    channel: 'marketplace',
    items: [
      {
        id: 'item_007',
        productId: 'prod_004',
        productName: 'Sony WH-1000XM5 Kulaklık',
        sku: 'SONY-WH1000XM5-BLK',
        imageUrl: 'https://via.placeholder.com/80',
        quantity: 3,
        unitPrice: 12999,
        discount: 1500,
        tax: 6524.74,
        total: 44021.74,
      },
    ],
    subtotal: 38997,
    shippingCost: 0,
    tax: 6524.74,
    discount: 1500,
    total: 44021.74,
    currency: 'TRY',
    shippingAddress: {
      fullName: 'Zeynep Arslan',
      address: 'Cumhuriyet Mahallesi, Atatürk Caddesi No:90',
      city: 'Eskişehir',
      postalCode: '26000',
      country: 'Türkiye',
      phone: '+90 537 678 9012',
    },
    billingAddress: {
      fullName: 'Zeynep Arslan',
      address: 'Cumhuriyet Mahallesi, Atatürk Caddesi No:90',
      city: 'Eskişehir',
      postalCode: '26000',
      country: 'Türkiye',
      phone: '+90 537 678 9012',
    },
    notes: 'Müşteri talebi ile iptal edildi',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
];

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-purple-100 text-purple-800 border-purple-300',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    returned: 'bg-orange-100 text-orange-800 border-orange-300',
  };
  return colors[status];
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels = {
    pending: 'Beklemede',
    confirmed: 'Onaylandı',
    preparing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
    returned: 'İade Edildi',
  };
  return labels[status];
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels = {
    pending: 'Bekliyor',
    paid: 'Ödendi',
    failed: 'Başarısız',
    refunded: 'İade Edildi',
  };
  return labels[status];
};

export const getChannelLabel = (channel: Order['channel']): string => {
  const labels = {
    website: 'Web Sitesi',
    marketplace: 'Pazaryeri',
    mobile: 'Mobil Uygulama',
    phone: 'Telefon',
  };
  return labels[channel];
};
