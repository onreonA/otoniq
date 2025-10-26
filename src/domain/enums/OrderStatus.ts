/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Order Status Labels (Turkish)
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Beklemede',
  [OrderStatus.PROCESSING]: 'İşleniyor',
  [OrderStatus.SHIPPED]: 'Kargoya Verildi',
  [OrderStatus.DELIVERED]: 'Teslim Edildi',
  [OrderStatus.CANCELLED]: 'İptal Edildi',
  [OrderStatus.REFUNDED]: 'İade Edildi',
};

/**
 * Payment Status Labels (Turkish)
 */
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Beklemede',
  [PaymentStatus.PAID]: 'Ödendi',
  [PaymentStatus.FAILED]: 'Başarısız',
  [PaymentStatus.REFUNDED]: 'İade Edildi',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Kısmi İade',
};

/**
 * Order Status Colors (Tailwind CSS)
 */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800 border-green-200',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Payment Status Colors (Tailwind CSS)
 */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800 border-green-200',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800 border-red-200',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [PaymentStatus.PARTIALLY_REFUNDED]:
    'bg-orange-100 text-orange-800 border-orange-200',
};

