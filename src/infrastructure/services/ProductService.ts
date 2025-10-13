/**
 * Product Service
 *
 * Application layer service that coordinates use cases and provides
 * a clean interface for the presentation layer.
 */

import { SupabaseProductRepository } from '../database/supabase/repositories/SupabaseProductRepository';
import {
  CreateProductUseCase,
  CreateProductRequest,
} from '../../application/use-cases/product/CreateProductUseCase';
import {
  GetProductsUseCase,
  GetProductsRequest,
} from '../../application/use-cases/product/GetProductsUseCase';
import {
  UpdateProductUseCase,
  UpdateProductRequest,
} from '../../application/use-cases/product/UpdateProductUseCase';
import {
  DeleteProductUseCase,
  DeleteProductRequest,
} from '../../application/use-cases/product/DeleteProductUseCase';
import { Product } from '../../domain/entities/Product';
import {
  ProductFilters,
  ProductSortOptions,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/ProductRepository';

export class ProductService {
  private productRepository: SupabaseProductRepository;
  private createProductUseCase: CreateProductUseCase;
  private getProductsUseCase: GetProductsUseCase;
  private updateProductUseCase: UpdateProductUseCase;
  private deleteProductUseCase: DeleteProductUseCase;

  constructor() {
    this.productRepository = new SupabaseProductRepository();
    this.createProductUseCase = new CreateProductUseCase(
      this.productRepository
    );
    this.getProductsUseCase = new GetProductsUseCase(this.productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(
      this.productRepository
    );
    this.deleteProductUseCase = new DeleteProductUseCase(
      this.productRepository
    );
  }

  /**
   * Create a new product
   */
  async createProduct(request: CreateProductRequest, userId: string) {
    return await this.createProductUseCase.execute(request, userId);
  }

  /**
   * Get products with filtering and pagination
   */
  async getProducts(request: GetProductsRequest) {
    // Super admin için tüm ürünleri getir
    if (request.tenant_id === 'all') {
      return await this.getAllProducts(request);
    }
    return await this.getProductsUseCase.execute(request);
  }

  /**
   * Get all products (for super admin)
   */
  private async getAllProducts(request: Omit<GetProductsRequest, 'tenant_id'>) {
    try {
      const filters: ProductFilters = {
        ...request.filters,
      };

      const pagination: PaginationOptions = request.pagination || {
        page: 1,
        limit: 20,
      };

      const sort: ProductSortOptions = request.sort || {
        field: 'created_at',
        direction: 'desc',
      };

      const products = await this.productRepository.findMany(
        filters,
        sort,
        pagination
      );

      return {
        success: true,
        products,
      };
    } catch (error) {
      console.error('Get all products error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      return await this.productRepository.findById(id);
    } catch (error) {
      console.error('Get product by ID error:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(request: UpdateProductRequest, userId: string) {
    return await this.updateProductUseCase.execute(request, userId);
  }

  /**
   * Delete product
   */
  async deleteProduct(request: DeleteProductRequest, userId: string) {
    return await this.deleteProductUseCase.execute(request, userId);
  }

  /**
   * Search products
   */
  async searchProducts(
    tenantId: string,
    query: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    try {
      return await this.productRepository.search(
        tenantId,
        query,
        sort,
        pagination
      );
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    tenantId: string,
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    try {
      return await this.productRepository.findByCategory(
        tenantId,
        categoryId,
        sort,
        pagination
      );
    } catch (error) {
      console.error('Get products by category error:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    tenantId: string,
    threshold: number = 10
  ): Promise<Product[]> {
    try {
      return await this.productRepository.getLowStockProducts(
        tenantId,
        threshold
      );
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(
    productIds: string[],
    status: 'active' | 'inactive' | 'draft' | 'archived'
  ): Promise<void> {
    try {
      return await this.productRepository.bulkUpdateStatus(productIds, status);
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw error;
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(productIds: string[]): Promise<void> {
    try {
      return await this.productRepository.bulkDelete(productIds);
    } catch (error) {
      console.error('Bulk delete products error:', error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getProductStatistics(tenantId: string) {
    try {
      return await this.productRepository.getStatistics(tenantId);
    } catch (error) {
      console.error('Get product statistics error:', error);
      throw error;
    }
  }

  /**
   * Check if SKU exists
   */
  async checkSkuExists(
    tenantId: string,
    sku: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      return await this.productRepository.skuExists(tenantId, sku, excludeId);
    } catch (error) {
      console.error('Check SKU exists error:', error);
      throw error;
    }
  }

  /**
   * Get products by date range
   */
  async getProductsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Product[]> {
    try {
      return await this.productRepository.getProductsByDateRange(
        tenantId,
        startDate,
        endDate
      );
    } catch (error) {
      console.error('Get products by date range error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
