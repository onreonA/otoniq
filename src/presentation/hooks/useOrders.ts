/**
 * useOrders Hook
 * React hook for order operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseOrderRepository } from '../../infrastructure/database/supabase/repositories/SupabaseOrderRepository';
import { OrderService } from '../../infrastructure/services/OrderService';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
} from '../../domain/entities/Order';
import {
  OrderFilters,
  OrderStats,
} from '../../domain/repositories/IOrderRepository';
import { useAuth } from './useAuth';

const repository = new SupabaseOrderRepository();
const service = new OrderService(repository);

export const useOrders = (filters?: OrderFilters) => {
  const { user, tenantId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getAll(tenantId, filters);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, filters]);

  const fetchStats = useCallback(async () => {
    if (!tenantId) return;

    try {
      const data = await service.getOrderStats(tenantId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  }, [tenantId]);

  const getById = async (id: string): Promise<Order | null> => {
    if (!tenantId) return null;

    setLoading(true);
    setError(null);

    try {
      return await service.getById(id, tenantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      console.error('Error fetching order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderDTO): Promise<Order | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const order = await service.create(data, tenantId, user.id);
      await fetchOrders();
      await fetchStats();
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      console.error('Error creating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (
    id: string,
    data: UpdateOrderDTO
  ): Promise<Order | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const order = await service.update(id, data, tenantId, user.id);
      await fetchOrders();
      await fetchStats();
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      console.error('Error updating order:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string): Promise<boolean> => {
    if (!tenantId || !user) return false;

    setLoading(true);
    setError(null);

    try {
      await service.updateStatus(id, status, tenantId, user.id);
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update order status'
      );
      console.error('Error updating order status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string): Promise<boolean> => {
    if (!tenantId) return false;

    setLoading(true);
    setError(null);

    try {
      await service.delete(id, tenantId);
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      console.error('Error deleting order:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateStatus = async (
    orderIds: string[],
    status: string
  ): Promise<boolean> => {
    if (!tenantId || !user) return false;

    setLoading(true);
    setError(null);

    try {
      await service.bulkUpdateStatus(orderIds, status, tenantId, user.id);
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to bulk update orders'
      );
      console.error('Error bulk updating orders:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchOrders();
      fetchStats();
    }
  }, [tenantId, fetchOrders, fetchStats]);

  return {
    orders,
    stats,
    loading,
    error,
    fetchOrders,
    getById,
    createOrder,
    updateOrder,
    updateStatus,
    deleteOrder,
    bulkUpdateStatus,
  };
};
