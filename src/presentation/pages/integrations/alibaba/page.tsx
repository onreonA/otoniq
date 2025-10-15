import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Settings,
  Package,
  ShoppingCart,
  MessageSquare,
  Truck,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Mail,
  Globe,
  DollarSign,
  Users,
  Star,
  Zap,
  AlertCircle,
  Info,
  ChevronRight,
} from 'lucide-react';
import { MockBadge } from '../../../components/common/MockBadge';
import {
  mockAlibabaConnection,
  mockAlibabaStats,
  mockAlibabaProducts,
  mockAlibabaOrders,
  mockAlibabaMessages,
  mockShippingMethods,
  mockShipmentTracking,
  mockSalesData,
  mockCategoryRevenue,
  mockTopProducts,
  mockTrafficData,
  mockSyncHistory,
  mockAlibabaLogs,
  mockAlibabaActivities,
  getProductStatusColor,
  getProductStatusLabel,
  getOrderStatusColor,
  getOrderStatusLabel,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  getShippingStatusColor,
  getShippingStatusLabel,
  getMessageTypeColor,
  getMessageTypeLabel,
  getSyncStatusColor,
  getSyncStatusLabel,
  getLogLevelColor,
  type AlibabaProductStatus,
  type AlibabaOrderStatus,
  type AlibabaMessageType,
  type AlibabaSyncType,
  type AlibabaLogLevel,
} from './mocks/alibabaMockData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

type TabType =
  | 'overview'
  | 'settings'
  | 'products'
  | 'orders'
  | 'messaging'
  | 'logistics'
  | 'analytics';

const AlibabaIntegrationPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Freight calculator state
  const [freightOrigin, setFreightOrigin] = useState('');
  const [freightDestination, setFreightDestination] = useState('');
  const [freightWeight, setFreightWeight] = useState('');

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
    { id: 'products', label: 'Ürünler', icon: <Package className='w-4 h-4' /> },
    {
      id: 'orders',
      label: 'Siparişler',
      icon: <ShoppingCart className='w-4 h-4' />,
    },
    {
      id: 'messaging',
      label: 'Mesajlar',
      icon: <MessageSquare className='w-4 h-4' />,
    },
    { id: 'logistics', label: 'Lojistik', icon: <Truck className='w-4 h-4' /> },
    {
      id: 'analytics',
      label: 'Analitik',
      icon: <BarChart3 className='w-4 h-4' />,
    },
  ];

  const handleSync = (syncType: string) => {
    toast.success(`${syncType} senkronizasyonu başlatıldı (Mock)`);
  };

  const handleTestConnection = () => {
    toast.success('Bağlantı testi başarılı (Mock)');
  };

  const handleFreightCalculate = () => {
    if (!freightOrigin || !freightDestination || !freightWeight) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }
    toast.success('Navlun hesaplandı (Mock)');
  };

  // Filter products
  const filteredProducts = mockAlibabaProducts.filter(product => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Filter orders
  const filteredOrders = mockAlibabaOrders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.orderStatus === filterStatus;
  });

  // Filter messages
  const filteredMessages = mockAlibabaMessages.filter(message => {
    if (filterStatus === 'all') return true;
    return message.messageType === filterStatus;
  });

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      <MockBadge storageKey='mock-badge-alibaba' />

      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Link
            to='/integrations'
            className='p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10'
          >
            <ArrowLeft className='w-5 h-5 text-white' />
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-white flex items-center gap-3'>
              <Globe className='w-8 h-8 text-orange-400' />
              Alibaba.com Entegrasyonu
            </h1>
            <p className='text-white/60 mt-1'>
              B2B marketplace entegrasyonu ve yönetimi
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          {mockAlibabaConnection.isConnected ? (
            <div className='flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg'>
              <CheckCircle className='w-4 h-4 text-green-400' />
              <span className='text-sm text-green-400 font-medium'>Bağlı</span>
            </div>
          ) : (
            <div className='flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg'>
              <XCircle className='w-4 h-4 text-red-400' />
              <span className='text-sm text-red-400 font-medium'>
                Bağlı Değil
              </span>
            </div>
          )}
          <div className='text-right'>
            <p className='text-xs text-white/40'>Son Senkronizasyon</p>
            <p className='text-sm text-white/80 font-medium'>
              {new Date(mockAlibabaConnection.lastSyncAt).toLocaleString(
                'tr-TR'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-white/10'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white border-b-2 border-orange-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='space-y-6'>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Connection Status Card */}
            <div className='bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Mağaza Bağlantısı
                  </h3>
                  <p className='text-white/60 text-sm mb-1'>
                    <strong>Mağaza:</strong> {mockAlibabaConnection.storeName}
                  </p>
                  <p className='text-white/60 text-sm mb-1'>
                    <strong>URL:</strong> {mockAlibabaConnection.storeUrl}
                  </p>
                  <p className='text-white/60 text-sm'>
                    <strong>Otomatik Senkronizasyon:</strong>{' '}
                    {mockAlibabaConnection.autoSyncEnabled ? 'Aktif' : 'Pasif'}{' '}
                    ({mockAlibabaConnection.syncFrequency} dakika)
                  </p>
                </div>
                <div className='text-right'>
                  {mockAlibabaConnection.isConnected ? (
                    <CheckCircle className='w-16 h-16 text-green-400' />
                  ) : (
                    <XCircle className='w-16 h-16 text-red-400' />
                  )}
                </div>
              </div>
            </div>

            {/* KPI Grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Toplam Ürün</span>
                  <Package className='w-5 h-5 text-blue-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.totalProducts}
                </p>
                <p className='text-xs text-white/50 mt-1'>
                  {mockAlibabaStats.activeProducts} aktif
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Aktif Sipariş</span>
                  <ShoppingCart className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.pendingOrders}
                </p>
                <p className='text-xs text-white/50 mt-1'>
                  {mockAlibabaStats.totalOrders} toplam
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Okunmamış Mesaj</span>
                  <MessageSquare className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.unreadMessages}
                </p>
                <p className='text-xs text-white/50 mt-1'>
                  {mockAlibabaStats.totalMessages} toplam
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Aylık Satış</span>
                  <DollarSign className='w-5 h-5 text-yellow-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  ${mockAlibabaStats.monthlyRevenue.toLocaleString()}
                </p>
                <p className='text-xs text-white/50 mt-1'>
                  {mockAlibabaStats.monthlySales} sipariş
                </p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Mağaza Puanı</span>
                  <Star className='w-5 h-5 text-orange-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.storeRating}
                </p>
                <p className='text-xs text-white/50 mt-1'>5.0 üzerinden</p>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Senkronizasyon</span>
                  <Zap className='w-5 h-5 text-indigo-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.syncSuccessRate}%
                </p>
                <p className='text-xs text-white/50 mt-1'>Başarı oranı</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center'>
                    <RefreshCw className='w-6 h-6 text-blue-400' />
                  </div>
                  <div>
                    <p className='text-sm text-white/60'>
                      Bugünkü Senkronizasyonlar
                    </p>
                    <p className='text-2xl font-bold text-white'>
                      {mockAlibabaStats.todaySyncs}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center'>
                    <Clock className='w-6 h-6 text-yellow-400' />
                  </div>
                  <div>
                    <p className='text-sm text-white/60'>Bekleyen İşlemler</p>
                    <p className='text-2xl font-bold text-white'>
                      {mockAlibabaStats.pendingActions}
                    </p>
                  </div>
                </div>
              </div>

              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center'>
                    <BarChart3 className='w-6 h-6 text-purple-400' />
                  </div>
                  <div>
                    <p className='text-sm text-white/60'>API Kota Kullanımı</p>
                    <p className='text-2xl font-bold text-white'>
                      {mockAlibabaStats.apiQuotaUsed} /{' '}
                      {mockAlibabaStats.apiQuotaLimit}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Activity className='w-5 h-5 text-indigo-400' />
                Son Aktiviteler
              </h3>
              <div className='space-y-4'>
                {mockAlibabaActivities.slice(0, 10).map(activity => (
                  <div
                    key={activity.id}
                    className='flex items-start gap-4 pb-4 border-b border-white/5 last:border-0'
                  >
                    <div className='w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0'>
                      {activity.type === 'sync' && (
                        <RefreshCw className='w-5 h-5 text-indigo-400' />
                      )}
                      {activity.type === 'order' && (
                        <ShoppingCart className='w-5 h-5 text-green-400' />
                      )}
                      {activity.type === 'message' && (
                        <MessageSquare className='w-5 h-5 text-purple-400' />
                      )}
                      {activity.type === 'product' && (
                        <Package className='w-5 h-5 text-blue-400' />
                      )}
                      {activity.type === 'system' && (
                        <CheckCircle className='w-5 h-5 text-green-400' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-white'>
                        {activity.title}
                      </p>
                      <p className='text-xs text-white/60 mt-1'>
                        {activity.description}
                      </p>
                      <p className='text-xs text-white/40 mt-1'>
                        {new Date(activity.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <>
            {/* API Credentials */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Settings className='w-5 h-5 text-indigo-400' />
                API Kimlik Bilgileri
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    App Key
                  </label>
                  <input
                    type='text'
                    value={mockAlibabaConnection.appKey}
                    readOnly
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    App Secret
                  </label>
                  <input
                    type='password'
                    value='••••••••••••••••'
                    readOnly
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Mağaza URL
                  </label>
                  <input
                    type='text'
                    value={mockAlibabaConnection.storeUrl}
                    readOnly
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <button
                  onClick={handleTestConnection}
                  className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors'
                >
                  Bağlantıyı Test Et
                </button>
              </div>
            </div>

            {/* Sync Settings */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <RefreshCw className='w-5 h-5 text-indigo-400' />
                Senkronizasyon Ayarları
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Otomatik Senkronizasyon
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Ürün ve siparişleri otomatik olarak senkronize et
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={mockAlibabaConnection.autoSyncEnabled}
                      readOnly
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Senkronizasyon Sıklığı
                  </label>
                  <select className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'>
                    <option value='15'>Her 15 dakikada</option>
                    <option value='30'>Her 30 dakikada</option>
                    <option value='60' selected>
                      Her 1 saatte
                    </option>
                    <option value='360'>Her 6 saatte</option>
                    <option value='1440'>Her 24 saatte</option>
                  </select>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Ürünleri Senkronize Et
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Alibaba ürünlerini otomatik olarak senkronize et
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked
                      readOnly
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Siparişleri Senkronize Et
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Alibaba siparişlerini otomatik olarak senkronize et
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked
                      readOnly
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Stok Bilgilerini Senkronize Et
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Stok miktarlarını otomatik olarak güncelle
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked
                      readOnly
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Settings className='w-5 h-5 text-indigo-400' />
                Gelişmiş Seçenekler
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Webhook URL
                  </label>
                  <input
                    type='text'
                    placeholder='https://your-domain.com/webhooks/alibaba'
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                  <p className='text-xs text-white/50 mt-1'>
                    Alibaba olayları için webhook URL'si
                  </p>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Başarısız İşlemleri Tekrar Dene
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Başarısız senkronizasyonları otomatik olarak tekrar dene
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked
                      readOnly
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Bildirim E-postası
                  </label>
                  <input
                    type='email'
                    placeholder='admin@otoniq.ai'
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                  <p className='text-xs text-white/50 mt-1'>
                    Önemli olaylar için bildirim gönderilecek e-posta
                  </p>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>Debug Modu</p>
                    <p className='text-xs text-white/60 mt-1'>
                      Detaylı log kayıtları tut
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <>
            {/* Product Sync Statistics */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Toplam Ürün</span>
                  <Package className='w-5 h-5 text-blue-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.totalProducts}
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Aktif Ürün</span>
                  <CheckCircle className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaStats.activeProducts}
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>
                    Toplam Görüntülenme
                  </span>
                  <Eye className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaProducts
                    .reduce((sum, p) => sum + p.views, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Toplam Soru</span>
                  <MessageSquare className='w-5 h-5 text-orange-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaProducts
                    .reduce((sum, p) => sum + p.inquiries, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>

            {/* Manual Sync Section */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <RefreshCw className='w-5 h-5 text-indigo-400' />
                Manuel Senkronizasyon
              </h3>
              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => handleSync('Tüm Ürünler')}
                  className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
                >
                  <RefreshCw className='w-4 h-4' />
                  Tüm Ürünleri Senkronize Et
                </button>
                <button
                  onClick={() => handleSync('Yeni Ürünler')}
                  className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2'
                >
                  <RefreshCw className='w-4 h-4' />
                  Yeni Ürünleri Senkronize Et
                </button>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className='px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                >
                  <option value='all'>Tüm Kategoriler</option>
                  {Array.from(
                    new Set(mockAlibabaProducts.map(p => p.category))
                  ).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSync(`${filterCategory} Kategorisi`)}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                >
                  Kategori Senkronize Et
                </button>
              </div>
            </div>

            {/* Bulk Upload Section */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Upload className='w-5 h-5 text-indigo-400' />
                Toplu Yükleme
              </h3>
              <div className='flex items-center gap-3'>
                <button className='px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2'>
                  <Upload className='w-4 h-4' />
                  CSV Yükle
                </button>
                <button className='px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-medium transition-colors flex items-center gap-2'>
                  <Download className='w-4 h-4' />
                  Şablon İndir
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
                  <Package className='w-5 h-5 text-indigo-400' />
                  Ürün Listesi ({filteredProducts.length})
                </h3>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40' />
                    <input
                      type='text'
                      placeholder='Ürün ara...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500'
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className='px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500'
                  >
                    <option value='all'>Tüm Durumlar</option>
                    <option value='active'>Aktif</option>
                    <option value='inactive'>Pasif</option>
                    <option value='draft'>Taslak</option>
                    <option value='pending_approval'>Onay Bekliyor</option>
                  </select>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-white/10'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Görsel
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Başlık
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        SKU
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Kategori
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Fiyat
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Stok
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Durum
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map(product => (
                      <tr
                        key={product.id}
                        className='border-b border-white/5 hover:bg-white/5'
                      >
                        <td className='py-3 px-4'>
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className='w-12 h-12 rounded-lg object-cover'
                          />
                        </td>
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white font-medium'>
                            {product.title}
                          </p>
                          <p className='text-xs text-white/50 mt-1'>
                            {product.views} görüntülenme • {product.inquiries}{' '}
                            soru
                          </p>
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {product.sku}
                        </td>
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white/80'>
                            {product.category}
                          </p>
                          <p className='text-xs text-white/50'>
                            {product.subcategory}
                          </p>
                        </td>
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white font-medium'>
                            ${product.price}
                          </p>
                          <p className='text-xs text-white/50'>
                            MOQ: {product.minOrderQuantity}
                          </p>
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {product.stock.toLocaleString()}
                        </td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getProductStatusColor(product.status)}`}
                          >
                            {getProductStatusLabel(product.status)}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <button
                            onClick={() => handleSync(product.title)}
                            className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                            title='Senkronize Et'
                          >
                            <RefreshCw className='w-4 h-4 text-indigo-400' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-4 pt-4 border-t border-white/10'>
                  <p className='text-sm text-white/60'>
                    Sayfa {currentPage} / {totalPages}
                  </p>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className='px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors'
                    >
                      Önceki
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className='px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors'
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
            {/* Order Statistics */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Toplam Sipariş</span>
                  <ShoppingCart className='w-5 h-5 text-blue-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaOrders.length}
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Bekleyen</span>
                  <Clock className='w-5 h-5 text-yellow-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {
                    mockAlibabaOrders.filter(
                      o =>
                        o.orderStatus === 'awaiting_payment' ||
                        o.orderStatus === 'processing'
                    ).length
                  }
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Kargoda</span>
                  <Truck className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {
                    mockAlibabaOrders.filter(o => o.orderStatus === 'shipped')
                      .length
                  }
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Tamamlanan</span>
                  <CheckCircle className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {
                    mockAlibabaOrders.filter(o => o.orderStatus === 'completed')
                      .length
                  }
                </p>
              </div>
            </div>

            {/* Order Status Tabs */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center gap-2 mb-4 overflow-x-auto pb-2'>
                {[
                  'all',
                  'awaiting_payment',
                  'processing',
                  'shipped',
                  'completed',
                  'cancelled',
                ].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      filterStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {status === 'all'
                      ? 'Tümü'
                      : getOrderStatusLabel(status as AlibabaOrderStatus)}{' '}
                    (
                    {status === 'all'
                      ? mockAlibabaOrders.length
                      : mockAlibabaOrders.filter(o => o.orderStatus === status)
                          .length}
                    )
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-white/10'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Sipariş No
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Tarih
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Müşteri
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Ürün Sayısı
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Toplam
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Ödeme
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Kargo
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 20).map(order => (
                      <tr
                        key={order.id}
                        className='border-b border-white/5 hover:bg-white/5'
                      >
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white font-medium'>
                            {order.orderNumber}
                          </p>
                          {order.trackingNumber && (
                            <p className='text-xs text-white/50 mt-1'>
                              {order.trackingNumber}
                            </p>
                          )}
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {new Date(order.createdAt).toLocaleDateString(
                            'tr-TR'
                          )}
                        </td>
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white/80'>
                            {order.buyerName}
                          </p>
                          <p className='text-xs text-white/50'>
                            {order.buyerCompany}
                          </p>
                          <p className='text-xs text-white/40'>
                            {order.buyerCountry}
                          </p>
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {order.items.length} ürün
                        </td>
                        <td className='py-3 px-4'>
                          <p className='text-sm text-white font-medium'>
                            ${order.totalAmount.toLocaleString()}
                          </p>
                          <p className='text-xs text-white/50'>
                            {order.currency}
                          </p>
                        </td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getPaymentStatusColor(order.paymentStatus)}`}
                          >
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getShippingStatusColor(order.shippingStatus)}`}
                          >
                            {getShippingStatusLabel(order.shippingStatus)}
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getOrderStatusColor(order.orderStatus)}`}
                          >
                            {getOrderStatusLabel(order.orderStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* MESSAGING TAB */}
        {activeTab === 'messaging' && (
          <>
            {/* Message Statistics */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Okunmamış</span>
                  <MessageSquare className='w-5 h-5 text-red-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaMessages.filter(m => !m.isRead).length}
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>RFQ</span>
                  <Mail className='w-5 h-5 text-purple-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {
                    mockAlibabaMessages.filter(m => m.messageType === 'rfq')
                      .length
                  }
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Sorular</span>
                  <Info className='w-5 h-5 text-blue-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {
                    mockAlibabaMessages.filter(m => m.messageType === 'inquiry')
                      .length
                  }
                </p>
              </div>
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-white/60'>Toplam</span>
                  <MessageSquare className='w-5 h-5 text-green-400' />
                </div>
                <p className='text-3xl font-bold text-white'>
                  {mockAlibabaMessages.length}
                </p>
              </div>
            </div>

            {/* Message Type Tabs */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <div className='flex items-center gap-2 mb-4 overflow-x-auto pb-2'>
                {['all', 'rfq', 'inquiry', 'general', 'negotiation'].map(
                  type => (
                    <button
                      key={type}
                      onClick={() => setFilterStatus(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        filterStatus === type
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {type === 'all'
                        ? 'Tümü'
                        : getMessageTypeLabel(type as AlibabaMessageType)}{' '}
                      (
                      {type === 'all'
                        ? mockAlibabaMessages.length
                        : mockAlibabaMessages.filter(
                            m => m.messageType === type
                          ).length}
                      )
                    </button>
                  )
                )}
              </div>

              {/* Messages List */}
              <div className='space-y-4'>
                {filteredMessages.slice(0, 15).map(message => (
                  <div
                    key={message.id}
                    className='flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors'
                  >
                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0'>
                      {message.senderName.charAt(0)}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <p className='text-sm font-medium text-white'>
                            {message.senderName}
                          </p>
                          <p className='text-xs text-white/50'>
                            {message.senderCompany} • {message.senderCountry}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getMessageTypeColor(message.messageType)}`}
                          >
                            {getMessageTypeLabel(message.messageType)}
                          </span>
                          {!message.isRead && (
                            <span className='w-2 h-2 bg-red-400 rounded-full'></span>
                          )}
                        </div>
                      </div>
                      <p className='text-sm text-white font-medium mb-1'>
                        {message.subject}
                      </p>
                      <p className='text-sm text-white/70 mb-2'>
                        {message.content}
                      </p>
                      {message.productTitle && (
                        <p className='text-xs text-white/50 mb-2'>
                          <strong>Ürün:</strong> {message.productTitle}
                        </p>
                      )}
                      {message.quantity && (
                        <p className='text-xs text-white/50 mb-2'>
                          <strong>Miktar:</strong> {message.quantity} adet
                        </p>
                      )}
                      {message.targetPrice && (
                        <p className='text-xs text-white/50 mb-2'>
                          <strong>Hedef Fiyat:</strong> ${message.targetPrice}
                        </p>
                      )}
                      <div className='flex items-center justify-between mt-3'>
                        <p className='text-xs text-white/40'>
                          {new Date(message.createdAt).toLocaleString('tr-TR')}
                        </p>
                        <button className='px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors'>
                          Yanıtla
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Response Settings */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Settings className='w-5 h-5 text-indigo-400' />
                Otomatik Yanıt Ayarları
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Otomatik Yanıtları Etkinleştir
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      Gelen mesajlara otomatik yanıt gönder
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-white'>
                      AI Chatbot Entegrasyonu
                    </p>
                    <p className='text-xs text-white/60 mt-1'>
                      AI destekli akıllı yanıtlar
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </>
        )}

        {/* LOGISTICS TAB */}
        {activeTab === 'logistics' && (
          <>
            {/* Shipping Methods Comparison */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Truck className='w-5 h-5 text-indigo-400' />
                Kargo Yöntemleri
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-white/10'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Taşıyıcı
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Yöntem
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Tahmini Süre
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Maliyet
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Takip
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Sigorta
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockShippingMethods.map(method => (
                      <tr
                        key={method.id}
                        className='border-b border-white/5 hover:bg-white/5'
                      >
                        <td className='py-3 px-4 text-sm text-white font-medium'>
                          {method.carrier}
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {method.method}
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {method.estimatedDays} gün
                        </td>
                        <td className='py-3 px-4 text-sm text-white font-medium'>
                          ${method.cost} {method.currency}
                        </td>
                        <td className='py-3 px-4'>
                          {method.tracking ? (
                            <CheckCircle className='w-4 h-4 text-green-400' />
                          ) : (
                            <XCircle className='w-4 h-4 text-red-400' />
                          )}
                        </td>
                        <td className='py-3 px-4'>
                          {method.insurance ? (
                            <CheckCircle className='w-4 h-4 text-green-400' />
                          ) : (
                            <XCircle className='w-4 h-4 text-red-400' />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Freight Calculator */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <DollarSign className='w-5 h-5 text-indigo-400' />
                Navlun Hesaplayıcı
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Çıkış Ülkesi/Şehri
                  </label>
                  <input
                    type='text'
                    placeholder='Örn: Shenzhen, China'
                    value={freightOrigin}
                    onChange={e => setFreightOrigin(e.target.value)}
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Varış Ülkesi/Şehri
                  </label>
                  <input
                    type='text'
                    placeholder='Örn: New York, USA'
                    value={freightDestination}
                    onChange={e => setFreightDestination(e.target.value)}
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Ağırlık (kg)
                  </label>
                  <input
                    type='number'
                    placeholder='Örn: 100'
                    value={freightWeight}
                    onChange={e => setFreightWeight(e.target.value)}
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500'
                  />
                </div>
              </div>
              <button
                onClick={handleFreightCalculate}
                className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors'
              >
                Hesapla
              </button>
            </div>

            {/* Active Shipments Tracking */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Truck className='w-5 h-5 text-indigo-400' />
                Aktif Gönderiler ({mockShipmentTracking.length})
              </h3>
              <div className='space-y-4'>
                {mockShipmentTracking.slice(0, 5).map(tracking => (
                  <div
                    key={tracking.id}
                    className='p-4 bg-white/5 rounded-lg border border-white/10'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <p className='text-sm font-medium text-white'>
                          Takip No: {tracking.trackingNumber}
                        </p>
                        <p className='text-xs text-white/60 mt-1'>
                          {tracking.carrier} • Sipariş: {tracking.orderId}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${tracking.status === 'Delivered' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}
                      >
                        {tracking.status}
                      </span>
                    </div>
                    <p className='text-xs text-white/50 mb-3'>
                      <strong>Mevcut Konum:</strong> {tracking.currentLocation}
                    </p>
                    <p className='text-xs text-white/50 mb-3'>
                      <strong>Tahmini Teslimat:</strong>{' '}
                      {new Date(tracking.estimatedDelivery).toLocaleDateString(
                        'tr-TR'
                      )}
                    </p>
                    <div className='space-y-2'>
                      {tracking.events.map((event, idx) => (
                        <div key={idx} className='flex items-start gap-3'>
                          <div className='w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0'></div>
                          <div className='flex-1'>
                            <p className='text-xs text-white/80'>
                              {event.description}
                            </p>
                            <p className='text-xs text-white/50'>
                              {event.location} •{' '}
                              {new Date(event.timestamp).toLocaleString(
                                'tr-TR'
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <>
            {/* Date Range Selector */}
            <div className='flex items-center gap-3 mb-6'>
              <button className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium'>
                Son 7 Gün
              </button>
              <button className='px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors'>
                Son 30 Gün
              </button>
              <button className='px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors'>
                Son 90 Gün
              </button>
              <button className='px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors'>
                Özel Tarih
              </button>
            </div>

            {/* Sales Overview */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-indigo-400' />
                Satış Genel Bakış
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={mockSalesData.slice(-30)}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='rgba(255,255,255,0.1)'
                    />
                    <XAxis
                      dataKey='date'
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#8b5cf6'
                      strokeWidth={2}
                      name='Gelir ($)'
                    />
                    <Line
                      type='monotone'
                      dataKey='orders'
                      stroke='#10b981'
                      strokeWidth={2}
                      name='Sipariş Sayısı'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by Category */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <BarChart3 className='w-5 h-5 text-indigo-400' />
                Kategoriye Göre Gelir
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={mockCategoryRevenue}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='rgba(255,255,255,0.1)'
                    />
                    <XAxis
                      dataKey='category'
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor='end'
                      height={100}
                    />
                    <YAxis
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey='revenue' fill='#f59e0b' name='Gelir ($)' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Star className='w-5 h-5 text-indigo-400' />
                En Çok Satan Ürünler
              </h3>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-white/10'>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Ürün
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        SKU
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Satış
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Gelir
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Görüntülenme
                      </th>
                      <th className='text-left py-3 px-4 text-sm font-medium text-white/60'>
                        Dönüşüm
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTopProducts.map((product, idx) => (
                      <tr
                        key={product.productId}
                        className='border-b border-white/5 hover:bg-white/5'
                      >
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold text-white/60'>
                              #{idx + 1}
                            </span>
                            <span className='text-sm text-white'>
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {product.sku}
                        </td>
                        <td className='py-3 px-4 text-sm text-white font-medium'>
                          {product.sales.toLocaleString()}
                        </td>
                        <td className='py-3 px-4 text-sm text-white font-medium'>
                          ${product.revenue.toLocaleString()}
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {product.views.toLocaleString()}
                        </td>
                        <td className='py-3 px-4 text-sm text-white/80'>
                          {product.conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Traffic Analytics */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5 text-indigo-400' />
                Trafik Analizi
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
                  <p className='text-sm text-white/60 mb-2'>
                    Toplam Sayfa Görüntüleme
                  </p>
                  <p className='text-3xl font-bold text-white'>
                    {mockTrafficData
                      .reduce((sum, d) => sum + d.pageViews, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
                  <p className='text-sm text-white/60 mb-2'>
                    Benzersiz Ziyaretçi
                  </p>
                  <p className='text-3xl font-bold text-white'>
                    {mockTrafficData
                      .reduce((sum, d) => sum + d.uniqueVisitors, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
                  <p className='text-sm text-white/60 mb-2'>
                    Ortalama Çıkma Oranı
                  </p>
                  <p className='text-3xl font-bold text-white'>
                    {(
                      mockTrafficData.reduce(
                        (sum, d) => sum + d.bounceRate,
                        0
                      ) / mockTrafficData.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={mockTrafficData}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke='rgba(255,255,255,0.1)'
                    />
                    <XAxis
                      dataKey='date'
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke='rgba(255,255,255,0.5)'
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='pageViews'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      name='Sayfa Görüntüleme'
                    />
                    <Line
                      type='monotone'
                      dataKey='uniqueVisitors'
                      stroke='#10b981'
                      strokeWidth={2}
                      name='Benzersiz Ziyaretçi'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AlibabaIntegrationPage;
