import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  DollarSign,
} from 'lucide-react';
import { OrderService } from '../../../../infrastructure/services/OrderService';
import {
  OrderStatus,
  PaymentStatus,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../../../domain/enums/OrderStatus';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

const orderService = new OrderService();

interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  variant?: {
    name: string;
    value: string;
  };
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Türkiye',
    },
  });
  const [orderData, setOrderData] = useState({
    orderNumber: '',
    externalOrderId: '',
    marketplaceConnectionId: '',
    subtotal: 0,
    tax: 0,
    shippingCost: 0,
    discount: 0,
    totalAmount: 0,
    currency: 'TRY',
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    shippingMethod: '',
    shippingTrackingNumber: '',
    shippingCarrier: '',
    customerNote: '',
    internalNote: '',
  });

  const tenantId = '00000000-0000-0000-0000-000000000000'; // Mock tenant ID (valid UUID format)

  const addOrderItem = () => {
    const newItem: OrderItem = {
      id: crypto.randomUUID(),
      productId: '',
      sku: '',
      title: '',
      quantity: 1,
      unitPrice: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setOrderItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const tax = subtotal * 0.18; // 18% KDV
    const shippingCost = subtotal > 100 ? 0 : 25; // Ücretsiz kargo 100 TL üzeri
    const discount = 0;
    const totalAmount = subtotal + tax + shippingCost - discount;

    setOrderData(prev => ({
      ...prev,
      subtotal,
      tax,
      shippingCost,
      discount,
      totalAmount,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert('En az bir ürün eklemelisiniz');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Müşteri bilgileri eksik');
      return;
    }

    try {
      setLoading(true);

      const response = await orderService.createOrder({
        tenantId,
        orderNumber: orderData.orderNumber || undefined,
        externalOrderId: orderData.externalOrderId || undefined,
        marketplaceConnectionId: orderData.marketplaceConnectionId || undefined,
        customerInfo,
        items: orderItems.map(item => ({
          productId: item.productId,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          currency: orderData.currency,
          variant: item.variant,
        })),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shippingCost: orderData.shippingCost,
        discount: orderData.discount,
        totalAmount: orderData.totalAmount,
        currency: orderData.currency,
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        shippingMethod: orderData.shippingMethod,
        shippingTrackingNumber: orderData.shippingTrackingNumber,
        shippingCarrier: orderData.shippingCarrier,
        customerNote: orderData.customerNote,
        internalNote: orderData.internalNote,
        createdBy: 'user',
      });

      if (response.success && response.order) {
        navigate(`/dashboard/orders/${response.order.id}`);
      } else {
        alert(response.error || 'Sipariş oluşturulamadı');
      }
    } catch (error) {
      console.error('Create order error:', error);
      alert('Sipariş oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-4'>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className='flex items-center text-gray-600 hover:text-gray-900'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Siparişlere Dön
        </button>
      </div>

      <PageHeader
        title='Yeni Sipariş Oluştur'
        description='Manuel olarak yeni sipariş oluşturun'
      />

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Order Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Basic Information */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Sipariş Bilgileri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Sipariş No
                  </label>
                  <input
                    type='text'
                    value={orderData.orderNumber}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        orderNumber: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Otomatik oluşturulacak'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Dış Sipariş No
                  </label>
                  <input
                    type='text'
                    value={orderData.externalOrderId}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        externalOrderId: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Marketplace sipariş no'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Durum
                  </label>
                  <select
                    value={orderData.status}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        status: e.target.value as OrderStatus,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Ödeme Durumu
                  </label>
                  <select
                    value={orderData.paymentStatus}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        paymentStatus: e.target.value as PaymentStatus,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    {Object.entries(PAYMENT_STATUS_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Müşteri Bilgileri
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Ad Soyad *
                  </label>
                  <input
                    type='text'
                    value={customerInfo.name}
                    onChange={e =>
                      setCustomerInfo(prev => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Email *
                  </label>
                  <input
                    type='email'
                    value={customerInfo.email}
                    onChange={e =>
                      setCustomerInfo(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Telefon
                  </label>
                  <input
                    type='tel'
                    value={customerInfo.phone}
                    onChange={e =>
                      setCustomerInfo(prev => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Şehir
                  </label>
                  <input
                    type='text'
                    value={customerInfo.address.city}
                    onChange={e =>
                      setCustomerInfo(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value },
                      }))
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Adres
                  </label>
                  <textarea
                    value={customerInfo.address.street}
                    onChange={e =>
                      setCustomerInfo(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Sipariş Ürünleri
                </h3>
                <button
                  type='button'
                  onClick={addOrderItem}
                  className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Ürün Ekle
                </button>
              </div>

              <div className='space-y-4'>
                {orderItems.map((item, index) => (
                  <div
                    key={item.id}
                    className='p-4 border border-gray-200 rounded-lg'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
                      <div className='md:col-span-2'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Ürün Adı *
                        </label>
                        <input
                          type='text'
                          value={item.title}
                          onChange={e =>
                            updateOrderItem(index, 'title', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          SKU *
                        </label>
                        <input
                          type='text'
                          value={item.sku}
                          onChange={e =>
                            updateOrderItem(index, 'sku', e.target.value)
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Miktar *
                        </label>
                        <input
                          type='number'
                          min='1'
                          value={item.quantity}
                          onChange={e =>
                            updateOrderItem(
                              index,
                              'quantity',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Birim Fiyat *
                        </label>
                        <input
                          type='number'
                          min='0'
                          step='0.01'
                          value={item.unitPrice}
                          onChange={e =>
                            updateOrderItem(
                              index,
                              'unitPrice',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                          required
                        />
                      </div>
                      <div className='flex items-end'>
                        <button
                          type='button'
                          onClick={() => removeOrderItem(index)}
                          className='w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                    <div className='mt-2 text-sm text-gray-600'>
                      Toplam:{' '}
                      {(item.unitPrice * item.quantity).toLocaleString(
                        'tr-TR',
                        {
                          style: 'currency',
                          currency: 'TRY',
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {orderItems.length === 0 && (
                <div className='text-center py-8 text-gray-500'>
                  <Package className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                  <p>Henüz ürün eklenmemiş</p>
                  <button
                    type='button'
                    onClick={addOrderItem}
                    className='mt-2 text-blue-600 hover:text-blue-800'
                  >
                    İlk ürünü ekle
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Notlar</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Müşteri Notu
                  </label>
                  <textarea
                    value={orderData.customerNote}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        customerNote: e.target.value,
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Müşteri tarafından eklenen not'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    İç Not
                  </label>
                  <textarea
                    value={orderData.internalNote}
                    onChange={e =>
                      setOrderData(prev => ({
                        ...prev,
                        internalNote: e.target.value,
                      }))
                    }
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='İç kullanım için not'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='space-y-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Sipariş Özeti
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Ara Toplam:</span>
                  <span className='font-medium'>
                    {orderData.subtotal.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Vergi (%18):</span>
                  <span className='font-medium'>
                    {orderData.tax.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Kargo:</span>
                  <span className='font-medium'>
                    {orderData.shippingCost.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    })}
                  </span>
                </div>
                {orderData.discount > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>İndirim:</span>
                    <span className='font-medium text-green-600'>
                      -
                      {orderData.discount.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </span>
                  </div>
                )}
                <div className='border-t pt-3'>
                  <div className='flex justify-between text-lg font-bold'>
                    <span>Toplam:</span>
                    <span>
                      {orderData.totalAmount.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='space-y-3'>
                <button
                  type='submit'
                  disabled={loading || orderItems.length === 0}
                  className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
                >
                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Siparişi Oluştur
                    </>
                  )}
                </button>
                <button
                  type='button'
                  onClick={() => navigate('/dashboard/orders')}
                  className='w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
