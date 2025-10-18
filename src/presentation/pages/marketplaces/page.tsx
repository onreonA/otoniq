import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth/authStore';
import {
  Marketplace,
  MarketplaceType,
} from '../../../domain/entities/Marketplace';
import { Money } from '../../../domain/value-objects/Money';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MarketplacesPage() {
  const { userProfile } = useAuthStore();
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConnections: 0,
    activeConnections: 0,
    totalListings: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadMarketplaces();
    loadStats();
  }, []);

  const loadMarketplaces = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // const response = await marketplaceService.getMarketplaces(userProfile.tenant_id);
      // setMarketplaces(response.data);

      // Mock data for now
      const mockMarketplaces: Marketplace[] = [
        new Marketplace(
          '1',
          userProfile.tenant_id || '',
          'trendyol',
          'Trendyol',
          { apiKey: '***', apiSecret: '***' },
          'active',
          { autoSync: true, syncInterval: 3600 },
          {
            totalListedProducts: 150,
            totalOrders: 45,
            totalRevenue: new Money(12500, 'TRY'),
            lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          new Date(),
          new Date()
        ),
        new Marketplace(
          '2',
          userProfile.tenant_id || '',
          'amazon',
          'Amazon',
          { apiKey: '***', apiSecret: '***' },
          'active',
          { autoSync: true, syncInterval: 1800 },
          {
            totalListedProducts: 89,
            totalOrders: 23,
            totalRevenue: new Money(8900, 'TRY'),
            lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          },
          new Date(),
          new Date()
        ),
      ];

      setMarketplaces(mockMarketplaces);
    } catch (error) {
      console.error('Error loading marketplaces:', error);
      toast.error('Pazaryeri bağlantıları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Implement actual API call
      // const response = await marketplaceService.getStats(userProfile.tenant_id);
      // setStats(response.data);

      // Mock data for now
      setStats({
        totalConnections: 2,
        activeConnections: 2,
        totalListings: 239,
        totalOrders: 68,
        totalRevenue: 21400,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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
              <p className='text-gray-300'>
                Pazaryeri bağlantıları yükleniyor...
              </p>
            </div>
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
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Pazaryeri Yönetimi
              </h1>
              <p className='text-gray-300'>
                Tüm pazaryeri bağlantılarınızı yönetin ve ürünlerinizi
                senkronize edin
              </p>
            </div>
            <Link
              to='/marketplaces/connect'
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2'
            >
              <i className='ri-add-line'></i>
              Yeni Bağlantı
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Toplam Bağlantı</p>
                <p className='text-2xl font-bold text-white'>
                  {stats.totalConnections}
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                <i className='ri-link text-blue-400 text-xl'></i>
              </div>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Aktif Bağlantı</p>
                <p className='text-2xl font-bold text-white'>
                  {stats.activeConnections}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center'>
                <i className='ri-check-circle text-green-400 text-xl'></i>
              </div>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Toplam Ürün</p>
                <p className='text-2xl font-bold text-white'>
                  {stats.totalListings}
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                <i className='ri-shopping-bag text-purple-400 text-xl'></i>
              </div>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Toplam Sipariş</p>
                <p className='text-2xl font-bold text-white'>
                  {stats.totalOrders}
                </p>
              </div>
              <div className='w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center'>
                <i className='ri-shopping-cart text-orange-400 text-xl'></i>
              </div>
            </div>
          </div>

          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-400 text-sm'>Toplam Gelir</p>
                <p className='text-2xl font-bold text-white'>
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className='w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center'>
                <i className='ri-money-dollar-circle text-green-400 text-xl'></i>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplaces Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {marketplaces.map(marketplace => (
            <div
              key={marketplace.id}
              className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200'
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                    <i
                      className={`${getMarketplaceIcon(marketplace.type)} text-white text-xl`}
                    ></i>
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-white'>
                      {marketplace.getDisplayName()}
                    </h3>
                    <p className='text-gray-400 text-sm'>
                      Pazaryeri Bağlantısı
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium bg-${getStatusColor(marketplace.status)}-500/20 text-${getStatusColor(marketplace.status)}-400 border border-${getStatusColor(marketplace.status)}-500/30`}
                >
                  {getStatusText(marketplace.status)}
                </div>
              </div>

              <div className='space-y-3 mb-6'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>Listelenen Ürün</span>
                  <span className='text-white font-medium'>
                    {marketplace.stats.totalListedProducts}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>Toplam Sipariş</span>
                  <span className='text-white font-medium'>
                    {marketplace.stats.totalOrders}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>Toplam Gelir</span>
                  <span className='text-white font-medium'>
                    {formatCurrency(marketplace.stats.totalRevenue.amount)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-400 text-sm'>
                    Son Senkronizasyon
                  </span>
                  <span className='text-white font-medium text-sm'>
                    {marketplace.stats.lastSyncAt
                      ? formatDate(marketplace.stats.lastSyncAt)
                      : 'Hiç'}
                  </span>
                </div>
              </div>

              <div className='flex gap-2'>
                <Link
                  to={`/marketplaces/${marketplace.id}`}
                  className='flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center'
                >
                  Yönet
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implement sync
                    toast.success('Senkronizasyon başlatıldı');
                  }}
                  className='flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  <i className='ri-refresh-line'></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {marketplaces.length === 0 && (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6'>
              <i className='ri-store-2-line text-4xl text-gray-400'></i>
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Henüz pazaryeri bağlantısı yok
            </h3>
            <p className='text-gray-400 mb-6'>
              İlk pazaryeri bağlantınızı kurarak ürünlerinizi pazaryerlerinde
              satmaya başlayın
            </p>
            <Link
              to='/marketplaces/connect'
              className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center gap-2'
            >
              <i className='ri-add-line'></i>
              İlk Bağlantıyı Kur
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
