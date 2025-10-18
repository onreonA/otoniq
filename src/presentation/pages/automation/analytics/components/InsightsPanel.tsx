/**
 * InsightsPanel Component
 * AI-generated insights and recommendations
 */

import React from 'react';
import { WorkflowInsight } from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface InsightsPanelProps {
  insights: WorkflowInsight[];
  onResolveInsight: (insightId: string) => void;
}

export default function InsightsPanel({
  insights,
  onResolveInsight,
}: InsightsPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return 'ri-speed-up-line';
      case 'optimization':
        return 'ri-tools-line';
      case 'anomaly':
        return 'ri-alert-line';
      case 'trend':
        return 'ri-line-chart-line';
      case 'recommendation':
        return 'ri-lightbulb-line';
      case 'prediction':
        return 'ri-crystal-ball-line';
      default:
        return 'ri-information-line';
    }
  };

  if (insights.length === 0) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>AI Insights</h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-brain-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>Henüz insight yok</p>
          <p className='text-gray-500 text-sm'>
            AI analiz sonuçları burada görünecek
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-semibold text-lg'>AI Insights</h3>
        <div className='flex items-center gap-2'>
          <span className='text-gray-400 text-sm'>
            {insights.length} insight
          </span>
          <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
        </div>
      </div>

      <div className='space-y-4'>
        {insights.map(insight => {
          const severityColor = getSeverityColor(insight.severity);
          const insightIcon = getInsightIcon(insight.insightType);

          return (
            <div
              key={insight.id}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                insight.isResolved ? 'opacity-60' : ''
              }`}
            >
              <div className='flex items-start gap-3'>
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg bg-${severityColor}-500/20 flex items-center justify-center flex-shrink-0`}
                >
                  <i
                    className={`${insightIcon} text-${severityColor}-400 text-lg`}
                  ></i>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h4 className='text-white font-medium mb-1'>
                        {insight.title}
                      </h4>
                      <p className='text-gray-400 text-sm'>
                        {insight.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${severityColor}-500/20 text-${severityColor}-400`}
                      >
                        {insight.severity.toUpperCase()}
                      </span>
                      {insight.aiGenerated && (
                        <span className='px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400'>
                          AI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className='flex items-center gap-2 mb-3'>
                    <span className='text-gray-400 text-xs'>Güven Skoru:</span>
                    <div className='flex items-center gap-1'>
                      <div className='w-16 bg-gray-700 rounded-full h-1.5'>
                        <div
                          className='bg-blue-500 h-1.5 rounded-full'
                          style={{ width: `${insight.confidenceScore * 100}%` }}
                        ></div>
                      </div>
                      <span className='text-blue-400 text-xs font-medium'>
                        {(insight.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Data Points */}
                  {insight.dataPoints && (
                    <div className='bg-white/5 rounded-lg p-3 mb-3'>
                      <p className='text-gray-300 text-sm font-medium mb-2'>
                        Veri Noktaları:
                      </p>
                      <div className='grid grid-cols-2 gap-2 text-xs'>
                        {Object.entries(insight.dataPoints).map(
                          ([key, value]) => (
                            <div key={key} className='flex justify-between'>
                              <span className='text-gray-400'>{key}:</span>
                              <span className='text-white'>
                                {String(value)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insight.recommendations && (
                    <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3'>
                      <p className='text-blue-400 text-sm font-medium mb-1'>
                        Öneriler:
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {insight.recommendations.action}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <i className='ri-time-line'></i>
                      <span>
                        {new Date(insight.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>

                    {!insight.isResolved && (
                      <button
                        onClick={() => onResolveInsight(insight.id)}
                        className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-1 rounded text-xs font-medium transition-colors'
                      >
                        <i className='ri-check-line mr-1'></i>
                        Çözüldü
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
