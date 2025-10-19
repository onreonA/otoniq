import { Order } from '../../../domain/entities';
import { OrderStatus } from '../../../domain/enums/OrderStatus';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export interface CancelOrderRequest {
  orderId: string;
  tenantId: string;
  reason?: string;
  cancelledBy?: string;
}

export interface CancelOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class CancelOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: CancelOrderRequest): Promise<CancelOrderResponse> {
    try {
      // Validate request
      if (!request.orderId || !request.tenantId) {
        return {
          success: false,
          error: 'Order ID ve Tenant ID gerekli',
        };
      }

      // Get existing order
      const existingOrder = await this.orderRepository.getById(request.orderId);
      if (!existingOrder) {
        return {
          success: false,
          error: 'Sipariş bulunamadı',
        };
      }

      // Validate tenant access
      if (existingOrder.tenantId !== request.tenantId) {
        return {
          success: false,
          error: 'Bu siparişe erişim yetkiniz yok',
        };
      }

      // Check if order can be cancelled
      if (!existingOrder.canBeCancelled()) {
        return {
          success: false,
          error: `Bu sipariş iptal edilemez. Mevcut durum: ${existingOrder.status}`,
        };
      }

      // Cancel order
      const cancelledOrder = existingOrder.updateStatus(
        OrderStatus.CANCELLED,
        request.reason
      );

      // Save updated order
      const savedOrder = await this.orderRepository.update(cancelledOrder);

      // Add status history
      await this.orderRepository.addStatusHistory({
        id: crypto.randomUUID(),
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        oldStatus: existingOrder.status,
        newStatus: OrderStatus.CANCELLED,
        note: request.reason || 'Sipariş iptal edildi',
        changedBy: request.cancelledBy || 'system',
        changedAt: new Date(),
      });

      return {
        success: true,
        order: savedOrder,
      };
    } catch (error) {
      console.error('CancelOrderUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Sipariş iptal edilirken hata oluştu',
      };
    }
  }
}
