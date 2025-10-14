/**
 * Customer Domain Entities
 */

export type CustomerType = 'individual' | 'business';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';
export type CustomerSegment =
  | 'new'
  | 'vip'
  | 'b2b'
  | 'repeat'
  | 'at_risk'
  | 'inactive';

export interface Customer {
  id: string;
  tenantId: string;
  customerType: CustomerType;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  taxNumber: string | null;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  segment: CustomerSegment;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  loyaltyPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  customerType: CustomerType;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: CustomerStatus;
  segment?: CustomerSegment;
}
