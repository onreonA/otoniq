/**
 * Analytics KPI Cards Component
 * Displays key performance indicators with animations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import AnalyticsService from '../../../../infrastructure/services/AnalyticsService';

export default function AnalyticsKPICards() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });
  const [animatedValues, setAnimatedValues] = useState({
    revenue: 0,
    orders: 0,
    conversionRate: 0,
    aov: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      if (!userProfile?.tenant_id) return;

      try {
        setLoading(true);
        const data = await AnalyticsService.getDashboardMetrics(
          userProfile.tenant_id
        );
        setMetrics({
          revenue: data.totalSales,
          orders: data.totalOrders,
          avgOrderValue: data.avgOrderValue,
          revenueGrowth: data.revenueGrowth,
          orderGrowth: data.orderGrowth,
        });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading metrics:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [userProfile?.tenant_id]);

  useEffect(() => {
    // Animate values on mount or when metrics change
    if (loading) return;

    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        revenue: metrics.revenue * progress,
        orders: metrics.orders * progress,
        conversionRate: 3.2 * progress, // Mock for now
        aov: metrics.avgOrderValue * progress,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [loading, metrics]);

  const kpis = [
    {
      id: 'revenue',
      title: 'Toplam Gelir',
      value: animatedValues.revenue,
      displayValue: loading
        ? '...'
        : `₺${Math.round(animatedValues.revenue).toLocaleString('tr-TR')}`,
      change: metrics.revenueGrowth,
      icon: 'ri-money-dollar-circle-line',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600/20 to-emerald-600/20',
    },
    {
      id: 'orders',
      title: 'Toplam Sipariş',
      value: animatedValues.orders,
      displayValue: loading
        ? '...'
        : Math.round(animatedValues.orders).toLocaleString('tr-TR'),
      change: metrics.orderGrowth,
      icon: 'ri-shopping-cart-line',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600/20 to-cyan-600/20',
    },
    {
      id: 'conversion',
      title: 'Dönüşüm Oranı',
      value: animatedValues.conversionRate,
      displayValue: loading
        ? '...'
        : `%${animatedValues.conversionRate.toFixed(1)}`,
      change: 2.4, // Mock for now
      icon: 'ri-line-chart-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-600/20',
    },
    {
      id: 'aov',
      title: 'Ortalama Sepet',
      value: animatedValues.aov,
      displayValue: loading
        ? '...'
        : `₺${Math.round(animatedValues.aov).toLocaleString('tr-TR')}`,
      change: (metrics.revenueGrowth + metrics.orderGrowth) / 2, // Simple approximation
      icon: 'ri-shopping-bag-line',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-600/20 to-amber-600/20',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {kpis.map((kpi, index) => (
        <div
          key={kpi.id}
          className={`bg-gradient-to-br ${kpi.bgColor} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group`}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Icon & Change Badge */}
          <div className='flex items-center justify-between mb-4'>
            <div
              className={`w-12 h-12 bg-gradient-to-r ${kpi.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
            >
              <i className={`${kpi.icon} text-white text-2xl`}></i>
            </div>
            <div
              className={`text-sm font-medium px-3 py-1 rounded-full ${
                kpi.change >= 0
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {kpi.change >= 0 ? '+' : ''}
              {kpi.change.toFixed(1)}%
            </div>
          </div>

          {/* Title & Value */}
          <div>
            <h3 className='text-gray-300 text-sm font-medium mb-2'>
              {kpi.title}
            </h3>
            <p className='text-3xl font-bold text-white'>{kpi.displayValue}</p>
          </div>

          {/* Animated Progress Bar */}
          <div className='mt-4 h-1 bg-white/10 rounded-full overflow-hidden'>
            <div
              className={`h-full bg-gradient-to-r ${kpi.color} transition-all duration-1000 ease-out`}
              style={{
                width: loading
                  ? '0%'
                  : `${Math.min(
                      100,
                      (kpi.value /
                        (kpi.id === 'revenue'
                          ? metrics.revenue
                          : kpi.id === 'orders'
                            ? metrics.orders
                            : kpi.id === 'conversion'
                              ? 3.2
                              : metrics.avgOrderValue)) *
                        100
                    )}%`,
              }}
            ></div>
          </div>

          {/* Hover Effect - Additional Info */}
          <div className='mt-3 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            Son 30 günlük performans
          </div>
        </div>
      ))}
    </div>
  );
}
