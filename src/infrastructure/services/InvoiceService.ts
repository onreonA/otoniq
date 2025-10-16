import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Invoice {
  id: string;
  tenantId: string;
  orderId?: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
  termsAndConditions?: string;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  totalAmount: number;
}

export class InvoiceService {
  /**
   * Create new invoice
   */
  static async createInvoice(
    tenantId: string,
    invoiceData: {
      customerId: string;
      orderId?: string;
      invoiceDate: string;
      dueDate: string;
      items: InvoiceItem[];
      notes?: string;
      termsAndConditions?: string;
    }
  ): Promise<Invoice> {
    // Calculate totals
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = invoiceData.items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice * item.taxRate) / 100,
      0
    );
    const discountAmount = invoiceData.items.reduce(
      (sum, item) =>
        sum + (item.quantity * item.unitPrice * item.discountRate) / 100,
      0
    );
    const totalAmount = subtotal + taxAmount - discountAmount;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        tenant_id: tenantId,
        customer_id: invoiceData.customerId,
        order_id: invoiceData.orderId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate,
        status: 'draft',
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        currency: 'TRY',
        notes: invoiceData.notes,
        terms_and_conditions: invoiceData.termsAndConditions,
        items: invoiceData.items,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get invoices for tenant
   */
  static async getInvoices(
    tenantId: string,
    filters?: {
      status?: string;
      customerId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Invoice[]> {
    let query = supabase
      .from('invoices')
      .select('*, customer:customers(name, email)')
      .eq('tenant_id', tenantId)
      .order('invoice_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters?.startDate) {
      query = query.gte('invoice_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('invoice_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Get invoice by ID
   */
  static async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customer:customers(*)')
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update invoice
   */
  static async updateInvoice(
    invoiceId: string,
    updates: Partial<Invoice>
  ): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark invoice as sent
   */
  static async markAsSent(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) throw error;
  }

  /**
   * Mark invoice as paid
   */
  static async markAsPaid(
    invoiceId: string,
    paymentDate: string
  ): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: paymentDate })
      .eq('id', invoiceId);

    if (error) throw error;
  }

  /**
   * Cancel invoice
   */
  static async cancelInvoice(invoiceId: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', invoiceId);

    if (error) throw error;
  }

  /**
   * Generate unique invoice number
   */
  private static async generateInvoiceNumber(
    tenantId: string
  ): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // Get last invoice number for this month
    const { data } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('tenant_id', tenantId)
      .like('invoice_number', `INV-${year}${month}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].invoice_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `INV-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get invoice statistics
   */
  static async getInvoiceStats(tenantId: string): Promise<{
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    overdueInvoices: number;
    avgInvoiceAmount: number;
  }> {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total_amount')
      .eq('tenant_id', tenantId);

    if (!invoices) {
      return {
        totalInvoices: 0,
        totalRevenue: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        avgInvoiceAmount: 0,
      };
    }

    const totalInvoices = invoices.length;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(
      inv => inv.status === 'overdue'
    ).length;
    const avgInvoiceAmount =
      totalInvoices > 0
        ? invoices.reduce((sum, inv) => sum + inv.total_amount, 0) /
          totalInvoices
        : 0;

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      avgInvoiceAmount,
    };
  }

  /**
   * Send invoice email
   */
  static async sendInvoiceEmail(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    // Mark as sent
    await this.markAsSent(invoiceId);

    // In production, integrate with email service
    console.log(`Invoice ${invoice.invoiceNumber} sent to customer`);
  }
}
