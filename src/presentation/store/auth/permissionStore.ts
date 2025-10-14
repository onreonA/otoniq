/**
 * Permission Store
 * Manages role-based permissions and access control
 */

import { create } from 'zustand';

export type UserRole = 'super_admin' | 'tenant_admin' | 'tenant_user';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface PermissionState {
  // State
  role: UserRole | null;
  permissions: Permission[];

  // Actions
  setRole: (role: UserRole | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permissionId: string) => boolean;
}

/**
 * Default permissions by role
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    {
      id: 'admin.access',
      name: 'Admin Access',
      description: 'Access admin panel',
    },
    {
      id: 'tenant.manage',
      name: 'Manage Tenants',
      description: 'Create, update, delete tenants',
    },
    {
      id: 'user.manage',
      name: 'Manage Users',
      description: 'Create, update, delete users',
    },
    {
      id: 'system.settings',
      name: 'System Settings',
      description: 'Manage system settings',
    },
    {
      id: 'analytics.view',
      name: 'View Analytics',
      description: 'View system analytics',
    },
    {
      id: 'product.manage',
      name: 'Manage Products',
      description: 'Create, update, delete products',
    },
    {
      id: 'order.manage',
      name: 'Manage Orders',
      description: 'Create, update, delete orders',
    },
    {
      id: 'customer.manage',
      name: 'Manage Customers',
      description: 'Create, update, delete customers',
    },
    {
      id: 'integration.manage',
      name: 'Manage Integrations',
      description: 'Configure integrations',
    },
  ],
  tenant_admin: [
    {
      id: 'dashboard.access',
      name: 'Dashboard Access',
      description: 'Access dashboard',
    },
    {
      id: 'product.manage',
      name: 'Manage Products',
      description: 'Create, update, delete products',
    },
    {
      id: 'order.manage',
      name: 'Manage Orders',
      description: 'Create, update, delete orders',
    },
    {
      id: 'customer.manage',
      name: 'Manage Customers',
      description: 'Create, update, delete customers',
    },
    {
      id: 'integration.manage',
      name: 'Manage Integrations',
      description: 'Configure integrations',
    },
    {
      id: 'user.manage.tenant',
      name: 'Manage Tenant Users',
      description: 'Manage users within tenant',
    },
    {
      id: 'settings.tenant',
      name: 'Tenant Settings',
      description: 'Manage tenant settings',
    },
    {
      id: 'analytics.tenant',
      name: 'Tenant Analytics',
      description: 'View tenant analytics',
    },
  ],
  tenant_user: [
    {
      id: 'dashboard.access',
      name: 'Dashboard Access',
      description: 'Access dashboard',
    },
    { id: 'product.view', name: 'View Products', description: 'View products' },
    { id: 'order.view', name: 'View Orders', description: 'View orders' },
    {
      id: 'customer.view',
      name: 'View Customers',
      description: 'View customers',
    },
    {
      id: 'profile.manage',
      name: 'Manage Profile',
      description: 'Manage own profile',
    },
  ],
};

export const usePermissionStore = create<PermissionState>()((set, get) => ({
  // Initial state
  role: null,
  permissions: [],

  // Actions
  setRole: (role: UserRole | null) => {
    set({ role });

    // Set default permissions for role
    if (role) {
      set({ permissions: rolePermissions[role] });
    } else {
      set({ permissions: [] });
    }
  },

  setPermissions: (permissions: Permission[]) => {
    set({ permissions });
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const currentRole = get().role;
    if (!currentRole) return false;

    if (Array.isArray(roles)) {
      return roles.includes(currentRole);
    }

    return roles === currentRole;
  },

  hasPermission: (permissionId: string) => {
    return get().permissions.some(p => p.id === permissionId);
  },
}));
