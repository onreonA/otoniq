import { useState, useEffect } from 'react';
import {
  TenantService,
  Tenant,
  CreateTenantData,
  UpdateTenantData,
} from '../../../../infrastructure/database/supabase/tenant.service';
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
    shopify_store_config: {},
    settings: {},
  });

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
      }
    }
  }, [isOpen, editingTenant]);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTenant) {
        // Update existing tenant
        await TenantService.updateTenant(editingTenant.id, formData);
        toast.success('Müşteri başarıyla güncellendi');
      } else {
        // Create new tenant
        await TenantService.createTenant(formData);
        toast.success('Müşteri başarıyla oluşturuldu');
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

  // Form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-white/10'>
          <div className='flex items-center justify-between'>
            <h3 className='text-2xl font-bold text-white'>
              {editingTenant ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-close-line text-2xl'></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Company Name */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Şirket Adı *
            </label>
            <input
              type='text'
              required
              value={formData.company_name}
              onChange={e => handleInputChange('company_name', e.target.value)}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='Şirket adını girin'
            />
          </div>

          {/* Domain */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Domain (Opsiyonel)
            </label>
            <input
              type='text'
              value={formData.domain}
              onChange={e => handleInputChange('domain', e.target.value)}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='ornek.otoniq.ai'
            />
          </div>

          {/* Subscription Plan */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Abonelik Planı
            </label>
            <select
              value={formData.subscription_plan}
              onChange={e =>
                handleInputChange('subscription_plan', e.target.value)
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
            >
              <option value='starter'>Starter</option>
              <option value='professional'>Professional</option>
              <option value='enterprise'>Enterprise</option>
            </select>
          </div>

          {/* Subscription Status */}
          <div>
            <label className='block text-white font-medium mb-2'>Durum</label>
            <select
              value={formData.subscription_status}
              onChange={e =>
                handleInputChange('subscription_status', e.target.value)
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
            >
              <option value='active'>Aktif</option>
              <option value='trial'>Deneme</option>
              <option value='suspended'>Askıda</option>
              <option value='cancelled'>İptal</option>
            </select>
          </div>

          {/* N8N Webhook URL */}
          <div>
            <label className='block text-white font-medium mb-2'>
              N8N Webhook URL (Opsiyonel)
            </label>
            <input
              type='url'
              value={formData.n8n_webhook_url}
              onChange={e =>
                handleInputChange('n8n_webhook_url', e.target.value)
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='https://n8n.example.com/webhook/...'
            />
          </div>

          {/* Odoo API Config */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Odoo API Konfigürasyonu (Opsiyonel)
            </label>
            <textarea
              value={JSON.stringify(formData.odoo_api_config, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange('odoo_api_config', parsed);
                } catch {
                  // Invalid JSON, keep as string
                }
              }}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm'
              placeholder='{"url": "https://odoo.example.com", "db": "database", "username": "user", "password": "pass"}'
              rows={4}
            />
          </div>

          {/* Shopify Store Config */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Shopify Mağaza Konfigürasyonu (Opsiyonel)
            </label>
            <textarea
              value={JSON.stringify(formData.shopify_store_config, null, 2)}
              onChange={e => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleInputChange('shopify_store_config', parsed);
                } catch {
                  // Invalid JSON, keep as string
                }
              }}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors font-mono text-sm'
              placeholder='{"store_url": "https://store.myshopify.com", "api_key": "key", "access_token": "token"}'
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className='flex space-x-4 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
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
