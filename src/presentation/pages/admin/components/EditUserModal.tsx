import { useState, useEffect } from 'react';
import { supabase } from '../../../../infrastructure/database/supabase/client';
import { TenantService } from '../../../../infrastructure/database/supabase/tenant.service';
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

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'tenant_user' as 'tenant_admin' | 'tenant_user',
    tenantId: '',
  });

  // Load tenants and populate form when user changes
  useEffect(() => {
    const loadTenants = async () => {
      try {
        setLoadingTenants(true);
        const tenantList = await TenantService.getAllTenants();
        setTenants(tenantList);
      } catch (error) {
        console.error('Error loading tenants:', error);
        toast.error('Şirketler yüklenirken hata oluştu');
      } finally {
        setLoadingTenants(false);
      }
    };

    if (isOpen) {
      loadTenants();
    }
  }, [isOpen]);

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        role: (user.role as 'tenant_admin' | 'tenant_user') || 'tenant_user',
        tenantId: user.tenant_id || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      console.log('Updating user:', user.id, formData);

      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName,
          role: formData.role,
          tenant_id: formData.tenantId,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Kullanıcı başarıyla güncellendi');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('User update error:', error);
      toast.error('Kullanıcı güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-white'>Kullanıcı Düzenle</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-xl'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Full Name */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Ad Soyad
            </label>
            <input
              type='text'
              required
              value={formData.fullName}
              onChange={e =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='Ad Soyad'
            />
          </div>

          {/* Email */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              E-posta
            </label>
            <input
              type='email'
              required
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='E-posta'
            />
          </div>

          {/* Role */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Rol
            </label>
            <select
              value={formData.role}
              onChange={e =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'tenant_admin' | 'tenant_user',
                })
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
            >
              <option value='tenant_user'>Kullanıcı</option>
              <option value='tenant_admin'>Yönetici</option>
            </select>
          </div>

          {/* Company */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Şirket
            </label>
            <select
              value={formData.tenantId}
              onChange={e =>
                setFormData({ ...formData, tenantId: e.target.value })
              }
              required
              disabled={loadingTenants}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors disabled:opacity-50'
            >
              <option value=''>
                {loadingTenants ? 'Yükleniyor...' : 'Şirket seçin'}
              </option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-3 rounded-xl transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                  Güncelleniyor...
                </div>
              ) : (
                'Güncelle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
