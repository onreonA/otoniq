import { useState, useEffect } from 'react';
import {
  TenantService,
  Tenant,
  CreateTenantData,
  UpdateTenantData,
} from '../../../../infrastructure/database/supabase/tenant.service';
import { OdooCompanyService } from '../../../../infrastructure/services/OdooCompanyService';
import { OdooService } from '../../../../infrastructure/services/OdooService';
import toast from 'react-hot-toast';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTenant?: Tenant | null;
}

export default function TenantModal({
  isOpen,
  onClose,
  onSuccess,
  editingTenant,
}: TenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTenantData>({
    company_name: '',
    domain: '',
    subscription_plan: 'starter',
    subscription_status: 'active',
    n8n_webhook_url: '',
    odoo_api_config: {},
    odoo_company_id: undefined,
    odoo_company_name: '',
    odoo_connection_status: 'not_configured',
    shopify_store_config: {},
    settings: {},
  });

  // User creation form
  const [createUser, setCreateUser] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'tenant_admin' as 'tenant_admin' | 'tenant_user',
  });

  // Odoo configuration
  const [odooConfig, setOdooConfig] = useState({
    url: '',
    port: 8069,
    db: '',
    username: 'omer@nsl.com.tr',
    password: 'OdoO_001!?*',
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');

  // Form reset
  useEffect(() => {
    if (isOpen) {
      if (editingTenant) {
        setFormData({
          company_name: editingTenant.company_name,
          domain: editingTenant.domain || '',
          subscription_plan: editingTenant.subscription_plan,
          subscription_status: editingTenant.subscription_status,
          n8n_webhook_url: editingTenant.n8n_webhook_url || '',
          odoo_api_config: editingTenant.odoo_api_config || {},
          shopify_store_config: editingTenant.shopify_store_config || {},
          settings: editingTenant.settings || {},
        });
        setCreateUser(false); // Don't create user when editing
      } else {
        setFormData({
          company_name: '',
          domain: '',
          subscription_plan: 'starter',
          subscription_status: 'active',
          n8n_webhook_url: '',
          odoo_api_config: {},
          shopify_store_config: {},
          settings: {},
        });
        setCreateUser(true); // Default to creating user for new tenants
        setUserData({
          email: '',
          password: '',
          fullName: '',
          role: 'tenant_admin',
        });
      }
    }
  }, [isOpen, editingTenant]);

  // Form submit
  // Odoo connection test handler
  const handleTestOdooConnection = async () => {
    if (!odooConfig.url || !odooConfig.db) {
      toast.error('Lütfen Odoo URL ve Database bilgilerini girin');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('testing');

    try {
      const odooService = new OdooService({
        url: odooConfig.url,
        port: odooConfig.port,
        db: odooConfig.db,
        username: odooConfig.username,
        password: odooConfig.password,
        company_id: formData.odoo_company_id,
      });

      const result = await odooService.testConnection();

      if (result.success) {
        setConnectionStatus('success');
        toast.success('Odoo bağlantısı başarılı!');

        // Update form data with Odoo config
        setFormData({
          ...formData,
          odoo_api_config: {
            url: odooConfig.url,
            port: odooConfig.port,
            db: odooConfig.db,
            username: odooConfig.username,
            password: odooConfig.password,
          },
          odoo_connection_status: 'connected',
        });
      } else {
        setConnectionStatus('error');
        toast.error(`Odoo bağlantısı başarısız: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Odoo connection test error:', error);
      toast.error('Odoo bağlantı testi sırasında hata oluştu');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let tenantId: string;

      if (editingTenant) {
        // Update existing tenant
        await TenantService.updateTenant(editingTenant.id, formData);
        tenantId = editingTenant.id;
        toast.success('Müşteri başarıyla güncellendi');
      } else {
        // Create new tenant
        console.log('Creating tenant with data:', formData);
        const newTenant = await TenantService.createTenant(formData);
        tenantId = newTenant.id;
        toast.success('Müşteri başarıyla oluşturuldu');

        // Create user if requested
        if (
          createUser &&
          userData.email &&
          userData.password &&
          userData.fullName
        ) {
          console.log('Creating user for tenant:', tenantId, userData);
          const userResult = await TenantService.createTenantUser(
            tenantId,
            userData
          );

          if (userResult.success) {
            toast.success('Kullanıcı da başarıyla oluşturuldu');
          } else {
            toast.warning(
              `Kullanıcı otomatik oluşturulamadı: ${userResult.error}`
            );
            toast.info(
              "Kullanıcıyı manuel olarak Supabase Dashboard'dan oluşturun"
            );

            // Show detailed manual steps
            setTimeout(() => {
              toast.info(
                `Manuel Adımlar: 1) Supabase Dashboard > Authentication > Users 2) Add User 3) Email: ${userData.email} 4) Password: ${userData.password} 5) Email Confirmed: ✓`,
                { duration: 10000 }
              );
            }, 2000);
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Tenant save error:', error);
      toast.error('Müşteri kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-xl font-bold text-white'>
            {editingTenant ? 'Müşteri Düzenle' : 'Yeni Müşteri Oluştur'}
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-xl'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Company Information */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-white mb-3'>
              Şirket Bilgileri
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Şirket Adı *
                </label>
                <input
                  type='text'
                  required
                  value={formData.company_name}
                  onChange={e =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  placeholder='Şirket Adı'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Domain
                </label>
                <input
                  type='text'
                  value={formData.domain || ''}
                  onChange={e =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  placeholder='example.com'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Abonelik Planı
                </label>
                <select
                  value={formData.subscription_plan}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      subscription_plan: e.target.value as any,
                    })
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
                >
                  <option value='starter'>Starter</option>
                  <option value='professional'>Professional</option>
                  <option value='enterprise'>Enterprise</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Durum
                </label>
                <select
                  value={formData.subscription_status}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      subscription_status: e.target.value as any,
                    })
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
                >
                  <option value='active'>Aktif</option>
                  <option value='trial'>Deneme</option>
                  <option value='suspended'>Askıya Alınmış</option>
                  <option value='cancelled'>İptal Edilmiş</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                N8N Webhook URL
              </label>
              <input
                type='url'
                value={formData.n8n_webhook_url || ''}
                onChange={e =>
                  setFormData({ ...formData, n8n_webhook_url: e.target.value })
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='https://your-n8n-instance.com/webhook/...'
              />
            </div>

            {/* Odoo ERP Configuration */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-white'>
                  Odoo ERP Konfigürasyonu
                </h3>
                <div className='flex items-center space-x-2'>
                  {connectionStatus === 'testing' && (
                    <div className='flex items-center space-x-2 text-blue-400'>
                      <div className='animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full'></div>
                      <span className='text-sm'>Test ediliyor...</span>
                    </div>
                  )}
                  {connectionStatus === 'success' && (
                    <div className='flex items-center space-x-2 text-green-400'>
                      <i className='ri-check-line'></i>
                      <span className='text-sm'>Bağlantı başarılı</span>
                    </div>
                  )}
                  {connectionStatus === 'error' && (
                    <div className='flex items-center space-x-2 text-red-400'>
                      <i className='ri-error-warning-line'></i>
                      <span className='text-sm'>Bağlantı başarısız</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Odoo URL
                  </label>
                  <input
                    type='url'
                    value={odooConfig.url}
                    onChange={e =>
                      setOdooConfig({ ...odooConfig, url: e.target.value })
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder='https://your-odoo-instance.com'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Port
                  </label>
                  <input
                    type='number'
                    value={odooConfig.port}
                    onChange={e =>
                      setOdooConfig({
                        ...odooConfig,
                        port: parseInt(e.target.value) || 8069,
                      })
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder='8069'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Database
                  </label>
                  <input
                    type='text'
                    value={odooConfig.db}
                    onChange={e =>
                      setOdooConfig({ ...odooConfig, db: e.target.value })
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder='odoo_db'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Odoo Company
                  </label>
                  <select
                    value={formData.odoo_company_id || ''}
                    onChange={e => {
                      const companyId = parseInt(e.target.value);
                      const company =
                        OdooCompanyService.getCompanyById(companyId);
                      setFormData({
                        ...formData,
                        odoo_company_id: companyId,
                        odoo_company_name: company?.name || '',
                      });
                    }}
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
                  >
                    <option value=''>Şirket seçin</option>
                    {OdooCompanyService.getFormattedOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Username
                  </label>
                  <input
                    type='text'
                    value={odooConfig.username}
                    onChange={e =>
                      setOdooConfig({ ...odooConfig, username: e.target.value })
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder='omer@nsl.com.tr'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Password
                  </label>
                  <input
                    type='password'
                    value={odooConfig.password}
                    onChange={e =>
                      setOdooConfig({ ...odooConfig, password: e.target.value })
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder='••••••••'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={handleTestOdooConnection}
                  disabled={
                    testingConnection || !odooConfig.url || !odooConfig.db
                  }
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2'
                >
                  <i className='ri-test-tube-line'></i>
                  <span>Bağlantıyı Test Et</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Creation Section - Only for new tenants */}
          {!editingTenant && (
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id='createUser'
                  checked={createUser}
                  onChange={e => setCreateUser(e.target.checked)}
                  className='w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400'
                />
                <label
                  htmlFor='createUser'
                  className='text-sm font-medium text-gray-300'
                >
                  Admin kullanıcısı oluştur
                </label>
              </div>

              {createUser && (
                <div className='bg-white/5 border border-white/10 rounded-xl p-4 space-y-4'>
                  <h4 className='text-lg font-semibold text-white mb-3'>
                    Admin Kullanıcı Bilgileri
                  </h4>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Ad Soyad *
                      </label>
                      <input
                        type='text'
                        required={createUser}
                        value={userData.fullName}
                        onChange={e =>
                          setUserData({ ...userData, fullName: e.target.value })
                        }
                        className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                        placeholder='Ad Soyad'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        E-posta *
                      </label>
                      <input
                        type='email'
                        required={createUser}
                        value={userData.email}
                        onChange={e =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                        className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                        placeholder='admin@company.com'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Şifre *
                      </label>
                      <input
                        type='password'
                        required={createUser}
                        value={userData.password}
                        onChange={e =>
                          setUserData({ ...userData, password: e.target.value })
                        }
                        className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                        placeholder='Güçlü şifre'
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-300 mb-2'>
                        Rol
                      </label>
                      <select
                        value={userData.role}
                        onChange={e =>
                          setUserData({
                            ...userData,
                            role: e.target.value as
                              | 'tenant_admin'
                              | 'tenant_user',
                          })
                        }
                        className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
                      >
                        <option value='tenant_admin'>Tenant Admin</option>
                        <option value='tenant_user'>Tenant User</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  {editingTenant ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                </div>
              ) : editingTenant ? (
                'Güncelle'
              ) : (
                'Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
