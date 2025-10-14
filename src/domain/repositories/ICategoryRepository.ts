/**
 * Category Repository Interface
 * Defines the contract for category data operations
 */

import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryTreeNode,
  CategoryFilters,
} from '../entities/Category';

export interface ICategoryRepository {
  /**
   * Get all categories for a tenant
   */
  findAll(tenantId: string, filters?: CategoryFilters): Promise<Category[]>;

  /**
   * Get a single category by ID
   */
  findById(id: string, tenantId: string): Promise<Category | null>;

  /**
   * Get category tree structure
   */
  findTree(
    tenantId: string,
    parentId?: string | null
  ): Promise<CategoryTreeNode[]>;

  /**
   * Get root categories (categories without parent)
   */
  findRoots(tenantId: string): Promise<Category[]>;

  /**
   * Get children of a specific category
   */
  findChildren(parentId: string, tenantId: string): Promise<Category[]>;

  /**
   * Create a new category
   */
  create(
    data: CreateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category>;

  /**
   * Update an existing category
   */
  update(
    id: string,
    data: UpdateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category>;

  /**
   * Delete a category
   */
  delete(id: string, tenantId: string): Promise<void>;

  /**
   * Update product count for a category
   */
  updateProductCount(id: string, tenantId: string): Promise<void>;

  /**
   * Reorder categories
   */
  reorder(
    categoryIds: string[],
    tenantId: string,
    userId: string
  ): Promise<void>;

  /**
   * Move category to a new parent
   */
  move(
    id: string,
    newParentId: string | null,
    tenantId: string,
    userId: string
  ): Promise<Category>;

  /**
   * Check if slug is unique within tenant
   */
  isSlugUnique(
    slug: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
}
