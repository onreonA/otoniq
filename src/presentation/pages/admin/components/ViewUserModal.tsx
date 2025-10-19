import { useState, useEffect } from 'react';
import { supabase } from '../../../../infrastructure/database/supabase/client';
import toast from 'react-hot-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  tenant_id: string;
  created_at: string;
  last_sign_in_at?: string;
  tenant?: {
    company_name: string;
    subscription_plan: string;
    subscription_status: string;
  };
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function ViewUserModal({
  isOpen,
  onClose,
  user,
}: ViewUserModalProps) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load detailed user information
  useEffect(() => {
    const loadUserDetails = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select(
            `
            *,
            tenant:tenants(
              company_name,
              subscription_plan,
              subscription_status,
              created_at
            )
          `
          )
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserDetails(data);
      } catch (error) {
        console.error('Error loading user details:', error);
        toast.error('Kullanıcı detayları yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && user) {
      loadUserDetails();
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastLoginText = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Hiç giriş yapmadı';

    const now = new Date();
    const lastLogin = new Date(lastSignIn);
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) {
      return `${diffMonths} ay önce`;
    } else if (diffWeeks > 0) {
      return `${diffWeeks} hafta önce`;
    } else if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} dakika önce`;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'tenant_admin':
        return 'Yönetici';
      case 'tenant_user':
        return 'Kullanıcı';
      case 'super_admin':
        return 'Süper Admin';
      default:
        return role;
    }
  };

  const getStatusText = (user: User) => {
    if (user.last_sign_in_at) {
      // Son giriş 30 gün içindeyse aktif
      const lastSignIn = new Date(user.last_sign_in_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (lastSignIn > thirtyDaysAgo) {
        return 'Aktif';
      } else {
        return 'Pasif';
      }
    }
    return 'Pasif';
  };

  const getStatusColor = (user: User) => {
    if (user.last_sign_in_at) {
      // Son giriş 30 gün içindeyse aktif
      const lastSignIn = new Date(user.last_sign_in_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (lastSignIn > thirtyDaysAgo) {
        return 'bg-green-500/20 text-green-400';
      } else {
        return 'bg-orange-500/20 text-orange-400';
      }
    }
    return 'bg-orange-500/20 text-orange-400';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400';
      case 'professional':
        return 'bg-blue-500/20 text-blue-400';
      case 'starter':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlanText = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Professional';
      case 'starter':
        return 'Starter';
      default:
        return plan;
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-white'>Kullanıcı Detayları</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-xl'></i>
          </button>
        </div>

        {loading ? (
          <div className='flex items-center justify-center h-32'>
            <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : userDetails ? (
          <div className='space-y-6'>
            {/* User Info */}
            <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
              <div className='flex items-center space-x-4 mb-4'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl'>
                  {userDetails.full_name?.charAt(0) ||
                    userDetails.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className='text-xl font-semibold text-white'>
                    {userDetails.full_name || 'İsimsiz'}
                  </h4>
                  <p className='text-gray-400'>{userDetails.email}</p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Rol
                  </label>
                  <span className='text-white'>
                    {getRoleText(userDetails.role)}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Durum
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(userDetails)}`}
                  >
                    {getStatusText(userDetails)}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Kayıt Tarihi
                  </label>
                  <span className='text-white'>
                    {formatDate(userDetails.created_at)}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Son Giriş
                  </label>
                  <span className='text-white'>
                    {userDetails.last_sign_in_at
                      ? getLastLoginText(userDetails.last_sign_in_at)
                      : 'Hiç giriş yapmadı'}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Info */}
            {userDetails.tenant && (
              <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h5 className='text-lg font-semibold text-white mb-4'>
                  Şirket Bilgileri
                </h5>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Şirket Adı
                    </label>
                    <span className='text-white'>
                      {userDetails.company_name || 'Şirket bilgisi yok'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Şirket ID
                    </label>
                    <span className='text-white font-mono text-sm'>
                      {userDetails.company_id || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Abonelik Planı
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getPlanColor(userDetails.tenant.subscription_plan)}`}
                    >
                      {getPlanText(userDetails.tenant.subscription_plan)}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Abonelik Durumu
                    </label>
                    <span className='text-white'>
                      {userDetails.tenant.subscription_status}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Şirket Kayıt Tarihi
                    </label>
                    <span className='text-white'>
                      {formatDate(userDetails.tenant.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Stats */}
            <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
              <h5 className='text-lg font-semibold text-white mb-4'>
                Kullanım İstatistikleri
              </h5>
              <div className='space-y-3'>
                <div>
                  <div className='flex justify-between text-sm text-gray-300 mb-1'>
                    <span>Genel Kullanım</span>
                    <span>78%</span>
                  </div>
                  <div className='w-full bg-white/10 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full'
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm text-gray-300 mb-1'>
                    <span>API Kullanımı</span>
                    <span>45%</span>
                  </div>
                  <div className='w-full bg-white/10 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full'
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className='flex justify-between text-sm text-gray-300 mb-1'>
                    <span>Depolama</span>
                    <span>23%</span>
                  </div>
                  <div className='w-full bg-white/10 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full'
                      style={{ width: '23%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center text-gray-400'>
            Kullanıcı detayları yüklenemedi
          </div>
        )}

        {/* Close Button */}
        <div className='flex justify-end pt-6'>
          <button
            onClick={onClose}
            className='bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-3 rounded-xl transition-colors'
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
