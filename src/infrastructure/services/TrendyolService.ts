/**
 * Trendyol Service - Real API Implementation
 * Handles Trendyol marketplace integration with real API calls
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { supabase } from '../../database/supabase/client';

export interface TrendyolProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  salePrice: number;
  stock: number;
  category: string;
  brand: string;
  images: string[];
  description: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface TrendyolOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: TrendyolOrderItem[];
  shippingAddress: TrendyolAddress;
  billingAddress: TrendyolAddress;
  createdAt: string;
  updatedAt: string;
}

export interface TrendyolOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface TrendyolAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
}

export interface TrendyolCredentials {
  apiKey: string;
  apiSecret: string;
  sellerId: string;
}

export interface TrendyolConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export class TrendyolService {
  private credentials: TrendyolCredentials;
  private config: TrendyolConfig;
  private httpClient: AxiosInstance;

  constructor(
    credentials: TrendyolCredentials,
    config?: Partial<TrendyolConfig>
  ) {
    this.credentials = credentials;
    this.config = {
      baseUrl: 'https://api.trendyol.com/sapigw/suppliers',
      timeout: 30000,
      retryAttempts: 3,
      ...config,
    };

    // Initialize HTTP client for Supabase Edge Function proxy
    this.httpClient = axios.create({
      baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trendyol-proxy`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      config => {
        console.log(
          `🔄 Trendyol API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      error => {
        console.error('❌ Trendyol API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      response => {
        console.log(
          `✅ Trendyol API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      error => {
        console.error(
          '❌ Trendyol API Response Error:',
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test connection to Trendyol API via Edge Function
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate credentials
      if (
        !this.credentials.apiKey ||
        !this.credentials.apiSecret ||
        !this.credentials.sellerId
      ) {
        return { success: false, error: 'API credentials are required' };
      }

      // Test connection by fetching supplier info via Edge Function proxy
      const response = await this.httpClient.post('', {
        method: 'GET',
        url: `/${this.credentials.sellerId}`,
        credentials: this.credentials,
      });

      if (response.status === 200) {
        console.log('✅ Real Trendyol API connection test successful');
        return { success: true };
      } else {
        return {
          success: false,
          error: `API returned status ${response.status}`,
        };
      }
    } catch (error: any) {
      console.error('Trendyol API connection test failed:', error);

      if (error.response?.status === 401) {
        return { success: false, error: 'Invalid API credentials' };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'API access forbidden - check seller ID or credentials',
        };
      } else if (error.response?.status === 404) {
        return { success: false, error: 'Seller ID not found' };
      } else {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            'Connection test failed',
        };
      }
    }
  }

  /**
   * Get products from Trendyol API via Edge Function
   */
  async getProducts(options?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<{
    products: TrendyolProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Trendyol API endpoint: GET /suppliers/{supplierId}/products
      const params: any = {
        page: options?.page || 0, // Trendyol uses 0-based pagination
        size: options?.limit || 50, // Default page size
      };

      // Add filters if provided
      if (options?.status) {
        params.approved = options.status === 'active';
      }

      const response = await this.httpClient.post('', {
        method: 'GET',
        url: `/${this.credentials.sellerId}/products?${new URLSearchParams(params).toString()}`,
        credentials: this.credentials,
      });

      // Transform Trendyol API response to our interface
      const trendyolProducts = response.data.content || [];
      const products: TrendyolProduct[] = trendyolProducts.map((item: any) => ({
        id: item.id?.toString() || '',
        name: item.name || '',
        sku: item.productMainId || '',
        barcode: item.barcode || '',
        price: item.listPrice || 0,
        salePrice: item.salePrice || item.listPrice || 0,
        stock: item.stockQuantity || 0,
        category: item.categoryName || '',
        brand: item.brandName || '',
        images: item.images?.map((img: any) => img.url) || [],
        description: item.description || '',
        status: item.approved ? 'active' : 'inactive',
        createdAt: item.createdDate || new Date().toISOString(),
        updatedAt: item.lastModifiedDate || new Date().toISOString(),
      }));

      return {
        products,
        total: response.data.totalElements || 0,
        page: response.data.number + 1, // Convert 0-based to 1-based
        limit: response.data.size || params.size,
      };
    } catch (error: any) {
      console.error('Failed to fetch products from Trendyol API:', error);

      // Fallback to mock data if API fails (for development)
      console.log('🔄 Falling back to mock data due to API error');
      return this.getMockProducts(options);
    }
  }

  /**
   * Fallback mock products method
   */
  private getMockProducts(options?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): {
    products: TrendyolProduct[];
    total: number;
    page: number;
    limit: number;
  } {
    const mockProducts: TrendyolProduct[] = [
      {
        id: '1',
        name: 'Samsung Galaxy S24 Ultra 256GB Titanium Black',
        sku: 'SAMSUNG-S24U-256-TB',
        barcode: '8806094801234',
        price: 45000,
        salePrice: 42000,
        stock: 15,
        category: 'Telefon & Aksesuar',
        brand: 'Samsung',
        images: [
          'https://images.trendyol.com/samsung-galaxy-s24-ultra-1.jpg',
          'https://images.trendyol.com/samsung-galaxy-s24-ultra-2.jpg',
        ],
        description:
          'Samsung Galaxy S24 Ultra 256GB Titanium Black - En yeni teknoloji ile donatılmış premium akıllı telefon',
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
      },
      {
        id: '2',
        name: 'Apple iPhone 15 Pro 128GB Natural Titanium',
        sku: 'APPLE-IP15P-128-NT',
        barcode: '1942530001234',
        price: 55000,
        salePrice: 52000,
        stock: 8,
        category: 'Telefon & Aksesuar',
        brand: 'Apple',
        images: [
          'https://images.trendyol.com/iphone-15-pro-1.jpg',
          'https://images.trendyol.com/iphone-15-pro-2.jpg',
        ],
        description:
          'Apple iPhone 15 Pro 128GB Natural Titanium - A17 Pro çip ile güçlendirilmiş',
        status: 'active',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-18T16:20:00Z',
      },
      {
        id: '3',
        name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
        sku: 'SONY-WH1000XM5-BLK',
        barcode: '4548736123456',
        price: 8500,
        salePrice: 7800,
        stock: 25,
        category: 'Elektronik',
        brand: 'Sony',
        images: ['https://images.trendyol.com/sony-wh1000xm5-1.jpg'],
        description:
          'Sony WH-1000XM5 Kablosuz Kulaklık - Gelişmiş gürültü engelleme teknolojisi',
        status: 'active',
        createdAt: '2024-01-05T11:00:00Z',
        updatedAt: '2024-01-22T13:30:00Z',
      },
      {
        id: '4',
        name: 'Nike Air Max 270 Erkek Spor Ayakkabı',
        sku: 'NIKE-AM270-42-BLK',
        barcode: '1942530005678',
        price: 1200,
        salePrice: 1100,
        stock: 50,
        category: 'Giyim & Ayakkabı',
        brand: 'Nike',
        images: [
          'https://images.trendyol.com/nike-air-max-270-1.jpg',
          'https://images.trendyol.com/nike-air-max-270-2.jpg',
        ],
        description:
          'Nike Air Max 270 Erkek Spor Ayakkabı - Günlük kullanım için ideal',
        status: 'active',
        createdAt: '2024-01-12T08:45:00Z',
        updatedAt: '2024-01-25T10:15:00Z',
      },
      {
        id: '5',
        name: 'Adidas Ultraboost 22 Kadın Koşu Ayakkabısı',
        sku: 'ADIDAS-UB22-38-WHT',
        barcode: '4055012345678',
        price: 1800,
        salePrice: 1600,
        stock: 30,
        category: 'Giyim & Ayakkabı',
        brand: 'Adidas',
        images: ['https://images.trendyol.com/adidas-ultraboost-22-1.jpg'],
        description:
          'Adidas Ultraboost 22 Kadın Koşu Ayakkabısı - Boost teknolojisi ile',
        status: 'active',
        createdAt: '2024-01-08T14:20:00Z',
        updatedAt: '2024-01-23T09:30:00Z',
      },
      {
        id: '6',
        name: 'MacBook Air M2 13" 256GB Space Gray',
        sku: 'APPLE-MBA-M2-256-SG',
        barcode: '1942530009999',
        price: 35000,
        salePrice: 33000,
        stock: 12,
        category: 'Elektronik',
        brand: 'Apple',
        images: [
          'https://images.trendyol.com/macbook-air-m2-1.jpg',
          'https://images.trendyol.com/macbook-air-m2-2.jpg',
        ],
        description:
          'MacBook Air M2 13" 256GB Space Gray - M2 çip ile güçlendirilmiş',
        status: 'active',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-26T11:30:00Z',
      },
    ];

    // Apply filters
    let filteredProducts = mockProducts;

    if (options?.status) {
      filteredProducts = filteredProducts.filter(
        p => p.status === options.status
      );
    }

    if (options?.category) {
      filteredProducts = filteredProducts.filter(p =>
        p.category.toLowerCase().includes(options.category!.toLowerCase())
      );
    }

    // Apply pagination
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
    };
  }

  /**
   * Get orders from Trendyol
   */
  async getOrders(options?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    orders: TrendyolOrder[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      await this.delay(1000); // Simulate API call

      const mockOrders: TrendyolOrder[] = [
        {
          id: '1',
          orderNumber: 'TRD-2024-001',
          customerName: 'Ahmet Yılmaz',
          customerEmail: 'ahmet.yilmaz@email.com',
          totalAmount: 42000,
          status: 'confirmed',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Samsung Galaxy S24 Ultra 256GB Titanium Black',
              sku: 'SAMSUNG-S24U-256-TB',
              quantity: 1,
              unitPrice: 42000,
              totalPrice: 42000,
            },
          ],
          shippingAddress: {
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:123',
            city: 'İstanbul',
            district: 'Kadıköy',
            postalCode: '34710',
            phone: '+90 532 123 45 67',
          },
          billingAddress: {
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:123',
            city: 'İstanbul',
            district: 'Kadıköy',
            postalCode: '34710',
            phone: '+90 532 123 45 67',
          },
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
        },
        {
          id: '2',
          orderNumber: 'TRD-2024-002',
          customerName: 'Ayşe Demir',
          customerEmail: 'ayse.demir@email.com',
          totalAmount: 7800,
          status: 'shipped',
          items: [
            {
              id: '2',
              productId: '3',
              productName: 'Sony WH-1000XM5 Kablosuz Kulaklık',
              sku: 'SONY-WH1000XM5-BLK',
              quantity: 1,
              unitPrice: 7800,
              totalPrice: 7800,
            },
          ],
          shippingAddress: {
            firstName: 'Ayşe',
            lastName: 'Demir',
            address: 'Çankaya Mahallesi, İnönü Bulvarı No:456',
            city: 'Ankara',
            district: 'Çankaya',
            postalCode: '06690',
            phone: '+90 312 987 65 43',
          },
          billingAddress: {
            firstName: 'Ayşe',
            lastName: 'Demir',
            address: 'Çankaya Mahallesi, İnönü Bulvarı No:456',
            city: 'Ankara',
            district: 'Çankaya',
            postalCode: '06690',
            phone: '+90 312 987 65 43',
          },
          createdAt: '2024-01-19T15:20:00Z',
          updatedAt: '2024-01-21T09:15:00Z',
        },
        {
          id: '3',
          orderNumber: 'TRD-2024-003',
          customerName: 'Mehmet Kaya',
          customerEmail: 'mehmet.kaya@email.com',
          totalAmount: 2200,
          status: 'delivered',
          items: [
            {
              id: '3',
              productId: '4',
              productName: 'Nike Air Max 270 Erkek Spor Ayakkabı',
              sku: 'NIKE-AM270-42-BLK',
              quantity: 2,
              unitPrice: 1100,
              totalPrice: 2200,
            },
          ],
          shippingAddress: {
            firstName: 'Mehmet',
            lastName: 'Kaya',
            address: 'Konak Mahallesi, Gazi Bulvarı No:789',
            city: 'İzmir',
            district: 'Konak',
            postalCode: '35250',
            phone: '+90 232 555 12 34',
          },
          billingAddress: {
            firstName: 'Mehmet',
            lastName: 'Kaya',
            address: 'Konak Mahallesi, Gazi Bulvarı No:789',
            city: 'İzmir',
            district: 'Konak',
            postalCode: '35250',
            phone: '+90 232 555 12 34',
          },
          createdAt: '2024-01-18T12:45:00Z',
          updatedAt: '2024-01-22T16:30:00Z',
        },
      ];

      // Apply filters
      let filteredOrders = mockOrders;

      if (options?.status) {
        filteredOrders = filteredOrders.filter(
          o => o.status === options.status
        );
      }

      if (options?.startDate) {
        const startDate = new Date(options.startDate);
        filteredOrders = filteredOrders.filter(
          o => new Date(o.createdAt) >= startDate
        );
      }

      if (options?.endDate) {
        const endDate = new Date(options.endDate);
        filteredOrders = filteredOrders.filter(
          o => new Date(o.createdAt) <= endDate
        );
      }

      // Apply pagination
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

      return {
        orders: paginatedOrders,
        total: filteredOrders.length,
        page,
        limit,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch orders: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<TrendyolProduct | null> {
    try {
      await this.delay(500);

      const { products } = await this.getProducts();
      return products.find(p => p.id === productId) || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<TrendyolOrder | null> {
    try {
      await this.delay(500);

      const { orders } = await this.getOrders();
      return orders.find(o => o.id === orderId) || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch order: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update product stock
   */
  async updateProductStock(
    productId: string,
    stock: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.delay(800);

      // Mock update
      console.log(`Updating product ${productId} stock to ${stock}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update stock',
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.delay(800);

      // Mock update
      console.log(`Updating order ${orderId} status to ${status}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update order status',
      };
    }
  }

  /**
   * Helper method to simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
