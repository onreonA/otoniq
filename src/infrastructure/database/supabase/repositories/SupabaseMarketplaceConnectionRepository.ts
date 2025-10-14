/**
 * Supabase Marketplace Connection Repository Implementation
 */

import { supabase } from '../client';
import {
  MarketplaceConnection,
  MarketplaceCredentials,
  MarketplaceConfig,
} from '../../../../domain/entities/MarketplaceConnection';
import {
  MarketplaceConnectionRepository,
  MarketplaceConnectionFilters,
  MarketplaceConnectionSortOptions,
  PaginationOptions,
  PaginatedResult,
} from '../../../../domain/repositories/MarketplaceConnectionRepository';

export class SupabaseMarketplaceConnectionRepository
  implements MarketplaceConnectionRepository
{
  /**
   * Find marketplace connection by ID
   */
  async findById(id: string): Promise<MarketplaceConnection | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error finding marketplace connection by ID:', error);
        throw new Error(
          `Failed to find marketplace connection: ${error.message}`
        );
      }

      return data ? this.mapToEntity(data) : null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  /**
   * Find marketplace connections with filters and pagination
   */
  async findMany(
    filters: MarketplaceConnectionFilters,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>> {
    try {
      let query = supabase
        .from('marketplace_connections')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.tenant_id) {
        query = query.eq('tenant_id', filters.tenant_id);
      }

      if (filters.marketplace) {
        query = query.eq('marketplace', filters.marketplace);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.sync_enabled !== undefined) {
        query = query.eq('sync_enabled', filters.sync_enabled);
      }

      if (filters.search) {
        // Escape special characters for ilike query
        const escapedSearch = filters.search
          .replace(/[%_\\]/g, '\\$&') // Escape PostgreSQL special characters
          .replace(/[|,]/g, ' '); // Replace problematic characters with spaces

        query = query.or(
          `name.ilike.%${escapedSearch}%,marketplace.ilike.%${escapedSearch}%`
        );
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, {
          ascending: sort.direction === 'asc',
        });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (pagination) {
        const from = (pagination.page - 1) * pagination.limit;
        const to = from + pagination.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error finding marketplace connections:', error);
        throw new Error(
          `Failed to find marketplace connections: ${error.message}`
        );
      }

      const connections = data?.map(item => this.mapToEntity(item)) || [];
      const total = count || 0;
      const totalPages = pagination ? Math.ceil(total / pagination.limit) : 1;

      return {
        data: connections,
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || connections.length,
        totalPages,
        hasNext: pagination ? pagination.page < totalPages : false,
        hasPrev: pagination ? pagination.page > 1 : false,
      };
    } catch (error) {
      console.error('Error in findMany:', error);
      throw error;
    }
  }

  /**
   * Find marketplace connections by tenant
   */
  async findByTenant(
    tenantId: string,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>> {
    return this.findMany({ tenant_id: tenantId }, sort, pagination);
  }

  /**
   * Find marketplace connections by marketplace type
   */
  async findByMarketplace(
    tenantId: string,
    marketplace: MarketplaceConnection['marketplace'],
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>> {
    return this.findMany(
      { tenant_id: tenantId, marketplace },
      sort,
      pagination
    );
  }

  /**
   * Find active marketplace connections for tenant
   */
  async findActiveByTenant(
    tenantId: string,
    sort?: MarketplaceConnectionSortOptions,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<MarketplaceConnection>> {
    return this.findMany(
      { tenant_id: tenantId, status: 'active' },
      sort,
      pagination
    );
  }

  /**
   * Check if marketplace connection name exists for tenant
   */
  async nameExists(
    tenantId: string,
    name: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('marketplace_connections')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking marketplace connection name:', error);
        throw new Error(
          `Failed to check marketplace connection name: ${error.message}`
        );
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in nameExists:', error);
      throw error;
    }
  }

  /**
   * Create new marketplace connection
   */
  async create(
    connection: MarketplaceConnection
  ): Promise<MarketplaceConnection> {
    try {
      const connectionData = {
        id: connection.id,
        tenant_id: connection.tenant_id,
        marketplace: connection.marketplace,
        name: connection.name,
        credentials: connection.credentials,
        config: connection.config,
        status: connection.status,
        last_sync_at: connection.last_sync_at?.toISOString(),
        last_error: connection.last_error,
        sync_enabled: connection.sync_enabled,
        auto_sync_interval: connection.auto_sync_interval,
        created_at: connection.created_at.toISOString(),
        updated_at: connection.updated_at.toISOString(),
      };

      const { data, error } = await supabase
        .from('marketplace_connections')
        .insert(connectionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating marketplace connection:', error);
        throw new Error(
          `Failed to create marketplace connection: ${error.message}`
        );
      }

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  /**
   * Update existing marketplace connection
   */
  async update(
    connection: MarketplaceConnection
  ): Promise<MarketplaceConnection> {
    try {
      const connectionData = {
        marketplace: connection.marketplace,
        name: connection.name,
        credentials: connection.credentials,
        config: connection.config,
        status: connection.status,
        last_sync_at: connection.last_sync_at?.toISOString(),
        last_error: connection.last_error,
        sync_enabled: connection.sync_enabled,
        auto_sync_interval: connection.auto_sync_interval,
        updated_at: connection.updated_at.toISOString(),
      };

      const { data, error } = await supabase
        .from('marketplace_connections')
        .update(connectionData)
        .eq('id', connection.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating marketplace connection:', error);
        throw new Error(
          `Failed to update marketplace connection: ${error.message}`
        );
      }

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  /**
   * Delete marketplace connection
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting marketplace connection:', error);
        throw new Error(
          `Failed to delete marketplace connection: ${error.message}`
        );
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  /**
   * Update connection status
   */
  async updateStatus(
    id: string,
    status: MarketplaceConnection['status'],
    error?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (error !== undefined) {
        updateData.last_error = error;
      }

      const { error: updateError } = await supabase
        .from('marketplace_connections')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error(
          'Error updating marketplace connection status:',
          updateError
        );
        throw new Error(
          `Failed to update marketplace connection status: ${updateError.message}`
        );
      }
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  /**
   * Update last sync time
   */
  async updateLastSync(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error(
          'Error updating marketplace connection last sync:',
          error
        );
        throw new Error(
          `Failed to update marketplace connection last sync: ${error.message}`
        );
      }
    } catch (error) {
      console.error('Error in updateLastSync:', error);
      throw error;
    }
  }

  /**
   * Get connection statistics for tenant
   */
  async getConnectionStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    error: number;
    testing: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('status')
        .eq('tenant_id', tenantId);

      if (error) {
        console.error('Error getting marketplace connection stats:', error);
        throw new Error(
          `Failed to get marketplace connection stats: ${error.message}`
        );
      }

      const stats = {
        total: data?.length || 0,
        active: 0,
        inactive: 0,
        error: 0,
        testing: 0,
      };

      data?.forEach(item => {
        switch (item.status) {
          case 'active':
            stats.active++;
            break;
          case 'inactive':
            stats.inactive++;
            break;
          case 'error':
            stats.error++;
            break;
          case 'testing':
            stats.testing++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getConnectionStats:', error);
      throw error;
    }
  }

  /**
   * Map database record to entity
   */
  private mapToEntity(data: any): MarketplaceConnection {
    return new MarketplaceConnection(
      data.id,
      data.tenant_id,
      data.marketplace,
      data.name,
      data.credentials as MarketplaceCredentials,
      data.config as MarketplaceConfig,
      data.status,
      data.last_sync_at ? new Date(data.last_sync_at) : undefined,
      data.last_error,
      data.sync_enabled,
      data.auto_sync_interval,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
