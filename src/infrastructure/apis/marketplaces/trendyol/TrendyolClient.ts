import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { MarketplaceCredentials } from '../../../../domain/entities/Marketplace';

export interface TrendyolAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface TrendyolProduct {
  id: string;
  barcode: string;
  title: string;
  productMainId: string;
  brandId: number;
  categoryId: number;
  quantity: number;
  stockCode: string;
  dimensionalWeight: number;
  description: string;
  currencyType: string;
  listPrice: number;
  salePrice: number;
  vatRate: number;
  cargoCompanyId: number;
  images: Array<{
    url: string;
    order: number;
  }>;
  attributes: Array<{
    attributeId: number;
    attributeValueId: number;
    customAttributeValue: string;
  }>;
  approved: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrendyolOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
}

export interface TrendyolCategory {
  id: number;
  name: string;
  parentId?: number;
  path: string;
  attributes: Array<{
    id: number;
    name: string;
    required: boolean;
    values: Array<{
      id: number;
      name: string;
    }>;
  }>;
}

export interface TrendyolApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export class TrendyolClient {
  private api: AxiosInstance;
  private credentials: MarketplaceCredentials;
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: Date;

  constructor(credentials: MarketplaceCredentials) {
    this.credentials = credentials;
    this.api = axios.create({
      baseURL: 'https://api.trendyol.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OTONIQ-AI/1.0',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(async config => {
      if (this.needsAuthentication(config.url || '')) {
        await this.ensureAuthenticated();
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && this.refreshToken) {
          // Try to refresh token
          try {
            await this.refreshAccessToken();
            // Retry the original request
            const originalRequest = error.config;
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, need to re-authenticate
            this.accessToken = undefined;
            this.refreshToken = undefined;
            this.tokenExpiresAt = undefined;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Authenticate with Trendyol API
   */
  async authenticate(): Promise<TrendyolAuthResponse> {
    try {
      const response = await this.api.post('/auth/token', {
        client_id: this.credentials.apiKey,
        client_secret: this.credentials.apiSecret,
        grant_type: 'client_credentials',
      });

      const authData: TrendyolAuthResponse = response.data;
      this.accessToken = authData.access_token;
      this.refreshToken = authData.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + authData.expires_in * 1000);

      return authData;
    } catch (error) {
      throw new Error(`Trendyol authentication failed: ${error}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<TrendyolAuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.api.post('/auth/token', {
        client_id: this.credentials.apiKey,
        client_secret: this.credentials.apiSecret,
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      });

      const authData: TrendyolAuthResponse = response.data;
      this.accessToken = authData.access_token;
      this.refreshToken = authData.refresh_token;
      this.tokenExpiresAt = new Date(Date.now() + authData.expires_in * 1000);

      return authData;
    } catch (error) {
      throw new Error(`Trendyol token refresh failed: ${error}`);
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpiresAt ||
      this.tokenExpiresAt <= new Date()
    ) {
      if (
        this.refreshToken &&
        this.tokenExpiresAt &&
        this.tokenExpiresAt > new Date()
      ) {
        try {
          await this.refreshAccessToken();
        } catch (error) {
          await this.authenticate();
        }
      } else {
        await this.authenticate();
      }
    }
  }

  /**
   * Check if endpoint needs authentication
   */
  private needsAuthentication(url: string): boolean {
    const publicEndpoints = ['/auth/token'];
    return !publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get products from Trendyol
   */
  async getProducts(filters?: {
    page?: number;
    size?: number;
    approved?: boolean;
    active?: boolean;
    barcode?: string;
    stockCode?: string;
  }): Promise<TrendyolProduct[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());
      if (filters?.approved !== undefined)
        params.append('approved', filters.approved.toString());
      if (filters?.active !== undefined)
        params.append('active', filters.active.toString());
      if (filters?.barcode) params.append('barcode', filters.barcode);
      if (filters?.stockCode) params.append('stockCode', filters.stockCode);

      const response = await this.api.get(
        `/sapigw/suppliers/${this.credentials.sellerId}/products?${params}`
      );
      return response.data.content || [];
    } catch (error) {
      throw new Error(`Failed to get Trendyol products: ${error}`);
    }
  }

  /**
   * Create product in Trendyol
   */
  async createProduct(
    product: Partial<TrendyolProduct>
  ): Promise<TrendyolProduct> {
    try {
      const response = await this.api.post(
        `/sapigw/suppliers/${this.credentials.sellerId}/products`,
        product
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create Trendyol product: ${error}`);
    }
  }

  /**
   * Update product in Trendyol
   */
  async updateProduct(
    productId: string,
    updates: Partial<TrendyolProduct>
  ): Promise<TrendyolProduct> {
    try {
      const response = await this.api.put(
        `/sapigw/suppliers/${this.credentials.sellerId}/products/${productId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update Trendyol product: ${error}`);
    }
  }

  /**
   * Update product price
   */
  async updatePrice(productId: string, price: number): Promise<void> {
    try {
      await this.api.put(
        `/sapigw/suppliers/${this.credentials.sellerId}/products/${productId}/price`,
        {
          salePrice: price,
        }
      );
    } catch (error) {
      throw new Error(`Failed to update Trendyol product price: ${error}`);
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, stock: number): Promise<void> {
    try {
      await this.api.put(
        `/sapigw/suppliers/${this.credentials.sellerId}/products/${productId}/stock`,
        {
          quantity: stock,
        }
      );
    } catch (error) {
      throw new Error(`Failed to update Trendyol product stock: ${error}`);
    }
  }

  /**
   * Get orders from Trendyol
   */
  async getOrders(filters?: {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<TrendyolOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.status) params.append('status', filters.status);

      const response = await this.api.get(
        `/sapigw/suppliers/${this.credentials.sellerId}/orders?${params}`
      );
      return response.data.content || [];
    } catch (error) {
      throw new Error(`Failed to get Trendyol orders: ${error}`);
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<TrendyolOrder> {
    try {
      const response = await this.api.get(
        `/sapigw/suppliers/${this.credentials.sellerId}/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Trendyol order: ${error}`);
    }
  }

  /**
   * Approve order
   */
  async approveOrder(orderId: string): Promise<void> {
    try {
      await this.api.post(
        `/sapigw/suppliers/${this.credentials.sellerId}/orders/${orderId}/approve`
      );
    } catch (error) {
      throw new Error(`Failed to approve Trendyol order: ${error}`);
    }
  }

  /**
   * Reject order
   */
  async rejectOrder(orderId: string, reason: string): Promise<void> {
    try {
      await this.api.post(
        `/sapigw/suppliers/${this.credentials.sellerId}/orders/${orderId}/reject`,
        {
          reason,
        }
      );
    } catch (error) {
      throw new Error(`Failed to reject Trendyol order: ${error}`);
    }
  }

  /**
   * Create shipment
   */
  async createShipment(
    orderId: string,
    shipment: {
      trackingNumber: string;
      carrier: string;
      trackingUrl?: string;
    }
  ): Promise<void> {
    try {
      await this.api.post(
        `/sapigw/suppliers/${this.credentials.sellerId}/orders/${orderId}/shipment`,
        shipment
      );
    } catch (error) {
      throw new Error(`Failed to create Trendyol shipment: ${error}`);
    }
  }

  /**
   * Get categories from Trendyol
   */
  async getCategories(): Promise<TrendyolCategory[]> {
    try {
      const response = await this.api.get('/sapigw/product-categories');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Trendyol categories: ${error}`);
    }
  }

  /**
   * Get category attributes
   */
  async getCategoryAttributes(categoryId: number): Promise<TrendyolCategory> {
    try {
      const response = await this.api.get(
        `/sapigw/product-categories/${categoryId}/attributes`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get Trendyol category attributes: ${error}`);
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.authenticate();
      // Try to get a small number of products to test the connection
      await this.getProducts({ page: 0, size: 1 });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get API rate limits
   */
  getRateLimits(): { requestsPerMinute: number; requestsPerHour: number } {
    return {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    };
  }
}
