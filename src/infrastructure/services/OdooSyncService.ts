/**
 * Odoo Sync Service
 *
 * Odoo ERP ile senkronizasyon işlemlerini yönetir
 */

import { OdooService, OdooConfig } from './OdooService';
import {
  SyncProductsFromOdooUseCase,
  SyncResult,
} from '../../application/use-cases/odoo/SyncProductsFromOdooUseCase';
import { SupabaseProductRepository } from '../database/supabase/repositories/SupabaseProductRepository';

export class OdooSyncService {
  private odooService: OdooService;
  private syncUseCase: SyncProductsFromOdooUseCase;

  constructor(odooConfig: OdooConfig) {
    this.odooService = new OdooService(odooConfig);
    this.syncUseCase = new SyncProductsFromOdooUseCase(
      new SupabaseProductRepository(),
      this.odooService
    );
  }

  /**
   * Odoo bağlantısını test et
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const connected = await this.odooService.connect();
      if (connected) {
        await this.odooService.disconnect();
        return {
          success: true,
          message: 'Odoo connection successful',
        };
      } else {
        return {
          success: false,
          message: 'Odoo connection failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Tüm ürünleri senkronize et
   */
  async syncAllProducts(tenantId: string): Promise<SyncResult> {
    console.log(`🔄 Starting full product sync for tenant: ${tenantId}`);
    return await this.syncUseCase.execute(tenantId);
  }

  /**
   * Belirli kriterlere göre ürünleri senkronize et
   */
  async syncProductsWithFilters(
    tenantId: string,
    filters: any[]
  ): Promise<SyncResult> {
    console.log(`🔄 Starting filtered product sync for tenant: ${tenantId}`);
    return await this.syncUseCase.execute(tenantId, filters);
  }

  /**
   * Son güncellenen ürünleri senkronize et
   */
  async syncRecentProducts(
    tenantId: string,
    hours: number = 24
  ): Promise<SyncResult> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const filters = [['write_date', '>=', cutoffDate.toISOString()]];

    console.log(
      `🔄 Starting recent product sync (last ${hours}h) for tenant: ${tenantId}`
    );
    return await this.syncUseCase.execute(tenantId, filters);
  }

  /**
   * Aktif ürünleri senkronize et
   */
  async syncActiveProducts(tenantId: string): Promise<SyncResult> {
    const filters = [
      ['active', '=', true],
      ['sale_ok', '=', true],
    ];

    console.log(`🔄 Starting active product sync for tenant: ${tenantId}`);
    return await this.syncUseCase.execute(tenantId, filters);
  }

  /**
   * Belirli kategorideki ürünleri senkronize et
   */
  async syncProductsByCategory(
    tenantId: string,
    categoryId: number
  ): Promise<SyncResult> {
    const filters = [
      ['categ_id', '=', categoryId],
      ['active', '=', true],
    ];

    console.log(
      `🔄 Starting category product sync (category: ${categoryId}) for tenant: ${tenantId}`
    );
    return await this.syncUseCase.execute(tenantId, filters);
  }

  /**
   * Ürün kategorilerini getir
   */
  async getProductCategories(): Promise<Array<{ id: number; name: string }>> {
    try {
      await this.odooService.connect();
      const categories = await this.odooService.getProductCategories();
      await this.odooService.disconnect();
      return categories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Stok miktarlarını getir
   */
  async getStockQuantities(
    productIds: number[]
  ): Promise<Array<{ product_id: number; quantity: number }>> {
    try {
      await this.odooService.connect();
      const stockData = await this.odooService.getStockQuantities(productIds);
      await this.odooService.disconnect();
      return stockData;
    } catch (error) {
      console.error('❌ Error fetching stock:', error);
      throw error;
    }
  }
}
