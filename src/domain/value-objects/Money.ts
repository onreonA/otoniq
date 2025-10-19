/**
 * Money Value Object
 * Represents monetary values with currency
 */

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'TRY'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }

  /**
   * Add another money amount
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another money amount
   */
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by a number
   */
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divide by a number
   */
  divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  /**
   * Check if this money is greater than another
   */
  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount > other.amount;
  }

  /**
   * Check if this money is less than another
   */
  isLessThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare money with different currencies');
    }
    return this.amount < other.amount;
  }

  /**
   * Check if this money equals another
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Get formatted string representation
   */
  toString(): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  /**
   * Get formatted string with custom locale
   */
  toFormattedString(locale: string = 'tr-TR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  /**
   * Get amount as string with currency symbol
   */
  toDisplayString(): string {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[this.currency] || this.currency;
    return `${this.amount.toFixed(2)} ${symbol}`;
  }

  /**
   * Get formatted amount (alias for toString)
   */
  getFormattedAmount(): string {
    return this.toString();
  }

  /**
   * Get amount value
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get currency code
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * Create Money from string
   */
  static fromString(amount: string, currency: string = 'TRY'): Money {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error('Invalid amount string');
    }
    return new Money(parsedAmount, currency);
  }

  /**
   * Create zero money
   */
  static zero(currency: string = 'TRY'): Money {
    return new Money(0, currency);
  }

  /**
   * Create Money from cents (for currencies that use cents)
   */
  static fromCents(cents: number, currency: string = 'TRY'): Money {
    return new Money(cents / 100, currency);
  }

  /**
   * Convert to cents
   */
  toCents(): number {
    return Math.round(this.amount * 100);
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number = 2): Money {
    const factor = Math.pow(10, decimals);
    return new Money(Math.round(this.amount * factor) / factor, this.currency);
  }

  /**
   * Get absolute value
   */
  abs(): Money {
    return new Money(Math.abs(this.amount), this.currency);
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if amount is positive
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Check if amount is negative
   */
  isNegative(): boolean {
    return this.amount < 0;
  }
}
