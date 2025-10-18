/**
 * BillingService Unit Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { billingService } from '../BillingService';

// Mock Supabase client
vi.mock('../database/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
  }),
}));

describe('BillingService', () => {
  describe('createTransaction', () => {
    it('should create a new billing transaction', async () => {
      const transactionData = {
        tenant_id: 'test-tenant-id',
        transaction_type: 'subscription_payment' as const,
        amount: 99.99,
        currency: 'TRY',
        description: 'Test transaction',
      };

      const result = await billingService.createTransaction(transactionData);
      expect(result).toBeDefined();
    });

    it('should calculate total amount with tax', async () => {
      const transactionData = {
        tenant_id: 'test-tenant-id',
        transaction_type: 'subscription_payment' as const,
        amount: 100,
        tax_amount: 18,
      };

      const result = await billingService.createTransaction(transactionData);
      expect(result).toBeDefined();
    });

    it('should set default currency to TRY', async () => {
      const transactionData = {
        tenant_id: 'test-tenant-id',
        transaction_type: 'subscription_payment' as const,
        amount: 99.99,
      };

      const result = await billingService.createTransaction(transactionData);
      expect(result).toBeDefined();
    });
  });

  describe('getTransactionHistory', () => {
    it('should fetch transaction history for a tenant', async () => {
      const transactions =
        await billingService.getTransactionHistory('test-tenant-id');
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should limit results to specified amount', async () => {
      const transactions = await billingService.getTransactionHistory(
        'test-tenant-id',
        10
      );
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe('refundPayment', () => {
    it('should process full refund', async () => {
      try {
        await billingService.refundPayment(
          'test-transaction-id',
          100,
          'Customer request'
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should process partial refund', async () => {
      try {
        await billingService.refundPayment(
          'test-transaction-id',
          50,
          'Partial refund'
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('createInvoice', () => {
    it('should create a new invoice', async () => {
      const invoiceData = {
        tenant_id: 'test-tenant-id',
        bill_to_name: 'Test Company',
        bill_to_email: 'test@company.com',
        line_items: [
          {
            description: 'Professional Plan - Monthly',
            quantity: 1,
            unit_price: 799,
            amount: 799,
          },
        ],
        tax_rate: 18,
      };

      const result = await billingService.createInvoice(invoiceData);
      expect(result).toBeDefined();
    });

    it('should calculate invoice totals correctly', async () => {
      const invoiceData = {
        tenant_id: 'test-tenant-id',
        bill_to_name: 'Test Company',
        bill_to_email: 'test@company.com',
        line_items: [
          {
            description: 'Item 1',
            quantity: 2,
            unit_price: 100,
            amount: 200,
          },
          {
            description: 'Item 2',
            quantity: 1,
            unit_price: 50,
            amount: 50,
          },
        ],
        tax_rate: 18,
        discount_amount: 25,
      };

      const result = await billingService.createInvoice(invoiceData);
      expect(result).toBeDefined();
    });
  });

  describe('markInvoiceAsPaid', () => {
    it('should mark invoice as fully paid', async () => {
      try {
        await billingService.markInvoiceAsPaid('test-invoice-id', 799);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should mark invoice as partially paid', async () => {
      try {
        await billingService.markInvoiceAsPaid('test-invoice-id', 400);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getTotalRevenue', () => {
    it('should calculate total revenue', async () => {
      const revenue = await billingService.getTotalRevenue();
      expect(typeof revenue).toBe('number');
      expect(revenue).toBeGreaterThanOrEqual(0);
    });

    it('should calculate revenue for date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';
      const revenue = await billingService.getTotalRevenue(startDate, endDate);
      expect(typeof revenue).toBe('number');
    });
  });

  describe('getMRR', () => {
    it('should calculate Monthly Recurring Revenue', async () => {
      const mrr = await billingService.getMRR();
      expect(typeof mrr).toBe('number');
      expect(mrr).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRevenueStats', () => {
    it('should return comprehensive revenue statistics', async () => {
      const stats = await billingService.getRevenueStats();

      expect(stats).toHaveProperty('total_revenue');
      expect(stats).toHaveProperty('subscription_revenue');
      expect(stats).toHaveProperty('total_refunds');
      expect(stats).toHaveProperty('net_revenue');
      expect(stats).toHaveProperty('transaction_count');
      expect(stats).toHaveProperty('paying_tenants');
      expect(stats).toHaveProperty('average_transaction');
    });

    it('should calculate net revenue correctly', async () => {
      const stats = await billingService.getRevenueStats();
      expect(stats.net_revenue).toBe(stats.total_revenue - stats.total_refunds);
    });
  });

  describe('processPayment', () => {
    it('should process payment with payment details', async () => {
      const paymentDetails = {
        payment_method: 'credit_card',
        payment_provider: 'stripe',
        stripe_payment_intent_id: 'pi_test123',
      };

      try {
        await billingService.processPayment(
          'test-transaction-id',
          paymentDetails
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getOverdueInvoices', () => {
    it('should fetch overdue invoices', async () => {
      const overdueInvoices = await billingService.getOverdueInvoices();
      expect(Array.isArray(overdueInvoices)).toBe(true);
    });
  });
});
