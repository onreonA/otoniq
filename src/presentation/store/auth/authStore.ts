/**
 * Authentication Store (Zustand)
 *
 * Global auth state management.
 * Handles login, logout, session management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, UserProfile } from './authStore.types';
import * as authService from '../../../infrastructure/auth/supabase-auth';
import { supabase } from '../../../infrastructure/database/supabase/client';
import { usePermissionStore } from './permissionStore';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userProfile: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const { data: session, error } = await authService.login({
            email,
            password,
          });

          if (error || !session) {
            const errorMessage = error?.message || 'Giriş başarısız';
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
            });
            return false;
          }

          // Load user profile first
          const profile = await authService.getUserProfile(session.user.id);

          // Set session, user and profile together
          set({
            session,
            user: session.user,
            userProfile: profile as UserProfile,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set permissions based on user role
          if (profile?.role) {
            usePermissionStore.getState().setRole(profile.role);
          }

          // Role-based yönlendirme
          if (profile?.role === 'super_admin') {
            setTimeout(() => {
              window.location.href = '/admin';
            }, 100);
          } else if (profile?.role === 'tenant_admin') {
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          }

          return true;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('❌ Login error:', error);
          }
          set({
            error: 'Beklenmeyen bir hata oluştu',
            isLoading: false,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // Signup action
      signup: async (
        email: string,
        password: string,
        fullName?: string,
        tenantId?: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const { error } = await authService.signup({
            email,
            password,
            fullName,
            tenantId,
          });

          if (error) {
            set({
              error: error.message || 'Kayıt başarısız',
              isLoading: false,
            });
            return false;
          }

          set({
            isLoading: false,
            error: null,
          });

          // Email confirmation gerekebilir
          return true;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Signup error:', error);
          }
          set({
            error: 'Beklenmeyen bir hata oluştu',
            isLoading: false,
          });
          return false;
        }
      },

      // Logout action
      logout: async (): Promise<void> => {
        set({ isLoading: true });

        try {
          await authService.logout();

          // Clear state
          set({
            user: null,
            userProfile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Clear permissions
          usePermissionStore.getState().setRole(null);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Logout error:', error);
          }
          // Clear state anyway
          set({
            user: null,
            userProfile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // Clear permissions anyway
          usePermissionStore.getState().setRole(null);
        }
      },

      // Refresh session
      refreshSession: async (): Promise<void> => {
        try {
          const { data: session, error } = await authService.refreshSession();

          if (error || !session) {
            if (import.meta.env.DEV) {
              console.error('Session refresh failed:', error);
            }
            get().logout();
            return;
          }

          set({
            session,
            user: session.user,
            isAuthenticated: true,
          });

          // Reload user profile
          await get().loadUserProfile();
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Session refresh exception:', error);
          }
          get().logout();
        }
      },

      // Load user profile from database
      loadUserProfile: async (): Promise<void> => {
        const { user } = get();
        if (!user) {
          return;
        }

        try {
          const profile = await authService.getUserProfile(user.id);

          if (profile) {
            set({ userProfile: profile as UserProfile });

            // Set permissions based on user role
            if (profile.role) {
              usePermissionStore.getState().setRole(profile.role);
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('❌ Load user profile error:', error);
          }
        }
      },

      // Setters
      setUser: user => set({ user, isAuthenticated: !!user }),
      setSession: session => set({ session, isAuthenticated: !!session }),
      setError: error => set({ error }),
      clearError: () => set({ error: null }),

      // Reset store
      reset: () =>
        set({
          user: null,
          userProfile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'otoniq-auth-storage', // localStorage key
      partialize: state => ({
        // Only persist these fields
        user: state.user,
        userProfile: state.userProfile,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state listener
let authListenerInitialized = false;

export function initializeAuthListener() {
  if (authListenerInitialized) return;

  authService.onAuthStateChange(session => {
    const store = useAuthStore.getState();

    if (session) {
      store.setSession(session);
      store.setUser(session.user);
      store.loadUserProfile();
    } else {
      store.reset();
    }
  });

  authListenerInitialized = true;
  if (import.meta.env.DEV) {
    console.log('✅ Auth listener initialized');
  }
}

// Selectors (for better performance)
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectUserProfile = (state: AuthState) => state.userProfile;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectIsSuperAdmin = (state: AuthState) =>
  state.userProfile?.role === 'super_admin';
export const selectTenantId = (state: AuthState) =>
  state.userProfile?.tenant_id;
