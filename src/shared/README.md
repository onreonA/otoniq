# Shared Layer

## Amaç

Tüm layer'lar tarafından kullanılabilen utilities, types, constants

## İçerik

### `types/`

Shared TypeScript types & interfaces

- API response types
- Common types
- Global type definitions

### `utils/`

Utility functions

- Formatters (date, currency, etc.)
- Validators
- Helpers (string manipulation, etc.)

### `constants/`

Application constants

- API endpoints
- App config
- Status codes
- Marketplace types

### `config/`

Configuration files

- Environment variables
- App configuration

## Örnekler

```typescript
// utils/formatters.ts
export const formatCurrency = (amount: number, currency = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return format(date, 'dd.MM.yyyy HH:mm');
};

// constants/marketplace.constants.ts
export const MARKETPLACE_TYPES = {
  TRENDYOL: 'trendyol',
  AMAZON: 'amazon',
  HEPSIBURADA: 'hepsiburada',
  N11: 'n11',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// config/env.ts
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  n8n: {
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// types/common.types.ts
export type UUID = string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
```

## Prensip

**Shared utilities are pure functions with no side effects**
