import { Order } from '../../../domain/entities';
import { OrderStatus, PaymentStatus } from '../../../domain/enums/OrderStatus';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export interface ProcessRefundRequest {
  orderId: string;
  tenantId: string;
  refundAmount?: number;
  reason: string;
  processedBy?: string;
}

export interface ProcessRefundResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class ProcessRefundUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: ProcessRefundRequest): Promise<ProcessRefundResponse> {
    try {
      // Validate request
      if (!request.orderId || !request.tenantId || !request.reason) {
        return {
          success: false,
          error: 'Order ID, Tenant ID ve iade sebebi gerekli',
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

      // Check if order can be refunded
      if (!existingOrder.canBeRefunded()) {
        return {
          success: false,
          error: `Bu sipariş iade edilemez. Mevcut durum: ${existingOrder.status}, Ödeme durumu: ${existingOrder.paymentStatus}`,
        };
      }

      // Process refund
      const refundedOrder = existingOrder
        .updateStatus(OrderStatus.REFUNDED, request.reason)
        .updatePaymentStatus(PaymentStatus.REFUNDED);

      // Save updated order
      const savedOrder = await this.orderRepository.update(refundedOrder);

      // Add status history
      await this.orderRepository.addStatusHistory({
        id: crypto.randomUUID(),
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        oldStatus: existingOrder.status,
        newStatus: OrderStatus.REFUNDED,
        oldPaymentStatus: existingOrder.paymentStatus,
        newPaymentStatus: PaymentStatus.REFUNDED,
        note: `İade işlemi: ${request.reason}${request.refundAmount ? ` (Tutar: ${request.refundAmount})` : ''}`,
        changedBy: request.processedBy || 'system',
        changedAt: new Date(),
      });

      return {
        success: true,
        order: savedOrder,
      };
    } catch (error) {
      console.error('ProcessRefundUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'İade işlemi sırasında hata oluştu',
      };
    }
  }
}
