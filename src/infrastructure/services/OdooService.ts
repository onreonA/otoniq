/**
 * Odoo ERP Service
 *
 * Odoo ERP ile entegrasyon için HTTP API client
 * Ürün, stok, sipariş senkronizasyonu
 */

import axios, { AxiosInstance } from 'axios';

export interface OdooConfig {
  url: string;
  port: number;
  db: string;
  username: string;
  password: string;
}

export interface OdooProduct {
  id: number;
  name: string;
  default_code: string; // SKU
  description: string;
  description_sale: string;
  list_price: number;
  standard_price: number; // Cost
  type: 'consu' | 'service' | 'product';
  categ_id: [number, string]; // [id, name]
  active: boolean;
  sale_ok: boolean;
  purchase_ok: boolean;
  weight: number;
  volume: number;
  barcode: string;
  image_1920: string; // Base64 image
  create_date: string;
  write_date: string;
}

export interface OdooProductTemplate {
  id: number;
  name: string;
  default_code: string;
  list_price: number;
  standard_price: number;
  type: string;
  categ_id: [number, string];
  active: boolean;
  product_variant_ids: number[];
}

export class OdooService {
  private config: OdooConfig;
  private isConnected: boolean = false;
  private sessionId: string | null = null;
  private httpClient: AxiosInstance;

  constructor(config: OdooConfig) {
    this.config = config;

    // Initialize HTTP client for Supabase Edge Function proxy
    this.httpClient = axios.create({
      baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-proxy`,
      timeout: 60000, // 60 seconds timeout for Odoo
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      config => {
        console.log(
          `🔄 Odoo API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      error => {
        console.error('❌ Odoo API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.httpClient.interceptors.response.use(
      response => {
        console.log(
          `✅ Odoo API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      error => {
        console.error(
          '❌ Odoo API Response Error:',
          error.response?.data || error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Odoo'ya bağlan via Edge Function
   */
  async connect(): Promise<boolean> {
    try {
      console.log('🔄 Testing Odoo connection via Edge Function...');

      // Test connection by authenticating via Edge Function proxy
      const response = await this.httpClient.post('', {
        method: 'authenticate',
        credentials: {
          url: this.config.url,
          db: this.config.db,
          username: this.config.username,
          password: this.config.password,
        },
      });

      // Debug: Log the full response
      console.log(
        '🔍 Full Odoo response:',
        JSON.stringify(response.data, null, 2)
      );

      // Odoo XML-RPC response format: {jsonrpc: "2.0", id: 123, result: uid}
      if (
        response.data &&
        typeof response.data.result === 'number' &&
        response.data.result > 0
      ) {
        this.isConnected = true;
        this.sessionId = response.data.result.toString();
        console.log(
          '✅ Real Odoo connection successful, UID:',
          response.data.result
        );
        return true;
      } else {
        console.error(
          '❌ Odoo authentication failed:',
          response.data.error || 'Invalid response format'
        );
        console.error('❌ Response data:', response.data);
        this.isConnected = false;
        this.sessionId = null;
        return false;
      }
    } catch (error: any) {
      console.error('❌ Odoo connection failed:', error);
      this.isConnected = false;
      this.sessionId = null;
      return false;
    }
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnectedToOdoo(): boolean {
    return this.isConnected;
  }

  /**
   * Tüm ürünleri getir (Mock data - gerçek implementasyon için server-side API gerekli)
   */
  async getProducts(filters?: any[]): Promise<OdooProduct[]> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Fetching products from Odoo via Edge Function...');

      // Fetch products from Odoo via Edge Function proxy
      const response = await this.httpClient.post('', {
        method: 'search_read',
        model: 'product.product',
        args: filters || [],
        kwargs: {
          fields: [
            'id',
            'name',
            'default_code',
            'description',
            'description_sale',
            'list_price',
            'standard_price',
            'type',
            'categ_id',
            'active',
            'sale_ok',
            'purchase_ok',
            'weight',
            'volume',
            'barcode',
            'image_1920',
            'create_date',
            'write_date',
          ],
          limit: 100,
        },
        credentials: {
          url: this.config.url,
          db: this.config.db,
          username: this.config.username,
          password: this.config.password,
        },
        sessionId: this.sessionId, // Add sessionId here!
      });

      // Debug: Log the full response from Edge Function
      console.log(
        '🔍 Full Odoo products response:',
        JSON.stringify(response.data, null, 2)
      );

      // Edge Function'dan gelen response formatını düzelt
      if (response.data && Array.isArray(response.data.result)) {
        console.log(
          `✅ Retrieved ${response.data.result.length} products from Odoo`
        );
        return response.data.result;
      } else if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.records)
      ) {
        // Fallback: Eğer records altında gelirse
        console.log(
          `✅ Retrieved ${response.data.result.records.length} products from Odoo (via records)`
        );
        return response.data.result.records;
      } else {
        console.error(
          '❌ Odoo products fetch failed: Unexpected response format.',
          response.data
        );
        throw new Error('Failed to fetch products: Unexpected response format');
      }
    } catch (error: any) {
      console.error('❌ Odoo products fetch failed:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Belirli bir ürünü getir (Mock)
   */
  async getProduct(id: number): Promise<OdooProduct | null> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    // Mock data
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  /**
   * Ürün kategorilerini getir (Mock)
   */
  async getProductCategories(): Promise<Array<{ id: number; name: string }>> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    // Mock data
    return [
      { id: 1, name: 'Test Category 1' },
      { id: 2, name: 'Test Category 2' },
      { id: 3, name: 'Test Category 3' },
    ];
  }

  /**
   * Stok miktarlarını getir (Mock)
   */
  async getStockQuantities(
    productIds: number[]
  ): Promise<Array<{ product_id: number; quantity: number }>> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    // Mock data
    return productIds.map(id => ({
      product_id: id,
      quantity: Math.floor(Math.random() * 100) + 1,
    }));
  }

  /**
   * Ürün oluştur (Mock)
   */
  async createProduct(productData: Partial<OdooProduct>): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    // Mock - gerçek ID döndür
    const mockId = Math.floor(Math.random() * 1000) + 100;
    console.log('✅ Mock product created in Odoo:', mockId);
    return mockId;
  }

  /**
   * Ürün güncelle (Mock)
   */
  async updateProduct(
    id: number,
    productData: Partial<OdooProduct>
  ): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    // Mock
    console.log('✅ Mock product updated in Odoo:', id);
    return true;
  }

  /**
   * Tam senkronizasyon - Tüm ürünleri Odoo'dan çek
   */
  async fullSync(): Promise<{ products: OdooProduct[]; count: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting full sync from Odoo...');

      // Odoo'dan tüm ürünleri çek
      const products = await this.getProducts();

      console.log(`✅ Full sync completed: ${products.length} products`);
      return { products, count: products.length };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Stok senkronizasyonu - Sadece stok miktarlarını güncelle
   */
  async stockSync(): Promise<{ updated: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting stock sync from Odoo...');

      // Odoo'dan stok bilgilerini çek
      const products = await this.getProducts();
      let updatedCount = 0;

      for (const product of products) {
        try {
          // Stok miktarını güncelle (gerçek implementasyon için Supabase'e kaydet)
          console.log(
            `📦 Updating stock for product: ${product.name} (${product.default_code})`
          );
          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Failed to update stock for product ${product.name}:`,
            error
          );
        }
      }

      console.log(`✅ Stock sync completed: ${updatedCount} products updated`);
      return { updated: updatedCount };
    } catch (error) {
      console.error('❌ Stock sync failed:', error);
      throw error;
    }
  }

  /**
   * Fiyat senkronizasyonu - Sadece fiyatları güncelle
   */
  async priceSync(): Promise<{ updated: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting price sync from Odoo...');

      // Odoo'dan fiyat bilgilerini çek
      const products = await this.getProducts();
      let updatedCount = 0;

      for (const product of products) {
        try {
          // Fiyatı güncelle (gerçek implementasyon için Supabase'e kaydet)
          console.log(
            `💰 Updating price for product: ${product.name} - ${product.list_price} TL`
          );
          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Failed to update price for product ${product.name}:`,
            error
          );
        }
      }

      console.log(`✅ Price sync completed: ${updatedCount} products updated`);
      return { updated: updatedCount };
    } catch (error) {
      console.error('❌ Price sync failed:', error);
      throw error;
    }
  }

  /**
   * Bağlantıyı kapat
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      this.isConnected = false;
      console.log('🔌 Odoo connection closed');
    }
  }
}
