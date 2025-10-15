// Alibaba Mock Data - Comprehensive test data for all integration features

// ============================================================================
// CONNECTION STATUS
// ============================================================================

export interface AlibabaConnection {
  id: string;
  storeUrl: string;
  storeName: string;
  appKey: string;
  isConnected: boolean;
  lastSyncAt: Date;
  syncFrequency: number; // minutes
  autoSyncEnabled: boolean;
  createdAt: Date;
}

export const mockAlibabaConnection: AlibabaConnection = {
  id: 'conn-alibaba-001',
  storeUrl: 'https://otoniq.en.alibaba.com',
  storeName: 'Otoniq Global Trading',
  appKey: 'app_key_123456789',
  isConnected: true,
  lastSyncAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  syncFrequency: 60,
  autoSyncEnabled: true,
  createdAt: new Date('2024-01-15'),
};

// ============================================================================
// PRODUCTS
// ============================================================================

export type AlibabaProductStatus =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'pending_approval';

export interface AlibabaProduct {
  id: string;
  title: string;
  sku: string;
  category: string;
  subcategory: string;
  price: number;
  minOrderQuantity: number;
  currency: string;
  stock: number;
  images: string[];
  description: string;
  attributes: Record<string, any>;
  status: AlibabaProductStatus;
  views: number;
  inquiries: number;
  lastSyncAt: Date;
  createdAt: Date;
}

const categories = [
  'Electronics',
  'Apparel & Accessories',
  'Home & Garden',
  'Sports & Entertainment',
  'Toys & Hobbies',
  'Beauty & Personal Care',
  'Machinery',
  'Packaging & Printing',
];

const subcategories: Record<string, string[]> = {
  Electronics: [
    'Mobile Phones',
    'Laptops',
    'Tablets',
    'Smart Watches',
    'Headphones',
  ],
  'Apparel & Accessories': ['T-Shirts', 'Jeans', 'Dresses', 'Shoes', 'Bags'],
  'Home & Garden': [
    'Furniture',
    'Kitchen Appliances',
    'Bedding',
    'Decor',
    'Tools',
  ],
  'Sports & Entertainment': [
    'Fitness Equipment',
    'Camping Gear',
    'Bicycles',
    'Gaming',
    'Musical Instruments',
  ],
  'Toys & Hobbies': [
    'Action Figures',
    'Dolls',
    'Puzzles',
    'RC Toys',
    'Educational Toys',
  ],
  'Beauty & Personal Care': [
    'Skincare',
    'Makeup',
    'Hair Care',
    'Fragrances',
    'Tools',
  ],
  Machinery: [
    'Industrial Equipment',
    'Construction Machinery',
    'Agricultural Machinery',
    'Food Processing',
    'Textile Machinery',
  ],
  'Packaging & Printing': [
    'Boxes',
    'Bags',
    'Labels',
    'Printing Machines',
    'Packaging Materials',
  ],
};

export const mockAlibabaProducts: AlibabaProduct[] = Array.from(
  { length: 120 },
  (_, i) => {
    const category = categories[i % categories.length];
    const subcategoryList = subcategories[category];
    const subcategory = subcategoryList[i % subcategoryList.length];
    const status: AlibabaProductStatus =
      i % 10 === 0
        ? 'draft'
        : i % 15 === 0
          ? 'inactive'
          : i % 20 === 0
            ? 'pending_approval'
            : 'active';

    return {
      id: `alibaba-prod-${String(i + 1).padStart(4, '0')}`,
      title: `${category} - ${subcategory} Product ${i + 1}`,
      sku: `ALI-${category.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(5, '0')}`,
      category,
      subcategory,
      price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      minOrderQuantity: [1, 10, 50, 100, 500][i % 5],
      currency: 'USD',
      stock: Math.floor(Math.random() * 10000 + 100),
      images: [
        `https://picsum.photos/seed/alibaba-${i}-1/400/400`,
        `https://picsum.photos/seed/alibaba-${i}-2/400/400`,
        `https://picsum.photos/seed/alibaba-${i}-3/400/400`,
      ],
      description: `High-quality ${subcategory.toLowerCase()} product from verified supplier. Customization available. Fast shipping worldwide. MOQ: ${[1, 10, 50, 100, 500][i % 5]} units.`,
      attributes: {
        material: ['Cotton', 'Polyester', 'Metal', 'Plastic', 'Wood'][i % 5],
        color: ['Black', 'White', 'Blue', 'Red', 'Green'][i % 5],
        size: ['S', 'M', 'L', 'XL', 'XXL'][i % 5],
        weight: `${(Math.random() * 5 + 0.5).toFixed(2)} kg`,
        origin: 'China',
      },
      status,
      views: Math.floor(Math.random() * 5000 + 100),
      inquiries: Math.floor(Math.random() * 50 + 5),
      lastSyncAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ),
      createdAt: new Date(
        Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
      ),
    };
  }
);

// ============================================================================
// ORDERS
// ============================================================================

export type AlibabaOrderStatus =
  | 'awaiting_payment'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled'
  | 'refunded';
export type AlibabaPaymentStatus =
  | 'pending'
  | 'paid'
  | 'escrow'
  | 'released'
  | 'refunded';
export type AlibabaShippingStatus =
  | 'pending'
  | 'preparing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'returned';

export interface AlibabaOrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AlibabaOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  items: AlibabaOrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentStatus: AlibabaPaymentStatus;
  shippingStatus: AlibabaShippingStatus;
  orderStatus: AlibabaOrderStatus;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const mockAlibabaOrders: AlibabaOrder[] = Array.from(
  { length: 60 },
  (_, i) => {
    const itemCount = Math.floor(Math.random() * 3 + 1);
    const items: AlibabaOrderItem[] = Array.from(
      { length: itemCount },
      (_, j) => {
        const product =
          mockAlibabaProducts[
            Math.floor(Math.random() * mockAlibabaProducts.length)
          ];
        const quantity = Math.floor(Math.random() * 100 + 10);
        const unitPrice = product.price;
        return {
          productId: product.id,
          productTitle: product.title,
          sku: product.sku,
          quantity,
          unitPrice,
          totalPrice: quantity * unitPrice,
        };
      }
    );

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCost = parseFloat((subtotal * 0.1).toFixed(2));
    const totalAmount = subtotal + shippingCost;

    const orderStatuses: AlibabaOrderStatus[] = [
      'awaiting_payment',
      'processing',
      'shipped',
      'completed',
      'cancelled',
      'refunded',
    ];
    const orderStatus = orderStatuses[i % orderStatuses.length];

    let paymentStatus: AlibabaPaymentStatus = 'pending';
    let shippingStatus: AlibabaShippingStatus = 'pending';

    if (orderStatus === 'awaiting_payment') {
      paymentStatus = 'pending';
      shippingStatus = 'pending';
    } else if (orderStatus === 'processing') {
      paymentStatus = 'escrow';
      shippingStatus = 'preparing';
    } else if (orderStatus === 'shipped') {
      paymentStatus = 'escrow';
      shippingStatus = 'in_transit';
    } else if (orderStatus === 'completed') {
      paymentStatus = 'released';
      shippingStatus = 'delivered';
    } else if (orderStatus === 'cancelled') {
      paymentStatus = 'refunded';
      shippingStatus = 'pending';
    } else if (orderStatus === 'refunded') {
      paymentStatus = 'refunded';
      shippingStatus = 'returned';
    }

    return {
      id: `alibaba-order-${String(i + 1).padStart(4, '0')}`,
      orderNumber: `ALI-ORD-${String(i + 1).padStart(6, '0')}`,
      buyerId: `buyer-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      buyerName: `Buyer ${Math.floor(Math.random() * 100) + 1}`,
      buyerCompany: [
        'Global Trading LLC',
        'Import Export Co.',
        'Wholesale Partners',
        'Retail Solutions Inc.',
        'Distribution Hub',
      ][i % 5],
      buyerCountry: [
        'USA',
        'UK',
        'Germany',
        'France',
        'Australia',
        'Canada',
        'Japan',
        'South Korea',
      ][i % 8],
      items,
      subtotal,
      shippingCost,
      totalAmount,
      currency: 'USD',
      paymentStatus,
      shippingStatus,
      orderStatus,
      trackingNumber:
        orderStatus === 'shipped' || orderStatus === 'completed'
          ? `TRK${String(i + 1).padStart(10, '0')}`
          : undefined,
      shippingMethod: [
        'DHL Express',
        'FedEx International',
        'UPS Worldwide',
        'China Post',
        'Sea Freight',
      ][i % 5],
      estimatedDelivery:
        orderStatus === 'shipped'
          ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000)
          : undefined,
      notes: i % 3 === 0 ? 'Customer requested custom packaging' : undefined,
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
  }
);

// ============================================================================
// MESSAGES (RFQ, Inquiries)
// ============================================================================

export type AlibabaMessageType = 'rfq' | 'inquiry' | 'general' | 'negotiation';

export interface AlibabaMessage {
  id: string;
  messageType: AlibabaMessageType;
  senderId: string;
  senderName: string;
  senderCompany: string;
  senderCountry: string;
  subject: string;
  content: string;
  productId?: string;
  productTitle?: string;
  quantity?: number;
  targetPrice?: number;
  isRead: boolean;
  repliedAt?: Date;
  createdAt: Date;
}

export const mockAlibabaMessages: AlibabaMessage[] = Array.from(
  { length: 45 },
  (_, i) => {
    const messageTypes: AlibabaMessageType[] = [
      'rfq',
      'inquiry',
      'general',
      'negotiation',
    ];
    const messageType = messageTypes[i % messageTypes.length];
    const product = mockAlibabaProducts[Math.floor(Math.random() * 20)];

    const subjects: Record<AlibabaMessageType, string> = {
      rfq: `RFQ: ${product.title} - ${Math.floor(Math.random() * 1000 + 100)} units`,
      inquiry: `Inquiry about ${product.title}`,
      general: [
        'Shipping to USA',
        'Payment terms',
        'Customization options',
        'Sample request',
        'Bulk discount',
      ][i % 5],
      negotiation: `Price negotiation for ${product.title}`,
    };

    const contents: Record<AlibabaMessageType, string> = {
      rfq: `We are interested in purchasing ${Math.floor(Math.random() * 1000 + 100)} units of ${product.title}. Please provide your best FOB price, lead time, and payment terms. We need this for our upcoming project in Q${Math.floor(Math.random() * 4) + 1}.`,
      inquiry: `Hello, I would like to know more about ${product.title}. Can you provide detailed specifications, available colors, and minimum order quantity? Also, do you offer customization?`,
      general: `I am interested in your products. Could you please provide information about shipping costs to ${['USA', 'UK', 'Germany', 'France', 'Australia'][i % 5]}? What are your payment terms?`,
      negotiation: `Your quoted price of $${product.price} is higher than our budget. We are looking for a price around $${(product.price * 0.8).toFixed(2)} for an order of ${Math.floor(Math.random() * 500 + 100)} units. Can you match this?`,
    };

    return {
      id: `alibaba-msg-${String(i + 1).padStart(4, '0')}`,
      messageType,
      senderId: `buyer-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      senderName: `Buyer ${Math.floor(Math.random() * 100) + 1}`,
      senderCompany: [
        'Global Trading LLC',
        'Import Export Co.',
        'Wholesale Partners',
        'Retail Solutions Inc.',
        'Distribution Hub',
      ][i % 5],
      senderCountry: [
        'USA',
        'UK',
        'Germany',
        'France',
        'Australia',
        'Canada',
        'Japan',
        'South Korea',
      ][i % 8],
      subject: subjects[messageType],
      content: contents[messageType],
      productId:
        messageType === 'rfq' ||
        messageType === 'inquiry' ||
        messageType === 'negotiation'
          ? product.id
          : undefined,
      productTitle:
        messageType === 'rfq' ||
        messageType === 'inquiry' ||
        messageType === 'negotiation'
          ? product.title
          : undefined,
      quantity:
        messageType === 'rfq'
          ? Math.floor(Math.random() * 1000 + 100)
          : undefined,
      targetPrice:
        messageType === 'negotiation'
          ? parseFloat((product.price * 0.8).toFixed(2))
          : undefined,
      isRead: i % 3 !== 0,
      repliedAt:
        i % 3 !== 0
          ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)
          : undefined,
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
    };
  }
);

// ============================================================================
// LOGISTICS & SHIPPING
// ============================================================================

export interface AlibabaShippingMethod {
  id: string;
  carrier: string;
  method: string;
  estimatedDays: string;
  cost: number;
  currency: string;
  tracking: boolean;
  insurance: boolean;
}

export const mockShippingMethods: AlibabaShippingMethod[] = [
  {
    id: 'ship-1',
    carrier: 'DHL',
    method: 'DHL Express',
    estimatedDays: '3-5',
    cost: 45.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
  {
    id: 'ship-2',
    carrier: 'FedEx',
    method: 'FedEx International Priority',
    estimatedDays: '4-6',
    cost: 42.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
  {
    id: 'ship-3',
    carrier: 'UPS',
    method: 'UPS Worldwide Express',
    estimatedDays: '3-5',
    cost: 48.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
  {
    id: 'ship-4',
    carrier: 'China Post',
    method: 'China Post EMS',
    estimatedDays: '7-15',
    cost: 18.0,
    currency: 'USD',
    tracking: true,
    insurance: false,
  },
  {
    id: 'ship-5',
    carrier: 'Sea Freight',
    method: 'Ocean Freight (FCL)',
    estimatedDays: '25-35',
    cost: 850.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
  {
    id: 'ship-6',
    carrier: 'Sea Freight',
    method: 'Ocean Freight (LCL)',
    estimatedDays: '30-40',
    cost: 320.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
  {
    id: 'ship-7',
    carrier: 'Air Freight',
    method: 'Air Cargo Standard',
    estimatedDays: '5-8',
    cost: 180.0,
    currency: 'USD',
    tracking: true,
    insurance: true,
  },
];

export interface AlibabaShipmentTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation: string;
  estimatedDelivery: Date;
  events: Array<{
    timestamp: Date;
    location: string;
    status: string;
    description: string;
  }>;
}

export const mockShipmentTracking: AlibabaShipmentTracking[] = mockAlibabaOrders
  .filter(order => order.trackingNumber)
  .slice(0, 15)
  .map((order, i) => ({
    id: `tracking-${i + 1}`,
    orderId: order.id,
    trackingNumber: order.trackingNumber!,
    carrier: order.shippingMethod || 'DHL Express',
    status:
      order.shippingStatus === 'delivered'
        ? 'Delivered'
        : order.shippingStatus === 'in_transit'
          ? 'In Transit'
          : 'Preparing',
    currentLocation: [
      'Hong Kong',
      'Dubai',
      'Los Angeles',
      'New York',
      'London',
    ][i % 5],
    estimatedDelivery:
      order.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    events: [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: 'Shenzhen, China',
        status: 'Picked Up',
        description: 'Package picked up by carrier',
      },
      {
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        location: 'Shenzhen, China',
        status: 'In Transit',
        description: 'Departed from origin facility',
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        location: 'Hong Kong',
        status: 'In Transit',
        description: 'Arrived at sorting facility',
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: 'Hong Kong',
        status: 'In Transit',
        description: 'Departed from Hong Kong',
      },
    ],
  }));

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AlibabaSalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

export const mockSalesData: AlibabaSalesData[] = Array.from(
  { length: 90 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    return {
      date: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 50 + 10),
      orders: Math.floor(Math.random() * 20 + 5),
      revenue: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
    };
  }
);

export interface AlibabaCategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

export const mockCategoryRevenue: AlibabaCategoryRevenue[] = categories.map(
  (category, i) => ({
    category,
    revenue: parseFloat((Math.random() * 50000 + 10000).toFixed(2)),
    orders: Math.floor(Math.random() * 200 + 50),
    growth: parseFloat((Math.random() * 40 - 10).toFixed(1)),
  })
);

export interface AlibabaTopProduct {
  productId: string;
  title: string;
  sku: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

export const mockTopProducts: AlibabaTopProduct[] = mockAlibabaProducts
  .slice(0, 10)
  .map((product, i) => ({
    productId: product.id,
    title: product.title,
    sku: product.sku,
    sales: Math.floor(Math.random() * 500 + 100),
    revenue: parseFloat((Math.random() * 20000 + 5000).toFixed(2)),
    views: product.views,
    conversionRate: parseFloat((Math.random() * 10 + 1).toFixed(2)),
  }));

export interface AlibabaTrafficData {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
}

export const mockTrafficData: AlibabaTrafficData[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 5000 + 1000),
      uniqueVisitors: Math.floor(Math.random() * 2000 + 500),
      bounceRate: parseFloat((Math.random() * 30 + 20).toFixed(1)),
    };
  }
);

// ============================================================================
// SYNC HISTORY & LOGS
// ============================================================================

export type AlibabaSyncType =
  | 'products'
  | 'orders'
  | 'messages'
  | 'inventory'
  | 'analytics';
export type AlibabaSyncStatus =
  | 'success'
  | 'failed'
  | 'partial'
  | 'in_progress';

export interface AlibabaSyncHistory {
  id: string;
  syncType: AlibabaSyncType;
  status: AlibabaSyncStatus;
  itemsSynced: number;
  itemsFailed: number;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds?: number;
  errorMessage?: string;
}

export const mockSyncHistory: AlibabaSyncHistory[] = Array.from(
  { length: 50 },
  (_, i) => {
    const syncTypes: AlibabaSyncType[] = [
      'products',
      'orders',
      'messages',
      'inventory',
      'analytics',
    ];
    const syncType = syncTypes[i % syncTypes.length];
    const status: AlibabaSyncStatus =
      i % 10 === 0 ? 'failed' : i % 8 === 0 ? 'partial' : 'success';
    const itemsSynced =
      status === 'failed' ? 0 : Math.floor(Math.random() * 100 + 10);
    const itemsFailed =
      status === 'failed'
        ? Math.floor(Math.random() * 20 + 5)
        : status === 'partial'
          ? Math.floor(Math.random() * 10 + 1)
          : 0;
    const startedAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    );
    const durationSeconds = Math.floor(Math.random() * 300 + 30);
    const completedAt =
      status !== 'in_progress'
        ? new Date(startedAt.getTime() + durationSeconds * 1000)
        : undefined;

    return {
      id: `sync-${String(i + 1).padStart(4, '0')}`,
      syncType,
      status,
      itemsSynced,
      itemsFailed,
      startedAt,
      completedAt,
      durationSeconds: status !== 'in_progress' ? durationSeconds : undefined,
      errorMessage:
        status === 'failed'
          ? 'API rate limit exceeded'
          : status === 'partial'
            ? 'Some items failed validation'
            : undefined,
    };
  }
);

export type AlibabaLogLevel = 'info' | 'warning' | 'error';

export interface AlibabaLog {
  id: string;
  level: AlibabaLogLevel;
  operation: string;
  message: string;
  details?: string;
  timestamp: Date;
}

export const mockAlibabaLogs: AlibabaLog[] = Array.from(
  { length: 100 },
  (_, i) => {
    const levels: AlibabaLogLevel[] = ['info', 'warning', 'error'];
    const level = levels[i % 10 === 0 ? 2 : i % 5 === 0 ? 1 : 0];
    const operations = [
      'Product Sync',
      'Order Sync',
      'Message Fetch',
      'Inventory Update',
      'Analytics Fetch',
      'Connection Test',
    ];
    const operation = operations[i % operations.length];

    const messages: Record<AlibabaLogLevel, string> = {
      info: `${operation} completed successfully`,
      warning: `${operation} completed with warnings`,
      error: `${operation} failed`,
    };

    return {
      id: `log-${String(i + 1).padStart(5, '0')}`,
      level,
      operation,
      message: messages[level],
      details:
        level === 'error'
          ? 'API returned 429 - Rate limit exceeded'
          : level === 'warning'
            ? 'Some items skipped due to validation errors'
            : undefined,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
  }
);

// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================

export interface AlibabaActivity {
  id: string;
  type: 'sync' | 'order' | 'message' | 'product' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export const mockAlibabaActivities: AlibabaActivity[] = [
  {
    id: 'act-1',
    type: 'sync',
    title: 'Product Sync Completed',
    description: '45 products synchronized successfully',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    icon: 'RefreshCw',
  },
  {
    id: 'act-2',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #ALI-ORD-000123 from Global Trading LLC',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: 'ShoppingCart',
  },
  {
    id: 'act-3',
    type: 'message',
    title: 'New RFQ Received',
    description: 'RFQ for Electronics - Mobile Phones Product 5',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    icon: 'MessageSquare',
  },
  {
    id: 'act-4',
    type: 'product',
    title: 'Product Updated',
    description: 'Price updated for 12 products',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    icon: 'Package',
  },
  {
    id: 'act-5',
    type: 'sync',
    title: 'Order Sync Completed',
    description: '8 orders synchronized successfully',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    icon: 'RefreshCw',
  },
  {
    id: 'act-6',
    type: 'message',
    title: 'Inquiry Replied',
    description: 'Replied to inquiry about shipping costs',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    icon: 'MessageSquare',
  },
  {
    id: 'act-7',
    type: 'order',
    title: 'Order Shipped',
    description: 'Order #ALI-ORD-000118 shipped via DHL Express',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    icon: 'Truck',
  },
  {
    id: 'act-8',
    type: 'system',
    title: 'Connection Test Successful',
    description: 'API connection verified',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    icon: 'CheckCircle',
  },
  {
    id: 'act-9',
    type: 'sync',
    title: 'Inventory Sync Completed',
    description: '120 inventory records updated',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    icon: 'RefreshCw',
  },
  {
    id: 'act-10',
    type: 'product',
    title: 'New Products Added',
    description: '15 new products listed on Alibaba',
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
    icon: 'Plus',
  },
];

// ============================================================================
// STATISTICS & KPIs
// ============================================================================

export interface AlibabaStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  unreadMessages: number;
  totalMessages: number;
  monthlySales: number;
  monthlyRevenue: number;
  storeRating: number;
  syncSuccessRate: number;
  todaySyncs: number;
  pendingActions: number;
  apiQuotaUsed: number;
  apiQuotaLimit: number;
}

export const mockAlibabaStats: AlibabaStats = {
  totalProducts: mockAlibabaProducts.length,
  activeProducts: mockAlibabaProducts.filter(p => p.status === 'active').length,
  totalOrders: mockAlibabaOrders.length,
  pendingOrders: mockAlibabaOrders.filter(
    o => o.orderStatus === 'awaiting_payment' || o.orderStatus === 'processing'
  ).length,
  unreadMessages: mockAlibabaMessages.filter(m => !m.isRead).length,
  totalMessages: mockAlibabaMessages.length,
  monthlySales: mockAlibabaOrders.filter(o => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return o.createdAt > thirtyDaysAgo;
  }).length,
  monthlyRevenue: parseFloat(
    mockAlibabaOrders
      .filter(o => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return o.createdAt > thirtyDaysAgo && o.orderStatus === 'completed';
      })
      .reduce((sum, o) => sum + o.totalAmount, 0)
      .toFixed(2)
  ),
  storeRating: 4.7,
  syncSuccessRate: 96.5,
  todaySyncs: 8,
  pendingActions: 12,
  apiQuotaUsed: 8450,
  apiQuotaLimit: 10000,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getProductStatusColor(status: AlibabaProductStatus): string {
  switch (status) {
    case 'active':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'inactive':
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    case 'draft':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'pending_approval':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getProductStatusLabel(status: AlibabaProductStatus): string {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Pasif';
    case 'draft':
      return 'Taslak';
    case 'pending_approval':
      return 'Onay Bekliyor';
    default:
      return 'Bilinmiyor';
  }
}

export function getOrderStatusColor(status: AlibabaOrderStatus): string {
  switch (status) {
    case 'awaiting_payment':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'processing':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'shipped':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'completed':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'cancelled':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'refunded':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getOrderStatusLabel(status: AlibabaOrderStatus): string {
  switch (status) {
    case 'awaiting_payment':
      return 'Ödeme Bekliyor';
    case 'processing':
      return 'İşleniyor';
    case 'shipped':
      return 'Kargoda';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal Edildi';
    case 'refunded':
      return 'İade Edildi';
    default:
      return 'Bilinmiyor';
  }
}

export function getPaymentStatusColor(status: AlibabaPaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'paid':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'escrow':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'released':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'refunded':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getPaymentStatusLabel(status: AlibabaPaymentStatus): string {
  switch (status) {
    case 'pending':
      return 'Beklemede';
    case 'paid':
      return 'Ödendi';
    case 'escrow':
      return 'Emanet';
    case 'released':
      return 'Serbest Bırakıldı';
    case 'refunded':
      return 'İade Edildi';
    default:
      return 'Bilinmiyor';
  }
}

export function getShippingStatusColor(status: AlibabaShippingStatus): string {
  switch (status) {
    case 'pending':
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    case 'preparing':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'shipped':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'in_transit':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'delivered':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'returned':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getShippingStatusLabel(status: AlibabaShippingStatus): string {
  switch (status) {
    case 'pending':
      return 'Beklemede';
    case 'preparing':
      return 'Hazırlanıyor';
    case 'shipped':
      return 'Gönderildi';
    case 'in_transit':
      return 'Yolda';
    case 'delivered':
      return 'Teslim Edildi';
    case 'returned':
      return 'İade Edildi';
    default:
      return 'Bilinmiyor';
  }
}

export function getMessageTypeColor(type: AlibabaMessageType): string {
  switch (type) {
    case 'rfq':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'inquiry':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'general':
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    case 'negotiation':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getMessageTypeLabel(type: AlibabaMessageType): string {
  switch (type) {
    case 'rfq':
      return 'RFQ';
    case 'inquiry':
      return 'Soru';
    case 'general':
      return 'Genel';
    case 'negotiation':
      return 'Pazarlık';
    default:
      return 'Bilinmiyor';
  }
}

export function getSyncStatusColor(status: AlibabaSyncStatus): string {
  switch (status) {
    case 'success':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'failed':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'partial':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'in_progress':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getSyncStatusLabel(status: AlibabaSyncStatus): string {
  switch (status) {
    case 'success':
      return 'Başarılı';
    case 'failed':
      return 'Başarısız';
    case 'partial':
      return 'Kısmi';
    case 'in_progress':
      return 'Devam Ediyor';
    default:
      return 'Bilinmiyor';
  }
}

export function getLogLevelColor(level: AlibabaLogLevel): string {
  switch (level) {
    case 'info':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'warning':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'error':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
}

export function getShippingMethodLabel(method: string): string {
  return method;
}
