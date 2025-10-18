/**
 * Tenant Management Service
 *
 * Manages tenant CRUD operations, status changes, and tenant analytics.
 */

import { getSupabaseClient } from '../database/supabase/client';
import { subscriptionService } from './SubscriptionService';

// ============================================================================
// TYPES
// ============================================================================

export interface Tenant {
  id: string;
  company_name: string;
  domain: string | null;
  subscription_plan: string;
  subscription_status: string;
  n8n_webhook_url: string | null;
  odoo_api_config: Record<string, any> | null;
  shopify_store_config: Record<string, any> | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantRequest {
  company_name: string;
  domain?: string;
  subscription_plan?: string;
  subscription_status?: string;
  admin_user: {
    email: string;
    full_name: string;
    password?: string;
  };
  plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  is_trial?: boolean;
  settings?: Record<string, any>;
}

export interface UpdateTenantRequest {
  company_name?: string;
  domain?: string;
  subscription_plan?: string;
  subscription_status?: string;
  n8n_webhook_url?: string;
  settings?: Record<string, any>;
}

export interface TenantFilters {
  search?: string;
  subscription_plan?: string;
  subscription_status?: string;
  created_after?: string;
  created_before?: string;
}

export interface TenantStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  api_calls_today: number;
  storage_used_gb: number;
  last_activity: string | null;
}

// ============================================================================
// TENANT MANAGEMENT SERVICE
// ============================================================================

export class TenantManagementService {
  private supabase = getSupabaseClient();

  // ==========================================================================
  // TENANT CRUD
  // ==========================================================================

  /**
   * Get all tenants with optional filters
   */
  async getAllTenants(filters?: TenantFilters): Promise<Tenant[]> {
    try {
      let query = this.supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(
          `company_name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`
        );
      }

      if (filters?.subscription_plan) {
        query = query.eq('subscription_plan', filters.subscription_plan);
      }

      if (filters?.subscription_status) {
        query = query.eq('subscription_status', filters.subscription_status);
      }

      if (filters?.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters?.created_before) {
        query = query.lte('created_at', filters.created_before);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant with subscription details
   */
  async getTenantWithSubscription(tenantId: string) {
    try {
      const tenant = await this.getTenantById(tenantId);
      if (!tenant) return null;

      const subscription =
        await subscriptionService.getTenantSubscriptionWithPlan(tenantId);

      return {
        ...tenant,
        subscription,
      };
    } catch (error) {
      console.error('Error fetching tenant with subscription:', error);
      throw error;
    }
  }

  /**
   * Create a new tenant
   */
  async createTenant(request: CreateTenantRequest): Promise<Tenant> {
    try {
      // 1. Create tenant
      const { data: tenant, error: tenantError } = await this.supabase
        .from('tenants')
        .insert([
          {
            company_name: request.company_name,
            domain: request.domain,
            subscription_plan: request.subscription_plan || 'starter',
            subscription_status: request.subscription_status || 'trial',
            settings: request.settings || {},
          },
        ])
        .select()
        .single();

      if (tenantError) throw tenantError;

      // 2. Create admin user
      const { data: authData, error: authError } =
        await this.supabase.auth.admin.createUser({
          email: request.admin_user.email,
          password: request.admin_user.password || this.generatePassword(),
          email_confirm: true,
          user_metadata: {
            full_name: request.admin_user.full_name,
            tenant_id: tenant.id,
            role: 'admin',
          },
        });

      if (authError) {
        // Rollback tenant creation
        await this.supabase.from('tenants').delete().eq('id', tenant.id);
        throw authError;
      }

      // 3. Create profile
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            tenant_id: tenant.id,
            email: request.admin_user.email,
            full_name: request.admin_user.full_name,
            role: 'admin',
          },
        ]);

      if (profileError) {
        // Rollback
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        await this.supabase.from('tenants').delete().eq('id', tenant.id);
        throw profileError;
      }

      // 4. Create subscription if plan_id provided
      if (request.plan_id) {
        await subscriptionService.createSubscription({
          tenant_id: tenant.id,
          plan_id: request.plan_id,
          billing_cycle: request.billing_cycle || 'monthly',
          billing_email: request.admin_user.email,
          is_trial: request.is_trial !== false,
          trial_days: 14,
        });
      }

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Update a tenant
   */
  async updateTenant(
    tenantId: string,
    request: UpdateTenantRequest
  ): Promise<Tenant> {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .update(request)
        .eq('id', tenantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(tenantId: string): Promise<void> {
    try {
      // This will cascade delete all related data due to foreign key constraints
      const { error } = await this.supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  // ==========================================================================
  // TENANT STATUS
  // ==========================================================================

  /**
   * Suspend a tenant
   */
  async suspendTenant(tenantId: string, reason?: string): Promise<Tenant> {
    try {
      // Update tenant status
      const tenant = await this.updateTenant(tenantId, {
        subscription_status: 'suspended',
      });

      // Update subscription status
      const subscription =
        await subscriptionService.getTenantSubscription(tenantId);
      if (subscription) {
        await subscriptionService.updateSubscription(subscription.id, {
          status: 'suspended',
          admin_notes: reason || 'Suspended by admin',
        });
      }

      return tenant;
    } catch (error) {
      console.error('Error suspending tenant:', error);
      throw error;
    }
  }

  /**
   * Activate a tenant
   */
  async activateTenant(tenantId: string): Promise<Tenant> {
    try {
      // Update tenant status
      const tenant = await this.updateTenant(tenantId, {
        subscription_status: 'active',
      });

      // Update subscription status
      const subscription =
        await subscriptionService.getTenantSubscription(tenantId);
      if (subscription) {
        await subscriptionService.updateSubscription(subscription.id, {
          status: 'active',
          admin_notes: 'Reactivated by admin',
        });
      }

      return tenant;
    } catch (error) {
      console.error('Error activating tenant:', error);
      throw error;
    }
  }

  // ==========================================================================
  // TENANT ANALYTICS
  // ==========================================================================

  /**
   * Get tenant statistics
   */
  async getTenantStats(tenantId: string): Promise<TenantStats> {
    try {
      // Get users count
      const { count: usersCount } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get products count
      const { count: productsCount } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get orders count
      const { count: ordersCount } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get total revenue
      const { data: transactions } = await this.supabase
        .from('billing_transactions')
        .select('total_amount')
        .eq('tenant_id', tenantId)
        .eq('status', 'completed');

      const totalRevenue =
        transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;

      // Get API calls today
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await this.supabase
        .from('tenant_usage')
        .select('metric_value')
        .eq('tenant_id', tenantId)
        .eq('metric_name', 'api_calls')
        .eq('recorded_at', today)
        .single();

      const apiCallsToday = usageData?.metric_value || 0;

      // Get storage used
      const { data: storageData } = await this.supabase
        .from('usage_quotas')
        .select('current_usage')
        .eq('tenant_id', tenantId)
        .eq('metric_name', 'storage_used_bytes')
        .single();

      const storageUsedBytes = storageData?.current_usage || 0;
      const storageUsedGb = storageUsedBytes / (1024 * 1024 * 1024);

      // Get last activity
      const { data: lastActivity } = await this.supabase
        .from('usage_events')
        .select('created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        total_users: usersCount || 0,
        total_products: productsCount || 0,
        total_orders: ordersCount || 0,
        total_revenue: Math.round(totalRevenue * 100) / 100,
        api_calls_today: apiCallsToday,
        storage_used_gb: Math.round(storageUsedGb * 100) / 100,
        last_activity: lastActivity?.created_at || null,
      };
    } catch (error) {
      console.error('Error getting tenant stats:', error);
      throw error;
    }
  }

  /**
   * Get tenant usage for a period
   */
  async getTenantUsage(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_usage')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tenant usage:', error);
      throw error;
    }
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  /**
   * Bulk update tenants
   */
  async bulkUpdateTenants(
    tenantIds: string[],
    updates: Partial<Tenant>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('tenants')
        .update(updates)
        .in('id', tenantIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk updating tenants:', error);
      throw error;
    }
  }

  /**
   * Export tenants to CSV
   */
  async exportTenantsToCSV(): Promise<string> {
    try {
      const tenants = await this.getAllTenants();

      // Create CSV header
      const headers = [
        'ID',
        'Company Name',
        'Domain',
        'Subscription Plan',
        'Status',
        'Created At',
      ];

      // Create CSV rows
      const rows = tenants.map((tenant) => [
        tenant.id,
        tenant.company_name,
        tenant.domain || '',
        tenant.subscription_plan,
        tenant.subscription_status,
        tenant.created_at,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting tenants to CSV:', error);
      throw error;
    }
  }

  // ==========================================================================
  // SYSTEM STATS
  // ==========================================================================

  /**
   * Get system-wide statistics
   */
  async getSystemStats() {
    try {
      // Total tenants
      const { count: totalTenants } = await this.supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });

      // Active tenants
      const { count: activeTenants } = await this.supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      // Trial tenants
      const { count: trialTenants } = await this.supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'trial');

      // Total users
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get MRR
      const mrr = await subscriptionService.getSubscriptionStats();

      return {
        total_tenants: totalTenants || 0,
        active_tenants: activeTenants || 0,
        trial_tenants: trialTenants || 0,
        total_users: totalUsers || 0,
        mrr: mrr.mrr,
        arr: mrr.arr,
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  /**
   * Generate a random password
   */
  private generatePassword(length = 12): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

// Export singleton instance
export const tenantManagementService = new TenantManagementService();

