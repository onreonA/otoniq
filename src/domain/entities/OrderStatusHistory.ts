import { OrderStatus, PaymentStatus } from '../enums/OrderStatus';

export class OrderStatusHistory {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly tenantId: string,
    public readonly oldStatus?: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly oldPaymentStatus?: PaymentStatus,
    public readonly newPaymentStatus?: PaymentStatus,
    public readonly note?: string,
    public readonly changedBy?: string,
    public readonly changedAt: Date = new Date()
  ) {}

  /**
   * Check if this is a status change
   */
  isStatusChange(): boolean {
    return this.oldStatus !== undefined && this.oldStatus !== this.newStatus;
  }

  /**
   * Check if this is a payment status change
   */
  isPaymentStatusChange(): boolean {
    return (
      this.oldPaymentStatus !== undefined &&
      this.newPaymentStatus !== undefined &&
      this.oldPaymentStatus !== this.newPaymentStatus
    );
  }

  /**
   * Get change description
   */
  getChangeDescription(): string {
    if (this.isStatusChange()) {
      return `Sipariş durumu ${this.oldStatus} → ${this.newStatus} olarak değiştirildi`;
    }

    if (this.isPaymentStatusChange()) {
      return `Ödeme durumu ${this.oldPaymentStatus} → ${this.newPaymentStatus} olarak değiştirildi`;
    }

    return 'Sipariş güncellendi';
  }

  /**
   * Get formatted timestamp
   */
  getFormattedTimestamp(): string {
    return this.changedAt.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Check if change was made by system
   */
  isSystemChange(): boolean {
    return this.changedBy === undefined || this.changedBy === 'system';
  }

  /**
   * Check if change was made by user
   */
  isUserChange(): boolean {
    return this.changedBy !== undefined && this.changedBy !== 'system';
  }

  /**
   * Get change type
   */
  getChangeType(): 'status' | 'payment' | 'note' | 'system' {
    if (this.isStatusChange()) return 'status';
    if (this.isPaymentStatusChange()) return 'payment';
    if (this.note && !this.isStatusChange() && !this.isPaymentStatusChange())
      return 'note';
    return 'system';
  }
}
