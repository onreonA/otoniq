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
  AlertCircle,
  Clock,
  TrendingUp,
  Database,
  Save,
  TestTube,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  OdooService,
  OdooConfig,
} from '../../../../infrastructure/services/OdooService';
import { useAuth } from '../../../hooks/useAuth';

type TabType = 'overview' | 'settings' | 'sync' | 'mapping' | 'logs';

const OdooIntegrationPage = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // State management
  const [odooService, setOdooService] = useState<OdooService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'error'
  >('disconnected');

  // Configuration state
  const [config, setConfig] = useState<OdooConfig>({
    url: '',
    port: 8069,
    db: '',
    username: '',
    password: '',
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

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Supabase client (singleton)
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

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
      loadSyncHistory();
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
        .eq('integration_type', 'odoo')
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

  // Load sync history from database
  const loadSyncHistory = async () => {
    try {
      if (!userProfile?.tenant_id || !supabaseClient) return;

      const { data, error } = await supabaseClient
        .from('integration_sync_history')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('integration_type', 'odoo')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Failed to load sync history:', error);
        return;
      }

      if (data) {
        const formattedHistory = data.map(sync => ({
          id: sync.id,
          type: sync.sync_type,
          status: sync.status,
          message: `${sync.items_successful || 0} başarılı, ${sync.items_failed || 0} başarısız`,
          timestamp: sync.completed_at,
          processed: sync.items_processed || 0,
          successful: sync.items_successful || 0,
          failed: sync.items_failed || 0,
          duration: sync.duration_seconds || 0,
        }));
        setSyncHistory(formattedHistory);
        console.log(
          '📋 Loaded sync history from database:',
          formattedHistory.length
        );
      }
    } catch (error) {
      console.error('Failed to load sync history:', error);
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
        integration_type: 'odoo',
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
        .eq('integration_type', 'odoo')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load Odoo configuration:', error);
        return;
      }

      if (data && data.config) {
        const parsedConfig = JSON.parse(data.config);
        setConfig(parsedConfig);

        // Initialize Odoo service
        const service = new OdooService(parsedConfig);
        setOdooService(service);

        // Test connection
        await testConnection(service);
      }
    } catch (error) {
      console.error('Failed to load Odoo configuration:', error);
    }
  };

  // Test Odoo connection
  const testConnection = async (service?: OdooService) => {
    const serviceToTest = service || odooService;
    if (!serviceToTest) return;

    setIsLoading(true);
    try {
      const connected = await serviceToTest.connect();
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'error');

      if (connected) {
        toast.success('Odoo bağlantısı başarılı!');
        await loadStats();

        // Başarılı bağlantı logu
        await saveLogToDatabase({
          level: 'info',
          message: 'Odoo bağlantısı başarılı',
          type: 'connection',
          details: {
            operation: 'connection_test',
            status: 'success',
          },
        });
      } else {
        toast.error('Odoo bağlantısı başarısız!');

        // Başarısız bağlantı logu
        await saveLogToDatabase({
          level: 'error',
          message: 'Odoo bağlantısı başarısız',
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

  // Save configuration
  const saveConfiguration = async () => {
    try {
      if (!userProfile?.tenant_id) {
        toast.error('Kullanıcı bilgileri bulunamadı!');
        return;
      }

      // Validate configuration
      if (!config.url || !config.db || !config.username || !config.password) {
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
          integration_type: 'odoo',
          config: JSON.stringify(config),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'tenant_id,integration_type',
        }
      );

      if (error) {
        console.error('Failed to save Odoo configuration:', error);
        toast.error('Ayarlar kaydedilemedi!');
        return;
      }

      // Initialize new service
      const service = new OdooService(config);
      setOdooService(service);

      // Test connection
      await testConnection(service);

      toast.success('Odoo ayarları kaydedildi!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Ayarlar kaydedilemedi!');
    }
  };

  // Load statistics
  const loadStats = async () => {
    // Mock stats for now - replace with real API calls
    setStats({
      totalSyncs: 45,
      todaySyncs: 3,
      successRate: 95,
      avgSyncDuration: 12,
    });
  };

  // Manual sync functions
  const handleFullSync = async () => {
    if (!odooService || !isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    if (!supabaseClient || !userProfile?.tenant_id) {
      toast.error('Kullanıcı bilgileri bulunamadı!');
      return;
    }

    console.log('🔄 Starting full sync...');
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const result = await odooService.fullSync();
      console.log('✅ Full sync result:', result);

      // Transform products
      const transformedProducts = result.products.map((product: any) => ({
        tenant_id: userProfile.tenant_id,
        name: product.name,
        sku: product.default_code || `ODOO-${product.id}`,
        barcode: product.barcode || null,
        vendor: null,
        description: product.description || product.description_sale || '',
        price: product.list_price,
        compare_at_price: null,
        cost: product.standard_price,
        categories: Array.isArray(product.categ_id)
          ? [product.categ_id[1]]
          : ['Uncategorized'],
        status: product.active ? 'active' : 'inactive',
        published_at: product.create_date
          ? new Date(product.create_date)
          : null,
        weight: product.weight || null,
        volume: product.volume || null,
        requires_shipping: product.type !== 'service',
        is_taxable: true,
        sale_ok: product.sale_ok !== false,
        purchase_ok: product.purchase_ok !== false,
        inventory_policy: 'continue',
        metadata: {
          odoo_id: product.id,
          odoo_data: product,
          source: 'odoo',
          synced_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      }));

      // Split products: with barcode vs without barcode
      const productsWithBarcode = transformedProducts.filter(p => p.barcode);
      const productsWithoutBarcode = transformedProducts.filter(
        p => !p.barcode
      );

      let successCount = 0;
      let failCount = 0;

      // Upsert products with barcode (use barcode as conflict key)
      if (productsWithBarcode.length > 0) {
        const { error: barcodeError } = await supabaseClient
          .from('products')
          .upsert(productsWithBarcode, { onConflict: 'tenant_id,barcode' });

        if (barcodeError) {
          console.error('Error upserting products with barcode:', barcodeError);
          failCount += productsWithBarcode.length;
        } else {
          successCount += productsWithBarcode.length;
        }
      }

      // Upsert products without barcode (use SKU as fallback)
      if (productsWithoutBarcode.length > 0) {
        const { error: skuError } = await supabaseClient
          .from('products')
          .upsert(productsWithoutBarcode, { onConflict: 'tenant_id,sku' });

        if (skuError) {
          console.error('Error upserting products without barcode:', skuError);
          failCount += productsWithoutBarcode.length;
        } else {
          successCount += productsWithoutBarcode.length;
        }
      }

      // Create platform mappings for products with barcode
      for (const product of result.products.filter((p: any) => p.barcode)) {
        try {
          await supabaseClient.from('product_platform_mappings').upsert(
            {
              tenant_id: userProfile.tenant_id,
              product_id: null,
              platform: 'odoo',
              external_id: product.id.toString(),
              external_data: {
                odoo_id: product.id,
                odoo_data: product,
                source: 'odoo',
                synced_at: new Date().toISOString(),
              },
              sync_status: 'active',
              platform_stock_quantity: null,
              platform_price: product.list_price,
              platform_status: product.active ? 'active' : 'inactive',
              external_created_at: product.create_date
                ? new Date(product.create_date)
                : null,
              external_updated_at: product.write_date
                ? new Date(product.write_date)
                : null,
            },
            {
              onConflict: 'tenant_id,platform,external_id',
            }
          );
        } catch (mappingError) {
          console.error('Failed to create platform mapping:', mappingError);
        }
      }

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Sync history'ye kaydet
      const { data: syncHistory, error: syncError } = await supabaseClient
        .from('integration_sync_history')
        .insert({
          tenant_id: userProfile.tenant_id,
          integration_type: 'odoo',
          sync_type: 'full',
          status: failCount === 0 ? 'completed' : 'partial',
          items_processed: result.count,
          items_successful: successCount,
          items_failed: failCount,
          duration_seconds: duration,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (syncError) {
        console.error('Failed to save sync history:', syncError);
      }

      // Log ekle
      await saveLogToDatabase({
        level: failCount === 0 ? 'info' : 'warning',
        message: `Tam senkronizasyon tamamlandı: ${successCount} başarılı, ${failCount} başarısız`,
        type: 'sync',
        details: {
          operation: 'full_sync',
          products_count: result.count,
          successful: successCount,
          failed: failCount,
          duration: duration,
        },
      });

      toast.success(
        `Tam senkronizasyon tamamlandı! ${successCount} ürün senkronize edildi${failCount > 0 ? `, ${failCount} hata` : ''}.`
      );

      // UI state'i güncelle
      await loadSyncHistory();
      await loadLogs();
    } catch (error) {
      console.error('Full sync failed:', error);
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Sync history'ye kaydet (hata durumu)
      await supabaseClient.from('integration_sync_history').insert({
        tenant_id: userProfile.tenant_id,
        integration_type: 'odoo',
        sync_type: 'full',
        status: 'failed',
        items_processed: 0,
        items_successful: 0,
        items_failed: 1,
        duration_seconds: duration,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString(),
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

      toast.error(
        `Senkronizasyon başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );

      // UI state'i güncelle
      await loadSyncHistory();
      await loadLogs();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockSync = async () => {
    if (!odooService || !isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await odooService.stockSync();
      toast.success(
        `Stok senkronizasyonu tamamlandı! ${result.updated} ürün güncellendi.`
      );

      // Sync history'ye ekle
      setSyncHistory(prev => [
        {
          id: Date.now(),
          type: 'stock',
          status: 'success',
          message: `${result.updated} ürün stok güncellendi`,
          timestamp: new Date().toISOString(),
          processed: result.updated,
          successful: result.updated,
          failed: 0,
          duration: Math.floor(Math.random() * 20) + 5,
        },
        ...prev.slice(0, 9),
      ]);

      // Log ekle
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `Stok senkronizasyonu tamamlandı: ${result.updated} ürün güncellendi`,
        type: 'sync',
        details: {
          operation: 'stock_sync',
          products_updated: result.updated,
        },
      };
      setLogs(prev => [logEntry, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Stock sync failed:', error);
      toast.error('Stok senkronizasyonu başarısız!');

      // Sync history'ye ekle
      setSyncHistory(prev => [
        {
          id: Date.now(),
          type: 'stock',
          status: 'error',
          message: 'Stok senkronizasyonu başarısız',
          timestamp: new Date().toISOString(),
          processed: 0,
          successful: 0,
          failed: 1,
          duration: 0,
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceSync = async () => {
    if (!odooService || !isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    setIsLoading(true);
    try {
      const result = await odooService.priceSync();
      toast.success(
        `Fiyat senkronizasyonu tamamlandı! ${result.updated} ürün güncellendi.`
      );

      // Sync history'ye ekle
      setSyncHistory(prev => [
        {
          id: Date.now(),
          type: 'price',
          status: 'success',
          message: `${result.updated} ürün fiyat güncellendi`,
          timestamp: new Date().toISOString(),
          processed: result.updated,
          successful: result.updated,
          failed: 0,
          duration: Math.floor(Math.random() * 15) + 3,
        },
        ...prev.slice(0, 9),
      ]);
    } catch (error) {
      console.error('Price sync failed:', error);
      toast.error('Fiyat senkronizasyonu başarısız!');

      // Sync history'ye ekle
      setSyncHistory(prev => [
        {
          id: Date.now(),
          type: 'price',
          status: 'error',
          message: 'Fiyat senkronizasyonu başarısız',
          timestamp: new Date().toISOString(),
          processed: 0,
          successful: 0,
          failed: 1,
          duration: 0,
        },
        ...prev.slice(0, 9),
      ]);
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
                connectionStatus === 'connected'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : connectionStatus === 'error'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}
            >
              {connectionStatus === 'connected' ? (
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  <span>Bağlı</span>
                </div>
              ) : connectionStatus === 'error' ? (
                <div className='flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4' />
                  <span>Hata</span>
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
                Bağlantı Bilgileri
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <span className='text-sm text-white/60'>Server URL</span>
                  <p className='text-white font-medium'>
                    {config.url || 'Ayarlanmamış'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Database</span>
                  <p className='text-white font-medium'>
                    {config.db || 'Ayarlanmamış'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Kullanıcı</span>
                  <p className='text-white font-medium'>
                    {config.username || 'Ayarlanmamış'}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Port</span>
                  <p className='text-white font-medium'>
                    {config.port || 8069}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-white/60'>Durum</span>
                  <p className='text-white font-medium'>
                    {connectionStatus === 'connected'
                      ? 'Bağlı'
                      : connectionStatus === 'error'
                        ? 'Hata'
                        : 'Bağlı Değil'}
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
                  <div className='text-center py-8'>
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
                            sync.status === 'completed'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : sync.status === 'failed'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          {sync.status === 'completed'
                            ? 'Başarılı'
                            : sync.status === 'failed'
                              ? 'Başarısız'
                              : 'Kısmi'}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {sync.operation}
                          </p>
                          <p className='text-xs text-white/50'>
                            {new Date(sync.timestamp).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm text-white'>
                          {sync.recordsProcessed} kayıt
                        </p>
                        <p className='text-xs text-white/50'>
                          {sync.duration}s
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
                  Server URL
                </label>
                <input
                  type='text'
                  value={config.url}
                  onChange={e => setConfig({ ...config, url: e.target.value })}
                  placeholder='https://your-odoo-server.com'
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Database
                </label>
                <input
                  type='text'
                  value={config.db}
                  onChange={e => setConfig({ ...config, db: e.target.value })}
                  placeholder='your_database_name'
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Kullanıcı Adı
                </label>
                <input
                  type='text'
                  value={config.username}
                  onChange={e =>
                    setConfig({ ...config, username: e.target.value })
                  }
                  placeholder='your_username'
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Şifre
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.password}
                    onChange={e =>
                      setConfig({ ...config, password: e.target.value })
                    }
                    placeholder='your_password'
                    className='w-full px-4 py-2 pr-12 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-white/80 mb-2'>
                  Port
                </label>
                <input
                  type='number'
                  value={config.port}
                  onChange={e =>
                    setConfig({ ...config, port: parseInt(e.target.value) })
                  }
                  placeholder='8069'
                  className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500'
                />
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={saveConfiguration}
                  disabled={isLoading}
                  className='flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50'
                >
                  <Save className='w-4 h-4' />
                  {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  onClick={() => testConnection()}
                  disabled={isLoading || !odooService}
                  className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  <TestTube className='w-4 h-4' />
                  {isLoading ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
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
                  disabled={!isConnected || isLoading}
                  className='p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <RefreshCw
                    className={`w-6 h-6 text-blue-400 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <p className='text-sm font-medium text-white'>
                    Tam Senkronizasyon
                  </p>
                </button>
                <button
                  onClick={handleStockSync}
                  disabled={!isConnected || isLoading}
                  className='p-4 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Database
                    className={`w-6 h-6 text-green-400 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <p className='text-sm font-medium text-white'>
                    Stok Güncelle
                  </p>
                </button>
                <button
                  onClick={handlePriceSync}
                  disabled={!isConnected || isLoading}
                  className='p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <TrendingUp
                    className={`w-6 h-6 text-purple-400 mx-auto mb-2 ${isLoading ? 'animate-spin' : ''}`}
                  />
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

export default OdooIntegrationPage;
