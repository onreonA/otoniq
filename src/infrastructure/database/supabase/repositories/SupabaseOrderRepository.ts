/**
 * Supabase Order Repository Implementation
 */

import { supabase } from '../client';
import {
  IOrderRepository,
  OrderFilters,
  OrderStats,
} from '../../../../domain/repositories/IOrderRepository';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
} from '../../../../domain/entities/Order';

export class SupabaseOrderRepository implements IOrderRepository {
  async getAll(tenantId: string, filters: OrderFilters = {}): Promise<Order[]> {
    let query = supabase.from('orders').select('*').eq('tenant_id', tenantId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    if (filters.channel) {
      query = query.eq('channel', filters.channel);
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters.startDate && filters.endDate) {
      query = query
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString());
    }

    if (filters.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
      );
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string, tenantId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(
    data: CreateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    const { data: result, error } = await supabase
      .from('orders')
      .insert({
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      })
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  async update(
    id: string,
    data: UpdateOrderDTO,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    const { data: result, error } = await supabase
      .from('orders')
      .update({
        ...data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async updateStatus(
    id: string,
    status: string,
    tenantId: string,
    userId: string
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getOrdersByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getOrderStats(tenantId: string): Promise<OrderStats> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      };
    }

    const stats = orders.reduce(
      (acc, order) => {
        acc.total++;
        acc[order.status as keyof OrderStats] =
          ((acc[order.status as keyof OrderStats] as number) || 0) + 1;
        acc.totalRevenue += order.total_amount || 0;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      } as OrderStats
    );

    stats.averageOrderValue =
      stats.total > 0 ? stats.totalRevenue / stats.total : 0;

    return stats;
  }

  async getOrdersByCustomer(
    customerId: string,
    tenantId: string
  ): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
