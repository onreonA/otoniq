/**
 * Sales Forecast Chart Component
 * Displays sales forecasts with confidence intervals
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { generateSalesForecast } from '../../../mocks/analytics';

type ForecastPeriod = 7 | 30 | 90;

export default function SalesForecastChart() {
  const [period, setPeriod] = useState<ForecastPeriod>(30);
  const data = generateSalesForecast(period);

  return (
    <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-semibold text-white mb-1'>
            📈 Satış Tahminleri
          </h3>
          <p className='text-sm text-gray-400'>
            Geçmiş verilerle gelecek satış tahmini
          </p>
        </div>

        {/* Period Selector */}
        <div className='flex space-x-2'>
          {([7, 30, 90] as ForecastPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                period === p
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              {p} Gün
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className='h-80'>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id='colorForecast' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
              </linearGradient>
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
              tickFormatter={value => `₺${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number) => [
                `₺${value.toLocaleString('tr-TR')}`,
                '',
              ]}
              labelFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('tr-TR');
              }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} iconType='line' />

            {/* Confidence Interval Area */}
            <Area
              type='monotone'
              dataKey='upper'
              stroke='none'
              fill='url(#colorForecast)'
              fillOpacity={0.3}
              name='Üst Limit'
            />
            <Area
              type='monotone'
              dataKey='lower'
              stroke='none'
              fill='url(#colorForecast)'
              fillOpacity={0.3}
              name='Alt Limit'
            />

            {/* Actual Sales Line */}
            <Line
              type='monotone'
              dataKey='actual'
              stroke='#10b981'
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              name='Gerçekleşen'
              connectNulls={false}
            />

            {/* Forecast Line */}
            <Line
              type='monotone'
              dataKey='forecast'
              stroke='#3b82f6'
              strokeWidth={3}
              strokeDasharray='5 5'
              dot={{ fill: '#3b82f6', r: 4 }}
              name='Tahmin'
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Info */}
      <div className='mt-4 flex flex-wrap gap-4 text-sm'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-green-500 rounded-full'></div>
          <span className='text-gray-300'>Gerçekleşen Satışlar</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
          <span className='text-gray-300'>Tahmin Edilen Satışlar</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-blue-500/30 rounded-full'></div>
          <span className='text-gray-300'>Güven Aralığı (%85-115)</span>
        </div>
      </div>
    </div>
  );
}
