/**
 * Sync Products from Shopify Use Case
 *
 * Shopify'dan ürünleri çekip Otoniq.ai'ye senkronize eder
 */

import { Product } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import {
  ShopifyService,
  ShopifyProduct,
} from '../../../infrastructure/services/ShopifyService';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  errorCount: number;
  errors: string[];
}

export class SyncProductsFromShopifyUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly shopifyService: ShopifyService
  ) {}

  /**
   * Shopify'dan tüm ürünleri senkronize et
   */
  async execute(tenantId: string, limit: number = 50): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      syncedCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      // Shopify'dan ürünleri çek
      const shopifyProducts = await this.shopifyService.getProducts(limit);
      console.log(`📦 Found ${shopifyProducts.length} products in Shopify`);

      // Her ürün için senkronizasyon
      for (const shopifyProduct of shopifyProducts) {
        try {
          await this.syncSingleProduct(shopifyProduct, tenantId);
          result.syncedCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push(
            `Product ${shopifyProduct.title}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          console.error(
            `❌ Error syncing product ${shopifyProduct.title}:`,
            error
          );
        }
      }

      result.success = true;
      console.log(
        `✅ Sync completed: ${result.syncedCount} synced, ${result.errorCount} errors`
      );
    } catch (error) {
      result.errors.push(
        `Sync failed: ${error instanceof Error ? error.message : String(error)}`
      );
      console.error('❌ Sync failed:', error);
    }

    return result;
  }

  /**
   * Tek bir ürünü senkronize et
   */
  private async syncSingleProduct(
    shopifyProduct: ShopifyProduct,
    tenantId: string
  ): Promise<void> {
    // Mevcut ürünü kontrol et (SKU ile)
    const productSku = shopifyProduct.variants[0]?.sku || shopifyProduct.title;

    // SKU ile direkt kontrol et
    const skuExists = await this.productRepository.skuExists(
      tenantId,
      productSku
    );

    const productData = {
      name: shopifyProduct.title,
      description: shopifyProduct.body_html || '',
      short_description: this.extractShortDescription(shopifyProduct.body_html),
      sku: shopifyProduct.variants[0]?.sku || shopifyProduct.title,
      status: this.mapShopifyStatusToProductStatus(shopifyProduct.status),
      product_type: this.mapShopifyTypeToProductType(
        shopifyProduct.product_type
      ),
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      cost: parseFloat(shopifyProduct.variants[0]?.price || '0') * 0.7, // Estimate cost
      categories: shopifyProduct.product_type
        ? [shopifyProduct.product_type]
        : [],
      tags: shopifyProduct.tags
        ? shopifyProduct.tags.split(',').map(tag => tag.trim())
        : [],
      weight: shopifyProduct.variants[0]?.weight || 0,
      variants: [],
      images: [],
      metadata: {
        shopify_id: shopifyProduct.id,
        shopify_handle: shopifyProduct.title.toLowerCase().replace(/\s+/g, '-'),
        shopify_vendor: shopifyProduct.vendor,
        shopify_product_type: shopifyProduct.product_type,
        shopify_tags: shopifyProduct.tags,
        shopify_created_at: shopifyProduct.created_at,
        shopify_updated_at: shopifyProduct.updated_at,
        shopify_published_at: shopifyProduct.published_at,
        shopify_admin_graphql_api_id: shopifyProduct.admin_graphql_api_id,
      },
    };

    if (skuExists) {
      // Mevcut ürünü bul ve güncelle - SKU ile tam eşleşme
      const existingProduct = await this.productRepository.findBySku(
        tenantId,
        productSku
      );

      if (existingProduct) {
        const updatedProduct = new Product(
          existingProduct.id,
          existingProduct.tenant_id,
          productData.name,
          productData.description,
          productData.short_description,
          productData.sku,
          productData.status,
          productData.product_type,
          productData.price,
          productData.cost,
          productData.categories,
          productData.tags,
          productData.weight,
          existingProduct.dimensions,
          existingProduct.variants,
          existingProduct.images,
          productData.metadata,
          existingProduct.seo_title,
          existingProduct.seo_description,
          existingProduct.seo_keywords,
          existingProduct.created_at,
          new Date()
        );
        await this.productRepository.update(updatedProduct);
        console.log(`🔄 Updated product: ${shopifyProduct.title}`);
      }
    } else {
      // Yeni ürün oluştur
      const newProduct = new Product(
        crypto.randomUUID(),
        tenantId,
        productData.name,
        productData.description,
        productData.short_description,
        productData.sku,
        productData.status,
        productData.product_type,
        productData.price,
        productData.cost,
        productData.categories,
        productData.tags,
        productData.weight,
        undefined,
        productData.variants,
        productData.images,
        productData.metadata,
        undefined,
        undefined,
        [],
        new Date(),
        new Date()
      );
      await this.productRepository.create(newProduct);
      console.log(`➕ Created product: ${shopifyProduct.title}`);
    }
  }

  /**
   * HTML'den kısa açıklama çıkar
   */
  private extractShortDescription(html: string): string {
    if (!html) return '';

    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');

    // Take first 100 characters
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  /**
   * Shopify product status'ını Otoniq product status'ına çevir
   */
  private mapShopifyStatusToProductStatus(
    shopifyStatus: string
  ): 'active' | 'inactive' | 'draft' | 'archived' {
    switch (shopifyStatus) {
      case 'active':
        return 'active';
      case 'draft':
        return 'draft';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }

  /**
   * Shopify product type'ını Otoniq product type'ına çevir
   */
  private mapShopifyTypeToProductType(
    shopifyType: string
  ): 'simple' | 'variable' | 'grouped' | 'external' {
    // Shopify'da genellikle simple product'lar var
    // Variants varsa variable olarak kabul ediyoruz
    return 'simple'; // Default to simple for now
  }
}
