import { Money } from '../value-objects/Money';

export type ListingStatus =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'error'
  | 'rejected'
  | 'out_of_stock';

export interface ListingOverrides {
  price?: Money;
  stock?: number;
  title?: string;
  description?: string;
}

export interface ListingStats {
  views: number;
  sales: number;
  conversionRate: number;
  lastViewedAt?: Date;
}

export class MarketplaceListing {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly marketplaceConnectionId: string,
    public readonly externalProductId?: string,
    public readonly externalListingId?: string,
    public readonly externalUrl?: string,
    public readonly overrides: ListingOverrides = {},
    public readonly status: ListingStatus = 'pending',
    public readonly errorMessage?: string,
    public readonly lastSyncedAt?: Date,
    public readonly syncFrequency: number = 3600, // seconds
    public readonly autoSync: boolean = true,
    public readonly stats: ListingStats = {
      views: 0,
      sales: 0,
      conversionRate: 0,
    },
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if listing is active
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Check if listing has errors
   */
  hasErrors(): boolean {
    return this.status === 'error' || !!this.errorMessage;
  }

  /**
   * Check if listing is pending
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Check if listing is out of stock
   */
  isOutOfStock(): boolean {
    return this.status === 'out_of_stock';
  }

  /**
   * Check if sync is due
   */
  isSyncDue(): boolean {
    if (!this.lastSyncedAt || !this.autoSync) {
      return false;
    }

    const now = new Date();
    const lastSync = this.lastSyncedAt;
    const intervalMs = this.syncFrequency * 1000;

    return now.getTime() - lastSync.getTime() >= intervalMs;
  }

  /**
   * Get effective price (with overrides)
   */
  getEffectivePrice(basePrice: Money): Money {
    return this.overrides.price || basePrice;
  }

  /**
   * Get effective stock (with overrides)
   */
  getEffectiveStock(baseStock: number): number {
    return this.overrides.stock ?? baseStock;
  }

  /**
   * Get effective title (with overrides)
   */
  getEffectiveTitle(baseTitle: string): string {
    return this.overrides.title || baseTitle;
  }

  /**
   * Get effective description (with overrides)
   */
  getEffectiveDescription(baseDescription: string): string {
    return this.overrides.description || baseDescription;
  }

  /**
   * Update listing status
   */
  updateStatus(
    status: ListingStatus,
    errorMessage?: string
  ): MarketplaceListing {
    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      this.overrides,
      status,
      errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      this.autoSync,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update overrides
   */
  updateOverrides(overrides: Partial<ListingOverrides>): MarketplaceListing {
    const updatedOverrides: ListingOverrides = {
      ...this.overrides,
      ...overrides,
    };

    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      updatedOverrides,
      this.status,
      this.errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      this.autoSync,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update sync info
   */
  updateSyncInfo(
    lastSyncedAt: Date,
    syncFrequency?: number,
    autoSync?: boolean
  ): MarketplaceListing {
    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      this.overrides,
      this.status,
      this.errorMessage,
      lastSyncedAt,
      syncFrequency ?? this.syncFrequency,
      autoSync ?? this.autoSync,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update stats
   */
  updateStats(stats: Partial<ListingStats>): MarketplaceListing {
    const updatedStats: ListingStats = {
      ...this.stats,
      ...stats,
    };

    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      this.overrides,
      this.status,
      this.errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      this.autoSync,
      updatedStats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Clear overrides
   */
  clearOverrides(): MarketplaceListing {
    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      {},
      this.status,
      this.errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      this.autoSync,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Enable auto sync
   */
  enableAutoSync(): MarketplaceListing {
    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      this.overrides,
      this.status,
      this.errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      true,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Disable auto sync
   */
  disableAutoSync(): MarketplaceListing {
    return new MarketplaceListing(
      this.id,
      this.productId,
      this.marketplaceConnectionId,
      this.externalProductId,
      this.externalListingId,
      this.externalUrl,
      this.overrides,
      this.status,
      this.errorMessage,
      this.lastSyncedAt,
      this.syncFrequency,
      false,
      this.stats,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Get status display text
   */
  getStatusDisplayText(): string {
    const statusTexts: Record<ListingStatus, string> = {
      pending: 'Beklemede',
      active: 'Aktif',
      inactive: 'Pasif',
      error: 'Hata',
      rejected: 'Reddedildi',
      out_of_stock: 'Stokta Yok',
    };

    return statusTexts[this.status];
  }

  /**
   * Get status color for UI
   */
  getStatusColor(): string {
    const statusColors: Record<ListingStatus, string> = {
      pending: 'yellow',
      active: 'green',
      inactive: 'gray',
      error: 'red',
      rejected: 'red',
      out_of_stock: 'orange',
    };

    return statusColors[this.status];
  }

  /**
   * Check if listing can be synced
   */
  canSync(): boolean {
    return this.isActive() && this.autoSync && this.isSyncDue();
  }

  /**
   * Get sync priority (higher number = higher priority)
   */
  getSyncPriority(): number {
    if (this.hasErrors()) {
      return 3; // High priority for error listings
    }

    if (this.isPending()) {
      return 2; // Medium priority for pending listings
    }

    if (this.isActive()) {
      return 1; // Low priority for active listings
    }

    return 0; // No priority for inactive listings
  }
}
