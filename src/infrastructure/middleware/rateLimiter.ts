/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse with configurable rate limits
 */

import React from 'react';
import {
  RateLimitService,
  RateLimitResult,
} from '../services/RateLimitService';
import { toast } from 'react-hot-toast';

export interface RateLimitOptions {
  endpoint: string;
  identifierType?: 'user' | 'ip' | 'api_key';
  onRateLimitExceeded?: (result: RateLimitResult) => void;
}

/**
 * Rate limit decorator for async functions
 */
export function withRateLimit(options: RateLimitOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        // Get identifier based on type
        const identifier = await getIdentifier(
          options.identifierType || 'user'
        );

        if (!identifier) {
          // If no identifier available, skip rate limiting
          return await originalMethod.apply(this, args);
        }

        // Check rate limit
        const rateLimitResult = await RateLimitService.checkRateLimit(
          identifier,
          options.identifierType || 'user',
          options.endpoint
        );

        if (!rateLimitResult.isAllowed) {
          // Rate limit exceeded
          const errorMessage = RateLimitService.formatRateLimitError(
            rateLimitResult.resetAt
          );

          if (options.onRateLimitExceeded) {
            options.onRateLimitExceeded(rateLimitResult);
          } else {
            toast.error(errorMessage);
          }

          throw new Error(errorMessage);
        }

        // Execute original method
        return await originalMethod.apply(this, args);
      } catch (error) {
        console.error('Rate limit middleware error:', error);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Rate limit hook for React components
 */
export async function checkRateLimit(
  endpoint: string,
  identifierType: 'user' | 'ip' | 'api_key' = 'user'
): Promise<RateLimitResult> {
  const identifier = await getIdentifier(identifierType);

  if (!identifier) {
    // If no identifier available, allow request
    return {
      isAllowed: true,
      remainingRequests: 100,
      resetAt: new Date().toISOString(),
    };
  }

  return await RateLimitService.checkRateLimit(
    identifier,
    identifierType,
    endpoint
  );
}

/**
 * Rate limit guard for API calls
 */
export async function rateLimitGuard(
  endpoint: string,
  identifierType: 'user' | 'ip' | 'api_key' = 'user'
): Promise<void> {
  const result = await checkRateLimit(endpoint, identifierType);

  if (!result.isAllowed) {
    const errorMessage = RateLimitService.formatRateLimitError(result.resetAt);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Get identifier based on type
 */
async function getIdentifier(
  type: 'user' | 'ip' | 'api_key'
): Promise<string | null> {
  switch (type) {
    case 'user':
      return getUserId();
    case 'ip':
      return getIPAddress();
    case 'api_key':
      return getAPIKey();
    default:
      return null;
  }
}

/**
 * Get current user ID
 */
function getUserId(): string | null {
  try {
    // Get user ID from Supabase session
    const sessionStr = localStorage.getItem('supabase.auth.token');
    if (!sessionStr) return null;

    const session = JSON.parse(sessionStr);
    return session?.currentSession?.user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Get client IP address
 */
async function getIPAddress(): Promise<string | null> {
  try {
    // In production, this would come from the server
    // For now, use a placeholder
    return 'client-ip';
  } catch (error) {
    console.error('Error getting IP address:', error);
    return null;
  }
}

/**
 * Get API key from headers
 */
function getAPIKey(): string | null {
  try {
    // Get API key from localStorage or session storage
    return localStorage.getItem('api_key') || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

/**
 * Rate limit component wrapper
 */
export function RateLimitWrapper({
  endpoint,
  children,
  fallback,
}: {
  endpoint: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [isAllowed, setIsAllowed] = React.useState(true);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    checkRateLimit(endpoint)
      .then(result => {
        setIsAllowed(result.isAllowed);
        setIsChecking(false);
      })
      .catch(() => {
        setIsAllowed(false);
        setIsChecking(false);
      });
  }, [endpoint]);

  if (isChecking) {
    return null;
  }

  if (!isAllowed && fallback) {
    return fallback as React.ReactElement;
  }

  return isAllowed ? (children as React.ReactElement) : null;
}
