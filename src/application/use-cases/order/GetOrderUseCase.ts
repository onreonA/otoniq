import { Order } from '../../../domain/entities';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';

export interface GetOrderRequest {
  orderId: string;
  tenantId: string;
}

export interface GetOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
}

export class GetOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: GetOrderRequest): Promise<GetOrderResponse> {
    try {
      // Validate request
      if (!request.orderId || !request.tenantId) {
        return {
          success: false,
          error: 'Order ID ve Tenant ID gerekli',
        };
      }

      // Get order
      const order = await this.orderRepository.getById(request.orderId);
      if (!order) {
        return {
          success: false,
          error: 'Sipariş bulunamadı',
        };
      }

      // Validate tenant access
      if (order.tenantId !== request.tenantId) {
        return {
          success: false,
          error: 'Bu siparişe erişim yetkiniz yok',
        };
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('GetOrderUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Sipariş getirilirken hata oluştu',
      };
    }
  }
}
