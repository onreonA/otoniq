import {
  Marketplace,
  MarketplaceType,
  ConnectionStatus,
} from '../entities/Marketplace';

export interface MarketplaceFilters {
  tenantId?: string;
  type?: MarketplaceType;
  status?: ConnectionStatus;
  search?: string;
}

export interface MarketplaceCreateRequest {
  tenantId: string;
  type: MarketplaceType;
  name: string;
  credentials: any;
  settings?: any;
}

export interface MarketplaceUpdateRequest {
  name?: string;
  credentials?: any;
  settings?: any;
  status?: ConnectionStatus;
}

export interface IMarketplaceRepository {
  /**
   * Create a new marketplace connection
   */
  create(request: MarketplaceCreateRequest): Promise<Marketplace>;

  /**
   * Get marketplace by ID
   */
  findById(id: string): Promise<Marketplace | null>;

  /**
   * Get marketplace by tenant and type
   */
  findByTenantAndType(
    tenantId: string,
    type: MarketplaceType
  ): Promise<Marketplace | null>;

  /**
   * Get all marketplaces for a tenant
   */
  findByTenant(
    tenantId: string,
    filters?: MarketplaceFilters
  ): Promise<Marketplace[]>;

  /**
   * Update marketplace
   */
  update(id: string, updates: MarketplaceUpdateRequest): Promise<Marketplace>;

  /**
   * Delete marketplace
   */
  delete(id: string): Promise<void>;

  /**
   * Test marketplace connection
   */
  testConnection(id: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get marketplace statistics
   */
  getStats(id: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    totalRevenue: number;
    lastSyncAt?: Date;
  }>;

  /**
   * Update marketplace stats
   */
  updateStats(
    id: string,
    stats: {
      totalListedProducts?: number;
      totalOrders?: number;
      lastSyncAt?: Date;
      lastError?: string;
    }
  ): Promise<void>;

  /**
   * Get marketplaces that need sync
   */
  getMarketplacesForSync(tenantId?: string): Promise<Marketplace[]>;

  /**
   * Get marketplace performance metrics
   */
  getPerformanceMetrics(
    tenantId: string,
    days: number
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topMarketplace: string;
  }>;
}
