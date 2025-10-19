import { Order } from '../entities/Order';
import { OrderStatusHistory } from '../entities/OrderStatusHistory';
import { OrderStatus, PaymentStatus } from '../enums/OrderStatus';

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  marketplaceConnectionId?: string;
  customerEmail?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface OrderSortOptions {
  field: 'orderDate' | 'totalAmount' | 'status' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface OrderPaginationOptions {
  page: number;
  limit: number;
}

export interface OrderListResult {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderRepository {
  /**
   * Create a new order
   */
  create(order: Order): Promise<Order>;

  /**
   * Get order by ID
   */
  getById(id: string): Promise<Order | null>;

  /**
   * Get orders with filters and pagination
   */
  getOrders(
    tenantId: string,
    filters: OrderFilters,
    pagination: { limit: number; offset: number }
  ): Promise<{ orders: Order[]; total: number }>;

  /**
   * Update order
   */
  update(order: Order): Promise<Order>;

  /**
   * Add status history entry
   */
  addStatusHistory(history: OrderStatusHistory): Promise<OrderStatusHistory>;

  /**
   * Generate next order number
   */
  generateNextOrderNumber(tenantId: string): Promise<string>;

  /**
   * Get order status history
   */
  getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]>;
}
