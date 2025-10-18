import {
  Marketplace,
  MarketplaceType,
} from '../../../domain/entities/Marketplace';
import { IMarketplaceRepository } from '../../../domain/repositories/IMarketplaceRepository';
import { TrendyolClient } from '../../../infrastructure/apis/marketplaces/trendyol/TrendyolClient';

export interface ConnectMarketplaceRequest {
  tenantId: string;
  type: MarketplaceType;
  name: string;
  credentials: {
    apiKey: string;
    apiSecret: string;
    sellerId?: string;
    [key: string]: any;
  };
  settings?: {
    autoSync?: boolean;
    syncInterval?: number;
    priceMarkup?: number;
    stockBuffer?: number;
    [key: string]: any;
  };
}

export interface ConnectMarketplaceResponse {
  success: boolean;
  marketplace?: Marketplace;
  error?: string;
}

export class ConnectMarketplaceUseCase {
  constructor(private marketplaceRepository: IMarketplaceRepository) {}

  async execute(
    request: ConnectMarketplaceRequest
  ): Promise<ConnectMarketplaceResponse> {
    try {
      // Validate request
      const validation = this.validateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Check if marketplace connection already exists
      const existingConnection =
        await this.marketplaceRepository.findByTenantAndType(
          request.tenantId,
          request.type
        );

      if (existingConnection) {
        return {
          success: false,
          error: `${request.type} marketplace connection already exists for this tenant`,
        };
      }

      // Test connection before creating
      const connectionTest = await this.testMarketplaceConnection(
        request.type,
        request.credentials
      );
      if (!connectionTest.success) {
        return {
          success: false,
          error: `Connection test failed: ${connectionTest.error}`,
        };
      }

      // Create marketplace connection
      const marketplace = await this.marketplaceRepository.create({
        tenantId: request.tenantId,
        type: request.type,
        name: request.name,
        credentials: request.credentials,
        settings: request.settings,
      });

      return {
        success: true,
        marketplace,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private validateRequest(request: ConnectMarketplaceRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.tenantId) {
      errors.push('Tenant ID is required');
    }

    if (!request.type) {
      errors.push('Marketplace type is required');
    }

    if (!request.name) {
      errors.push('Marketplace name is required');
    }

    if (!request.credentials) {
      errors.push('Credentials are required');
    } else {
      if (!request.credentials.apiKey) {
        errors.push('API Key is required');
      }

      if (!request.credentials.apiSecret) {
        errors.push('API Secret is required');
      }

      // Marketplace-specific validations
      switch (request.type) {
        case 'trendyol':
          if (!request.credentials.sellerId) {
            errors.push('Seller ID is required for Trendyol');
          }
          break;
        case 'amazon':
          if (!request.credentials.accessToken) {
            errors.push('Access Token is required for Amazon');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async testMarketplaceConnection(
    type: MarketplaceType,
    credentials: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      switch (type) {
        case 'trendyol': {
          const trendyolClient = new TrendyolClient(credentials);
          return await trendyolClient.testConnection();
        }

        case 'amazon': {
          // TODO: Implement Amazon connection test
          return { success: true };
        }

        case 'hepsiburada': {
          // TODO: Implement Hepsiburada connection test
          return { success: true };
        }

        case 'n11': {
          // TODO: Implement N11 connection test
          return { success: true };
        }

        case 'gittigidiyor': {
          // TODO: Implement GittiGidiyor connection test
          return { success: true };
        }

        case 'ciceksepeti': {
          // TODO: Implement Çiçeksepeti connection test
          return { success: true };
        }

        case 'other': {
          // For custom marketplaces, we can't test the connection
          return { success: true };
        }

        default:
          return { success: false, error: 'Unsupported marketplace type' };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }
}
