/**
 * AnalyticsOverview Component
 * Overview statistics and metrics
 */

import React from 'react';

interface AnalyticsOverviewProps {
  data: {
    totalWorkflows: number;
    totalExecutions: number;
    avgSuccessRate: number;
    totalCost: number;
    healthScore: number;
  };
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const metrics = [
    {
      title: 'Toplam Workflow',
      value: data.totalWorkflows,
      icon: 'ri-node-tree',
      color: 'blue',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Toplam Çalıştırma',
      value: data.totalExecutions.toLocaleString(),
      icon: 'ri-play-circle-line',
      color: 'green',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'Başarı Oranı',
      value: `${data.avgSuccessRate.toFixed(1)}%`,
      icon: 'ri-checkbox-circle-line',
      color: 'purple',
      change: '+2.1%',
      changeType: 'positive',
    },
    {
      title: 'Toplam Maliyet',
      value: `$${data.totalCost.toFixed(2)}`,
      icon: 'ri-money-dollar-circle-line',
      color: 'orange',
      change: '-5.3%',
      changeType: 'negative',
    },
    {
      title: 'Sağlık Skoru',
      value: `${data.healthScore.toFixed(1)}/100`,
      icon: 'ri-heart-pulse-line',
      color: 'red',
      change: '+3.2%',
      changeType: 'positive',
    },
  ];

  return (
    <div>
      <h3 className='text-white font-semibold text-lg mb-4'>Analytics Özeti</h3>
      <div className='space-y-3'>
        {metrics.map((metric, index) => (
          <div
            key={index}
            className='bg-white/5 border border-white/10 rounded-lg p-4'
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`w-10 h-10 rounded-lg bg-${metric.color}-500/20 flex items-center justify-center`}
                >
                  <i
                    className={`${metric.icon} text-${metric.color}-400 text-lg`}
                  ></i>
                </div>
                <div>
                  <p className='text-white font-medium'>{metric.title}</p>
                  <p className='text-gray-400 text-sm'>Son 30 gün</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-white font-bold text-xl'>{metric.value}</p>
                <div
                  className={`flex items-center gap-1 text-sm ${
                    metric.changeType === 'positive'
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  <i
                    className={`ri-arrow-${metric.changeType === 'positive' ? 'up' : 'down'}-line`}
                  ></i>
                  <span>{metric.change}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
