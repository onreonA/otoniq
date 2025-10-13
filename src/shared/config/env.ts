/**
 * Environment Configuration
 *
 * Tüm environment variables buradan erişilir.
 * Type-safe environment access sağlar.
 */

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceKey?: string;
  };
  n8n: {
    webhookBaseUrl: string;
  };
  app: {
    env: 'development' | 'production' | 'test';
    name: string;
    url: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

function getEnvVar(key: string, required = true): string {
  const value = import.meta.env[key];

  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }

  return value || '';
}

export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    serviceKey: getEnvVar('VITE_SUPABASE_SERVICE_KEY', false), // Optional - only for server-side
  },
  n8n: {
    webhookBaseUrl: getEnvVar('VITE_N8N_WEBHOOK_BASE_URL', false),
  },
  app: {
    env: (getEnvVar('VITE_APP_ENV', false) || 'development') as
      | 'development'
      | 'production'
      | 'test',
    name: getEnvVar('VITE_APP_NAME', false) || 'Otoniq.ai',
    url: getEnvVar('VITE_APP_URL', false) || 'http://localhost:5173',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};

// Environment validation on load
export function validateEnv(): void {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.error(
      '❌ Missing required environment variables:\n' +
        missing.map(key => `  - ${key}`).join('\n') +
        '\n\nLütfen .env.local dosyasını oluşturun ve gerekli değişkenleri ekleyin.' +
        '\nÖrnek için .env.example dosyasına bakın.'
    );

    if (env.isProduction) {
      throw new Error('Missing required environment variables');
    }
  }
}

// Development mode'da environment bilgilerini log'la
if (env.isDevelopment) {
  console.log('🔧 Environment:', env.app.env);
  console.log(
    '🌐 Supabase URL:',
    env.supabase.url ? '✅ Configured' : '❌ Missing'
  );
  console.log(
    '🔑 Supabase Key:',
    env.supabase.anonKey ? '✅ Configured' : '❌ Missing'
  );
}
