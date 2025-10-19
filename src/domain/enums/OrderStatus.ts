export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Bekliyor',
  [OrderStatus.PROCESSING]: 'İşleniyor',
  [OrderStatus.CONFIRMED]: 'Onaylandı',
  [OrderStatus.SHIPPED]: 'Kargoya Verildi',
  [OrderStatus.DELIVERED]: 'Teslim Edildi',
  [OrderStatus.CANCELLED]: 'İptal Edildi',
  [OrderStatus.REFUNDED]: 'İade Edildi',
  [OrderStatus.FAILED]: 'Başarısız',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Bekliyor',
  [PaymentStatus.PAID]: 'Ödendi',
  [PaymentStatus.FAILED]: 'Başarısız',
  [PaymentStatus.REFUNDED]: 'İade Edildi',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'Kısmi İade',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [OrderStatus.CONFIRMED]: 'bg-green-100 text-green-800',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.REFUNDED]: 'bg-orange-100 text-orange-800',
  [OrderStatus.FAILED]: 'bg-gray-100 text-gray-800',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-orange-100 text-orange-800',
  [PaymentStatus.PARTIALLY_REFUNDED]: 'bg-blue-100 text-blue-800',
};
