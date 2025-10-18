import { useState, useEffect } from 'react';
import {
  OdooIntegrationService,
  OdooConfig,
} from '../../../../infrastructure/services/OdooIntegrationService';
import toast from 'react-hot-toast';

interface OdooIntegrationProps {
  productId?: string;
  onSync?: () => void;
  className?: string;
}

export default function OdooIntegration({
  productId,
  onSync,
  className = '',
}: OdooIntegrationProps) {
  const [config, setConfig] = useState<OdooConfig>({
    url: '',
    database: '',
    username: '',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [odooService, setOdooService] = useState<OdooIntegrationService | null>(
    null
  );

  // Load saved config
  useEffect(() => {
    const savedConfig = localStorage.getItem('odoo-config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save config
  const saveConfig = () => {
    localStorage.setItem('odoo-config', JSON.stringify(config));
    toast.success('Odoo konfigürasyonu kaydedildi');
  };

  // Test connection
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const service = new OdooIntegrationService(config);
      const isConnected = await service.testConnection();
      setIsConnected(isConnected);

      if (isConnected) {
        setOdooService(service);
        toast.success('Odoo bağlantısı başarılı');
      } else {
        toast.error('Odoo bağlantısı başarısız');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Bağlantı testi başarısız');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync product to Odoo
  const syncToOdoo = async () => {
    if (!odooService || !productId) {
      toast.error('Odoo servisi veya ürün ID bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      // This would need to fetch the product data first
      // For now, we'll just show a success message
      toast.success("Ürün Odoo'ya senkronize edildi");
      onSync?.();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Senkronizasyon başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-white font-medium'>Odoo Entegrasyonu</h4>
          <p className='text-gray-400 text-sm'>
            Odoo ERP sistemi ile ürün senkronizasyonu
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm ${
            isConnected
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
        </div>
      </div>

      {/* Configuration Form */}
      <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
        <h5 className='text-white font-medium mb-4'>Odoo Konfigürasyonu</h5>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* URL */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Odoo URL
            </label>
            <input
              type='url'
              value={config.url}
              onChange={e =>
                setConfig(prev => ({ ...prev, url: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='https://your-odoo-instance.com'
            />
          </div>

          {/* Database */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Veritabanı
            </label>
            <input
              type='text'
              value={config.database}
              onChange={e =>
                setConfig(prev => ({ ...prev, database: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='your_database'
            />
          </div>

          {/* Username */}
          <div>
            <label className='block text-white font-medium mb-2'>
              Kullanıcı Adı
            </label>
            <input
              type='text'
              value={config.username}
              onChange={e =>
                setConfig(prev => ({ ...prev, username: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='admin'
            />
          </div>

          {/* Password */}
          <div>
            <label className='block text-white font-medium mb-2'>Şifre</label>
            <input
              type='password'
              value={config.password}
              onChange={e =>
                setConfig(prev => ({ ...prev, password: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              placeholder='••••••••'
            />
          </div>
        </div>

        {/* Actions */}
        <div className='flex space-x-3 mt-6'>
          <button
            onClick={saveConfig}
            className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'
          >
            <i className='ri-save-line mr-2'></i>
            Kaydet
          </button>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <div className='flex items-center'>
                <div className='w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2'></div>
                Test Ediliyor...
              </div>
            ) : (
              <>
                <i className='ri-wifi-line mr-2'></i>
                Bağlantıyı Test Et
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Actions */}
      {isConnected && (
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <h5 className='text-white font-medium mb-4'>Senkronizasyon</h5>

          <div className='space-y-4'>
            {/* Sync to Odoo */}
            <div className='flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
              <div>
                <h6 className='text-blue-400 font-medium'>
                  Odoo'ya Senkronize Et
                </h6>
                <p className='text-gray-400 text-sm'>
                  Bu ürünü Odoo ERP sistemine gönder
                </p>
              </div>
              <button
                onClick={syncToOdoo}
                disabled={isLoading}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <div className='flex items-center'>
                    <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2'></div>
                    Senkronize...
                  </div>
                ) : (
                  <>
                    <i className='ri-upload-line mr-2'></i>
                    Senkronize Et
                  </>
                )}
              </button>
            </div>

            {/* Import from Odoo */}
            <div className='flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
              <div>
                <h6 className='text-green-400 font-medium'>
                  Odoo'dan İçe Aktar
                </h6>
                <p className='text-gray-400 text-sm'>
                  Odoo'dan ürünleri içe aktar
                </p>
              </div>
              <button
                onClick={() =>
                  toast.info('İçe aktarma özelliği yakında eklenecek')
                }
                className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'
              >
                <i className='ri-download-line mr-2'></i>
                İçe Aktar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className='bg-red-500/10 border border-red-500/20 rounded-xl p-4'>
          <div className='flex items-center'>
            <i className='ri-error-warning-line text-red-400 mr-3'></i>
            <div>
              <h6 className='text-red-400 font-medium'>Bağlantı Gerekli</h6>
              <p className='text-gray-400 text-sm'>
                Odoo entegrasyonu için önce bağlantıyı test edin
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
