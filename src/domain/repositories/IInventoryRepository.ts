/**
 * Inventory Repository Interface
 */

import {
  Warehouse,
  StockLevel,
  StockMovement,
  CreateWarehouseDTO,
  UpdateWarehouseDTO,
  CreateStockLevelDTO,
  UpdateStockLevelDTO,
  CreateStockMovementDTO,
} from '../entities/Inventory';

export interface IInventoryRepository {
  // Warehouse operations
  getAllWarehouses(tenantId: string): Promise<Warehouse[]>;
  getWarehouseById(id: string, tenantId: string): Promise<Warehouse | null>;
  createWarehouse(
    data: CreateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse>;
  updateWarehouse(
    id: string,
    data: UpdateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse>;
  deleteWarehouse(id: string, tenantId: string): Promise<void>;

  // Stock Level operations
  getStockLevels(tenantId: string, warehouseId?: string): Promise<StockLevel[]>;
  getStockLevelById(id: string, tenantId: string): Promise<StockLevel | null>;
  createStockLevel(
    data: CreateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel>;
  updateStockLevel(
    id: string,
    data: UpdateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel>;
  deleteStockLevel(id: string, tenantId: string): Promise<void>;

  // Stock Movement operations
  getStockMovements(
    tenantId: string,
    options?: {
      warehouseId?: string;
      productId?: string;
      limit?: number;
    }
  ): Promise<StockMovement[]>;
  createStockMovement(
    data: CreateStockMovementDTO,
    tenantId: string,
    userId: string
  ): Promise<StockMovement>;

  // Utility methods
  getStockLevelByProductAndWarehouse(
    productId: string,
    warehouseId: string,
    tenantId: string
  ): Promise<StockLevel | null>;
  getLowStockProducts(tenantId: string): Promise<StockLevel[]>;
  getOutOfStockProducts(tenantId: string): Promise<StockLevel[]>;
}
