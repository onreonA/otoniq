/**
 * Sentry Configuration
 * Error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize Sentry in production
  if (import.meta.env.MODE !== 'production') {
    console.log('Sentry disabled in development mode');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,

    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration({
        // Set sample rate to 1.0 to capture 100% of transactions
        // Reduce in production if needed
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.supabase\.co/,
          /^https:\/\/.*\.vercel\.app/,
        ],
      }),
      Sentry.replayIntegration({
        // Session Replay for debugging
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || 'development',

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors
      'Network request failed',
      'NetworkError',
      // Supabase session errors (expected)
      'Invalid Refresh Token: Already Used',
    ],

    // Before sending events, you can modify or drop them
    beforeSend(event, hint) {
      // Filter out specific errors or modify events
      const error = hint.originalException;

      // Don't send errors from development
      if (window.location.hostname === 'localhost') {
        return null;
      }

      // Add user context if available
      const userStr = localStorage.getItem('supabase.auth.token');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          event.user = {
            id: userData?.currentSession?.user?.id,
            email: userData?.currentSession?.user?.email,
          };
        } catch (e) {
          // Ignore parsing errors
        }
      }

      return event;
    },
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (import.meta.env.MODE !== 'production') {
    console.error('Error captured:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  if (import.meta.env.MODE !== 'production') {
    console.log(`[${level}] ${message}`, context);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Wrap component with Sentry error boundary
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
