/**
 * Odoo Sync Modal Component
 *
 * Odoo ERP'den ürün senkronizasyonu için modal
 */

import { useState } from 'react';
import { OdooSyncService } from '../../../../infrastructure/services/OdooSyncService';
import { SyncResult } from '../../../../application/use-cases/odoo/SyncProductsFromOdooUseCase';
import { IntegrationLogService } from '../../../../infrastructure/services/IntegrationLogService';
import { SupabaseIntegrationLogRepository } from '../../../../infrastructure/database/supabase/repositories/SupabaseIntegrationLogRepository';
import toast from 'react-hot-toast';

interface OdooSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
}

export default function OdooSyncModal({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
}: OdooSyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [odooConfig, setOdooConfig] = useState({
    url: '',
    port: 8069,
    db: '',
    username: '',
    password: '',
  });
  const [connectionTested, setConnectionTested] = useState(false);

  const handleConfigChange = (field: string, value: string | number) => {
    setOdooConfig(prev => ({
      ...prev,
      [field]: value,
    }));
    setConnectionTested(false);
  };

  const testConnection = async () => {
    if (
      !odooConfig.url ||
      !odooConfig.db ||
      !odooConfig.username ||
      !odooConfig.password
    ) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const syncService = new OdooSyncService(odooConfig);
      const result = await syncService.testConnection();

      if (result.success) {
        toast.success('Odoo bağlantısı başarılı!');
        setConnectionTested(true);
      } else {
        toast.error(`Bağlantı hatası: ${result.message}`);
        setConnectionTested(false);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Bağlantı testi başarısız');
      setConnectionTested(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (syncType: 'all' | 'recent' | 'active') => {
    if (!connectionTested) {
      toast.error('Önce bağlantıyı test edin');
      return;
    }

    setLoading(true);
    setSyncResult(null);

    // Initialize integration logging
    const logRepository = new SupabaseIntegrationLogRepository();
    const logService = new IntegrationLogService(logRepository);

    try {
      // Log the sync operation
      await logService.logSync(
        tenantId,
        'odoo',
        async () => {
          const syncService = new OdooSyncService(odooConfig);
          let result: SyncResult;

          switch (syncType) {
            case 'all':
              result = await syncService.syncAllProducts(tenantId);
              break;
            case 'recent':
              result = await syncService.syncRecentProducts(tenantId, 24);
              break;
            case 'active':
              result = await syncService.syncActiveProducts(tenantId);
              break;
            default:
              result = await syncService.syncAllProducts(tenantId);
          }

          setSyncResult(result);

          if (result.success) {
            toast.success(`${result.syncedCount} ürün senkronize edildi`);
            onSuccess();

            return {
              success: true,
              successCount: result.syncedCount,
              errorCount: result.errors.length,
              responseData: {
                syncedProducts: result.syncedCount,
                errors: result.errors,
                syncType,
              },
            };
          } else {
            toast.error(`Senkronizasyon hatası: ${result.errors.join(', ')}`);

            return {
              success: false,
              successCount: result.syncedCount,
              errorCount: result.errors.length,
              errorMessage: result.errors.join(', '),
              responseData: {
                syncedProducts: result.syncedCount,
                errors: result.errors,
                syncType,
              },
            };
          }
        },
        {
          entityType: 'product',
          metadata: {
            syncType,
            odooUrl: odooConfig.url,
            odooDatabase: odooConfig.db,
          },
        }
      );
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Senkronizasyon başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-800 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-xl'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            Odoo ERP Senkronizasyonu
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-2xl'></i>
          </button>
        </div>

        <div className='space-y-6'>
          {/* Odoo Configuration */}
          <div className='bg-gray-700/50 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Odoo ERP Konfigürasyonu
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Odoo URL
                </label>
                <input
                  type='text'
                  value={odooConfig.url}
                  onChange={e => handleConfigChange('url', e.target.value)}
                  placeholder='https://your-odoo-instance.com'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Port
                </label>
                <input
                  type='number'
                  value={odooConfig.port}
                  onChange={e =>
                    handleConfigChange('port', parseInt(e.target.value))
                  }
                  placeholder='8069'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Database
                </label>
                <input
                  type='text'
                  value={odooConfig.db}
                  onChange={e => handleConfigChange('db', e.target.value)}
                  placeholder='database_name'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Username
                </label>
                <input
                  type='text'
                  value={odooConfig.username}
                  onChange={e => handleConfigChange('username', e.target.value)}
                  placeholder='odoo_username'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
              <div className='md:col-span-2'>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Password
                </label>
                <input
                  type='password'
                  value={odooConfig.password}
                  onChange={e => handleConfigChange('password', e.target.value)}
                  placeholder='odoo_password'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
              </div>
            </div>

            <div className='mt-4'>
              <button
                onClick={testConnection}
                disabled={loading}
                className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50'
              >
                {loading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
              </button>
              {connectionTested && (
                <span className='ml-3 text-green-400'>
                  <i className='ri-check-line mr-1'></i>
                  Bağlantı başarılı
                </span>
              )}
            </div>
          </div>

          {/* Sync Options */}
          {connectionTested && (
            <div className='bg-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Senkronizasyon Seçenekleri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <button
                  onClick={() => handleSync('all')}
                  disabled={loading}
                  className='bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  <i className='ri-download-line text-2xl mb-2'></i>
                  <div className='font-semibold'>Tüm Ürünler</div>
                  <div className='text-sm opacity-80'>
                    Odoo'daki tüm ürünleri senkronize et
                  </div>
                </button>

                <button
                  onClick={() => handleSync('recent')}
                  disabled={loading}
                  className='bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  <i className='ri-time-line text-2xl mb-2'></i>
                  <div className='font-semibold'>Son 24 Saat</div>
                  <div className='text-sm opacity-80'>
                    Son güncellenen ürünleri senkronize et
                  </div>
                </button>

                <button
                  onClick={() => handleSync('active')}
                  disabled={loading}
                  className='bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  <i className='ri-check-line text-2xl mb-2'></i>
                  <div className='font-semibold'>Aktif Ürünler</div>
                  <div className='text-sm opacity-80'>
                    Sadece aktif ürünleri senkronize et
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Sync Results */}
          {syncResult && (
            <div className='bg-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Senkronizasyon Sonuçları
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-green-500/20 border border-green-500/50 rounded-lg p-4'>
                  <div className='text-green-400 font-semibold text-2xl'>
                    {syncResult.syncedCount}
                  </div>
                  <div className='text-green-300 text-sm'>
                    Senkronize Edilen
                  </div>
                </div>
                <div className='bg-red-500/20 border border-red-500/50 rounded-lg p-4'>
                  <div className='text-red-400 font-semibold text-2xl'>
                    {syncResult.errorCount}
                  </div>
                  <div className='text-red-300 text-sm'>Hata</div>
                </div>
                <div className='bg-blue-500/20 border border-blue-500/50 rounded-lg p-4'>
                  <div className='text-blue-400 font-semibold text-2xl'>
                    {syncResult.success ? 'Başarılı' : 'Başarısız'}
                  </div>
                  <div className='text-blue-300 text-sm'>Durum</div>
                </div>
              </div>

              {syncResult.errors.length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-red-400 font-semibold mb-2'>Hatalar:</h4>
                  <div className='bg-red-500/10 border border-red-500/30 rounded-lg p-3 max-h-32 overflow-y-auto'>
                    {syncResult.errors.map((error, index) => (
                      <div key={index} className='text-red-300 text-sm'>
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='flex justify-end space-x-4 mt-6'>
          <button
            onClick={onClose}
            className='px-6 py-3 rounded-xl text-gray-300 hover:bg-gray-700 transition-colors font-medium'
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
