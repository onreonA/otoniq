/**
 * Supabase Inventory Repository Implementation
 */

import { supabase } from '../client';
import { IInventoryRepository } from '../../../../domain/repositories/IInventoryRepository';
import {
  Warehouse,
  StockLevel,
  StockMovement,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateStockLevelDTO,
  UpdateStockLevelDTO,
  CreateStockMovementDTO,
} from '../../../../domain/entities/Inventory';

export class SupabaseInventoryRepository implements IInventoryRepository {
  // Warehouse operations
  async getAllWarehouses(tenantId: string): Promise<Warehouse[]> {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getWarehouseById(id: string, tenantId: string): Promise<Warehouse | null> {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async createWarehouse(
    data: CreateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse> {
    const { data: result, error } = await supabase
      .from('warehouses')
      .insert({
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async updateWarehouse(
    id: string,
    data: UpdateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse> {
    const { data: result, error } = await supabase
      .from('warehouses')
      .update({
        ...data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deleteWarehouse(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  // Stock Level operations
  async getStockLevels(tenantId: string, warehouseId?: string): Promise<StockLevel[]> {
    let query = supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .eq('tenant_id', tenantId);

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStockLevelById(id: string, tenantId: string): Promise<StockLevel | null> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async createStockLevel(
    data: CreateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel> {
    const { data: result, error } = await supabase
      .from('stock_levels')
      .insert({
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      })
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .single();

    if (error) throw error;
    return result;
  }

  async updateStockLevel(
    id: string,
    data: UpdateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel> {
    const { data: result, error } = await supabase
      .from('stock_levels')
      .update({
        ...data,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .single();

    if (error) throw error;
    return result;
  }

  async deleteStockLevel(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('stock_levels')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  // Stock Movement operations
  async getStockMovements(
    tenantId: string,
    options: {
      warehouseId?: string;
      productId?: string;
      limit?: number;
    } = {}
  ): Promise<StockMovement[]> {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code),
        from_warehouse:from_warehouse_id (id, name, code),
        to_warehouse:to_warehouse_id (id, name, code),
        users:created_by (id, full_name, email)
      `)
      .eq('tenant_id', tenantId);

    if (options.warehouseId) {
      query = query.or(`warehouse_id.eq.${options.warehouseId},from_warehouse_id.eq.${options.warehouseId},to_warehouse_id.eq.${options.warehouseId}`);
    }

    if (options.productId) {
      query = query.eq('product_id', options.productId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createStockMovement(
    data: CreateStockMovementDTO,
    tenantId: string,
    userId: string
  ): Promise<StockMovement> {
    const { data: result, error } = await supabase
      .from('stock_movements')
      .insert({
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      })
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code),
        from_warehouse:from_warehouse_id (id, name, code),
        to_warehouse:to_warehouse_id (id, name, code),
        users:created_by (id, full_name, email)
      `)
      .single();

    if (error) throw error;
    return result;
  }

  // Utility methods
  async getStockLevelByProductAndWarehouse(
    productId: string,
    warehouseId: string,
    tenantId: string
  ): Promise<StockLevel | null> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .eq('product_id', productId)
      .eq('warehouse_id', warehouseId)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async getLowStockProducts(tenantId: string): Promise<StockLevel[]> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .eq('tenant_id', tenantId)
      .lte('available', supabase.raw('reorder_point'))
      .order('available');

    if (error) throw error;
    return data || [];
  }

  async getOutOfStockProducts(tenantId: string): Promise<StockLevel[]> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id (id, name, sku),
        warehouses:warehouse_id (id, name, code)
      `)
      .eq('tenant_id', tenantId)
      .eq('available', 0)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
