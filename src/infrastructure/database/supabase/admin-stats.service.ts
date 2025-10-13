import { supabase } from './client';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalProducts: number;
  totalOrders: number;
  dailyRevenue: number;
  systemLoad: number;
}

export class AdminStatsService {
  /**
   * Tüm admin istatistiklerini getir
   */
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // Paralel olarak tüm istatistikleri çek
      const [
        usersResult,
        tenantsResult,
        productsResult,
        ordersResult,
        systemLoadResult,
      ] = await Promise.all([
        this.getUserStats(),
        this.getTenantStats(),
        this.getProductStats(),
        this.getOrderStats(),
        this.getSystemLoad(),
      ]);

      return {
        totalUsers: usersResult.total,
        activeUsers: usersResult.active,
        totalTenants: tenantsResult.total,
        activeTenants: tenantsResult.active,
        totalProducts: productsResult.total,
        totalOrders: ordersResult.total,
        dailyRevenue: ordersResult.dailyRevenue,
        systemLoad: systemLoadResult.load,
      };
    } catch (error) {
      console.error('Admin stats error:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı istatistikleri
   */
  private static async getUserStats() {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, role, created_at');

    if (error) throw error;

    const total = users?.length || 0;
    const active = users?.filter(user => user.role !== 'suspended').length || 0;

    return { total, active };
  }

  /**
   * Tenant istatistikleri
   */
  private static async getTenantStats() {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, subscription_status, created_at');

    if (error) throw error;

    const total = tenants?.length || 0;
    const active =
      tenants?.filter(tenant => tenant.subscription_status === 'active')
        .length || 0;

    return { total, active };
  }

  /**
   * Ürün istatistikleri
   */
  private static async getProductStats() {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, status');

    if (error) throw error;

    const total = products?.length || 0;

    return { total };
  }

  /**
   * Sipariş istatistikleri
   */
  private static async getOrderStats() {
    // Toplam sipariş sayısı
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, created_at');

    if (error) throw error;

    const total = orders?.length || 0;

    // Günlük gelir hesapla
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyOrders =
      orders?.filter(order => new Date(order.created_at) >= today) || [];

    const dailyRevenue = dailyOrders.reduce(
      (sum, order) => sum + (order.total_amount || 0),
      0
    );

    return { total, dailyRevenue };
  }

  /**
   * Sistem yükü (simüle edilmiş)
   */
  private static async getSystemLoad() {
    // Gerçek sistem yükü için monitoring servisi gerekli
    // Şimdilik simüle edilmiş değer döndürüyoruz
    const load = Math.random() * 100; // 0-100 arası rastgele değer

    return { load: Math.round(load) };
  }

  /**
   * Real-time istatistik güncellemeleri için subscription
   */
  static subscribeToStatsUpdates(callback: (stats: AdminStats) => void) {
    // Users tablosu değişikliklerini dinle
    const usersSubscription = supabase
      .channel('admin-stats-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        async () => {
          const stats = await this.getAdminStats();
          callback(stats);
        }
      )
      .subscribe();

    // Tenants tablosu değişikliklerini dinle
    const tenantsSubscription = supabase
      .channel('admin-stats-tenants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        async () => {
          const stats = await this.getAdminStats();
          callback(stats);
        }
      )
      .subscribe();

    // Orders tablosu değişikliklerini dinle
    const ordersSubscription = supabase
      .channel('admin-stats-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const stats = await this.getAdminStats();
          callback(stats);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      usersSubscription.unsubscribe();
      tenantsSubscription.unsubscribe();
      ordersSubscription.unsubscribe();
    };
  }
}
