import { useState, useEffect } from 'react';
import {
  TenantService,
  Tenant,
} from '../../../../infrastructure/database/supabase/tenant.service';
import toast from 'react-hot-toast';

interface ViewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

export default function ViewTenantModal({
  isOpen,
  onClose,
  tenantId,
}: ViewTenantModalProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tenantId) {
      loadTenant();
    }
  }, [isOpen, tenantId]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const data = await TenantService.getTenantById(tenantId);
      setTenant(data);
    } catch (error) {
      console.error('Tenant yükleme hatası:', error);
      toast.error('Müşteri bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-white/10'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold text-white'>Müşteri Detayları</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-close-line text-2xl'></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
          ) : tenant ? (
            <div className='space-y-6'>
              {/* Şirket Bilgileri */}
              <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Şirket Bilgileri
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Şirket Adı
                    </label>
                    <span className='text-white'>{tenant.company_name}</span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Domain
                    </label>
                    <span className='text-white'>{tenant.domain || 'N/A'}</span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Abonelik Planı
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getPlanColor(tenant.subscription_plan)}`}
                    >
                      {getPlanText(tenant.subscription_plan)}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Abonelik Durumu
                    </label>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(tenant.subscription_status)}`}
                    >
                      {getStatusText(tenant.subscription_status)}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Kayıt Tarihi
                    </label>
                    <span className='text-white'>
                      {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Son Güncelleme
                    </label>
                    <span className='text-white'>
                      {new Date(tenant.updated_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  İletişim Bilgileri
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      E-posta
                    </label>
                    <span className='text-white'>
                      {tenant.contact_email || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Telefon
                    </label>
                    <span className='text-white'>
                      {tenant.contact_phone || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Adres
                    </label>
                    <span className='text-white'>
                      {tenant.address || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-300 mb-1'>
                      Şehir
                    </label>
                    <span className='text-white'>{tenant.city || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Kullanım İstatistikleri */}
              <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Kullanım İstatistikleri
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-400'>
                      {tenant.user_count || 0}
                    </div>
                    <div className='text-sm text-gray-400'>
                      Kullanıcı Sayısı
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-400'>
                      {tenant.active_users || 0}
                    </div>
                    <div className='text-sm text-gray-400'>Aktif Kullanıcı</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-400'>
                      {tenant.total_orders || 0}
                    </div>
                    <div className='text-sm text-gray-400'>Toplam Sipariş</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='text-gray-400'>Müşteri bulunamadı</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-white/10 flex justify-end'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors'
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getPlanColor(plan: string) {
  switch (plan) {
    case 'enterprise':
      return 'bg-orange-500/20 text-orange-400';
    case 'professional':
      return 'bg-purple-500/20 text-purple-400';
    case 'starter':
      return 'bg-blue-500/20 text-blue-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function getPlanText(plan: string) {
  switch (plan) {
    case 'enterprise':
      return 'Enterprise';
    case 'professional':
      return 'Professional';
    case 'starter':
      return 'Starter';
    default:
      return 'Bilinmiyor';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400';
    case 'inactive':
      return 'bg-red-500/20 text-red-400';
    case 'suspended':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Pasif';
    case 'suspended':
      return 'Askıya Alınmış';
    default:
      return 'Bilinmiyor';
  }
}
