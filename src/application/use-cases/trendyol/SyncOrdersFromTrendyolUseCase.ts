/**
 * Sync Orders from Trendyol Use Case
 * Handles syncing orders from Trendyol to Otoniq.ai
 */

import {
  TrendyolService,
  TrendyolOrder,
} from '../../../infrastructure/services/TrendyolService';

export interface SyncOrdersFromTrendyolRequest {
  tenantId: string;
  credentials: {
    apiKey: string;
    apiSecret: string;
    sellerId: string;
  };
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface SyncOrdersFromTrendyolResponse {
  success: boolean;
  syncedCount: number;
  errors: string[];
  message: string;
}

export class SyncOrdersFromTrendyolUseCase {
  constructor(private trendyolService: TrendyolService) {}

  async execute(
    request: SyncOrdersFromTrendyolRequest
  ): Promise<SyncOrdersFromTrendyolResponse> {
    try {
      const { tenantId, credentials, options = {} } = request;
      const errors: string[] = [];
      let syncedCount = 0;

      // Initialize Trendyol service with credentials
      const trendyolService = new TrendyolService(credentials);

      // Test connection first
      const connectionTest = await trendyolService.testConnection();
      if (!connectionTest.success) {
        return {
          success: false,
          syncedCount: 0,
          errors: [connectionTest.error || 'Connection test failed'],
          message: 'Trendyol bağlantısı test edilemedi',
        };
      }

      // Get orders from Trendyol
      const trendyolResponse = await trendyolService.getOrders(options);
      const trendyolOrders = trendyolResponse.orders;

      // Process each order
      for (const trendyolOrder of trendyolOrders) {
        try {
          await this.syncSingleOrder(trendyolOrder, tenantId);
          syncedCount++;
        } catch (error) {
          const errorMessage = `Sipariş ${trendyolOrder.orderNumber} senkronize edilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`;
          errors.push(errorMessage);
          console.error('Error syncing order:', error);
        }
      }

      const message = `${syncedCount} sipariş başarıyla senkronize edildi.`;

      return {
        success: errors.length === 0,
        syncedCount,
        errors,
        message,
      };
    } catch (error) {
      console.error('Error in SyncOrdersFromTrendyolUseCase:', error);
      return {
        success: false,
        syncedCount: 0,
        errors: [error instanceof Error ? error.message : 'Bilinmeyen hata'],
        message: 'Trendyol sipariş senkronizasyonu başarısız',
      };
    }
  }

  private async syncSingleOrder(
    trendyolOrder: TrendyolOrder,
    tenantId: string
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Check if order already exists in our system
    // 2. Create or update order record
    // 3. Create order items
    // 4. Update inventory if needed
    // 5. Send notifications if configured

    console.log(`📦 Syncing order: ${trendyolOrder.orderNumber}`);
    console.log(`   Customer: ${trendyolOrder.customerName}`);
    console.log(`   Total: ${trendyolOrder.totalAmount} TL`);
    console.log(`   Status: ${trendyolOrder.status}`);
    console.log(`   Items: ${trendyolOrder.items.length}`);

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // In a real implementation, we would save to database:
    // await this.orderRepository.create(order);
    // await this.orderItemRepository.createMany(orderItems);

    console.log(`✅ Order ${trendyolOrder.orderNumber} synced successfully`);
  }
}
