import { SupabaseOrderRepository } from '../database/supabase/repositories/SupabaseOrderRepository';
import {
  CreateOrderUseCase,
  UpdateOrderStatusUseCase,
  GetOrdersUseCase,
  GetOrderUseCase,
  CancelOrderUseCase,
  ProcessRefundUseCase,
  SyncOrdersFromMarketplaceUseCase,
  SyncOrderStatusToMarketplaceUseCase,
  SyncOrderToOdooUseCase,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  CancelOrderRequest,
  CancelOrderResponse,
  ProcessRefundRequest,
  ProcessRefundResponse,
  SyncOrdersFromMarketplaceRequest,
  SyncOrdersFromMarketplaceResponse,
  SyncOrderStatusToMarketplaceRequest,
  SyncOrderStatusToMarketplaceResponse,
  SyncOrderToOdooRequest,
  SyncOrderToOdooResponse,
} from '../../application/use-cases/order';
import { Order } from '../../domain/entities';

export class OrderService {
  private orderRepository: SupabaseOrderRepository;
  private createOrderUseCase: CreateOrderUseCase;
  private updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  private getOrdersUseCase: GetOrdersUseCase;
  private getOrderUseCase: GetOrderUseCase;
  private cancelOrderUseCase: CancelOrderUseCase;
  private processRefundUseCase: ProcessRefundUseCase;
  private syncOrdersFromMarketplaceUseCase: SyncOrdersFromMarketplaceUseCase;
  private syncOrderStatusToMarketplaceUseCase: SyncOrderStatusToMarketplaceUseCase;
  private syncOrderToOdooUseCase: SyncOrderToOdooUseCase;

  constructor() {
    this.orderRepository = new SupabaseOrderRepository();
    this.createOrderUseCase = new CreateOrderUseCase(this.orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
      this.orderRepository
    );
    this.getOrdersUseCase = new GetOrdersUseCase(this.orderRepository);
    this.getOrderUseCase = new GetOrderUseCase(this.orderRepository);
    this.cancelOrderUseCase = new CancelOrderUseCase(this.orderRepository);
    this.processRefundUseCase = new ProcessRefundUseCase(this.orderRepository);
    this.syncOrdersFromMarketplaceUseCase =
      new SyncOrdersFromMarketplaceUseCase(this.orderRepository);
    this.syncOrderStatusToMarketplaceUseCase =
      new SyncOrderStatusToMarketplaceUseCase(this.orderRepository);
    this.syncOrderToOdooUseCase = new SyncOrderToOdooUseCase(
      this.orderRepository
    );
  }

  /**
   * Create a new order
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    return await this.createOrderUseCase.execute(request);
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    request: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    return await this.updateOrderStatusUseCase.execute(request);
  }

  /**
   * Get orders with filters
   */
  async getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse> {
    return await this.getOrdersUseCase.execute(request);
  }

  /**
   * Get single order
   */
  async getOrder(request: GetOrderRequest): Promise<GetOrderResponse> {
    return await this.getOrderUseCase.execute(request);
  }

  /**
   * Cancel order
   */
  async cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse> {
    return await this.cancelOrderUseCase.execute(request);
  }

  /**
   * Process refund
   */
  async processRefund(
    request: ProcessRefundRequest
  ): Promise<ProcessRefundResponse> {
    return await this.processRefundUseCase.execute(request);
  }

  /**
   * Get order status history
   */
  async getOrderStatusHistory(orderId: string) {
    try {
      return await this.orderRepository.getOrderStatusHistory(orderId);
    } catch (error) {
      console.error('OrderService.getOrderStatusHistory error:', error);
      throw error;
    }
  }

  /**
   * Get order statistics - Mock implementation for now
   */
  async getOrderStatistics(tenantId: string, dateFrom?: Date, dateTo?: Date) {
    try {
      // Mock data for now - will be implemented with proper use cases later
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0,
        },
        ordersByPaymentStatus: {
          pending: 0,
          paid: 0,
          failed: 0,
          refunded: 0,
          partially_refunded: 0,
        },
      };
    } catch (error) {
      console.error('OrderService.getOrderStatistics error:', error);
      throw error;
    }
  }

  /**
   * Sync orders from marketplace
   */
  async syncOrdersFromMarketplace(
    request: SyncOrdersFromMarketplaceRequest
  ): Promise<SyncOrdersFromMarketplaceResponse> {
    return await this.syncOrdersFromMarketplaceUseCase.execute(request);
  }

  /**
   * Sync order status to marketplace
   */
  async syncOrderStatusToMarketplace(
    request: SyncOrderStatusToMarketplaceRequest
  ): Promise<SyncOrderStatusToMarketplaceResponse> {
    return await this.syncOrderStatusToMarketplaceUseCase.execute(request);
  }

  /**
   * Sync order to Odoo
   */
  async syncOrderToOdoo(
    request: SyncOrderToOdooRequest
  ): Promise<SyncOrderToOdooResponse> {
    return await this.syncOrderToOdooUseCase.execute(request);
  }
}
