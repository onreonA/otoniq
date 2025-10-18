import { Money } from '../value-objects/Money';

export type MarketplaceType =
  | 'trendyol'
  | 'amazon'
  | 'hepsiburada'
  | 'n11'
  | 'gittigidiyor'
  | 'ciceksepeti'
  | 'other';

export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'testing';

export interface MarketplaceCredentials {
  apiKey: string;
  apiSecret: string;
  sellerId?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any; // For marketplace-specific credentials
}

export interface MarketplaceSettings {
  autoSync: boolean;
  syncInterval: number; // seconds
  priceMarkup?: number; // percentage
  stockBuffer?: number; // minimum stock to keep
  categoryMapping?: Record<string, string>;
  [key: string]: any; // For marketplace-specific settings
}

export interface MarketplaceStats {
  totalListedProducts: number;
  totalOrders: number;
  totalRevenue: Money;
  lastSyncAt?: Date;
  lastError?: string;
}

export class Marketplace {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly type: MarketplaceType,
    public readonly name: string,
    public readonly credentials: MarketplaceCredentials,
    public readonly status: ConnectionStatus,
    public readonly settings: MarketplaceSettings,
    public readonly stats: MarketplaceStats,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if marketplace connection is active
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if marketplace connection has errors
   */
  hasErrors(): boolean {
    return this.status === 'error' || !!this.stats.lastError;
  }

  /**
   * Get marketplace display name
   */
  getDisplayName(): string {
    if (this.type === 'other') {
      return this.name;
    }

    const typeNames: Record<MarketplaceType, string> = {
      trendyol: 'Trendyol',
      amazon: 'Amazon',
      hepsiburada: 'Hepsiburada',
      n11: 'N11',
      gittigidiyor: 'GittiGidiyor',
      ciceksepeti: 'Çiçeksepeti',
      other: this.name,
    };

    return typeNames[this.type];
  }

  /**
   * Check if auto-sync is enabled
   */
  isAutoSyncEnabled(): boolean {
    return this.settings.autoSync;
  }

  /**
   * Get sync interval in milliseconds
   */
  getSyncIntervalMs(): number {
    return this.settings.syncInterval * 1000;
  }

  /**
   * Check if sync is due
   */
  isSyncDue(): boolean {
    if (!this.stats.lastSyncAt) {
      return true;
    }

    const now = new Date();
    const lastSync = this.stats.lastSyncAt;
    const intervalMs = this.getSyncIntervalMs();

    return now.getTime() - lastSync.getTime() >= intervalMs;
  }

  /**
   * Get price markup percentage
   */
  getPriceMarkup(): number {
    return this.settings.priceMarkup || 0;
  }

  /**
   * Calculate price with markup
   */
  calculatePriceWithMarkup(basePrice: Money): Money {
    const markup = this.getPriceMarkup();
    if (markup === 0) {
      return basePrice;
    }

    const markupAmount = basePrice.amount * (markup / 100);
    return new Money(basePrice.amount + markupAmount, basePrice.currency);
  }

  /**
   * Get stock buffer amount
   */
  getStockBuffer(): number {
    return this.settings.stockBuffer || 0;
  }

  /**
   * Calculate available stock for marketplace
   */
  calculateAvailableStock(totalStock: number): number {
    const buffer = this.getStockBuffer();
    return Math.max(0, totalStock - buffer);
  }

  /**
   * Get category mapping for internal category
   */
  getCategoryMapping(internalCategory: string): string | undefined {
    return this.settings.categoryMapping?.[internalCategory];
  }

  /**
   * Update connection status
   */
  updateStatus(status: ConnectionStatus, error?: string): Marketplace {
    const updatedStats: MarketplaceStats = {
      ...this.stats,
      lastError: error,
      lastSyncAt: status === 'active' ? new Date() : this.stats.lastSyncAt,
    };

    return new Marketplace(
      this.id,
      this.tenantId,
      this.type,
      this.name,
      this.credentials,
      status,
      this.settings,
      updatedStats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update settings
   */
  updateSettings(settings: Partial<MarketplaceSettings>): Marketplace {
    const updatedSettings: MarketplaceSettings = {
      ...this.settings,
      ...settings,
    };

    return new Marketplace(
      this.id,
      this.tenantId,
      this.type,
      this.name,
      this.credentials,
      this.status,
      updatedSettings,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update stats
   */
  updateStats(stats: Partial<MarketplaceStats>): Marketplace {
    const updatedStats: MarketplaceStats = {
      ...this.stats,
      ...stats,
    };

    return new Marketplace(
      this.id,
      this.tenantId,
      this.type,
      this.name,
      this.credentials,
      this.status,
      this.settings,
      updatedStats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Test connection credentials
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    // This would be implemented by the infrastructure layer
    // For now, return a mock response
    return { success: true };
  }

  /**
   * Validate credentials format
   */
  validateCredentials(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.credentials.apiKey) {
      errors.push('API Key is required');
    }

    if (!this.credentials.apiSecret) {
      errors.push('API Secret is required');
    }

    // Marketplace-specific validations
    switch (this.type) {
      case 'trendyol':
        if (!this.credentials.sellerId) {
          errors.push('Seller ID is required for Trendyol');
        }
        break;
      case 'amazon':
        if (!this.credentials.accessToken) {
          errors.push('Access Token is required for Amazon');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get marketplace-specific API endpoints
   */
  getApiEndpoints(): Record<string, string> {
    const endpoints: Record<MarketplaceType, Record<string, string>> = {
      trendyol: {
        baseUrl: 'https://api.trendyol.com',
        products: '/sapigw/suppliers/{supplierId}/products',
        orders: '/sapigw/suppliers/{supplierId}/orders',
        categories: '/sapigw/product-categories',
      },
      amazon: {
        baseUrl: 'https://sellingpartnerapi-na.amazon.com',
        products: '/catalog/2022-04-01/items',
        orders: '/orders/v0/orders',
        inventory: '/fba/inventory/v1/summaries',
      },
      hepsiburada: {
        baseUrl: 'https://mpop.hepsiburada.com',
        products: '/product/api/products',
        orders: '/order/api/orders',
        categories: '/product/api/categories',
      },
      n11: {
        baseUrl: 'https://api.n11.com',
        products: '/ws/productService.wsdl',
        orders: '/ws/orderService.wsdl',
        categories: '/ws/categoryService.wsdl',
      },
      gittigidiyor: {
        baseUrl: 'https://api.gittigidiyor.com',
        products: '/rest/ws/v2/product',
        orders: '/rest/ws/v2/order',
        categories: '/rest/ws/v2/category',
      },
      ciceksepeti: {
        baseUrl: 'https://api.ciceksepeti.com',
        products: '/v1/products',
        orders: '/v1/orders',
        categories: '/v1/categories',
      },
      other: {
        baseUrl: '',
        products: '/products',
        orders: '/orders',
        categories: '/categories',
      },
    };

    return endpoints[this.type];
  }
}
