/**
 * Odoo Integration Service
 *
 * Handles synchronization between Otoniq and Odoo ERP system
 */

export interface OdooProduct {
  id: number;
  name: string;
  default_code: string;
  list_price: number;
  standard_price: number;
  qty_available: number;
  description: string;
  description_sale: string;
  categ_id: [number, string];
  active: boolean;
  type: 'consu' | 'service' | 'product';
  sale_ok: boolean;
  purchase_ok: boolean;
  weight: number;
  volume: number;
  barcode: string;
  tracking: 'none' | 'lot' | 'serial';
}

export interface OdooConfig {
  url: string;
  database: string;
  username: string;
  password: string;
  apiKey?: string;
}

export class OdooIntegrationService {
  private config: OdooConfig;
  private sessionId: string | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  /**
   * Authenticate with Odoo
   */
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.url}/web/session/authenticate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              db: this.config.database,
              login: this.config.username,
              password: this.config.password,
            },
            id: 1,
          }),
        }
      );

      const data = await response.json();

      if (data.result && data.result.uid) {
        this.sessionId = data.result.session_id;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Odoo authentication error:', error);
      return false;
    }
  }

  /**
   * Get products from Odoo
   */
  async getProducts(): Promise<OdooProduct[]> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'product.product',
            method: 'search_read',
            args: [[]],
            kwargs: {
              fields: [
                'id',
                'name',
                'default_code',
                'list_price',
                'standard_price',
                'qty_available',
                'description',
                'description_sale',
                'categ_id',
                'active',
                'type',
                'sale_ok',
                'purchase_ok',
                'weight',
                'volume',
                'barcode',
                'tracking',
              ],
            },
          },
          id: 1,
        }),
      });

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Odoo get products error:', error);
      throw error;
    }
  }

  /**
   * Sync product to Odoo
   */
  async syncProductToOdoo(product: any): Promise<number> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const odooProduct = {
        name: product.name,
        default_code: product.sku,
        list_price: product.price,
        standard_price: product.cost,
        description: product.description,
        description_sale: product.short_description,
        active: product.status === 'active',
        type: 'product',
        sale_ok: true,
        purchase_ok: true,
        weight: product.weight || 0,
        volume: product.volume || 0,
        barcode: product.barcode || '',
        tracking: 'none',
      };

      const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'product.product',
            method: 'create',
            args: [odooProduct],
            kwargs: {},
          },
          id: 1,
        }),
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Odoo sync product error:', error);
      throw error;
    }
  }

  /**
   * Update product in Odoo
   */
  async updateProductInOdoo(odooId: number, product: any): Promise<boolean> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const odooProduct = {
        name: product.name,
        default_code: product.sku,
        list_price: product.price,
        standard_price: product.cost,
        description: product.description,
        description_sale: product.short_description,
        active: product.status === 'active',
        weight: product.weight || 0,
        volume: product.volume || 0,
        barcode: product.barcode || '',
      };

      const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'product.product',
            method: 'write',
            args: [[odooId], odooProduct],
            kwargs: {},
          },
          id: 1,
        }),
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Odoo update product error:', error);
      throw error;
    }
  }

  /**
   * Delete product from Odoo
   */
  async deleteProductFromOdoo(odooId: number): Promise<boolean> {
    if (!this.sessionId) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.config.url}/web/dataset/call_kw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            model: 'product.product',
            method: 'unlink',
            args: [[odooId]],
            kwargs: {},
          },
          id: 1,
        }),
      });

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Odoo delete product error:', error);
      throw error;
    }
  }

  /**
   * Test connection to Odoo
   */
  async testConnection(): Promise<boolean> {
    try {
      const isAuthenticated = await this.authenticate();
      return isAuthenticated;
    } catch (error) {
      console.error('Odoo connection test error:', error);
      return false;
    }
  }
}
