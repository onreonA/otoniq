/**
 * Sync Products from Odoo Use Case
 *
 * Odoo ERP'den ürünleri çekip Otoniq.ai'ye senkronize eder
 */

import { Product, CreateProductDto } from '../../../domain/entities/Product';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import {
  OdooService,
  OdooProduct,
} from '../../../infrastructure/services/OdooService';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  errorCount: number;
  errors: string[];
}

export class SyncProductsFromOdooUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly odooService: OdooService
  ) {}

  /**
   * Odoo'dan tüm ürünleri senkronize et
   */
  async execute(tenantId: string, filters?: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      syncedCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      // Odoo'ya bağlan
      const connected = await this.odooService.connect();
      if (!connected) {
        result.errors.push('Odoo connection failed');
        return result;
      }

      // Odoo'dan ürünleri çek
      const odooProducts = await this.odooService.getProducts(filters);
      console.log(`📦 Found ${odooProducts.length} products in Odoo`);

      // Her ürün için senkronizasyon
      for (const odooProduct of odooProducts) {
        try {
          await this.syncSingleProduct(odooProduct, tenantId);
          result.syncedCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push(
            `Product ${odooProduct.name}: ${error instanceof Error ? error.message : String(error)}`
          );
          console.error(`❌ Error syncing product ${odooProduct.name}:`, error);
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
    } finally {
      // Odoo bağlantısını kapat
      await this.odooService.disconnect();
    }

    return result;
  }

  /**
   * Tek bir ürünü senkronize et
   */
  private async syncSingleProduct(
    odooProduct: OdooProduct,
    tenantId: string
  ): Promise<void> {
    // Mevcut ürünü kontrol et (SKU ile)
    const existingProduct = await this.productRepository.findBySku(
      tenantId,
      odooProduct.default_code
    );

    const productData: CreateProductDto = {
      name: odooProduct.name,
      description:
        odooProduct.description || odooProduct.description_sale || '',
      short_description: odooProduct.description_sale || '',
      sku: odooProduct.default_code,
      status: odooProduct.active ? 'active' : 'inactive',
      product_type: this.mapOdooTypeToProductType(odooProduct.type),
      price: odooProduct.list_price,
      cost: odooProduct.standard_price,
      currency: 'TRY', // Default currency
      weight: odooProduct.weight,
      categories: odooProduct.categ_id ? [odooProduct.categ_id[1]] : [],
      tags: [],
      metadata: {
        odoo_id: odooProduct.id,
        odoo_sku: odooProduct.default_code,
        odoo_barcode: odooProduct.barcode,
        odoo_type: odooProduct.type,
        odoo_category_id: odooProduct.categ_id ? odooProduct.categ_id[0] : null,
        odoo_sale_ok: odooProduct.sale_ok,
        odoo_purchase_ok: odooProduct.purchase_ok,
        odoo_volume: odooProduct.volume,
        odoo_create_date: odooProduct.create_date,
        odoo_write_date: odooProduct.write_date,
      },
    };

    if (existingProduct) {
      // Mevcut ürünü güncelle
      console.log(
        `🔄 Updating existing product: ${odooProduct.name} (ID: ${existingProduct.id})`
      );
      await this.productRepository.update(existingProduct.id, productData);
      console.log(
        `✅ Updated product: ${odooProduct.name} (SKU: ${odooProduct.default_code})`
      );
    } else {
      // Yeni ürün oluştur
      const newProduct: Product = {
        id: crypto.randomUUID(), // Generate UUID
        tenant_id: tenantId,
        ...productData,
        variants: [], // Initialize empty array
        images: [], // Initialize empty array
        created_at: new Date(),
        updated_at: new Date(),
      };
      await this.productRepository.create(newProduct);
      console.log(
        `➕ Created product: ${odooProduct.name} (SKU: ${odooProduct.default_code})`
      );
    }
  }

  /**
   * Odoo product type'ını Otoniq product type'ına çevir
   */
  private mapOdooTypeToProductType(
    odooType: string
  ): 'simple' | 'variable' | 'grouped' | 'external' {
    switch (odooType) {
      case 'consu':
        return 'simple';
      case 'service':
        return 'external';
      case 'product':
        return 'variable';
      default:
        return 'simple';
    }
  }
}
