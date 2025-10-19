import { Money } from '../value-objects/Money';

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
}

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly sku: string,
    public readonly title: string,
    public readonly quantity: number,
    public readonly unitPrice: Money,
    public readonly variant?: ProductVariant
  ) {}

  /**
   * Calculate line total (unit price * quantity)
   */
  calculateLineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  /**
   * Get product info for display
   */
  getProductInfo(): {
    id: string;
    sku: string;
    title: string;
    variant?: ProductVariant;
  } {
    return {
      id: this.productId,
      sku: this.sku,
      title: this.title,
      variant: this.variant,
    };
  }

  /**
   * Update quantity
   */
  updateQuantity(newQuantity: number): OrderItem {
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return new OrderItem(
      this.id,
      this.productId,
      this.sku,
      this.title,
      newQuantity,
      this.unitPrice,
      this.variant
    );
  }

  /**
   * Update unit price
   */
  updateUnitPrice(newUnitPrice: Money): OrderItem {
    return new OrderItem(
      this.id,
      this.productId,
      this.sku,
      this.title,
      this.quantity,
      newUnitPrice,
      this.variant
    );
  }

  /**
   * Add variant
   */
  addVariant(variant: ProductVariant): OrderItem {
    return new OrderItem(
      this.id,
      this.productId,
      this.sku,
      this.title,
      this.quantity,
      this.unitPrice,
      variant
    );
  }

  /**
   * Remove variant
   */
  removeVariant(): OrderItem {
    return new OrderItem(
      this.id,
      this.productId,
      this.sku,
      this.title,
      this.quantity,
      this.unitPrice
    );
  }

  /**
   * Check if item has variant
   */
  hasVariant(): boolean {
    return this.variant !== undefined;
  }

  /**
   * Get display name with variant
   */
  getDisplayName(): string {
    if (this.variant) {
      return `${this.title} - ${this.variant.name}: ${this.variant.value}`;
    }
    return this.title;
  }

  /**
   * Get formatted price
   */
  getFormattedPrice(): string {
    return this.unitPrice.getFormattedAmount();
  }

  /**
   * Get formatted total
   */
  getFormattedTotal(): string {
    return this.calculateLineTotal().getFormattedAmount();
  }
}
