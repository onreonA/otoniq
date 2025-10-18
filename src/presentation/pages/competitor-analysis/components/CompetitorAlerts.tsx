/**
 * Competitor Alerts Component
 * Rakip uyarıları ve kritik fırsatlar
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ExternalLink,
  Bell,
  Zap,
  Eye,
} from 'lucide-react';
import type {
  CompetitorAlert,
  CompetitorProfile,
} from '../../../mocks/competitorAnalysis';

interface CompetitorAlertsProps {
  alerts: CompetitorAlert[];
  competitors: CompetitorProfile[];
  onAlertAction?: (alert: CompetitorAlert) => void;
}

export default function CompetitorAlerts({
  alerts,
  competitors,
  onAlertAction,
}: CompetitorAlertsProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const severityOptions = [
    { id: 'all', label: 'Tümü', color: 'text-gray-400' },
    { id: 'low', label: 'Düşük', color: 'text-green-400' },
    { id: 'medium', label: 'Orta', color: 'text-yellow-400' },
    { id: 'high', label: 'Yüksek', color: 'text-orange-400' },
    { id: 'critical', label: 'Kritik', color: 'text-red-400' },
  ];

  const alertTypes = [
    { id: 'all', label: 'Tümü', icon: Bell },
    { id: 'stock_out', label: 'Stok Tükendi', icon: Target },
    { id: 'price_increase', label: 'Fiyat Artışı', icon: TrendingUp },
    { id: 'negative_trend', label: 'Negatif Trend', icon: TrendingDown },
    { id: 'new_opportunity', label: 'Yeni Fırsat', icon: Zap },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock_out':
        return Target;
      case 'price_increase':
        return TrendingUp;
      case 'negative_trend':
        return TrendingDown;
      case 'new_opportunity':
        return Zap;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock_out':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'price_increase':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'negative_trend':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'new_opportunity':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCompetitorName = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    return competitor?.name || 'Bilinmeyen';
  };

  const filteredAlerts = alerts.filter(alert => {
    const severityMatch =
      selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const typeMatch = selectedType === 'all' || alert.type === selectedType;
    return severityMatch && typeMatch;
  });

  const criticalAlerts = alerts.filter(
    alert => alert.severity === 'critical' || alert.severity === 'high'
  );
  const actionRequired = alerts.filter(alert => alert.actionRequired);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-white'>
            Uyarılar & Fırsatlar
          </h3>
          <p className='text-sm text-gray-400 mt-1'>
            {filteredAlerts.length} uyarı bulundu
          </p>
        </div>

        <div className='flex gap-4'>
          <div className='text-center'>
            <p className='text-2xl font-bold text-red-400'>
              {criticalAlerts.length}
            </p>
            <p className='text-xs text-gray-400'>Kritik</p>
          </div>
          <div className='text-center'>
            <p className='text-2xl font-bold text-orange-400'>
              {actionRequired.length}
            </p>
            <p className='text-xs text-gray-400'>Aksiyon Gerekli</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4'>
        {/* Severity Filter */}
        <div className='flex gap-2'>
          {severityOptions.map(severity => (
            <button
              key={severity.id}
              onClick={() => setSelectedSeverity(severity.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedSeverity === severity.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {severity.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className='flex gap-2'>
          {alertTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedType === type.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <type.icon size={14} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredAlerts.map((alert, index) => {
          const TypeIcon = getTypeIcon(alert.type);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`backdrop-blur-sm border rounded-xl p-6 ${
                alert.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/30'
                  : alert.severity === 'high'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg border ${getTypeColor(alert.type)}`}
                  >
                    <TypeIcon size={20} />
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white'>
                      {alert.title}
                    </h4>
                    <p className='text-sm text-gray-400'>
                      {getCompetitorName(alert.competitorId)}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {alert.actionRequired && (
                    <div className='flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30'>
                      <AlertTriangle size={12} />
                      Aksiyon Gerekli
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}
                  >
                    {alert.severity}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className='text-sm text-gray-300 mb-4'>{alert.description}</p>

              {/* Action Required Badge */}
              {alert.actionRequired && (
                <div className='bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-4 mb-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <AlertTriangle size={16} className='text-red-400' />
                    <span className='text-sm font-medium text-red-400'>
                      Hemen Aksiyon Alın!
                    </span>
                  </div>
                  <p className='text-sm text-white'>
                    Bu fırsatı kaçırmamak için hemen strateji üretin ve
                    kampanyanızı başlatın.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className='flex gap-2'>
                {alert.actionRequired && (
                  <button
                    onClick={() => onAlertAction?.(alert)}
                    className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'
                  >
                    <Zap size={14} />
                    Hemen Aksiyon Al
                  </button>
                )}

                <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                  <Eye size={14} />
                  Detaylar
                </button>

                <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* Created Date */}
              <div className='mt-4 pt-4 border-t border-white/10'>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <Clock size={12} />
                  {new Date(alert.createdAt).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(alert.createdAt).toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className='text-center py-12'>
          <Bell size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-semibold text-white mb-2'>
            Uyarı bulunamadı
          </h3>
          <p className='text-gray-400 mb-6'>
            {selectedSeverity === 'all'
              ? 'Henüz uyarı oluşmamış.'
              : 'Bu filtre için uyarı bulunamadı.'}
          </p>
          <button className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'>
            Analiz Başlat
          </button>
        </div>
      )}
    </div>
  );
}
