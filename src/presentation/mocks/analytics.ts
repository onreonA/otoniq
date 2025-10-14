/**
 * Analytics Mock Data
 * Mock data for AI Business Intelligence Dashboard
 */

import { subDays, format } from 'date-fns';

// KPI Data
export interface KPIData {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  conversionRate: number;
  conversionChange: number;
  averageOrderValue: number;
  aovChange: number;
}

export const mockKPIData: KPIData = {
  revenue: 847250,
  revenueChange: 12.5,
  orders: 1847,
  ordersChange: 8.3,
  conversionRate: 3.8,
  conversionChange: 0.5,
  averageOrderValue: 458.75,
  aovChange: 4.2,
};

// Trend Data
export interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
  channel: string;
}

export const generateTrendData = (days: number): TrendDataPoint[] => {
  const channels = ['Web', 'Mobile', 'Marketplace', 'Social'];
  const data: TrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    channels.forEach(channel => {
      data.push({
        date,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 100) + 20,
        channel,
      });
    });
  }

  return data;
};

// Sales Forecast Data
export interface SalesForecastPoint {
  date: string;
  actual: number;
  forecast: number;
  lower: number;
  upper: number;
}

export const generateSalesForecast = (days: number): SalesForecastPoint[] => {
  const data: SalesForecastPoint[] = [];
  const today = new Date();

  // Historical data (past 30 days)
  for (let i = 30; i > 0; i--) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    const actual = Math.floor(Math.random() * 50000) + 20000;
    data.push({
      date,
      actual,
      forecast: actual,
      lower: actual * 0.9,
      upper: actual * 1.1,
    });
  }

  // Forecast data (future days)
  for (let i = 0; i < days; i++) {
    const date = format(subDays(today, -i), 'yyyy-MM-dd');
    const forecast = Math.floor(Math.random() * 60000) + 25000;
    data.push({
      date,
      actual: 0,
      forecast,
      lower: forecast * 0.85,
      upper: forecast * 1.15,
    });
  }

  return data;
};

// Anomaly Data
export interface AnomalyData {
  id: string;
  date: string;
  metric: 'revenue' | 'orders' | 'conversion' | 'traffic';
  metricLabel: string;
  value: number;
  expectedValue: number;
  delta: number;
  deltaPercent: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export const mockAnomalies: AnomalyData[] = [
  {
    id: '1',
    date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    metric: 'revenue',
    metricLabel: 'Gelir',
    value: 15000,
    expectedValue: 35000,
    delta: -20000,
    deltaPercent: -57.1,
    severity: 'high',
    description: 'Gelir beklenenin %57 altında',
    suggestion:
      'Pazarlama kampanyalarını kontrol edin, ürün stoklarını gözden geçirin',
  },
  {
    id: '2',
    date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    metric: 'orders',
    metricLabel: 'Sipariş',
    value: 45,
    expectedValue: 65,
    delta: -20,
    deltaPercent: -30.8,
    severity: 'medium',
    description: 'Sipariş sayısı normalin %31 altında',
    suggestion: 'Checkout sürecini optimize edin, promosyon düşünün',
  },
  {
    id: '3',
    date: format(subDays(new Date(), 0), 'yyyy-MM-dd'),
    metric: 'conversion',
    metricLabel: 'Dönüşüm Oranı',
    value: 2.1,
    expectedValue: 3.8,
    delta: -1.7,
    deltaPercent: -44.7,
    severity: 'high',
    description: 'Dönüşüm oranı düşük',
    suggestion: 'Ürün sayfalarını iyileştirin, müşteri yorumlarını artırın',
  },
  {
    id: '4',
    date: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
    metric: 'traffic',
    metricLabel: 'Trafik',
    value: 8500,
    expectedValue: 6000,
    delta: 2500,
    deltaPercent: 41.7,
    severity: 'low',
    description: 'Trafik beklenenden %42 yüksek',
    suggestion: 'Yüksek trafiği değerlendirin, promosyon fırsatı yaratın',
  },
];

// Category Performance
export interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

export const mockCategoryPerformance: CategoryPerformance[] = [
  { category: 'Elektronik', revenue: 325000, orders: 542, growth: 15.3 },
  { category: 'Giyim', revenue: 218000, orders: 1205, growth: 8.7 },
  { category: 'Ev & Yaşam', revenue: 156000, orders: 387, growth: -2.1 },
  { category: 'Kozmetik', revenue: 98000, orders: 612, growth: 22.5 },
  { category: 'Spor', revenue: 50250, orders: 201, growth: 5.8 },
];

// Channel Performance
export interface ChannelPerformance {
  channel: string;
  revenue: number;
  orders: number;
  conversionRate: number;
  icon: string;
  color: string;
}

export const mockChannelPerformance: ChannelPerformance[] = [
  {
    channel: 'Web Sitesi',
    revenue: 425000,
    orders: 892,
    conversionRate: 4.2,
    icon: 'ri-global-line',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    channel: 'Mobil Uygulama',
    revenue: 312000,
    orders: 745,
    conversionRate: 5.1,
    icon: 'ri-smartphone-line',
    color: 'from-purple-500 to-pink-500',
  },
  {
    channel: 'Marketplace',
    revenue: 85250,
    orders: 178,
    conversionRate: 2.8,
    icon: 'ri-store-line',
    color: 'from-green-500 to-emerald-500',
  },
  {
    channel: 'Sosyal Medya',
    revenue: 25000,
    orders: 32,
    conversionRate: 1.9,
    icon: 'ri-share-line',
    color: 'from-orange-500 to-red-500',
  },
];
