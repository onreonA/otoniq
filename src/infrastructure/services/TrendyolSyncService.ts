/**
 * Trendyol Sync Service
 * Application layer service for Trendyol synchronization operations
 */

import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { SupabaseProductRepository } from '../database/supabase/repositories/SupabaseProductRepository';
import { TrendyolService } from './TrendyolService';
import { SyncProductsFromTrendyolUseCase } from '../../application/use-cases/trendyol/SyncProductsFromTrendyolUseCase';
import { SyncOrdersFromTrendyolUseCase } from '../../application/use-cases/trendyol/SyncOrdersFromTrendyolUseCase';

export interface TrendyolCredentials {
  apiKey: string;
  apiSecret: string;
  sellerId: string;
}

export interface SyncProductsRequest {
  tenantId: string;
  credentials: TrendyolCredentials;
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  };
}

export interface SyncOrdersRequest {
  tenantId: string;
  credentials: TrendyolCredentials;
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export class TrendyolSyncService {
  private productRepository: ProductRepository;
  private trendyolService: TrendyolService;

  constructor() {
    this.productRepository = new SupabaseProductRepository();
    this.trendyolService = new TrendyolService({
      apiKey: '',
      apiSecret: '',
      sellerId: '',
    });
  }

  /**
   * Sync products from Trendyol
   */
  async syncProducts(request: SyncProductsRequest) {
    const syncUseCase = new SyncProductsFromTrendyolUseCase(
      this.productRepository,
      this.trendyolService
    );

    return await syncUseCase.execute(request);
  }

  /**
   * Sync orders from Trendyol
   */
  async syncOrders(request: SyncOrdersRequest) {
    const syncUseCase = new SyncOrdersFromTrendyolUseCase(this.trendyolService);
    return await syncUseCase.execute(request);
  }

  /**
   * Test Trendyol connection
   */
  async testConnection(credentials: TrendyolCredentials) {
    const trendyolService = new TrendyolService(credentials);
    return await trendyolService.testConnection();
  }

  /**
   * Get products from Trendyol (for preview)
   */
  async getProducts(
    credentials: TrendyolCredentials,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
    }
  ) {
    const trendyolService = new TrendyolService(credentials);
    return await trendyolService.getProducts(options);
  }

  /**
   * Get orders from Trendyol (for preview)
   */
  async getOrders(
    credentials: TrendyolCredentials,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const trendyolService = new TrendyolService(credentials);
    return await trendyolService.getOrders(options);
  }
}
