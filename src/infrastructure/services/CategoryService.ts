/**
 * Category Service
 * Business logic layer for category operations
 */

import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryTreeNode,
  CategoryFilters,
} from '../../domain/entities/Category';

export class CategoryService {
  constructor(private readonly repository: ICategoryRepository) {}

  /**
   * Get all categories with optional filters
   */
  async getAll(
    tenantId: string,
    filters?: CategoryFilters
  ): Promise<Category[]> {
    return this.repository.findAll(tenantId, filters);
  }

  /**
   * Get category by ID
   */
  async getById(id: string, tenantId: string): Promise<Category | null> {
    return this.repository.findById(id, tenantId);
  }

  /**
   * Get category tree
   */
  async getTree(
    tenantId: string,
    parentId?: string | null
  ): Promise<CategoryTreeNode[]> {
    return this.repository.findTree(tenantId, parentId);
  }

  /**
   * Get root categories
   */
  async getRoots(tenantId: string): Promise<Category[]> {
    return this.repository.findRoots(tenantId);
  }

  /**
   * Get children of a category
   */
  async getChildren(parentId: string, tenantId: string): Promise<Category[]> {
    return this.repository.findChildren(parentId, tenantId);
  }

  /**
   * Create a new category
   */
  async create(
    data: CreateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    // Validate slug uniqueness
    const isUnique = await this.repository.isSlugUnique(data.slug, tenantId);
    if (!isUnique) {
      throw new Error('Category slug must be unique');
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await this.repository.findById(data.parentId, tenantId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    return this.repository.create(data, tenantId, userId);
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    data: UpdateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    // Check if category exists
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) {
      throw new Error('Category not found');
    }

    // Validate slug uniqueness if changing slug
    if (data.slug && data.slug !== existing.slug) {
      const isUnique = await this.repository.isSlugUnique(
        data.slug,
        tenantId,
        id
      );
      if (!isUnique) {
        throw new Error('Category slug must be unique');
      }
    }

    // Validate parent exists if changing parent
    if (data.parentId !== undefined && data.parentId !== null) {
      // Prevent circular reference
      if (data.parentId === id) {
        throw new Error('Category cannot be its own parent');
      }

      const parent = await this.repository.findById(data.parentId, tenantId);
      if (!parent) {
        throw new Error('Parent category not found');
      }

      // Check if new parent is a descendant (would create circular reference)
      const isDescendant = await this.isDescendant(id, data.parentId, tenantId);
      if (isDescendant) {
        throw new Error('Cannot move category to its own descendant');
      }
    }

    return this.repository.update(id, data, tenantId, userId);
  }

  /**
   * Delete a category
   */
  async delete(id: string, tenantId: string): Promise<void> {
    // Check if category has children
    const children = await this.repository.findChildren(id, tenantId);
    if (children.length > 0) {
      throw new Error(
        'Cannot delete category with children. Please delete or move children first.'
      );
    }

    // Check if category has products
    const category = await this.repository.findById(id, tenantId);
    if (category && category.productCount > 0) {
      throw new Error(
        'Cannot delete category with products. Please move or delete products first.'
      );
    }

    return this.repository.delete(id, tenantId);
  }

  /**
   * Update product count for a category
   */
  async updateProductCount(id: string, tenantId: string): Promise<void> {
    return this.repository.updateProductCount(id, tenantId);
  }

  /**
   * Reorder categories
   */
  async reorder(
    categoryIds: string[],
    tenantId: string,
    userId: string
  ): Promise<void> {
    return this.repository.reorder(categoryIds, tenantId, userId);
  }

  /**
   * Move category to a new parent
   */
  async move(
    id: string,
    newParentId: string | null,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    // Prevent circular reference
    if (newParentId === id) {
      throw new Error('Category cannot be its own parent');
    }

    if (newParentId) {
      // Check if new parent is a descendant
      const isDescendant = await this.isDescendant(id, newParentId, tenantId);
      if (isDescendant) {
        throw new Error('Cannot move category to its own descendant');
      }
    }

    return this.repository.move(id, newParentId, tenantId, userId);
  }

  /**
   * Check if a category is a descendant of another
   */
  private async isDescendant(
    ancestorId: string,
    categoryId: string,
    tenantId: string
  ): Promise<boolean> {
    const category = await this.repository.findById(categoryId, tenantId);
    if (!category) return false;

    if (category.parentId === ancestorId) {
      return true;
    }

    if (category.parentId) {
      return this.isDescendant(ancestorId, category.parentId, tenantId);
    }

    return false;
  }

  /**
   * Generate slug from name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate slug format
   */
  isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }
}
