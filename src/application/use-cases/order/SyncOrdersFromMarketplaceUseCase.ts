import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order } from '../../../domain/entities/Order';
import { OrderItem } from '../../../domain/entities/OrderItem';
import { Money } from '../../../domain/value-objects/Money';
import { OrderStatus, PaymentStatus } from '../../../domain/enums/OrderStatus';
import {
  TrendyolClient,
  TrendyolOrder,
} from '../../../infrastructure/apis/marketplaces/trendyol/TrendyolClient';
import { MarketplaceCredentials } from '../../../domain/entities/Marketplace';

export interface SyncOrdersFromMarketplaceRequest {
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    size?: number;
  };
}

export interface SyncOrdersFromMarketplaceResponse {
  success: boolean;
  syncedOrders: Order[];
  errors: string[];
  totalProcessed: number;
  totalSynced: number;
}

export class SyncOrdersFromMarketplaceUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    request: SyncOrdersFromMarketplaceRequest
  ): Promise<SyncOrdersFromMarketplaceResponse> {
    const { tenantId, marketplaceCredentials, filters } = request;
    const syncedOrders: Order[] = [];
    const errors: string[] = [];
    let totalProcessed = 0;
    let totalSynced = 0;

    try {
      // Initialize Trendyol client
      const trendyolClient = new TrendyolClient(marketplaceCredentials);

      // Test connection first
      const connectionTest = await trendyolClient.testConnection();
      if (!connectionTest.success) {
        throw new Error(
          `Marketplace connection failed: ${connectionTest.error}`
        );
      }

      // Get orders from Trendyol
      const trendyolOrders = await trendyolClient.getOrders({
        page: filters?.page || 0,
        size: filters?.size || 50,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
        status: filters?.status,
      });

      totalProcessed = trendyolOrders.length;

      // Process each order
      for (const trendyolOrder of trendyolOrders) {
        try {
          // Check if order already exists
          const existingOrder = await this.orderRepository.getById(
            trendyolOrder.id,
            tenantId
          );

          if (existingOrder) {
            // Update existing order if needed
            const updatedOrder = await this.updateExistingOrder(
              existingOrder,
              trendyolOrder,
              tenantId
            );
            if (updatedOrder) {
              syncedOrders.push(updatedOrder);
              totalSynced++;
            }
          } else {
            // Create new order
            const newOrder = await this.createOrderFromTrendyol(
              trendyolOrder,
              tenantId
            );
            syncedOrders.push(newOrder);
            totalSynced++;
          }
        } catch (orderError) {
          const errorMessage = `Failed to process order ${trendyolOrder.orderNumber}: ${
            orderError instanceof Error ? orderError.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Order sync error:', orderError);
        }
      }

      return {
        success: true,
        syncedOrders,
        errors,
        totalProcessed,
        totalSynced,
      };
    } catch (error) {
      const errorMessage = `Marketplace sync failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      errors.push(errorMessage);
      console.error('Marketplace sync error:', error);

      return {
        success: false,
        syncedOrders,
        errors,
        totalProcessed,
        totalSynced,
      };
    }
  }

  /**
   * Create internal order from Trendyol order
   */
  private async createOrderFromTrendyol(
    trendyolOrder: TrendyolOrder,
    tenantId: string
  ): Promise<Order> {
    // Map Trendyol order items to internal order items
    const orderItems = trendyolOrder.items.map(
      (item, index) =>
        new OrderItem(
          `${trendyolOrder.id}-item-${index}`,
          item.productId,
          item.productName,
          item.productId, // SKU
          item.quantity,
          new Money(item.price, trendyolOrder.currency),
          {
            name: 'Variant',
            value: 'Default',
          }
        )
    );

    // Map Trendyol status to internal status
    const orderStatus = this.mapTrendyolStatusToInternal(trendyolOrder.status);
    const paymentStatus = this.mapTrendyolPaymentStatusToInternal(
      trendyolOrder.paymentStatus
    );

    // Create internal order
    const order = new Order(
      trendyolOrder.id,
      tenantId,
      trendyolOrder.orderNumber,
      new Date(trendyolOrder.orderDate),
      orderStatus,
      paymentStatus,
      {
        name: `${trendyolOrder.customerFirstName} ${trendyolOrder.customerLastName}`,
        email: trendyolOrder.customerEmail,
        phone: trendyolOrder.customerPhone,
        address: {
          street: trendyolOrder.shippingAddress.address1,
          city: trendyolOrder.shippingAddress.city,
          state: trendyolOrder.shippingAddress.state,
          postalCode: trendyolOrder.shippingAddress.postalCode,
          country: trendyolOrder.shippingAddress.country,
        },
      },
      orderItems,
      new Money(trendyolOrder.subtotal, trendyolOrder.currency),
      new Money(trendyolOrder.tax, trendyolOrder.currency),
      new Money(trendyolOrder.shippingCost, trendyolOrder.currency),
      new Money(0, trendyolOrder.currency), // Discount - not provided by Trendyol
      new Money(trendyolOrder.totalAmount, trendyolOrder.currency),
      trendyolOrder.currency,
      trendyolOrder.orderNumber, // External order ID
      undefined, // Customer note
      undefined, // Internal note
      false, // N8N workflow triggered
      undefined, // Odoo sale order ID
      undefined // Odoo invoice ID
    );

    // Save to repository
    await this.orderRepository.create(order);

    return order;
  }

  /**
   * Update existing order with Trendyol data
   */
  private async updateExistingOrder(
    existingOrder: Order,
    trendyolOrder: TrendyolOrder,
    tenantId: string
  ): Promise<Order | null> {
    // Check if order needs updating
    const needsUpdate = this.orderNeedsUpdate(existingOrder, trendyolOrder);

    if (!needsUpdate) {
      return null;
    }

    // Update order status if different
    const newStatus = this.mapTrendyolStatusToInternal(trendyolOrder.status);
    const newPaymentStatus = this.mapTrendyolPaymentStatusToInternal(
      trendyolOrder.paymentStatus
    );

    if (existingOrder.status !== newStatus) {
      await this.orderRepository.update(existingOrder.id, {
        status: newStatus,
      });

      // Add status history
      await this.orderRepository.addStatusHistory({
        orderId: existingOrder.id,
        tenantId,
        oldStatus: existingOrder.status,
        newStatus,
        note: `Status updated from marketplace: ${trendyolOrder.status}`,
        changedBy: 'marketplace-sync',
        changedAt: new Date(),
      });
    }

    if (existingOrder.paymentStatus !== newPaymentStatus) {
      await this.orderRepository.update(existingOrder.id, {
        paymentStatus: newPaymentStatus,
      });
    }

    // Return updated order
    return await this.orderRepository.getById(existingOrder.id, tenantId);
  }

  /**
   * Check if order needs updating
   */
  private orderNeedsUpdate(
    existingOrder: Order,
    trendyolOrder: TrendyolOrder
  ): boolean {
    const newStatus = this.mapTrendyolStatusToInternal(trendyolOrder.status);
    const newPaymentStatus = this.mapTrendyolPaymentStatusToInternal(
      trendyolOrder.paymentStatus
    );

    return (
      existingOrder.status !== newStatus ||
      existingOrder.paymentStatus !== newPaymentStatus
    );
  }

  /**
   * Map Trendyol status to internal status
   */
  private mapTrendyolStatusToInternal(trendyolStatus: string): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      Created: OrderStatus.PENDING,
      Pending: OrderStatus.PENDING,
      Approved: OrderStatus.CONFIRMED,
      Confirmed: OrderStatus.CONFIRMED,
      Packed: OrderStatus.PROCESSING,
      Shipped: OrderStatus.SHIPPED,
      Delivered: OrderStatus.DELIVERED,
      Cancelled: OrderStatus.CANCELLED,
      Returned: OrderStatus.REFUNDED,
      Failed: OrderStatus.FAILED,
    };

    return statusMap[trendyolStatus] || OrderStatus.PENDING;
  }

  /**
   * Map Trendyol payment status to internal payment status
   */
  private mapTrendyolPaymentStatusToInternal(
    trendyolPaymentStatus: string
  ): PaymentStatus {
    const paymentStatusMap: Record<string, PaymentStatus> = {
      Pending: PaymentStatus.PENDING,
      Paid: PaymentStatus.PAID,
      Failed: PaymentStatus.FAILED,
      Refunded: PaymentStatus.REFUNDED,
      Cancelled: PaymentStatus.CANCELLED,
    };

    return paymentStatusMap[trendyolPaymentStatus] || PaymentStatus.PENDING;
  }
}
