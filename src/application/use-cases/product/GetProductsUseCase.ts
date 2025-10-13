/**
 * Get Products Use Case
 *
 * Handles the business logic for retrieving products with filtering and pagination.
 */

import { Product } from '../../../domain/entities/Product';
import {
  ProductRepository,
  ProductFilters,
  ProductSortOptions,
  PaginationOptions,
  PaginatedResult,
} from '../../../domain/repositories/ProductRepository';

export interface GetProductsRequest {
  tenant_id: string;
  filters?: Omit<ProductFilters, 'tenant_id'>;
  sort?: ProductSortOptions;
  pagination?: PaginationOptions;
}

export interface GetProductsResponse {
  success: boolean;
  products?: PaginatedResult<Product>;
  error?: string;
}

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: GetProductsRequest): Promise<GetProductsResponse> {
    try {
      // Build filters with tenant_id
      const filters: ProductFilters = {
        tenant_id: request.tenant_id,
        ...request.filters,
      };

      // Set default pagination if not provided
      const pagination: PaginationOptions = request.pagination || {
        page: 1,
        limit: 20,
      };

      // Set default sort if not provided
      const sort: ProductSortOptions = request.sort || {
        field: 'created_at',
        direction: 'desc',
      };

      // Get products from repository
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
      console.error('GetProductsUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
