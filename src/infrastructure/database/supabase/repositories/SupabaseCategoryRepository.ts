/**
 * Supabase Category Repository Implementation
 */

import { supabase } from '../supabaseClient';
import { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryTreeNode,
  CategoryFilters,
} from '../../../../domain/entities/Category';

export class SupabaseCategoryRepository implements ICategoryRepository {
  private readonly tableName = 'categories';

  /**
   * Map database row to Category entity
   */
  private mapToEntity(row: any): Category {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      parentId: row.parent_id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image_url,
      icon: row.icon,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      seoKeywords: row.seo_keywords,
      displayOrder: row.display_order,
      isActive: row.is_active,
      isFeatured: row.is_featured,
      productCount: row.product_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
    };
  }

  /**
   * Build tree structure from flat array
   */
  private buildTree(
    categories: Category[],
    parentId: string | null = null,
    level: number = 0
  ): CategoryTreeNode[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(cat => ({
        ...cat,
        level,
        path: cat.name, // Will be enhanced in findTree
        children: this.buildTree(categories, cat.id, level + 1),
      }));
  }

  async findAll(
    tenantId: string,
    filters?: CategoryFilters
  ): Promise<Category[]> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', filters.parentId);
      }
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data?.map(row => this.mapToEntity(row)) || [];
  }

  async findById(id: string, tenantId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findTree(
    tenantId: string,
    parentId?: string | null
  ): Promise<CategoryTreeNode[]> {
    // Use the category_tree_view for efficient tree query
    const { data, error } = await supabase
      .from('category_tree_view')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('path', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch category tree: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Map view data to CategoryTreeNode
    const categories: Category[] = data.map(row => this.mapToEntity(row));

    // Build tree structure
    return this.buildTree(categories, parentId);
  }

  async findRoots(tenantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .is('parent_id', null)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch root categories: ${error.message}`);
    }

    return data?.map(row => this.mapToEntity(row)) || [];
  }

  async findChildren(parentId: string, tenantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('parent_id', parentId)
      .order('display_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch child categories: ${error.message}`);
    }

    return data?.map(row => this.mapToEntity(row)) || [];
  }

  async create(
    data: CreateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert({
        tenant_id: tenantId,
        parent_id: data.parentId || null,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.imageUrl || null,
        icon: data.icon || null,
        seo_title: data.seoTitle || null,
        seo_description: data.seoDescription || null,
        seo_keywords: data.seoKeywords || null,
        display_order: data.displayOrder || 0,
        is_active: data.isActive !== undefined ? data.isActive : true,
        is_featured: data.isFeatured !== undefined ? data.isFeatured : false,
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return this.mapToEntity(result);
  }

  async update(
    id: string,
    data: UpdateCategoryDTO,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    const updateData: any = {
      updated_by: userId,
    };

    // Only include fields that are provided
    if (data.parentId !== undefined) updateData.parent_id = data.parentId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.seoTitle !== undefined) updateData.seo_title = data.seoTitle;
    if (data.seoDescription !== undefined)
      updateData.seo_description = data.seoDescription;
    if (data.seoKeywords !== undefined)
      updateData.seo_keywords = data.seoKeywords;
    if (data.displayOrder !== undefined)
      updateData.display_order = data.displayOrder;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return this.mapToEntity(result);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async updateProductCount(id: string, tenantId: string): Promise<void> {
    // Count products in this category
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
      .eq('tenant_id', tenantId);

    if (countError) {
      throw new Error(`Failed to count products: ${countError.message}`);
    }

    // Update category product_count
    const { error: updateError } = await supabase
      .from(this.tableName)
      .update({ product_count: count || 0 })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (updateError) {
      throw new Error(`Failed to update product count: ${updateError.message}`);
    }
  }

  async reorder(
    categoryIds: string[],
    tenantId: string,
    userId: string
  ): Promise<void> {
    // Update display_order for each category
    const updates = categoryIds.map((id, index) =>
      supabase
        .from(this.tableName)
        .update({ display_order: index, updated_by: userId })
        .eq('id', id)
        .eq('tenant_id', tenantId)
    );

    const results = await Promise.all(updates);

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      throw new Error(
        `Failed to reorder categories: ${errors[0].error!.message}`
      );
    }
  }

  async move(
    id: string,
    newParentId: string | null,
    tenantId: string,
    userId: string
  ): Promise<Category> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        parent_id: newParentId,
        updated_by: userId,
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to move category: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async isSlugUnique(
    slug: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from(this.tableName)
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to check slug uniqueness: ${error.message}`);
    }

    return data.length === 0;
  }
}
