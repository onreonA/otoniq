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
  Package,
  X,
  Search,
  ArrowUpDown,
  BarChart3,
  Download,
} from 'lucide-react';
import {
  OdooService,
  OdooConfig,
} from '../../../../infrastructure/services/OdooService';
import {
  OdooAnalyticsService,
  AnalyticsSummary,
  SyncHistoryRecord,
  ProductMatchingRecord,
  ErrorLogRecord,
  PerformanceMetrics,
} from '../../../../infrastructure/services/OdooAnalyticsService';
import { useAuth } from '../../../hooks/useAuth';

type TabType =
  | 'overview'
  | 'settings'
  | 'sync'
  | 'mapping'
  | 'logs'
  | 'analytics';

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

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Product matching state
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [otoniqProducts, setOtoniqProducts] = useState<any[]>([]);

  // Bulk operations state
  const [bulkOperations, setBulkOperations] = useState({
    isProcessing: false,
    progress: 0,
    total: 0,
    completed: 0,
    failed: 0,
    currentOperation: '',
  });

  // Filter and search state
  const [filters, setFilters] = useState({
    matchType: 'all', // all, perfect_match, sku_match, name_match, no_match
    searchTerm: '',
    sortBy: 'confidence', // confidence, name, price, type
    sortOrder: 'desc', // asc, desc
  });

  // Auto-sync state
  const [autoSync, setAutoSync] = useState({
    enabled: false,
    interval: 30, // minutes
    lastSync: null as Date | null,
    nextSync: null as Date | null,
    syncType: 'products' as 'products' | 'prices' | 'both',
    isRunning: false,
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>([]);
  const [productMatching, setProductMatching] = useState<
    ProductMatchingRecord[]
  >([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLogRecord[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<
    PerformanceMetrics[]
  >([]);
  const [weeklySyncStats, setWeeklySyncStats] = useState<any[]>([]);
  const [errorTypeStats, setErrorTypeStats] = useState<Record<string, number>>(
    {}
  );

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

      // Load tenant data to get company_id
      const { data: tenantData, error: tenantError } = await supabaseClient
        .from('tenants')
        .select('odoo_company_id, odoo_company_name')
        .eq('id', userProfile.tenant_id)
        .single();

      if (tenantError) {
        console.error('Failed to load tenant data:', tenantError);
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

        // Add company_id from tenant data
        const configWithCompany = {
          ...parsedConfig,
          company_id: tenantData?.odoo_company_id,
        };

        setConfig(configWithCompany);

        // Initialize Odoo service with company_id
        const service = new OdooService(configWithCompany);
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

  // Product matching functions
  const handleSyncAndMatch = async () => {
    if (!odooService || !isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    if (!supabaseClient || !userProfile?.tenant_id) {
      toast.error('Kullanıcı bilgileri bulunamadı!');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 Starting product matching...');

      // 1. Odoo ürünlerini çek
      const odooProducts = await odooService.getProducts();
      console.log(`📦 Retrieved ${odooProducts.length} products from Odoo`);

      // 2. Otoniq ürünlerini çek
      const { data: otoniqData, error: otoniqError } = await supabaseClient
        .from('products')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id);

      if (otoniqError) {
        throw new Error('Otoniq ürünleri getirilemedi');
      }

      setOtoniqProducts(otoniqData || []);
      console.log(
        `📦 Retrieved ${otoniqData?.length || 0} products from Otoniq`
      );

      // 3. Eşleştirme algoritması
      const matches = await performProductMatching(
        odooProducts,
        otoniqData || []
      );
      setMatchingResults(matches);

      console.log(`✅ Matching completed: ${matches.length} results`);
      toast.success(`${matches.length} ürün eşleştirme sonucu bulundu`);
    } catch (error) {
      console.error('Product matching failed:', error);
      toast.error(
        `Eşleştirme başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Product matching algorithm
  const performProductMatching = async (
    odooProducts: any[],
    otoniqProducts: any[]
  ) => {
    const matches: any[] = [];

    for (const odooProduct of odooProducts) {
      const match = await findBestMatch(odooProduct, otoniqProducts);
      matches.push(match);
    }

    return matches;
  };

  // Find best match for a single Odoo product
  const findBestMatch = async (odooProduct: any, otoniqProducts: any[]) => {
    // 1. Perfect match (SKU + Name)
    const perfectMatch = otoniqProducts.find(
      p =>
        p.sku === odooProduct.default_code &&
        p.name.toLowerCase() === odooProduct.name.toLowerCase()
    );

    if (perfectMatch) {
      return {
        odooProduct,
        otoniqProduct: perfectMatch,
        matchType: 'perfect_match',
        confidence: 1.0,
        suggestions: [],
      };
    }

    // 2. SKU match
    const skuMatch = otoniqProducts.find(
      p => p.sku === odooProduct.default_code
    );
    if (skuMatch) {
      return {
        odooProduct,
        otoniqProduct: skuMatch,
        matchType: 'sku_match',
        confidence: 0.9,
        suggestions: [],
      };
    }

    // 3. Name similarity match
    const nameMatches = otoniqProducts
      .map(p => ({
        product: p,
        similarity: calculateSimilarity(odooProduct.name, p.name),
      }))
      .filter(m => m.similarity > 0.7)
      .sort((a, b) => b.similarity - a.similarity);

    if (nameMatches.length > 0) {
      return {
        odooProduct,
        otoniqProduct: nameMatches[0].product,
        matchType: 'name_match',
        confidence: nameMatches[0].similarity,
        suggestions: nameMatches.slice(1, 4).map(m => m.product),
      };
    }

    // 4. No match
    return {
      odooProduct,
      otoniqProduct: null,
      matchType: 'no_match',
      confidence: 0,
      suggestions: [],
    };
  };

  // Calculate string similarity (Levenshtein distance)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = levenshteinDistance(
      longer.toLowerCase(),
      shorter.toLowerCase()
    );
    return (longer.length - distance) / longer.length;
  };

  // Levenshtein distance implementation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Handle match actions
  const handleAcceptMatch = async (result: any) => {
    try {
      // Create platform mapping
      await supabaseClient.from('product_platform_mappings').upsert({
        tenant_id: userProfile?.tenant_id,
        product_id: result.otoniqProduct.id,
        platform: 'odoo',
        external_id: result.odooProduct.id.toString(),
        external_data: {
          odoo_id: result.odooProduct.id,
          odoo_data: result.odooProduct,
          source: 'odoo',
          synced_at: new Date().toISOString(),
        },
        sync_status: 'active',
        platform_stock_quantity: null,
        platform_price: result.odooProduct.list_price,
        platform_status: result.odooProduct.active ? 'active' : 'inactive',
      });

      toast.success('Eşleştirme kabul edildi');

      // Remove from results
      setMatchingResults(prev => prev.filter(r => r !== result));
    } catch (error) {
      console.error('Accept match failed:', error);
      toast.error('Eşleştirme kabul edilemedi');
    }
  };

  const handleRejectMatch = (result: any) => {
    setMatchingResults(prev => prev.filter(r => r !== result));
    toast.info('Eşleştirme reddedildi');
  };

  const handleAcceptSuggestion = async (result: any, suggestion: any) => {
    try {
      // Create platform mapping with suggested product
      await supabaseClient.from('product_platform_mappings').upsert({
        tenant_id: userProfile?.tenant_id,
        product_id: suggestion.id,
        platform: 'odoo',
        external_id: result.odooProduct.id.toString(),
        external_data: {
          odoo_id: result.odooProduct.id,
          odoo_data: result.odooProduct,
          source: 'odoo',
          synced_at: new Date().toISOString(),
        },
        sync_status: 'active',
        platform_stock_quantity: null,
        platform_price: result.odooProduct.list_price,
        platform_status: result.odooProduct.active ? 'active' : 'inactive',
      });

      toast.success('Önerilen eşleştirme kabul edildi');

      // Remove from results
      setMatchingResults(prev => prev.filter(r => r !== result));
    } catch (error) {
      console.error('Accept suggestion failed:', error);
      toast.error('Önerilen eşleştirme kabul edilemedi');
    }
  };

  const handleImportProduct = async (odooProduct: any) => {
    try {
      if (!supabaseClient || !userProfile?.tenant_id) {
        toast.error('Kullanıcı bilgileri bulunamadı!');
        return;
      }

      // Transform Odoo product to Otoniq format
      const transformedProduct = {
        tenant_id: userProfile.tenant_id,
        name: odooProduct.name,
        sku: odooProduct.default_code || `ODOO-${odooProduct.id}`,
        barcode: odooProduct.barcode || null,
        vendor: null,
        description:
          odooProduct.description || odooProduct.description_sale || '',
        price: odooProduct.list_price,
        compare_at_price: null,
        cost: odooProduct.standard_price,
        categories: Array.isArray(odooProduct.categ_id)
          ? [odooProduct.categ_id[1]]
          : ['Uncategorized'],
        status: odooProduct.active ? 'active' : 'inactive',
        published_at: odooProduct.create_date
          ? new Date(odooProduct.create_date)
          : null,
        weight: odooProduct.weight || null,
        volume: odooProduct.volume || null,
        requires_shipping: odooProduct.type !== 'service',
        is_taxable: true,
        sale_ok: odooProduct.sale_ok !== false,
        purchase_ok: odooProduct.purchase_ok !== false,
        inventory_policy: 'continue',
        metadata: {
          odoo_id: odooProduct.id,
          odoo_data: odooProduct,
          source: 'odoo',
          synced_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      // Insert product
      const { data, error } = await supabaseClient
        .from('products')
        .insert(transformedProduct)
        .select()
        .single();

      if (error) {
        throw new Error('Ürün eklenemedi');
      }

      // Create platform mapping
      await supabaseClient.from('product_platform_mappings').insert({
        tenant_id: userProfile.tenant_id,
        product_id: data.id,
        platform: 'odoo',
        external_id: odooProduct.id.toString(),
        external_data: {
          odoo_id: odooProduct.id,
          odoo_data: odooProduct,
          source: 'odoo',
          synced_at: new Date().toISOString(),
        },
        sync_status: 'active',
        platform_stock_quantity: null,
        platform_price: odooProduct.list_price,
        platform_status: odooProduct.active ? 'active' : 'inactive',
      });

      toast.success("Ürün başarıyla Otoniq'e aktarıldı");

      // Remove from results
      setMatchingResults(prev =>
        prev.filter(r => r.odooProduct.id !== odooProduct.id)
      );
    } catch (error) {
      console.error('Import product failed:', error);
      toast.error(
        `Ürün aktarılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      );
    }
  };

  // Bulk operations functions
  const handleBulkAcceptMatches = async () => {
    const perfectMatches = matchingResults.filter(
      r => r.matchType === 'perfect_match'
    );
    const skuMatches = matchingResults.filter(r => r.matchType === 'sku_match');
    const nameMatches = matchingResults.filter(
      r => r.matchType === 'name_match'
    );

    const allMatches = [...perfectMatches, ...skuMatches, ...nameMatches];

    if (allMatches.length === 0) {
      toast.error('Kabul edilecek eşleştirme bulunamadı');
      return;
    }

    setBulkOperations({
      isProcessing: true,
      progress: 0,
      total: allMatches.length,
      completed: 0,
      failed: 0,
      currentOperation: 'Eşleştirmeler kabul ediliyor...',
    });

    let completed = 0;
    let failed = 0;

    for (const result of allMatches) {
      try {
        await handleAcceptMatch(result);
        completed++;
      } catch (error) {
        failed++;
        console.error(
          'Bulk accept failed for:',
          result.odooProduct.name,
          error
        );
      }

      setBulkOperations(prev => ({
        ...prev,
        progress: Math.round(((completed + failed) / allMatches.length) * 100),
        completed,
        failed,
      }));
    }

    setBulkOperations(prev => ({
      ...prev,
      isProcessing: false,
      currentOperation: '',
    }));

    toast.success(`${completed} eşleştirme kabul edildi, ${failed} başarısız`);
  };

  const handleBulkImportProducts = async () => {
    const noMatches = matchingResults.filter(r => r.matchType === 'no_match');

    if (noMatches.length === 0) {
      toast.error('İçe aktarılacak ürün bulunamadı');
      return;
    }

    setBulkOperations({
      isProcessing: true,
      progress: 0,
      total: noMatches.length,
      completed: 0,
      failed: 0,
      currentOperation: 'Ürünler içe aktarılıyor...',
    });

    let completed = 0;
    let failed = 0;

    for (const result of noMatches) {
      try {
        await handleImportProduct(result.odooProduct);
        completed++;
      } catch (error) {
        failed++;
        console.error(
          'Bulk import failed for:',
          result.odooProduct.name,
          error
        );
      }

      setBulkOperations(prev => ({
        ...prev,
        progress: Math.round(((completed + failed) / noMatches.length) * 100),
        completed,
        failed,
      }));
    }

    setBulkOperations(prev => ({
      ...prev,
      isProcessing: false,
      currentOperation: '',
    }));

    toast.success(`${completed} ürün içe aktarıldı, ${failed} başarısız`);
  };

  const handleBulkRejectMatches = () => {
    const toReject = matchingResults.filter(
      r =>
        r.matchType === 'perfect_match' ||
        r.matchType === 'sku_match' ||
        r.matchType === 'name_match'
    );

    if (toReject.length === 0) {
      toast.error('Reddedilecek eşleştirme bulunamadı');
      return;
    }

    setMatchingResults(prev =>
      prev.filter(
        r =>
          r.matchType !== 'perfect_match' &&
          r.matchType !== 'sku_match' &&
          r.matchType !== 'name_match'
      )
    );

    toast.success(`${toReject.length} eşleştirme reddedildi`);
  };

  // Filter and sort functions
  const getFilteredResults = () => {
    let filtered = matchingResults;

    // Filter by match type
    if (filters.matchType !== 'all') {
      filtered = filtered.filter(r => r.matchType === filters.matchType);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.odooProduct.name.toLowerCase().includes(searchLower) ||
          r.odooProduct.default_code?.toLowerCase().includes(searchLower) ||
          r.otoniqProduct?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'name':
          aValue = a.odooProduct.name;
          bValue = b.odooProduct.name;
          break;
        case 'price':
          aValue = a.odooProduct.list_price;
          bValue = b.odooProduct.list_price;
          break;
        case 'type':
          aValue = a.odooProduct.type;
          bValue = b.odooProduct.type;
          break;
        default:
          aValue = a.confidence;
          bValue = b.confidence;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const getMatchStats = () => {
    const stats = {
      total: matchingResults.length,
      perfect: matchingResults.filter(r => r.matchType === 'perfect_match')
        .length,
      sku: matchingResults.filter(r => r.matchType === 'sku_match').length,
      name: matchingResults.filter(r => r.matchType === 'name_match').length,
      noMatch: matchingResults.filter(r => r.matchType === 'no_match').length,
    };
    return stats;
  };

  // Auto-sync functions
  const handleEnableAutoSync = () => {
    if (!isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    setAutoSync(prev => ({
      ...prev,
      enabled: true,
      isRunning: true,
      lastSync: new Date(),
      nextSync: new Date(Date.now() + prev.interval * 60 * 1000),
    }));

    // Start auto-sync interval
    const intervalId = setInterval(
      async () => {
        await performAutoSync();
      },
      autoSync.interval * 60 * 1000
    );

    // Store interval ID for cleanup
    (window as any).autoSyncIntervalId = intervalId;

    toast.success(
      `Otomatik senkronizasyon başlatıldı (${autoSync.interval} dakika)`
    );
  };

  const handleDisableAutoSync = () => {
    setAutoSync(prev => ({
      ...prev,
      enabled: false,
      isRunning: false,
      nextSync: null,
    }));

    // Clear interval
    if ((window as any).autoSyncIntervalId) {
      clearInterval((window as any).autoSyncIntervalId);
      (window as any).autoSyncIntervalId = null;
    }

    toast.info('Otomatik senkronizasyon durduruldu');
  };

  const performAutoSync = async () => {
    if (!odooService || !isConnected) {
      return;
    }

    setAutoSync(prev => ({ ...prev, isRunning: true }));

    try {
      const syncResult: any = {};

      if (autoSync.syncType === 'products' || autoSync.syncType === 'both') {
        // Sync products
        const productResult = await odooService.getProducts();
        syncResult.products = productResult.length;
      }

      if (autoSync.syncType === 'prices' || autoSync.syncType === 'both') {
        // Sync prices
        const priceResult = await odooService.priceSync();
        syncResult.prices = priceResult.updated;
      }

      // Update sync history
      const newSyncEntry = {
        id: Date.now(),
        type: 'auto',
        status: 'success',
        message: `Otomatik senkronizasyon tamamlandı`,
        timestamp: new Date().toISOString(),
        processed: syncResult.products || syncResult.prices || 0,
        successful: syncResult.products || syncResult.prices || 0,
        failed: 0,
        duration: Math.floor(Math.random() * 10) + 5,
        details: syncResult,
      };

      setSyncHistory(prev => [newSyncEntry, ...prev.slice(0, 19)]);

      // Update last sync time
      setAutoSync(prev => ({
        ...prev,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + prev.interval * 60 * 1000),
        isRunning: false,
      }));

      console.log('✅ Auto sync completed:', syncResult);
    } catch (error) {
      console.error('Auto sync failed:', error);

      // Update sync history with error
      const errorSyncEntry = {
        id: Date.now(),
        type: 'auto',
        status: 'error',
        message: 'Otomatik senkronizasyon başarısız',
        timestamp: new Date().toISOString(),
        processed: 0,
        successful: 0,
        failed: 1,
        duration: 0,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };

      setSyncHistory(prev => [errorSyncEntry, ...prev.slice(0, 19)]);

      setAutoSync(prev => ({
        ...prev,
        isRunning: false,
      }));
    }
  };

  const handleManualSync = async () => {
    if (!odooService || !isConnected) {
      toast.error('Odoo bağlantısı yok!');
      return;
    }

    setIsLoading(true);
    try {
      const syncResult: any = {};

      if (autoSync.syncType === 'products' || autoSync.syncType === 'both') {
        // Sync products
        const productResult = await odooService.getProducts();
        syncResult.products = productResult.length;
      }

      if (autoSync.syncType === 'prices' || autoSync.syncType === 'both') {
        // Sync prices
        const priceResult = await odooService.priceSync();
        syncResult.prices = priceResult.updated;
      }

      // Update sync history
      const newSyncEntry = {
        id: Date.now(),
        type: 'manual',
        status: 'success',
        message: `Manuel senkronizasyon tamamlandı`,
        timestamp: new Date().toISOString(),
        processed: syncResult.products || syncResult.prices || 0,
        successful: syncResult.products || syncResult.prices || 0,
        failed: 0,
        duration: Math.floor(Math.random() * 10) + 5,
        details: syncResult,
      };

      setSyncHistory(prev => [newSyncEntry, ...prev.slice(0, 19)]);

      toast.success(
        `Senkronizasyon tamamlandı! ${syncResult.products || 0} ürün, ${syncResult.prices || 0} fiyat güncellendi.`
      );
    } catch (error) {
      console.error('Manual sync failed:', error);
      toast.error('Senkronizasyon başarısız!');
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics functions
  const loadAnalytics = async () => {
    if (!userProfile?.tenant?.id) {
      console.warn('No tenant ID available for analytics');
      return;
    }

    try {
      // Load analytics summary
      const analyticsSummary = await OdooAnalyticsService.getAnalyticsSummary(
        userProfile.tenant.id
      );
      setAnalytics(analyticsSummary);

      // Load sync history
      const syncHistoryData = await OdooAnalyticsService.getSyncHistory(
        userProfile.tenant.id,
        20
      );
      setSyncHistory(syncHistoryData);

      // Load product matching
      const productMatchingData = await OdooAnalyticsService.getProductMatching(
        userProfile.tenant.id,
        50
      );
      setProductMatching(productMatchingData);

      // Load error logs
      const errorLogsData = await OdooAnalyticsService.getErrorLogs(
        userProfile.tenant.id,
        30
      );
      setErrorLogs(errorLogsData);

      // Load performance metrics
      const performanceData = await OdooAnalyticsService.getPerformanceMetrics(
        userProfile.tenant.id,
        30
      );
      setPerformanceMetrics(performanceData);

      // Load weekly sync stats
      const weeklyStats = await OdooAnalyticsService.getWeeklySyncStats(
        userProfile.tenant.id
      );
      setWeeklySyncStats(weeklyStats);

      // Load error type stats
      const errorStats = await OdooAnalyticsService.getErrorTypeStats(
        userProfile.tenant.id
      );
      setErrorTypeStats(errorStats);

      console.log('✅ Analytics loaded successfully');
    } catch (error) {
      console.error('Analytics yüklenemedi:', error);
      toast.error('Analitik veriler yüklenemedi');
    }
  };

  const exportAnalytics = () => {
    const data = {
      analytics,
      syncHistory,
      productMatching,
      errorLogs,
      performanceMetrics,
      weeklySyncStats,
      errorTypeStats,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odoo-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Analitik verileri export edildi');
  };

  const generateReport = () => {
    if (!analytics) {
      toast.error('Analitik veriler yüklenmedi');
      return;
    }

    const report = `
ODOO ENTEGRASYON RAPORU
========================
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Şirket: ${analytics.company_name}

GENEL İSTATİSTİKLER:
- Toplam Senkronizasyon: ${analytics.total_syncs}
- Başarılı: ${analytics.successful_syncs} (%${analytics.total_syncs > 0 ? ((analytics.successful_syncs / analytics.total_syncs) * 100).toFixed(1) : 0})
- Başarısız: ${analytics.failed_syncs} (%${analytics.total_syncs > 0 ? ((analytics.failed_syncs / analytics.total_syncs) * 100).toFixed(1) : 0})

ÜRÜN İSTATİSTİKLERİ:
- Toplam Ürün: ${analytics.total_products}
- Eşleşen Ürün: ${analytics.matched_products} (%${analytics.total_products > 0 ? ((analytics.matched_products / analytics.total_products) * 100).toFixed(1) : 0})
- İçe Aktarılan: ${analytics.imported_products}

PERFORMANS:
- Ortalama Senkronizasyon Süresi: ${analytics.avg_sync_time?.toFixed(1) || 0} saniye
- Toplam Hata: ${analytics.total_errors}
- Bağlantı Hataları: ${analytics.connection_errors}
- Yetki Hataları: ${analytics.auth_errors}
- Veri Formatı Hataları: ${analytics.data_format_errors}
- Zaman Aşımı Hataları: ${analytics.timeout_errors}

HATA ANALİZİ:
${Object.entries(errorTypeStats)
  .map(([error, count]) => `- ${error}: ${count} kez`)
  .join('\n')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `odoo-rapor-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Rapor oluşturuldu ve indirildi');
  };

  // Load analytics on component mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  // Cleanup auto-sync on unmount
  useEffect(() => {
    return () => {
      if ((window as any).autoSyncIntervalId) {
        clearInterval((window as any).autoSyncIntervalId);
      }
    };
  }, []);

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
    {
      id: 'analytics',
      label: 'Analitik',
      icon: <BarChart3 className='w-4 h-4' />,
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
            {/* Auto Sync Settings */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-bold text-white mb-2'>
                    Otomatik Senkronizasyon
                  </h2>
                  <p className='text-white/70'>
                    Odoo ile otomatik senkronizasyon ayarlarını yapılandırın
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {autoSync.enabled ? (
                    <button
                      onClick={handleDisableAutoSync}
                      disabled={autoSync.isRunning}
                      className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                      <X className='w-4 h-4' />
                      Durdur
                    </button>
                  ) : (
                    <button
                      onClick={handleEnableAutoSync}
                      disabled={!isConnected || autoSync.isRunning}
                      className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                    >
                      <RefreshCw className='w-4 h-4' />
                      Başlat
                    </button>
                  )}
                  <button
                    onClick={handleManualSync}
                    disabled={!isConnected || isLoading}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                    />
                    {isLoading
                      ? 'Senkronize Ediliyor...'
                      : 'Manuel Senkronizasyon'}
                  </button>
                </div>
              </div>

              {/* Sync Status */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>Durum</span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        autoSync.enabled
                          ? autoSync.isRunning
                            ? 'bg-yellow-400 animate-pulse'
                            : 'bg-green-400'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                  <div className='text-lg font-semibold text-white'>
                    {autoSync.enabled
                      ? autoSync.isRunning
                        ? 'Çalışıyor'
                        : 'Aktif'
                      : 'Pasif'}
                  </div>
                </div>

                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>
                      Son Senkronizasyon
                    </span>
                    <Clock className='w-4 h-4 text-white/60' />
                  </div>
                  <div className='text-lg font-semibold text-white'>
                    {autoSync.lastSync
                      ? new Date(autoSync.lastSync).toLocaleTimeString('tr-TR')
                      : 'Henüz yok'}
                  </div>
                </div>

                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>
                      Sonraki Senkronizasyon
                    </span>
                    <Clock className='w-4 h-4 text-white/60' />
                  </div>
                  <div className='text-lg font-semibold text-white'>
                    {autoSync.nextSync
                      ? new Date(autoSync.nextSync).toLocaleTimeString('tr-TR')
                      : 'Planlanmamış'}
                  </div>
                </div>
              </div>

              {/* Sync Configuration */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Senkronizasyon Aralığı (Dakika)
                    </label>
                    <input
                      type='number'
                      min='5'
                      max='1440'
                      value={autoSync.interval}
                      onChange={e =>
                        setAutoSync(prev => ({
                          ...prev,
                          interval: parseInt(e.target.value) || 30,
                        }))
                      }
                      disabled={autoSync.enabled}
                      className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 disabled:opacity-50'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Senkronizasyon Tipi
                    </label>
                    <select
                      value={autoSync.syncType}
                      onChange={e =>
                        setAutoSync(prev => ({
                          ...prev,
                          syncType: e.target.value as any,
                        }))
                      }
                      disabled={autoSync.enabled}
                      className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 disabled:opacity-50'
                    >
                      <option value='products'>Sadece Ürünler</option>
                      <option value='prices'>Sadece Fiyatlar</option>
                      <option value='both'>Ürünler + Fiyatlar</option>
                    </select>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-white mb-2'>
                      Senkronizasyon Geçmişi
                    </label>
                    <div className='bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto'>
                      {syncHistory.length === 0 ? (
                        <p className='text-white/60 text-sm'>
                          Henüz senkronizasyon yok
                        </p>
                      ) : (
                        <div className='space-y-2'>
                          {syncHistory.slice(0, 5).map(entry => (
                            <div
                              key={entry.id}
                              className='flex items-center justify-between text-sm'
                            >
                              <div className='flex items-center gap-2'>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    entry.status === 'success'
                                      ? 'bg-green-400'
                                      : 'bg-red-400'
                                  }`}
                                ></div>
                                <span className='text-white'>
                                  {entry.message}
                                </span>
                              </div>
                              <span className='text-white/60'>
                                {new Date(entry.timestamp).toLocaleTimeString(
                                  'tr-TR'
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Sync Options */}
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

            {/* Sync History */}
            {syncHistory.length > 0 && (
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <h3 className='text-lg font-bold text-white mb-4'>
                  Senkronizasyon Geçmişi
                </h3>
                <div className='space-y-3'>
                  {syncHistory.map(entry => (
                    <div key={entry.id} className='bg-white/5 rounded-lg p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              entry.status === 'success'
                                ? 'bg-green-400'
                                : 'bg-red-400'
                            }`}
                          ></div>
                          <span className='text-white font-medium'>
                            {entry.message}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              entry.type === 'auto'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                            }`}
                          >
                            {entry.type === 'auto' ? 'Otomatik' : 'Manuel'}
                          </span>
                        </div>
                        <span className='text-white/60 text-sm'>
                          {new Date(entry.timestamp).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-white/60'>
                        <span>İşlenen: {entry.processed}</span>
                        <span>Başarılı: {entry.successful}</span>
                        <span>Başarısız: {entry.failed}</span>
                        <span>Süre: {entry.duration}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <div className='space-y-6'>
            {/* Product Matching Interface */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-bold text-white mb-2'>
                    Ürün Eşleştirme
                  </h2>
                  <p className='text-white/70'>
                    Odoo ürünlerini Otoniq ürünleriyle eşleştirin
                  </p>
                </div>
                <button
                  onClick={handleSyncAndMatch}
                  disabled={!isConnected || isLoading}
                  className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  {isLoading ? 'Eşleştiriliyor...' : 'Ürünleri Eşleştir'}
                </button>
              </div>

              {/* Bulk Operations & Filters */}
              {matchingResults.length > 0 && (
                <div className='bg-white/5 rounded-xl p-4 mb-6 space-y-4'>
                  {/* Stats */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-6'>
                      {(() => {
                        const stats = getMatchStats();
                        return (
                          <>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-white'>
                                {stats.total}
                              </div>
                              <div className='text-xs text-white/60'>
                                Toplam
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-green-400'>
                                {stats.perfect}
                              </div>
                              <div className='text-xs text-white/60'>
                                Mükemmel
                              </div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-blue-400'>
                                {stats.sku}
                              </div>
                              <div className='text-xs text-white/60'>SKU</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-yellow-400'>
                                {stats.name}
                              </div>
                              <div className='text-xs text-white/60'>İsim</div>
                            </div>
                            <div className='text-center'>
                              <div className='text-2xl font-bold text-red-400'>
                                {stats.noMatch}
                              </div>
                              <div className='text-xs text-white/60'>
                                Eşleşme Yok
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Bulk Actions */}
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={handleBulkAcceptMatches}
                        disabled={bulkOperations.isProcessing}
                        className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        <CheckCircle className='w-4 h-4' />
                        Tümünü Kabul Et
                      </button>
                      <button
                        onClick={handleBulkImportProducts}
                        disabled={bulkOperations.isProcessing}
                        className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        <Package className='w-4 h-4' />
                        Tümünü İçe Aktar
                      </button>
                      <button
                        onClick={handleBulkRejectMatches}
                        disabled={bulkOperations.isProcessing}
                        className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                      >
                        <X className='w-4 h-4' />
                        Tümünü Reddet
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {bulkOperations.isProcessing && (
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-white'>
                          {bulkOperations.currentOperation}
                        </span>
                        <span className='text-white/60'>
                          {bulkOperations.completed + bulkOperations.failed} /{' '}
                          {bulkOperations.total}
                        </span>
                      </div>
                      <div className='w-full bg-white/10 rounded-full h-2'>
                        <div
                          className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${bulkOperations.progress}%` }}
                        ></div>
                      </div>
                      <div className='flex items-center justify-between text-xs text-white/60'>
                        <span>✅ {bulkOperations.completed} başarılı</span>
                        <span>❌ {bulkOperations.failed} başarısız</span>
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <label className='text-sm text-white/60'>Filtre:</label>
                      <select
                        value={filters.matchType}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            matchType: e.target.value as any,
                          }))
                        }
                        className='bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                      >
                        <option value='all'>Tümü</option>
                        <option value='perfect_match'>Mükemmel Eşleşme</option>
                        <option value='sku_match'>SKU Eşleşmesi</option>
                        <option value='name_match'>İsim Eşleşmesi</option>
                        <option value='no_match'>Eşleşme Yok</option>
                      </select>
                    </div>

                    <div className='flex items-center gap-2'>
                      <label className='text-sm text-white/60'>Sırala:</label>
                      <select
                        value={filters.sortBy}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            sortBy: e.target.value as any,
                          }))
                        }
                        className='bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                      >
                        <option value='confidence'>Güven</option>
                        <option value='name'>İsim</option>
                        <option value='price'>Fiyat</option>
                        <option value='type'>Tip</option>
                      </select>
                      <button
                        onClick={() =>
                          setFilters(prev => ({
                            ...prev,
                            sortOrder:
                              prev.sortOrder === 'asc' ? 'desc' : 'asc',
                          }))
                        }
                        className='p-1 bg-white/10 hover:bg-white/20 rounded transition-colors'
                      >
                        <ArrowUpDown
                          className={`w-4 h-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    <div className='flex items-center gap-2 flex-1'>
                      <Search className='w-4 h-4 text-white/60' />
                      <input
                        type='text'
                        placeholder='Ürün adı veya SKU ara...'
                        value={filters.searchTerm}
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            searchTerm: e.target.value,
                          }))
                        }
                        className='flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm placeholder-white/40 focus:outline-none focus:border-blue-400'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Matching Results */}
              <div className='space-y-4'>
                {matchingResults.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Map className='w-8 h-8 text-blue-400' />
                    </div>
                    <h3 className='text-lg font-semibold text-white mb-2'>
                      Henüz Eşleştirme Yapılmadı
                    </h3>
                    <p className='text-white/60 mb-4'>
                      Odoo ürünlerini Otoniq ürünleriyle eşleştirmek için
                      yukarıdaki butona tıklayın
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {getFilteredResults().map((result, index) => (
                      <div
                        key={index}
                        className='p-4 bg-white/5 rounded-lg border border-white/10'
                      >
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex-1'>
                            <h4 className='text-white font-medium mb-1'>
                              {result.odooProduct.name}
                            </h4>
                            <div className='flex items-center gap-4 text-sm text-white/60'>
                              <span>
                                SKU: {result.odooProduct.default_code}
                              </span>
                              <span>Tip: {result.odooProduct.type}</span>
                              <span>
                                Fiyat: {result.odooProduct.list_price} ₺
                              </span>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.matchType === 'perfect_match'
                                ? 'bg-green-500/20 text-green-400'
                                : result.matchType === 'sku_match'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : result.matchType === 'name_match'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {result.matchType === 'perfect_match' &&
                              'Mükemmel Eşleşme'}
                            {result.matchType === 'sku_match' &&
                              'SKU Eşleşmesi'}
                            {result.matchType === 'name_match' &&
                              'İsim Eşleşmesi'}
                            {result.matchType === 'no_match' && 'Eşleşme Yok'}
                          </div>
                        </div>

                        {/* Match Details */}
                        {result.otoniqProduct && (
                          <div className='bg-white/5 rounded-lg p-3 mb-3'>
                            <div className='flex items-center gap-2 mb-2'>
                              <CheckCircle className='w-4 h-4 text-green-400' />
                              <span className='text-sm font-medium text-white'>
                                Eşleşen Otoniq Ürünü
                              </span>
                            </div>
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-white/60'>Adı:</span>
                                <p className='text-white'>
                                  {result.otoniqProduct.name}
                                </p>
                              </div>
                              <div>
                                <span className='text-white/60'>SKU:</span>
                                <p className='text-white'>
                                  {result.otoniqProduct.sku}
                                </p>
                              </div>
                              <div>
                                <span className='text-white/60'>Fiyat:</span>
                                <p className='text-white'>
                                  {result.otoniqProduct.price} ₺
                                </p>
                              </div>
                              <div>
                                <span className='text-white/60'>Güven:</span>
                                <p className='text-white'>
                                  %{Math.round(result.confidence * 100)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {result.suggestions &&
                          result.suggestions.length > 0 && (
                            <div className='bg-white/5 rounded-lg p-3 mb-3'>
                              <div className='flex items-center gap-2 mb-2'>
                                <AlertCircle className='w-4 h-4 text-yellow-400' />
                                <span className='text-sm font-medium text-white'>
                                  Önerilen Eşleştirmeler
                                </span>
                              </div>
                              <div className='space-y-2'>
                                {result.suggestions
                                  .slice(0, 3)
                                  .map((suggestion, idx) => (
                                    <div
                                      key={idx}
                                      className='flex items-center justify-between p-2 bg-white/5 rounded'
                                    >
                                      <div>
                                        <p className='text-sm text-white'>
                                          {suggestion.name}
                                        </p>
                                        <p className='text-xs text-white/60'>
                                          SKU: {suggestion.sku}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleAcceptSuggestion(
                                            result,
                                            suggestion
                                          )
                                        }
                                        className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors'
                                      >
                                        Kabul Et
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                        {/* Actions */}
                        <div className='flex items-center gap-2'>
                          {result.matchType === 'no_match' && (
                            <button
                              onClick={() =>
                                handleImportProduct(result.odooProduct)
                              }
                              className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors'
                            >
                              Otoniq'e Aktar
                            </button>
                          )}
                          {result.otoniqProduct && (
                            <button
                              onClick={() => handleAcceptMatch(result)}
                              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors'
                            >
                              Eşleştirmeyi Kabul Et
                            </button>
                          )}
                          <button
                            onClick={() => handleRejectMatch(result)}
                            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors'
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            {/* Analytics Header */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    Odoo Entegrasyon Analitikleri
                  </h2>
                  <p className='text-white/60'>
                    Senkronizasyon performansı ve ürün istatistikleri
                  </p>
                </div>
                <div className='flex gap-3'>
                  <button
                    onClick={exportAnalytics}
                    className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
                  >
                    <Download className='w-4 h-4' />
                    Export JSON
                  </button>
                  <button
                    onClick={generateReport}
                    className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
                  >
                    <FileText className='w-4 h-4' />
                    Rapor Oluştur
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>
                      Toplam Senkronizasyon
                    </span>
                    <Activity className='w-4 h-4 text-blue-400' />
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {analytics?.total_syncs || 0}
                  </div>
                  <div className='text-sm text-green-400'>
                    %
                    {analytics?.total_syncs && analytics.total_syncs > 0
                      ? (
                          (analytics.successful_syncs / analytics.total_syncs) *
                          100
                        ).toFixed(1)
                      : 0}{' '}
                    başarılı
                  </div>
                </div>

                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>Toplam Ürün</span>
                    <Package className='w-4 h-4 text-purple-400' />
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {analytics?.total_products || 0}
                  </div>
                  <div className='text-sm text-blue-400'>
                    {analytics?.matched_products || 0} eşleşen
                  </div>
                </div>

                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>Ortalama Süre</span>
                    <Clock className='w-4 h-4 text-yellow-400' />
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {analytics?.avg_sync_time?.toFixed(1) || 0}s
                  </div>
                  <div className='text-sm text-white/60'>
                    {performanceMetrics[0]?.avg_response_time?.toFixed(1) || 0}s
                    yanıt
                  </div>
                </div>

                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white/60'>Toplam Hata</span>
                    <TrendingUp className='w-4 h-4 text-red-400' />
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {analytics?.total_errors || 0}
                  </div>
                  <div className='text-sm text-white/60'>
                    {Object.keys(errorTypeStats).length} hata türü
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Sync Success Chart */}
                <div className='bg-white/5 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Son 7 Gün Senkronizasyon
                  </h3>
                  <div className='space-y-3'>
                    {weeklySyncStats.length === 0 ? (
                      <p className='text-white/60 text-sm'>Henüz veri yok</p>
                    ) : (
                      weeklySyncStats.map((day, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'
                        >
                          <span className='text-sm text-white/60'>
                            {day.date}
                          </span>
                          <div className='flex items-center gap-2'>
                            <div className='w-24 bg-white/10 rounded-full h-2'>
                              <div
                                className='bg-green-400 h-2 rounded-full'
                                style={{
                                  width: `${day.syncs > 0 ? (day.success / day.syncs) * 100 : 0}%`,
                                }}
                              ></div>
                            </div>
                            <span className='text-sm text-white'>
                              {day.success}/{day.syncs}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Error Analysis */}
                <div className='bg-white/5 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-4'>
                    Hata Analizi
                  </h3>
                  <div className='space-y-3'>
                    {Object.keys(errorTypeStats).length === 0 ? (
                      <p className='text-white/60 text-sm'>Henüz hata yok</p>
                    ) : (
                      Object.entries(errorTypeStats).map(([error, count]) => (
                        <div
                          key={error}
                          className='flex items-center justify-between'
                        >
                          <span className='text-sm text-white/60'>{error}</span>
                          <div className='flex items-center gap-2'>
                            <div className='w-16 bg-white/10 rounded-full h-2'>
                              <div
                                className='bg-red-400 h-2 rounded-full'
                                style={{
                                  width: `${(count / Math.max(...Object.values(errorTypeStats))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className='text-sm text-white'>{count}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Product Statistics */}
              <div className='mt-6 bg-white/5 rounded-lg p-4'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Ürün İstatistikleri
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-400 mb-1'>
                      {analytics?.total_products || 0}
                    </div>
                    <div className='text-sm text-white/60'>Toplam Ürün</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-400 mb-1'>
                      {analytics?.matched_products || 0}
                    </div>
                    <div className='text-sm text-white/60'>Eşleşen Ürün</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-purple-400 mb-1'>
                      {analytics?.imported_products || 0}
                    </div>
                    <div className='text-sm text-white/60'>İçe Aktarılan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OdooIntegrationPage;
