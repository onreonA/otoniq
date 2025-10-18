import { useState, useMemo } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  DollarSign,
  Warehouse,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import type {
  StockLevel,
  StockMovement,
  Warehouse as WarehouseType,
} from '../../../domain/entities/Inventory';
import LowStockAlertWidget from './components/LowStockAlertWidget';

type TabType = 'stock' | 'movements' | 'warehouses';

const InventoryPage = () => {
  const { warehouses, stockLevels, stockMovements, loading, error } =
    useInventory();
  const [activeTab, setActiveTab] = useState<TabType>('stock');

  // Calculate stats from real data
  const stats = useMemo(() => {
    // Benzersiz ürün sayısı (productId'ye göre grupla)
    const uniqueProductIds = new Set(stockLevels.map(s => s.productId));
    const totalProducts = uniqueProductIds.size;
    const totalStockRecords = stockLevels.length;

    const lowStock = stockLevels.filter(
      s => s.availableQuantity <= s.minimumQuantity
    ).length;
    const outOfStock = stockLevels.filter(
      s => s.availableQuantity === 0
    ).length;
    const totalValue = stockLevels.reduce(
      (sum, s) => sum + s.availableQuantity * (s.averageCost || 0),
      0
    );

    return {
      totalProducts, // Benzersiz ürün sayısı
      totalStockRecords, // Depo bazında toplam kayıt sayısı
      lowStock,
      outOfStock,
      totalValue,
    };
  }, [stockLevels]);

  // Helper functions
  const getStockStatusColor = (available: number, reorderPoint: number) => {
    if (available === 0) return 'bg-red-100 text-red-800 border-red-300';
    if (available <= reorderPoint)
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getStockStatusLabel = (available: number, reorderPoint: number) => {
    if (available === 0) return 'Stok Yok';
    if (available <= reorderPoint) return 'Az Stok';
    return 'Stokta';
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sale':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'transfer_in':
      case 'transfer_out':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'return':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'damage':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Satın Alma';
      case 'sale':
        return 'Satış';
      case 'transfer_in':
        return 'Transfer Giriş';
      case 'transfer_out':
        return 'Transfer Çıkış';
      case 'adjustment':
        return 'Düzeltme';
      case 'return':
        return 'İade';
      case 'production':
        return 'Üretim';
      case 'damage':
        return 'Hasar';
      case 'count':
        return 'Sayım';
      case 'reservation':
        return 'Rezervasyon';
      case 'release':
        return 'Serbest Bırakma';
      default:
        return 'Bilinmeyen';
    }
  };
  const [filterWarehouse, setFilterWarehouse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const tabs = [
    { id: 'stock' as TabType, label: 'Stok Durumu', icon: Package },
    { id: 'movements' as TabType, label: 'Stok Hareketleri', icon: RefreshCw },
    { id: 'warehouses' as TabType, label: 'Depolar', icon: Warehouse },
  ];

  const filteredStockLevels = stockLevels.filter(stock => {
    if (filterWarehouse !== 'all' && stock.warehouseId !== filterWarehouse)
      return false;

    // Calculate status from availableQuantity and minimumQuantity
    if (filterStatus !== 'all') {
      const status =
        stock.availableQuantity === 0
          ? 'out_of_stock'
          : stock.availableQuantity <= stock.minimumQuantity
            ? 'low_stock'
            : 'in_stock';

      if (status !== filterStatus) return false;
    }

    return true;
  });

  if (loading && stockLevels.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Error Display */}
      {error && (
        <div className='mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3'>
          <AlertCircle className='w-5 h-5 text-red-400' />
          <p className='text-red-200'>{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className='mb-6 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20'>
        <h1 className='text-3xl font-bold text-white mb-2'>Stok Yönetimi</h1>
        <p className='text-white/80'>
          Tüm depolarınızdaki stok seviyelerini takip edin ve yönetin
        </p>
      </div>

      {/* Low Stock Alert Widget - N8N Integration */}
      <div className='mb-6'>
        <LowStockAlertWidget />
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-5 gap-4 mb-6'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Benzersiz Ürün</span>
            <Package className='w-5 h-5 text-blue-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats.totalProducts}</p>
          <p className='text-xs text-white/50 mt-1'>
            {stats.totalStockRecords} stok kaydı
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Depolar</span>
            <TrendingUp className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{warehouses.length}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Düşük Stok</span>
            <AlertTriangle className='w-5 h-5 text-yellow-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats.lowStock}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Tükenen</span>
            <XCircle className='w-5 h-5 text-red-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats.outOfStock}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Değer</span>
            <DollarSign className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-2xl font-bold text-white'>
            ₺{(stats.totalValue / 1000).toFixed(0)}K
          </p>
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
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
            }`}
          >
            <tab.icon className='w-4 h-4' />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'stock' && (
          <div className='space-y-6'>
            {/* Filters */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Depo
                  </label>
                  <select
                    value={filterWarehouse}
                    onChange={e => setFilterWarehouse(e.target.value)}
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                  >
                    <option value='all'>Tüm Depolar</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-white/80 mb-2'>
                    Durum
                  </label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white'
                  >
                    <option value='all'>Tüm Durumlar</option>
                    <option value='in_stock'>Stokta</option>
                    <option value='low_stock'>Düşük Stok</option>
                    <option value='out_of_stock'>Tükendi</option>
                    <option value='overstock'>Fazla Stok</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Table */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-white/5 border-b border-white/10'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Ürün
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                        SKU
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Depo
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Miktar
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Rezerve
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Kullanılabilir
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                        Durum
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-white/10'>
                    {filteredStockLevels.map(stock => (
                      <tr key={stock.id} className='hover:bg-white/5'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-white'>
                            {stock.productName || 'Bilinmeyen Ürün'}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-white/70'>
                            {stock.productSku || 'N/A'}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-white/70'>
                            {stock.warehouseName || 'Bilinmeyen Depo'}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                          <div className='text-sm font-semibold text-white'>
                            {stock.quantity.toFixed(0)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                          <div className='text-sm text-yellow-400'>
                            {stock.reservedQuantity.toFixed(0)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                          <div className='text-sm text-green-400'>
                            {stock.availableQuantity.toFixed(0)}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStockStatusColor(stock.availableQuantity, stock.minimumQuantity)}`}
                          >
                            {getStockStatusLabel(
                              stock.availableQuantity,
                              stock.minimumQuantity
                            )}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-center'>
                          <button className='p-2 hover:bg-blue-500/20 rounded transition-colors'>
                            <Edit2 className='w-4 h-4 text-blue-400' />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStockLevels.length === 0 && (
                <div className='text-center py-12'>
                  <Package className='w-12 h-12 text-white/30 mx-auto mb-3' />
                  <p className='text-white/60'>Stok verisi bulunamadı</p>
                  <p className='text-white/40 text-sm mt-1'>
                    Filtreleri kontrol edin veya yeni stok ekleyin
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Stok Hareketleri
            </h2>
            <div className='space-y-3'>
              {stockMovements.map(movement => (
                <div
                  key={movement.id}
                  className='flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10'
                >
                  <div className='flex items-start gap-4 flex-1'>
                    <div
                      className={`p-2 rounded-lg ${getMovementTypeColor(movement.movementType)}`}
                    >
                      {(movement.movementType === 'purchase' ||
                        movement.movementType === 'transfer_in' ||
                        movement.movementType === 'return') && (
                        <ArrowUpCircle className='w-5 h-5 text-green-600' />
                      )}
                      {(movement.movementType === 'sale' ||
                        movement.movementType === 'transfer_out' ||
                        movement.movementType === 'damage') && (
                        <ArrowDownCircle className='w-5 h-5 text-red-600' />
                      )}
                      {(movement.movementType === 'adjustment' ||
                        movement.movementType === 'count') && (
                        <Edit2 className='w-5 h-5 text-yellow-600' />
                      )}
                      {(movement.movementType === 'production' ||
                        movement.movementType === 'reservation' ||
                        movement.movementType === 'release') && (
                        <RefreshCw className='w-5 h-5 text-blue-600' />
                      )}
                    </div>

                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-sm font-medium text-white'>
                          {movement.productName || 'Bilinmeyen Ürün'}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getMovementTypeColor(movement.movementType)}`}
                        >
                          {getMovementTypeLabel(movement.movementType)}
                        </span>
                      </div>
                      <p className='text-xs text-white/50 mb-1'>
                        SKU: {movement.productSku || 'N/A'} •{' '}
                        {movement.warehouseName || 'Bilinmeyen Depo'}
                      </p>
                      <p className='text-xs text-white/70'>
                        {movement.notes || 'Not yok'} •{' '}
                        {movement.referenceNumber || 'Referans yok'}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <p
                      className={`text-lg font-bold ${
                        movement.movementType === 'purchase' ||
                        movement.movementType === 'transfer_in' ||
                        movement.movementType === 'return'
                          ? 'text-green-400'
                          : movement.movementType === 'sale' ||
                              movement.movementType === 'transfer_out' ||
                              movement.movementType === 'damage'
                            ? 'text-red-400'
                            : 'text-blue-400'
                      }`}
                    >
                      {movement.movementType === 'purchase' ||
                      movement.movementType === 'transfer_in' ||
                      movement.movementType === 'return'
                        ? '+'
                        : movement.movementType === 'sale' ||
                            movement.movementType === 'transfer_out' ||
                            movement.movementType === 'damage'
                          ? '-'
                          : ''}
                      {Math.abs(movement.quantity).toFixed(0)}
                    </p>
                    <p className='text-xs text-white/50'>
                      {movement.createdAt
                        ? new Date(movement.createdAt).toLocaleString('tr-TR')
                        : 'N/A'}
                    </p>
                    <p className='text-xs text-white/50'>
                      {movement.createdBy || 'System'}
                    </p>
                  </div>
                </div>
              ))}
              {stockMovements.length === 0 && (
                <div className='text-center py-12'>
                  <RefreshCw className='w-12 h-12 text-white/30 mx-auto mb-3' />
                  <p className='text-white/60'>Stok hareketi bulunamadı</p>
                  <p className='text-white/40 text-sm mt-1'>
                    Henüz stok hareketi kaydedilmemiş
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {warehouses.map(warehouse => (
              <div
                key={warehouse.id}
                className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <Warehouse className='w-8 h-8 text-yellow-400' />
                    <div>
                      <h3 className='text-lg font-bold text-white'>
                        {warehouse.name}
                      </h3>
                      <p className='text-xs text-white/50'>{warehouse.code}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      warehouse.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {warehouse.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className='space-y-2 text-sm mb-4'>
                  <p className='text-white/70'>{warehouse.address}</p>
                  <p className='text-white/60'>
                    {warehouse.city}, {warehouse.country}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-white/5 p-3 rounded-lg'>
                    <p className='text-xs text-white/60 mb-1'>Kod</p>
                    <p className='text-xl font-bold text-white'>
                      {warehouse.code || 'N/A'}
                    </p>
                  </div>
                  <div className='bg-white/5 p-3 rounded-lg'>
                    <p className='text-xs text-white/60 mb-1'>Durum</p>
                    <p className='text-xl font-bold text-white'>
                      {warehouse.isActive ? '✓ Aktif' : '✗ Pasif'}
                    </p>
                  </div>
                  <div className='col-span-2 bg-white/5 p-3 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-xs text-white/60'>Doluluk Oranı</p>
                      <p className='text-xs text-white font-medium'>
                        {warehouse.totalCapacity && warehouse.currentUsage
                          ? (
                              (warehouse.currentUsage /
                                warehouse.totalCapacity) *
                              100
                            ).toFixed(1)
                          : '0'}
                        %
                      </p>
                    </div>
                    <div className='w-full bg-white/10 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full'
                        style={{
                          width: `${
                            warehouse.totalCapacity && warehouse.currentUsage
                              ? Math.min(
                                  (warehouse.currentUsage /
                                    warehouse.totalCapacity) *
                                    100,
                                  100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {warehouses.length === 0 && (
              <div className='col-span-full text-center py-12'>
                <Warehouse className='w-12 h-12 text-white/30 mx-auto mb-3' />
                <p className='text-white/60'>Depo bulunamadı</p>
                <p className='text-white/40 text-sm mt-1'>
                  İlk depoyu oluşturun
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
