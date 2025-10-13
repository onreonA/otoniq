/**
 * Supabase Client Configuration
 *
 * Tüm uygulamada kullanılacak tek bir Supabase client instance'ı.
 * Singleton pattern ile implement edilmiştir.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../../shared/config/env';
import type { Database } from './types';

// Supabase client instance (singleton)
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Supabase client'ı döndürür.
 * İlk çağrıda client oluşturulur, sonraki çağrılarda aynı instance döner.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.supabase.url,
      env.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage:
            typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-application': env.app.name,
          },
        },
      }
    );

    if (env.isDevelopment) {
      console.log('✅ Supabase client initialized');
    }
  }

  return supabaseInstance;
}

/**
 * Convenience export - default Supabase client
 */
export const supabase = getSupabaseClient();

/**
 * Admin client (service role key ile)
 * ⚠️ SADECE SERVER-SIDE kullanın! Client-side'da kullanmayın!
 *
 * Kullanım alanları:
 * - RLS bypass gereken admin işlemleri
 * - Batch operations
 * - Migration scripts
 */
export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!env.supabase.serviceKey) {
    throw new Error(
      'Service key is not configured. Admin client cannot be created.'
    );
  }

  return createClient<Database>(env.supabase.url, env.supabase.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Helper: Current user'ı al
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
}

/**
 * Helper: Session'ı al
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

/**
 * Helper: User ID'yi al (tenant filtreleme için kullanılır)
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Helper: Tenant ID'yi al (current user'ın tenant'ı)
 */
export async function getTenantId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // User metadata'sından veya users tablosundan tenant_id al
  const { data, error } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error getting tenant ID:', error);
    return null;
  }

  return data?.tenant_id || null;
}

/**
 * Helper: Super admin check
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) return false;

  return data?.role === 'super_admin';
}

/**
 * Type export for convenience
 */
export type { Database };
