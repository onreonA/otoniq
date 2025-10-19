import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order } from '../../../domain/entities/Order';
import { OrderStatus } from '../../../domain/enums/OrderStatus';
import { TrendyolClient } from '../../../infrastructure/apis/marketplaces/trendyol/TrendyolClient';
import { MarketplaceCredentials } from '../../../domain/entities/Marketplace';

export interface SyncOrderStatusToMarketplaceRequest {
  orderId: string;
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  newStatus: OrderStatus;
  reason?: string;
}

export interface SyncOrderStatusToMarketplaceResponse {
  success: boolean;
  error?: string;
}

export class SyncOrderStatusToMarketplaceUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    request: SyncOrderStatusToMarketplaceRequest
  ): Promise<SyncOrderStatusToMarketplaceResponse> {
    const { orderId, tenantId, marketplaceCredentials, newStatus, reason } =
      request;

    try {
      // Get order from repository
      const order = await this.orderRepository.getById(orderId, tenantId);
      if (!order) {
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Check if order has external order ID (marketplace order)
      if (!order.externalOrderId) {
        return {
          success: false,
          error: 'Order is not linked to marketplace',
        };
      }

      // Initialize Trendyol client
      const trendyolClient = new TrendyolClient(marketplaceCredentials);

      // Test connection
      const connectionTest = await trendyolClient.testConnection();
      if (!connectionTest.success) {
        return {
          success: false,
          error: `Marketplace connection failed: ${connectionTest.error}`,
        };
      }

      // Map internal status to marketplace action
      const marketplaceAction =
        this.mapInternalStatusToMarketplaceAction(newStatus);

      if (!marketplaceAction) {
        return {
          success: false,
          error: `Status ${newStatus} cannot be synced to marketplace`,
        };
      }

      // Execute marketplace action
      await this.executeMarketplaceAction(
        trendyolClient,
        order.externalOrderId,
        marketplaceAction,
        reason
      );

      // Update order status in repository
      await this.orderRepository.update(orderId, {
        status: newStatus,
      });

      // Add status history
      await this.orderRepository.addStatusHistory({
        orderId,
        tenantId,
        oldStatus: order.status,
        newStatus,
        note: `Status synced to marketplace: ${marketplaceAction.action}`,
        changedBy: 'marketplace-sync',
        changedAt: new Date(),
      });

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = `Failed to sync order status to marketplace: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      console.error('Marketplace status sync error:', error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Map internal status to marketplace action
   */
  private mapInternalStatusToMarketplaceAction(
    status: OrderStatus
  ): { action: string; method: string } | null {
    const statusActionMap: Record<
      OrderStatus,
      { action: string; method: string } | null
    > = {
      [OrderStatus.PENDING]: null, // No action needed
      [OrderStatus.PROCESSING]: null, // No action needed
      [OrderStatus.CONFIRMED]: { action: 'approve', method: 'approveOrder' },
      [OrderStatus.SHIPPED]: { action: 'ship', method: 'createShipment' },
      [OrderStatus.DELIVERED]: null, // No action needed
      [OrderStatus.CANCELLED]: { action: 'reject', method: 'rejectOrder' },
      [OrderStatus.REFUNDED]: null, // No action needed
      [OrderStatus.FAILED]: { action: 'reject', method: 'rejectOrder' },
    };

    return statusActionMap[status] || null;
  }

  /**
   * Execute marketplace action
   */
  private async executeMarketplaceAction(
    trendyolClient: TrendyolClient,
    externalOrderId: string,
    action: { action: string; method: string },
    reason?: string
  ): Promise<void> {
    switch (action.method) {
      case 'approveOrder':
        await trendyolClient.approveOrder(externalOrderId);
        break;

      case 'rejectOrder':
        await trendyolClient.rejectOrder(
          externalOrderId,
          reason || 'Order rejected'
        );
        break;

      case 'createShipment':
        // For shipment, we need additional data
        // This would typically come from the order or be provided separately
        await trendyolClient.createShipment(externalOrderId, {
          trackingNumber: `TRK-${Date.now()}`, // Generate tracking number
          carrier: 'Default Carrier',
          trackingUrl: `https://tracking.example.com/TRK-${Date.now()}`,
        });
        break;

      default:
        throw new Error(`Unknown marketplace action: ${action.method}`);
    }
  }
}
