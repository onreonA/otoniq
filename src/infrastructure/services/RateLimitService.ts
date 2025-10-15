/**
 * RateLimitService
 * Handles API rate limiting and request throttling
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface RateLimitResult {
  isAllowed: boolean;
  remainingRequests: number;
  resetAt: string;
}

export interface RateLimitConfig {
  limit: number;
  windowMinutes: number;
}

// Rate limit configurations for different user types and endpoints
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth.login': { limit: 5, windowMinutes: 15 }, // 5 login attempts per 15 minutes
  'auth.signup': { limit: 3, windowMinutes: 60 }, // 3 signups per hour
  'auth.password_reset': { limit: 3, windowMinutes: 60 }, // 3 password resets per hour

  // API endpoints - Regular users
  'api.read': { limit: 100, windowMinutes: 1 }, // 100 read requests per minute
  'api.write': { limit: 30, windowMinutes: 1 }, // 30 write requests per minute
  'api.bulk': { limit: 10, windowMinutes: 1 }, // 10 bulk operations per minute

  // API endpoints - Admin users
  'api.admin.read': { limit: 1000, windowMinutes: 1 }, // 1000 reads per minute
  'api.admin.write': { limit: 500, windowMinutes: 1 }, // 500 writes per minute

  // Integration endpoints
  'integration.sync': { limit: 10, windowMinutes: 5 }, // 10 syncs per 5 minutes
  'integration.webhook': { limit: 100, windowMinutes: 1 }, // 100 webhooks per minute

  // AI/Analysis endpoints
  'ai.analysis': { limit: 20, windowMinutes: 1 }, // 20 AI requests per minute
  'ai.generation': { limit: 10, windowMinutes: 1 }, // 10 generations per minute
};

export class RateLimitService {
  /**
   * Check if request is allowed based on rate limit
   */
  static async checkRateLimit(
    identifier: string,
    identifierType: 'user' | 'ip' | 'api_key',
    endpoint: string
  ): Promise<RateLimitResult> {
    try {
      // Get config for endpoint, fallback to default
      const config =
        RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['api.read'];

      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_identifier_type: identifierType,
        p_endpoint: endpoint,
        p_limit: config.limit,
        p_window_minutes: config.windowMinutes,
      });

      if (error) {
        console.error('Error checking rate limit:', error);
        // On error, allow request but log the issue
        return {
          isAllowed: true,
          remainingRequests: config.limit,
          resetAt: new Date(
            Date.now() + config.windowMinutes * 60 * 1000
          ).toISOString(),
        };
      }

      const result = data[0];
      return {
        isAllowed: result.is_allowed,
        remainingRequests: result.remaining_requests,
        resetAt: result.reset_at,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request on error
      return {
        isAllowed: true,
        remainingRequests: 0,
        resetAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Check rate limit for authenticated user
   */
  static async checkUserRateLimit(
    userId: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(userId, 'user', endpoint);
  }

  /**
   * Check rate limit for IP address
   */
  static async checkIPRateLimit(
    ipAddress: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(ipAddress, 'ip', endpoint);
  }

  /**
   * Check rate limit for API key
   */
  static async checkAPIKeyRateLimit(
    apiKey: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(apiKey, 'api_key', endpoint);
  }

  /**
   * Log API request for monitoring
   */
  static async logAPIRequest(
    userId: string | null,
    tenantId: string | null,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTimeMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await supabase.rpc('log_api_request', {
        p_user_id: userId,
        p_tenant_id: tenantId,
        p_endpoint: endpoint,
        p_method: method,
        p_ip_address: await this.getClientIP(),
        p_user_agent: navigator.userAgent,
        p_request_body: null,
        p_response_status: statusCode,
        p_response_time_ms: responseTimeMs,
        p_error_message: errorMessage,
      });
    } catch (error) {
      console.error('Failed to log API request:', error);
      // Don't throw - logging failure shouldn't break the request
    }
  }

  /**
   * Get rate limit statistics
   */
  static async getRateLimitStats(hours: number = 24) {
    try {
      const { data, error } = await supabase.rpc('get_rate_limit_stats', {
        p_hours: hours,
      });

      if (error) {
        throw new Error(`Failed to get rate limit stats: ${error.message}`);
      }

      return (
        data[0] || {
          totalRequests: 0,
          blockedRequests: 0,
          uniqueIdentifiers: 0,
          topEndpoints: [],
        }
      );
    } catch (error) {
      console.error('Error getting rate limit stats:', error);
      return {
        totalRequests: 0,
        blockedRequests: 0,
        uniqueIdentifiers: 0,
        topEndpoints: [],
      };
    }
  }

  /**
   * Clean up old rate limit records
   */
  static async cleanupOldRecords(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_rate_limit_records');

      if (error) {
        throw new Error(
          `Failed to cleanup rate limit records: ${error.message}`
        );
      }

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up rate limit records:', error);
      return 0;
    }
  }

  /**
   * Get client IP address (simplified)
   */
  private static async getClientIP(): Promise<string | undefined> {
    try {
      // In a real application, this would come from the server
      // For now, return undefined
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Format rate limit error message
   */
  static formatRateLimitError(resetAt: string): string {
    const resetDate = new Date(resetAt);
    const now = new Date();
    const secondsUntilReset = Math.ceil(
      (resetDate.getTime() - now.getTime()) / 1000
    );

    if (secondsUntilReset < 60) {
      return `Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`;
    } else {
      const minutes = Math.ceil(secondsUntilReset / 60);
      return `Rate limit exceeded. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    }
  }
}
