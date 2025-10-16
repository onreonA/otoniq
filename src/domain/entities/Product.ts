/**
 * Product Domain Entity
 *
 * Core business logic for products in the e-commerce platform.
 * Contains validation rules and business operations.
 */

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock_quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ProductAuditLog {
  id: string;
  product_id: string;
  action: 'created' | 'updated' | 'deleted' | 'price_changed' | 'stock_changed';
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by: string;
  changed_at: Date;
  reason?: string;
}

export class Product {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public name: string,
    public description: string,
    public short_description: string,
    public sku: string,
    public status: 'active' | 'inactive' | 'draft' | 'archived',
    public product_type: 'simple' | 'variable' | 'grouped' | 'external',
    public price: number,
    public cost: number,
    public categories: string[],
    public tags: string[],
    public weight?: number,
    public dimensions?: {
      length: number;
      width: number;
      height: number;
    },
    public variants: ProductVariant[] = [],
    public images: ProductImage[] = [],
    public metadata: Record<string, any> = {},
    public seo_title?: string,
    public seo_description?: string,
    public seo_keywords: string[] = [],
    public created_at: Date = new Date(),
    public updated_at: Date = new Date(),
    // NEW: Multi-platform sync fields
    public barcode?: string,
    public vendor?: string,
    public compare_at_price?: number,
    public tax_rate?: number,
    public discount_percentage?: number,
    public final_price?: number,
    public volume?: number,
    public requires_shipping?: boolean,
    public is_taxable?: boolean,
    public sale_ok?: boolean,
    public purchase_ok?: boolean,
    public inventory_policy?: 'continue' | 'deny',
    public published_at?: Date
  ) {
    // Ensure arrays are always initialized
    this.variants = this.variants || [];
    this.images = this.images || [];
    this.categories = this.categories || [];
    this.tags = this.tags || [];
    this.seo_keywords = this.seo_keywords || [];
    this.metadata = this.metadata || {};

    this.validate();
  }

  /**
   * Business validation rules
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Product name is required');
    }

    if (!this.sku || this.sku.trim().length === 0) {
      throw new Error('Product SKU is required');
    }

    if (!this.tenant_id) {
      throw new Error('Product must belong to a tenant');
    }

    if (this.variants.length > 0 && this.product_type === 'simple') {
      throw new Error('Simple products cannot have variants');
    }

    if (this.variants.length === 0 && this.product_type === 'variable') {
      throw new Error('Variable products must have variants');
    }

    // SKU uniqueness within tenant
    const duplicateSkus = this.variants.filter(
      (variant, index, arr) =>
        arr.findIndex(v => v.sku === variant.sku) !== index
    );
    if (duplicateSkus.length > 0) {
      throw new Error('Duplicate SKUs found in variants');
    }
  }

  /**
   * Update product name
   */
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }
    this.name = name.trim();
    this.updated_at = new Date();
  }

  /**
   * Update product description
   */
  updateDescription(description: string, short_description: string): void {
    this.description = description;
    this.short_description = short_description;
    this.updated_at = new Date();
  }

  /**
   * Add product variant
   */
  addVariant(
    variant: Omit<
      ProductVariant,
      'id' | 'product_id' | 'created_at' | 'updated_at'
    >
  ): void {
    if (this.product_type === 'simple') {
      throw new Error('Cannot add variants to simple products');
    }

    // Check for duplicate SKU
    const existingVariant = this.variants.find(v => v.sku === variant.sku);
    if (existingVariant) {
      throw new Error(`Variant with SKU ${variant.sku} already exists`);
    }

    const newVariant: ProductVariant = {
      ...variant,
      id: crypto.randomUUID(),
      product_id: this.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.variants.push(newVariant);
    this.updated_at = new Date();
  }

  /**
   * Remove product variant
   */
  removeVariant(variantId: string): void {
    const index = this.variants.findIndex(v => v.id === variantId);
    if (index === -1) {
      throw new Error('Variant not found');
    }

    this.variants.splice(index, 1);
    this.updated_at = new Date();
  }

  /**
   * Update variant stock
   */
  updateVariantStock(variantId: string, quantity: number): void {
    const variant = this.variants.find(v => v.id === variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    variant.stock_quantity = quantity;
    variant.updated_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Update variant price
   */
  updateVariantPrice(variantId: string, price: number): void {
    const variant = this.variants.find(v => v.id === variantId);
    if (!variant) {
      throw new Error('Variant not found');
    }

    if (price < 0) {
      throw new Error('Price cannot be negative');
    }

    variant.price = price;
    variant.updated_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Add product image
   */
  addImage(
    image: Omit<ProductImage, 'id' | 'product_id' | 'created_at'>
  ): void {
    const newImage: ProductImage = {
      ...image,
      id: crypto.randomUUID(),
      product_id: this.id,
      created_at: new Date(),
    };

    this.images.push(newImage);
    this.updated_at = new Date();
  }

  /**
   * Remove product image
   */
  removeImage(imageId: string): void {
    const index = this.images.findIndex(img => img.id === imageId);
    if (index === -1) {
      throw new Error('Image not found');
    }

    this.images.splice(index, 1);
    this.updated_at = new Date();
  }

  /**
   * Set primary image
   */
  setPrimaryImage(imageId: string): void {
    // Remove primary from all images
    this.images.forEach(img => (img.is_primary = false));

    // Set new primary
    const image = this.images.find(img => img.id === imageId);
    if (!image) {
      throw new Error('Image not found');
    }

    image.is_primary = true;
    this.updated_at = new Date();
  }

  /**
   * Update product status
   */
  updateStatus(status: 'active' | 'inactive' | 'draft' | 'archived'): void {
    this.status = status;
    this.updated_at = new Date();
  }

  /**
   * Get primary image URL
   */
  getPrimaryImageUrl(): string | null {
    const primaryImage = this.images.find(img => img.is_primary);
    return primaryImage?.url || null;
  }

  /**
   * Get total stock quantity
   */
  getTotalStock(): number {
    if (this.product_type === 'simple') {
      return 0; // Simple products don't have variants
    }
    return this.variants.reduce(
      (total, variant) => total + variant.stock_quantity,
      0
    );
  }

  /**
   * Get minimum price from variants
   */
  getMinPrice(): number | null {
    if (this.variants.length === 0) return null;
    return Math.min(...this.variants.map(v => v.price));
  }

  /**
   * Get maximum price from variants
   */
  getMaxPrice(): number | null {
    if (this.variants.length === 0) return null;
    return Math.max(...this.variants.map(v => v.price));
  }

  /**
   * Check if product is in stock
   */
  isInStock(): boolean {
    return this.getTotalStock() > 0;
  }

  /**
   * Get audit log entry
   */
  createAuditLog(
    action: ProductAuditLog['action'],
    changedBy: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    reason?: string
  ): ProductAuditLog {
    return {
      id: crypto.randomUUID(),
      product_id: this.id,
      action,
      old_values: oldValues,
      new_values: newValues,
      changed_by: changedBy,
      changed_at: new Date(),
      reason,
    };
  }

  /**
   * Convert to plain object for persistence
   */
  toJSON(): any {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      name: this.name,
      description: this.description,
      short_description: this.short_description,
      sku: this.sku,
      status: this.status,
      product_type: this.product_type,
      price: this.price,
      cost: this.cost,
      categories: this.categories,
      tags: this.tags,
      weight: this.weight,
      dimensions: this.dimensions,
      variants: this.variants,
      images: this.images,
      metadata: this.metadata,
      seo_title: this.seo_title,
      seo_description: this.seo_description,
      seo_keywords: this.seo_keywords,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

/**
 * Create Product DTO
 */
export interface CreateProductDto {
  name: string;
  description?: string;
  short_description?: string;
  sku: string;
  status: 'active' | 'inactive' | 'draft';
  product_type: 'physical' | 'digital' | 'service';
  price?: number;
  cost?: number;
  currency?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  categories?: string[];
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  metadata?: Record<string, any>;
  // NEW: Multi-platform sync fields
  barcode?: string;
  vendor?: string;
  compare_at_price?: number;
  tax_rate?: number;
  volume?: number;
  requires_shipping?: boolean;
  is_taxable?: boolean;
  sale_ok?: boolean;
  purchase_ok?: boolean;
  inventory_policy?: 'continue' | 'deny';
  published_at?: Date;
}
