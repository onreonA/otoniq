/**
 * PerformanceCharts Component
 * Performance visualization and trends
 */

import React, { useState, useEffect } from 'react';
import { workflowAnalyticsService } from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface PerformanceChartsProps {
  workflowId: string;
  timeRange: string;
}

interface ChartData {
  date: string;
  executions: number;
  successRate: number;
  avgExecutionTime: number;
}

export default function PerformanceCharts({
  workflowId,
  timeRange,
}: PerformanceChartsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    'executions' | 'successRate' | 'executionTime'
  >('executions');

  useEffect(() => {
    loadChartData();
  }, [workflowId, timeRange]);

  const loadChartData = async () => {
    if (workflowId === 'all') {
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await workflowAnalyticsService.getWorkflowExecutionTrends(
        workflowId,
        timeRange
      );
      setChartData(data);
    } catch (error) {
      console.error('Load chart data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'executions':
        return 'Çalıştırma Sayısı';
      case 'successRate':
        return 'Başarı Oranı (%)';
      case 'executionTime':
        return 'Ortalama Süre (ms)';
      default:
        return '';
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'executions':
        return 'blue';
      case 'successRate':
        return 'green';
      case 'executionTime':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getMetricValue = (data: ChartData, metric: string) => {
    switch (metric) {
      case 'executions':
        return data.executions;
      case 'successRate':
        return data.successRate;
      case 'executionTime':
        return data.avgExecutionTime;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Performans Grafikleri
        </h3>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
        </div>
      </div>
    );
  }

  if (workflowId === 'all') {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Performans Grafikleri
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-line-chart-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>Grafik verisi yok</p>
          <p className='text-gray-500 text-sm'>Belirli bir workflow seçin</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Performans Grafikleri
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-line-chart-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>Grafik verisi bulunamadı</p>
          <p className='text-gray-500 text-sm'>
            Bu workflow için performans verisi mevcut değil
          </p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...chartData.map(data => getMetricValue(data, selectedMetric))
  );
  const minValue = Math.min(
    ...chartData.map(data => getMetricValue(data, selectedMetric))
  );
  const range = maxValue - minValue;

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-semibold text-lg'>
          Performans Grafikleri
        </h3>
        <div className='flex items-center gap-2'>
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value as any)}
            className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
          >
            <option value='executions'>Çalıştırma Sayısı</option>
            <option value='successRate'>Başarı Oranı</option>
            <option value='executionTime'>Ortalama Süre</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className='bg-white/5 border border-white/10 rounded-lg p-6'>
        <div className='mb-4'>
          <h4 className='text-white font-medium mb-1'>
            {getMetricLabel(selectedMetric)}
          </h4>
          <p className='text-gray-400 text-sm'>
            Son {timeRange} boyunca{' '}
            {getMetricLabel(selectedMetric).toLowerCase()}
          </p>
        </div>

        {/* Simple Bar Chart */}
        <div className='h-64 flex items-end gap-1 mb-4'>
          {chartData.map((data, index) => {
            const value = getMetricValue(data, selectedMetric);
            const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
            const color = getMetricColor(selectedMetric);

            return (
              <div
                key={index}
                className='flex-1 flex flex-col items-center group'
              >
                <div
                  className={`w-full bg-${color}-500 rounded-t transition-all duration-300 hover:bg-${color}-400 cursor-pointer`}
                  style={{ height: `${height}%` }}
                  title={`${new Date(data.date).toLocaleDateString('tr-TR')}: ${value.toFixed(1)}`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Chart Legend */}
        <div className='flex items-center justify-between text-xs text-gray-400'>
          <span>
            {chartData[0]?.date
              ? new Date(chartData[0].date).toLocaleDateString('tr-TR')
              : ''}
          </span>
          <span>
            {chartData[chartData.length - 1]?.date
              ? new Date(
                  chartData[chartData.length - 1].date
                ).toLocaleDateString('tr-TR')
              : ''}
          </span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <i className='ri-play-circle-line text-blue-400'></i>
            <span className='text-gray-400 text-sm'>Toplam Çalıştırma</span>
          </div>
          <p className='text-white font-bold text-xl'>
            {chartData.reduce((sum, data) => sum + data.executions, 0)}
          </p>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <i className='ri-checkbox-circle-line text-green-400'></i>
            <span className='text-gray-400 text-sm'>Ortalama Başarı</span>
          </div>
          <p className='text-white font-bold text-xl'>
            {(
              chartData.reduce((sum, data) => sum + data.successRate, 0) /
              chartData.length
            ).toFixed(1)}
            %
          </p>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <i className='ri-time-line text-orange-400'></i>
            <span className='text-gray-400 text-sm'>Ortalama Süre</span>
          </div>
          <p className='text-white font-bold text-xl'>
            {(
              chartData.reduce((sum, data) => sum + data.avgExecutionTime, 0) /
              chartData.length
            ).toFixed(0)}
            ms
          </p>
        </div>
      </div>

      {/* Performance Insights */}
      <div className='mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <i className='ri-lightbulb-line text-blue-400 text-lg mt-0.5'></i>
          <div>
            <h4 className='text-blue-400 font-medium mb-2'>
              Performans İpuçları
            </h4>
            <ul className='text-gray-300 text-sm space-y-1'>
              <li>• Workflow'ları düzenli olarak izleyin</li>
              <li>• Performans düşüşlerini erken tespit edin</li>
              <li>• Başarı oranını artırmak için hata analizi yapın</li>
              <li>• Çalıştırma süresini optimize edin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
