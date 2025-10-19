import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Send,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { OrderService } from '../../../../infrastructure/services/OrderService';
import { Order, OrderStatusHistory } from '../../../../domain/entities';
import {
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
} from '../../../../domain/enums/OrderStatus';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorState } from '../../../components/common/ErrorState';
import { EmptyState } from '../../../components/common/EmptyState';
import { generateMockOrders } from '../mocks/ordersMockData';

const orderService = new OrderService();

// Use mock data for now (will be replaced with real API calls)
const USE_MOCK_DATA = true;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const tenantId = '00000000-0000-0000-0000-000000000000'; // Mock tenant ID (valid UUID format)

  useEffect(() => {
    if (id) {
      loadOrder();
      loadStatusHistory();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_MOCK_DATA) {
        // Use mock data
        const mockOrders = generateMockOrders();
        const foundOrder = mockOrders.find(order => order.id === id);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Sipariş bulunamadı');
        }
      } else {
        // Use real API
        const response = await orderService.getOrder({
          orderId: id!,
          tenantId,
        });

        if (response.success && response.order) {
          setOrder(response.order);
        } else {
          setError(response.error || 'Sipariş bulunamadı');
        }
      }
    } catch (err) {
      console.error('Load order error:', err);
      setError('Sipariş yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadStatusHistory = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Use mock status history
        const mockHistory: OrderStatusHistory[] = [
          {
            id: 'hist-001',
            orderId: id!,
            tenantId,
            oldStatus: OrderStatus.PENDING,
            newStatus: OrderStatus.PROCESSING,
            note: 'Sipariş işleme alındı',
            changedBy: 'system',
            changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            getChangeDescription: function () {
              return `Durum ${ORDER_STATUS_LABELS[this.oldStatus]}'den ${ORDER_STATUS_LABELS[this.newStatus]}'ye değiştirildi`;
            },
            getFormattedTimestamp: function () {
              return this.changedAt.toLocaleString('tr-TR');
            },
          },
          {
            id: 'hist-002',
            orderId: id!,
            tenantId,
            oldStatus: undefined,
            newStatus: OrderStatus.PENDING,
            note: 'Sipariş oluşturuldu',
            changedBy: 'system',
            changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            getChangeDescription: function () {
              return `Sipariş ${ORDER_STATUS_LABELS[this.newStatus]} durumunda oluşturuldu`;
            },
            getFormattedTimestamp: function () {
              return this.changedAt.toLocaleString('tr-TR');
            },
          },
        ];
        setStatusHistory(mockHistory);
      } else {
        // Use real API
        const history = await orderService.getOrderStatusHistory(id!);
        setStatusHistory(history);
      }
    } catch (err) {
      console.error('Load status history error:', err);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setUpdating(true);

      if (USE_MOCK_DATA) {
        // Mock status update
        const updatedOrder = { ...order, status: newStatus };
        setOrder(updatedOrder);
        await loadStatusHistory();
      } else {
        // Use real API
        const response = await orderService.updateOrderStatus({
          orderId: order.id,
          tenantId,
          newStatus,
          changedBy: 'user',
        });

        if (response.success && response.order) {
          setOrder(response.order);
          await loadStatusHistory();
        } else {
          console.error('Status update failed:', response.error);
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      if (USE_MOCK_DATA) {
        // Mock cancel order
        const updatedOrder = { ...order, status: OrderStatus.CANCELLED };
        setOrder(updatedOrder);
        await loadStatusHistory();
      } else {
        // Use real API
        const response = await orderService.cancelOrder({
          orderId: order.id,
          tenantId,
          reason: 'Manuel iptal',
          cancelledBy: 'user',
        });

        if (response.success && response.order) {
          setOrder(response.order);
          await loadStatusHistory();
        } else {
          console.error('Cancel order failed:', response.error);
        }
      }
    } catch (err) {
      console.error('Cancel order error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      if (USE_MOCK_DATA) {
        // Mock refund
        const updatedOrder = {
          ...order,
          status: OrderStatus.REFUNDED,
          paymentStatus: PaymentStatus.REFUNDED,
        };
        setOrder(updatedOrder);
        await loadStatusHistory();
      } else {
        // Use real API
        const response = await orderService.processRefund({
          orderId: order.id,
          tenantId,
          reason: 'Müşteri talebi',
          processedBy: 'user',
        });

        if (response.success && response.order) {
          setOrder(response.order);
          await loadStatusHistory();
        } else {
          console.error('Refund failed:', response.error);
        }
      }
    } catch (err) {
      console.error('Refund error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className='h-4 w-4' />;
      case OrderStatus.PROCESSING:
        return <Package className='h-4 w-4' />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle className='h-4 w-4' />;
      case OrderStatus.SHIPPED:
        return <Truck className='h-4 w-4' />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className='h-4 w-4' />;
      case OrderStatus.CANCELLED:
        return <XCircle className='h-4 w-4' />;
      case OrderStatus.REFUNDED:
        return <DollarSign className='h-4 w-4' />;
      case OrderStatus.FAILED:
        return <AlertCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.PROCESSING;
      case OrderStatus.PROCESSING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.SHIPPED;
      case OrderStatus.SHIPPED:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-400'>Sipariş yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4'>
            <AlertCircle className='w-8 h-8 text-red-400' />
          </div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            Bir Hata Oluştu
          </h3>
          <p className='text-gray-400 mb-4'>{error}</p>
          <button
            onClick={loadOrder}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-gray-700/50 rounded-full mb-4'>
            <Package className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            Sipariş Bulunamadı
          </h3>
          <p className='text-gray-400 mb-6'>Bu sipariş mevcut değil.</p>
          <Link
            to='/orders'
            className='inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20'
          >
            <ArrowLeft className='w-5 h-5' />
            <span>Siparişlere Dön</span>
          </Link>
        </div>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link
              to='/orders'
              className='flex items-center text-gray-400 hover:text-white transition-colors'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Siparişlere Dön
            </Link>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => window.print()}
              className='flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors'
            >
              <Download className='h-4 w-4 mr-2' />
              Yazdır
            </button>
            {nextStatus && (
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={updating}
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20'
              >
                {getStatusIcon(nextStatus)}
                <span className='ml-2'>
                  {ORDER_STATUS_LABELS[nextStatus]} Olarak İşaretle
                </span>
              </button>
            )}
            {order.canBeCancelled() && (
              <button
                onClick={handleCancelOrder}
                disabled={updating}
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20'
              >
                <XCircle className='h-4 w-4 mr-2' />
                İptal Et
              </button>
            )}
            {order.canBeRefunded() && (
              <button
                onClick={handleRefund}
                disabled={updating}
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20'
              >
                <DollarSign className='h-4 w-4 mr-2' />
                İade Et
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Order Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Header */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h1 className='text-3xl font-bold text-white mb-2'>
                    {order.orderNumber}
                  </h1>
                  <p className='text-gray-400'>
                    {new Date(order.orderDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400'>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400'>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </span>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-gray-700/30 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-3 flex items-center'>
                    <FileText className='w-5 h-5 mr-2 text-blue-400' />
                    Sipariş Bilgileri
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Sipariş No:</span>
                      <span className='font-medium text-white'>
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Toplam Tutar:</span>
                      <span className='font-medium text-white'>
                        {order.totalAmount.getFormattedAmount()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Para Birimi:</span>
                      <span className='font-medium text-white'>
                        {order.currency}
                      </span>
                    </div>
                    {order.externalOrderId && (
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>Dış Sipariş No:</span>
                        <span className='font-medium text-white'>
                          {order.externalOrderId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='bg-gray-700/30 rounded-lg p-4'>
                  <h3 className='text-lg font-semibold text-white mb-3 flex items-center'>
                    <User className='w-5 h-5 mr-2 text-green-400' />
                    Müşteri Bilgileri
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-center'>
                      <User className='h-4 w-4 mr-2 text-gray-400' />
                      <span className='font-medium text-white'>
                        {order.customerInfo.name}
                      </span>
                    </div>
                    <div className='flex items-center'>
                      <Mail className='h-4 w-4 mr-2 text-gray-400' />
                      <span className='text-gray-300'>
                        {order.customerInfo.email}
                      </span>
                    </div>
                    {order.customerInfo.phone && (
                      <div className='flex items-center'>
                        <Phone className='h-4 w-4 mr-2 text-gray-400' />
                        <span className='text-gray-300'>
                          {order.customerInfo.phone}
                        </span>
                      </div>
                    )}
                    <div className='flex items-start'>
                      <MapPin className='h-4 w-4 mr-2 text-gray-400 mt-0.5' />
                      <div className='text-gray-300'>
                        <div>{order.customerInfo.address.street}</div>
                        <div>
                          {order.customerInfo.address.postalCode}{' '}
                          {order.customerInfo.address.city}
                        </div>
                        <div>{order.customerInfo.address.country}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden'>
              <div className='p-6 border-b border-gray-700/50'>
                <h3 className='text-xl font-semibold text-white flex items-center'>
                  <Package className='w-6 h-6 mr-2 text-purple-400' />
                  Sipariş Ürünleri ({order.items.length})
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className='flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/50 rounded-lg hover:bg-gray-700/50 transition-colors'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center'>
                          <Package className='h-6 w-6 text-purple-400' />
                        </div>
                        <div>
                          <h4 className='font-medium text-white'>
                            {item.title}
                          </h4>
                          <p className='text-sm text-gray-400'>
                            SKU: {item.sku}
                          </p>
                          {item.variant && (
                            <p className='text-sm text-gray-500'>
                              {item.variant.name}: {item.variant.value}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-medium text-white'>
                          {item.calculateLineTotal().getFormattedAmount()}
                        </div>
                        <div className='text-sm text-gray-400'>
                          {item.quantity} ×{' '}
                          {item.unitPrice.getFormattedAmount()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-6 pt-6 border-t border-gray-700/50'>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Ara Toplam:</span>
                      <span className='font-medium text-white'>
                        {order.subtotal.getFormattedAmount()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Vergi:</span>
                      <span className='font-medium text-white'>
                        {order.tax.getFormattedAmount()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>Kargo:</span>
                      <span className='font-medium text-white'>
                        {order.shippingCost.getFormattedAmount()}
                      </span>
                    </div>
                    {order.discount.getAmount() > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-400'>İndirim:</span>
                        <span className='font-medium text-green-400'>
                          -{order.discount.getFormattedAmount()}
                        </span>
                      </div>
                    )}
                    <div className='flex justify-between text-xl font-bold border-t border-gray-700/50 pt-3'>
                      <span className='text-white'>Toplam:</span>
                      <span className='text-white'>
                        {order.totalAmount.getFormattedAmount()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden'>
              <div className='p-6 border-b border-gray-700/50'>
                <h3 className='text-xl font-semibold text-white flex items-center'>
                  <Clock className='w-6 h-6 mr-2 text-orange-400' />
                  Durum Geçmişi
                </h3>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  {statusHistory.map((history, index) => (
                    <div
                      key={history.id}
                      className='flex items-start space-x-3'
                    >
                      <div className='flex-shrink-0'>
                        <div className='w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center'>
                          {getStatusIcon(history.newStatus)}
                        </div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium text-white'>
                            {history.getChangeDescription()}
                          </p>
                          <p className='text-sm text-gray-400'>
                            {history.getFormattedTimestamp()}
                          </p>
                        </div>
                        {history.note && (
                          <p className='text-sm text-gray-400 mt-1'>
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                <Send className='w-5 h-5 mr-2 text-blue-400' />
                Hızlı İşlemler
              </h3>
              <div className='space-y-3'>
                {nextStatus && (
                  <button
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20'
                  >
                    {getStatusIcon(nextStatus)}
                    <span className='ml-2'>
                      {ORDER_STATUS_LABELS[nextStatus]} Olarak İşaretle
                    </span>
                  </button>
                )}
                {order.canBeCancelled() && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20'
                  >
                    <XCircle className='h-4 w-4 mr-2' />
                    Siparişi İptal Et
                  </button>
                )}
                {order.canBeRefunded() && (
                  <button
                    onClick={handleRefund}
                    disabled={updating}
                    className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20'
                  >
                    <DollarSign className='h-4 w-4 mr-2' />
                    İade İşlemi
                  </button>
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                <MessageSquare className='w-5 h-5 mr-2 text-green-400' />
                Notlar
              </h3>
              <div className='space-y-4'>
                {order.customerNote && (
                  <div>
                    <h4 className='text-sm font-medium text-white mb-2'>
                      Müşteri Notu
                    </h4>
                    <p className='text-sm text-gray-300 bg-gray-700/50 p-3 rounded-lg'>
                      {order.customerNote}
                    </p>
                  </div>
                )}
                {order.internalNote && (
                  <div>
                    <h4 className='text-sm font-medium text-white mb-2'>
                      İç Not
                    </h4>
                    <p className='text-sm text-gray-300 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20'>
                      {order.internalNote}
                    </p>
                  </div>
                )}
                {!order.customerNote && !order.internalNote && (
                  <p className='text-sm text-gray-500'>Henüz not eklenmemiş</p>
                )}
              </div>
            </div>

            {/* Integration Status */}
            <div className='bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center'>
                <CreditCard className='w-5 h-5 mr-2 text-purple-400' />
                Entegrasyon Durumu
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-400'>N8N Workflow:</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.n8nWorkflowTriggered
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {order.n8nWorkflowTriggered ? 'Çalıştı' : 'Bekliyor'}
                  </span>
                </div>
                {order.odooSaleOrderId && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-400'>Odoo:</span>
                    <span className='text-sm font-medium text-green-400'>
                      {order.odooSaleOrderId}
                    </span>
                  </div>
                )}
                {order.odooInvoiceId && (
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-400'>Fatura:</span>
                    <span className='text-sm font-medium text-green-400'>
                      {order.odooInvoiceId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
