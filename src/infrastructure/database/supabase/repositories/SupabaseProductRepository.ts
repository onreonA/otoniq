/**
 * Supabase Product Repository Implementation
 *
 * Implements the ProductRepository interface using Supabase.
 */

import { supabase } from '../client';
import { Product } from '../../../../domain/entities/Product';
import {
  ProductRepository,
  ProductFilters,
  ProductSortOptions,
  PaginationOptions,
  PaginatedResult,
} from '../../../../domain/repositories/ProductRepository';

export class SupabaseProductRepository implements ProductRepository {
  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_variants (*),
          product_images (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Find product by ID error:', error);
      throw error;
    }
  }

  /**
   * Find product by SKU within tenant
   */
  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_variants (*),
          product_images (*)
        `
        )
        .eq('tenant_id', tenantId)
        .eq('sku', sku)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      if (!data) return null;

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Find product by SKU error:', error);
      throw error;
    }
  }

  /**
   * Find products with filters and pagination
   */
  async findMany(
    filters: ProductFilters,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    try {
      let query = supabase.from('products').select(
        `
          *,
          product_variants (*),
          product_images (*)
        `,
        { count: 'exact' }
      );

      // Apply filters
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.product_type) {
        query = query.eq('product_type', filters.product_type);
      }

      // Category filter (single category)
      if (filters.category) {
        query = query.contains('categories', [filters.category]);
      }

      // Categories filter (multiple categories)
      if (filters.categories && filters.categories.length > 0) {
        query = query.overlaps('categories', filters.categories);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.search) {
        // Escape special characters for ilike query
        const escapedSearch = filters.search
          .replace(/[%_\\]/g, '\\$&') // Escape PostgreSQL special characters
          .replace(/[|,]/g, ' '); // Replace problematic characters with spaces

        query = query.or(
          `name.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%`
        );
      }

      // Price range filters
      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }

      // Stock status filters
      if (filters.stock_status) {
        switch (filters.stock_status) {
          case 'in_stock':
            // Products with stock > 0
            query = query.gt('product_variants.stock_quantity', 0);
            break;
          case 'low_stock':
            // Products with stock > 0 and <= 10
            query = query
              .gt('product_variants.stock_quantity', 0)
              .lte('product_variants.stock_quantity', 10);
            break;
          case 'out_of_stock':
            // Products with stock = 0
            query = query.eq('product_variants.stock_quantity', 0);
            break;
        }
      }

      // Platform filter
      if (filters.platform) {
        switch (filters.platform) {
          case 'manual':
            query = query.is('metadata->source', null);
            break;
          case 'odoo':
            query = query.eq('metadata->source', 'odoo');
            break;
          case 'shopify':
            query = query.eq('metadata->source', 'shopify');
            break;
        }
      }

      // Legacy stock filter
      if (filters.in_stock !== undefined) {
        if (filters.in_stock) {
          // Products with variants that have stock > 0
          query = query.gt('product_variants.stock_quantity', 0);
        } else {
          // Products with no stock
          query = query.eq('product_variants.stock_quantity', 0);
        }
      }

      // Date range filters
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after.toISOString());
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before.toISOString());
      }

      // New date range filters
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, {
          ascending: sort.direction === 'asc',
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        console.error('Query details:', {
          filters,
          sort,
          pagination,
          tenant_id: filters.tenant_id,
        });
        throw error;
      }

      const products = (data || []).map(item => this.mapToEntity(item));
      const total = count || 0;
      const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

      return {
        data: products,
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || total,
        totalPages,
        hasNext: pagination ? pagination.page < totalPages : false,
        hasPrev: pagination ? pagination.page > 1 : false,
      };
    } catch (error) {
      console.error('Find products error:', error);
      throw error;
    }
  }

  /**
   * Find all products for a tenant
   */
  async findByTenant(
    tenantId: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    return this.findMany({ tenant_id: tenantId }, sort, pagination);
  }

  /**
   * Find products by category
   */
  async findByCategory(
    tenantId: string,
    categoryId: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    return this.findMany(
      { tenant_id: tenantId, categories: [categoryId] },
      sort,
      pagination
    );
  }

  /**
   * Search products by name or description
   */
  async search(
    tenantId: string,
    query: string,
    sort?: ProductSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    return this.findMany(
      { tenant_id: tenantId, search: query },
      sort,
      pagination
    );
  }

  /**
   * Create new product
   */
  async create(product: Product): Promise<Product> {
    try {
      const productData = {
        id: product.id,
        tenant_id: product.tenant_id,
        name: product.name,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        status: product.status,
        product_type: product.product_type,
        price: product.price,
        cost: product.cost,
        categories: product.categories,
        tags: product.tags,
        weight: product.weight,
        dimensions: product.dimensions,
        metadata: product.metadata,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        seo_keywords: product.seo_keywords,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
      };

      // Insert product
      const { data: productResult, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (productError) throw productError;

      // Insert variants if any
      if (product.variants && product.variants.length > 0) {
        const variantsData = product.variants.map(variant => ({
          id: variant.id,
          product_id: variant.product_id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          cost: variant.cost,
          stock_quantity: variant.stock_quantity,
          weight: variant.weight,
          dimensions: variant.dimensions,
          attributes: variant.attributes,
          is_active: variant.is_active,
          created_at: variant.created_at.toISOString(),
          updated_at: variant.updated_at.toISOString(),
        }));

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsData);

        if (variantsError) throw variantsError;
      }

      // Insert images if any
      if (product.images && product.images.length > 0) {
        const imagesData = product.images.map(image => ({
          id: image.id,
          product_id: image.product_id,
          url: image.url,
          alt_text: image.alt_text,
          sort_order: image.sort_order,
          is_primary: image.is_primary,
          created_at: image.created_at.toISOString(),
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesData);

        if (imagesError) throw imagesError;
      }

      // Return the created product
      return (await this.findById(product.id)) as Product;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  /**
   * Update existing product
   */
  async update(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Only include fields that are provided
      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined)
        updateData.description = productData.description;
      if (productData.short_description !== undefined)
        updateData.short_description = productData.short_description;
      if (productData.sku !== undefined) updateData.sku = productData.sku;
      if (productData.status !== undefined)
        updateData.status = productData.status;
      if (productData.product_type !== undefined)
        updateData.product_type = productData.product_type;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.cost !== undefined) updateData.cost = productData.cost;
      if (productData.currency !== undefined)
        updateData.currency = productData.currency;
      if (productData.categories !== undefined)
        updateData.categories = productData.categories;
      if (productData.tags !== undefined) updateData.tags = productData.tags;
      if (productData.weight !== undefined)
        updateData.weight = productData.weight;
      if (productData.dimensions !== undefined)
        updateData.dimensions = productData.dimensions;
      if (productData.metadata !== undefined)
        updateData.metadata = productData.metadata;
      if (productData.seo_title !== undefined)
        updateData.seo_title = productData.seo_title;
      if (productData.seo_description !== undefined)
        updateData.seo_description = productData.seo_description;
      if (productData.seo_keywords !== undefined)
        updateData.seo_keywords = productData.seo_keywords;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      return (await this.findById(id)) as Product;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<void> {
    try {
      // Delete variants first (foreign key constraint)
      await supabase.from('product_variants').delete().eq('product_id', id);

      // Delete images
      await supabase.from('product_images').delete().eq('product_id', id);

      // Delete product
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  /**
   * Check if SKU exists within tenant
   */
  async skuExists(
    tenantId: string,
    sku: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('sku', sku);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).length > 0;
    } catch (error) {
      console.error('Check SKU exists error:', error);
      throw error;
    }
  }

  /**
   * Get product count by status
   */
  async getCountByStatus(tenantId: string): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('status')
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const counts: Record<string, number> = {
        active: 0,
        inactive: 0,
        draft: 0,
        archived: 0,
      };

      (data || []).forEach(item => {
        counts[item.status] = (counts[item.status] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Get count by status error:', error);
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    tenantId: string,
    threshold: number
  ): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_variants (*),
          product_images (*)
        `
        )
        .eq('tenant_id', tenantId)
        .lte('product_variants.stock_quantity', threshold);

      if (error) throw error;

      return (data || []).map(item => this.mapToEntity(item));
    } catch (error) {
      console.error('Get low stock products error:', error);
      throw error;
    }
  }

  /**
   * Get products created in date range
   */
  async getProductsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_variants (*),
          product_images (*)
        `
        )
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => this.mapToEntity(item));
    } catch (error) {
      console.error('Get products by date range error:', error);
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
      const { error } = await supabase
        .from('products')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .in('id', productIds);

      if (error) throw error;
    } catch (error) {
      console.error('Bulk update status error:', error);
      throw error;
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(productIds: string[]): Promise<void> {
    try {
      // Delete variants first
      await supabase
        .from('product_variants')
        .delete()
        .in('product_id', productIds);

      // Delete images
      await supabase
        .from('product_images')
        .delete()
        .in('product_id', productIds);

      // Delete products
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);

      if (error) throw error;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  }

  /**
   * Bulk update product categories
   */
  async bulkUpdateCategories(
    productIds: string[],
    category: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          categories: [category],
          updated_at: new Date().toISOString(),
        })
        .in('id', productIds);

      if (error) throw error;
    } catch (error) {
      console.error('Bulk update categories error:', error);
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getStatistics(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    draft: number;
    archived: number;
    low_stock: number;
    out_of_stock: number;
    total_value: number;
  }> {
    try {
      // Get basic counts
      const counts = await this.getCountByStatus(tenantId);

      // Get low stock and out of stock counts
      const lowStockProducts = await this.getLowStockProducts(tenantId, 10);
      const outOfStockProducts = await this.getLowStockProducts(tenantId, 0);

      // Calculate total value (simplified - sum of all variant prices)
      const { data, error } = await supabase
        .from('product_variants')
        .select('price')
        .eq('products.tenant_id', tenantId);

      if (error) throw error;

      const totalValue = (data || []).reduce(
        (sum, variant) => sum + (variant.price || 0),
        0
      );

      return {
        total: Object.values(counts).reduce((sum, count) => sum + count, 0),
        active: counts.active || 0,
        inactive: counts.inactive || 0,
        draft: counts.draft || 0,
        archived: counts.archived || 0,
        low_stock: lowStockProducts.length,
        out_of_stock: outOfStockProducts.length,
        total_value: totalValue,
      };
    } catch (error) {
      console.error('Get statistics error:', error);
      throw error;
    }
  }

  /**
   * Map database record to Product entity
   */
  private mapToEntity(data: any): Product {
    return new Product(
      data.id,
      data.tenant_id,
      data.name,
      data.description,
      data.short_description,
      data.sku,
      data.status,
      data.product_type,
      data.price || 0,
      data.cost || 0,
      data.categories || [],
      data.tags || [],
      data.weight,
      data.dimensions,
      (data.product_variants || []).map((variant: any) => ({
        ...variant,
        created_at: new Date(variant.created_at),
        updated_at: new Date(variant.updated_at),
      })),
      (data.product_images || []).map((image: any) => ({
        ...image,
        created_at: new Date(image.created_at),
      })),
      data.metadata || {},
      data.seo_title,
      data.seo_description,
      data.seo_keywords || [],
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
