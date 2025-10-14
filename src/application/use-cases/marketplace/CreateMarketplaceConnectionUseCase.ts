/**
 * Create Marketplace Connection Use Case
 */

import { MarketplaceConnection } from '../../../domain/entities/MarketplaceConnection';
import { MarketplaceConnectionRepository } from '../../../domain/repositories/MarketplaceConnectionRepository';

export interface CreateMarketplaceConnectionRequest {
  tenantId: string;
  marketplace: MarketplaceConnection['marketplace'];
  name: string;
  credentials: any;
  config: any;
  syncEnabled?: boolean;
  autoSyncInterval?: number;
}

export interface CreateMarketplaceConnectionResponse {
  success: boolean;
  connection?: MarketplaceConnection;
  error?: string;
}

export class CreateMarketplaceConnectionUseCase {
  constructor(
    private marketplaceConnectionRepository: MarketplaceConnectionRepository
  ) {}

  async execute(
    request: CreateMarketplaceConnectionRequest
  ): Promise<CreateMarketplaceConnectionResponse> {
    try {
      // Validate request
      if (!request.tenantId) {
        return {
          success: false,
          error: 'Tenant ID is required',
        };
      }

      if (!request.marketplace) {
        return {
          success: false,
          error: 'Marketplace type is required',
        };
      }

      if (!request.name || request.name.trim().length === 0) {
        return {
          success: false,
          error: 'Connection name is required',
        };
      }

      if (
        !request.credentials ||
        Object.keys(request.credentials).length === 0
      ) {
        return {
          success: false,
          error: 'Credentials are required',
        };
      }

      if (!request.config || !request.config.apiUrl) {
        return {
          success: false,
          error: 'API configuration is required',
        };
      }

      // Check if connection name already exists for this tenant
      const nameExists = await this.marketplaceConnectionRepository.nameExists(
        request.tenantId,
        request.name.trim()
      );

      if (nameExists) {
        return {
          success: false,
          error: 'A connection with this name already exists for this tenant',
        };
      }

      // Validate marketplace-specific credentials
      const credentialValidation = this.validateCredentials(
        request.marketplace,
        request.credentials
      );
      if (!credentialValidation.valid) {
        return {
          success: false,
          error: credentialValidation.error,
        };
      }

      // Create marketplace connection entity
      const connection = new MarketplaceConnection(
        crypto.randomUUID(),
        request.tenantId,
        request.marketplace,
        request.name.trim(),
        request.credentials,
        request.config,
        'testing', // Start with testing status
        undefined, // last_sync_at
        undefined, // last_error
        request.syncEnabled ?? true,
        request.autoSyncInterval,
        new Date(),
        new Date()
      );

      // Save to repository
      const savedConnection =
        await this.marketplaceConnectionRepository.create(connection);

      return {
        success: true,
        connection: savedConnection,
      };
    } catch (error) {
      console.error('Error creating marketplace connection:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create marketplace connection',
      };
    }
  }

  /**
   * Validate marketplace-specific credentials
   */
  private validateCredentials(
    marketplace: MarketplaceConnection['marketplace'],
    credentials: any
  ): { valid: boolean; error?: string } {
    switch (marketplace) {
      case 'trendyol':
        if (
          !credentials.apiKey ||
          !credentials.apiSecret ||
          !credentials.sellerId
        ) {
          return {
            valid: false,
            error:
              'Trendyol credentials must include apiKey, apiSecret, and sellerId',
          };
        }
        break;

      case 'amazon':
        if (
          !credentials.accessKeyId ||
          !credentials.secretAccessKey ||
          !credentials.merchantId
        ) {
          return {
            valid: false,
            error:
              'Amazon credentials must include accessKeyId, secretAccessKey, and merchantId',
          };
        }
        break;

      case 'hepsiburada':
        if (!credentials.username || !credentials.password) {
          return {
            valid: false,
            error: 'Hepsiburada credentials must include username and password',
          };
        }
        break;

      case 'n11':
        if (!credentials.apiKey || !credentials.apiSecret) {
          return {
            valid: false,
            error: 'N11 credentials must include apiKey and apiSecret',
          };
        }
        break;

      case 'gittigidiyor':
        if (!credentials.apiKey || !credentials.apiSecret) {
          return {
            valid: false,
            error: 'GittiGidiyor credentials must include apiKey and apiSecret',
          };
        }
        break;

      case 'ciceksepeti':
        if (!credentials.apiKey || !credentials.apiSecret) {
          return {
            valid: false,
            error: 'Çiçeksepeti credentials must include apiKey and apiSecret',
          };
        }
        break;

      default:
        return {
          valid: false,
          error: 'Unsupported marketplace type',
        };
    }

    return { valid: true };
  }
}
