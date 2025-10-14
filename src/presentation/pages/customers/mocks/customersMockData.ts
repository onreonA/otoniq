/**
 * Mock data for Customers (CRM)
 */

export type CustomerSegment =
  | 'all'
  | 'vip'
  | 'b2b'
  | 'first_time'
  | 'repeat'
  | 'at_risk'
  | 'inactive';

export interface Customer {
  id: string;
  customerNumber: string;
  type: 'individual' | 'corporate';
  segment: CustomerSegment;
  name: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lifetimeValue: number;
  lastOrderDate?: Date;
  firstOrderDate: Date;
  loyaltyPoints: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  avgLifetimeValue: number;
  vipCustomers: number;
  atRiskCustomers: number;
}

export const mockCustomerStats: CustomerStats = {
  totalCustomers: 2847,
  activeCustomers: 1923,
  newThisMonth: 147,
  avgLifetimeValue: 4250,
  vipCustomers: 89,
  atRiskCustomers: 156,
};

export const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    customerNumber: 'CUST-001',
    type: 'individual',
    segment: 'vip',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 532 123 4567',
    totalOrders: 42,
    totalSpent: 287650,
    averageOrderValue: 6848.81,
    lifetimeValue: 287650,
    lastOrderDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-01-15'),
    loyaltyPoints: 2876,
    notes: 'VIP müşteri - özel ilgi göster',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'cust_002',
    customerNumber: 'CUST-002',
    type: 'corporate',
    segment: 'b2b',
    name: 'Ayşe Demir',
    email: 'ayse.demir@example.com',
    phone: '+90 533 234 5678',
    company: 'TechCorp A.Ş.',
    taxId: '1234567890',
    totalOrders: 28,
    totalSpent: 456780,
    averageOrderValue: 16313.57,
    lifetimeValue: 456780,
    lastOrderDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-03-20'),
    loyaltyPoints: 4567,
    notes: 'Kurumsal müşteri - fatura detaylarına dikkat',
    isActive: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'cust_003',
    customerNumber: 'CUST-003',
    type: 'individual',
    segment: 'repeat',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@example.com',
    phone: '+90 534 345 6789',
    totalOrders: 8,
    totalSpent: 67890,
    averageOrderValue: 8486.25,
    lifetimeValue: 67890,
    lastOrderDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-06-10'),
    loyaltyPoints: 678,
    isActive: true,
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust_004',
    customerNumber: 'CUST-004',
    type: 'individual',
    segment: 'first_time',
    name: 'Fatma Özkan',
    email: 'fatma.ozkan@example.com',
    phone: '+90 535 456 7890',
    totalOrders: 1,
    totalSpent: 32878.73,
    averageOrderValue: 32878.73,
    lifetimeValue: 32878.73,
    lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    firstOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    loyaltyPoints: 328,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust_005',
    customerNumber: 'CUST-005',
    type: 'individual',
    segment: 'at_risk',
    name: 'Ali Şahin',
    email: 'ali.sahin@example.com',
    phone: '+90 536 567 8901',
    totalOrders: 12,
    totalSpent: 89450,
    averageOrderValue: 7454.17,
    lifetimeValue: 89450,
    lastOrderDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-02-05'),
    loyaltyPoints: 894,
    notes: 'Son 3 ayda sipariş yok - geri kazanma kampanyası',
    isActive: true,
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust_006',
    customerNumber: 'CUST-006',
    type: 'individual',
    segment: 'inactive',
    name: 'Zeynep Arslan',
    email: 'zeynep.arslan@example.com',
    phone: '+90 537 678 9012',
    totalOrders: 3,
    totalSpent: 23540,
    averageOrderValue: 7846.67,
    lifetimeValue: 23540,
    lastOrderDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-01-10'),
    loyaltyPoints: 235,
    isActive: false,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust_007',
    customerNumber: 'CUST-007',
    type: 'corporate',
    segment: 'b2b',
    name: 'Can Öztürk',
    email: 'can.ozturk@example.com',
    phone: '+90 538 789 0123',
    company: 'Digital Solutions Ltd.',
    taxId: '0987654321',
    totalOrders: 15,
    totalSpent: 234560,
    averageOrderValue: 15637.33,
    lifetimeValue: 234560,
    lastOrderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    firstOrderDate: new Date('2023-04-12'),
    loyaltyPoints: 2345,
    isActive: true,
    createdAt: new Date('2023-04-12'),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const getSegmentLabel = (segment: CustomerSegment): string => {
  const labels = {
    all: 'Tümü',
    vip: 'VIP',
    b2b: 'B2B',
    first_time: 'İlk Alışveriş',
    repeat: 'Tekrarlayan',
    at_risk: 'Risk Altında',
    inactive: 'Aktif Değil',
  };
  return labels[segment];
};

export const getSegmentColor = (segment: CustomerSegment): string => {
  const colors = {
    all: 'bg-gray-100 text-gray-800 border-gray-300',
    vip: 'bg-purple-100 text-purple-800 border-purple-300',
    b2b: 'bg-blue-100 text-blue-800 border-blue-300',
    first_time: 'bg-green-100 text-green-800 border-green-300',
    repeat: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    at_risk: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    inactive: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[segment];
};

export const getCustomerTypeLabel = (type: Customer['type']): string => {
  return type === 'individual' ? 'Bireysel' : 'Kurumsal';
};
