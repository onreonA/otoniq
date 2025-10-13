# Infrastructure Layer

## Amaç

External integrations ve technical implementations

## İçerik

### `database/supabase/`

Database implementation

- Supabase client setup
- Repository implementations (IProductRepository → ProductRepository)
- SQL migrations
- Database types

### `auth/`

Authentication implementation

- Supabase Auth
- JWT handling
- Session management

### `apis/`

External API clients

- N8N (automation)
- Odoo (ERP)
- Shopify (e-commerce)
- Marketplaces (Trendyol, Amazon, etc.)

### `http/`

HTTP client setup

- Axios configuration
- Interceptors
- Error handling

## Örnekler

```typescript
// database/supabase/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return this.toDomain(data);
  }

  async save(product: Product): Promise<Product> {
    const { data, error } = await this.supabase
      .from('products')
      .insert(this.toPersistence(product))
      .select()
      .single();

    if (error) throw error;
    return this.toDomain(data);
  }

  private toDomain(raw: any): Product {
    return new Product(
      raw.id,
      raw.tenant_id,
      raw.sku,
      raw.title,
      raw.price,
      raw.stock
    );
  }

  private toPersistence(product: Product): any {
    return {
      id: product.id,
      tenant_id: product.tenantId,
      sku: product.sku,
      title: product.title,
      price: product.price,
      stock: product.stock,
    };
  }
}

// apis/odoo/OdooClient.ts
export class OdooClient {
  constructor(
    private url: string,
    private db: string,
    private username: string,
    private password: string
  ) {}

  async authenticate(): Promise<number> {
    // XML-RPC authentication
  }

  async getProducts(): Promise<any[]> {
    // Fetch products from Odoo
  }
}
```

## Prensip

**Infrastructure implements interfaces defined in Domain**
