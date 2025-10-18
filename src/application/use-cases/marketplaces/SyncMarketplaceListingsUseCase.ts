import { MarketplaceListing } from '../../../domain/entities/MarketplaceListing';
import { IMarketplaceListingRepository } from '../../../domain/repositories/IMarketplaceListingRepository';
import { IMarketplaceRepository } from '../../../domain/repositories/IMarketplaceRepository';
import { TrendyolClient } from '../../../infrastructure/apis/marketplaces/trendyol/TrendyolClient';

export interface SyncMarketplaceListingsRequest {
  marketplaceConnectionId?: string;
  direction: 'to_marketplace' | 'from_marketplace' | 'bidirectional';
  forceSync?: boolean;
  listingIds?: string[];
}

export interface SyncResult {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    listingId: string;
    error: string;
  }>;
  duration: number; // milliseconds
}

export class SyncMarketplaceListingsUseCase {
  constructor(
    private marketplaceListingRepository: IMarketplaceListingRepository,
    private marketplaceRepository: IMarketplaceRepository
  ) {}

  async execute(request: SyncMarketplaceListingsRequest): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      success: false,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      duration: 0,
    };

    try {
      // Get listings to sync
      const listings = await this.getListingsToSync(request);

      if (listings.length === 0) {
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Get marketplace connection
      const marketplace = await this.marketplaceRepository.findById(
        request.marketplaceConnectionId || listings[0].marketplaceConnectionId
      );

      if (!marketplace) {
        throw new Error('Marketplace connection not found');
      }

      // Sync listings based on direction
      for (const listing of listings) {
        result.processed++;

        try {
          switch (request.direction) {
            case 'to_marketplace':
              await this.syncToMarketplace(marketplace, listing);
              break;
            case 'from_marketplace':
              await this.syncFromMarketplace(marketplace, listing);
              break;
            case 'bidirectional':
              await this.syncBidirectional(marketplace, listing);
              break;
          }

          // Update sync timestamp
          await this.marketplaceListingRepository.updateSyncInfo(
            listing.id,
            new Date()
          );

          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            listingId: listing.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      result.success = result.failed === 0;
      result.duration = Date.now() - startTime;

      return result;
    } catch (error) {
      result.duration = Date.now() - startTime;
      result.errors.push({
        listingId: 'general',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return result;
    }
  }

  private async getListingsToSync(
    request: SyncMarketplaceListingsRequest
  ): Promise<MarketplaceListing[]> {
    if (request.listingIds && request.listingIds.length > 0) {
      // Sync specific listings
      const listings: MarketplaceListing[] = [];
      for (const id of request.listingIds) {
        const listing = await this.marketplaceListingRepository.findById(id);
        if (listing) {
          listings.push(listing);
        }
      }
      return listings;
    }

    if (request.marketplaceConnectionId) {
      // Sync all listings for a specific marketplace
      return await this.marketplaceListingRepository.getListingsForSync(
        request.marketplaceConnectionId
      );
    }

    // Sync all listings that need sync
    return await this.marketplaceListingRepository.getListingsForSync();
  }

  private async syncToMarketplace(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    if (!listing.isActive()) {
      throw new Error('Listing is not active');
    }

    switch (marketplace.type) {
      case 'trendyol':
        await this.syncToTrendyol(marketplace, listing);
        break;

      case 'amazon':
        // TODO: Implement Amazon sync
        throw new Error('Amazon sync not implemented yet');

      case 'hepsiburada':
        // TODO: Implement Hepsiburada sync
        throw new Error('Hepsiburada sync not implemented yet');

      case 'n11':
        // TODO: Implement N11 sync
        throw new Error('N11 sync not implemented yet');

      case 'gittigidiyor':
        // TODO: Implement GittiGidiyor sync
        throw new Error('GittiGidiyor sync not implemented yet');

      case 'ciceksepeti':
        // TODO: Implement Çiçeksepeti sync
        throw new Error('Çiçeksepeti sync not implemented yet');

      case 'other':
        // For custom marketplaces, we can't sync automatically
        throw new Error('Custom marketplace sync not supported');

      default:
        throw new Error(`Unsupported marketplace type: ${marketplace.type}`);
    }
  }

  private async syncFromMarketplace(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    if (!listing.externalProductId) {
      throw new Error('Listing has no external product ID');
    }

    switch (marketplace.type) {
      case 'trendyol':
        await this.syncFromTrendyol(marketplace, listing);
        break;

      case 'amazon':
        // TODO: Implement Amazon sync
        throw new Error('Amazon sync not implemented yet');

      case 'hepsiburada':
        // TODO: Implement Hepsiburada sync
        throw new Error('Hepsiburada sync not implemented yet');

      case 'n11':
        // TODO: Implement N11 sync
        throw new Error('N11 sync not implemented yet');

      case 'gittigidiyor':
        // TODO: Implement GittiGidiyor sync
        throw new Error('GittiGidiyor sync not implemented yet');

      case 'ciceksepeti':
        // TODO: Implement Çiçeksepeti sync
        throw new Error('Çiçeksepeti sync not implemented yet');

      case 'other':
        // For custom marketplaces, we can't sync automatically
        throw new Error('Custom marketplace sync not supported');

      default:
        throw new Error(`Unsupported marketplace type: ${marketplace.type}`);
    }
  }

  private async syncBidirectional(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    // First sync from marketplace to get latest data
    try {
      await this.syncFromMarketplace(marketplace, listing);
    } catch (error) {
      // If sync from marketplace fails, continue with sync to marketplace
      console.warn(
        `Failed to sync from marketplace for listing ${listing.id}:`,
        error
      );
    }

    // Then sync to marketplace with our latest data
    await this.syncToMarketplace(marketplace, listing);
  }

  private async syncToTrendyol(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    const trendyolClient = new TrendyolClient(marketplace.credentials);

    if (!listing.externalProductId) {
      throw new Error('Listing has no external product ID');
    }

    // Update product price if needed
    if (listing.overrides.price) {
      await trendyolClient.updatePrice(
        listing.externalProductId,
        listing.overrides.price.amount
      );
    }

    // Update product stock if needed
    if (listing.overrides.stock !== undefined) {
      await trendyolClient.updateStock(
        listing.externalProductId,
        listing.overrides.stock
      );
    }

    // Update product details if needed
    if (listing.overrides.title || listing.overrides.description) {
      const updates: any = {};
      if (listing.overrides.title) {
        updates.title = listing.overrides.title;
      }
      if (listing.overrides.description) {
        updates.description = listing.overrides.description;
      }

      await trendyolClient.updateProduct(listing.externalProductId, updates);
    }
  }

  private async syncFromTrendyol(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    const trendyolClient = new TrendyolClient(marketplace.credentials);

    // Get product data from Trendyol
    const trendyolProduct = await trendyolClient.getProducts({
      barcode: `OTONIQ-${listing.productId}`, // TODO: Get actual barcode
    });

    if (trendyolProduct.length === 0) {
      throw new Error('Product not found on Trendyol');
    }

    const product = trendyolProduct[0];

    // Update listing with data from Trendyol
    await this.marketplaceListingRepository.updateOverrides(listing.id, {
      price: product.salePrice
        ? { amount: product.salePrice, currency: 'TRY' }
        : undefined,
      stock: product.quantity,
      title: product.title,
      description: product.description,
    });

    // Update listing status based on Trendyol status
    const status = product.active ? 'active' : 'inactive';
    await this.marketplaceListingRepository.updateStatus(listing.id, status);
  }
}
