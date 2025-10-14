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
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
} from 'lucide-react';
import {
  mockOdooConnection,
  mockOdooSyncStats,
  mockOdooSyncHistory,
  mockOdooLogs,
  getOperationLabel,
  getStatusColor,
  getLogLevelColor,
} from './mocks/odooMockData';
import { MockBadge } from '../../../components/common/MockBadge';

type TabType = 'overview' | 'settings' | 'sync' | 'mapping' | 'logs';

const OdooIntegrationPage = () => {
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
      id: 'logs',
      label: 'Loglar & Sorun Giderme',
      icon: <FileText className='w-4 h-4' />,
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Mock Badge */}
      <MockBadge storageKey='mock-badge-odoo' />

      {/* Back Button & Header */}
      <div className='mb-6'>
        <Link
          to='/integrations'
          className='inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors'
        >
          <ArrowLeft className='w-4 h-4' />
          <span className='text-sm'>Entegrasyonlara Dön</span>
        </Link>

        <div className='bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              <div className='text-5xl'>🏢</div>
              <div>
                <h1 className='text-3xl font-bold text-white mb-1'>Odoo ERP</h1>
                <p className='text-white/80'>
                  Kurumsal kaynak planlama sistemi entegrasyonu
                </p>
              </div>
            </div>

            <div
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                mockOdooConnection.isConnected
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {mockOdooConnection.isConnected ? (
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
                ? 'bg-orange-600 text-white shadow-lg'
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
                  {mockOdooSyncStats.totalSyncs}
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
                  {mockOdooSyncStats.todaySyncs}
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Başarı Oranı</span>
                  <TrendingUp className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockOdooSyncStats.successRate}%
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Ortalama Süre</span>
                  <Database className='w-5 h-5 text-orange-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockOdooSyncStats.avgSyncDuration}s
                </p>
              </div>
            </div>

            {/* Connection Info */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>
                Bağlantı Bilgileri
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-white/60'>Server URL</span>
                  <p className='text-white font-medium'>
                    {mockOdooConnection.serverUrl}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Database</span>
                  <p className='text-white font-medium'>
                    {mockOdooConnection.database}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Kullanıcı</span>
                  <p className='text-white font-medium'>
                    {mockOdooConnection.username}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Versiyon</span>
                  <p className='text-white font-medium'>
                    {mockOdooConnection.version}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Son Test</span>
                  <p className='text-white font-medium'>
                    {mockOdooConnection.lastTest.toLocaleString('tr-TR')}
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
                {mockOdooSyncHistory.slice(0, 5).map(sync => (
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
                          {sync.timestamp.toLocaleString('tr-TR')}
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
                  Server URL
                </label>
                <input
                  type='text'
                  value={mockOdooConnection.serverUrl}
                  readOnly
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Database
                </label>
                <input
                  type='text'
                  value={mockOdooConnection.database}
                  readOnly
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Kullanıcı Adı
                </label>
                <input
                  type='text'
                  value={mockOdooConnection.username}
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
              <button className='px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors'>
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
                {mockOdooSyncHistory.map(sync => (
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
              Odoo ve Otoniq arasında ürün eşleştirme kurallarını yönetin.
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

        {activeTab === 'logs' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Sistem Logları
            </h2>
            <div className='space-y-3'>
              {mockOdooLogs.map(log => (
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

export default OdooIntegrationPage;
