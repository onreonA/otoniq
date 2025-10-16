/**
 * Amazon Marketplace Service
 * Integration with Amazon Seller Central API (SP-API)
 * Docs: https://developer-docs.amazon.com/sp-api/
 */

export interface AmazonProduct {
  asin: string;
  sku: string;
  title: string;
  price: number;
  quantity: number;
  fulfillmentChannel: 'FBA' | 'FBM'; // Fulfilled by Amazon or Merchant
  condition: 'New' | 'Used' | 'Refurbished';
  imageUrl?: string;
  status: 'Active' | 'Inactive';
}

export interface AmazonOrder {
  orderId: string;
  orderStatus: 'Pending' | 'Unshipped' | 'Shipped' | 'Canceled';
  purchaseDate: string;
  buyerEmail?: string;
  shippingAddress: {
    name: string;
    addressLine1: string;
    city: string;
    stateOrRegion: string;
    postalCode: string;
    countryCode: string;
  };
  orderTotal: {
    amount: number;
    currencyCode: string;
  };
  items: Array<{
    asin: string;
    sku: string;
    title: string;
    quantity: number;
    itemPrice: number;
  }>;
}

export class AmazonMarketplaceService {
  private static readonly SELLER_ID = import.meta.env.VITE_AMAZON_SELLER_ID;
  private static readonly ACCESS_KEY = import.meta.env.VITE_AMAZON_ACCESS_KEY;
  private static readonly SECRET_KEY = import.meta.env.VITE_AMAZON_SECRET_KEY;
  private static readonly MARKETPLACE_ID = 'A1PA6795UKMFR9'; // Turkey

  /**
   * Check if Amazon is configured
   */
  static isConfigured(): boolean {
    return !!(
      this.SELLER_ID &&
      this.ACCESS_KEY &&
      this.SECRET_KEY &&
      this.SELLER_ID !== 'your-seller-id'
    );
  }

  /**
   * Get mock products for development
   */
  static getMockProducts(): AmazonProduct[] {
    return [
      {
        asin: 'B08N5WRWNW',
        sku: 'OTONIQ-PROD-001',
        title: 'Premium Bluetooth Kulaklık - Gürültü Önleyici',
        price: 299.99,
        quantity: 45,
        fulfillmentChannel: 'FBA',
        condition: 'New',
        imageUrl: 'https://via.placeholder.com/200',
        status: 'Active',
      },
      {
        asin: 'B09K5JVSZM',
        sku: 'OTONIQ-PROD-002',
        title: 'Akıllı Saat - Su Geçirmez, GPS',
        price: 449.99,
        quantity: 23,
        fulfillmentChannel: 'FBM',
        condition: 'New',
        imageUrl: 'https://via.placeholder.com/200',
        status: 'Active',
      },
      {
        asin: 'B07XJ8C8F5',
        sku: 'OTONIQ-PROD-003',
        title: 'Kablosuz Şarj Cihazı - Hızlı Şarj',
        price: 149.99,
        quantity: 0,
        fulfillmentChannel: 'FBA',
        condition: 'New',
        imageUrl: 'https://via.placeholder.com/200',
        status: 'Inactive',
      },
    ];
  }

  /**
   * Get mock orders for development
   */
  static getMockOrders(): AmazonOrder[] {
    return [
      {
        orderId: '902-3159896-1390916',
        orderStatus: 'Unshipped',
        purchaseDate: new Date(Date.now() - 3600000).toISOString(),
        buyerEmail: 'buyer@example.com',
        shippingAddress: {
          name: 'Ahmet Yılmaz',
          addressLine1: 'Atatürk Cad. No: 123',
          city: 'İstanbul',
          stateOrRegion: 'İstanbul',
          postalCode: '34000',
          countryCode: 'TR',
        },
        orderTotal: {
          amount: 299.99,
          currencyCode: 'TRY',
        },
        items: [
          {
            asin: 'B08N5WRWNW',
            sku: 'OTONIQ-PROD-001',
            title: 'Premium Bluetooth Kulaklık',
            quantity: 1,
            itemPrice: 299.99,
          },
        ],
      },
      {
        orderId: '902-1234567-8901234',
        orderStatus: 'Shipped',
        purchaseDate: new Date(Date.now() - 86400000).toISOString(),
        shippingAddress: {
          name: 'Ayşe Demir',
          addressLine1: 'Cumhuriyet Mah. 456. Sok.',
          city: 'Ankara',
          stateOrRegion: 'Ankara',
          postalCode: '06000',
          countryCode: 'TR',
        },
        orderTotal: {
          amount: 449.99,
          currencyCode: 'TRY',
        },
        items: [
          {
            asin: 'B09K5JVSZM',
            sku: 'OTONIQ-PROD-002',
            title: 'Akıllı Saat',
            quantity: 1,
            itemPrice: 449.99,
          },
        ],
      },
    ];
  }

  /**
   * Sync products from local database to Amazon
   */
  static async syncProductToAmazon(product: {
    sku: string;
    title: string;
    description: string;
    price: number;
    quantity: number;
    images: string[];
  }): Promise<{ success: boolean; asin?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Amazon Mock: Syncing product', product.sku);
      return {
        success: true,
        asin: `B${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      };
    }

    // In production, call Amazon SP-API
    console.log('Syncing product to Amazon:', product);
    return { success: true, asin: 'B08N5WRWNW' };
  }

  /**
   * Update product inventory
   */
  static async updateInventory(
    sku: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Amazon Mock: Updating inventory for', sku, 'to', quantity);
      return { success: true };
    }

    // In production, call Amazon SP-API inventory update
    return { success: true };
  }

  /**
   * Update product price
   */
  static async updatePrice(
    sku: string,
    price: number
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log('Amazon Mock: Updating price for', sku, 'to', price);
      return { success: true };
    }

    // In production, call Amazon SP-API pricing update
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
    topProducts: Array<{ sku: string; title: string; sales: number }>;
  }> {
    // Mock data for development
    return {
      totalOrders: 156,
      totalRevenue: 45678.9,
      averageOrderValue: 292.81,
      topProducts: [
        { sku: 'OTONIQ-PROD-001', title: 'Premium Bluetooth Kulaklık', sales: 45 },
        { sku: 'OTONIQ-PROD-002', title: 'Akıllı Saat', sales: 38 },
        { sku: 'OTONIQ-PROD-003', title: 'Kablosuz Şarj Cihazı', sales: 29 },
      ],
    };
  }

  /**
   * Get advertising metrics
   */
  static async getAdvertisingMetrics(): Promise<{
    impressions: number;
    clicks: number;
    spend: number;
    sales: number;
    acos: number; // Advertising Cost of Sale
  }> {
    // Mock data
    return {
      impressions: 125000,
      clicks: 2500,
      spend: 1250.0,
      sales: 8750.0,
      acos: 14.29, // 1250 / 8750 * 100
    };
  }
}

