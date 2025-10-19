/**
 * Mock data for Orders Management
 * Compatible with Order entity from domain layer
 */

import { Order, OrderItem } from '../../../../domain/entities';
import {
  OrderStatus,
  PaymentStatus,
} from '../../../../domain/enums/OrderStatus';
import { Money } from '../../../../domain/value-objects/Money';

/**
 * Generate mock orders
 */
export const generateMockOrders = (): Order[] => {
  const tenantId = '00000000-0000-0000-0000-000000000000';
  const now = new Date();

  return [
    new Order(
      'ord-001',
      tenantId,
      'ORD-2024-001847',
      'ext-trendyol-12345',
      'marketplace-conn-001',
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet.yilmaz@example.com',
        phone: '+90 532 123 4567',
        address: {
          street: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:42 Daire:5',
          city: 'İstanbul',
          country: 'Türkiye',
          postalCode: '34000',
        },
      },
      [
        new OrderItem(
          'item-001',
          'prod-001',
          'APPLE-IP15PM-256-BLK',
          'iPhone 15 Pro Max 256GB',
          1,
          new Money(54999, 'TRY')
        ),
        new OrderItem(
          'item-002',
          'prod-002',
          'SONY-WH1000XM5-BLK',
          'Sony WH-1000XM5 Kulaklık',
          1,
          new Money(12999, 'TRY')
        ),
      ],
      new Money(67998, 'TRY'), // subtotal
      new Money(11429.66, 'TRY'), // tax
      new Money(0, 'TRY'), // shipping
      new Money(2000, 'TRY'), // discount
      new Money(77427.66, 'TRY'), // total
      'TRY',
      OrderStatus.PROCESSING,
      PaymentStatus.PAID,
      {
        method: 'express',
        trackingNumber: 'TR1234567890',
        carrier: 'Aras Kargo',
        estimatedDeliveryDate: new Date(
          now.getTime() + 2 * 24 * 60 * 60 * 1000
        ),
      },
      undefined, // odooSaleOrderId
      undefined, // odooInvoiceId
      false, // n8nWorkflowTriggered
      undefined, // n8nWorkflowStatus
      'Lütfen mesai saatlerinde teslim edin', // customerNote
      undefined, // internalNote
      'user-001', // createdBy
      new Date(now.getTime() - 2 * 60 * 60 * 1000), // orderDate
      new Date(now.getTime() - 2 * 60 * 60 * 1000), // createdAt
      new Date(now.getTime() - 1 * 60 * 60 * 1000) // updatedAt
    ),

    new Order(
      'ord-002',
      tenantId,
      'ORD-2024-001846',
      'ext-trendyol-12344',
      'marketplace-conn-001',
      {
        name: 'Ayşe Demir',
        email: 'ayse.demir@example.com',
        phone: '+90 533 234 5678',
        address: {
          street: 'İnönü Mahallesi, Fatih Sokak No:12',
          city: 'Ankara',
          country: 'Türkiye',
          postalCode: '06000',
        },
      },
      [
        new OrderItem(
          'item-003',
          'prod-003',
          'APPLE-MBP14-M3-512',
          'MacBook Pro 14" M3',
          1,
          new Money(84999, 'TRY')
        ),
      ],
      new Money(84999, 'TRY'),
      new Money(13849.83, 'TRY'),
      new Money(29.9, 'TRY'),
      new Money(5000, 'TRY'),
      new Money(93878.73, 'TRY'),
      'TRY',
      OrderStatus.PENDING,
      PaymentStatus.PAID,
      {
        method: 'standard',
        estimatedDeliveryDate: new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000
        ),
      },
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      'user-001',
      new Date(now.getTime() - 4 * 60 * 60 * 1000),
      new Date(now.getTime() - 4 * 60 * 60 * 1000),
      new Date(now.getTime() - 30 * 60 * 1000)
    ),

    new Order(
      'ord-003',
      tenantId,
      'ORD-2024-001845',
      undefined,
      undefined,
      {
        name: 'Mehmet Kaya',
        email: 'mehmet.kaya@example.com',
        phone: '+90 534 345 6789',
        address: {
          street: 'Alsancak Mahallesi, Kordon Bulvarı No:156',
          city: 'İzmir',
          country: 'Türkiye',
          postalCode: '35000',
        },
      },
      [
        new OrderItem(
          'item-004',
          'prod-004',
          'SAMSUNG-S24U-512-BLK',
          'Samsung Galaxy S24 Ultra',
          2,
          new Money(49999, 'TRY')
        ),
      ],
      new Money(99998, 'TRY'),
      new Money(16849.65, 'TRY'),
      new Money(0, 'TRY'),
      new Money(3000, 'TRY'),
      new Money(113847.65, 'TRY'),
      'TRY',
      OrderStatus.SHIPPED,
      PaymentStatus.PAID,
      {
        method: 'express',
        trackingNumber: 'TR0987654321',
        carrier: 'Yurtiçi Kargo',
        estimatedDeliveryDate: new Date(
          now.getTime() + 1 * 24 * 60 * 60 * 1000
        ),
      },
      undefined,
      undefined,
      true,
      'success',
      undefined,
      undefined,
      'user-001',
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 6 * 60 * 60 * 1000)
    ),

    new Order(
      'ord-004',
      tenantId,
      'ORD-2024-001844',
      undefined,
      undefined,
      {
        name: 'Fatma Özkan',
        email: 'fatma.ozkan@example.com',
        phone: '+90 535 456 7890',
        address: {
          street: 'Güzelyalı Mahallesi, Sahil Yolu No:78',
          city: 'Antalya',
          country: 'Türkiye',
          postalCode: '07000',
        },
      },
      [
        new OrderItem(
          'item-005',
          'prod-005',
          'APPLE-IPAD-AIR11-M2',
          'iPad Air 11" M2',
          1,
          new Money(28999, 'TRY')
        ),
      ],
      new Money(28999, 'TRY'),
      new Money(4849.83, 'TRY'),
      new Money(29.9, 'TRY'),
      new Money(1000, 'TRY'),
      new Money(32878.73, 'TRY'),
      'TRY',
      OrderStatus.DELIVERED,
      PaymentStatus.PAID,
      {
        method: 'standard',
        trackingNumber: 'TR5555666677',
        carrier: 'MNG Kargo',
        estimatedDeliveryDate: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      'odoo-sale-001',
      'odoo-invoice-001',
      true,
      'success',
      undefined,
      'Müşteri memnun, teşekkür etti',
      'user-001',
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 12 * 60 * 60 * 1000)
    ),

    new Order(
      'ord-005',
      tenantId,
      'ORD-2024-001843',
      undefined,
      undefined,
      {
        name: 'Ali Şahin',
        email: 'ali.sahin@example.com',
        phone: '+90 536 567 8901',
        address: {
          street: 'Kültür Mahallesi, Barış Sokak No:23',
          city: 'Bursa',
          country: 'Türkiye',
          postalCode: '16000',
        },
      },
      [
        new OrderItem(
          'item-006',
          'prod-001',
          'APPLE-IP15PM-256-BLK',
          'iPhone 15 Pro Max 256GB',
          1,
          new Money(54999, 'TRY')
        ),
      ],
      new Money(54999, 'TRY'),
      new Money(9524.83, 'TRY'),
      new Money(29.9, 'TRY'),
      new Money(0, 'TRY'),
      new Money(64553.73, 'TRY'),
      'TRY',
      OrderStatus.PENDING,
      PaymentStatus.PENDING,
      {
        method: 'standard',
      },
      undefined,
      undefined,
      false,
      undefined,
      'Ödeme onayı bekleniyor',
      'Müşteri telefon ile sipariş verdi',
      'user-001',
      new Date(now.getTime() - 30 * 60 * 1000),
      new Date(now.getTime() - 30 * 60 * 1000),
      new Date(now.getTime() - 30 * 60 * 1000)
    ),

    new Order(
      'ord-006',
      tenantId,
      'ORD-2024-001842',
      'ext-trendyol-12340',
      'marketplace-conn-001',
      {
        name: 'Zeynep Arslan',
        email: 'zeynep.arslan@example.com',
        phone: '+90 537 678 9012',
        address: {
          street: 'Cumhuriyet Mahallesi, Atatürk Caddesi No:90',
          city: 'Eskişehir',
          country: 'Türkiye',
          postalCode: '26000',
        },
      },
      [
        new OrderItem(
          'item-007',
          'prod-002',
          'SONY-WH1000XM5-BLK',
          'Sony WH-1000XM5 Kulaklık',
          3,
          new Money(12999, 'TRY')
        ),
      ],
      new Money(38997, 'TRY'),
      new Money(6524.74, 'TRY'),
      new Money(0, 'TRY'),
      new Money(1500, 'TRY'),
      new Money(44021.74, 'TRY'),
      'TRY',
      OrderStatus.CANCELLED,
      PaymentStatus.REFUNDED,
      {
        method: 'express',
      },
      undefined,
      undefined,
      true,
      'cancelled',
      undefined,
      'Müşteri talebi ile iptal edildi - İade işlemi tamamlandı',
      'user-001',
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
    ),

    new Order(
      'ord-007',
      tenantId,
      'ORD-2024-001841',
      undefined,
      undefined,
      {
        name: 'Can Yıldız',
        email: 'can.yildiz@example.com',
        phone: '+90 538 789 0123',
        address: {
          street: 'Yeni Mahalle, Barış Caddesi No:45',
          city: 'Adana',
          country: 'Türkiye',
          postalCode: '01000',
        },
      },
      [
        new OrderItem(
          'item-008',
          'prod-006',
          'SAMSUNG-TAB-S9-PLUS',
          'Samsung Galaxy Tab S9+',
          1,
          new Money(32999, 'TRY')
        ),
      ],
      new Money(32999, 'TRY'),
      new Money(5719.83, 'TRY'),
      new Money(29.9, 'TRY'),
      new Money(0, 'TRY'),
      new Money(38748.73, 'TRY'),
      'TRY',
      OrderStatus.PROCESSING,
      PaymentStatus.PAID,
      {
        method: 'standard',
        estimatedDeliveryDate: new Date(
          now.getTime() + 2 * 24 * 60 * 60 * 1000
        ),
      },
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      'user-001',
      new Date(now.getTime() - 3 * 60 * 60 * 1000),
      new Date(now.getTime() - 3 * 60 * 60 * 1000),
      new Date(now.getTime() - 1 * 60 * 60 * 1000)
    ),

    new Order(
      'ord-008',
      tenantId,
      'ORD-2024-001840',
      'ext-hepsiburada-98765',
      'marketplace-conn-002',
      {
        name: 'Elif Kara',
        email: 'elif.kara@example.com',
        phone: '+90 539 890 1234',
        address: {
          street: 'Merkez Mahalle, İstiklal Caddesi No:67',
          city: 'Kocaeli',
          country: 'Türkiye',
          postalCode: '41000',
        },
      },
      [
        new OrderItem(
          'item-009',
          'prod-007',
          'APPLE-WATCH-S9-GPS',
          'Apple Watch Series 9 GPS',
          1,
          new Money(16999, 'TRY')
        ),
      ],
      new Money(16999, 'TRY'),
      new Money(2944.83, 'TRY'),
      new Money(0, 'TRY'),
      new Money(500, 'TRY'),
      new Money(19443.83, 'TRY'),
      'TRY',
      OrderStatus.SHIPPED,
      PaymentStatus.PAID,
      {
        method: 'express',
        trackingNumber: 'TR1111222233',
        carrier: 'Sürat Kargo',
        estimatedDeliveryDate: new Date(
          now.getTime() + 1 * 24 * 60 * 60 * 1000
        ),
      },
      undefined,
      undefined,
      true,
      'success',
      undefined,
      undefined,
      'user-001',
      new Date(now.getTime() - 18 * 60 * 60 * 1000),
      new Date(now.getTime() - 18 * 60 * 60 * 1000),
      new Date(now.getTime() - 5 * 60 * 60 * 1000)
    ),
  ];
};

/**
 * Mock order statistics
 */
export const mockOrderStatistics = {
  totalOrders: 8,
  totalRevenue: 512800.09,
  averageOrderValue: 64100.01,
  ordersByStatus: {
    pending: 2,
    processing: 2,
    shipped: 2,
    delivered: 1,
    cancelled: 1,
    refunded: 0,
  },
  ordersByPaymentStatus: {
    pending: 1,
    paid: 6,
    failed: 0,
    refunded: 1,
    partially_refunded: 0,
  },
};
