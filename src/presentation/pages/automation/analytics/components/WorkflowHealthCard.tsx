/**
 * WorkflowHealthCard Component
 * Workflow health score visualization
 */

import React from 'react';
import { WorkflowHealthScore } from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface WorkflowHealthCardProps {
  healthScore: WorkflowHealthScore;
}

export default function WorkflowHealthCard({
  healthScore,
}: WorkflowHealthCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Kötü';
  };

  const overallColor = getScoreColor(healthScore.overallScore);
  const overallLabel = getScoreLabel(healthScore.overallScore);

  const scoreMetrics = [
    {
      label: 'Performans',
      score: healthScore.performanceScore,
      icon: 'ri-speed-up-line',
      description: 'Çalıştırma hızı ve verimlilik',
    },
    {
      label: 'Güvenilirlik',
      score: healthScore.reliabilityScore,
      icon: 'ri-shield-check-line',
      description: 'Başarı oranı ve kararlılık',
    },
    {
      label: 'Verimlilik',
      score: healthScore.efficiencyScore,
      icon: 'ri-cpu-line',
      description: 'Kaynak kullanımı ve optimizasyon',
    },
    {
      label: 'Maliyet',
      score: healthScore.costScore,
      icon: 'ri-money-dollar-circle-line',
      description: 'Maliyet etkinliği',
    },
  ];

  return (
    <div>
      <h3 className='text-white font-semibold text-lg mb-4'>
        Workflow Sağlık Skoru
      </h3>

      {/* Overall Score */}
      <div className='text-center mb-6'>
        <div
          className={`w-24 h-24 rounded-full bg-${overallColor}-500/20 border-4 border-${overallColor}-500/50 flex items-center justify-center mx-auto mb-3`}
        >
          <span className={`text-3xl font-bold text-${overallColor}-400`}>
            {healthScore.overallScore.toFixed(0)}
          </span>
        </div>
        <h4 className={`text-xl font-semibold text-${overallColor}-400 mb-1`}>
          {overallLabel}
        </h4>
        <p className='text-gray-400 text-sm'>Genel workflow sağlık durumu</p>
      </div>

      {/* Score Breakdown */}
      <div className='space-y-3'>
        {scoreMetrics.map((metric, index) => {
          const color = getScoreColor(metric.score);
          return (
            <div
              key={index}
              className='bg-white/5 border border-white/10 rounded-lg p-3'
            >
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <i className={`${metric.icon} text-${color}-400`}></i>
                  <span className='text-white font-medium text-sm'>
                    {metric.label}
                  </span>
                </div>
                <span className={`text-${color}-400 font-bold`}>
                  {metric.score.toFixed(0)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className='w-full bg-gray-700 rounded-full h-2 mb-2'>
                <div
                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>

              <p className='text-gray-400 text-xs'>{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Health Recommendations */}
      <div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
        <div className='flex items-start gap-2'>
          <i className='ri-lightbulb-line text-blue-400 text-sm mt-0.5'></i>
          <div>
            <p className='text-blue-400 font-medium text-sm mb-1'>Öneriler</p>
            <p className='text-gray-300 text-xs'>
              {healthScore.overallScore < 60
                ? 'Workflow performansını iyileştirmek için optimizasyon önerilerini inceleyin.'
                : 'Workflow sağlık durumu iyi görünüyor. Düzenli olarak izlemeye devam edin.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
