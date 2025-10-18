import {
  MarketplaceListing,
  ListingStatus,
} from '../entities/MarketplaceListing';
import { Money } from '../value-objects/Money';

export interface MarketplaceListingFilters {
  tenantId?: string;
  marketplaceConnectionId?: string;
  productId?: string;
  status?: ListingStatus;
  search?: string;
  hasErrors?: boolean;
  needsSync?: boolean;
}

export interface MarketplaceListingCreateRequest {
  productId: string;
  marketplaceConnectionId: string;
  externalProductId?: string;
  externalListingId?: string;
  externalUrl?: string;
  overrides?: {
    price?: Money;
    stock?: number;
    title?: string;
    description?: string;
  };
  autoSync?: boolean;
  syncFrequency?: number;
}

export interface MarketplaceListingUpdateRequest {
  externalProductId?: string;
  externalListingId?: string;
  externalUrl?: string;
  overrides?: {
    price?: Money;
    stock?: number;
    title?: string;
    description?: string;
  };
  status?: ListingStatus;
  errorMessage?: string;
  autoSync?: boolean;
  syncFrequency?: number;
}

export interface IMarketplaceListingRepository {
  /**
   * Create a new marketplace listing
   */
  create(request: MarketplaceListingCreateRequest): Promise<MarketplaceListing>;

  /**
   * Get listing by ID
   */
  findById(id: string): Promise<MarketplaceListing | null>;

  /**
   * Get listing by product and marketplace
   */
  findByProductAndMarketplace(
    productId: string,
    marketplaceConnectionId: string
  ): Promise<MarketplaceListing | null>;

  /**
   * Get all listings for a product
   */
  findByProduct(productId: string): Promise<MarketplaceListing[]>;

  /**
   * Get all listings for a marketplace
   */
  findByMarketplace(
    marketplaceConnectionId: string,
    filters?: MarketplaceListingFilters
  ): Promise<MarketplaceListing[]>;

  /**
   * Get all listings with filters
   */
  findMany(filters: MarketplaceListingFilters): Promise<MarketplaceListing[]>;

  /**
   * Update listing
   */
  update(
    id: string,
    updates: MarketplaceListingUpdateRequest
  ): Promise<MarketplaceListing>;

  /**
   * Update listing status
   */
  updateStatus(
    id: string,
    status: ListingStatus,
    errorMessage?: string
  ): Promise<MarketplaceListing>;

  /**
   * Update listing overrides
   */
  updateOverrides(
    id: string,
    overrides: {
      price?: Money;
      stock?: number;
      title?: string;
      description?: string;
    }
  ): Promise<MarketplaceListing>;

  /**
   * Update sync info
   */
  updateSyncInfo(id: string, lastSyncedAt: Date): Promise<MarketplaceListing>;

  /**
   * Update listing stats
   */
  updateStats(
    id: string,
    stats: {
      views?: number;
      sales?: number;
      conversionRate?: number;
      lastViewedAt?: Date;
    }
  ): Promise<MarketplaceListing>;

  /**
   * Delete listing
   */
  delete(id: string): Promise<void>;

  /**
   * Get listings that need sync
   */
  getListingsForSync(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;

  /**
   * Get listing statistics
   */
  getListingStats(marketplaceConnectionId: string): Promise<{
    totalListings: number;
    activeListings: number;
    pendingListings: number;
    errorListings: number;
    outOfStockListings: number;
  }>;

  /**
   * Bulk update listings
   */
  bulkUpdateStatus(
    listingIds: string[],
    status: ListingStatus,
    errorMessage?: string
  ): Promise<void>;

  /**
   * Bulk update overrides
   */
  bulkUpdateOverrides(
    listingIds: string[],
    overrides: {
      price?: Money;
      stock?: number;
      title?: string;
      description?: string;
    }
  ): Promise<void>;

  /**
   * Get listings by status
   */
  getListingsByStatus(
    status: ListingStatus,
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;

  /**
   * Get listings with errors
   */
  getListingsWithErrors(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;

  /**
   * Get listings that are out of stock
   */
  getOutOfStockListings(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;

  /**
   * Get listings that need price updates
   */
  getListingsNeedingPriceUpdate(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;

  /**
   * Get listings that need stock updates
   */
  getListingsNeedingStockUpdate(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceListing[]>;
}
