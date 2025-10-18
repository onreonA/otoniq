# 🎯 FAZ 2: SUPER ADMIN PANEL - İŞ PLANI

**Başlangıç:** 18 Ekim 2025  
**Tahmini Süre:** 2-3 Hafta  
**Öncelik:** Yüksek  
**Durum:** 🟡 Başlatıldı

---

## 📊 GENEL BAKIŞ

Super Admin Panel, platform yöneticilerinin tüm tenant'ları (müşterileri) yönetmesini, subscription planlarını kontrol etmesini ve sistem genelinde analitik görmesini sağlayan kritik bir modüldür.

---

## 🎯 HEDEFLER

1. ✅ Tenant (müşteri) oluşturma ve yönetimi
2. ✅ Subscription plan yönetimi
3. ✅ Kullanım analitikleri ve raporlama
4. ✅ Billing ve ödeme takibi
5. ✅ Sistem geneli istatistikler

---

## 📋 DETAYLI İŞ PLANI

### 🗄️ **SPRINT 1: DATABASE SCHEMA (2-3 gün)**

#### **1.1 Subscription Plans Table**
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  plan_name TEXT NOT NULL, -- 'starter', 'professional', 'enterprise'
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  features JSONB, -- {max_products: 100, max_users: 5, ai_credits: 1000}
  limits JSONB, -- {api_calls_per_day: 1000, storage_gb: 10}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **1.2 Tenant Subscriptions Table**
```sql
CREATE TABLE tenant_subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT, -- 'active', 'trial', 'suspended', 'cancelled'
  billing_cycle TEXT, -- 'monthly', 'yearly'
  current_period_start DATE,
  current_period_end DATE,
  trial_ends_at DATE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **1.3 Usage Tracking Table**
```sql
CREATE TABLE tenant_usage (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  metric_name TEXT, -- 'api_calls', 'storage_used', 'ai_credits_used'
  metric_value BIGINT,
  recorded_at DATE,
  metadata JSONB
);
```

#### **1.4 Billing Transactions Table**
```sql
CREATE TABLE billing_transactions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  subscription_id UUID REFERENCES tenant_subscriptions(id),
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'TRY',
  status TEXT, -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT,
  stripe_payment_id TEXT,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Dosyalar:**
- `src/infrastructure/database/supabase/migrations/061_subscription_schema.sql`
- `src/infrastructure/database/supabase/migrations/062_billing_schema.sql`
- `src/infrastructure/database/supabase/migrations/063_usage_tracking_schema.sql`

---

### 🔧 **SPRINT 2: SERVICE LAYER (3-4 gün)**

#### **2.1 SubscriptionService**
```typescript
class SubscriptionService {
  // Plan Management
  async getAllPlans()
  async getPlanById(planId: string)
  async createPlan(data: CreatePlanRequest)
  async updatePlan(planId: string, data: UpdatePlanRequest)
  
  // Tenant Subscription Management
  async getTenantSubscription(tenantId: string)
  async createSubscription(tenantId: string, planId: string)
  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionRequest)
  async cancelSubscription(subscriptionId: string)
  async renewSubscription(subscriptionId: string)
  
  // Trial Management
  async startTrial(tenantId: string, planId: string, days: number)
  async convertTrialToPaid(tenantId: string, planId: string)
  
  // Usage Limits
  async checkUsageLimit(tenantId: string, metric: string): Promise<boolean>
  async incrementUsage(tenantId: string, metric: string, value: number)
}
```

**Dosya:** `src/infrastructure/services/SubscriptionService.ts`

#### **2.2 BillingService**
```typescript
class BillingService {
  // Transaction Management
  async createTransaction(data: CreateTransactionRequest)
  async getTransactionHistory(tenantId: string)
  async getTransactionById(transactionId: string)
  
  // Payment Processing
  async processPayment(tenantId: string, amount: number)
  async refundPayment(transactionId: string)
  
  // Invoice Management
  async generateInvoice(transactionId: string)
  async sendInvoiceEmail(transactionId: string)
  
  // Revenue Analytics
  async getTotalRevenue(startDate: Date, endDate: Date)
  async getRevenueByPlan()
  async getMRR(): Promise<number> // Monthly Recurring Revenue
  async getChurnRate(): Promise<number>
}
```

**Dosya:** `src/infrastructure/services/BillingService.ts`

#### **2.3 TenantManagementService**
```typescript
class TenantManagementService {
  // Tenant CRUD
  async getAllTenants(filters?: TenantFilters)
  async getTenantById(tenantId: string)
  async createTenant(data: CreateTenantRequest)
  async updateTenant(tenantId: string, data: UpdateTenantRequest)
  async deleteTenant(tenantId: string)
  
  // Tenant Status
  async suspendTenant(tenantId: string, reason: string)
  async activateTenant(tenantId: string)
  
  // Tenant Analytics
  async getTenantStats(tenantId: string)
  async getTenantUsage(tenantId: string, startDate: Date, endDate: Date)
  
  // Bulk Operations
  async bulkUpdateTenants(tenantIds: string[], data: Partial<Tenant>)
  async exportTenantsToCSV()
}
```

**Dosya:** `src/infrastructure/services/TenantManagementService.ts`

#### **2.4 UsageAnalyticsService**
```typescript
class UsageAnalyticsService {
  // System-wide Analytics
  async getSystemStats()
  async getActiveTenantsCount()
  async getTotalUsersCount()
  
  // Tenant Usage
  async getTenantUsageByMetric(tenantId: string, metric: string)
  async recordUsage(tenantId: string, metric: string, value: number)
  
  // Aggregations
  async getTopTenantsByUsage(metric: string, limit: number)
  async getUsageTrends(metric: string, days: number)
  
  // Alerts
  async checkUsageThresholds(tenantId: string)
  async sendUsageAlert(tenantId: string, metric: string)
}
```

**Dosya:** `src/infrastructure/services/UsageAnalyticsService.ts`

---

### 🎨 **SPRINT 3: ADMIN UI - TENANT MANAGEMENT (4-5 gün)**

#### **3.1 Tenant List Page**
**Dosya:** `src/presentation/pages/admin/tenants/page.tsx`

**Features:**
- ✅ Tenant listesi (tablo görünümü)
- ✅ Search & filter (company name, status, plan)
- ✅ Pagination
- ✅ Sort (by date, revenue, users)
- ✅ Bulk actions (suspend, activate, delete)
- ✅ Export to CSV

**Components:**
- `TenantTable.tsx` - Ana tablo
- `TenantFilters.tsx` - Filtreleme UI
- `TenantActions.tsx` - Bulk action buttons

#### **3.2 Create Tenant Modal**
**Dosya:** `src/presentation/pages/admin/tenants/components/CreateTenantModal.tsx`

**Multi-step Form:**
1. **Step 1: Company Information**
   - Company name
   - Domain (subdomain)
   - Contact email
   - Phone number

2. **Step 2: Subscription Plan**
   - Plan selection (Starter, Pro, Enterprise)
   - Billing cycle (Monthly/Yearly)
   - Trial option (14 days free)

3. **Step 3: Admin User**
   - Admin name
   - Admin email
   - Auto-generate password
   - Send welcome email

4. **Step 4: Configuration**
   - Initial settings
   - Feature flags
   - Custom limits

**Validation:**
- Zod schema validation
- Unique domain check
- Email validation

#### **3.3 Tenant Detail Page**
**Dosya:** `src/presentation/pages/admin/tenants/[id]/page.tsx`

**Tabs:**
1. **Overview**
   - Company info
   - Subscription status
   - Key metrics (users, products, orders)
   - Quick actions (suspend, edit, delete)

2. **Subscription**
   - Current plan details
   - Billing history
   - Usage vs limits
   - Upgrade/downgrade options

3. **Users**
   - User list
   - Add/remove users
   - Role management

4. **Usage Analytics**
   - API calls chart
   - Storage usage
   - AI credits usage
   - Feature usage breakdown

5. **Activity Log**
   - Recent activities
   - Login history
   - Audit trail

6. **Settings**
   - Integration configs
   - Custom settings
   - Feature flags

---

### 📊 **SPRINT 4: ADMIN UI - SUBSCRIPTION MANAGEMENT (3-4 gün)**

#### **4.1 Subscription Plans Page**
**Dosya:** `src/presentation/pages/admin/subscriptions/plans/page.tsx`

**Features:**
- ✅ Plan list (card view)
- ✅ Create new plan
- ✅ Edit plan
- ✅ Activate/deactivate plan
- ✅ Plan comparison table

**Components:**
- `PlanCard.tsx` - Plan display card
- `PlanModal.tsx` - Create/edit modal
- `PlanFeaturesEditor.tsx` - Features JSONB editor

#### **4.2 Active Subscriptions Page**
**Dosya:** `src/presentation/pages/admin/subscriptions/active/page.tsx`

**Features:**
- ✅ All active subscriptions list
- ✅ Filter by plan, status
- ✅ Renewal dates
- ✅ Quick actions (cancel, renew, upgrade)

#### **4.3 Subscription Analytics**
**Dosya:** `src/presentation/pages/admin/subscriptions/analytics/page.tsx`

**Metrics:**
- 📊 MRR (Monthly Recurring Revenue)
- 📊 ARR (Annual Recurring Revenue)
- 📊 Churn rate
- 📊 LTV (Lifetime Value)
- 📊 Plan distribution chart
- 📊 Revenue trends

---

### 💰 **SPRINT 5: BILLING INTEGRATION (3-4 gün)**

#### **5.1 Billing Dashboard**
**Dosya:** `src/presentation/pages/admin/billing/page.tsx`

**Features:**
- ✅ Total revenue
- ✅ Pending payments
- ✅ Failed transactions
- ✅ Refund requests
- ✅ Revenue chart

#### **5.2 Transaction Management**
**Dosya:** `src/presentation/pages/admin/billing/transactions/page.tsx`

**Features:**
- ✅ Transaction list
- ✅ Filter by status, date, tenant
- ✅ Transaction details modal
- ✅ Refund processing
- ✅ Invoice generation

#### **5.3 Stripe Integration (Opsiyonel)**
**Dosya:** `src/infrastructure/services/StripeService.ts`

**Features:**
- ✅ Payment processing
- ✅ Subscription webhooks
- ✅ Invoice creation
- ✅ Customer portal

---

### 📈 **SPRINT 6: USAGE ANALYTICS (2-3 gün)**

#### **6.1 System Overview Dashboard**
**Dosya:** `src/presentation/pages/admin/analytics/overview/page.tsx`

**Metrics:**
- 📊 Total tenants
- 📊 Active users
- 📊 Total revenue
- 📊 API calls (24h)
- 📊 Storage used
- 📊 AI credits consumed

#### **6.2 Tenant Usage Dashboard**
**Dosya:** `src/presentation/pages/admin/analytics/usage/page.tsx`

**Features:**
- ✅ Usage by tenant (table)
- ✅ Top 10 tenants by metric
- ✅ Usage trends (chart)
- ✅ Threshold alerts
- ✅ Export reports

#### **6.3 Feature Usage Analytics**
**Dosya:** `src/presentation/pages/admin/analytics/features/page.tsx`

**Metrics:**
- 📊 Most used features
- 📊 Feature adoption rate
- 📊 Feature usage by plan
- 📊 Inactive features

---

## 🔄 IMPLEMENTATION ORDER

### **Week 1: Database & Services**
**Day 1-2:** Database migrations (Sprint 1)
**Day 3-5:** Service layer implementation (Sprint 2)

### **Week 2: Admin UI - Core**
**Day 1-3:** Tenant management UI (Sprint 3.1-3.2)
**Day 4-5:** Tenant detail page (Sprint 3.3)

### **Week 3: Subscriptions & Analytics**
**Day 1-2:** Subscription management UI (Sprint 4)
**Day 3-4:** Usage analytics UI (Sprint 6)
**Day 5:** Billing dashboard (Sprint 5.1-5.2)

---

## ✅ ACCEPTANCE CRITERIA

### **Tenant Management**
- [ ] Super admin can create new tenant with multi-step form
- [ ] Super admin can view all tenants in a paginated table
- [ ] Super admin can search/filter tenants
- [ ] Super admin can suspend/activate tenants
- [ ] Super admin can view detailed tenant information
- [ ] Super admin can delete tenants (with confirmation)

### **Subscription Management**
- [ ] Super admin can create/edit subscription plans
- [ ] Super admin can assign plans to tenants
- [ ] Super admin can view subscription status
- [ ] System tracks usage against limits
- [ ] System prevents actions when limits exceeded
- [ ] Trial periods work correctly

### **Billing**
- [ ] All transactions are recorded
- [ ] Invoices can be generated
- [ ] Revenue metrics are accurate
- [ ] Failed payments are tracked
- [ ] Refunds can be processed

### **Analytics**
- [ ] System-wide stats are displayed
- [ ] Tenant usage is tracked accurately
- [ ] Charts and graphs render correctly
- [ ] Data can be exported to CSV
- [ ] Real-time updates work

---

## 🧪 TESTING CHECKLIST

### **Unit Tests**
- [ ] SubscriptionService tests
- [ ] BillingService tests
- [ ] TenantManagementService tests
- [ ] UsageAnalyticsService tests

### **Integration Tests**
- [ ] Tenant creation flow
- [ ] Subscription assignment flow
- [ ] Usage tracking flow
- [ ] Billing transaction flow

### **E2E Tests**
- [ ] Create tenant end-to-end
- [ ] Assign subscription plan
- [ ] View tenant analytics
- [ ] Process payment

---

## 📦 DELIVERABLES

### **Database**
- ✅ 3 migration files
- ✅ Updated types.ts

### **Services**
- ✅ SubscriptionService.ts
- ✅ BillingService.ts
- ✅ TenantManagementService.ts
- ✅ UsageAnalyticsService.ts

### **UI Components**
- ✅ 15+ new components
- ✅ 8+ new pages
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

### **Documentation**
- ✅ API documentation
- ✅ User guide
- ✅ Admin manual

---

## 🚀 BAŞLAYALIM!

**İlk Adım:** Database schema migration dosyalarını oluştur
**Dosya:** `061_subscription_schema.sql`

Hazır mısın? 🎯

