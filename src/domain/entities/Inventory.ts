/**
 * Inventory Domain Entities
 */

// Warehouse
export interface Warehouse {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  managerName: string | null;
  isActive: boolean;
  isPrimary: boolean;
  totalCapacity: number | null;
  currentUsage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarehouseDTO {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  isPrimary?: boolean;
}

export interface UpdateWarehouseDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
  isPrimary?: boolean;
}

// Stock Level
export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumQuantity: number;
  maximumQuantity: number | null;
  aisle: string | null;
  rack: string | null;
  shelf: string | null;
  bin: string | null;
  lastCountedAt: Date | null;
  lastCountedQuantity: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Joined data from related tables
  productName?: string;
  productSku?: string;
  warehouseName?: string;
  averageCost?: number;
}

export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'overstock';

export interface UpdateStockDTO {
  quantity?: number;
  reservedQuantity?: number;
  minimumQuantity?: number;
  location?: {
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
  };
}

// Stock Movement
export type MovementType =
  | 'purchase'
  | 'sale'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'return'
  | 'production'
  | 'damage'
  | 'count'
  | 'reservation'
  | 'release';

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  relatedWarehouseId: string | null;
  referenceType: string | null;
  referenceId: string | null;
  referenceNumber: string | null;
  unitCost: number | null;
  totalCost: number | null;
  quantityBefore: number | null;
  quantityAfter: number | null;
  notes: string | null;
  createdAt: Date;
  createdBy: string | null;

  // Joined data from related tables
  productName?: string;
  productSku?: string;
  warehouseName?: string;
  relatedWarehouseName?: string;
}

export interface CreateStockMovementDTO {
  productId: string;
  warehouseId: string;
  movementType: MovementType;
  quantity: number;
  relatedWarehouseId?: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface StockFilters {
  warehouseId?: string;
  status?: StockStatus;
  lowStock?: boolean;
  search?: string;
}
