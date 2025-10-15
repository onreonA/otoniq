/**
 * Inventory Service
 * Business logic for inventory operations
 */

import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
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

export class InventoryService {
  constructor(private repository: IInventoryRepository) {}

  // Warehouse operations
  async getAllWarehouses(tenantId: string): Promise<Warehouse[]> {
    return this.repository.getAllWarehouses(tenantId);
  }

  async getWarehouseById(
    id: string,
    tenantId: string
  ): Promise<Warehouse | null> {
    return this.repository.getWarehouseById(id, tenantId);
  }

  async createWarehouse(
    data: CreateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse> {
    // Validate warehouse data
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Warehouse name is required');
    }

    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Warehouse code is required');
    }

    return this.repository.createWarehouse(data, tenantId, userId);
  }

  async updateWarehouse(
    id: string,
    data: UpdateWarehouseDTO,
    tenantId: string,
    userId: string
  ): Promise<Warehouse> {
    // Validate update data
    if (data.name && data.name.trim().length === 0) {
      throw new Error('Warehouse name cannot be empty');
    }

    if (data.code && data.code.trim().length === 0) {
      throw new Error('Warehouse code cannot be empty');
    }

    return this.repository.updateWarehouse(id, data, tenantId, userId);
  }

  async deleteWarehouse(id: string, tenantId: string): Promise<void> {
    // Check if warehouse has stock levels
    const stockLevels = await this.repository.getStockLevels(tenantId, id);
    if (stockLevels.length > 0) {
      throw new Error('Cannot delete warehouse with existing stock levels');
    }

    return this.repository.deleteWarehouse(id, tenantId);
  }

  // Stock Level operations
  async getStockLevels(
    tenantId: string,
    warehouseId?: string
  ): Promise<StockLevel[]> {
    return this.repository.getStockLevels(tenantId, warehouseId);
  }

  async getStockLevelById(
    id: string,
    tenantId: string
  ): Promise<StockLevel | null> {
    return this.repository.getStockLevelById(id, tenantId);
  }

  async createStockLevel(
    data: CreateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel> {
    // Validate stock level data
    if (!data.productId) {
      throw new Error('Product ID is required');
    }

    if (!data.warehouseId) {
      throw new Error('Warehouse ID is required');
    }

    if (data.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (data.reserved < 0) {
      throw new Error('Reserved quantity cannot be negative');
    }

    if (data.reorderPoint < 0) {
      throw new Error('Reorder point cannot be negative');
    }

    // Check if stock level already exists for this product and warehouse
    const existingStock =
      await this.repository.getStockLevelByProductAndWarehouse(
        data.productId,
        data.warehouseId,
        tenantId
      );

    if (existingStock) {
      throw new Error(
        'Stock level already exists for this product and warehouse'
      );
    }

    return this.repository.createStockLevel(data, tenantId, userId);
  }

  async updateStockLevel(
    id: string,
    data: UpdateStockLevelDTO,
    tenantId: string,
    userId: string
  ): Promise<StockLevel> {
    // Validate update data
    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    if (data.reserved !== undefined && data.reserved < 0) {
      throw new Error('Reserved quantity cannot be negative');
    }

    if (data.reorderPoint !== undefined && data.reorderPoint < 0) {
      throw new Error('Reorder point cannot be negative');
    }

    return this.repository.updateStockLevel(id, data, tenantId, userId);
  }

  async deleteStockLevel(id: string, tenantId: string): Promise<void> {
    return this.repository.deleteStockLevel(id, tenantId);
  }

  // Stock Movement operations
  async getStockMovements(
    tenantId: string,
    options?: {
      warehouseId?: string;
      productId?: string;
      limit?: number;
    }
  ): Promise<StockMovement[]> {
    return this.repository.getStockMovements(tenantId, options);
  }

  async createStockMovement(
    data: CreateStockMovementDTO,
    tenantId: string,
    userId: string
  ): Promise<StockMovement> {
    // Validate stock movement data
    if (!data.productId) {
      throw new Error('Product ID is required');
    }

    if (!data.type) {
      throw new Error('Movement type is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!data.warehouseId && !data.fromWarehouseId && !data.toWarehouseId) {
      throw new Error('At least one warehouse must be specified');
    }

    // Validate movement type specific requirements
    if (data.type === 'in' && !data.warehouseId) {
      throw new Error('Warehouse is required for stock in movement');
    }

    if (data.type === 'out' && !data.warehouseId) {
      throw new Error('Warehouse is required for stock out movement');
    }

    if (
      data.type === 'transfer' &&
      (!data.fromWarehouseId || !data.toWarehouseId)
    ) {
      throw new Error('Both from and to warehouses are required for transfer');
    }

    if (data.type === 'adjustment' && !data.warehouseId) {
      throw new Error('Warehouse is required for stock adjustment');
    }

    // Create the stock movement
    const movement = await this.repository.createStockMovement(
      data,
      tenantId,
      userId
    );

    // Update stock levels based on movement type
    await this.updateStockLevelsFromMovement(data, tenantId, userId);

    return movement;
  }

  // Utility methods
  async getLowStockProducts(tenantId: string): Promise<StockLevel[]> {
    return this.repository.getLowStockProducts(tenantId);
  }

  async getOutOfStockProducts(tenantId: string): Promise<StockLevel[]> {
    return this.repository.getOutOfStockProducts(tenantId);
  }

  // Private helper methods
  private async updateStockLevelsFromMovement(
    data: CreateStockMovementDTO,
    tenantId: string,
    userId: string
  ): Promise<void> {
    switch (data.type) {
      case 'in':
        await this.adjustStockLevel(
          data.productId,
          data.warehouseId!,
          data.quantity,
          tenantId,
          userId
        );
        break;

      case 'out':
        await this.adjustStockLevel(
          data.productId,
          data.warehouseId!,
          -data.quantity,
          tenantId,
          userId
        );
        break;

      case 'transfer':
        // Reduce from source warehouse
        await this.adjustStockLevel(
          data.productId,
          data.fromWarehouseId!,
          -data.quantity,
          tenantId,
          userId
        );
        // Increase in destination warehouse
        await this.adjustStockLevel(
          data.productId,
          data.toWarehouseId!,
          data.quantity,
          tenantId,
          userId
        );
        break;

      case 'adjustment':
        // Calculate adjustment quantity (new quantity - current quantity)
        const currentStock =
          await this.repository.getStockLevelByProductAndWarehouse(
            data.productId,
            data.warehouseId!,
            tenantId
          );

        if (currentStock) {
          const adjustmentQuantity = data.quantity - currentStock.quantity;
          await this.adjustStockLevel(
            data.productId,
            data.warehouseId!,
            adjustmentQuantity,
            tenantId,
            userId
          );
        }
        break;
    }
  }

  private async adjustStockLevel(
    productId: string,
    warehouseId: string,
    quantityChange: number,
    tenantId: string,
    userId: string
  ): Promise<void> {
    const currentStock =
      await this.repository.getStockLevelByProductAndWarehouse(
        productId,
        warehouseId,
        tenantId
      );

    if (currentStock) {
      // Update existing stock level
      const newQuantity = currentStock.quantity + quantityChange;
      if (newQuantity < 0) {
        throw new Error('Insufficient stock for this operation');
      }

      await this.repository.updateStockLevel(
        currentStock.id,
        { quantity: newQuantity },
        tenantId,
        userId
      );
    } else if (quantityChange > 0) {
      // Create new stock level for positive quantity
      await this.repository.createStockLevel(
        {
          productId,
          warehouseId,
          quantity: quantityChange,
          reserved: 0,
          reorderPoint: 0,
        },
        tenantId,
        userId
      );
    } else {
      throw new Error('Cannot create negative stock level');
    }
  }
}
