import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TenantService } from '../../../../infrastructure/database/supabase/tenant.service';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'tenant_user' as 'tenant_admin' | 'tenant_user',
    tenantId: '',
  });

  // Load tenants on component mount
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

    loadTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating user:', formData);

      // Create user using TenantService
      const userResult = await TenantService.createTenantUser(
        formData.tenantId,
        {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
        }
      );

      if (userResult.success) {
        toast.success('Kullanıcı başarıyla oluşturuldu');
        onSuccess();
      } else {
        toast.error(`Kullanıcı oluşturulamadı: ${userResult.error}`);
      }
    } catch (error) {
      console.error('User creation error:', error);
      toast.error('Kullanıcı oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-white'>
            Yeni Kullanıcı Oluştur
          </h3>
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
              placeholder='ornek@email.com'
            />
          </div>

          {/* Password */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Şifre
            </label>
            <input
              type='password'
              required
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='Şifre'
              minLength={6}
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

          {/* Tenant Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Şirket
            </label>
            <select
              value={formData.tenantId}
              onChange={e =>
                setFormData({ ...formData, tenantId: e.target.value })
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
              required
              disabled={loadingTenants}
            >
              <option value=''>
                {loadingTenants ? 'Şirketler yükleniyor...' : 'Şirket seçin'}
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
              disabled={loading || loadingTenants}
              className='flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2'></div>
                  Oluşturuluyor...
                </div>
              ) : (
                'Kullanıcı Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
