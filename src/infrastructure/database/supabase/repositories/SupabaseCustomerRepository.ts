/**
 * Supabase Customer Repository Implementation
 */

import { supabase } from '../client';
import {
  ICustomerRepository,
  CustomerFilters,
  CustomerStats,
} from '../../../../domain/repositories/ICustomerRepository';
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from '../../../../domain/entities/Customer';

export class SupabaseCustomerRepository implements ICustomerRepository {
  async getAll(
    tenantId: string,
    filters: CustomerFilters = {}
  ): Promise<Customer[]> {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.segment) {
      query = query.eq('segment', filters.segment);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data || [];
  }

  async getById(id: string, tenantId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async create(
    data: CreateCustomerDTO,
    tenantId: string,
    userId: string
  ): Promise<Customer> {
    const { data: result, error } = await supabase
      .from('customers')
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

  async update(
    id: string,
    data: UpdateCustomerDTO,
    tenantId: string,
    userId: string
  ): Promise<Customer> {
    const { data: result, error } = await supabase
      .from('customers')
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

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async getBySegment(segment: string, tenantId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('segment', segment)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStats(tenantId: string): Promise<CustomerStats> {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('status, segment, lifetime_value')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    if (!customers || customers.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        blocked: 0,
        new: 0,
        vip: 0,
        b2b: 0,
        repeat: 0,
        atRisk: 0,
        totalLifetimeValue: 0,
        averageLifetimeValue: 0,
      };
    }

    const stats = customers.reduce(
      (acc, customer) => {
        acc.total++;

        // Status counts
        if (customer.status === 'active') acc.active++;
        if (customer.status === 'inactive') acc.inactive++;
        if (customer.status === 'blocked') acc.blocked++;

        // Segment counts
        if (customer.segment === 'new') acc.new++;
        if (customer.segment === 'vip') acc.vip++;
        if (customer.segment === 'b2b') acc.b2b++;
        if (customer.segment === 'repeat') acc.repeat++;
        if (customer.segment === 'at_risk') acc.atRisk++;

        acc.totalLifetimeValue += customer.lifetime_value || 0;
        return acc;
      },
      {
        total: 0,
        active: 0,
        inactive: 0,
        blocked: 0,
        new: 0,
        vip: 0,
        b2b: 0,
        repeat: 0,
        atRisk: 0,
        totalLifetimeValue: 0,
        averageLifetimeValue: 0,
      } as CustomerStats
    );

    stats.averageLifetimeValue =
      stats.total > 0 ? stats.totalLifetimeValue / stats.total : 0;

    return stats;
  }

  async search(query: string, tenantId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .or(
        `email.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`
      )
      .limit(20);

    if (error) throw error;
    return data || [];
  }
}
