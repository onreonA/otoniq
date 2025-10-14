/**
 * Category Domain Entity
 * Represents a product category in the domain layer
 */

export interface Category {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;

  // SEO fields
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[] | null;

  // Display settings
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;

  // Statistics
  productCount: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

/**
 * Create Category DTO (Data Transfer Object)
 */
export interface CreateCategoryDTO {
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Update Category DTO
 */
export interface UpdateCategoryDTO {
  parentId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[] | null;
  displayOrder?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Category Tree Node (for hierarchical display)
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
  path: string;
}

/**
 * Category Filter Options
 */
export interface CategoryFilters {
  parentId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}
