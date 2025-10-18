import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth/authStore';
import {
  Marketplace,
  MarketplaceType,
} from '../../../../domain/entities/Marketplace';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [marketplace, setMarketplace] = useState<Marketplace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadMarketplace(id);
    }
  }, [id]);

  const loadMarketplace = async (marketplaceId: string) => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await marketplaceService.getMarketplace(marketplaceId);
      // setMarketplace(response.data);

      // Mock data for now
      const mockMarketplace = new Marketplace(
        marketplaceId,
        userProfile.tenant_id || '',
        'trendyol',
        'Trendyol',
        { apiKey: '***', apiSecret: '***' },
        'active',
        { autoSync: true, syncInterval: 3600 },
        {
          totalListedProducts: 150,
          totalOrders: 45,
          totalRevenue: { amount: 12500, currency: 'TRY' },
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        new Date(),
        new Date()
      );

      setMarketplace(mockMarketplace);
    } catch (error) {
      console.error('Error loading marketplace:', error);
      toast.error('Pazaryeri bilgileri yüklenirken hata oluştu');
      navigate('/marketplaces');
    } finally {
      setLoading(false);
    }
  };

  const getMarketplaceIcon = (type: MarketplaceType): string => {
    const icons: Record<MarketplaceType, string> = {
      trendyol: 'ri-store-2-line',
      amazon: 'ri-amazon-line',
      hepsiburada: 'ri-shopping-bag-line',
      n11: 'ri-shopping-cart-line',
      gittigidiyor: 'ri-truck-line',
      ciceksepeti: 'ri-plant-line',
      other: 'ri-global-line',
    };
    return icons[type] || 'ri-global-line';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'green',
      inactive: 'gray',
      error: 'red',
      testing: 'yellow',
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      error: 'Hata',
      testing: 'Test Ediliyor',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4'></div>
              <p className='text-gray-300'>Pazaryeri bilgileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!marketplace) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <i className='ri-error-warning-line text-4xl text-red-400'></i>
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Pazaryeri bulunamadı
            </h3>
            <p className='text-gray-400 mb-6'>
              Aradığınız pazaryeri bağlantısı bulunamadı.
            </p>
            <Link
              to='/marketplaces'
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2'
            >
              <i className='ri-arrow-left-line'></i>
              Pazaryerlerine Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-4'>
            <button
              onClick={() => navigate('/marketplaces')}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-arrow-left-line text-xl'></i>
            </button>
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                <i
                  className={`${getMarketplaceIcon(marketplace.type)} text-white text-2xl`}
                ></i>
              </div>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  {marketplace.getDisplayName()}
                </h1>
                <p className='text-gray-300'>Pazaryeri Yönetimi</p>
              </div>
            </div>
            <div
              className={`ml-auto px-4 py-2 rounded-full text-sm font-medium bg-${getStatusColor(marketplace.status)}-500/20 text-${getStatusColor(marketplace.status)}-400 border border-${getStatusColor(marketplace.status)}-500/30`}
            >
              {getStatusText(marketplace.status)}
            </div>
          </div>

          {/* Tabs */}
          <div className='flex space-x-1 bg-white/5 rounded-xl p-1'>
            {[
              {
                id: 'overview',
                label: 'Genel Bakış',
                icon: 'ri-dashboard-line',
              },
              {
                id: 'products',
                label: 'Ürünler',
                icon: 'ri-shopping-bag-line',
              },
              {
                id: 'orders',
                label: 'Siparişler',
                icon: 'ri-shopping-cart-line',
              },
              {
                id: 'analytics',
                label: 'Analitikler',
                icon: 'ri-bar-chart-line',
              },
              { id: 'settings', label: 'Ayarlar', icon: 'ri-settings-line' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='space-y-6'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-400 text-sm'>Listelenen Ürün</p>
                    <p className='text-2xl font-bold text-white'>
                      {marketplace.stats.totalListedProducts}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                    <i className='ri-shopping-bag text-blue-400 text-xl'></i>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-400 text-sm'>Toplam Sipariş</p>
                    <p className='text-2xl font-bold text-white'>
                      {marketplace.stats.totalOrders}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center'>
                    <i className='ri-shopping-cart text-green-400 text-xl'></i>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-400 text-sm'>Toplam Gelir</p>
                    <p className='text-2xl font-bold text-white'>
                      {formatCurrency(marketplace.stats.totalRevenue.amount)}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                    <i className='ri-money-dollar-circle text-purple-400 text-xl'></i>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-400 text-sm'>Son Senkronizasyon</p>
                    <p className='text-lg font-bold text-white'>
                      {marketplace.stats.lastSyncAt
                        ? formatDate(marketplace.stats.lastSyncAt)
                        : 'Hiç'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center'>
                    <i className='ri-refresh-line text-orange-400 text-xl'></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-white'>
                  Listelenen Ürünler
                </h3>
                <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                  <i className='ri-add-line mr-2'></i>
                  Ürün Ekle
                </button>
              </div>
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-shopping-bag text-2xl text-gray-400'></i>
                </div>
                <p className='text-gray-400'>Ürün listesi yakında eklenecek</p>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-white'>Siparişler</h3>
                <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                  <i className='ri-refresh-line mr-2'></i>
                  Senkronize Et
                </button>
              </div>
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-shopping-cart text-2xl text-gray-400'></i>
                </div>
                <p className='text-gray-400'>
                  Sipariş listesi yakında eklenecek
                </p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6'>
                Analitikler
              </h3>
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-bar-chart text-2xl text-gray-400'></i>
                </div>
                <p className='text-gray-400'>
                  Analitik grafikleri yakında eklenecek
                </p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6'>Ayarlar</h3>
              <div className='space-y-6'>
                <div className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                  <div>
                    <h4 className='text-white font-medium'>
                      Otomatik Senkronizasyon
                    </h4>
                    <p className='text-gray-400 text-sm'>
                      Ürün bilgilerini otomatik olarak senkronize et
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={marketplace.settings.autoSync}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                  <div>
                    <h4 className='text-white font-medium'>
                      Senkronizasyon Aralığı
                    </h4>
                    <p className='text-gray-400 text-sm'>
                      {marketplace.settings.syncInterval / 60} dakika
                    </p>
                  </div>
                  <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                    Düzenle
                  </button>
                </div>

                <div className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                  <div>
                    <h4 className='text-white font-medium'>API Bilgileri</h4>
                    <p className='text-gray-400 text-sm'>
                      Pazaryeri API bağlantı bilgileri
                    </p>
                  </div>
                  <button className='bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
