import { supabase } from '../database/supabase/client';

export class LoginTrackingService {
  /**
   * Kullanıcının son giriş tarihini günceller
   */
  static async updateLastLogin(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('update_user_last_login', {
        user_id: userId,
      });

      if (error) {
        console.error('Update last login error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update last login exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kullanıcının durumunu hesaplar (aktif/pasif)
   */
  static async getUserStatus(
    userId: string
  ): Promise<{ status: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('get_user_status', {
        user_id: userId,
      });

      if (error) {
        console.error('Get user status error:', error);
        return { status: 'inactive', error: error.message };
      }

      return { status: data || 'inactive' };
    } catch (error: any) {
      console.error('Get user status exception:', error);
      return { status: 'inactive', error: error.message };
    }
  }

  /**
   * Kullanıcı durumu istatistiklerini getirir
   */
  static async getUserStatusStats(): Promise<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    never_logged_in: number;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_status_stats');

      if (error) {
        console.error('Get user status stats error:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error: any) {
      console.error('Get user status stats exception:', error);
      return null;
    }
  }

  /**
   * Manuel olarak kullanıcının son giriş tarihini ayarlar (test için)
   */
  static async setUserLastLogin(
    userId: string,
    loginDate?: Date
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('set_user_last_login', {
        user_id: userId,
        login_date: loginDate?.toISOString() || null,
      });

      if (error) {
        console.error('Set user last login error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Set user last login exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kullanıcı durumu view'ından veri getirir
   */
  static async getUsersWithStatus(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_status_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get users with status error:', error);
        return [];
      }

      return data || [];
    } catch (error: any) {
      console.error('Get users with status exception:', error);
      return [];
    }
  }
}
