import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface CacheEntry {
  id: string;
  cacheKey: string;
  cacheValue: any;
  cacheType: string;
  ttlSeconds: number;
  expiresAt: string;
  hitCount: number;
}

export interface PerformanceMetrics {
  cacheHitRate: number;
  avgResponseTime: number;
  totalCacheSize: number;
  activeCacheEntries: number;
  expiredCacheEntries: number;
}

export class PerformanceService {
  private static memoryCache = new Map<
    string,
    { value: any; expiresAt: number; hitCount: number }
  >();

  /**
   * Get from cache (memory first, then database)
   */
  static async getFromCache<T>(
    key: string,
    tenantId: string
  ): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        memoryEntry.hitCount++;
        return memoryEntry.value;
      }

      // Check database cache
      const { data, error } = await supabase
        .from('performance_cache')
        .select('cache_value, expires_at')
        .eq('cache_key', key)
        .eq('tenant_id', tenantId)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) return null;

      // Update hit count
      await supabase.rpc('update_cache_hit', { p_cache_key: key });

      // Store in memory for faster access
      this.memoryCache.set(key, {
        value: data.cache_value,
        expiresAt: new Date(data.expires_at).getTime(),
        hitCount: 1,
      });

      return data.cache_value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache (both memory and database)
   */
  static async setCache(
    key: string,
    value: any,
    tenantId: string,
    ttlSeconds: number = 3600,
    cacheType: string = 'query_result'
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      // Store in memory cache
      this.memoryCache.set(key, {
        value,
        expiresAt: expiresAt.getTime(),
        hitCount: 0,
      });

      // Store in database cache
      await supabase.from('performance_cache').upsert(
        {
          cache_key: key,
          cache_value: value,
          cache_type: cacheType,
          tenant_id: tenantId,
          ttl_seconds: ttlSeconds,
          expires_at: expiresAt.toISOString(),
          cache_size_bytes: JSON.stringify(value).length,
        },
        { onConflict: 'cache_key' }
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Clear cache by pattern
   */
  static async clearCache(pattern: string, tenantId: string): Promise<number> {
    try {
      // Clear from memory
      let memoryCleared = 0;
      for (const [key] of this.memoryCache.entries()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
          memoryCleared++;
        }
      }

      // Clear from database
      const { data, error } = await supabase
        .from('performance_cache')
        .delete()
        .eq('tenant_id', tenantId)
        .like('cache_key', `%${pattern}%`)
        .select('id');

      if (error) throw error;

      return memoryCleared + (data?.length || 0);
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }

  /**
   * Clean expired cache entries
   */
  static async cleanExpiredCache(): Promise<number> {
    try {
      // Clean memory cache
      let memoryCleared = 0;
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.expiresAt < now) {
          this.memoryCache.delete(key);
          memoryCleared++;
        }
      }

      // Clean database cache
      const { data, error } = await supabase.rpc('clean_expired_cache');
      if (error) throw error;

      return memoryCleared + (data || 0);
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStatistics(
    tenantId: string
  ): Promise<PerformanceMetrics> {
    try {
      const { data, error } = await supabase
        .from('performance_cache')
        .select('cache_size_bytes, hit_count, expires_at')
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const entries = data || [];
      const now = new Date();
      const activeEntries = entries.filter(e => new Date(e.expires_at) > now);
      const expiredEntries = entries.filter(e => new Date(e.expires_at) <= now);

      const totalHits = entries.reduce((sum, e) => sum + (e.hit_count || 0), 0);
      const totalRequests = totalHits + entries.length; // Approximate
      const cacheHitRate =
        totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

      const totalSize = entries.reduce(
        (sum, e) => sum + (e.cache_size_bytes || 0),
        0
      );

      return {
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        avgResponseTime: 50, // Placeholder
        totalCacheSize: totalSize,
        activeCacheEntries: activeEntries.length,
        expiredCacheEntries: expiredEntries.length,
      };
    } catch (error) {
      console.error('Error getting cache statistics:', error);
      return {
        cacheHitRate: 0,
        avgResponseTime: 0,
        totalCacheSize: 0,
        activeCacheEntries: 0,
        expiredCacheEntries: 0,
      };
    }
  }

  /**
   * Cached query wrapper
   */
  static async cachedQuery<T>(
    key: string,
    tenantId: string,
    queryFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.getFromCache<T>(key, tenantId);
    if (cached !== null) {
      return cached;
    }

    // Execute query
    const result = await queryFn();

    // Cache the result
    await this.setCache(key, result, tenantId, ttlSeconds);

    return result;
  }

  /**
   * Preload critical data
   */
  static async preloadCriticalData(tenantId: string): Promise<void> {
    try {
      // Preload dashboard data
      await this.cachedQuery(
        `dashboard_stats_${tenantId}`,
        tenantId,
        async () => {
          const { data } = await supabase.rpc('get_dashboard_stats', {
            p_tenant_id: tenantId,
          });
          return data;
        },
        300 // 5 minutes
      );

      // Preload products summary
      await this.cachedQuery(
        `products_summary_${tenantId}`,
        tenantId,
        async () => {
          const { data } = await supabase
            .from('products')
            .select('id, name, price, images')
            .eq('tenant_id', tenantId)
            .limit(100);
          return data;
        },
        600 // 10 minutes
      );

      // Preload recent orders
      await this.cachedQuery(
        `recent_orders_${tenantId}`,
        tenantId,
        async () => {
          const { data } = await supabase
            .from('orders')
            .select('id, order_number, total, status, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(50);
          return data;
        },
        300 // 5 minutes
      );

      console.log('✅ Critical data preloaded');
    } catch (error) {
      console.error('Error preloading data:', error);
    }
  }

  /**
   * Check API rate limit
   */
  static async checkAPIRateLimit(
    tenantId: string,
    apiProvider: string,
    apiEndpoint: string,
    rateLimitType: 'per_minute' | 'per_hour' | 'per_day' = 'per_minute'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_api_rate_limit', {
        p_tenant_id: tenantId,
        p_api_provider: apiProvider,
        p_api_endpoint: apiEndpoint,
        p_rate_limit_type: rateLimitType,
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail safe - deny request
    }
  }

  /**
   * Setup API rate limits for provider
   */
  static async setupAPIRateLimits(
    tenantId: string,
    apiProvider: string,
    limits: Array<{
      endpoint: string;
      type: 'per_minute' | 'per_hour' | 'per_day';
      maxRequests: number;
    }>
  ): Promise<void> {
    try {
      const records = limits.map(limit => ({
        tenant_id: tenantId,
        api_provider: apiProvider,
        api_endpoint: limit.endpoint,
        rate_limit_type: limit.type,
        max_requests: limit.maxRequests,
        current_requests: 0,
        reset_time: new Date(
          Date.now() +
            (limit.type === 'per_minute'
              ? 60000
              : limit.type === 'per_hour'
                ? 3600000
                : 86400000)
        ).toISOString(),
      }));

      await supabase.from('api_rate_limits').upsert(records, {
        onConflict: 'tenant_id,api_provider,api_endpoint,rate_limit_type',
      });
    } catch (error) {
      console.error('Error setting up API rate limits:', error);
    }
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryCacheStats(): {
    totalEntries: number;
    memoryUsageKB: number;
    hitRate: number;
  } {
    const entries = Array.from(this.memoryCache.values());
    const totalEntries = entries.length;

    // Estimate memory usage
    const memoryUsageKB = Math.round(
      JSON.stringify(Array.from(this.memoryCache.entries())).length / 1024
    );

    // Calculate hit rate
    const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
    const hitRate = totalEntries > 0 ? totalHits / totalEntries : 0;

    return {
      totalEntries,
      memoryUsageKB,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  /**
   * Clear all cache
   */
  static async clearAllCache(tenantId: string): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear database cache
    await supabase.from('performance_cache').delete().eq('tenant_id', tenantId);

    console.log('✅ All cache cleared');
  }
}
