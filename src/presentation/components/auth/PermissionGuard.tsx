/**
 * Permission Guard Component
 * Renders children only if user has required permissions or roles
 */

import { ReactNode } from 'react';
import { usePermissionStore, UserRole } from '../../store/auth/permissionStore';

interface PermissionGuardProps {
  /**
   * Required permissions (user must have at least one)
   */
  permissions?: string[];

  /**
   * Required roles (user must have at least one)
   */
  roles?: UserRole[];

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Content to render if user doesn't have permission
   */
  fallback?: ReactNode;
}

/**
 * Permission Guard Component
 */
export function PermissionGuard({
  permissions = [],
  roles = [],
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermissionStore();

  // Check if user has any of the required permissions
  const hasRequiredPermission =
    permissions.length === 0 ||
    permissions.some(permission => hasPermission(permission));

  // Check if user has any of the required roles
  const hasRequiredRole = roles.length === 0 || hasRole(roles);

  // User must have both permission and role (if specified)
  const hasAccess = hasRequiredPermission && hasRequiredRole;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
