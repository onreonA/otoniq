/**
 * Trend Analysis Chart Component
 * Displays trend analysis by channel/category
 */

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../../hooks/useAuth';
import AnalyticsService from '../../../../infrastructure/services/AnalyticsService';

type ViewMode = 'revenue' | 'orders';

export default function TrendAnalysisChart() {
  const { userProfile } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('revenue');
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrend = async () => {
      if (!userProfile?.tenant_id) return;

      try {
        setLoading(true);
        const trend = await AnalyticsService.getSalesTrend(
          userProfile.tenant_id,
          days
        );
        setData(trend);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading trend:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTrend();
  }, [userProfile?.tenant_id, days]);

  // Aggregate data by date and channel
  const aggregatedData = data.reduce(
    (acc, item) => {
      const existing = acc.find(d => d.date === item.date);
      if (existing) {
        existing[item.channel] =
          (existing[item.channel] || 0) +
          (viewMode === 'revenue' ? item.revenue : item.orders);
      } else {
        acc.push({
          date: item.date,
          [item.channel]: viewMode === 'revenue' ? item.revenue : item.orders,
        });
      }
      return acc;
    },
    [] as Array<Record<string, string | number>>
  );

  const channels = ['Web', 'Mobile', 'Marketplace', 'Social'];
  const channelColors = {
    Web: '#3b82f6',
    Mobile: '#a855f7',
    Marketplace: '#10b981',
    Social: '#f59e0b',
  };

  return (
    <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h3 className='text-lg font-semibold text-white mb-1'>
            📊 Trend Analizi
          </h3>
          <p className='text-sm text-gray-400'>Kanal bazlı performans trendi</p>
        </div>

        {/* Controls */}
        <div className='flex flex-wrap gap-2'>
          {/* View Mode Toggle */}
          <div className='flex space-x-2'>
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'revenue'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              Gelir
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                viewMode === 'orders'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              Sipariş
            </button>
          </div>

          {/* Period Selector */}
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className='px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white border border-white/20 focus:outline-none focus:border-blue-400 transition-colors'
          >
            <option value={7}>Son 7 Gün</option>
            <option value={30}>Son 30 Gün</option>
            <option value={90}>Son 90 Gün</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={aggregatedData}>
            <defs>
              {channels.map(channel => (
                <linearGradient
                  key={channel}
                  id={`color${channel}`}
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor={
                      channelColors[channel as keyof typeof channelColors]
                    }
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor={
                      channelColors[channel as keyof typeof channelColors]
                    }
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray='3 3'
              stroke='rgba(255,255,255,0.1)'
            />
            <XAxis
              dataKey='date'
              stroke='#9ca3af'
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={value => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke='#9ca3af'
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={value =>
                viewMode === 'revenue'
                  ? `₺${(value / 1000).toFixed(0)}K`
                  : value.toString()
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number, name: string) => [
                viewMode === 'revenue'
                  ? `₺${value.toLocaleString('tr-TR')}`
                  : value.toLocaleString('tr-TR'),
                name,
              ]}
              labelFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('tr-TR');
              }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />

            {/* Area for each channel */}
            {channels.map(channel => (
              <Area
                key={channel}
                type='monotone'
                dataKey={channel}
                stackId='1'
                stroke={channelColors[channel as keyof typeof channelColors]}
                fill={`url(#color${channel})`}
                name={channel}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className='mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {channels.map(channel => {
          const total = aggregatedData.reduce(
            (sum, item) => sum + (Number(item[channel]) || 0),
            0
          );
          return (
            <div
              key={channel}
              className='bg-white/5 rounded-xl p-3 border border-white/10'
            >
              <div className='flex items-center gap-2 mb-1'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{
                    backgroundColor:
                      channelColors[channel as keyof typeof channelColors],
                  }}
                ></div>
                <span className='text-sm text-gray-400'>{channel}</span>
              </div>
              <p className='text-lg font-bold text-white'>
                {viewMode === 'revenue'
                  ? `₺${total.toLocaleString('tr-TR')}`
                  : total.toLocaleString('tr-TR')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
