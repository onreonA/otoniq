import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Settings,
  RefreshCw,
  Map,
  FileText,
  Activity,
  Webhook,
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  ExternalLink,
} from 'lucide-react';
import {
  mockShopifyConnection,
  mockShopifySyncStats,
  mockShopifySyncHistory,
  mockShopifyWebhooks,
  mockShopifyLogs,
  getOperationLabel,
  getStatusColor,
  getLogLevelColor,
  getWebhookTopicLabel,
} from './mocks/shopifyMockData';
import { MockBadge } from '../../../components/common/MockBadge';

type TabType =
  | 'overview'
  | 'settings'
  | 'sync'
  | 'mapping'
  | 'logs'
  | 'webhooks';

const ShopifyIntegrationPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
      id: 'overview',
      label: 'Genel Bakış',
      icon: <Activity className='w-4 h-4' />,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: <Settings className='w-4 h-4' />,
    },
    {
      id: 'sync',
      label: 'Senkronizasyon',
      icon: <RefreshCw className='w-4 h-4' />,
    },
    {
      id: 'mapping',
      label: 'Ürün Eşleştirme',
      icon: <Map className='w-4 h-4' />,
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: <Webhook className='w-4 h-4' />,
    },
    {
      id: 'logs',
      label: 'Loglar & Sorun Giderme',
      icon: <FileText className='w-4 h-4' />,
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Mock Badge */}
      <MockBadge storageKey='mock-badge-shopify' />

      {/* Back Button & Header */}
      <div className='mb-6'>
        <Link
          to='/integrations'
          className='inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span className='text-sm'>Entegrasyonlara Dön</span>
        </Link>

        <div className='bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <div className='text-5xl'>🛍️</div>
              <div>
                <h1 className='text-3xl font-bold text-white mb-1'>Shopify</h1>
                <p className='text-white/80'>
                  E-ticaret platformu entegrasyonu
                </p>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                mockShopifyConnection.isConnected
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {mockShopifyConnection.isConnected ? (
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  <span>Bağlı</span>
                </div>
              ) : (
                <span>Bağlı Değil</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='mb-6 flex items-center gap-2 overflow-x-auto pb-2'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            {/* Stats Grid */}
            <div className='grid grid-cols-4 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>
                    Toplam Senkronizasyon
                  </span>
                  <RefreshCw className='w-5 h-5 text-blue-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockShopifySyncStats.totalSyncs}
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>
                    Bugünkü Senkronizasyon
                  </span>
                  <Clock className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockShopifySyncStats.todaySyncs}
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Başarı Oranı</span>
                  <TrendingUp className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockShopifySyncStats.successRate}%
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Ortalama Süre</span>
                  <Database className='w-5 h-5 text-orange-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockShopifySyncStats.avgSyncDuration}s
                </p>
              </div>
            </div>

            {/* Connection Info */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Mağaza Bilgileri
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-white/60'>Mağaza URL</span>
                  <div className='flex items-center gap-2'>
                    <p className='text-white font-medium'>
                      {mockShopifyConnection.storeUrl}
                    </p>
                    <ExternalLink className='w-4 h-4 text-white/50' />
                  </div>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Mağaza Adı</span>
                  <p className='text-white font-medium'>
                    {mockShopifyConnection.storeName}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Plan</span>
                  <p className='text-white font-medium'>
                    {mockShopifyConnection.planName}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>API Versiyon</span>
                  <p className='text-white font-medium'>
                    {mockShopifyConnection.apiVersion}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Son Test</span>
                  <p className='text-white font-medium'>
                    {mockShopifyConnection.lastTest.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Sync History */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Son Senkronizasyonlar
              </h2>
              <div className='space-y-3'>
                {mockShopifySyncHistory.slice(0, 5).map(sync => (
                  <div
                    key={sync.id}
                    className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sync.status)}`}
                      >
                        {sync.status === 'completed'
                          ? 'Başarılı'
                          : sync.status === 'failed'
                            ? 'Başarısız'
                            : 'Kısmi'}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-white'>
                          {getOperationLabel(sync.operation)}
                        </p>
                        <p className='text-xs text-white/50'>
                          {sync.type === 'webhook'
                            ? '🔔 Webhook'
                            : sync.type === 'automatic'
                              ? '⚡ Otomatik'
                              : '👤 Manuel'}{' '}
                          • {sync.timestamp.toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-white'>
                        {sync.recordsProcessed} kayıt
                      </p>
                      <p className='text-xs text-white/50'>{sync.duration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Bağlantı Ayarları
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Mağaza URL
                </label>
                <input
                  type='text'
                  value={mockShopifyConnection.storeUrl}
                  readOnly
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  API Key
                </label>
                <input
                  type='password'
                  value='••••••••••••'
                  readOnly
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Admin API Access Token
                </label>
                <input
                  type='password'
                  value='••••••••••••'
                  readOnly
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                />
              </div>
              <button className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
                Bağlantıyı Test Et
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className='space-y-6'>
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Manuel Senkronizasyon
              </h2>
              <div className='grid grid-cols-3 gap-4'>
                <button className='p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all'>
                  <RefreshCw className='w-6 h-6 text-blue-400 mx-auto mb-2' />
                  <p className='text-sm font-medium text-white'>
                    Tam Senkronizasyon
                  </p>
                </button>
                <button className='p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all'>
                  <Database className='w-6 h-6 text-green-400 mx-auto mb-2' />
                  <p className='text-sm font-medium text-white'>
                    Stok Güncelle
                  </p>
                </button>
                <button className='p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all'>
                  <TrendingUp className='w-6 h-6 text-purple-400 mx-auto mb-2' />
                  <p className='text-sm font-medium text-white'>
                    Fiyat Güncelle
                  </p>
                </button>
              </div>
            </div>

            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Senkronizasyon Geçmişi
              </h2>
              <div className='space-y-3'>
                {mockShopifySyncHistory.map(sync => (
                  <div
                    key={sync.id}
                    className='p-4 bg-white/5 rounded-lg border border-white/10'
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sync.status)}`}
                        >
                          {sync.status === 'completed'
                            ? 'Başarılı'
                            : sync.status === 'failed'
                              ? 'Başarısız'
                              : 'Kısmi'}
                        </div>
                        <span className='text-sm font-medium text-white'>
                          {getOperationLabel(sync.operation)}
                        </span>
                        <span className='text-xs text-white/50'>
                          {sync.type === 'webhook'
                            ? '🔔'
                            : sync.type === 'automatic'
                              ? '⚡'
                              : '👤'}
                        </span>
                      </div>
                      <span className='text-xs text-white/50'>
                        {sync.timestamp.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <div className='grid grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-white/60'>İşlenen</span>
                        <p className='text-white font-medium'>
                          {sync.recordsProcessed}
                        </p>
                      </div>
                      <div>
                        <span className='text-white/60'>Başarılı</span>
                        <p className='text-green-400 font-medium'>
                          {sync.successCount}
                        </p>
                      </div>
                      <div>
                        <span className='text-white/60'>Başarısız</span>
                        <p className='text-red-400 font-medium'>
                          {sync.failedCount}
                        </p>
                      </div>
                      <div>
                        <span className='text-white/60'>Süre</span>
                        <p className='text-white font-medium'>
                          {sync.duration}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Ürün Eşleştirme Kuralları
            </h2>
            <p className='text-white/70 mb-6'>
              Shopify ve Otoniq arasında ürün eşleştirme kurallarını yönetin.
              Otomatik eşleştirme ve manuel eşleştirme seçenekleri mevcuttur.
            </p>
            <div className='space-y-4'>
              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      SKU Bazlı Otomatik Eşleştirme
                    </p>
                    <p className='text-xs text-white/50'>
                      SKU kodlarına göre otomatik ürün eşleştirme
                    </p>
                  </div>
                  <div className='w-12 h-6 bg-green-600 rounded-full relative'>
                    <div className='absolute right-1 top-1 w-4 h-4 bg-white rounded-full'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'webhooks' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-white'>Webhooks</h2>
              <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm'>
                + Yeni Webhook
              </button>
            </div>
            <p className='text-white/70 mb-6'>
              Shopify webhooklarını yönetin. Webhooklar sayesinde ürün ve
              sipariş değişikliklerini gerçek zamanlı olarak alabilirsiniz.
            </p>
            <div className='space-y-3'>
              {mockShopifyWebhooks.map(webhook => (
                <div
                  key={webhook.id}
                  className='p-4 bg-white/5 rounded-lg border border-white/10'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='text-sm font-medium text-white'>
                          {getWebhookTopicLabel(webhook.topic)}
                        </span>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            webhook.isActive
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {webhook.isActive ? 'Aktif' : 'Pasif'}
                        </div>
                      </div>
                      <p className='text-xs text-white/50 mb-1'>
                        Topic: {webhook.topic}
                      </p>
                      <p className='text-xs text-white/50 mb-1'>
                        Endpoint: {webhook.address}
                      </p>
                      <p className='text-xs text-white/50'>
                        Oluşturma:{' '}
                        {webhook.createdAt.toLocaleDateString('tr-TR')}
                        {webhook.lastTriggered &&
                          ` • Son tetikleme: ${webhook.lastTriggered.toLocaleString('tr-TR')}`}
                      </p>
                    </div>
                    <button className='text-red-400 hover:text-red-300 text-sm'>
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Sistem Logları
            </h2>
            <div className='space-y-3'>
              {mockShopifyLogs.map(log => (
                <div
                  key={log.id}
                  className='p-4 bg-white/5 rounded-lg border border-white/10'
                >
                  <div className='flex items-start gap-3'>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(log.level)}`}
                    >
                      {log.level.toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-1'>
                        <p className='text-sm font-medium text-white'>
                          {log.message}
                        </p>
                        <span className='text-xs text-white/50'>
                          {log.timestamp.toLocaleTimeString('tr-TR')}
                        </span>
                      </div>
                      {log.details && (
                        <p className='text-xs text-white/60'>{log.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyIntegrationPage;
