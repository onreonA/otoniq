/**
 * Order Service
 * Business logic for order operations
 */

import {
  IOrderRepository,
  OrderFilters,
  OrderStats,
} from '../../domain/repositories/IOrderRepository';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
} from '../../domain/entities/Order';

export class OrderService {
  constructor(private repository: IOrderRepository) {}

  async getAll(tenantId: string, filters?: OrderFilters): Promise<Order[]> {
    return this.repository.getAll(tenantId, filters);
  }

  async getById(id: string, tenantId: string): Promise<Order | null> {
    return this.repository.getById(id, tenantId);
  }

  async create(
    data: CreateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    // Validate order data
    if (!data.orderNumber) {
      throw new Error('Order number is required');
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    return this.repository.create(data, tenantId, userId);
  }

  async update(
    id: string,
    data: UpdateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    // Validate update data
    if (data.totalAmount !== undefined && data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    return this.repository.update(id, data, tenantId, userId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    // Check if order can be deleted (e.g., only pending orders)
    const order = await this.repository.getById(id, tenantId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be deleted');
    }

    return this.repository.delete(id, tenantId);
  }

  async updateStatus(
    id: string,
    status: string,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    // Get current order
    const order = await this.repository.getById(id, tenantId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transitions
    if (order.status === 'delivered' && status !== 'delivered') {
      throw new Error('Cannot change status of delivered order');
    }

    if (order.status === 'cancelled' && status !== 'cancelled') {
      throw new Error('Cannot change status of cancelled order');
    }

    return this.repository.updateStatus(id, status, tenantId, userId);
  }

  async getOrdersByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Order[]> {
    return this.repository.getOrdersByDateRange(tenantId, startDate, endDate);
  }

  async getOrderStats(tenantId: string): Promise<OrderStats> {
    return this.repository.getOrderStats(tenantId);
  }

  async getOrdersByCustomer(
    customerId: string,
    tenantId: string
  ): Promise<Order[]> {
    return this.repository.getOrdersByCustomer(customerId, tenantId);
  }

  async bulkUpdateStatus(
    orderIds: string[],
    status: string,
    tenantId: string,
    userId: string
  ): Promise<Order[]> {
    const results: Order[] = [];

    for (const id of orderIds) {
      try {
        const order = await this.updateStatus(id, status, tenantId, userId);
        results.push(order);
      } catch (error) {
        console.error(`Failed to update order ${id}:`, error);
      }
    }

    return results;
  }
}
