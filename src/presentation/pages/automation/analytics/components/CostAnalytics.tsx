/**
 * CostAnalytics Component
 * Workflow cost analysis and optimization
 */

import React, { useState, useEffect } from 'react';
import {
  workflowAnalyticsService,
  WorkflowCostAnalytics,
} from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface CostAnalyticsProps {
  workflowId: string;
  timeRange: string;
}

export default function CostAnalytics({
  workflowId,
  timeRange,
}: CostAnalyticsProps) {
  const [costData, setCostData] = useState<WorkflowCostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCostData();
  }, [workflowId, timeRange]);

  const loadCostData = async () => {
    if (workflowId === 'all') {
      setCostData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data =
        await workflowAnalyticsService.getWorkflowCostAnalytics(workflowId);
      setCostData(data);
    } catch (error) {
      console.error('Load cost data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCostTypeIcon = (type: string) => {
    switch (type) {
      case 'execution':
        return 'ri-play-circle-line';
      case 'storage':
        return 'ri-database-line';
      case 'api_calls':
        return 'ri-global-line';
      case 'compute':
        return 'ri-cpu-line';
      case 'bandwidth':
        return 'ri-wifi-line';
      default:
        return 'ri-money-dollar-circle-line';
    }
  };

  const getCostTypeColor = (type: string) => {
    switch (type) {
      case 'execution':
        return 'blue';
      case 'storage':
        return 'green';
      case 'api_calls':
        return 'purple';
      case 'compute':
        return 'orange';
      case 'bandwidth':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  const getCostTypeLabel = (type: string) => {
    switch (type) {
      case 'execution':
        return 'Çalıştırma';
      case 'storage':
        return 'Depolama';
      case 'api_calls':
        return 'API Çağrıları';
      case 'compute':
        return 'Hesaplama';
      case 'bandwidth':
        return 'Bant Genişliği';
      default:
        return 'Diğer';
    }
  };

  // Calculate totals
  const totalCost = costData.reduce((sum, cost) => sum + cost.costAmount, 0);
  const costByType = costData.reduce(
    (acc, cost) => {
      acc[cost.costType] = (acc[cost.costType] || 0) + cost.costAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Maliyet Analizi
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
          Maliyet Analizi
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-money-dollar-circle-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>Maliyet verisi yok</p>
          <p className='text-gray-500 text-sm'>Belirli bir workflow seçin</p>
        </div>
      </div>
    );
  }

  if (costData.length === 0) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Maliyet Analizi
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-money-dollar-circle-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>
            Maliyet verisi bulunamadı
          </p>
          <p className='text-gray-500 text-sm'>
            Bu workflow için maliyet analizi mevcut değil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-semibold text-lg'>Maliyet Analizi</h3>
        <div className='flex items-center gap-2'>
          <span className='text-gray-400 text-sm'>
            Toplam: ${totalCost.toFixed(2)}
          </span>
          <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Toplam Maliyet</span>
            <i className='ri-money-dollar-circle-line text-green-400'></i>
          </div>
          <p className='text-white font-bold text-2xl'>
            ${totalCost.toFixed(2)}
          </p>
          <p className='text-gray-500 text-xs'>Son {timeRange}</p>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Ortalama Günlük</span>
            <i className='ri-calendar-line text-blue-400'></i>
          </div>
          <p className='text-white font-bold text-2xl'>
            ${(totalCost / 30).toFixed(2)}
          </p>
          <p className='text-gray-500 text-xs'>Günlük ortalama</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className='space-y-3'>
        <h4 className='text-white font-medium mb-3'>Maliyet Dağılımı</h4>
        {Object.entries(costByType).map(([type, amount]) => {
          const percentage = (amount / totalCost) * 100;
          const color = getCostTypeColor(type);
          const icon = getCostTypeIcon(type);
          const label = getCostTypeLabel(type);

          return (
            <div
              key={type}
              className='bg-white/5 border border-white/10 rounded-lg p-4'
            >
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded bg-${color}-500/20 flex items-center justify-center`}
                  >
                    <i className={`${icon} text-${color}-400 text-sm`}></i>
                  </div>
                  <div>
                    <p className='text-white font-medium'>{label}</p>
                    <p className='text-gray-400 text-sm'>
                      {type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-white font-bold'>${amount.toFixed(2)}</p>
                  <p className='text-gray-400 text-sm'>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Trends */}
      <div className='mt-6'>
        <h4 className='text-white font-medium mb-3'>Maliyet Trendi</h4>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3'>
              <i className='ri-line-chart-line text-blue-400 text-xl'></i>
            </div>
            <p className='text-gray-400 text-sm'>
              Maliyet trendi grafiği burada görünecek
            </p>
          </div>
        </div>
      </div>

      {/* Cost Optimization Tips */}
      <div className='mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <i className='ri-lightbulb-line text-blue-400 text-lg mt-0.5'></i>
          <div>
            <h4 className='text-blue-400 font-medium mb-2'>
              Maliyet Optimizasyon İpuçları
            </h4>
            <ul className='text-gray-300 text-sm space-y-1'>
              <li>• Gereksiz API çağrılarını azaltın</li>
              <li>• Workflow'ları daha verimli hale getirin</li>
              <li>• Kullanılmayan kaynakları temizleyin</li>
              <li>• Batch işlemleri kullanın</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
