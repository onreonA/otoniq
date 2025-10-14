import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  mockIntegrations,
  mockSyncActivities,
  getCategoryLabel,
  getStatusLabel,
  getStatusColor,
  type IntegrationCategory,
} from './mocks/integrationsMockData';
import { MockBadge } from '../../components/common/MockBadge';

const IntegrationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    IntegrationCategory | 'all'
  >('all');

  const categories: (IntegrationCategory | 'all')[] = [
    'all',
    'erp',
    'ecommerce',
    'marketplace',
    'payment',
    'shipping',
    'social',
  ];

  const filteredIntegrations = useMemo(() => {
    if (selectedCategory === 'all') {
      return mockIntegrations;
    }
    return mockIntegrations.filter(int => int.category === selectedCategory);
  }, [selectedCategory]);

  const connectedCount = mockIntegrations.filter(
    int => int.status === 'connected'
  ).length;
  const todaySyncs = mockIntegrations.reduce(
    (sum, int) => sum + (int.syncCount || 0),
    0
  );
  const errorCount = mockIntegrations.filter(
    int => int.status === 'error'
  ).length;
  const successRate = (
    (connectedCount / mockIntegrations.length) *
    100
  ).toFixed(1);

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Mock Badge */}
      <MockBadge storageKey='mock-badge-integrations' />

      {/* Page Header */}
      <div className='mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20'>
        <h1 className='text-3xl font-bold text-white mb-2'>Entegrasyonlar</h1>
        <p className='text-white/80'>
          Tüm entegrasyonlarınızı merkezi bir yerden yönetin ve izleyin
        </p>
      </div>

      {/* KPI Stats */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Aktif Entegrasyon</span>
            <CheckCircle className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{connectedCount}</p>
          <p className='text-xs text-white/50 mt-1'>
            Toplam {mockIntegrations.length} entegrasyon
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>
              Bugünkü Senkronizasyon
            </span>
            <RefreshCw className='w-5 h-5 text-blue-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{todaySyncs}</p>
          <p className='text-xs text-white/50 mt-1'>İşlem başarılı</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Başarı Oranı</span>
            <TrendingUp className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{successRate}%</p>
          <p className='text-xs text-white/50 mt-1'>Son 30 gün ortalaması</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Hata</span>
            <AlertCircle className='w-5 h-5 text-red-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{errorCount}</p>
          <p className='text-xs text-white/50 mt-1'>Aktif hata</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className='mb-6 flex items-center gap-3 overflow-x-auto pb-2'>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            {cat === 'all' ? 'Tümü' : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {filteredIntegrations.map(integration => (
          <Link
            key={integration.id}
            to={integration.link}
            className='group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all'
          >
            {/* Integration Header */}
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='text-4xl'>{integration.icon}</div>
                <div>
                  <h3 className='text-lg font-bold text-white group-hover:text-purple-400 transition-colors'>
                    {integration.name}
                  </h3>
                  <p className='text-xs text-white/50'>
                    {getCategoryLabel(integration.category)}
                  </p>
                </div>
              </div>
              <ArrowRight className='w-5 h-5 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all' />
            </div>

            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getStatusColor(integration.status)}`}
            >
              {integration.status === 'connected' && (
                <CheckCircle className='w-3 h-3' />
              )}
              {integration.status === 'error' && (
                <AlertCircle className='w-3 h-3' />
              )}
              <span>{getStatusLabel(integration.status)}</span>
            </div>

            {/* Description */}
            <p className='text-sm text-white/70 mb-4'>
              {integration.description}
            </p>

            {/* Stats */}
            {integration.status === 'connected' && integration.lastSync && (
              <div className='space-y-2 text-xs text-white/50'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-3 h-3' />
                  <span>
                    Son senkronizasyon:{' '}
                    {integration.lastSync.toLocaleTimeString('tr-TR')}
                  </span>
                </div>
                {integration.syncCount && (
                  <div className='flex items-center gap-2'>
                    <Activity className='w-3 h-3' />
                    <span>{integration.syncCount} işlem</span>
                  </div>
                )}
              </div>
            )}

            {integration.status === 'error' && integration.errorMessage && (
              <div className='flex items-start gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg'>
                <AlertCircle className='w-4 h-4 flex-shrink-0 mt-0.5' />
                <span>{integration.errorMessage}</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
          <Activity className='w-6 h-6' />
          Son Aktiviteler
        </h2>

        <div className='space-y-3'>
          {mockSyncActivities.slice(0, 5).map(activity => (
            <div
              key={activity.id}
              className='flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10'
            >
              <div
                className={`p-2 rounded-lg ${
                  activity.type === 'sync'
                    ? 'bg-green-500/20 text-green-400'
                    : activity.type === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                }`}
              >
                {activity.type === 'sync' && (
                  <CheckCircle className='w-5 h-5' />
                )}
                {activity.type === 'error' && (
                  <AlertCircle className='w-5 h-5' />
                )}
                {activity.type === 'warning' && (
                  <AlertCircle className='w-5 h-5' />
                )}
              </div>

              <div className='flex-1'>
                <div className='flex items-start justify-between mb-1'>
                  <p className='text-sm font-medium text-white'>
                    {activity.integrationName}
                  </p>
                  <span className='text-xs text-white/50'>
                    {activity.timestamp.toLocaleTimeString('tr-TR')}
                  </span>
                </div>
                <p className='text-sm text-white/70'>{activity.message}</p>
                {activity.details && (
                  <p className='text-xs text-white/50 mt-1'>
                    {activity.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
