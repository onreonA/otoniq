import { Order } from '../../../domain/entities';
import {
  IOrderRepository,
  OrderFilters,
  OrderSortOptions,
  OrderPaginationOptions,
} from '../../../domain/repositories/IOrderRepository';

export interface GetOrdersRequest {
  tenantId: string;
  filters?: OrderFilters;
  sort?: OrderSortOptions;
  pagination?: OrderPaginationOptions;
}

export interface GetOrdersResponse {
  success: boolean;
  orders?: Order[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
}

export class GetOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    try {
      // Validate request
      if (!request.tenantId) {
        return {
          success: false,
          error: 'Tenant ID gerekli',
        };
      }

      // Set default pagination
      const pagination: OrderPaginationOptions = {
        page: request.pagination?.page || 1,
        limit: request.pagination?.limit || 20,
      };

      // Set default sort
      const sort: OrderSortOptions = {
        field: request.sort?.field || 'orderDate',
        direction: request.sort?.direction || 'desc',
      };

      // Get orders
      const result = await this.orderRepository.getOrders(
        request.tenantId,
        request.filters,
        sort,
        pagination
      );

      return {
        success: true,
        orders: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      };
    } catch (error) {
      console.error('GetOrdersUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Siparişler getirilirken hata oluştu',
      };
    }
  }
}
