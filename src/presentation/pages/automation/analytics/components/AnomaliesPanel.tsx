/**
 * AnomaliesPanel Component
 * Anomaly detection and investigation
 */

import React from 'react';
import { WorkflowAnomaly } from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface AnomaliesPanelProps {
  anomalies: WorkflowAnomaly[];
}

export default function AnomaliesPanel({ anomalies }: AnomaliesPanelProps) {
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

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'execution_time_spike':
        return 'ri-time-line';
      case 'error_rate_increase':
        return 'ri-error-warning-line';
      case 'resource_usage_spike':
        return 'ri-cpu-line';
      case 'throughput_drop':
        return 'ri-speed-line';
      case 'unusual_pattern':
        return 'ri-question-line';
      default:
        return 'ri-alert-line';
    }
  };

  const getAnomalyTitle = (type: string) => {
    switch (type) {
      case 'execution_time_spike':
        return 'Çalıştırma Süresi Artışı';
      case 'error_rate_increase':
        return 'Hata Oranı Artışı';
      case 'resource_usage_spike':
        return 'Kaynak Kullanımı Artışı';
      case 'throughput_drop':
        return 'Verim Düşüşü';
      case 'unusual_pattern':
        return 'Olağandışı Desen';
      default:
        return 'Bilinmeyen Anomali';
    }
  };

  if (anomalies.length === 0) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Anomali Tespiti
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-checkbox-circle-line text-green-400 text-2xl'></i>
          </div>
          <p className='text-green-400 text-lg mb-2'>Anomali tespit edilmedi</p>
          <p className='text-gray-500 text-sm'>
            Workflow'lar normal aralıkta çalışıyor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-semibold text-lg'>Anomali Tespiti</h3>
        <div className='flex items-center gap-2'>
          <span className='text-gray-400 text-sm'>
            {anomalies.length} anomali
          </span>
          <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse'></div>
        </div>
      </div>

      <div className='space-y-4'>
        {anomalies.map(anomaly => {
          const severityColor = getSeverityColor(anomaly.severity);
          const anomalyIcon = getAnomalyIcon(anomaly.anomalyType);
          const anomalyTitle = getAnomalyTitle(anomaly.anomalyType);

          return (
            <div
              key={anomaly.id}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                anomaly.isInvestigated ? 'opacity-60' : ''
              }`}
            >
              <div className='flex items-start gap-3'>
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg bg-${severityColor}-500/20 flex items-center justify-center flex-shrink-0`}
                >
                  <i
                    className={`${anomalyIcon} text-${severityColor}-400 text-lg`}
                  ></i>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h4 className='text-white font-medium mb-1'>
                        {anomalyTitle}
                      </h4>
                      <p className='text-gray-400 text-sm'>
                        {anomaly.anomalyType.replace(/_/g, ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${severityColor}-500/20 text-${severityColor}-400`}
                      >
                        {anomaly.severity.toUpperCase()}
                      </span>
                      {anomaly.isInvestigated && (
                        <span className='px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400'>
                          İNCELENDİ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Deviation Info */}
                  {anomaly.deviationPercent && (
                    <div className='bg-white/5 rounded-lg p-3 mb-3'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-400'>Baseline:</span>
                          <span className='text-white ml-2'>
                            {anomaly.baselineValue?.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className='text-gray-400'>Gerçek:</span>
                          <span className='text-white ml-2'>
                            {anomaly.actualValue?.toFixed(2)}
                          </span>
                        </div>
                        <div className='col-span-2'>
                          <span className='text-gray-400'>Sapma:</span>
                          <span
                            className={`ml-2 font-medium ${
                              anomaly.deviationPercent > 0
                                ? 'text-red-400'
                                : 'text-green-400'
                            }`}
                          >
                            {anomaly.deviationPercent > 0 ? '+' : ''}
                            {anomaly.deviationPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Context Data */}
                  {anomaly.contextData && (
                    <div className='bg-gray-500/10 rounded-lg p-3 mb-3'>
                      <p className='text-gray-300 text-sm font-medium mb-2'>
                        Bağlam Verisi:
                      </p>
                      <div className='text-xs text-gray-400'>
                        <pre className='whitespace-pre-wrap'>
                          {JSON.stringify(anomaly.contextData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Investigation Notes */}
                  {anomaly.investigationNotes && (
                    <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3'>
                      <p className='text-blue-400 text-sm font-medium mb-1'>
                        İnceleme Notları:
                      </p>
                      <p className='text-gray-300 text-sm'>
                        {anomaly.investigationNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <i className='ri-time-line'></i>
                      <span>
                        {new Date(anomaly.detectedAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>

                    {!anomaly.isInvestigated && (
                      <button className='bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 px-3 py-1 rounded text-xs font-medium transition-colors'>
                        <i className='ri-search-line mr-1'></i>
                        İncele
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
