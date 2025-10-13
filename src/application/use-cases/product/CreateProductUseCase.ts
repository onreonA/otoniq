/**
 * Create Product Use Case
 *
 * Handles the business logic for creating new products.
 */

import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface CreateProductRequest {
  tenant_id: string;
  name: string;
  description: string;
  short_description: string;
  sku: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  product_type: 'simple' | 'variable' | 'grouped' | 'external';
  categories: string[];
  tags: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  metadata?: Record<string, any>;
}

export interface CreateProductResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

export class CreateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(
    request: CreateProductRequest,
    userId: string
  ): Promise<CreateProductResponse> {
    try {
      // Validate business rules
      await this.validateRequest(request);

      // Create product entity
      const product = new Product(
        crypto.randomUUID(),
        request.tenant_id,
        request.name,
        request.description,
        request.short_description,
        request.sku,
        request.status,
        request.product_type,
        request.categories,
        request.tags,
        request.weight,
        request.dimensions,
        [], // variants will be added separately
        [], // images will be added separately
        request.metadata || {},
        request.seo_title,
        request.seo_description,
        request.seo_keywords || []
      );

      // Save to repository
      const savedProduct = await this.productRepository.create(product);

      return {
        success: true,
        product: savedProduct,
      };
    } catch (error) {
      console.error('CreateProductUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async validateRequest(request: CreateProductRequest): Promise<void> {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.skuExists(
      request.tenant_id,
      request.sku
    );

    if (existingProduct) {
      throw new Error(`Product with SKU ${request.sku} already exists`);
    }

    // Validate required fields
    if (!request.name?.trim()) {
      throw new Error('Product name is required');
    }

    if (!request.sku?.trim()) {
      throw new Error('Product SKU is required');
    }

    if (!request.description?.trim()) {
      throw new Error('Product description is required');
    }

    if (!request.short_description?.trim()) {
      throw new Error('Product short description is required');
    }

    // Validate SKU format (alphanumeric, hyphens, underscores only)
    const skuRegex = /^[A-Za-z0-9-_]+$/;
    if (!skuRegex.test(request.sku)) {
      throw new Error(
        'SKU can only contain letters, numbers, hyphens, and underscores'
      );
    }

    // Validate dimensions if provided
    if (request.dimensions) {
      const { length, width, height } = request.dimensions;
      if (length <= 0 || width <= 0 || height <= 0) {
        throw new Error('All dimensions must be positive numbers');
      }
    }

    // Validate weight if provided
    if (request.weight !== undefined && request.weight <= 0) {
      throw new Error('Weight must be a positive number');
    }
  }
}
