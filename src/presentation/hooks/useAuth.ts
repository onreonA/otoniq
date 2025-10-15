/**
 * useAuth Hook
 *
 * Authentication işlemleri için custom hook.
 * Enhanced with session management and 2FA support.
 */

import { useAuthStore, initializeAuthListener } from '../store/auth/authStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthService } from '../../infrastructure/auth/AuthService';
import { SessionService } from '../../infrastructure/services/SessionService';

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
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

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

  // Session management functions
  const loadUserSessions = async () => {
    if (!isAuthenticated) return;

    setSessionsLoading(true);
    try {
      const sessions = await SessionService.getUserActiveSessions(
        user?.id || ''
      );
      setUserSessions(sessions);
    } catch (error) {
      console.error('Error loading user sessions:', error);
      toast.error('Oturumlar yüklenirken hata oluştu');
    } finally {
      setSessionsLoading(false);
    }
  };

  const invalidateSession = async (sessionId: string) => {
    try {
      const success = await SessionService.invalidateSession(sessionId);
      if (success) {
        toast.success('Oturum sonlandırıldı');
        await loadUserSessions();
      } else {
        toast.error('Oturum sonlandırılamadı');
      }
    } catch (error) {
      console.error('Error invalidating session:', error);
      toast.error('Oturum sonlandırılırken hata oluştu');
    }
  };

  const invalidateAllSessions = async () => {
    if (!user) return;

    try {
      const count = await SessionService.invalidateAllUserSessions(user.id);
      toast.success(`${count} oturum sonlandırıldı`);
      await loadUserSessions();
    } catch (error) {
      console.error('Error invalidating all sessions:', error);
      toast.error('Oturumlar sonlandırılırken hata oluştu');
    }
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

    // Session Management
    userSessions,
    sessionsLoading,
    loadUserSessions,
    invalidateSession,
    invalidateAllSessions,

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
