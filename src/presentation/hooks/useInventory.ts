/**
 * useInventory Hook
 * React hook for inventory operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseInventoryRepository } from '../../infrastructure/database/supabase/repositories/SupabaseInventoryRepository';
import { InventoryService } from '../../infrastructure/services/InventoryService';
import {
  Warehouse,
  StockLevel,
  StockMovement,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateStockLevelDTO,
  UpdateStockLevelDTO,
  CreateStockMovementDTO,
} from '../../domain/entities/Inventory';
import { useAuth } from './useAuth';

const repository = new SupabaseInventoryRepository();
const service = new InventoryService(repository);

export const useInventory = () => {
  const { user, tenantId } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warehouse operations
  const fetchWarehouses = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getAllWarehouses(tenantId);
      setWarehouses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createWarehouse = async (data: CreateWarehouseDTO): Promise<Warehouse | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const warehouse = await service.createWarehouse(data, tenantId, user.id);
      await fetchWarehouses();
      return warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
      console.error('Error creating warehouse:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWarehouse = async (
    id: string,
    data: UpdateWarehouseDTO
  ): Promise<Warehouse | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const warehouse = await service.updateWarehouse(id, data, tenantId, user.id);
      await fetchWarehouses();
      return warehouse;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
      console.error('Error updating warehouse:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteWarehouse = async (id: string): Promise<boolean> => {
    if (!tenantId) return false;

    setLoading(true);
    setError(null);

    try {
      await service.deleteWarehouse(id, tenantId);
      await fetchWarehouses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
      console.error('Error deleting warehouse:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Stock Level operations
  const fetchStockLevels = useCallback(async (warehouseId?: string) => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getStockLevels(tenantId, warehouseId);
      setStockLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock levels');
      console.error('Error fetching stock levels:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const updateStockLevel = async (
    id: string,
    data: UpdateStockLevelDTO
  ): Promise<StockLevel | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const stockLevel = await service.updateStockLevel(id, data, tenantId, user.id);
      await fetchStockLevels();
      return stockLevel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock level');
      console.error('Error updating stock level:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Stock Movement operations
  const fetchStockMovements = useCallback(async (
    warehouseId?: string,
    productId?: string,
    limit = 100
  ) => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getStockMovements(tenantId, {
        warehouseId,
        productId,
        limit,
      });
      setStockMovements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock movements');
      console.error('Error fetching stock movements:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const createStockMovement = async (data: CreateStockMovementDTO): Promise<StockMovement | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const movement = await service.createStockMovement(data, tenantId, user.id);
      await fetchStockMovements();
      await fetchStockLevels();
      return movement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stock movement');
      console.error('Error creating stock movement:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (tenantId) {
      fetchWarehouses();
      fetchStockLevels();
      fetchStockMovements();
    }
  }, [tenantId, fetchWarehouses, fetchStockLevels, fetchStockMovements]);

  return {
    // Data
    warehouses,
    stockLevels,
    stockMovements,
    loading,
    error,

    // Warehouse operations
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // Stock Level operations
    fetchStockLevels,
    updateStockLevel,

    // Stock Movement operations
    fetchStockMovements,
    createStockMovement,
  };
};
