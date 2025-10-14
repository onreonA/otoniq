/**
 * Customer Repository Interface
 */

import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../entities/Customer';

export interface ICustomerRepository {
  // Customer operations
  getAll(tenantId: string, filters?: CustomerFilters): Promise<Customer[]>;
  getById(id: string, tenantId: string): Promise<Customer | null>;
  create(data: CreateCustomerDTO, tenantId: string, userId: string): Promise<Customer>;
  update(
    id: string,
    data: UpdateCustomerDTO,
    tenantId: string,
    userId: string
  ): Promise<Customer>;
  delete(id: string, tenantId: string): Promise<void>;

  // Segmentation
  getBySegment(segment: string, tenantId: string): Promise<Customer[]>;
  getStats(tenantId: string): Promise<CustomerStats>;

  // Search
  search(query: string, tenantId: string): Promise<Customer[]>;
}

export interface CustomerFilters {
  segment?: string;
  status?: string;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  new: number;
  vip: number;
  b2b: number;
  repeat: number;
  atRisk: number;
  totalLifetimeValue: number;
  averageLifetimeValue: number;
}

