/**
 * SessionService
 * Handles user session management with refresh tokens
 */

import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SessionInfo {
  id: string;
  sessionToken: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
}

export interface CreateSessionData {
  userId: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
}

export class SessionService {
  /**
   * Create a new user session
   */
  static async createSession(data: CreateSessionData): Promise<string> {
    try {
      const { data: sessionId, error } = await supabase.rpc(
        'create_user_session',
        {
          p_user_id: data.userId,
          p_session_token: data.sessionToken,
          p_refresh_token: data.refreshToken,
          p_expires_at: data.expiresAt,
          p_refresh_expires_at: data.refreshExpiresAt,
          p_ip_address: data.ipAddress,
          p_user_agent: data.userAgent,
          p_device_info: data.deviceInfo,
        }
      );

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Refresh a user session
   */
  static async refreshSession(
    refreshToken: string,
    newSessionToken: string,
    newRefreshToken: string,
    newExpiresAt: string,
    newRefreshExpiresAt: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('refresh_user_session', {
        p_refresh_token: refreshToken,
        p_new_session_token: newSessionToken,
        p_new_refresh_token: newRefreshToken,
        p_new_expires_at: newExpiresAt,
        p_new_refresh_expires_at: newRefreshExpiresAt,
      });

      if (error) {
        throw new Error(`Failed to refresh session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  /**
   * Invalidate a specific session
   */
  static async invalidateSession(sessionToken: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('invalidate_user_session', {
        p_session_token: sessionToken,
      });

      if (error) {
        throw new Error(`Failed to invalidate session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error invalidating session:', error);
      return false;
    }
  }

  /**
   * Invalidate all sessions for a user
   */
  static async invalidateAllUserSessions(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc(
        'invalidate_all_user_sessions',
        {
          p_user_id: userId,
        }
      );

      if (error) {
        throw new Error(`Failed to invalidate all sessions: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error invalidating all sessions:', error);
      return 0;
    }
  }

  /**
   * Get active sessions for a user
   */
  static async getUserActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_active_sessions', {
        p_user_id: userId,
      });

      if (error) {
        throw new Error(`Failed to get user sessions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_sessions');

      if (error) {
        throw new Error(`Failed to cleanup expired sessions: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get device information from user agent
   */
  static getDeviceInfo(userAgent: string): any {
    const deviceInfo: any = {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'Unknown',
    };

    // Browser detection
    if (userAgent.includes('Chrome')) {
      deviceInfo.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      deviceInfo.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      deviceInfo.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      deviceInfo.browser = 'Edge';
    }

    // OS detection
    if (userAgent.includes('Windows')) {
      deviceInfo.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      deviceInfo.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      deviceInfo.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      deviceInfo.os = 'Android';
    } else if (userAgent.includes('iOS')) {
      deviceInfo.os = 'iOS';
    }

    // Device detection
    if (userAgent.includes('Mobile')) {
      deviceInfo.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      deviceInfo.device = 'Tablet';
    } else {
      deviceInfo.device = 'Desktop';
    }

    return deviceInfo;
  }

  /**
   * Generate session tokens
   */
  static generateTokens(): { sessionToken: string; refreshToken: string } {
    const sessionToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();

    return { sessionToken, refreshToken };
  }

  /**
   * Calculate token expiration times
   */
  static calculateExpirationTimes(): {
    expiresAt: string;
    refreshExpiresAt: string;
  } {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return {
      expiresAt: expiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  /**
   * Check if session is valid
   */
  static async isSessionValid(sessionToken: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('id, expires_at, is_active')
        .eq('session_token', sessionToken)
        .single();

      if (error || !data) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);

      return data.is_active && expiresAt > now;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken);

      if (error) {
        throw new Error(`Failed to update session activity: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating session activity:', error);
      return false;
    }
  }
}
