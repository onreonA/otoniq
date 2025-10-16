/**
 * useRateLimit Hook
 * React hook for rate limiting operations in components
 */

import { useState, useCallback } from 'react';
import { rateLimitGuard } from '../../infrastructure/middleware/rateLimiter';

export function useRateLimit(
  endpoint: string,
  identifierType: 'user' | 'ip' | 'api_key' = 'user'
) {
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkLimit = useCallback(async () => {
    try {
      await rateLimitGuard(endpoint, identifierType);
      setIsRateLimited(false);
      return true;
    } catch (error) {
      setIsRateLimited(true);
      return false;
    }
  }, [endpoint, identifierType]);

  return { isRateLimited, checkLimit };
}
