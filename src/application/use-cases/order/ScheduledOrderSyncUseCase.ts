import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderService } from '../../../infrastructure/services/OrderService';
import { MarketplaceCredentials } from '../../../domain/entities/Marketplace';

export interface ScheduledOrderSyncRequest {
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  syncOptions: {
    frequency: 'hourly' | 'daily' | 'weekly';
    startDate?: Date;
    endDate?: Date;
    maxOrdersPerSync?: number;
    retryOnFailure?: boolean;
    maxRetries?: number;
  };
}

export interface ScheduledOrderSyncResponse {
  success: boolean;
  syncId: string;
  totalProcessed: number;
  totalSynced: number;
  errors: string[];
  nextSyncAt: Date;
}

export class ScheduledOrderSyncUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private orderService: OrderService
  ) {}

  async execute(
    request: ScheduledOrderSyncRequest
  ): Promise<ScheduledOrderSyncResponse> {
    const { tenantId, marketplaceCredentials, syncOptions } = request;
    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🔄 Starting scheduled order sync: ${syncId}`);

      // Calculate date range for sync
      const dateRange = this.calculateDateRange(syncOptions);

      // Sync orders from marketplace
      const syncResult = await this.orderService.syncOrdersFromMarketplace({
        tenantId,
        marketplaceCredentials,
        filters: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: 0,
          size: syncOptions.maxOrdersPerSync || 100,
        },
      });

      // Calculate next sync time
      const nextSyncAt = this.calculateNextSyncTime(syncOptions.frequency);

      // Log sync results
      console.log(`✅ Scheduled sync completed: ${syncId}`);
      console.log(
        `📊 Processed: ${syncResult.totalProcessed}, Synced: ${syncResult.totalSynced}`
      );
      console.log(`⏰ Next sync: ${nextSyncAt.toISOString()}`);

      return {
        success: true,
        syncId,
        totalProcessed: syncResult.totalProcessed,
        totalSynced: syncResult.totalSynced,
        errors: syncResult.errors,
        nextSyncAt,
      };
    } catch (error) {
      const errorMessage = `Scheduled sync failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      console.error(`❌ Scheduled sync error: ${errorMessage}`);

      return {
        success: false,
        syncId,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [errorMessage],
        nextSyncAt: this.calculateNextSyncTime(syncOptions.frequency),
      };
    }
  }

  /**
   * Calculate date range for sync based on frequency
   */
  private calculateDateRange(
    syncOptions: ScheduledOrderSyncRequest['syncOptions']
  ): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (syncOptions.frequency) {
      case 'hourly':
        startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default to 1 day
    }

    // Use custom date range if provided
    if (syncOptions.startDate) {
      startDate = syncOptions.startDate;
    }
    if (syncOptions.endDate) {
      endDate = syncOptions.endDate;
    }

    return { startDate, endDate };
  }

  /**
   * Calculate next sync time based on frequency
   */
  private calculateNextSyncTime(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 1 day
    }
  }
}
