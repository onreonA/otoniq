# 🏗️ OTONIQ.AI - MİMARİ DOKÜMANTASYONU

## 📐 GENEL MİMARİ

### Proje Tipi
**Multi-Tenant SaaS Platform** - E-ticaret ve E-ihracat Otomasyon Platformu

### Mimari Yaklaşım
**Clean Architecture** (Katmanlı Mimari + Domain-Driven Design)

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│          (React Components, Pages, UI)               │
│                    ↓ depends on ↓                    │
├─────────────────────────────────────────────────────┤
│               APPLICATION LAYER                      │
│     (Use Cases, Business Logic, Services)            │
│                    ↓ depends on ↓                    │
├─────────────────────────────────────────────────────┤
│                  DOMAIN LAYER                        │
│    (Entities, Value Objects, Repository Interfaces)  │
│                    ↑ implemented by ↑                │
├─────────────────────────────────────────────────────┤
│              INFRASTRUCTURE LAYER                    │
│   (External APIs, Database, Auth, File Storage)      │
└─────────────────────────────────────────────────────┘
```

**Temel Prensipler:**
- Bağımlılıklar içe doğru (Domain hiçbir şeye bağımlı değil)
- Domain layer pure business logic
- Infrastructure detayları dışarıda
- Dependency Injection kullanımı
- Interface-based programming

---

## 📁 KLASÖR YAPISI

```
src/
│
├── domain/                      # CORE BUSINESS LOGIC
│   ├── entities/                # Domain entities
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Tenant.ts
│   │   ├── User.ts
│   │   └── Marketplace.ts
│   │
│   ├── value-objects/           # Immutable value types
│   │   ├── Money.ts
│   │   ├── SKU.ts
│   │   └── Email.ts
│   │
│   ├── repositories/            # Repository INTERFACES (contract)
│   │   ├── IProductRepository.ts
│   │   ├── IOrderRepository.ts
│   │   └── ITenantRepository.ts
│   │
│   └── services/                # Domain services
│       └── PricingService.ts
│
├── application/                 # USE CASES & APPLICATION LOGIC
│   ├── use-cases/               # Business use cases
│   │   ├── products/
│   │   │   ├── CreateProduct.usecase.ts
│   │   │   ├── UpdateProduct.usecase.ts
│   │   │   ├── DeleteProduct.usecase.ts
│   │   │   ├── ListProducts.usecase.ts
│   │   │   └── SyncProductToMarketplace.usecase.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── CreateOrder.usecase.ts
│   │   │   ├── ProcessOrder.usecase.ts
│   │   │   └── SyncOrderToOdoo.usecase.ts
│   │   │
│   │   ├── automation/
│   │   │   └── TriggerN8NWorkflow.usecase.ts
│   │   │
│   │   └── tenants/
│   │       ├── CreateTenant.usecase.ts
│   │       └── ManageTenant.usecase.ts
│   │
│   ├── services/                # Application services
│   │   ├── ProductService.ts
│   │   ├── OrderService.ts
│   │   ├── MarketplaceService.ts
│   │   ├── AutomationService.ts
│   │   └── TenantService.ts
│   │
│   └── dtos/                    # Data Transfer Objects
│       ├── CreateProductDto.ts
│       └── UpdateOrderDto.ts
│
├── infrastructure/              # EXTERNAL INTEGRATIONS
│   ├── database/
│   │   └── supabase/
│   │       ├── client.ts        # Supabase client setup
│   │       ├── types.ts         # Database types
│   │       │
│   │       ├── repositories/    # Repository IMPLEMENTATIONS
│   │       │   ├── ProductRepository.ts
│   │       │   ├── OrderRepository.ts
│   │       │   └── TenantRepository.ts
│   │       │
│   │       └── migrations/      # SQL migration files
│   │           ├── 001_initial_schema.sql
│   │           ├── 002_add_marketplace_tables.sql
│   │           └── 003_add_rls_policies.sql
│   │
│   ├── auth/
│   │   ├── supabase-auth.ts    # Auth implementation
│   │   └── auth-provider.tsx   # React auth provider
│   │
│   ├── apis/                    # External API clients
│   │   ├── n8n/
│   │   │   ├── N8NClient.ts
│   │   │   └── webhooks.ts
│   │   │
│   │   ├── odoo/
│   │   │   ├── OdooClient.ts
│   │   │   └── xmlrpc.ts
│   │   │
│   │   ├── shopify/
│   │   │   ├── ShopifyClient.ts
│   │   │   └── webhooks.ts
│   │   │
│   │   └── marketplaces/
│   │       ├── trendyol/
│   │       │   └── TrendyolClient.ts
│   │       └── amazon/
│   │           └── AmazonClient.ts
│   │
│   └── http/
│       ├── axios-client.ts      # Axios instance
│       └── interceptors.ts      # Request/Response interceptors
│
├── presentation/                # UI LAYER (React)
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductListPage.tsx
│   │   │   ├── ProductCreatePage.tsx
│   │   │   └── ProductEditPage.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderListPage.tsx
│   │   │   └── OrderDetailPage.tsx
│   │   │
│   │   └── super-admin/
│   │       ├── TenantManagementPage.tsx
│   │       └── SystemMonitoringPage.tsx
│   │
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   │
│   │   ├── products/            # Product-specific components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductTable.tsx
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── DashboardLayout.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useProducts.ts
│   │   └── useOrders.ts
│   │
│   └── store/                   # Zustand stores
│       ├── index.ts
│       ├── auth/
│       │   ├── authStore.ts
│       │   └── authStore.types.ts
│       ├── tenant/
│       │   └── tenantStore.ts
│       ├── products/
│       │   └── productStore.ts
│       └── ui/
│           └── uiStore.ts
│
└── shared/                      # SHARED UTILITIES
    ├── types/                   # Shared TypeScript types
    │   ├── auth.types.ts
    │   ├── api.types.ts
    │   └── common.types.ts
    │
    ├── utils/                   # Utility functions
    │   ├── formatters.ts
    │   ├── validators.ts
    │   └── helpers.ts
    │
    ├── constants/               # Constants
    │   ├── api.constants.ts
    │   ├── app.constants.ts
    │   └── marketplace.constants.ts
    │
    └── config/                  # Configuration
        ├── env.ts
        └── app.config.ts
```

---

## 🗄️ DATABASE SCHEMA (Supabase PostgreSQL)

### Core Tables

```sql
-- Multi-tenant ana tablosu
tenants (
  id: uuid PRIMARY KEY,
  company_name: text NOT NULL,
  domain: text UNIQUE,
  subscription_plan: text,
  subscription_status: text,
  n8n_webhook_url: text,
  odoo_api_config: jsonb,
  shopify_store_config: jsonb,
  settings: jsonb,
  created_at: timestamp,
  updated_at: timestamp
)

-- Kullanıcılar (super admin + tenant users)
users (
  id: uuid PRIMARY KEY REFERENCES auth.users,
  tenant_id: uuid REFERENCES tenants (NULL = super admin),
  email: text NOT NULL,
  role: text (super_admin, tenant_admin, tenant_user),
  full_name: text,
  created_at: timestamp
)

-- Ürünler (tenant-isolated)
products (
  id: uuid PRIMARY KEY,
  tenant_id: uuid REFERENCES tenants,
  sku: text NOT NULL,
  title: text NOT NULL,
  description: text,
  price: decimal,
  cost: decimal,
  stock_quantity: integer,
  odoo_product_id: text,
  shopify_product_id: text,
  images: jsonb,
  attributes: jsonb,
  created_at: timestamp,
  updated_at: timestamp,
  
  UNIQUE(tenant_id, sku)
)

-- Pazaryeri bağlantıları
marketplace_connections (
  id: uuid PRIMARY KEY,
  tenant_id: uuid REFERENCES tenants,
  marketplace_type: text,
  credentials: jsonb, -- encrypted
  status: text,
  last_sync_at: timestamp,
  settings: jsonb
)

-- Ürün-pazaryeri eşlemeleri
marketplace_listings (
  id: uuid PRIMARY KEY,
  product_id: uuid REFERENCES products,
  marketplace_connection_id: uuid REFERENCES marketplace_connections,
  external_product_id: text,
  status: text,
  price_override: decimal,
  stock_override: integer,
  last_synced_at: timestamp
)

-- Siparişler
orders (
  id: uuid PRIMARY KEY,
  tenant_id: uuid REFERENCES tenants,
  marketplace_connection_id: uuid,
  external_order_id: text,
  order_number: text,
  customer_info: jsonb,
  items: jsonb,
  total_amount: decimal,
  status: text,
  odoo_sale_order_id: text,
  created_at: timestamp
)
```

### Row Level Security (RLS)

```sql
-- Tenant izolasyonu - Kullanıcılar sadece kendi verilerini görür
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin'
  );

-- Benzer politikalar tüm tenant-specific tablolara uygulanır
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Flow
1. Kullanıcı email/password ile giriş
2. Supabase Auth JWT token üretir
3. Token'da user_id ve role bilgisi
4. Frontend token'ı her istekte gönderir
5. Supabase RLS otomatik yetki kontrolü

### Role Hierarchy
```
super_admin     → Tüm tenant'ları görür/yönetir
  ↓
tenant_admin    → Kendi tenant'ının tüm işlemlerini yapar
  ↓
tenant_user     → Kısıtlı işlemler (sadece okuma vs.)
```

---

## 🔄 DATA FLOW

### Ürün Oluşturma Örneği

```typescript
1. USER ACTION (Presentation)
   ↓
   ProductCreatePage.tsx
   └─> useProducts hook
       └─> productStore.createProduct()

2. APPLICATION LAYER
   ↓
   CreateProduct.usecase.ts
   └─> Validation (Zod)
   └─> Business rules check
   └─> ProductService.create()

3. DOMAIN LAYER
   ↓
   Product entity
   └─> Domain validations
   
4. INFRASTRUCTURE LAYER
   ↓
   ProductRepository.create()
   └─> Supabase insert
   └─> Return Product entity

5. SUCCESS
   ↓
   Store updated
   └─> UI re-renders
   └─> Toast notification
```

---

## 🔌 EXTERNAL INTEGRATIONS

### N8N Otomasyon
**Flow:**
```
Otoniq.ai Event → Webhook → N8N Workflow → External Actions
                                    ↓
                            - Odoo API call
                            - Email notification
                            - Shopify update
                            - Custom logic
```

### Odoo ERP
**XML-RPC Integration:**
```typescript
OdooClient
  ├─> authenticate()
  ├─> getProducts()
  ├─> createSaleOrder()
  └─> updateInventory()
```

### Shopify
**REST API Integration:**
```typescript
ShopifyClient
  ├─> getProducts()
  ├─> createProduct()
  ├─> syncInventory()
  └─> getOrders()
```

### Marketplace (Trendyol vb.)
**REST API Integration:**
```typescript
TrendyolClient
  ├─> listProduct()
  ├─> updatePrice()
  ├─> getOrders()
  └─> approveOrder()
```

---

## 📊 STATE MANAGEMENT

### Zustand Stores

```typescript
// Auth Store
authStore:
  - user: User | null
  - token: string | null
  - isAuthenticated: boolean
  - login()
  - logout()
  - refreshToken()

// Tenant Store  
tenantStore:
  - currentTenant: Tenant | null
  - isSuperAdmin: boolean
  - switchTenant(id: string) // Super admin için

// Product Store
productStore:
  - products: Product[]
  - loading: boolean
  - error: string | null
  - fetchProducts()
  - createProduct()
  - updateProduct()
  - deleteProduct()

// UI Store
uiStore:
  - modals: { [key: string]: boolean }
  - toasts: Toast[]
  - loading: { [key: string]: boolean }
  - openModal()
  - showToast()
```

---

## 🔒 SECURITY

### Güvenlik Katmanları
1. **Supabase RLS** - Database seviyesinde tenant izolasyonu
2. **JWT Token** - Her istek için authentication
3. **Role-based Guards** - Frontend route protection
4. **API Key Encryption** - Hassas bilgiler encrypted
5. **HTTPS Only** - Tüm communication encrypted
6. **Webhook Signatures** - N8N webhook validation

---

## 🚀 DEPLOYMENT

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_BASE_URL=
VITE_APP_ENV=production
```

---

## 📝 BEST PRACTICES

1. **Her layer kendi sorumluluğu**
2. **Repository pattern ile database abstraction**
3. **Use cases ile business logic izolasyonu**
4. **TypeScript strict mode**
5. **Error boundaries**
6. **Loading states**
7. **Optimistic updates**
8. **Cache strategy (@tanstack/react-query)**

---

**Son Güncelleme:** 12 Ekim 2025

