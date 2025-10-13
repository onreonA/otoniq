# Application Layer

## Amaç

Use case'ler ve application logic. Domain'i kullanır, infrastructure'ı çağırır.

## İçerik

### `use-cases/`

Specific business operations (CreateProduct, ProcessOrder)

- Tek bir işlem = Tek bir use case
- Orchestration yapar
- Domain entities ve repository'leri kullanır

### `services/`

Application services

- Use case'ler arasında paylaşılan logic
- Birden fazla repository koordine eder
- Transaction management

### `dtos/`

Data Transfer Objects

- API request/response types
- Form data types
- Validation schemas (Zod)

## Örnekler

```typescript
// use-cases/products/CreateProduct.usecase.ts
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    // 1. Validate
    const validatedData = createProductSchema.parse(dto);

    // 2. Check tenant exists
    const tenant = await this.tenantRepository.findById(dto.tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // 3. Create entity
    const product = new Product(
      generateId(),
      dto.tenantId,
      dto.sku,
      dto.title,
      dto.price,
      dto.stock
    );

    // 4. Save
    return await this.productRepository.save(product);
  }
}

// dtos/CreateProductDto.ts
export interface CreateProductDto {
  tenantId: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
}

export const createProductSchema = z.object({
  tenantId: z.string().uuid(),
  sku: z.string().min(1),
  title: z.string().min(3),
  price: z.number().positive(),
  stock: z.number().int().min(0),
});
```

## Prensip

**Application layer orchestrates domain logic**
