# Presentation Layer

## Amaç

UI components, pages, state management, hooks

## İçerik

### `pages/`

Page components (routing)

- Moved from old structure
- Will be refactored to use new architecture

### `components/`

UI components

- Reusable components
- Feature-specific components
- Layout components

### `hooks/`

Custom React hooks

- `useAuth()` - Authentication
- `useTenant()` - Multi-tenant context
- `useProducts()` - Product CRUD operations
- `useOrders()` - Order management

### `store/`

Zustand state management

- `auth/` - Auth state
- `tenant/` - Tenant state
- `products/` - Products state
- `orders/` - Orders state
- `ui/` - UI state (modals, toasts, loading)

### `router/`

React Router configuration

- Route definitions
- Route guards

## Örnekler

```typescript
// hooks/useProducts.ts
export const useProducts = () => {
  const productStore = useProductStore();
  const { currentTenant } = useTenant();

  const createProduct = async (data: CreateProductDto) => {
    try {
      productStore.setLoading(true);
      const useCase = new CreateProductUseCase(/* dependencies */);
      const product = await useCase.execute(data);
      productStore.addProduct(product);
      toast.success('Ürün oluşturuldu');
      return product;
    } catch (error) {
      toast.error('Hata oluştu');
      throw error;
    } finally {
      productStore.setLoading(false);
    }
  };

  return { createProduct, products: productStore.products };
};

// store/products/productStore.ts
export const useProductStore = create<ProductStore>(set => ({
  products: [],
  loading: false,
  error: null,

  setProducts: products => set({ products }),
  addProduct: product =>
    set(state => ({
      products: [...state.products, product],
    })),
  setLoading: loading => set({ loading }),
  setError: error => set({ error }),
}));
```

## Prensip

**Presentation uses Application layer, not Infrastructure**
