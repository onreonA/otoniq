import {
  MarketplaceOrder,
  OrderStatus,
  PaymentStatus,
  SyncStatus,
} from '../entities/MarketplaceOrder';

export interface MarketplaceOrderFilters {
  tenantId?: string;
  marketplaceConnectionId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  syncStatus?: SyncStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface MarketplaceOrderCreateRequest {
  tenantId: string;
  marketplaceConnectionId: string;
  externalOrderId: string;
  externalOrderNumber?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  customerInfo: any;
  items: any[];
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  commission?: number;
  totalAmount: number;
  currency?: string;
  shippingInfo?: any;
  orderDate: Date;
}

export interface MarketplaceOrderUpdateRequest {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingInfo?: any;
  syncStatus?: SyncStatus;
  syncError?: string;
}

export interface IMarketplaceOrderRepository {
  /**
   * Create a new marketplace order
   */
  create(request: MarketplaceOrderCreateRequest): Promise<MarketplaceOrder>;

  /**
   * Get order by ID
   */
  findById(id: string): Promise<MarketplaceOrder | null>;

  /**
   * Get order by external ID
   */
  findByExternalId(
    marketplaceConnectionId: string,
    externalOrderId: string
  ): Promise<MarketplaceOrder | null>;

  /**
   * Get all orders with filters
   */
  findMany(filters: MarketplaceOrderFilters): Promise<MarketplaceOrder[]>;

  /**
   * Get orders for a marketplace
   */
  findByMarketplace(
    marketplaceConnectionId: string,
    filters?: MarketplaceOrderFilters
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders for a tenant
   */
  findByTenant(
    tenantId: string,
    filters?: MarketplaceOrderFilters
  ): Promise<MarketplaceOrder[]>;

  /**
   * Update order
   */
  update(
    id: string,
    updates: MarketplaceOrderUpdateRequest
  ): Promise<MarketplaceOrder>;

  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: OrderStatus): Promise<MarketplaceOrder>;

  /**
   * Update payment status
   */
  updatePaymentStatus(
    id: string,
    status: PaymentStatus
  ): Promise<MarketplaceOrder>;

  /**
   * Update shipping info
   */
  updateShippingInfo(id: string, shippingInfo: any): Promise<MarketplaceOrder>;

  /**
   * Update sync status
   */
  updateSyncStatus(
    id: string,
    status: SyncStatus,
    error?: string
  ): Promise<MarketplaceOrder>;

  /**
   * Delete order
   */
  delete(id: string): Promise<void>;

  /**
   * Get orders that need sync
   */
  getOrdersForSync(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get order statistics
   */
  getOrderStats(
    marketplaceConnectionId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    ordersByPaymentStatus: Record<PaymentStatus, number>;
  }>;

  /**
   * Get orders by status
   */
  getOrdersByStatus(
    status: OrderStatus,
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders by payment status
   */
  getOrdersByPaymentStatus(
    status: PaymentStatus,
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders with sync errors
   */
  getOrdersWithSyncErrors(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders that can be processed
   */
  getOrdersForProcessing(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders that can be shipped
   */
  getOrdersForShipping(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders that can be cancelled
   */
  getOrdersForCancellation(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders that can be refunded
   */
  getOrdersForRefund(
    marketplaceConnectionId?: string
  ): Promise<MarketplaceOrder[]>;

  /**
   * Bulk update order status
   */
  bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<void>;

  /**
   * Bulk update payment status
   */
  bulkUpdatePaymentStatus(
    orderIds: string[],
    status: PaymentStatus
  ): Promise<void>;

  /**
   * Get order performance metrics
   */
  getPerformanceMetrics(
    tenantId: string,
    days: number
  ): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topMarketplace: string;
    ordersByDay: Array<{ date: string; orders: number; revenue: number }>;
  }>;

  /**
   * Get orders for a specific date range
   */
  getOrdersByDateRange(
    tenantId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<MarketplaceOrder[]>;

  /**
   * Get orders for a specific customer
   */
  getOrdersByCustomer(
    tenantId: string,
    customerEmail: string
  ): Promise<MarketplaceOrder[]>;
}
