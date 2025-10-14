/**
 * Anomaly Detection Component
 * Displays detected anomalies with severity levels and suggestions
 */

import { mockAnomalies } from '../../../mocks/analytics';

export default function AnomalyDetection() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'from-red-600/20 to-orange-600/20',
          border: 'border-red-500/50',
          icon: 'text-red-400',
          badge: 'bg-red-500/20 text-red-400',
        };
      case 'medium':
        return {
          bg: 'from-yellow-600/20 to-orange-600/20',
          border: 'border-yellow-500/50',
          icon: 'text-yellow-400',
          badge: 'bg-yellow-500/20 text-yellow-400',
        };
      case 'low':
        return {
          bg: 'from-blue-600/20 to-cyan-600/20',
          border: 'border-blue-500/50',
          icon: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-400',
        };
      default:
        return {
          bg: 'from-gray-600/20 to-gray-600/20',
          border: 'border-gray-500/50',
          icon: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-400',
        };
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'revenue':
        return 'ri-money-dollar-circle-line';
      case 'orders':
        return 'ri-shopping-cart-line';
      case 'conversion':
        return 'ri-line-chart-line';
      case 'traffic':
        return 'ri-user-line';
      default:
        return 'ri-alert-line';
    }
  };

  return (
    <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h3 className='text-lg font-semibold text-white mb-1'>
            🚨 Anomali Tespiti
          </h3>
          <p className='text-sm text-gray-400'>
            AI tarafından tespit edilen anormal durumlar
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-400'>Toplam:</span>
          <span className='text-lg font-bold text-white'>
            {mockAnomalies.length}
          </span>
        </div>
      </div>

      {/* Anomalies List */}
      <div className='space-y-4'>
        {mockAnomalies.map(anomaly => {
          const colors = getSeverityColor(anomaly.severity);
          return (
            <div
              key={anomaly.id}
              className={`bg-gradient-to-r ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-xl p-4 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className='flex items-start gap-4'>
                {/* Icon */}
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <i
                    className={`${getMetricIcon(anomaly.metric)} ${colors.icon} text-2xl`}
                  ></i>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  {/* Header */}
                  <div className='flex items-start justify-between gap-2 mb-2'>
                    <div>
                      <h4 className='text-white font-semibold mb-1'>
                        {anomaly.metricLabel} - {anomaly.description}
                      </h4>
                      <p className='text-sm text-gray-400'>
                        {new Date(anomaly.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} whitespace-nowrap`}
                    >
                      {anomaly.severity === 'high'
                        ? 'Yüksek'
                        : anomaly.severity === 'medium'
                          ? 'Orta'
                          : 'Düşük'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className='grid grid-cols-3 gap-4 mb-3 p-3 bg-black/20 rounded-lg'>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>Gerçekleşen</p>
                      <p className='text-sm font-semibold text-white'>
                        {anomaly.metric === 'revenue' ||
                        anomaly.metric === 'traffic'
                          ? anomaly.value.toLocaleString('tr-TR')
                          : `%${anomaly.value.toFixed(1)}`}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>Beklenen</p>
                      <p className='text-sm font-semibold text-white'>
                        {anomaly.metric === 'revenue' ||
                        anomaly.metric === 'traffic'
                          ? anomaly.expectedValue.toLocaleString('tr-TR')
                          : `%${anomaly.expectedValue.toFixed(1)}`}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>Fark</p>
                      <p
                        className={`text-sm font-semibold ${anomaly.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {anomaly.delta >= 0 ? '+' : ''}
                        {anomaly.deltaPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
                    <div className='flex items-start gap-2'>
                      <i className='ri-lightbulb-line text-yellow-400 text-lg flex-shrink-0 mt-0.5'></i>
                      <div>
                        <p className='text-xs text-gray-400 mb-1'>
                          AI Önerisi:
                        </p>
                        <p className='text-sm text-gray-200'>
                          {anomaly.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State (if no anomalies) */}
      {mockAnomalies.length === 0 && (
        <div className='text-center py-12'>
          <i className='ri-checkbox-circle-line text-green-400 text-5xl mb-3'></i>
          <p className='text-white font-semibold mb-1'>
            Anomali Tespit Edilmedi
          </p>
          <p className='text-sm text-gray-400'>Tüm metrikler normal aralıkta</p>
        </div>
      )}
    </div>
  );
}
