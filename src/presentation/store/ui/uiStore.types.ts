/**
 * UI Store Types
 * Manages global UI state (sidebar, modals, etc.)
 */

export interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string; // Lucide icon name
  path?: string;
  badge?: string | number;
  children?: MenuItem[];
  roles?: ('super_admin' | 'tenant_admin' | 'tenant_user')[];
}

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
  roles?: ('super_admin' | 'tenant_admin' | 'tenant_user')[];
}
