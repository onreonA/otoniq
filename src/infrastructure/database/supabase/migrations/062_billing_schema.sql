-- ============================================================================
-- OTONIQ.AI - Billing & Transactions Schema
-- Migration 062: Billing transactions, invoices, and payment tracking
-- ============================================================================

-- ============================================================================
-- BILLING TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'subscription_payment',  -- Regular subscription payment
    'upgrade',               -- Plan upgrade
    'downgrade',            -- Plan downgrade
    'addon',                -- Additional features/credits
    'refund',               -- Refund transaction
    'credit',               -- Account credit
    'adjustment'            -- Manual adjustment
  )),
  
  -- Amount
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL, -- amount + tax_amount
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Awaiting payment
    'processing',   -- Payment in progress
    'completed',    -- Successfully paid
    'failed',       -- Payment failed
    'refunded',     -- Fully refunded
    'partially_refunded', -- Partially refunded
    'cancelled'     -- Cancelled before processing
  )),
  
  -- Payment details
  payment_method TEXT, -- 'credit_card', 'bank_transfer', 'paypal', etc.
  payment_provider TEXT, -- 'stripe', 'iyzico', 'paytr', etc.
  
  -- External IDs
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  external_transaction_id TEXT, -- For other payment providers
  
  -- Invoice
  invoice_number TEXT UNIQUE,
  invoice_url TEXT,
  invoice_generated_at TIMESTAMPTZ,
  
  -- Period covered
  period_start DATE,
  period_end DATE,
  
  -- Refund tracking
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  
  -- Failure tracking
  failure_code TEXT,
  failure_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_billing_transactions_tenant_id ON billing_transactions(tenant_id);
CREATE INDEX idx_billing_transactions_subscription_id ON billing_transactions(subscription_id);
CREATE INDEX idx_billing_transactions_status ON billing_transactions(status);
CREATE INDEX idx_billing_transactions_transaction_type ON billing_transactions(transaction_type);
CREATE INDEX idx_billing_transactions_created_at ON billing_transactions(created_at DESC);
CREATE INDEX idx_billing_transactions_invoice_number ON billing_transactions(invoice_number);
CREATE INDEX idx_billing_transactions_stripe_payment_intent ON billing_transactions(stripe_payment_intent_id);

-- Comments
COMMENT ON TABLE billing_transactions IS 'All billing transactions and payment records';
COMMENT ON COLUMN billing_transactions.total_amount IS 'amount + tax_amount';
COMMENT ON COLUMN billing_transactions.invoice_number IS 'Unique invoice number (e.g., INV-2025-001)';

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES billing_transactions(id) ON DELETE SET NULL,
  
  -- Invoice identification
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',        -- Not yet finalized
    'sent',         -- Sent to customer
    'paid',         -- Fully paid
    'partially_paid', -- Partially paid
    'overdue',      -- Past due date
    'cancelled',    -- Cancelled
    'refunded'      -- Refunded
  )),
  
  -- Billing information
  bill_to_name TEXT NOT NULL,
  bill_to_email TEXT NOT NULL,
  bill_to_address TEXT,
  bill_to_tax_id TEXT,
  
  -- Line items
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  /* Example line_items structure:
  [
    {
      "description": "Professional Plan - Monthly",
      "quantity": 1,
      "unit_price": 799.00,
      "amount": 799.00
    },
    {
      "description": "Additional AI Credits",
      "quantity": 1000,
      "unit_price": 0.10,
      "amount": 100.00
    }
  ]
  */
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0, -- e.g., 18.00 for 18% KDV
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  
  -- Payment tracking
  paid_at TIMESTAMPTZ,
  
  -- File storage
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Email tracking
  sent_at TIMESTAMPTZ,
  sent_to TEXT,
  
  -- Notes
  notes TEXT,
  customer_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_transaction_id ON invoices(transaction_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Comments
COMMENT ON TABLE invoices IS 'Invoice records with line items and payment tracking';
COMMENT ON COLUMN invoices.line_items IS 'JSONB array of invoice line items';
COMMENT ON COLUMN invoices.amount_due IS 'total_amount - amount_paid';

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Payment method details
  method_type TEXT NOT NULL CHECK (method_type IN (
    'credit_card',
    'debit_card',
    'bank_account',
    'paypal',
    'other'
  )),
  
  -- Card details (masked)
  card_brand TEXT, -- 'visa', 'mastercard', 'amex'
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Bank details (masked)
  bank_name TEXT,
  account_last4 TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- External IDs
  stripe_payment_method_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payment_methods_tenant_id ON payment_methods(tenant_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_stripe_payment_method ON payment_methods(stripe_payment_method_id);

-- Unique constraint: Only one default payment method per tenant
CREATE UNIQUE INDEX idx_payment_methods_tenant_default 
  ON payment_methods(tenant_id) 
  WHERE is_default = true;

-- Comments
COMMENT ON TABLE payment_methods IS 'Stored payment methods for tenants';
COMMENT ON COLUMN payment_methods.card_last4 IS 'Last 4 digits of card (masked)';

-- ============================================================================
-- BILLING ALERTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationships
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES billing_transactions(id) ON DELETE SET NULL,
  
  -- Alert details
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'payment_failed',
    'payment_due',
    'trial_ending',
    'subscription_expiring',
    'usage_limit_reached',
    'invoice_overdue'
  )),
  
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN (
    'info',
    'warning',
    'error',
    'critical'
  )),
  
  -- Message
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  
  -- Actions taken
  action_taken TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_billing_alerts_tenant_id ON billing_alerts(tenant_id);
CREATE INDEX idx_billing_alerts_alert_type ON billing_alerts(alert_type);
CREATE INDEX idx_billing_alerts_severity ON billing_alerts(severity);
CREATE INDEX idx_billing_alerts_is_read ON billing_alerts(is_read);
CREATE INDEX idx_billing_alerts_created_at ON billing_alerts(created_at DESC);

-- Comments
COMMENT ON TABLE billing_alerts IS 'Billing-related alerts and notifications';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_billing_transactions_updated_at
  BEFORE UPDATE ON billing_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_invoice_number TEXT;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
      CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    -- Generate new invoice number
    new_invoice_number := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    NEW.invoice_number := new_invoice_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Update invoice status based on payment
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate amount due
  NEW.amount_due := NEW.total_amount - NEW.amount_paid;
  
  -- Update status based on payment
  IF NEW.amount_paid >= NEW.total_amount THEN
    NEW.status := 'paid';
    NEW.paid_at := NOW();
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status := 'partially_paid';
  ELSIF NEW.due_date < CURRENT_DATE AND NEW.status NOT IN ('paid', 'cancelled', 'refunded') THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_status_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_alerts ENABLE ROW LEVEL SECURITY;

-- Billing Transactions: Tenant users can view their own, super admins can view all
CREATE POLICY "Users can view their billing transactions"
  ON billing_transactions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all billing transactions"
  ON billing_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Invoices: Same as billing_transactions
CREATE POLICY "Users can view their invoices"
  ON invoices FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all invoices"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Payment Methods: Tenant users can manage their own
CREATE POLICY "Users can manage their payment methods"
  ON payment_methods FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Billing Alerts: Tenant users can view their own
CREATE POLICY "Users can view their billing alerts"
  ON billing_alerts FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all billing alerts"
  ON billing_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Revenue summary view
CREATE OR REPLACE VIEW revenue_summary_view AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN status = 'completed' AND transaction_type = 'subscription_payment' THEN total_amount ELSE 0 END) as subscription_revenue,
  SUM(CASE WHEN status = 'refunded' THEN refund_amount ELSE 0 END) as total_refunds,
  COUNT(DISTINCT tenant_id) as paying_tenants
FROM billing_transactions
WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

COMMENT ON VIEW revenue_summary_view IS 'Monthly revenue summary with refunds';

-- Overdue invoices view
CREATE OR REPLACE VIEW overdue_invoices_view AS
SELECT 
  i.id,
  i.invoice_number,
  i.tenant_id,
  t.company_name,
  i.invoice_date,
  i.due_date,
  i.total_amount,
  i.amount_due,
  i.currency,
  CURRENT_DATE - i.due_date as days_overdue
FROM invoices i
JOIN tenants t ON t.id = i.tenant_id
WHERE i.status = 'overdue'
  AND i.amount_due > 0
ORDER BY i.due_date ASC;

COMMENT ON VIEW overdue_invoices_view IS 'All overdue invoices with tenant details';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 062: Billing schema created successfully!';
  RAISE NOTICE '📦 Created tables: billing_transactions, invoices, payment_methods, billing_alerts';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '📊 Helper views created: revenue_summary_view, overdue_invoices_view';
END $$;

