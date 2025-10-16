/**
 * Shopify Service
 *
 * Shopify Admin API ile entegrasyon için HTTP client
 * Ürün, stok, sipariş senkronizasyonu
 */

export interface ShopifyConfig {
  shop: string; // shop-name.myshopify.com
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  status: 'active' | 'archived' | 'draft';
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
}

export class ShopifyService {
  private config: ShopifyConfig;
  private baseUrl: string;
  private isConnected: boolean = false;
  private httpClient: any;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.config.apiVersion = config.apiVersion || '2023-10';
    this.baseUrl = `https://${config.shop}.myshopify.com/admin/api/${this.config.apiVersion}`;

    // Initialize HTTP client for Supabase Edge Function proxy
    this.httpClient = {
      baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-proxy`,
      timeout: 60000, // 60 seconds timeout for Shopify
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    };
  }

  /**
   * Get current user session token for authentication
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
   * Shopify bağlantısını test et
   */
  async testConnection(): Promise<boolean> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log('🚀 Testing Shopify connection via Supabase Edge Function');

      // Get user session token for authentication
      const sessionToken = await this.getSessionToken();

      const response = await fetch(this.httpClient.baseURL, {
        method: 'POST',
        headers: {
          ...this.httpClient.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          method: 'testConnection',
          credentials: {
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            apiVersion: this.config.apiVersion,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ Shopify connection successful:', data.shop.name);
          this.isConnected = true;
          return true;
        } else {
          console.error('❌ Shopify connection failed:', data.error);
          this.isConnected = false;
          return false;
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Shopify connection failed:', errorData);
        this.isConnected = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Shopify connection error:', error);
      return false;
    }
  }

  /**
   * Tüm ürünleri getir
   */
  async getProducts(limit: number = 50): Promise<ShopifyProduct[]> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log('🚀 Fetching products via Supabase Edge Function');

      // Get user session token for authentication
      const sessionToken = await this.getSessionToken();

      const response = await fetch(this.httpClient.baseURL, {
        method: 'POST',
        headers: {
          ...this.httpClient.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          method: 'getProducts',
          credentials: {
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            apiVersion: this.config.apiVersion,
          },
          params: { limit, page: 1 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`📦 Found ${data.products.length} products in Shopify`);
          return data.products || [];
        } else {
          console.error('❌ Failed to fetch products:', data.error);
          return [];
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching products from Shopify:', errorData);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching products from Shopify:', error);
      throw error;
    }
  }

  /**
   * Tam senkronizasyon - Tüm ürünleri Shopify'dan çek ve database'e kaydet
   */
  async fullSync(): Promise<{ products: ShopifyProduct[]; count: number }> {
    try {
      console.log('🔄 Starting full sync from Shopify...');

      // Get user session token for authentication
      const sessionToken = await this.getSessionToken();

      const response = await fetch(this.httpClient.baseURL, {
        method: 'POST',
        headers: {
          ...this.httpClient.headers,
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          method: 'syncProducts',
          credentials: {
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            apiVersion: this.config.apiVersion,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Full sync completed: ${data.synced} products synced`);
          return { products: data.products || [], count: data.synced };
        } else {
          console.error('❌ Full sync failed:', data.error);
          throw new Error(data.error);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Full sync failed:', errorData);
        throw new Error(errorData.error || 'Sync failed');
      }
    } catch (error) {
      console.error('❌ Full sync error:', error);
      throw error;
    }
  }

  /**
   * Belirli bir ürünü getir
   */
  async getProduct(id: number): Promise<ShopifyProduct | null> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log(`🚀 Fetching product ${id} via Supabase Edge Function`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: `products/${id}.json`,
            method: 'GET',
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json();
        console.error(
          `❌ Error fetching product ${id} from Shopify:`,
          errorData
        );
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.product;
    } catch (error) {
      console.error(`❌ Error fetching product ${id} from Shopify:`, error);
      throw error;
    }
  }

  /**
   * Ürün oluştur
   */
  async createProduct(
    productData: Partial<ShopifyProduct>
  ): Promise<ShopifyProduct> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log('🚀 Creating product via Supabase Edge Function');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: 'products.json',
            method: 'POST',
            body: { product: productData },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error creating product in Shopify:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product created in Shopify:', data.product.id);
      return data.product;
    } catch (error) {
      console.error('❌ Error creating product in Shopify:', error);
      throw error;
    }
  }

  /**
   * Ürün güncelle
   */
  async updateProduct(
    id: number,
    productData: Partial<ShopifyProduct>
  ): Promise<ShopifyProduct> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log(`🚀 Updating product ${id} via Supabase Edge Function`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: `products/${id}.json`,
            method: 'PUT',
            body: { product: productData },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error updating product in Shopify:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Product updated in Shopify:', id);
      return data.product;
    } catch (error) {
      console.error('❌ Error updating product in Shopify:', error);
      throw error;
    }
  }

  /**
   * Ürün sil
   */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log(`🚀 Deleting product ${id} via Supabase Edge Function`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: `products/${id}.json`,
            method: 'DELETE',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error deleting product from Shopify:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Product deleted from Shopify:', id);
      return true;
    } catch (error) {
      console.error('❌ Error deleting product from Shopify:', error);
      throw error;
    }
  }

  /**
   * Stok miktarını güncelle
   */
  async updateInventory(variantId: number, quantity: number): Promise<boolean> {
    try {
      // Use Supabase Edge Function for real Shopify API calls
      console.log(`🚀 Updating inventory via Supabase Edge Function`);

      // First get the inventory item ID
      const variantResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: `variants/${variantId}.json`,
            method: 'GET',
          }),
        }
      );

      if (!variantResponse.ok) {
        const errorData = await variantResponse.json();
        console.error('❌ Error fetching variant from Shopify:', errorData);
        throw new Error(`HTTP error! status: ${variantResponse.status}`);
      }

      const variantData = await variantResponse.json();
      const inventoryItemId = variantData.variant.inventory_item_id;

      // Update inventory quantity
      const inventoryResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            accessToken: this.config.accessToken,
            endpoint: 'inventory_levels/set.json',
            method: 'POST',
            body: {
              location_id: 1, // Default location
              inventory_item_id: inventoryItemId,
              available: quantity,
            },
          }),
        }
      );

      if (!inventoryResponse.ok) {
        const errorData = await inventoryResponse.json();
        console.error('❌ Error updating inventory in Shopify:', errorData);
        throw new Error(`HTTP error! status: ${inventoryResponse.status}`);
      }

      console.log('✅ Inventory updated in Shopify:', variantId, quantity);
      return true;
    } catch (error) {
      console.error('❌ Error updating inventory in Shopify:', error);
      throw error;
    }
  }
}
