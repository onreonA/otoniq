import { supabase } from './client';

export interface Tenant {
  id: string;
  company_name: string;
  domain?: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'suspended' | 'cancelled' | 'trial';
  n8n_webhook_url?: string;
  odoo_api_config?: any;
  shopify_store_config?: any;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantData {
  company_name: string;
  domain?: string;
  subscription_plan?: 'starter' | 'professional' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  n8n_webhook_url?: string;
  odoo_api_config?: any;
  shopify_store_config?: any;
  settings?: any;
}

export interface UpdateTenantData {
  company_name?: string;
  domain?: string;
  subscription_plan?: 'starter' | 'professional' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled' | 'trial';
  n8n_webhook_url?: string;
  odoo_api_config?: any;
  shopify_store_config?: any;
  settings?: any;
}

export class TenantService {
  /**
   * Tüm tenant'ları listele
   */
  static async getAllTenants(): Promise<Tenant[]> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all tenants error:', error);
      throw error;
    }
  }

  /**
   * Tenant detayını getir
   */
  static async getTenantById(id: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get tenant by id error:', error);
      throw error;
    }
  }

  /**
   * Yeni tenant oluştur
   */
  static async createTenant(tenantData: CreateTenantData): Promise<Tenant> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([tenantData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create tenant error:', error);
      throw error;
    }
  }

  /**
   * Tenant güncelle
   */
  static async updateTenant(
    id: string,
    tenantData: UpdateTenantData
  ): Promise<Tenant> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ ...tenantData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update tenant error:', error);
      throw error;
    }
  }

  /**
   * Tenant sil
   */
  static async deleteTenant(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete tenant error:', error);
      throw error;
    }
  }

  /**
   * Tenant durumunu değiştir
   */
  static async updateTenantStatus(
    id: string,
    status: 'active' | 'suspended' | 'cancelled' | 'trial'
  ): Promise<Tenant> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update tenant status error:', error);
      throw error;
    }
  }

  /**
   * Tenant'a ait kullanıcıları getir
   */
  static async getTenantUsers(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get tenant users error:', error);
      throw error;
    }
  }

  /**
   * Tenant'a ait ürünleri getir
   */
  static async getTenantProducts(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get tenant products error:', error);
      throw error;
    }
  }

  /**
   * Tenant istatistiklerini getir
   */
  static async getTenantStats(tenantId: string) {
    try {
      const [usersResult, productsResult] = await Promise.all([
        this.getTenantUsers(tenantId),
        this.getTenantProducts(tenantId),
      ]);

      return {
        totalUsers: usersResult.length,
        activeUsers: usersResult.filter(user => user.role !== 'suspended')
          .length,
        totalProducts: productsResult.length,
        activeProducts: productsResult.filter(
          product => product.status === 'active'
        ).length,
      };
    } catch (error) {
      console.error('Get tenant stats error:', error);
      throw error;
    }
  }

  /**
   * Real-time tenant updates için subscription
   */
  static subscribeToTenantUpdates(callback: (tenant: Tenant) => void) {
    const subscription = supabase
      .channel('tenant-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        payload => {
          callback(payload.new as Tenant);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
}
