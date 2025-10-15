import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Eye,
  Download,
  Printer,
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import type { OrderStatus } from '../../../domain/entities/Order';

const OrdersPage = () => {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { orders, stats, loading, error } = useOrders();

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      if (
        searchTerm &&
        !order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [orders, filterStatus, searchTerm]);

  const statusCounts = useMemo(
    () => ({
      all: orders.length,
      pending: stats?.pending || 0,
      confirmed: stats?.confirmed || 0,
      preparing: stats?.preparing || 0,
      shipped: stats?.shipped || 0,
      delivered: stats?.delivered || 0,
      cancelled: stats?.cancelled || 0,
    }),
    [orders.length, stats]
  );

  // Helper functions
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Bekliyor';
      case 'partial':
        return 'Kısmi';
      case 'refunded':
        return 'İade';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'web':
        return 'Web';
      case 'mobile':
        return 'Mobil';
      case 'marketplace':
        return 'Pazaryeri';
      case 'phone':
        return 'Telefon';
      case 'store':
        return 'Mağaza';
      default:
        return channel;
    }
  };

  if (loading && orders.length === 0) {
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
      <div className='mb-6 bg-gradient-to-r from-red-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20'>
        <h1 className='text-3xl font-bold text-white mb-2'>Sipariş Yönetimi</h1>
        <p className='text-white/80'>
          Tüm siparişlerinizi takip edin ve yönetin
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-6 gap-4 mb-6'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Sipariş</span>
            <ShoppingCart className='w-5 h-5 text-blue-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.total || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Bekleyen</span>
            <Clock className='w-5 h-5 text-yellow-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.pending || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Ciro</span>
            <DollarSign className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-2xl font-bold text-white'>
            ₺{((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Ort. Sepet</span>
            <TrendingUp className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-2xl font-bold text-white'>
            ₺{(stats?.averageOrderValue || 0).toLocaleString('tr-TR')}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Bugün</span>
            <Package className='w-5 h-5 text-orange-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.total || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>İptal Oranı</span>
            <AlertCircle className='w-5 h-5 text-red-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {stats?.total && stats?.cancelled
              ? ((stats.cancelled / stats.total) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6'>
        <div className='flex flex-col md:flex-row gap-4 mb-4'>
          {/* Search */}
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Sipariş no veya müşteri adı ara...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50'
            />
          </div>

          {/* Bulk Actions */}
          <div className='flex gap-2'>
            <button className='px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2'>
              <Printer className='w-4 h-4' />
              <span>Yazdır</span>
            </button>
            <button className='px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2'>
              <Download className='w-4 h-4' />
              <span>İndir</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className='flex items-center gap-2 overflow-x-auto pb-2'>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as OrderStatus | 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {status === 'all'
                ? 'Tümü'
                : getOrderStatusLabel(status as OrderStatus)}{' '}
              ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-white/5 border-b border-white/10'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Sipariş No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Müşteri
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Durum
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Ödeme
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Kanal
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Toplam
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Tarih
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/10'>
              {filteredOrders.map(order => (
                <tr key={order.id} className='hover:bg-white/5'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-white'>
                      {order.orderNumber}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-white'>
                      {order.customerName}
                    </div>
                    <div className='text-xs text-white/50'>
                      {order.customerEmail}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getOrderStatusColor(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='text-sm text-white/70'>
                      {getChannelLabel(order.channel)}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <div className='text-sm font-semibold text-white'>
                      ₺
                      {(order.totalAmount || 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='text-sm text-white/70'>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('tr-TR')
                        : 'N/A'}
                    </div>
                    <div className='text-xs text-white/50'>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString(
                            'tr-TR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'N/A'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <button className='p-2 hover:bg-blue-500/20 rounded transition-colors'>
                      <Eye className='w-4 h-4 text-blue-400' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className='text-center py-12'>
            <Package className='w-16 h-16 text-white/20 mx-auto mb-4' />
            <p className='text-white/60'>Sipariş bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
