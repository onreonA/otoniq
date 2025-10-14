/**
 * Supplier Domain Entities
 */

export type SupplierStatus = 'active' | 'inactive' | 'blocked' | 'pending';
export type SupplierType =
  | 'manufacturer'
  | 'distributor'
  | 'wholesaler'
  | 'importer'
  | 'agent';

export interface Supplier {
  id: string;
  tenantId: string;
  supplierCode: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  status: SupplierStatus;
  supplierType: SupplierType;
  qualityRating: number | null;
  onTimeDeliveryRate: number | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDTO {
  supplierCode: string;
  companyName: string;
  email?: string;
  phone?: string;
  supplierType: SupplierType;
}

export interface UpdateSupplierDTO {
  companyName?: string;
  email?: string;
  phone?: string;
  status?: SupplierStatus;
  qualityRating?: number;
}
