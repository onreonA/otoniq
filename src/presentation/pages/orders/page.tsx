import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { OrderService } from '../../../infrastructure/services/OrderService';
import { Order } from '../../../domain/entities';
import {
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '../../../domain/enums/OrderStatus';
import { OrderFilters } from '../../../domain/repositories/IOrderRepository';
import {
  generateMockOrders,
  mockOrderStatistics,
} from './mocks/ordersMockData';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';

const orderService = new OrderService();

// Use mock data for now (will be replaced with real API calls)
const USE_MOCK_DATA = true;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OrderFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {} as Record<OrderStatus, number>,
    ordersByPaymentStatus: {} as Record<PaymentStatus, number>,
  });

  const tenantId = '00000000-0000-0000-0000-000000000000'; // Mock tenant ID (valid UUID format)

  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [currentPage, filters, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Use mock data
        const mockOrders = generateMockOrders();
        let filteredOrders = mockOrders;

        // Apply search filter
        if (searchTerm) {
          filteredOrders = filteredOrders.filter(
            order =>
              order.orderNumber
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.customerInfo.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              order.customerInfo.email
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          );
        }

        // Apply status filter
        if (filters.status) {
          filteredOrders = filteredOrders.filter(
            order => order.status === filters.status
          );
        }

        // Apply payment status filter
        if (filters.paymentStatus) {
          filteredOrders = filteredOrders.filter(
            order => order.paymentStatus === filters.paymentStatus
          );
        }

        // Simulate pagination
        const limit = 20;
        const offset = (currentPage - 1) * limit;
        const paginatedOrders = filteredOrders.slice(offset, offset + limit);

        setOrders(paginatedOrders);
        setTotalPages(Math.ceil(filteredOrders.length / limit));
        setTotalOrders(filteredOrders.length);
      } else {
        // Use real API
        const response = await orderService.getOrders({
          tenantId,
          filters: {
            ...filters,
            search: searchTerm || undefined,
          },
          pagination: {
            page: currentPage,
            limit: 20,
          },
          sort: {
            field: 'orderDate',
            direction: 'desc',
          },
        });

        if (response.success && response.orders) {
          setOrders(response.orders);
          setTotalPages(response.totalPages || 1);
          setTotalOrders(response.total || 0);
        } else {
          setError(response.error || 'Siparişler yüklenemedi');
        }
      }
    } catch (err) {
      console.error('Load orders error:', err);
      setError('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Use mock statistics
        setStatistics(mockOrderStatistics);
      } else {
        // Use real API
        const stats = await orderService.getOrderStatistics(tenantId);
        setStatistics(stats);
      }
    } catch (err) {
      console.error('Load statistics error:', err);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      shipped: 'bg-purple-500/20 text-purple-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      refunded: 'bg-gray-500/20 text-gray-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      paid: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400',
      refunded: 'bg-gray-500/20 text-gray-400',
      partially_refunded: 'bg-orange-500/20 text-orange-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Sipariş Yönetimi
            </h1>
            <p className='text-gray-400'>
              Tüm siparişlerinizi buradan yönetebilirsiniz
            </p>
          </div>
          <div className='flex items-center space-x-3'>
            <button className='flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-white rounded-lg transition-colors border border-gray-700'>
              <Download className='w-4 h-4' />
              <span>Dışa Aktar</span>
            </button>
            <Link
              to='/orders/create'
              className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20'
            >
              <Plus className='w-4 h-4' />
              <span>Yeni Sipariş</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-blue-500/20 rounded-lg'>
                <Package className='w-6 h-6 text-blue-400' />
              </div>
              <div className='flex items-center space-x-1 text-sm'>
                <TrendingUp className='w-4 h-4 text-green-400' />
                <span className='text-green-400'>↑ 12%</span>
              </div>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Toplam Sipariş</p>
              <p className='text-3xl font-bold text-white'>
                {statistics.totalOrders}
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-green-500/20 rounded-lg'>
                <DollarSign className='w-6 h-6 text-green-400' />
              </div>
              <div className='flex items-center space-x-1 text-sm'>
                <TrendingUp className='w-4 h-4 text-green-400' />
                <span className='text-green-400'>↑ 8%</span>
              </div>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Toplam Gelir</p>
              <p className='text-3xl font-bold text-white'>
                {statistics.totalRevenue.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-purple-500/20 rounded-lg'>
                <TrendingUp className='w-6 h-6 text-purple-400' />
              </div>
              <div className='flex items-center space-x-1 text-sm'>
                <TrendingUp className='w-4 h-4 text-green-400' />
                <span className='text-green-400'>↑ 5%</span>
              </div>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Ortalama Sipariş</p>
              <p className='text-3xl font-bold text-white'>
                {statistics.averageOrderValue.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 bg-orange-500/20 rounded-lg'>
                <AlertCircle className='w-6 h-6 text-orange-400' />
              </div>
              <div className='flex items-center space-x-1 text-sm'>
                <TrendingUp className='w-4 h-4 text-red-400 rotate-180' />
                <span className='text-red-400'>↓ 2%</span>
              </div>
            </div>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Bekleyen Siparişler</p>
              <p className='text-3xl font-bold text-white'>
                {statistics.ordersByStatus.pending || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
          <input
            type='text'
            placeholder='Sipariş no, müşteri adı veya email ara...'
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className='w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden'>
        <div className='p-6 border-b border-gray-700/50'>
          <h2 className='text-xl font-semibold text-white'>
            Siparişler ({totalOrders})
          </h2>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </div>
        ) : error ? (
          <div className='p-6 text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4'>
              <AlertCircle className='w-8 h-8 text-red-400' />
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Bir Hata Oluştu
            </h3>
            <p className='text-gray-400 mb-4'>{error}</p>
            <button
              onClick={loadOrders}
              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
            >
              Tekrar Dene
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className='p-12 text-center'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-700/50 rounded-full mb-4'>
              <Package className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Henüz Sipariş Yok
            </h3>
            <p className='text-gray-400 mb-6'>
              İlk siparişinizi oluşturarak başlayın
            </p>
            <Link
              to='/orders/create'
              className='inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20'
            >
              <Plus className='w-5 h-5' />
              <span>İlk Siparişi Oluştur</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-700/50'>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Sipariş No
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Müşteri
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Tarih
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Durum
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Ödeme
                    </th>
                    <th className='px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      Toplam
                    </th>
                    <th className='px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider'>
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700/50'>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className='hover:bg-gray-700/20 transition-colors'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Link
                          to={`/orders/${order.id}`}
                          className='text-blue-400 hover:text-blue-300 font-medium'
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className='px-6 py-4'>
                        <div>
                          <div className='text-white font-medium'>
                            {order.customerInfo.name}
                          </div>
                          <div className='text-gray-400 text-sm'>
                            {order.customerInfo.email}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-gray-300'>
                        {new Date(order.orderDate).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                        <div className='text-gray-500 text-sm'>
                          {new Date(order.orderDate).toLocaleTimeString(
                            'tr-TR',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
                        >
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <div className='text-white font-semibold'>
                          {order.totalAmount.getFormattedAmount()}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right'>
                        <Link
                          to={`/orders/${order.id}`}
                          className='inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors'
                        >
                          <Eye className='w-4 h-4' />
                          <span className='text-sm'>Görüntüle</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-6 py-4 border-t border-gray-700/50'>
                <div className='text-sm text-gray-400'>
                  Toplam {totalOrders} sipariş bulundu
                </div>
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className='px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600'
                  >
                    Önceki
                  </button>
                  <span className='text-sm text-gray-400 px-4'>
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className='px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600'
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
