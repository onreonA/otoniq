/**
 * Customer Service
 * Business logic for customer operations
 */

import {
  ICustomerRepository,
  CustomerFilters,
  CustomerStats,
} from '../../domain/repositories/ICustomerRepository';
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from '../../domain/entities/Customer';

export class CustomerService {
  constructor(private repository: ICustomerRepository) {}

  async getAll(
    tenantId: string,
    filters?: CustomerFilters
  ): Promise<Customer[]> {
    return this.repository.getAll(tenantId, filters);
  }

  async getById(id: string, tenantId: string): Promise<Customer | null> {
    return this.repository.getById(id, tenantId);
  }

  async create(
    data: CreateCustomerDTO,
    tenantId: string,
    userId: string
  ): Promise<Customer> {
    // Validate customer data
    if (!data.email && !data.phone) {
      throw new Error('Either email or phone is required');
    }

    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    return this.repository.create(data, tenantId, userId);
  }

  async update(
    id: string,
    data: UpdateCustomerDTO,
    tenantId: string,
    userId: string
  ): Promise<Customer> {
    // Validate update data
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    return this.repository.update(id, data, tenantId, userId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    return this.repository.delete(id, tenantId);
  }

  async getBySegment(segment: string, tenantId: string): Promise<Customer[]> {
    return this.repository.getBySegment(segment, tenantId);
  }

  async getStats(tenantId: string): Promise<CustomerStats> {
    return this.repository.getStats(tenantId);
  }

  async search(query: string, tenantId: string): Promise<Customer[]> {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    return this.repository.search(query, tenantId);
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
