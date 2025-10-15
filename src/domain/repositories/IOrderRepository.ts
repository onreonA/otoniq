/**
 * Order Repository Interface
 */

import { Order, CreateOrderDTO, UpdateOrderDTO } from '../entities/Order';

export interface IOrderRepository {
  // Order operations
  getAll(tenantId: string, filters?: OrderFilters): Promise<Order[]>;
  getById(id: string, tenantId: string): Promise<Order | null>;
  create(
    data: CreateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order>;
  update(
    id: string,
    data: UpdateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order>;
  delete(id: string, tenantId: string): Promise<void>;

  // Status operations
  updateStatus(
    id: string,
    status: string,
    tenantId: string,
    userId: string
  ): Promise<Order>;

  // Analytics
  getOrdersByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Order[]>;
  getOrderStats(tenantId: string): Promise<OrderStats>;
  getOrdersByCustomer(customerId: string, tenantId: string): Promise<Order[]>;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  channel?: string;
  customerId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
  averageOrderValue: number;
}
