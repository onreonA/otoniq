/**
 * Delete Product Use Case
 *
 * Handles the business logic for deleting products.
 */

import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export interface DeleteProductRequest {
  id: string;
  force?: boolean; // Force delete even if product has orders
}

export interface DeleteProductResponse {
  success: boolean;
  error?: string;
}

export class DeleteProductUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(
    request: DeleteProductRequest,
    userId: string
  ): Promise<DeleteProductResponse> {
    try {
      // Check if product exists
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // Business rules validation
      await this.validateDeletion(existingProduct, request.force);

      // Delete product
      await this.productRepository.delete(request.id);

      return {
        success: true,
      };
    } catch (error) {
      console.error('DeleteProductUseCase error:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async validateDeletion(
    product: any, // Product entity
    force?: boolean
  ): Promise<void> {
    // Check if product is active and has orders (if orders system exists)
    if (product.status === 'active' && !force) {
      // TODO: Check if product has associated orders
      // For now, we'll allow deletion but log a warning
      console.warn(`Deleting active product ${product.id} without force flag`);
    }

    // Additional business rules can be added here
    // For example:
    // - Check if product is part of any active campaigns
    // - Check if product has inventory in transit
    // - Check if product is featured in any marketing materials
  }
}
