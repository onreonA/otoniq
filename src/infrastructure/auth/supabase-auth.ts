/**
 * Supabase Authentication Methods
 *
 * Tüm authentication işlemleri için wrapper functions.
 * Supabase Auth API'yi kullanır.
 */

import { supabase } from '../database/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { LoginTrackingService } from '../services/LoginTrackingService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName?: string;
  tenantId?: string; // Tenant user için gerekli
}

export interface AuthResponse<T = User> {
  data: T | null;
  error: AuthError | Error | null;
}

/**
 * Login with email and password
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }

    if (!data.session) {
      return {
        data: null,
        error: new Error('No session returned'),
      };
    }

    // Session başarılı, user bilgisini kontrol et
    const userExists = await checkUserInDatabase(data.user.id);
    if (!userExists) {
      console.error('User not found in database');
      return {
        data: null,
        error: new Error(
          'Kullanıcı bulunamadı. Lütfen yöneticinizle iletişime geçin.'
        ),
      };
    }

    // Son giriş tarihini güncelle
    if (data.user) {
      await LoginTrackingService.updateLastLogin(data.user.id);
    }

    console.log('✅ Login successful:', data.user.email);
    return { data: data.session, error: null };
  } catch (error) {
    console.error('Login exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Login failed'),
    };
  }
}

/**
 * Signup (Register) new user
 */
export async function signup(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.fullName,
        },
      },
    });

    if (authError) {
      console.error('Signup auth error:', authError);
      return { data: null, error: authError };
    }

    if (!authData.user) {
      return {
        data: null,
        error: new Error('User creation failed'),
      };
    }

    // 2. Skip database operations temporarily (RLS issue)
    console.log(
      '✅ Auth user created, skipping database operations due to RLS'
    );
    console.log('📝 User:', authData.user.email);
    console.log('📝 Company:', credentials.company);

    // TODO: Fix RLS policies and enable database operations

    console.log('✅ Signup successful:', authData.user.email);
    return { data: authData.user, error: null };
  } catch (error) {
    console.error('Signup exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Signup failed'),
    };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return { data: null, error };
    }

    console.log('✅ Logout successful');
    return { data: null, error: null };
  } catch (error) {
    console.error('Logout exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Logout failed'),
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Get session exception:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Get user exception:', error);
    return null;
  }
}

/**
 * Refresh session
 */
export async function refreshSession(): Promise<AuthResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Refresh session error:', error);
      return { data: null, error };
    }

    if (!data.session) {
      return {
        data: null,
        error: new Error('No session returned'),
      };
    }

    // Son giriş tarihini güncelle
    if (data.session.user) {
      await LoginTrackingService.updateLastLogin(data.session.user.id);
    }

    return { data: data.session, error: null };
  } catch (error) {
    console.error('Refresh session exception:', error);
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Session refresh failed'),
    };
  }
}

/**
 * Reset password - Send reset email
 */
export async function sendPasswordResetEmail(
  email: string
): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return { data: null, error };
    }

    console.log('✅ Password reset email sent');
    return { data: null, error: null };
  } catch (error) {
    console.error('Password reset exception:', error);
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Password reset failed'),
    };
  }
}

/**
 * Update password (when user is logged in)
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResponse<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Update password error:', error);
      return { data: null, error };
    }

    if (!data.user) {
      return {
        data: null,
        error: new Error('User update failed'),
      };
    }

    console.log('✅ Password updated');
    return { data: data.user, error: null };
  } catch (error) {
    console.error('Update password exception:', error);
    return {
      data: null,
      error:
        error instanceof Error ? error : new Error('Password update failed'),
    };
  }
}

/**
 * Sign in with OAuth provider (Google, Microsoft, etc.)
 */
export async function signInWithOAuth(
  provider: 'google' | 'azure' | 'github'
): Promise<AuthResponse<void>> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('OAuth sign in error:', error);
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('OAuth sign in exception:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('OAuth sign in failed'),
    };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (session: Session | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Check if user exists in database
 */
async function checkUserInDatabase(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Check user error:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Check user exception:', error);
    return false;
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        *,
        tenant:tenants(*)
      `
      )
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get user profile error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get user profile exception:', error);
    return null;
  }
}
