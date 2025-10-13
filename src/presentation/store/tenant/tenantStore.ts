/**
 * Tenant Store (Zustand)
 *
 * Multi-tenant state management.
 * Super admin için tenant switching desteği.
 */

import { create } from 'zustand';
import { supabase } from '../../../infrastructure/database/supabase/client';

export interface Tenant {
  id: string;
  company_name: string;
  domain: string | null;
  subscription_plan: string;
  subscription_status: string;
  settings: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

interface TenantState {
  // State
  currentTenant: Tenant | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentTenant: (tenant: Tenant | null) => void;
  setIsSuperAdmin: (isSuperAdmin: boolean) => void;
  loadCurrentTenant: (tenantId: string) => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  // Initial state
  currentTenant: null,
  isSuperAdmin: false,
  isLoading: false,
  error: null,

  // Set current tenant
  setCurrentTenant: tenant => set({ currentTenant: tenant }),

  // Set super admin flag
  setIsSuperAdmin: isSuperAdmin => set({ isSuperAdmin }),

  // Load tenant data
  loadCurrentTenant: async (tenantId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) {
        console.error('Load tenant error:', error);
        set({
          error: 'Tenant yüklenemedi',
          isLoading: false,
        });
        return;
      }

      set({
        currentTenant: data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Load tenant exception:', error);
      set({
        error: 'Beklenmeyen bir hata oluştu',
        isLoading: false,
      });
    }
  },

  // Switch tenant (Super admin only)
  switchTenant: async (tenantId: string) => {
    const { isSuperAdmin } = get();

    if (!isSuperAdmin) {
      console.warn('Only super admin can switch tenants');
      return;
    }

    await get().loadCurrentTenant(tenantId);
  },

  // Clear tenant
  clearTenant: () =>
    set({
      currentTenant: null,
      isSuperAdmin: false,
      error: null,
    }),
}));

// Selector for tenant ID
export const selectTenantId = (state: TenantState) => state.currentTenant?.id;
export const selectTenantName = (state: TenantState) =>
  state.currentTenant?.company_name;
export const selectIsSuperAdmin = (state: TenantState) => state.isSuperAdmin;
