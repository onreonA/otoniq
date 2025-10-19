import { supabase, getSupabaseAdminClient } from './client';
import { env } from '../../../shared/config/env';

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
      // Ensure subscription_plan has a default value
      const dataToInsert = {
        ...tenantData,
        subscription_plan: tenantData.subscription_plan || 'starter',
        subscription_status: tenantData.subscription_status || 'trial',
      };

      console.log('Creating tenant with data:', dataToInsert);

      const { data, error } = await supabase
        .from('tenants')
        .insert([dataToInsert])
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
   * Tenant için kullanıcı oluştur
   */
  static async createTenantUser(
    tenantId: string,
    userData: {
      email: string;
      password: string;
      fullName: string;
      role?: 'tenant_admin' | 'tenant_user';
    }
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Check if service key is available
      if (!env.supabase.serviceKey) {
        console.warn('⚠️ Service key not configured. User creation skipped.');
        console.warn('📝 Manual steps required:');
        console.warn('1. Go to Supabase Dashboard > Authentication > Users');
        console.warn('2. Click "Add User"');
        console.warn(`3. Email: ${userData.email}`);
        console.warn(`4. Password: ${userData.password}`);
        console.warn('5. Check "Email Confirmed"');
        console.warn('6. Click "Create User"');
        console.warn('7. Copy the UUID and run the migration');

        return {
          success: false,
          error:
            'Service key not configured. Please create user manually in Supabase Dashboard.',
        };
      }

      // Debug service key
      console.log(
        '🔑 Service key found:',
        env.supabase.serviceKey ? '✅ Yes' : '❌ No'
      );
      console.log(
        '🔑 Service key length:',
        env.supabase.serviceKey?.length || 0
      );
      console.log(
        '🔑 Service key starts with:',
        env.supabase.serviceKey?.substring(0, 20) + '...'
      );

      // Use admin client for user creation
      const adminClient = getSupabaseAdminClient();
      console.log('🔧 Admin client created successfully');

      // 1. Create auth user using Supabase Admin API
      console.log('🚀 Attempting to create user:', userData.email);
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.fullName,
          },
        });

      if (authError) {
        console.error('❌ Create auth user error:', authError);
        console.error('❌ Error details:', {
          message: authError.message,
          status: authError.status,
          statusText: authError.statusText,
        });
        return {
          success: false,
          error: `Auth API Error: ${authError.message}`,
        };
      }

      if (!authData.user) {
        return { success: false, error: 'User creation failed' };
      }

      // 2. Create user profile in public.users using admin client
      const { data: profileData, error: profileError } = await adminClient
        .from('users')
        .insert([
          {
            id: authData.user.id,
            tenant_id: tenantId,
            email: userData.email,
            role: userData.role || 'tenant_user',
            full_name: userData.fullName,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Create user profile error:', profileError);
        // Clean up auth user if profile creation fails
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return { success: false, error: profileError.message };
      }

      console.log('✅ Tenant user created successfully:', userData.email);
      return { success: true, userId: authData.user.id };
    } catch (error) {
      console.error('Create tenant user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
