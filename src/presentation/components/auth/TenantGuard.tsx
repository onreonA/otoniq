/**
 * Tenant Guard Component
 *
 * Sadece tenant'a ait kullanıcıların erişimine izin verir.
 * Super admin her tenant'a erişebilir.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Suspense } from 'react';

interface TenantGuardProps {
  children?: React.ReactNode;
  requiredRole?: 'tenant_admin' | 'tenant_user';
}

export function TenantGuard({ children, requiredRole }: TenantGuardProps) {
  const {
    isAuthenticated,
    isSuperAdmin,
    isTenantAdmin,
    hasActiveTenant,
    isLoading,
  } = useAuth();

  // Show loading
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white text-lg'>Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Super admin can access everything
  if (isSuperAdmin) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {children || <Outlet />}
      </Suspense>
    );
  }

  // Check if user has active tenant
  if (!hasActiveTenant) {
    return <Navigate to='/no-tenant' replace />;
  }

  // Check required role
  if (requiredRole === 'tenant_admin' && !isTenantAdmin) {
    return <Navigate to='/dashboard' replace />;
  }

  // Render children or outlet
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
        </div>
      }
    >
      {children || <Outlet />}
    </Suspense>
  );
}
