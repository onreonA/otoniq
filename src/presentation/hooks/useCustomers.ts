/**
 * useCustomers Hook
 * React hook for customer operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseCustomerRepository } from '../../infrastructure/database/supabase/repositories/SupabaseCustomerRepository';
import { CustomerService } from '../../infrastructure/services/CustomerService';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '../../domain/entities/Customer';
import { CustomerFilters, CustomerStats } from '../../domain/repositories/ICustomerRepository';
import { useAuth } from './useAuth';

const repository = new SupabaseCustomerRepository();
const service = new CustomerService(repository);

export const useCustomers = (filters?: CustomerFilters) => {
  const { user, tenantId } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getAll(tenantId, filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, filters]);

  const fetchStats = useCallback(async () => {
    if (!tenantId) return;

    try {
      const data = await service.getStats(tenantId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching customer stats:', err);
    }
  }, [tenantId]);

  const getById = async (id: string): Promise<Customer | null> => {
    if (!tenantId) return null;

    setLoading(true);
    setError(null);

    try {
      return await service.getById(id, tenantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer');
      console.error('Error fetching customer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (data: CreateCustomerDTO): Promise<Customer | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const customer = await service.create(data, tenantId, user.id);
      await fetchCustomers();
      await fetchStats();
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      console.error('Error creating customer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (
    id: string,
    data: UpdateCustomerDTO
  ): Promise<Customer | null> => {
    if (!tenantId || !user) return null;

    setLoading(true);
    setError(null);

    try {
      const customer = await service.update(id, data, tenantId, user.id);
      await fetchCustomers();
      await fetchStats();
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      console.error('Error updating customer:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (id: string): Promise<boolean> => {
    if (!tenantId) return false;

    setLoading(true);
    setError(null);

    try {
      await service.delete(id, tenantId);
      await fetchCustomers();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      console.error('Error deleting customer:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string): Promise<Customer[]> => {
    if (!tenantId) return [];

    try {
      return await service.search(query, tenantId);
    } catch (err) {
      console.error('Error searching customers:', err);
      return [];
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchCustomers();
      fetchStats();
    }
  }, [tenantId, fetchCustomers, fetchStats]);

  return {
    customers,
    stats,
    loading,
    error,
    fetchCustomers,
    getById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
  };
};

