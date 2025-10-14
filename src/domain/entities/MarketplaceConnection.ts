/**
 * Marketplace Connection Entity
 * Represents a connection to an external marketplace (Trendyol, Amazon, Hepsiburada, etc.)
 */

export interface MarketplaceCredentials {
  [key: string]: string | number | boolean;
}

export interface MarketplaceConfig {
  apiUrl: string;
  apiVersion?: string;
  timeout?: number;
  retryAttempts?: number;
}

export class MarketplaceConnection {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public marketplace:
      | 'trendyol'
      | 'amazon'
      | 'hepsiburada'
      | 'n11'
      | 'gittigidiyor'
      | 'ciceksepeti',
    public name: string,
    public credentials: MarketplaceCredentials,
    public config: MarketplaceConfig,
    public status: 'active' | 'inactive' | 'error' | 'testing',
    public last_sync_at?: Date,
    public last_error?: string,
    public sync_enabled: boolean = true,
    public auto_sync_interval?: number, // minutes
    public created_at: Date = new Date(),
    public updated_at: Date = new Date()
  ) {
    this.validate();
  }

  /**
   * Validate marketplace connection data
   */
  private validate(): void {
    if (!this.id) {
      throw new Error('Marketplace connection ID is required');
    }
    if (!this.tenant_id) {
      throw new Error('Tenant ID is required');
    }
    if (!this.marketplace) {
      throw new Error('Marketplace type is required');
    }
    if (!this.name) {
      throw new Error('Connection name is required');
    }
    if (!this.credentials || Object.keys(this.credentials).length === 0) {
      throw new Error('Credentials are required');
    }
    if (!this.config || !this.config.apiUrl) {
      throw new Error('API configuration is required');
    }
  }

  /**
   * Update connection status
   */
  public updateStatus(
    status: MarketplaceConnection['status'],
    error?: string
  ): void {
    this.status = status;
    this.last_error = error;
    this.updated_at = new Date();
  }

  /**
   * Update last sync time
   */
  public updateLastSync(): void {
    this.last_sync_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Check if connection is healthy
   */
  public isHealthy(): boolean {
    return this.status === 'active' && !this.last_error;
  }

  /**
   * Get marketplace display name
   */
  public getDisplayName(): string {
    const marketplaceNames: Record<
      MarketplaceConnection['marketplace'],
      string
    > = {
      trendyol: 'Trendyol',
      amazon: 'Amazon',
      hepsiburada: 'Hepsiburada',
      n11: 'N11',
      gittigidiyor: 'GittiGidiyor',
      ciceksepeti: 'Çiçeksepeti',
    };
    return marketplaceNames[this.marketplace] || this.marketplace;
  }

  /**
   * Convert to JSON
   */
  public toJSON(): any {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      marketplace: this.marketplace,
      name: this.name,
      credentials: this.credentials,
      config: this.config,
      status: this.status,
      last_sync_at: this.last_sync_at?.toISOString(),
      last_error: this.last_error,
      sync_enabled: this.sync_enabled,
      auto_sync_interval: this.auto_sync_interval,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
    };
  }

  /**
   * Create from JSON
   */
  public static fromJSON(data: any): MarketplaceConnection {
    return new MarketplaceConnection(
      data.id,
      data.tenant_id,
      data.marketplace,
      data.name,
      data.credentials,
      data.config,
      data.status,
      data.last_sync_at ? new Date(data.last_sync_at) : undefined,
      data.last_error,
      data.sync_enabled ?? true,
      data.auto_sync_interval,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
