/**
 * Billing Service
 *
 * Manages billing transactions, invoices, payment methods, and revenue analytics.
 */

import { getSupabaseClient } from '../database/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface BillingTransaction {
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  transaction_type:
    | 'subscription_payment'
    | 'upgrade'
    | 'downgrade'
    | 'addon'
    | 'refund'
    | 'credit'
    | 'adjustment';
  amount: number;
  currency: string;
  tax_amount: number;
  total_amount: number;
  status:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'partially_refunded'
    | 'cancelled';
  payment_method: string | null;
  payment_provider: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  external_transaction_id: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  invoice_generated_at: string | null;
  period_start: string | null;
  period_end: string | null;
  refund_amount: number;
  refund_reason: string | null;
  refunded_at: string | null;
  failure_code: string | null;
  failure_message: string | null;
  retry_count: number;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  transaction_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status:
    | 'draft'
    | 'sent'
    | 'paid'
    | 'partially_paid'
    | 'overdue'
    | 'cancelled'
    | 'refunded';
  bill_to_name: string;
  bill_to_email: string;
  bill_to_address: string | null;
  bill_to_tax_id: string | null;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  paid_at: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  sent_at: string | null;
  sent_to: string | null;
  notes: string | null;
  customer_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface CreateTransactionRequest {
  tenant_id: string;
  subscription_id?: string;
  transaction_type: BillingTransaction['transaction_type'];
  amount: number;
  currency?: string;
  tax_amount?: number;
  payment_method?: string;
  payment_provider?: string;
  description?: string;
  period_start?: string;
  period_end?: string;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  tenant_id: string;
  subscription_id?: string;
  transaction_id?: string;
  bill_to_name: string;
  bill_to_email: string;
  bill_to_address?: string;
  bill_to_tax_id?: string;
  line_items: InvoiceLineItem[];
  tax_rate?: number;
  discount_amount?: number;
  currency?: string;
  due_days?: number;
  notes?: string;
  customer_notes?: string;
}

export interface RevenueStats {
  total_revenue: number;
  subscription_revenue: number;
  total_refunds: number;
  net_revenue: number;
  transaction_count: number;
  paying_tenants: number;
  average_transaction: number;
}

// ============================================================================
// BILLING SERVICE
// ============================================================================

export class BillingService {
  private supabase = getSupabaseClient();

  // ==========================================================================
  // TRANSACTION MANAGEMENT
  // ==========================================================================

  /**
   * Create a new billing transaction
   */
  async createTransaction(
    request: CreateTransactionRequest
  ): Promise<BillingTransaction> {
    try {
      const totalAmount = request.amount + (request.tax_amount || 0);

      const { data, error } = await this.supabase
        .from('billing_transactions')
        .insert([
          {
            ...request,
            currency: request.currency || 'TRY',
            tax_amount: request.tax_amount || 0,
            total_amount: totalAmount,
            status: 'pending',
            refund_amount: 0,
            retry_count: 0,
            metadata: request.metadata || {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    transactionId: string
  ): Promise<BillingTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('billing_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a tenant
   */
  async getTransactionHistory(
    tenantId: string,
    limit = 50
  ): Promise<BillingTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from('billing_transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Get all transactions (for admin)
   */
  async getAllTransactions(
    filters?: {
      status?: string;
      transaction_type?: string;
      start_date?: string;
      end_date?: string;
    },
    limit = 100
  ): Promise<BillingTransaction[]> {
    try {
      let query = this.supabase
        .from('billing_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: BillingTransaction['status'],
    metadata?: Record<string, any>
  ): Promise<BillingTransaction> {
    try {
      const updateData: any = { status };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { data, error } = await this.supabase
        .from('billing_transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // ==========================================================================
  // PAYMENT PROCESSING
  // ==========================================================================

  /**
   * Process a payment
   */
  async processPayment(
    transactionId: string,
    paymentDetails: {
      payment_method: string;
      payment_provider: string;
      stripe_payment_intent_id?: string;
      stripe_charge_id?: string;
    }
  ): Promise<BillingTransaction> {
    try {
      const { data, error } = await this.supabase
        .from('billing_transactions')
        .update({
          status: 'processing',
          ...paymentDetails,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;

      // Here you would integrate with actual payment provider (Stripe, etc.)
      // For now, we'll just mark it as completed
      // In production, this would be handled by webhooks

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Mark payment as completed
   */
  async completePayment(transactionId: string): Promise<BillingTransaction> {
    return this.updateTransactionStatus(transactionId, 'completed');
  }

  /**
   * Mark payment as failed
   */
  async failPayment(
    transactionId: string,
    failureCode: string,
    failureMessage: string
  ): Promise<BillingTransaction> {
    try {
      const { data, error } = await this.supabase
        .from('billing_transactions')
        .update({
          status: 'failed',
          failure_code: failureCode,
          failure_message: failureMessage,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error failing payment:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    transactionId: string,
    refundAmount: number,
    reason?: string
  ): Promise<BillingTransaction> {
    try {
      const transaction = await this.getTransactionById(transactionId);
      if (!transaction) throw new Error('Transaction not found');

      const isPartialRefund = refundAmount < transaction.total_amount;

      const { data, error } = await this.supabase
        .from('billing_transactions')
        .update({
          status: isPartialRefund ? 'partially_refunded' : 'refunded',
          refund_amount: refundAmount,
          refund_reason: reason,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  // ==========================================================================
  // INVOICE MANAGEMENT
  // ==========================================================================

  /**
   * Create a new invoice
   */
  async createInvoice(request: CreateInvoiceRequest): Promise<Invoice> {
    try {
      // Calculate amounts
      const subtotal = request.line_items.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const taxRate = request.tax_rate || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = request.discount_amount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + (request.due_days || 30));

      const { data, error } = await this.supabase
        .from('invoices')
        .insert([
          {
            tenant_id: request.tenant_id,
            subscription_id: request.subscription_id,
            transaction_id: request.transaction_id,
            invoice_date: invoiceDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString().split('T')[0],
            bill_to_name: request.bill_to_name,
            bill_to_email: request.bill_to_email,
            bill_to_address: request.bill_to_address,
            bill_to_tax_id: request.bill_to_tax_id,
            line_items: request.line_items,
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            amount_paid: 0,
            amount_due: totalAmount,
            currency: request.currency || 'TRY',
            status: 'draft',
            notes: request.notes,
            customer_notes: request.customer_notes,
            metadata: {},
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoices for a tenant
   */
  async getTenantInvoices(tenantId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tenant invoices:', error);
      throw error;
    }
  }

  /**
   * Get all invoices (for admin)
   */
  async getAllInvoices(
    filters?: {
      status?: string;
      start_date?: string;
      end_date?: string;
    },
    limit = 100
  ): Promise<Invoice[]> {
    try {
      let query = this.supabase
        .from('invoices')
        .select('*')
        .order('invoice_date', { ascending: false })
        .limit(limit);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.start_date) {
        query = query.gte('invoice_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('invoice_date', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      throw error;
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('overdue_invoices_view')
        .select('*')
        .order('days_overdue', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: Invoice['status']
  ): Promise<Invoice> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(
    invoiceId: string,
    amountPaid: number
  ): Promise<Invoice> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      const totalPaid = invoice.amount_paid + amountPaid;
      const amountDue = invoice.total_amount - totalPaid;
      const status =
        amountDue <= 0
          ? 'paid'
          : totalPaid > 0
            ? 'partially_paid'
            : invoice.status;

      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          amount_paid: totalPaid,
          amount_due: amountDue,
          status,
          paid_at: amountDue <= 0 ? new Date().toISOString() : null,
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(invoiceId: string): Promise<Invoice> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) throw new Error('Invoice not found');

      // Here you would integrate with email service
      // For now, just update the sent status

      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          status: invoice.status === 'draft' ? 'sent' : invoice.status,
          sent_at: new Date().toISOString(),
          sent_to: invoice.bill_to_email,
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw error;
    }
  }

  // ==========================================================================
  // REVENUE ANALYTICS
  // ==========================================================================

  /**
   * Get total revenue
   */
  async getTotalRevenue(startDate?: string, endDate?: string): Promise<number> {
    try {
      let query = this.supabase
        .from('billing_transactions')
        .select('total_amount')
        .eq('status', 'completed');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total =
        data?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      return Math.round(total * 100) / 100;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      throw error;
    }
  }

  /**
   * Get revenue by plan
   */
  async getRevenueByPlan() {
    try {
      const { data, error } = await this.supabase
        .from('billing_transactions')
        .select(
          `
          total_amount,
          tenant_subscriptions!inner(
            subscription_plans!inner(plan_name, display_name)
          )
        `
        )
        .eq('status', 'completed')
        .eq('transaction_type', 'subscription_payment');

      if (error) throw error;

      // Aggregate by plan
      const revenueByPlan: Record<string, number> = {};

      data?.forEach((transaction: any) => {
        const planName =
          transaction.tenant_subscriptions?.subscription_plans?.display_name ||
          'Unknown';
        revenueByPlan[planName] =
          (revenueByPlan[planName] || 0) + transaction.total_amount;
      });

      return revenueByPlan;
    } catch (error) {
      console.error('Error getting revenue by plan:', error);
      throw error;
    }
  }

  /**
   * Get MRR (Monthly Recurring Revenue)
   */
  async getMRR(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .select('billing_cycle, next_payment_amount')
        .eq('status', 'active');

      if (error) throw error;

      const mrr =
        data?.reduce((sum, sub) => {
          const amount =
            sub.billing_cycle === 'yearly'
              ? (sub.next_payment_amount || 0) / 12
              : sub.next_payment_amount || 0;
          return sum + amount;
        }, 0) || 0;

      return Math.round(mrr * 100) / 100;
    } catch (error) {
      console.error('Error calculating MRR:', error);
      throw error;
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(
    startDate?: string,
    endDate?: string
  ): Promise<RevenueStats> {
    try {
      let query = this.supabase.from('billing_transactions').select('*');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const completed = data?.filter(t => t.status === 'completed') || [];
      const totalRevenue =
        completed.reduce((sum, t) => sum + t.total_amount, 0) || 0;

      const subscriptionRevenue =
        completed
          .filter(t => t.transaction_type === 'subscription_payment')
          .reduce((sum, t) => sum + t.total_amount, 0) || 0;

      const totalRefunds =
        data
          ?.filter(
            t => t.status === 'refunded' || t.status === 'partially_refunded'
          )
          .reduce((sum, t) => sum + t.refund_amount, 0) || 0;

      const netRevenue = totalRevenue - totalRefunds;

      const transactionCount = completed.length;

      const payingTenants = new Set(completed.map(t => t.tenant_id)).size;

      const averageTransaction =
        transactionCount > 0 ? totalRevenue / transactionCount : 0;

      return {
        total_revenue: Math.round(totalRevenue * 100) / 100,
        subscription_revenue: Math.round(subscriptionRevenue * 100) / 100,
        total_refunds: Math.round(totalRefunds * 100) / 100,
        net_revenue: Math.round(netRevenue * 100) / 100,
        transaction_count: transactionCount,
        paying_tenants: payingTenants,
        average_transaction: Math.round(averageTransaction * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      throw error;
    }
  }

  /**
   * Get revenue summary (monthly)
   */
  async getRevenueSummary() {
    try {
      const { data, error } = await this.supabase
        .from('revenue_summary_view')
        .select('*')
        .order('month', { ascending: false })
        .limit(12);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting revenue summary:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const billingService = new BillingService();
