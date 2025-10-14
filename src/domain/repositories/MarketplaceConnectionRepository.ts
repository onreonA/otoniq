/**
 * Marketplace Connection Repository Interface
 * Defines the contract for marketplace connection data operations
 */

import { MarketplaceConnection } from '../entities/MarketplaceConnection';

export interface MarketplaceConnectionFilters {
  tenant_id?: string;
  marketplace?: MarketplaceConnection['marketplace'];
  status?: MarketplaceConnection['status'];
  sync_enabled?: boolean;
  search?: string;
}

export interface MarketplaceConnectionSortOptions {
  field: 'name' | 'marketplace' | 'status' | 'last_sync_at' | 'created_at';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MarketplaceConnectionRepository {
  /**
   * Find marketplace connection by ID
   */
  findById(id: string): Promise<MarketplaceConnection | null>;

  /**
   * Find marketplace connections with filters and pagination
   */
  findMany(
    filters: MarketplaceConnectionFilters,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>>;

  /**
   * Find marketplace connections by tenant
   */
  findByTenant(
    tenantId: string,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>>;

  /**
   * Find marketplace connections by marketplace type
   */
  findByMarketplace(
    tenantId: string,
    marketplace: MarketplaceConnection['marketplace'],
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>>;

  /**
   * Find active marketplace connections for tenant
   */
  findActiveByTenant(
    tenantId: string,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>>;

  /**
   * Check if marketplace connection name exists for tenant
   */
  nameExists(
    tenantId: string,
    name: string,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * Create new marketplace connection
   */
  create(connection: MarketplaceConnection): Promise<MarketplaceConnection>;

  /**
   * Update existing marketplace connection
   */
  update(connection: MarketplaceConnection): Promise<MarketplaceConnection>;

  /**
   * Delete marketplace connection
   */
  delete(id: string): Promise<void>;

  /**
   * Update connection status
   */
  updateStatus(
    id: string,
    status: MarketplaceConnection['status'],
    error?: string
  ): Promise<void>;

  /**
   * Update last sync time
   */
  updateLastSync(id: string): Promise<void>;

  /**
   * Get connection statistics for tenant
   */
  getConnectionStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    error: number;
    testing: number;
  }>;
}
