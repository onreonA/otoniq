import { Money } from '../value-objects/Money';
import { OrderStatus, PaymentStatus } from '../enums/OrderStatus';
import { OrderItem } from './OrderItem';

export interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface ShippingInfo {
  method: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly orderNumber: string,
    public readonly externalOrderId?: string,
    public readonly marketplaceConnectionId?: string,
    public readonly customerInfo: CustomerInfo,
    public readonly items: OrderItem[],
    public readonly subtotal: Money,
    public readonly tax: Money,
    public readonly shippingCost: Money,
    public readonly discount: Money,
    public readonly totalAmount: Money,
    public readonly currency: string = 'TRY',
    public readonly status: OrderStatus = OrderStatus.PENDING,
    public readonly paymentStatus: PaymentStatus = PaymentStatus.PENDING,
    public readonly shippingInfo?: ShippingInfo,
    public readonly odooSaleOrderId?: string,
    public readonly odooInvoiceId?: string,
    public readonly n8nWorkflowTriggered: boolean = false,
    public readonly n8nWorkflowStatus?: string,
    public readonly customerNote?: string,
    public readonly internalNote?: string,
    public readonly orderDate: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Calculate total amount including all fees
   */
  calculateTotal(): Money {
    return this.subtotal
      .add(this.tax)
      .add(this.shippingCost)
      .subtract(this.discount);
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.CONFIRMED,
    ].includes(this.status);
  }

  /**
   * Check if order can be refunded
   */
  canBeRefunded(): boolean {
    return (
      [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(this.status) &&
      this.paymentStatus === PaymentStatus.PAID
    );
  }

  /**
   * Get order status timeline
   */
  getStatusTimeline(): OrderStatusEvent[] {
    const timeline: OrderStatusEvent[] = [];

    // Add creation event
    timeline.push({
      status: OrderStatus.PENDING,
      timestamp: this.createdAt,
      note: 'Sipariş oluşturuldu',
    });

    // Add status changes based on current status
    if (this.status !== OrderStatus.PENDING) {
      timeline.push({
        status: this.status,
        timestamp: this.updatedAt,
        note: this.getStatusNote(this.status),
      });
    }

    return timeline;
  }

  /**
   * Validate status transition
   */
  validateStatusTransition(newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [OrderStatus.PROCESSING],
    };

    return validTransitions[this.status]?.includes(newStatus) ?? false;
  }

  /**
   * Get status note for timeline
   */
  private getStatusNote(status: OrderStatus): string {
    const statusNotes: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Sipariş bekliyor',
      [OrderStatus.PROCESSING]: 'Sipariş işleniyor',
      [OrderStatus.CONFIRMED]: 'Sipariş onaylandı',
      [OrderStatus.SHIPPED]: 'Sipariş kargoya verildi',
      [OrderStatus.DELIVERED]: 'Sipariş teslim edildi',
      [OrderStatus.CANCELLED]: 'Sipariş iptal edildi',
      [OrderStatus.REFUNDED]: 'Sipariş iade edildi',
      [OrderStatus.FAILED]: 'Sipariş başarısız',
    };

    return statusNotes[status] || 'Durum güncellendi';
  }

  /**
   * Update order status
   */
  updateStatus(newStatus: OrderStatus, note?: string): Order {
    if (!this.validateStatusTransition(newStatus)) {
      throw new Error(
        `Invalid status transition from ${this.status} to ${newStatus}`
      );
    }

    return new Order(
      this.id,
      this.tenantId,
      this.orderNumber,
      this.externalOrderId,
      this.marketplaceConnectionId,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.discount,
      this.totalAmount,
      this.currency,
      newStatus,
      this.paymentStatus,
      this.shippingInfo,
      this.odooSaleOrderId,
      this.odooInvoiceId,
      this.n8nWorkflowTriggered,
      this.n8nWorkflowStatus,
      this.customerNote,
      this.internalNote,
      this.orderDate,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(newPaymentStatus: PaymentStatus): Order {
    return new Order(
      this.id,
      this.tenantId,
      this.orderNumber,
      this.externalOrderId,
      this.marketplaceConnectionId,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.discount,
      this.totalAmount,
      this.currency,
      this.status,
      newPaymentStatus,
      this.shippingInfo,
      this.odooSaleOrderId,
      this.odooInvoiceId,
      this.n8nWorkflowTriggered,
      this.n8nWorkflowStatus,
      this.customerNote,
      this.internalNote,
      this.orderDate,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add internal note
   */
  addInternalNote(note: string): Order {
    return new Order(
      this.id,
      this.tenantId,
      this.orderNumber,
      this.externalOrderId,
      this.marketplaceConnectionId,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.discount,
      this.totalAmount,
      this.currency,
      this.status,
      this.paymentStatus,
      this.shippingInfo,
      this.odooSaleOrderId,
      this.odooInvoiceId,
      this.n8nWorkflowTriggered,
      this.n8nWorkflowStatus,
      this.customerNote,
      note,
      this.orderDate,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update shipping info
   */
  updateShippingInfo(shippingInfo: ShippingInfo): Order {
    return new Order(
      this.id,
      this.tenantId,
      this.orderNumber,
      this.externalOrderId,
      this.marketplaceConnectionId,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.discount,
      this.totalAmount,
      this.currency,
      this.status,
      this.paymentStatus,
      shippingInfo,
      this.odooSaleOrderId,
      this.odooInvoiceId,
      this.n8nWorkflowTriggered,
      this.n8nWorkflowStatus,
      this.customerNote,
      this.internalNote,
      this.orderDate,
      this.createdAt,
      new Date()
    );
  }
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}
