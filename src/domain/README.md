# Domain Layer

## Amaç

İş mantığının kalbi. Hiçbir external dependency yok (UI, Database, API vb.)

## İçerik

### `entities/`

Core business entities (Product, Order, Tenant, User, Marketplace)

- Pure TypeScript classes
- Business logic methods
- Domain rules

### `value-objects/`

Immutable value types (Money, SKU, Email)

- Validation içerir
- Immutable
- Primitive type wrapper'ları

### `repositories/`

Repository INTERFACE'leri (contract/abstract)

- Implementation burada değil!
- Infrastructure layer implement eder
- Dependency Inversion Principle

### `services/`

Domain services

- Entity'ler arasında koordinasyon
- Karmaşık business logic

## Örnekler

```typescript
// entities/Product.ts
export class Product {
  constructor(
    public id: string,
    public tenantId: string,
    public sku: string,
    public title: string,
    public price: number,
    public stock: number
  ) {}

  isInStock(): boolean {
    return this.stock > 0;
  }

  calculateProfit(cost: number): number {
    return this.price - cost;
  }
}

// repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(tenantId: string): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

## Prensip

**Domain layer hiçbir şeye bağımlı değil!**
