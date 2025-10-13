/**
 * Update Product Use Case
 *
 * Handles the business logic for updating existing products.
 */

import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface UpdateProductRequest {
  id: string;
  name?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  status?: 'active' | 'inactive' | 'draft' | 'archived';
  categories?: string[];
  tags?: string[];
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

export interface UpdateProductResponse {
  success: boolean;
  product?: Product;
  error?: string;
}

export class UpdateProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(
    request: UpdateProductRequest,
    userId: string
  ): Promise<UpdateProductResponse> {
    try {
      // Get existing product
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Validate request
      await this.validateRequest(request, existingProduct);

      // Update product fields
      if (request.name !== undefined) {
        existingProduct.updateName(request.name);
      }

      if (
        request.description !== undefined ||
        request.short_description !== undefined
      ) {
        existingProduct.updateDescription(
          request.description || existingProduct.description,
          request.short_description || existingProduct.short_description
        );
      }

      if (request.sku !== undefined) {
        existingProduct.sku = request.sku;
        existingProduct.updated_at = new Date();
      }

      if (request.status !== undefined) {
        existingProduct.updateStatus(request.status);
      }

      if (request.categories !== undefined) {
        existingProduct.categories = request.categories;
        existingProduct.updated_at = new Date();
      }

      if (request.tags !== undefined) {
        existingProduct.tags = request.tags;
        existingProduct.updated_at = new Date();
      }

      if (request.weight !== undefined) {
        existingProduct.weight = request.weight;
        existingProduct.updated_at = new Date();
      }

      if (request.dimensions !== undefined) {
        existingProduct.dimensions = request.dimensions;
        existingProduct.updated_at = new Date();
      }

      if (request.seo_title !== undefined) {
        existingProduct.seo_title = request.seo_title;
        existingProduct.updated_at = new Date();
      }

      if (request.seo_description !== undefined) {
        existingProduct.seo_description = request.seo_description;
        existingProduct.updated_at = new Date();
      }

      if (request.seo_keywords !== undefined) {
        existingProduct.seo_keywords = request.seo_keywords;
        existingProduct.updated_at = new Date();
      }

      if (request.metadata !== undefined) {
        existingProduct.metadata = request.metadata;
        existingProduct.updated_at = new Date();
      }

      // Save updated product
      const updatedProduct =
        await this.productRepository.update(existingProduct);

      return {
        success: true,
        product: updatedProduct,
      };
    } catch (error) {
      console.error('UpdateProductUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async validateRequest(
    request: UpdateProductRequest,
    existingProduct: Product
  ): Promise<void> {
    // Validate SKU if provided
    if (request.sku !== undefined) {
      if (!request.sku.trim()) {
        throw new Error('Product SKU is required');
      }

      // Check if SKU already exists (excluding current product)
      const skuExists = await this.productRepository.skuExists(
        existingProduct.tenant_id,
        request.sku,
        existingProduct.id
      );

      if (skuExists) {
        throw new Error(`Product with SKU ${request.sku} already exists`);
      }

      // Validate SKU format
      const skuRegex = /^[A-Za-z0-9-_]+$/;
      if (!skuRegex.test(request.sku)) {
        throw new Error(
          'SKU can only contain letters, numbers, hyphens, and underscores'
        );
      }
    }

    // Validate name if provided
    if (request.name !== undefined && !request.name.trim()) {
      throw new Error('Product name cannot be empty');
    }

    // Validate description if provided
    if (request.description !== undefined && !request.description.trim()) {
      throw new Error('Product description cannot be empty');
    }

    // Validate short description if provided
    if (
      request.short_description !== undefined &&
      !request.short_description.trim()
    ) {
      throw new Error('Product short description cannot be empty');
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
