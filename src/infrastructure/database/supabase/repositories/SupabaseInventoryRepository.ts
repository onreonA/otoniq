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

  async getWarehouseById(
    id: string,
    tenantId: string
  ): Promise<Warehouse | null> {
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
  async getStockLevels(
    tenantId: string,
    warehouseId?: string
  ): Promise<StockLevel[]> {
    let query = supabase
      .from('stock_levels')
      .select(
        `
        *,
        products!inner(id, name, sku, cost),
        warehouses!inner(id, name)
      `
      )
      .eq('tenant_id', tenantId);

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    // Map to StockLevel entity with joined data
    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      warehouseId: row.warehouse_id,
      quantity: parseFloat(row.quantity) || 0,
      reservedQuantity: parseFloat(row.reserved_quantity) || 0,
      availableQuantity: parseFloat(row.available_quantity) || 0,
      minimumQuantity: parseFloat(row.minimum_quantity) || 0,
      maximumQuantity: row.maximum_quantity
        ? parseFloat(row.maximum_quantity)
        : null,
      aisle: row.aisle,
      rack: row.rack,
      shelf: row.shelf,
      bin: row.bin,
      lastCountedAt: row.last_counted_at ? new Date(row.last_counted_at) : null,
      lastCountedQuantity: row.last_counted_quantity
        ? parseFloat(row.last_counted_quantity)
        : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),

      // Joined data
      productName: row.products?.name || 'Unknown Product',
      productSku: row.products?.sku || 'N/A',
      warehouseName: row.warehouses?.name || 'Unknown Warehouse',
      averageCost: row.products?.cost ? parseFloat(row.products.cost) : 0,
    }));
  }

  async getStockLevelById(
    id: string,
    tenantId: string
  ): Promise<StockLevel | null> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select('*')
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
      .select('*')
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
      .select('*')
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
      .select(
        `
        *,
        products!inner(id, name, sku),
        warehouses!inner(id, name)
      `
      )
      .eq('tenant_id', tenantId);

    if (options.warehouseId) {
      query = query.eq('warehouse_id', options.warehouseId);
    }

    if (options.productId) {
      query = query.eq('product_id', options.productId);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    // Map to StockMovement entity with joined data
    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      productId: row.product_id,
      warehouseId: row.warehouse_id,
      movementType: row.movement_type,
      quantity: parseFloat(row.quantity) || 0,
      relatedWarehouseId: row.related_warehouse_id,
      referenceType: row.reference_type,
      referenceId: row.reference_id,
      referenceNumber: row.reference_number,
      unitCost: row.unit_cost ? parseFloat(row.unit_cost) : null,
      totalCost: row.total_cost ? parseFloat(row.total_cost) : null,
      quantityBefore: row.quantity_before
        ? parseFloat(row.quantity_before)
        : null,
      quantityAfter: row.quantity_after ? parseFloat(row.quantity_after) : null,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      createdBy: row.created_by,

      // Joined data
      productName: row.products?.name || 'Unknown Product',
      productSku: row.products?.sku || 'N/A',
      warehouseName: row.warehouses?.name || 'Unknown Warehouse',
      relatedWarehouseName: null, // Will be fetched separately if needed
    }));
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
      .select('*')
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
      .select('*')
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
      .select('*')
      .eq('tenant_id', tenantId)
      .lte('available', supabase.raw('reorder_point'))
      .order('available');

    if (error) throw error;
    return data || [];
  }

  async getOutOfStockProducts(tenantId: string): Promise<StockLevel[]> {
    const { data, error } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('available', 0)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
