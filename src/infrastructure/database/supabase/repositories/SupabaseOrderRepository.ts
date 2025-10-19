import { supabase } from '../client';
import {
  IOrderRepository,
  OrderFilters,
} from '../../../../domain/repositories/IOrderRepository';
import {
  Order,
  OrderItem,
  OrderStatusHistory,
  OrderStatus,
  PaymentStatus,
} from '../../../../domain/entities';
import { Money } from '../../../../domain/value-objects/Money';

export class SupabaseOrderRepository implements IOrderRepository {
  async create(order: Order): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          tenant_id: order.tenantId,
          order_number: order.orderNumber,
          external_order_id: order.externalOrderId,
          marketplace_connection_id: order.marketplaceConnectionId,
          customer_info: order.customerInfo,
          items: order.items.map(item => ({
            id: item.id,
            product_id: item.productId,
            sku: item.sku,
            name: item.title,
            quantity: item.quantity,
            unit_price: item.unitPrice.getAmount(),
            currency: item.unitPrice.getCurrency(),
            variant_id: item.variant?.id,
            variant_name: item.variant?.name,
            variant_value: item.variant?.value,
          })),
          subtotal: order.subtotal.getAmount(),
          tax: order.tax.getAmount(),
          shipping_cost: order.shippingCost.getAmount(),
          discount: order.discount.getAmount(),
          total_amount: order.totalAmount.getAmount(),
          currency: order.currency,
          status: order.status,
          payment_status: order.paymentStatus,
          shipping_method: order.shippingMethod,
          shipping_tracking_number: order.shippingTrackingNumber,
          shipping_carrier: order.shippingCarrier,
          estimated_delivery_date: order.estimatedDeliveryDate?.toISOString(),
          customer_note: order.customerNote,
          internal_note: order.internalNote,
          created_by: order.createdBy,
          order_date: order.orderDate.toISOString(),
          created_at: order.createdAt.toISOString(),
          updated_at: order.updatedAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return this.mapToOrder(data);
    } catch (error) {
      console.error('SupabaseOrderRepository.create error:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get order: ${error.message}`);
      }

      return this.mapToOrder(data);
    } catch (error) {
      console.error('SupabaseOrderRepository.getById error:', error);
      throw error;
    }
  }

  async getOrders(
    tenantId: string,
    filters: OrderFilters,
    pagination: { limit: number; offset: number }
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      if (filters.marketplaceConnectionId) {
        query = query.eq(
          'marketplace_connection_id',
          filters.marketplaceConnectionId
        );
      }
      if (filters.customerEmail) {
        query = query.ilike(
          'customer_info->>email',
          `%${filters.customerEmail}%`
        );
      }
      if (filters.dateFrom) {
        query = query.gte('order_date', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('order_date', filters.dateTo.toISOString());
      }
      if (filters.search) {
        query = query.or(
          `order_number.ilike.%${filters.search}%,customer_info->>name.ilike.%${filters.search}%`
        );
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(pagination.offset, pagination.offset + pagination.limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to get orders: ${error.message}`);
      }

      const orders = data ? data.map(order => this.mapToOrder(order)) : [];
      return {
        orders,
        total: count || 0,
      };
    } catch (error) {
      console.error('SupabaseOrderRepository.getOrders error:', error);
      throw error;
    }
  }

  async update(order: Order): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_number: order.orderNumber,
          external_order_id: order.externalOrderId,
          marketplace_connection_id: order.marketplaceConnectionId,
          customer_info: order.customerInfo,
          items: order.items.map(item => ({
            id: item.id,
            product_id: item.productId,
            sku: item.sku,
            name: item.title,
            quantity: item.quantity,
            unit_price: item.unitPrice.getAmount(),
            currency: item.unitPrice.getCurrency(),
            variant_id: item.variant?.id,
            variant_name: item.variant?.name,
            variant_value: item.variant?.value,
          })),
          subtotal: order.subtotal.getAmount(),
          tax: order.tax.getAmount(),
          shipping_cost: order.shippingCost.getAmount(),
          discount: order.discount.getAmount(),
          total_amount: order.totalAmount.getAmount(),
          currency: order.currency,
          status: order.status,
          payment_status: order.paymentStatus,
          shipping_method: order.shippingMethod,
          shipping_tracking_number: order.shippingTrackingNumber,
          shipping_carrier: order.shippingCarrier,
          estimated_delivery_date: order.estimatedDeliveryDate?.toISOString(),
          customer_note: order.customerNote,
          internal_note: order.internalNote,
          order_date: order.orderDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`);
      }

      return this.mapToOrder(data);
    } catch (error) {
      console.error('SupabaseOrderRepository.update error:', error);
      throw error;
    }
  }

  async addStatusHistory(
    history: OrderStatusHistory
  ): Promise<OrderStatusHistory> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .insert({
          id: history.id,
          order_id: history.orderId,
          tenant_id: history.tenantId,
          old_status: history.oldStatus,
          new_status: history.newStatus,
          note: history.note,
          changed_by: history.changedBy,
          changed_at: history.changedAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add status history: ${error.message}`);
      }

      return this.mapToOrderStatusHistory(data);
    } catch (error) {
      console.error('SupabaseOrderRepository.addStatusHistory error:', error);
      throw error;
    }
  }

  async generateNextOrderNumber(tenantId: string): Promise<string> {
    try {
      // Get the last order number for this tenant
      const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get last order number: ${error.message}`);
      }

      // Generate next order number
      const lastOrderNumber = data?.order_number || 'ORD-000000';
      const numberPart = parseInt(lastOrderNumber.split('-')[1]) + 1;
      return `ORD-${numberPart.toString().padStart(6, '0')}`;
    } catch (error) {
      console.error(
        'SupabaseOrderRepository.generateNextOrderNumber error:',
        error
      );
      throw error;
    }
  }

  private mapToOrder(data: any): Order {
    return new Order({
      id: data.id,
      tenantId: data.tenant_id,
      orderNumber: data.order_number,
      externalOrderId: data.external_order_id,
      marketplaceConnectionId: data.marketplace_connection_id,
      customerInfo: data.customer_info,
      items:
        data.items?.map(
          (item: any) =>
            new OrderItem(
              item.id,
              item.product_id,
              item.sku,
              item.name,
              item.quantity,
              new Money(item.unit_price, item.currency),
              item.variant_id
                ? {
                    id: item.variant_id,
                    name: item.variant_name || '',
                    value: item.variant_value || '',
                  }
                : undefined
            )
        ) || [],
      subtotal: new Money(data.subtotal, data.currency),
      tax: new Money(data.tax, data.currency),
      shippingCost: new Money(data.shipping_cost, data.currency),
      discount: new Money(data.discount, data.currency),
      totalAmount: new Money(data.total_amount, data.currency),
      currency: data.currency,
      status: data.status as OrderStatus,
      paymentStatus: data.payment_status as PaymentStatus,
      shippingMethod: data.shipping_method,
      shippingTrackingNumber: data.shipping_tracking_number,
      shippingCarrier: data.shipping_carrier,
      estimatedDeliveryDate: data.estimated_delivery_date
        ? new Date(data.estimated_delivery_date)
        : undefined,
      customerNote: data.customer_note,
      internalNote: data.internal_note,
      createdBy: data.created_by,
      orderDate: new Date(data.order_date),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    });
  }

  async getOrderStatusHistory(orderId: string): Promise<OrderStatusHistory[]> {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get order status history: ${error.message}`);
      }

      return (data || []).map(item => this.mapToOrderStatusHistory(item));
    } catch (error) {
      console.error(
        'SupabaseOrderRepository.getOrderStatusHistory error:',
        error
      );
      throw error;
    }
  }

  private mapToOrderStatusHistory(data: any): OrderStatusHistory {
    return new OrderStatusHistory({
      id: data.id,
      orderId: data.order_id,
      tenantId: data.tenant_id,
      oldStatus: data.old_status,
      newStatus: data.new_status,
      note: data.note,
      changedBy: data.changed_by,
      changedAt: new Date(data.changed_at),
    });
  }
}
