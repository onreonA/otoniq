/**
 * useAuth Hook
 *
 * Authentication işlemleri için custom hook.
 * Auth store'u wrap eder ve kolay kullanım sağlar.
 */

import { useAuthStore, initializeAuthListener } from '../store/auth/authStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const {
    user,
    userProfile,
    session,
    isAuthenticated,
    isLoading,
    error,
    login: loginAction,
    signup: signupAction,
    logout: logoutAction,
    refreshSession,
    clearError,
  } = useAuthStore();

  const navigate = useNavigate();

  // Initialize auth listener on mount
  useEffect(() => {
    initializeAuthListener();
  }, []);

  // Login wrapper with toast notifications
  const login = async (
    email: string,
    password: string,
    redirectTo = '/dashboard'
  ) => {
    const success = await loginAction(email, password);

    if (success) {
      toast.success('Giriş başarılı! Hoş geldiniz.');
      // AuthStore'da yönlendirme yapılıyor
    } else {
      toast.error(
        error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
      );
    }

    return success;
  };

  // Signup wrapper with toast notifications
  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    tenantId?: string
  ) => {
    const success = await signupAction(email, password, fullName, tenantId);

    if (success) {
      toast.success('Kayıt başarılı! Lütfen email adresinizi doğrulayın.');
      navigate('/login');
    } else {
      toast.error(error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    }

    return success;
  };

  // Logout wrapper with toast notifications
  const logout = async (redirectTo = '/login') => {
    await logoutAction();
    toast.success('Çıkış yapıldı. Güle güle!');
    navigate(redirectTo);
  };

  // Computed values
  const isSuperAdmin = userProfile?.role === 'super_admin';
  const isTenantAdmin = userProfile?.role === 'tenant_admin';
  const isTenantUser = userProfile?.role === 'tenant_user';
  const tenantId = userProfile?.tenant_id;
  const hasActiveTenant = !!tenantId;

  return {
    // State
    user,
    userProfile,
    session,
    isAuthenticated,
    isLoading,
    error,

    // Computed
    isSuperAdmin,
    isTenantAdmin,
    isTenantUser,
    tenantId,
    hasActiveTenant,

    // Actions
    login,
    signup,
    logout,
    refreshSession,
    clearError,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Bu sayfayı görüntülemek için giriş yapmalısınız.');
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to require super admin role
 */
export function useRequireSuperAdmin(redirectTo = '/dashboard') {
  const { isSuperAdmin, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isSuperAdmin) {
      toast.error('Bu sayfaya erişim yetkiniz yok.');
      navigate(redirectTo);
    }
  }, [isSuperAdmin, isLoading, isAuthenticated, navigate, redirectTo]);

  return { isSuperAdmin, isLoading };
}

/**
 * Hook to require tenant admin or super admin role
 */
export function useRequireAdmin(redirectTo = '/dashboard') {
  const { isSuperAdmin, isTenantAdmin, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdmin = isSuperAdmin || isTenantAdmin;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast.error('Bu sayfaya erişim yetkiniz yok.');
      navigate(redirectTo);
    }
  }, [isAdmin, isLoading, isAuthenticated, navigate, redirectTo]);

  return { isAdmin, isLoading };
}
