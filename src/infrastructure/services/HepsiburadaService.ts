/**
 * Hepsiburada Marketplace Service
 * Integration with Hepsiburada Marketplace API
 * Docs: https://developer.hepsiburada.com/
 */

export interface HepsiburadaProduct {
  merchantSku: string;
  hbSku?: string;
  productName: string;
  price: number;
  listPrice?: number;
  stock: number;
  categoryId: string;
  brand: string;
  imageUrls: string[];
  status: 'Active' | 'Passive' | 'Waiting';
}

export interface HepsiburadaOrder {
  orderNumber: string;
  orderDate: string;
  status: 'Approved' | 'Shipped' | 'Delivered' | 'Cancelled';
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    district: string;
    postalCode: string;
  };
  totalAmount: number;
  items: Array<{
    merchantSku: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  cargoTrackingNumber?: string;
  cargoCompany?: string;
}

export class HepsiburadaService {
  private static readonly MERCHANT_ID = import.meta.env.VITE_HEPSIBURADA_MERCHANT_ID;
  private static readonly USERNAME = import.meta.env.VITE_HEPSIBURADA_USERNAME;
  private static readonly PASSWORD = import.meta.env.VITE_HEPSIBURADA_PASSWORD;
  private static readonly API_URL = 'https://listing-external.hepsiburada.com/';

  /**
   * Check if Hepsiburada is configured
   */
  static isConfigured(): boolean {
    return !!(
      this.MERCHANT_ID &&
      this.USERNAME &&
      this.PASSWORD &&
      this.MERCHANT_ID !== 'your-merchant-id'
    );
  }

  /**
   * Get mock products for development
   */
  static getMockProducts(): HepsiburadaProduct[] {
    return [
      {
        merchantSku: 'HB-PROD-001',
        hbSku: 'HBV00000ABC123',
        productName: 'Samsung Galaxy A54 128GB',
        price: 8999.99,
        listPrice: 9999.99,
        stock: 15,
        categoryId: '371965',
        brand: 'Samsung',
        imageUrls: [
          'https://via.placeholder.com/800',
          'https://via.placeholder.com/800',
        ],
        status: 'Active',
      },
      {
        merchantSku: 'HB-PROD-002',
        hbSku: 'HBV00000XYZ789',
        productName: 'Apple AirPods Pro 2. Nesil',
        price: 3499.99,
        listPrice: 3799.99,
        stock: 28,
        categoryId: '371976',
        brand: 'Apple',
        imageUrls: ['https://via.placeholder.com/800'],
        status: 'Active',
      },
      {
        merchantSku: 'HB-PROD-003',
        productName: 'JBL Charge 5 Bluetooth Hoparlör',
        price: 1999.99,
        stock: 0,
        categoryId: '371977',
        brand: 'JBL',
        imageUrls: ['https://via.placeholder.com/800'],
        status: 'Passive',
      },
    ];
  }

  /**
   * Get mock orders for development
   */
  static getMockOrders(): HepsiburadaOrder[] {
    return [
      {
        orderNumber: 'HB123456789',
        orderDate: new Date(Date.now() - 7200000).toISOString(),
        status: 'Approved',
        customer: {
          name: 'Mehmet Yılmaz',
          phone: '+905551234567',
          email: 'mehmet@example.com',
        },
        shippingAddress: {
          address: 'Atatürk Bulvarı No: 456 Daire: 7',
          city: 'İzmir',
          district: 'Konak',
          postalCode: '35000',
        },
        totalAmount: 8999.99,
        items: [
          {
            merchantSku: 'HB-PROD-001',
            productName: 'Samsung Galaxy A54 128GB',
            quantity: 1,
            price: 8999.99,
            totalPrice: 8999.99,
          },
        ],
      },
      {
        orderNumber: 'HB987654321',
        orderDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'Shipped',
        customer: {
          name: 'Fatma Demir',
          phone: '+905559876543',
          email: 'fatma@example.com',
        },
        shippingAddress: {
          address: 'Cumhuriyet Cad. 123/5',
          city: 'Ankara',
          district: 'Çankaya',
          postalCode: '06000',
        },
        totalAmount: 3499.99,
        items: [
          {
            merchantSku: 'HB-PROD-002',
            productName: 'Apple AirPods Pro 2. Nesil',
            quantity: 1,
            price: 3499.99,
            totalPrice: 3499.99,
          },
        ],
        cargoTrackingNumber: '1234567890123456',
        cargoCompany: 'MNG Kargo',
      },
    ];
  }

  /**
   * Sync product to Hepsiburada
   */
  static async syncProduct(product: {
    merchantSku: string;
    productName: string;
    description: string;
    price: number;
    listPrice?: number;
    stock: number;
    categoryId: string;
    brand: string;
    imageUrls: string[];
  }): Promise<{ success: boolean; hbSku?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Hepsiburada Mock: Syncing product', product.merchantSku);
      return {
        success: true,
        hbSku: `HBV00000${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      };
    }

    // In production, call Hepsiburada API
    console.log('Syncing product to Hepsiburada:', product);
    return { success: true, hbSku: 'HBV00000ABC123' };
  }

  /**
   * Update product stock
   */
  static async updateStock(
    merchantSku: string,
    stock: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Hepsiburada Mock: Updating stock for', merchantSku, 'to', stock);
      return { success: true };
    }

    // In production, call Hepsiburada stock update API
    return { success: true };
  }

  /**
   * Update product price
   */
  static async updatePrice(
    merchantSku: string,
    price: number,
    listPrice?: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Hepsiburada Mock: Updating price for', merchantSku);
      return { success: true };
    }

    // In production, call Hepsiburada price update API
    return { success: true };
  }

  /**
   * Update order status (mark as shipped)
   */
  static async updateOrderStatus(
    orderNumber: string,
    status: 'Shipped',
    cargoTrackingNumber: string,
    cargoCompany: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Hepsiburada Mock: Updating order', orderNumber, 'to', status);
      return { success: true };
    }

    // In production, call Hepsiburada order update API
    return { success: true };
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(
    startDate: string,
    endDate: string
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    commission: number;
    topProducts: Array<{ merchantSku: string; productName: string; sales: number }>;
  }> {
    // Mock data
    return {
      totalOrders: 87,
      totalRevenue: 234567.89,
      averageOrderValue: 2695.85,
      commission: 35185.18, // 15% average commission
      topProducts: [
        { merchantSku: 'HB-PROD-001', productName: 'Samsung Galaxy A54', sales: 32 },
        { merchantSku: 'HB-PROD-002', productName: 'Apple AirPods Pro', sales: 28 },
        { merchantSku: 'HB-PROD-003', productName: 'JBL Charge 5', sales: 19 },
      ],
    };
  }

  /**
   * Get category tree
   */
  static async getCategoryTree(): Promise<
    Array<{
      id: string;
      name: string;
      parentId?: string;
      leaf: boolean;
    }>
  > {
    // Mock category data
    return [
      { id: '371965', name: 'Cep Telefonu', parentId: '371964', leaf: true },
      { id: '371976', name: 'Kulaklık', parentId: '371975', leaf: true },
      { id: '371977', name: 'Hoparlör', parentId: '371975', leaf: true },
    ];
  }
}

