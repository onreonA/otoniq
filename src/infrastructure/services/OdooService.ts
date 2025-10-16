/**
 * Odoo ERP Service - Via Edge Function Proxy
 *
 * Odoo ERP ile entegrasyon için Supabase Edge Function proxy üzerinden bağlantı
 * CORS sorununu çözmek için sunucu-taraflı proxy kullanılıyor
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

export class OdooService {
  private config: OdooConfig;
  private isConnected: boolean = false;
  private sessionId: string | null = null;
  private uid: number | null = null;
  private httpClient: AxiosInstance;

  constructor(config: OdooConfig) {
    this.config = config;

    // Initialize HTTP client for Supabase Edge Function proxy
    this.httpClient = axios.create({
      baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/odoo-proxy`,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get user session token
   */
  private async getSessionToken(): Promise<string> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      return session.access_token;
    } catch (error) {
      console.error('Failed to get session token:', error);
      throw new Error('Authentication required');
    }
  }

  /**
   * Odoo'ya bağlan via Edge Function
   */
  async connect(): Promise<boolean> {
    try {
      console.log('🔄 Testing Odoo connection via Edge Function...');
      console.log('🔍 Odoo config:', {
        url: this.config.url,
        db: this.config.db,
        username: this.config.username,
        port: this.config.port,
      });

      // Get user session token
      const sessionToken = await this.getSessionToken();

      // Test connection via Edge Function
      const response = await this.httpClient.post(
        '',
        {
          method: 'authenticate',
          credentials: {
            url: this.config.url,
            port: this.config.port,
            db: this.config.db,
            username: this.config.username,
            password: this.config.password,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      console.log(
        '🔍 Edge Function response:',
        JSON.stringify(response.data, null, 2)
      );

      // Check for error in response
      if (response.data.error) {
        const errorMsg = response.data.details || response.data.error;
        console.error('❌ Odoo authentication error:', errorMsg);

        if (
          errorMsg.includes('Access Denied') ||
          errorMsg.includes('AccessDenied')
        ) {
          throw new Error('Kullanıcı adı veya şifre hatalı!');
        } else if (errorMsg.includes('database')) {
          throw new Error('Veritabanı bulunamadı!');
        } else if (
          errorMsg.includes('timed out') ||
          errorMsg.includes('timeout')
        ) {
          throw new Error(
            'Odoo sunucusu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.'
          );
        } else {
          throw new Error(errorMsg);
        }
      }

      // Check for successful authentication
      if (response.data.success && response.data.result) {
        this.isConnected = true;
        this.uid = response.data.result;
        this.sessionId = response.data.sessionId;
        console.log(
          '✅ Odoo connection successful via Edge Function, UID:',
          this.uid
        );
        return true;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        this.isConnected = false;
        this.uid = null;
        this.sessionId = null;
        throw new Error('Beklenmeyen yanıt formatı');
      }
    } catch (error: any) {
      console.error('❌ Odoo connection failed:', error);
      this.isConnected = false;
      this.uid = null;
      this.sessionId = null;

      // Re-throw with user-friendly message
      if (error.message) {
        throw error;
      } else if (error.code === 'ECONNABORTED') {
        throw new Error(
          'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.'
        );
      } else {
        throw new Error(
          'Odoo bağlantısı başarısız. Lütfen ayarları kontrol edin.'
        );
      }
    }
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnectedToOdoo(): boolean {
    return this.isConnected;
  }

  /**
   * Tüm ürünleri getir via Edge Function
   */
  async getProducts(filters?: any[]): Promise<OdooProduct[]> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Fetching products from Odoo via Edge Function...');

      // Get user session token
      const sessionToken = await this.getSessionToken();

      const response = await this.httpClient.post(
        '',
        {
          method: 'search_read',
          credentials: {
            url: this.config.url,
            port: this.config.port,
            db: this.config.db,
            username: this.config.username,
            password: this.config.password,
          },
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
        },
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      );

      console.log(
        '🔍 Products response:',
        JSON.stringify(response.data, null, 2)
      );

      if (response.data.error) {
        console.error('❌ Products fetch error:', response.data.error);
        throw new Error(
          'Ürünler getirilemedi: ' +
            (response.data.details || response.data.error)
        );
      }

      if (response.data.success && Array.isArray(response.data.result)) {
        console.log(
          `✅ Retrieved ${response.data.result.length} products from Odoo`
        );
        return response.data.result;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        throw new Error('Beklenmeyen yanıt formatı');
      }
    } catch (error: any) {
      console.error('❌ Products fetch failed:', error);
      throw new Error(`Ürünler getirilemedi: ${error.message}`);
    }
  }

  /**
   * Tam senkronizasyon
   */
  async fullSync(): Promise<{ products: OdooProduct[]; count: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting full sync from Odoo...');
      const products = await this.getProducts();
      console.log(`✅ Full sync completed: ${products.length} products`);
      return { products, count: products.length };
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Stok senkronizasyonu
   */
  async stockSync(): Promise<{ updated: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting stock sync from Odoo...');
      const products = await this.getProducts();
      console.log(`✅ Stock sync completed: ${products.length} products`);
      return { updated: products.length };
    } catch (error) {
      console.error('❌ Stock sync failed:', error);
      throw error;
    }
  }

  /**
   * Fiyat senkronizasyonu
   */
  async priceSync(): Promise<{ updated: number }> {
    if (!this.isConnected) {
      throw new Error('Odoo not connected');
    }

    try {
      console.log('🔄 Starting price sync from Odoo...');
      const products = await this.getProducts();
      console.log(`✅ Price sync completed: ${products.length} products`);
      return { updated: products.length };
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
      this.uid = null;
      this.sessionId = null;
      console.log('🔌 Odoo connection closed');
    }
  }
}
