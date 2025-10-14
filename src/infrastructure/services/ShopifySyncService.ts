/**
 * Shopify Sync Service
 *
 * Shopify ile senkronizasyon işlemlerini yönetir
 */

import { ShopifyService, ShopifyConfig } from './ShopifyService';
import {
  SyncProductsFromShopifyUseCase,
  SyncResult,
} from '../../application/use-cases/shopify/SyncProductsFromShopifyUseCase';
import { SupabaseProductRepository } from '../database/supabase/repositories/SupabaseProductRepository';

export class ShopifySyncService {
  private shopifyService: ShopifyService;
  private syncUseCase: SyncProductsFromShopifyUseCase;

  constructor(shopifyConfig: ShopifyConfig) {
    this.shopifyService = new ShopifyService(shopifyConfig);
    this.syncUseCase = new SyncProductsFromShopifyUseCase(
      new SupabaseProductRepository(),
      this.shopifyService
    );
  }

  /**
   * Shopify bağlantısını test et
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const connected = await this.shopifyService.testConnection();
      if (connected) {
        return {
          success: true,
          message: 'Shopify connection successful',
        };
      } else {
        return {
          success: false,
          message: 'Shopify connection failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  /**
   * Tüm ürünleri senkronize et
   */
  async syncAllProducts(
    tenantId: string,
    limit: number = 50
  ): Promise<SyncResult> {
    console.log(`🔄 Starting full product sync for tenant: ${tenantId}`);
    return await this.syncUseCase.execute(tenantId, limit);
  }

  /**
   * Sayfalı ürün senkronizasyonu
   */
  async syncProductsPage(
    tenantId: string,
    limit: number = 50
  ): Promise<SyncResult> {
    console.log(`🔄 Starting limited product sync for tenant: ${tenantId}`);
    return await this.syncUseCase.execute(tenantId, limit);
  }

  /**
   * Belirli bir ürünü senkronize et
   */
  async syncSingleProduct(
    tenantId: string,
    productId: number
  ): Promise<SyncResult> {
    console.log(
      `🔄 Starting single product sync (ID: ${productId}) for tenant: ${tenantId}`
    );

    try {
      const product = await this.shopifyService.getProduct(productId);
      if (!product) {
        return {
          success: false,
          syncedCount: 0,
          errorCount: 1,
          errors: [`Product with ID ${productId} not found`],
        };
      }

      // Use the sync use case for single product
      const result = await this.syncUseCase.execute(tenantId, 1, 1);
      return result;
    } catch (error) {
      return {
        success: false,
        syncedCount: 0,
        errorCount: 1,
        errors: [
          `Single product sync failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  /**
   * Shopify'dan ürün bilgilerini getir (sync yapmadan)
   */
  async getProductsInfo(limit: number = 50, page: number = 1) {
    try {
      const products = await this.shopifyService.getProducts(limit, page);
      return {
        success: true,
        products: products.map(product => ({
          id: product.id,
          title: product.title,
          vendor: product.vendor,
          product_type: product.product_type,
          status: product.status,
          created_at: product.created_at,
          updated_at: product.updated_at,
          variants_count: product.variants.length,
          images_count: product.images.length,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stok miktarını güncelle
   */
  async updateInventory(
    variantId: number,
    quantity: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updated = await this.shopifyService.updateInventory(
        variantId,
        quantity
      );
      return {
        success: updated,
        message: updated
          ? 'Inventory updated successfully'
          : 'Inventory update failed',
      };
    } catch (error) {
      return {
        success: false,
        message: `Inventory update error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
