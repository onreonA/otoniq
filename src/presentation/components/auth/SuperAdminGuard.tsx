/**
 * Super Admin Guard Component
 *
 * Sadece super admin kullanıcıların erişimine izin verir.
 * Diğer kullanıcıları dashboard'a yönlendirir.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Suspense } from 'react';

interface SuperAdminGuardProps {
  children?: React.ReactNode;
}

export function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const { isAuthenticated, isSuperAdmin, isLoading, userProfile } = useAuth();

  // Debug log
  console.log('🔍 SuperAdminGuard Debug:', {
    isAuthenticated,
    isSuperAdmin,
    isLoading,
    userProfile,
    role: userProfile?.role,
  });

  // Show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not super admin
  if (!isSuperAdmin) {
    console.log("❌ Super admin değil, dashboard'a yönlendiriliyor");
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Super admin erişimi onaylandı');

  // Render children or outlet
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      }
    >
      {children || <Outlet />}
    </Suspense>
  );
}
