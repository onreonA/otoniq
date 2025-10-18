/**
 * TwoFactorAuthService
 * Handles Two-Factor Authentication (2FA) operations
 */

import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
// @ts-expect-error - qrcode types are not needed for our use case
import QRCode from 'qrcode';
import type { User } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  isBackupCode: boolean;
}

export class TwoFactorAuthService {
  /**
   * Generate a new TOTP secret for a user
   */
  static generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code URL for TOTP setup
   */
  static async generateQRCode(
    secret: string,
    userEmail: string,
    appName: string = 'Otoniq.ai'
  ): Promise<string> {
    const otpauth = authenticator.keyuri(userEmail, appName, secret);
    return await QRCode.toDataURL(otpauth);
  }

  /**
   * Setup 2FA for a user
   */
  static async setupTwoFactor(user: User): Promise<TwoFactorSetup> {
    try {
      const secret = this.generateSecret();
      const qrCodeUrl = await this.generateQRCode(secret, user.email!);

      // Call Supabase function to enable 2FA
      const { data, error } = await supabase.rpc('enable_two_factor', {
        user_id: user.id,
        secret: secret,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase RPC enable_two_factor error:', error);
        }
        // Return mock backup codes if RPC fails (for development)
        if (import.meta.env.DEV) {
          const mockBackupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
          );
          return {
            secret,
            qrCodeUrl,
            backupCodes: mockBackupCodes,
          };
        }
        throw new Error(`Failed to enable 2FA: ${error.message}`);
      }

      return {
        secret,
        qrCodeUrl,
        backupCodes: data || [],
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error setting up 2FA:', error);
      }
      throw error;
    }
  }

  /**
   * Verify TOTP code
   */
  static verifyTOTPCode(secret: string, token: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying TOTP code:', error);
      }
      return false;
    }
  }

  /**
   * Verify 2FA during login
   */
  static async verifyTwoFactor(
    userId: string,
    code: string
  ): Promise<TwoFactorVerification> {
    try {
      // First, try to verify as TOTP code
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('two_factor_secret, two_factor_backup_codes')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        return { isValid: false, isBackupCode: false };
      }

      // Check if it's a backup code
      const isBackupCode = userData.two_factor_backup_codes?.includes(code);

      if (isBackupCode) {
        // Remove used backup code
        const updatedBackupCodes = userData.two_factor_backup_codes.filter(
          (backupCode: string) => backupCode !== code
        );

        await supabase
          .from('profiles')
          .update({ two_factor_backup_codes: updatedBackupCodes })
          .eq('id', userId);

        return { isValid: true, isBackupCode: true };
      }

      // Verify as TOTP code
      const isValid = this.verifyTOTPCode(userData.two_factor_secret, code);

      if (isValid) {
        // Update last verified timestamp
        await supabase
          .from('profiles')
          .update({ two_factor_verified_at: new Date().toISOString() })
          .eq('id', userId);
      }

      return { isValid, isBackupCode: false };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying 2FA:', error);
      }
      return { isValid: false, isBackupCode: false };
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isTwoFactorEnabled(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', userId)
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking 2FA status:', error);
        }
        return false;
      }

      return data?.two_factor_enabled || false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking 2FA status:', error);
      }
      return false;
    }
  }

  /**
   * Disable 2FA for a user
   */
  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('disable_two_factor', {
        user_id: userId,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase RPC disable_two_factor error:', error);
        }
        // Silently fail in production, return true in development
        return import.meta.env.DEV;
      }

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error disabling 2FA:', error);
      }
      return false;
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('generate_backup_codes');

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase RPC generate_backup_codes error:', error);
          // Return mock backup codes in development
          const mockBackupCodes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
          );
          return mockBackupCodes;
        }
        throw new Error(`Failed to generate backup codes: ${error.message}`);
      }

      // Update user's backup codes
      await supabase
        .from('profiles')
        .update({ two_factor_backup_codes: data })
        .eq('id', userId);

      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error generating backup codes:', error);
      }
      throw error;
    }
  }

  /**
   * Get user's 2FA status
   */
  static async getTwoFactorStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'two_factor_enabled, two_factor_verified_at, two_factor_backup_codes'
        )
        .eq('id', userId)
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase profiles select error:', error);
          // Return mock status in development
          return {
            enabled: false,
            verifiedAt: null,
            backupCodesCount: 0,
          };
        }
        throw new Error(`Failed to get 2FA status: ${error.message}`);
      }

      return {
        enabled: data?.two_factor_enabled || false,
        verifiedAt: data?.two_factor_verified_at,
        backupCodesCount: data?.two_factor_backup_codes?.length || 0,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting 2FA status:', error);
      }
      throw error;
    }
  }
}
