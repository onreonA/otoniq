import { MarketplaceListing } from '../../../domain/entities/MarketplaceListing';
import { IMarketplaceListingRepository } from '../../../domain/repositories/IMarketplaceListingRepository';
import { IMarketplaceRepository } from '../../../domain/repositories/IMarketplaceRepository';
import { TrendyolClient } from '../../../infrastructure/apis/marketplaces/trendyol/TrendyolClient';
import { Money } from '../../../domain/value-objects/Money';

export interface ListProductToMarketplaceRequest {
  productId: string;
  marketplaceConnectionId: string;
  overrides?: {
    price?: number;
    stock?: number;
    title?: string;
    description?: string;
  };
  autoSync?: boolean;
  syncFrequency?: number;
}

export interface ListProductToMarketplaceResponse {
  success: boolean;
  listing?: MarketplaceListing;
  error?: string;
}

export class ListProductToMarketplaceUseCase {
  constructor(
    private marketplaceListingRepository: IMarketplaceListingRepository,
    private marketplaceRepository: IMarketplaceRepository
  ) {}

  async execute(
    request: ListProductToMarketplaceRequest
  ): Promise<ListProductToMarketplaceResponse> {
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Check if listing already exists
      const existingListing =
        await this.marketplaceListingRepository.findByProductAndMarketplace(
          request.productId,
          request.marketplaceConnectionId
        );

      if (existingListing) {
        return {
          success: false,
          error: 'Product is already listed on this marketplace',
        };
      }

      // Get marketplace connection
      const marketplace = await this.marketplaceRepository.findById(
        request.marketplaceConnectionId
      );
      if (!marketplace) {
        return {
          success: false,
          error: 'Marketplace connection not found',
        };
      }

      // Check if marketplace is active
      if (!marketplace.isActive()) {
        return {
          success: false,
          error: 'Marketplace connection is not active',
        };
      }

      // Create listing in our system
      const listing = await this.marketplaceListingRepository.create({
        productId: request.productId,
        marketplaceConnectionId: request.marketplaceConnectionId,
        overrides: request.overrides
          ? {
              price: request.overrides.price
                ? new Money(request.overrides.price, 'TRY')
                : undefined,
              stock: request.overrides.stock,
              title: request.overrides.title,
              description: request.overrides.description,
            }
          : undefined,
        autoSync: request.autoSync ?? true,
        syncFrequency: request.syncFrequency ?? 3600,
      });

      // Try to create listing on marketplace
      try {
        await this.createListingOnMarketplace(marketplace, listing);

        // Update listing status to active
        const updatedListing =
          await this.marketplaceListingRepository.updateStatus(
            listing.id,
            'active'
          );

        return {
          success: true,
          listing: updatedListing,
        };
      } catch (error) {
        // Update listing status to error
        await this.marketplaceListingRepository.updateStatus(
          listing.id,
          'error',
          error instanceof Error ? error.message : 'Unknown error'
        );

        return {
          success: false,
          error: `Failed to create listing on marketplace: ${error}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private validateRequest(request: ListProductToMarketplaceRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.productId) {
      errors.push('Product ID is required');
    }

    if (!request.marketplaceConnectionId) {
      errors.push('Marketplace connection ID is required');
    }

    if (request.overrides?.price !== undefined && request.overrides.price < 0) {
      errors.push('Price cannot be negative');
    }

    if (request.overrides?.stock !== undefined && request.overrides.stock < 0) {
      errors.push('Stock cannot be negative');
    }

    if (request.syncFrequency !== undefined && request.syncFrequency < 60) {
      errors.push('Sync frequency must be at least 60 seconds');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async createListingOnMarketplace(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    switch (marketplace.type) {
      case 'trendyol':
        await this.createTrendyolListing(marketplace, listing);
        break;

      case 'amazon':
        // TODO: Implement Amazon listing creation
        throw new Error('Amazon listing creation not implemented yet');

      case 'hepsiburada':
        // TODO: Implement Hepsiburada listing creation
        throw new Error('Hepsiburada listing creation not implemented yet');

      case 'n11':
        // TODO: Implement N11 listing creation
        throw new Error('N11 listing creation not implemented yet');

      case 'gittigidiyor':
        // TODO: Implement GittiGidiyor listing creation
        throw new Error('GittiGidiyor listing creation not implemented yet');

      case 'ciceksepeti':
        // TODO: Implement Çiçeksepeti listing creation
        throw new Error('Çiçeksepeti listing creation not implemented yet');

      case 'other':
        // For custom marketplaces, we can't create listings automatically
        throw new Error('Custom marketplace listing creation not supported');

      default:
        throw new Error(`Unsupported marketplace type: ${marketplace.type}`);
    }
  }

  private async createTrendyolListing(
    marketplace: any,
    listing: MarketplaceListing
  ): Promise<void> {
    const trendyolClient = new TrendyolClient(marketplace.credentials);

    // TODO: Get product details from our system
    // For now, we'll create a mock product
    const productData = {
      barcode: `OTONIQ-${listing.productId}`,
      title: listing.getEffectiveTitle('Product Title'),
      productMainId: listing.productId,
      brandId: 1, // TODO: Get from product
      categoryId: 1, // TODO: Get from product category mapping
      quantity: listing.getEffectiveStock(0),
      stockCode: `SKU-${listing.productId}`,
      dimensionalWeight: 1,
      description: listing.getEffectiveDescription('Product Description'),
      currencyType: 'TRY',
      listPrice: listing.getEffectivePrice(new Money(0, 'TRY')).amount,
      salePrice: listing.getEffectivePrice(new Money(0, 'TRY')).amount,
      vatRate: 18,
      cargoCompanyId: 1,
      images: [], // TODO: Get from product images
      attributes: [], // TODO: Get from product attributes
      approved: false,
      active: true,
    };

    const trendyolProduct = await trendyolClient.createProduct(productData);

    // Update listing with external IDs
    await this.marketplaceListingRepository.update(listing.id, {
      externalProductId: trendyolProduct.id,
      externalUrl: `https://www.trendyol.com/product/${trendyolProduct.id}`,
    });
  }
}
