/**
 * Competitor List Component
 * Rakiplerin listesi ve detayları
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  Target,
} from 'lucide-react';
import type { CompetitorProfile } from '../../../mocks/competitorAnalysis';

interface CompetitorListProps {
  competitors: CompetitorProfile[];
  onSelectCompetitor: (competitorId: string | null) => void;
  selectedCompetitor: string | null;
  onViewDetails?: (competitor: CompetitorProfile) => void;
}

export default function CompetitorList({
  competitors,
  onSelectCompetitor,
  selectedCompetitor,
  onViewDetails,
}: CompetitorListProps) {
  const [filter, setFilter] = useState<
    'all' | 'active' | 'warning' | 'critical'
  >('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredCompetitors = competitors.filter(comp => {
    if (filter === 'all') return true;
    return comp.status === filter;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-white'>Rakip Analizi</h3>
          <p className='text-sm text-gray-400 mt-1'>
            {filteredCompetitors.length} rakip bulundu
          </p>
        </div>

        <div className='flex gap-2'>
          {['all', 'active', 'warning', 'critical'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {filterType === 'all'
                ? 'Tümü'
                : filterType === 'active'
                  ? 'Aktif'
                  : filterType === 'warning'
                    ? 'Uyarı'
                    : 'Kritik'}
            </button>
          ))}
        </div>
      </div>

      {/* Competitors Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredCompetitors.map((competitor, index) => {
          const StatusIcon = getStatusIcon(competitor.status);
          const isSelected = selectedCompetitor === competitor.id;

          return (
            <motion.div
              key={competitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onSelectCompetitor(competitor.id)}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-500/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                {/* Header */}
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className='text-2xl'>{competitor.logo}</div>
                    <div>
                      <h4 className='text-lg font-semibold text-white'>
                        {competitor.name}
                      </h4>
                      <p className='text-sm text-gray-400'>
                        {competitor.platform}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(competitor.status)}`}
                  >
                    <StatusIcon size={12} />
                    {competitor.status}
                  </div>
                </div>

                {/* Description */}
                <p className='text-sm text-gray-300 mb-4'>
                  {competitor.description}
                </p>

                {/* Stats */}
                <div className='grid grid-cols-2 gap-4 mb-4'>
                  <div className='bg-white/5 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <BarChart3 size={14} className='text-blue-400' />
                      <span className='text-xs text-gray-400'>Yorumlar</span>
                    </div>
                    <p className='text-lg font-semibold text-white'>
                      {competitor.totalReviews.toLocaleString()}
                    </p>
                  </div>

                  <div className='bg-white/5 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <Target size={14} className='text-purple-400' />
                      <span className='text-xs text-gray-400'>Fırsatlar</span>
                    </div>
                    <p className='text-lg font-semibold text-white'>
                      {competitor.opportunities}
                    </p>
                  </div>
                </div>

                {/* Sentiment Score */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-400'>
                      Sentiment Skoru
                    </span>
                    <span
                      className={`text-sm font-medium ${getSentimentColor(competitor.sentimentScore)}`}
                    >
                      {competitor.sentimentScore}/100
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        competitor.sentimentScore >= 70
                          ? 'bg-green-500'
                          : competitor.sentimentScore >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${competitor.sentimentScore}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onViewDetails?.(competitor);
                    }}
                    className='flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'
                  >
                    <Eye size={14} />
                    Detaylar
                  </button>

                  <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                    <ExternalLink size={14} />
                  </button>
                </div>

                {/* Last Analyzed */}
                <div className='mt-4 pt-4 border-t border-white/10'>
                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <Clock size={12} />
                    Son analiz:{' '}
                    {new Date(competitor.lastAnalyzed).toLocaleDateString(
                      'tr-TR'
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCompetitors.length === 0 && (
        <div className='text-center py-12'>
          <Target size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-semibold text-white mb-2'>
            Rakip bulunamadı
          </h3>
          <p className='text-gray-400 mb-6'>
            {filter === 'all'
              ? 'Henüz rakip eklenmemiş. İlk rakibinizi ekleyin!'
              : 'Bu filtre için rakip bulunamadı.'}
          </p>
          <button className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'>
            Yeni Rakip Ekle
          </button>
        </div>
      )}
    </div>
  );
}
