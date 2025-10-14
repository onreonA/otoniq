/**
 * UI Store
 * Manages global UI state using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState } from './uiStore.types';

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      // Initial state
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      // Actions
      toggleSidebar: () =>
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),

      toggleMobileSidebar: () =>
        set(state => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),

      setMobileSidebarOpen: open => set({ sidebarMobileOpen: open }),
    }),
    {
      name: 'otoniq-ui-storage',
      partialize: state => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
