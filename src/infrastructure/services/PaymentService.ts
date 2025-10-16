import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId?: string;
  orderId?: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal' | 'stripe';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  notes?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'credit_card' | 'bank_account';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  isDefault: boolean;
}

export class PaymentService {
  /**
   * Create payment record
   */
  static async createPayment(
    tenantId: string,
    paymentData: {
      invoiceId?: string;
      orderId?: string;
      customerId: string;
      amount: number;
      currency?: string;
      paymentMethod: Payment['paymentMethod'];
      paymentDate: string;
      transactionId?: string;
      notes?: string;
    }
  ): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        tenant_id: tenantId,
        invoice_id: paymentData.invoiceId,
        order_id: paymentData.orderId,
        customer_id: paymentData.customerId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'TRY',
        payment_method: paymentData.paymentMethod,
        payment_status: 'completed',
        transaction_id: paymentData.transactionId,
        payment_date: paymentData.paymentDate,
        notes: paymentData.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // If payment is for an invoice, update invoice status
    if (paymentData.invoiceId) {
      await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: paymentData.paymentDate })
        .eq('id', paymentData.invoiceId);
    }

    return data;
  }

  /**
   * Get payments for tenant
   */
  static async getPayments(
    tenantId: string,
    filters?: {
      status?: string;
      customerId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Payment[]> {
    let query = supabase
      .from('payments')
      .select(
        '*, customer:customers(name, email), invoice:invoices(invoice_number)'
      )
      .eq('tenant_id', tenantId)
      .order('payment_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('payment_status', filters.status);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters?.startDate) {
      query = query.gte('payment_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('payment_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*, customer:customers(*), invoice:invoices(*)')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Process refund
   */
  static async refundPayment(
    paymentId: string,
    refundAmount?: number,
    reason?: string
  ): Promise<void> {
    const payment = await this.getPayment(paymentId);
    if (!payment) throw new Error('Payment not found');

    const amountToRefund = refundAmount || payment.amount;

    // Create refund record
    await supabase.from('payments').insert({
      tenant_id: payment.tenantId,
      invoice_id: payment.invoiceId,
      order_id: payment.orderId,
      customer_id: payment.customerId,
      amount: -amountToRefund,
      currency: payment.currency,
      payment_method: payment.paymentMethod,
      payment_status: 'refunded',
      payment_date: new Date().toISOString(),
      notes: reason || 'Refund',
      metadata: { original_payment_id: paymentId },
    });

    // Update original payment status
    await supabase
      .from('payments')
      .update({ payment_status: 'refunded' })
      .eq('id', paymentId);
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(tenantId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    pendingPayments: number;
    refundedAmount: number;
  }> {
    const { data: payments } = await supabase
      .from('payments')
      .select('payment_status, amount')
      .eq('tenant_id', tenantId);

    if (!payments) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        pendingPayments: 0,
        refundedAmount: 0,
      };
    }

    const totalPayments = payments.length;
    const totalAmount = payments
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const completedPayments = payments.filter(
      p => p.payment_status === 'completed'
    ).length;
    const pendingPayments = payments.filter(
      p => p.payment_status === 'pending'
    ).length;
    const refundedAmount = payments
      .filter(p => p.payment_status === 'refunded')
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      refundedAmount,
    };
  }

  /**
   * Process Stripe payment
   */
  static async processStripePayment(
    tenantId: string,
    paymentData: {
      amount: number;
      currency: string;
      customerId: string;
      paymentMethodId: string;
      invoiceId?: string;
      orderId?: string;
    }
  ): Promise<Payment> {
    // In production, integrate with Stripe API
    // For now, create a completed payment record
    const payment = await this.createPayment(tenantId, {
      ...paymentData,
      paymentMethod: 'stripe',
      paymentDate: new Date().toISOString(),
      transactionId: `stripe_${Date.now()}`,
    });

    return payment;
  }

  /**
   * Save customer payment method
   */
  static async savePaymentMethod(
    customerId: string,
    methodData: {
      type: 'credit_card' | 'bank_account';
      last4: string;
      expiryMonth?: number;
      expiryYear?: number;
      brand?: string;
      isDefault?: boolean;
    }
  ): Promise<PaymentMethod> {
    // If this is default, unset other defaults first
    if (methodData.isDefault) {
      await supabase
        .from('customer_payment_methods')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    }

    const { data, error } = await supabase
      .from('customer_payment_methods')
      .insert({
        customer_id: customerId,
        type: methodData.type,
        last4: methodData.last4,
        expiry_month: methodData.expiryMonth,
        expiry_year: methodData.expiryYear,
        brand: methodData.brand,
        is_default: methodData.isDefault || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get customer payment methods
   */
  static async getCustomerPaymentMethods(
    customerId: string
  ): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('customer_payment_methods')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(methodId: string): Promise<void> {
    const { error } = await supabase
      .from('customer_payment_methods')
      .delete()
      .eq('id', methodId);

    if (error) throw error;
  }
}
