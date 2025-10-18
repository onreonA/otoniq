import { Money } from '../value-objects/Money';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type SyncStatus = 'pending' | 'synced' | 'error' | 'manual';

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface OrderItem {
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  price: Money;
  total: Money;
  variant?: string;
}

export interface ShippingInfo {
  method?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
}

export class MarketplaceOrder {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly marketplaceConnectionId: string,
    public readonly externalOrderId: string,
    public readonly externalOrderNumber?: string,
    public readonly orderStatus: OrderStatus = 'pending',
    public readonly paymentStatus: PaymentStatus = 'pending',
    public readonly customerInfo: CustomerInfo,
    public readonly items: OrderItem[],
    public readonly subtotal: Money,
    public readonly tax: Money = new Money(0, subtotal.currency),
    public readonly shippingCost: Money = new Money(0, subtotal.currency),
    public readonly commission: Money = new Money(0, subtotal.currency),
    public readonly totalAmount: Money,
    public readonly currency: string = 'TRY',
    public readonly shippingInfo: ShippingInfo = {},
    public readonly syncStatus: SyncStatus = 'pending',
    public readonly syncError?: string,
    public readonly orderDate: Date,
    public readonly lastSyncedAt?: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if order is pending
   */
  isPending(): boolean {
    return this.orderStatus === 'pending';
  }

  /**
   * Check if order is confirmed
   */
  isConfirmed(): boolean {
    return this.orderStatus === 'confirmed';
  }

  /**
   * Check if order is processing
   */
  isProcessing(): boolean {
    return this.orderStatus === 'processing';
  }

  /**
   * Check if order is shipped
   */
  isShipped(): boolean {
    return this.orderStatus === 'shipped';
  }

  /**
   * Check if order is delivered
   */
  isDelivered(): boolean {
    return this.orderStatus === 'delivered';
  }

  /**
   * Check if order is cancelled
   */
  isCancelled(): boolean {
    return this.orderStatus === 'cancelled';
  }

  /**
   * Check if order is returned
   */
  isReturned(): boolean {
    return this.orderStatus === 'returned';
  }

  /**
   * Check if order is refunded
   */
  isRefunded(): boolean {
    return this.orderStatus === 'refunded';
  }

  /**
   * Check if payment is pending
   */
  isPaymentPending(): boolean {
    return this.paymentStatus === 'pending';
  }

  /**
   * Check if payment is paid
   */
  isPaymentPaid(): boolean {
    return this.paymentStatus === 'paid';
  }

  /**
   * Check if payment failed
   */
  isPaymentFailed(): boolean {
    return this.paymentStatus === 'failed';
  }

  /**
   * Check if payment is refunded
   */
  isPaymentRefunded(): boolean {
    return (
      this.paymentStatus === 'refunded' ||
      this.paymentStatus === 'partially_refunded'
    );
  }

  /**
   * Check if order has sync errors
   */
  hasSyncErrors(): boolean {
    return this.syncStatus === 'error' || !!this.syncError;
  }

  /**
   * Check if order is synced
   */
  isSynced(): boolean {
    return this.syncStatus === 'synced';
  }

  /**
   * Get total items count
   */
  getTotalItemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get total items value (without tax, shipping, commission)
   */
  getTotalItemsValue(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.total),
      new Money(0, this.currency)
    );
  }

  /**
   * Get net amount (total - commission)
   */
  getNetAmount(): Money {
    return this.totalAmount.subtract(this.commission);
  }

  /**
   * Get profit margin (net amount - cost of goods)
   */
  getProfitMargin(costOfGoods: Money): Money {
    return this.getNetAmount().subtract(costOfGoods);
  }

  /**
   * Get commission percentage
   */
  getCommissionPercentage(): number {
    if (this.totalAmount.amount === 0) {
      return 0;
    }
    return (this.commission.amount / this.totalAmount.amount) * 100;
  }

  /**
   * Update order status
   */
  updateOrderStatus(status: OrderStatus): MarketplaceOrder {
    return new MarketplaceOrder(
      this.id,
      this.tenantId,
      this.marketplaceConnectionId,
      this.externalOrderId,
      this.externalOrderNumber,
      status,
      this.paymentStatus,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.commission,
      this.totalAmount,
      this.currency,
      this.shippingInfo,
      this.syncStatus,
      this.syncError,
      this.orderDate,
      this.lastSyncedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(status: PaymentStatus): MarketplaceOrder {
    return new MarketplaceOrder(
      this.id,
      this.tenantId,
      this.marketplaceConnectionId,
      this.externalOrderId,
      this.externalOrderNumber,
      this.orderStatus,
      status,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.commission,
      this.totalAmount,
      this.currency,
      this.shippingInfo,
      this.syncStatus,
      this.syncError,
      this.orderDate,
      this.lastSyncedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update shipping info
   */
  updateShippingInfo(shippingInfo: Partial<ShippingInfo>): MarketplaceOrder {
    const updatedShippingInfo: ShippingInfo = {
      ...this.shippingInfo,
      ...shippingInfo,
    };

    return new MarketplaceOrder(
      this.id,
      this.tenantId,
      this.marketplaceConnectionId,
      this.externalOrderId,
      this.externalOrderNumber,
      this.orderStatus,
      this.paymentStatus,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.commission,
      this.totalAmount,
      this.currency,
      updatedShippingInfo,
      this.syncStatus,
      this.syncError,
      this.orderDate,
      this.lastSyncedAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update sync status
   */
  updateSyncStatus(status: SyncStatus, error?: string): MarketplaceOrder {
    return new MarketplaceOrder(
      this.id,
      this.tenantId,
      this.marketplaceConnectionId,
      this.externalOrderId,
      this.externalOrderNumber,
      this.orderStatus,
      this.paymentStatus,
      this.customerInfo,
      this.items,
      this.subtotal,
      this.tax,
      this.shippingCost,
      this.commission,
      this.totalAmount,
      this.currency,
      this.shippingInfo,
      status,
      error,
      this.orderDate,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  /**
   * Get order status display text
   */
  getOrderStatusDisplayText(): string {
    const statusTexts: Record<OrderStatus, string> = {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      processing: 'İşleniyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi',
      returned: 'İade Edildi',
      refunded: 'Para İadesi Yapıldı',
    };

    return statusTexts[this.orderStatus];
  }

  /**
   * Get payment status display text
   */
  getPaymentStatusDisplayText(): string {
    const statusTexts: Record<PaymentStatus, string> = {
      pending: 'Ödeme Bekleniyor',
      paid: 'Ödendi',
      failed: 'Ödeme Başarısız',
      refunded: 'Para İadesi Yapıldı',
      partially_refunded: 'Kısmi Para İadesi',
    };

    return statusTexts[this.paymentStatus];
  }

  /**
   * Get order status color for UI
   */
  getOrderStatusColor(): string {
    const statusColors: Record<OrderStatus, string> = {
      pending: 'yellow',
      confirmed: 'blue',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
      returned: 'orange',
      refunded: 'red',
    };

    return statusColors[this.orderStatus];
  }

  /**
   * Get payment status color for UI
   */
  getPaymentStatusColor(): string {
    const statusColors: Record<PaymentStatus, string> = {
      pending: 'yellow',
      paid: 'green',
      failed: 'red',
      refunded: 'red',
      partially_refunded: 'orange',
    };

    return statusColors[this.paymentStatus];
  }

  /**
   * Check if order can be processed
   */
  canBeProcessed(): boolean {
    return this.isConfirmed() && this.isPaymentPaid();
  }

  /**
   * Check if order can be shipped
   */
  canBeShipped(): boolean {
    return this.isProcessing() && this.isPaymentPaid();
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return this.isPending() || this.isConfirmed();
  }

  /**
   * Check if order can be refunded
   */
  canBeRefunded(): boolean {
    return this.isPaymentPaid() && !this.isRefunded();
  }

  /**
   * Get order priority for processing
   */
  getProcessingPriority(): number {
    if (this.isCancelled() || this.isRefunded()) {
      return 0; // No priority for cancelled/refunded orders
    }

    if (this.isPending()) {
      return 3; // High priority for pending orders
    }

    if (this.isConfirmed()) {
      return 2; // Medium priority for confirmed orders
    }

    if (this.isProcessing()) {
      return 1; // Low priority for processing orders
    }

    return 0; // No priority for completed orders
  }
}
