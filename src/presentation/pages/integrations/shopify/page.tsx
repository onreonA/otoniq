import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
  Save,
  TestTube,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ShopifyService,
  ShopifyConfig,
} from '../../../../infrastructure/services/ShopifyService';
import { useAuth } from '../../../hooks/useAuth';

type TabType =
  | 'overview'
  | 'settings'
  | 'sync'
  | 'mapping'
  | 'logs'
  | 'webhooks';

const ShopifyIntegrationPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // State management
  const [shopifyService, setShopifyService] = useState<ShopifyService | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'error'
  >('disconnected');

  // Configuration state
  const [config, setConfig] = useState<ShopifyConfig>({
    shop: '',
    accessToken: '',
    apiVersion: '2023-10',
  });

  // Stats state
  const [stats, setStats] = useState({
    totalSyncs: 0,
    todaySyncs: 0,
    successRate: 0,
    avgSyncDuration: 0,
  });

  // Sync history state
  const [syncHistory, setSyncHistory] = useState<any[]>([]);

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);

  // Supabase client (singleton)
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // Password visibility state
  const [showAccessToken, setShowAccessToken] = useState(false);

  // Initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      setSupabaseClient(client);
    };
    initSupabase();
  }, []);

  // Load configuration on mount
  useEffect(() => {
    if (supabaseClient) {
      loadConfiguration();
      loadLogs();
    }
  }, [supabaseClient]);

  // Load logs from database
  const loadLogs = async () => {
    try {
      if (!userProfile?.tenant_id || !supabaseClient) return;

      const { data, error } = await supabaseClient
        .from('integration_logs')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('integration_type', 'shopify')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to load logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  // Save log to database
  const saveLogToDatabase = async (logData: {
    level: string;
    message: string;
    type: string;
    details: any;
  }) => {
    try {
      if (!userProfile?.tenant_id || !supabaseClient) return;

      const { error } = await supabaseClient.from('integration_logs').insert({
        tenant_id: userProfile.tenant_id,
        integration_type: 'shopify',
        log_level: logData.level,
        message: logData.message,
        log_type: logData.type,
        details: logData.details,
      });

      if (error) {
        console.error('Failed to save log:', error);
        return;
      }

      // Reload logs
      await loadLogs();
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  };

  // Load configuration from database
  const loadConfiguration = async () => {
    try {
      if (!userProfile?.tenant_id || !supabaseClient) {
        console.log('No tenant ID or Supabase client available');
        return;
      }

      // Load from database via Supabase
      const { data, error } = await supabaseClient
        .from('tenant_integrations')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('integration_type', 'shopify')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load Shopify configuration:', error);
        return;
      }

      if (data && data.config) {
        const parsedConfig = JSON.parse(data.config);
        setConfig(parsedConfig);

        // Initialize Shopify service
        const service = new ShopifyService(parsedConfig);
        setShopifyService(service);

        // Test connection
        await testConnection(service);
      }
    } catch (error) {
      console.error('Failed to load Shopify configuration:', error);
    }
  };

  // Test Shopify connection
  const testConnection = async (service?: ShopifyService) => {
    const serviceToTest = service || shopifyService;
    if (!serviceToTest) return;

    setIsLoading(true);
    try {
      const connected = await serviceToTest.testConnection();
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'error');

      if (connected) {
        toast.success('Shopify bağlantısı başarılı!');
        await loadStats();

        // Başarılı bağlantı logu
        await saveLogToDatabase({
          level: 'info',
          message: 'Shopify bağlantısı başarılı',
          type: 'connection',
          details: {
            operation: 'connection_test',
            status: 'success',
          },
        });
      } else {
        toast.error('Shopify bağlantısı başarısız!');

        // Başarısız bağlantı logu
        await saveLogToDatabase({
          level: 'error',
          message: 'Shopify bağlantısı başarısız',
          type: 'connection',
          details: {
            operation: 'connection_test',
            status: 'failed',
          },
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      toast.error('Bağlantı testi başarısız!');

      // Hata logu
      await saveLogToDatabase({
        level: 'error',
        message: `Bağlantı testi başarısız: ${error}`,
        type: 'connection',
        details: {
          operation: 'connection_test',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    // Mock stats for now - will be replaced with real data
    setStats({
      totalSyncs: 0,
      todaySyncs: 0,
      successRate: 0,
      avgSyncDuration: 0,
    });
  };

  // Save configuration
  const saveConfiguration = async () => {
    try {
      if (!userProfile?.tenant_id) {
        toast.error('Kullanıcı bilgileri bulunamadı!');
        return;
      }

      // Validate configuration
      if (!config.shop || !config.accessToken) {
        toast.error('Lütfen tüm alanları doldurun!');
        return;
      }

      // Save to database via Supabase
      if (!supabaseClient) {
        toast.error('Supabase client not available!');
        return;
      }

      const { error } = await supabaseClient.from('tenant_integrations').upsert(
        {
          tenant_id: userProfile.tenant_id,
          integration_type: 'shopify',
          config: JSON.stringify(config),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'tenant_id,integration_type',
        }
      );

      if (error) {
        console.error('Failed to save Shopify configuration:', error);
        toast.error('Ayarlar kaydedilemedi!');
        return;
      }

      // Initialize new service
      const service = new ShopifyService(config);
      setShopifyService(service);

      // Test connection
      await testConnection(service);

      toast.success('Shopify ayarları kaydedildi!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Ayarlar kaydedilemedi!');
    }
  };

  // Manual sync functions
  const handleFullSync = async () => {
    if (!shopifyService || !isConnected) {
      toast.error('Shopify bağlantısı yok!');
      return;
    }

    console.log('🔄 Starting full sync...');
    setIsLoading(true);
    try {
      const result = await shopifyService.fullSync();
      console.log('✅ Full sync result:', result);

      toast.success(
        `Tam senkronizasyon tamamlandı! ${result.count} ürün işlendi.`
      );

      // Sync history'ye ekle
      const newHistoryItem = {
        id: Date.now(),
        type: 'full',
        status: 'success',
        message: `${result.count} ürün senkronize edildi`,
        timestamp: new Date().toISOString(),
        processed: result.count,
        successful: result.count,
        failed: 0,
        duration: Math.floor(Math.random() * 30) + 10, // Mock duration in seconds
      };

      console.log('📝 Adding to sync history:', newHistoryItem);
      setSyncHistory(prev => {
        const updated = [newHistoryItem, ...prev.slice(0, 9)];
        console.log('📝 Updated sync history:', updated);
        return updated;
      });

      // Log ekle
      await saveLogToDatabase({
        level: 'info',
        message: `Tam senkronizasyon tamamlandı: ${result.count} ürün işlendi`,
        type: 'sync',
        details: {
          operation: 'full_sync',
          products_processed: result.count,
          duration: newHistoryItem.duration,
        },
      });
    } catch (error) {
      console.error('Full sync failed:', error);
      toast.error('Senkronizasyon başarısız!');

      // Sync history'ye ekle
      const newHistoryItem = {
        id: Date.now(),
        type: 'full',
        status: 'error',
        message: 'Senkronizasyon başarısız',
        timestamp: new Date().toISOString(),
        processed: 0,
        successful: 0,
        failed: 1,
        duration: 0,
      };

      console.log('📝 Adding error to sync history:', newHistoryItem);
      setSyncHistory(prev => {
        const updated = [newHistoryItem, ...prev.slice(0, 9)];
        console.log('📝 Updated sync history (error):', updated);
        return updated;
      });

      // Error log ekle
      await saveLogToDatabase({
        level: 'error',
        message: `Tam senkronizasyon başarısız: ${error}`,
        type: 'sync',
        details: {
          operation: 'full_sync',
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                isConnected
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {isConnected ? (
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
                  {stats.totalSyncs}
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
                  {stats.todaySyncs}
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Başarı Oranı</span>
                  <TrendingUp className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {stats.successRate}%
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Ortalama Süre</span>
                  <Database className='w-5 h-5 text-orange-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {stats.avgSyncDuration}s
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
                      {config.shop ? `https://${config.shop}` : 'Bağlantı yok'}
                    </p>
                    {config.shop && (
                      <ExternalLink className='w-4 h-4 text-white/50' />
                    )}
                  </div>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Mağaza Adı</span>
                  <p className='text-white font-medium'>
                    {config.shop || 'Bağlantı yok'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Plan</span>
                  <p className='text-white font-medium'>
                    {isConnected ? 'Bağlı' : 'Bağlı Değil'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>API Versiyon</span>
                  <p className='text-white font-medium'>
                    {config.apiVersion || '2023-10'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Son Test</span>
                  <p className='text-white font-medium'>
                    {isConnected ? 'Başarılı' : 'Test edilmedi'}
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
                {syncHistory.length === 0 ? (
                  <div className='text-center py-4'>
                    <p className='text-white/60'>Henüz senkronizasyon yok</p>
                    <p className='text-white/40 text-sm'>
                      İlk senkronizasyonu başlatın
                    </p>
                  </div>
                ) : (
                  syncHistory.slice(0, 5).map(sync => (
                    <div
                      key={sync.id}
                      className='flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10'
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            sync.status === 'success' ||
                            sync.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : sync.status === 'error' ||
                                  sync.status === 'failed'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {sync.status === 'success' ||
                          sync.status === 'completed'
                            ? 'Başarılı'
                            : sync.status === 'error' ||
                                sync.status === 'failed'
                              ? 'Başarısız'
                              : 'Kısmi'}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {sync.type === 'full'
                              ? 'Tam Senkronizasyon'
                              : sync.type === 'stock'
                                ? 'Stok Güncelleme'
                                : sync.type === 'price'
                                  ? 'Fiyat Güncelleme'
                                  : sync.operation || 'Bilinmeyen'}
                          </p>
                          <p className='text-xs text-white/50'>
                            {sync.type === 'webhook'
                              ? '🔔 Webhook'
                              : sync.type === 'automatic'
                                ? '⚡ Otomatik'
                                : '👤 Manuel'}{' '}
                            • {new Date(sync.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm text-white'>
                          {sync.processed || sync.recordsProcessed || 0} kayıt
                        </p>
                        <p className='text-xs text-white/50'>
                          {sync.duration || 0}s
                        </p>
                      </div>
                    </div>
                  ))
                )}
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
                  Shop Name
                </label>
                <input
                  type='text'
                  placeholder='shop-name.myshopify.com'
                  value={config.shop}
                  onChange={e => setConfig({ ...config, shop: e.target.value })}
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Access Token
                </label>
                <div className='relative'>
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    placeholder='shpat_xxx...'
                    value={config.accessToken}
                    onChange={e =>
                      setConfig({ ...config, accessToken: e.target.value })
                    }
                    className='w-full px-4 py-2 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                  <button
                    type='button'
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors'
                  >
                    {showAccessToken ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  API Version
                </label>
                <select
                  value={config.apiVersion}
                  onChange={e =>
                    setConfig({ ...config, apiVersion: e.target.value })
                  }
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value='2023-10'>2023-10</option>
                  <option value='2023-07'>2023-07</option>
                  <option value='2023-04'>2023-04</option>
                  <option value='2023-01'>2023-01</option>
                </select>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={saveConfiguration}
                  disabled={isLoading}
                  className='flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  <Save className='w-4 h-4' />
                  Kaydet
                </button>
                <button
                  onClick={() => testConnection()}
                  disabled={isLoading}
                  className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  <TestTube className='w-4 h-4' />
                  Bağlantıyı Test Et
                </button>
              </div>
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
                <button
                  onClick={handleFullSync}
                  disabled={isLoading || !isConnected}
                  className='p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <RefreshCw
                    className={`w-6 h-6 text-blue-400 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
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
                {syncHistory.length === 0 ? (
                  <div className='text-center py-8'>
                    <p className='text-white/60'>Henüz senkronizasyon yok</p>
                    <p className='text-white/40 text-sm'>
                      İlk senkronizasyonu başlatın
                    </p>
                  </div>
                ) : (
                  syncHistory.map(sync => (
                    <div
                      key={sync.id}
                      className='p-4 bg-white/5 rounded-lg border border-white/10'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              sync.status === 'success' ||
                              sync.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : sync.status === 'error' ||
                                    sync.status === 'failed'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }`}
                          >
                            {sync.status === 'success' ||
                            sync.status === 'completed'
                              ? 'Başarılı'
                              : sync.status === 'error' ||
                                  sync.status === 'failed'
                                ? 'Başarısız'
                                : 'Kısmi'}
                          </div>
                          <span className='text-sm font-medium text-white'>
                            {sync.type === 'full'
                              ? 'Tam Senkronizasyon'
                              : sync.type === 'stock'
                                ? 'Stok Güncelleme'
                                : sync.type === 'price'
                                  ? 'Fiyat Güncelleme'
                                  : sync.operation || 'Bilinmeyen'}
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
                          {new Date(sync.timestamp).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className='grid grid-cols-4 gap-4 text-sm'>
                        <div>
                          <span className='text-white/60'>İşlenen</span>
                          <p className='text-white font-medium'>
                            {sync.processed || sync.recordsProcessed || 0}
                          </p>
                        </div>
                        <div>
                          <span className='text-white/60'>Başarılı</span>
                          <p className='text-green-400 font-medium'>
                            {sync.successful || sync.successCount || 0}
                          </p>
                        </div>
                        <div>
                          <span className='text-white/60'>Başarısız</span>
                          <p className='text-red-400 font-medium'>
                            {sync.failed || sync.failedCount || 0}
                          </p>
                        </div>
                        <div>
                          <span className='text-white/60'>Süre</span>
                          <p className='text-white font-medium'>
                            {sync.duration || 0}s
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Barkod Bazlı Ürün Eşleştirme
            </h2>
            <p className='text-white/70 mb-6'>
              Shopify ürünleri barkod kodu ile Otoniq ürünleriyle eşleştirilir.
              Aynı barkoda sahip ürünler tüm platformlarda senkronize edilir.
            </p>

            {/* Barkod Mapping Status */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm font-medium text-white'>
                    Eşleşen Ürünler
                  </span>
                </div>
                <p className='text-2xl font-bold text-white'>0</p>
                <p className='text-xs text-white/50'>Barkod ile eşleşen</p>
              </div>

              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  <span className='text-sm font-medium text-white'>
                    Eşleşmeyen Ürünler
                  </span>
                </div>
                <p className='text-2xl font-bold text-white'>0</p>
                <p className='text-xs text-white/50'>Barkod eksik</p>
              </div>

              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-sm font-medium text-white'>
                    Toplam Ürün
                  </span>
                </div>
                <p className='text-2xl font-bold text-white'>0</p>
                <p className='text-xs text-white/50'>Shopify'dan gelen</p>
              </div>
            </div>

            {/* Mapping Rules */}
            <div className='space-y-4'>
              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Barkod Bazlı Otomatik Eşleştirme
                    </p>
                    <p className='text-xs text-white/50'>
                      Barkod kodu ile otomatik ürün eşleştirme (Öncelik: 1)
                    </p>
                  </div>
                  <div className='w-12 h-6 bg-green-600 rounded-full relative'>
                    <div className='absolute right-1 top-1 w-4 h-4 bg-white rounded-full'></div>
                  </div>
                </div>
              </div>

              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      SKU Bazlı Yedek Eşleştirme
                    </p>
                    <p className='text-xs text-white/50'>
                      Barkod yoksa SKU ile eşleştirme (Öncelik: 2)
                    </p>
                  </div>
                  <div className='w-12 h-6 bg-yellow-600 rounded-full relative'>
                    <div className='absolute right-1 top-1 w-4 h-4 bg-white rounded-full'></div>
                  </div>
                </div>
              </div>

              <div className='p-4 bg-white/5 rounded-lg border border-white/10'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Manuel Eşleştirme
                    </p>
                    <p className='text-xs text-white/50'>
                      Otomatik eşleşmeyen ürünleri manuel eşleştir
                    </p>
                  </div>
                  <button className='px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors'>
                    Yönet
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Mappings */}
            <div className='mt-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Son Eşleştirmeler
              </h3>
              <div className='space-y-2'>
                <div className='text-center py-8'>
                  <p className='text-white/60'>Henüz eşleştirme yok</p>
                  <p className='text-white/40 text-sm'>
                    Shopify'dan ürün senkronizasyonu yaptıktan sonra burada
                    görünecek
                  </p>
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
              {logs.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-white/60'>Henüz log yok</p>
                  <p className='text-white/40 text-sm'>
                    Sistem aktiviteleri burada görünecek
                  </p>
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className='p-4 bg-white/5 rounded-lg border border-white/10'
                  >
                    <div className='flex items-start gap-3'>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          (log.log_level || log.level) === 'error'
                            ? 'bg-red-500/20 text-red-400'
                            : (log.log_level || log.level) === 'warning'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : (log.log_level || log.level) === 'info'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {(log.log_level || log.level).toUpperCase()}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-start justify-between mb-1'>
                          <p className='text-sm font-medium text-white'>
                            {log.message}
                          </p>
                          <span className='text-xs text-white/50'>
                            {new Date(
                              log.created_at || log.timestamp
                            ).toLocaleTimeString('tr-TR')}
                          </span>
                        </div>
                        {log.details && (
                          <div className='text-xs text-white/60 mt-2'>
                            <div className='bg-white/5 p-2 rounded text-xs font-mono'>
                              {Object.entries(log.details).map(
                                ([key, value]) => (
                                  <div key={key} className='flex gap-2'>
                                    <span className='text-blue-400'>
                                      {key}:
                                    </span>
                                    <span className='text-white'>
                                      {String(value)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyIntegrationPage;
