/**
 * Shopify Sync Modal Component
 *
 * Shopify'dan ürün senkronizasyonu için modal
 */

import { useState } from 'react';
import { ShopifySyncService } from '../../../../infrastructure/services/ShopifySyncService';
import { SyncResult } from '../../../../application/use-cases/shopify/SyncProductsFromShopifyUseCase';
import toast from 'react-hot-toast';

interface ShopifySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenantId: string;
}

export default function ShopifySyncModal({
  isOpen,
  onClose,
  onSuccess,
  tenantId,
}: ShopifySyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [shopifyConfig, setShopifyConfig] = useState({
    shop: '',
    accessToken: '',
  });
  const [connectionTested, setConnectionTested] = useState(false);
  const [productsInfo, setProductsInfo] = useState<any>(null);

  const handleConfigChange = (field: string, value: string) => {
    setShopifyConfig(prev => ({
      ...prev,
      [field]: value,
    }));
    setConnectionTested(false);
  };

  const testConnection = async () => {
    if (!shopifyConfig.shop || !shopifyConfig.accessToken) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setLoading(true);
    try {
      const syncService = new ShopifySyncService(shopifyConfig);
      const result = await syncService.testConnection();

      if (result.success) {
        toast.success('Shopify bağlantısı başarılı!');
        setConnectionTested(true);

        // Get products info
        const info = await syncService.getProductsInfo(10, 1);
        setProductsInfo(info);
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

  const handleSync = async (
    syncType: 'all' | 'page' | 'single',
    productId?: number
  ) => {
    if (!connectionTested) {
      toast.error('Önce bağlantıyı test edin');
      return;
    }

    setLoading(true);
    setSyncResult(null);

    try {
      const syncService = new ShopifySyncService(shopifyConfig);
      let result: SyncResult;

      switch (syncType) {
        case 'all':
          result = await syncService.syncAllProducts(tenantId, 50);
          break;
        case 'page':
          result = await syncService.syncProductsPage(tenantId, 10);
          break;
        case 'single':
          if (!productId) {
            toast.error('Ürün ID gerekli');
            return;
          }
          result = await syncService.syncSingleProduct(tenantId, productId);
          break;
        default:
          result = await syncService.syncAllProducts(tenantId, 50);
      }

      setSyncResult(result);

      if (result.success) {
        toast.success(`${result.syncedCount} ürün senkronize edildi`);
        onSuccess();
      } else {
        toast.error(`Senkronizasyon hatası: ${result.errors.join(', ')}`);
      }
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
            Shopify Senkronizasyonu
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-2xl'></i>
          </button>
        </div>

        <div className='space-y-6'>
          {/* Shopify Configuration */}
          <div className='bg-gray-700/50 rounded-xl p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Shopify Mağaza Konfigürasyonu
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Mağaza Adı
                </label>
                <input
                  type='text'
                  value={shopifyConfig.shop}
                  onChange={e => handleConfigChange('shop', e.target.value)}
                  placeholder='your-shop-name'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
                <p className='text-gray-400 text-xs mt-1'>
                  your-shop-name.myshopify.com
                </p>
              </div>
              <div>
                <label className='block text-gray-300 text-sm font-medium mb-2'>
                  Access Token
                </label>
                <input
                  type='password'
                  value={shopifyConfig.accessToken}
                  onChange={e =>
                    handleConfigChange('accessToken', e.target.value)
                  }
                  placeholder='shpat_xxxxxxxxxxxxxxxxx'
                  className='w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500'
                />
                <p className='text-gray-400 text-xs mt-1'>
                  Admin API Access Token
                </p>
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

          {/* Products Info */}
          {productsInfo && productsInfo.success && (
            <div className='bg-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Mağaza Bilgileri
              </h3>
              <div className='bg-green-500/20 border border-green-500/50 rounded-lg p-4'>
                <div className='text-green-400 font-semibold text-lg'>
                  {productsInfo.products.length} ürün bulundu
                </div>
                <div className='text-green-300 text-sm mt-2'>
                  Son 10 ürün önizlemesi:
                </div>
                <div className='mt-2 space-y-1'>
                  {productsInfo.products
                    .slice(0, 5)
                    .map((product: any, index: number) => (
                      <div key={index} className='text-green-200 text-sm'>
                        • {product.title} ({product.vendor})
                      </div>
                    ))}
                  {productsInfo.products.length > 5 && (
                    <div className='text-green-200 text-sm'>
                      ... ve {productsInfo.products.length - 5} ürün daha
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sync Options */}
          {connectionTested && (
            <div className='bg-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Senkronizasyon Seçenekleri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <button
                  onClick={() => handleSync('page')}
                  disabled={loading}
                  className='bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  <i className='ri-download-line text-2xl mb-2'></i>
                  <div className='font-semibold'>İlk 10 Ürün</div>
                  <div className='text-sm opacity-80'>
                    İlk 10 ürünü senkronize et
                  </div>
                </button>

                <button
                  onClick={() => handleSync('all')}
                  disabled={loading}
                  className='bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors disabled:opacity-50'
                >
                  <i className='ri-download-line text-2xl mb-2'></i>
                  <div className='font-semibold'>Tüm Ürünler</div>
                  <div className='text-sm opacity-80'>
                    Tüm ürünleri senkronize et
                  </div>
                </button>

                <button
                  disabled={loading}
                  className='bg-gray-500 text-gray-300 p-4 rounded-lg cursor-not-allowed'
                >
                  <i className='ri-settings-line text-2xl mb-2'></i>
                  <div className='font-semibold'>Gelişmiş</div>
                  <div className='text-sm opacity-80'>Yakında gelecek</div>
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
