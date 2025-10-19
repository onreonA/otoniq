import { Order } from '../../../domain/entities';
import { OrderStatus, PaymentStatus } from '../../../domain/enums/OrderStatus';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export interface UpdateOrderStatusRequest {
  orderId: string;
  tenantId: string;
  newStatus: OrderStatus;
  newPaymentStatus?: PaymentStatus;
  note?: string;
  changedBy?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(
    request: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    try {
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

      // Validate status transition
      if (!existingOrder.validateStatusTransition(request.newStatus)) {
        return {
          success: false,
          error: `Geçersiz durum geçişi: ${existingOrder.status} → ${request.newStatus}`,
        };
      }

      // Update order status
      let updatedOrder = existingOrder.updateStatus(
        request.newStatus,
        request.note
      );

      // Update payment status if provided
      if (request.newPaymentStatus) {
        updatedOrder = updatedOrder.updatePaymentStatus(
          request.newPaymentStatus
        );
      }

      // Save updated order
      const savedOrder = await this.orderRepository.update(updatedOrder);

      // Add status history
      await this.orderRepository.addStatusHistory({
        id: crypto.randomUUID(),
        orderId: savedOrder.id,
        tenantId: savedOrder.tenantId,
        oldStatus: existingOrder.status,
        newStatus: request.newStatus,
        oldPaymentStatus: request.newPaymentStatus
          ? existingOrder.paymentStatus
          : undefined,
        newPaymentStatus: request.newPaymentStatus,
        note:
          request.note ||
          this.getStatusChangeNote(existingOrder.status, request.newStatus),
        changedBy: request.changedBy || 'system',
        changedAt: new Date(),
      });

      return {
        success: true,
        order: savedOrder,
      };
    } catch (error) {
      console.error('UpdateOrderStatusUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Sipariş durumu güncellenirken hata oluştu',
      };
    }
  }

  private getStatusChangeNote(
    oldStatus: OrderStatus,
    newStatus: OrderStatus
  ): string {
    const statusNotes: Record<string, string> = {
      'pending→processing': 'Sipariş işleme alındı',
      'processing→confirmed': 'Sipariş onaylandı',
      'confirmed→shipped': 'Sipariş kargoya verildi',
      'shipped→delivered': 'Sipariş teslim edildi',
      'pending→cancelled': 'Sipariş iptal edildi',
      'processing→cancelled': 'Sipariş iptal edildi',
      'confirmed→cancelled': 'Sipariş iptal edildi',
      'delivered→refunded': 'Sipariş iade edildi',
      'shipped→refunded': 'Sipariş iade edildi',
    };

    const key = `${oldStatus}→${newStatus}`;
    return (
      statusNotes[key] ||
      `Sipariş durumu ${oldStatus} → ${newStatus} olarak değiştirildi`
    );
  }
}
