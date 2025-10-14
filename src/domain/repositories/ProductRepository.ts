/**
 * Product Repository Interface
 *
 * Defines the contract for product data persistence.
 * Follows Repository pattern for clean architecture.
 */

import { Product } from '../entities/Product';

export interface ProductFilters {
  tenant_id?: string;
  status?: 'active' | 'inactive' | 'draft' | 'archived';
  product_type?: 'simple' | 'variable' | 'grouped' | 'external';
  categories?: string[];
  tags?: string[];
  search?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  created_after?: Date;
  created_before?: Date;
}

export interface ProductSortOptions {
  field: 'name' | 'created_at' | 'updated_at' | 'price';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find product by SKU within tenant
   */
  findBySku(tenantId: string, sku: string): Promise<Product | null>;

  /**
   * Find products with filters and pagination
   */
  findMany(
    filters: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>>;

  /**
   * Find all products for a tenant
   */
  findByTenant(
    tenantId: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>>;

  /**
   * Find products by category
   */
  findByCategory(
    tenantId: string,
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>>;

  /**
   * Search products by name or description
   */
  search(
    tenantId: string,
    query: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>>;

  /**
   * Create new product
   */
  create(product: Product): Promise<Product>;

  /**
   * Update existing product
   */
  update(id: string, productData: Partial<Product>): Promise<Product>;

  /**
   * Delete product
   */
  delete(id: string): Promise<void>;

  /**
   * Check if SKU exists within tenant
   */
  skuExists(
    tenantId: string,
    sku: string,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * Get product count by status
   */
  getCountByStatus(tenantId: string): Promise<Record<string, number>>;

  /**
   * Get low stock products
   */
  getLowStockProducts(tenantId: string, threshold: number): Promise<Product[]>;

  /**
   * Get products created in date range
   */
  getProductsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Product[]>;

  /**
   * Bulk update product status
   */
  bulkUpdateStatus(
    productIds: string[],
    status: 'active' | 'inactive' | 'draft' | 'archived'
  ): Promise<void>;

  /**
   * Bulk delete products
   */
  bulkDelete(productIds: string[]): Promise<void>;

  /**
   * Get product statistics
   */
  getStatistics(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    draft: number;
    archived: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
  }>;
}
