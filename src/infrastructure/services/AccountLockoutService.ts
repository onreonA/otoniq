/**
 * AccountLockoutService
 * Handles account lockout mechanism and failed login attempt tracking
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface LoginAttempt {
  id: string;
  userId?: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  attemptType: 'login' | 'password_reset' | '2fa_verification';
  success: boolean;
  failureReason?: string;
  createdAt: string;
}

export interface AccountLockout {
  id: string;
  userId?: string;
  email: string;
  ipAddress?: string;
  lockoutType: 'user' | 'ip' | 'email';
  lockoutReason: string;
  lockedAt: string;
  expiresAt: string;
  isActive: boolean;
  unlockedBy?: string;
  unlockedAt?: string;
  unlockReason?: string;
}

export interface LockoutStats {
  totalAttempts: number;
  failedAttempts: number;
  successfulAttempts: number;
  activeLockouts: number;
  uniqueEmails: number;
  uniqueIps: number;
}

export class AccountLockoutService {
  /**
   * Record a login attempt
   */
  static async recordLoginAttempt(
    email: string,
    success: boolean,
    attemptType: 'login' | 'password_reset' | '2fa_verification' = 'login',
    userId?: string,
    failureReason?: string
  ): Promise<string> {
    try {
      // Temporarily disable account lockout to fix login issues
      console.log('Account lockout temporarily disabled for debugging');
      return 'disabled';

      /* Original code - re-enable after fixing database functions
      const { data, error } = await supabase.rpc('record_login_attempt', {
        p_email: email,
        p_user_id: userId,
        p_ip_address: await this.getClientIP(),
        p_user_agent: navigator.userAgent,
        p_attempt_type: attemptType,
        p_success: success,
        p_failure_reason: failureReason,
      });

      if (error) {
        throw new Error(`Failed to record login attempt: ${error.message}`);
      }

      return data;
      */
    } catch (error) {
      console.error('Error recording login attempt:', error);
      throw error;
    }
  }

  /**
   * Check if account is locked
   */
  static async isAccountLocked(email: string): Promise<{
    isLocked: boolean;
    lockoutType?: string;
    lockedAt?: string;
    expiresAt?: string;
    lockoutReason?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('is_account_locked', {
        p_email: email,
        p_ip_address: await this.getClientIP(),
      });

      if (error) {
        throw new Error(`Failed to check account lockout: ${error.message}`);
      }

      if (data && data.length > 0) {
        const lockout = data[0];
        return {
          isLocked: true,
          lockoutType: lockout.lockout_type,
          lockedAt: lockout.locked_at,
          expiresAt: lockout.expires_at,
          lockoutReason: lockout.lockout_reason,
        };
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking account lockout:', error);
      return { isLocked: false };
    }
  }

  /**
   * Get failed attempts count for an email
   */
  static async getFailedAttemptsCount(
    email: string,
    minutes: number = 15
  ): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_failed_attempts_count', {
        p_email: email,
        p_minutes: minutes,
        p_ip_address: await this.getClientIP(),
      });

      if (error) {
        throw new Error(
          `Failed to get failed attempts count: ${error.message}`
        );
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting failed attempts count:', error);
      return 0;
    }
  }

  /**
   * Lock an account
   */
  static async lockAccount(
    userId: string,
    email: string,
    lockoutType: 'user' | 'ip' | 'email',
    lockoutReason: string,
    lockoutDurationMinutes: number = 15
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('lock_account', {
        p_email: email,
        p_lockout_type: lockoutType,
        p_lockout_reason: lockoutReason,
        p_user_id: userId,
        p_ip_address: await this.getClientIP(),
        p_lockout_duration_minutes: lockoutDurationMinutes,
      });

      if (error) {
        throw new Error(`Failed to lock account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error locking account:', error);
      throw error;
    }
  }

  /**
   * Unlock an account
   */
  static async unlockAccount(
    lockoutId: string,
    unlockedBy: string,
    unlockReason: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('unlock_account', {
        p_lockout_id: lockoutId,
        p_unlocked_by: unlockedBy,
        p_unlock_reason: unlockReason,
      });

      if (error) {
        throw new Error(`Failed to unlock account: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error unlocking account:', error);
      return false;
    }
  }

  /**
   * Get active lockouts for admin
   */
  static async getActiveLockouts(): Promise<AccountLockout[]> {
    try {
      const { data, error } = await supabase
        .from('account_lockouts')
        .select('*')
        .eq('is_active', true)
        .order('locked_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get active lockouts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active lockouts:', error);
      return [];
    }
  }

  /**
   * Get lockout statistics
   */
  static async getLockoutStats(hours: number = 24): Promise<LockoutStats> {
    try {
      const { data, error } = await supabase.rpc('get_lockout_stats', {
        p_hours: hours,
      });

      if (error) {
        throw new Error(`Failed to get lockout stats: ${error.message}`);
      }

      return (
        data?.[0] || {
          totalAttempts: 0,
          failedAttempts: 0,
          successfulAttempts: 0,
          activeLockouts: 0,
          uniqueEmails: 0,
          uniqueIps: 0,
        }
      );
    } catch (error) {
      console.error('Error getting lockout stats:', error);
      return {
        totalAttempts: 0,
        failedAttempts: 0,
        successfulAttempts: 0,
        activeLockouts: 0,
        uniqueEmails: 0,
        uniqueIps: 0,
      };
    }
  }

  /**
   * Clean up expired lockouts
   */
  static async cleanupExpiredLockouts(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_lockouts');

      if (error) {
        throw new Error(`Failed to cleanup expired lockouts: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired lockouts:', error);
      return 0;
    }
  }

  /**
   * Get login attempts for an email
   */
  static async getLoginAttempts(
    email: string,
    limit: number = 50
  ): Promise<LoginAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get login attempts: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return [];
    }
  }

  /**
   * Check if login should be blocked
   */
  static async shouldBlockLogin(email: string): Promise<{
    shouldBlock: boolean;
    reason?: string;
    remainingAttempts?: number;
  }> {
    try {
      // Check if account is locked
      const lockoutStatus = await this.isAccountLocked(email);
      if (lockoutStatus.isLocked) {
        return {
          shouldBlock: true,
          reason: `Account locked: ${lockoutStatus.lockoutReason}. Expires at: ${new Date(lockoutStatus.expiresAt!).toLocaleString()}`,
        };
      }

      // Check failed attempts count
      const failedCount = await this.getFailedAttemptsCount(email);
      const maxAttempts = 5;
      const remainingAttempts = maxAttempts - failedCount;

      if (failedCount >= maxAttempts) {
        return {
          shouldBlock: true,
          reason: 'Too many failed login attempts',
        };
      }

      return {
        shouldBlock: false,
        remainingAttempts: Math.max(0, remainingAttempts),
      };
    } catch (error) {
      console.error('Error checking if login should be blocked:', error);
      return { shouldBlock: false };
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // In a real application, you'd get this from the server
      // For now, we'll return undefined
      return undefined;
    } catch (error) {
      return undefined;
    }
  }
}
