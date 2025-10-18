/**
 * Competitor Detail Sidebar
 * Rakip detaylarını gösteren yan panel
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Target,
  Clock,
  Package,
  DollarSign,
} from 'lucide-react';
import type {
  CompetitorProfile,
  CompetitorInsight,
} from '../../../mocks/competitorAnalysis';

interface CompetitorDetailSidebarProps {
  competitor: CompetitorProfile | null;
  insights: CompetitorInsight[];
  isOpen: boolean;
  onClose: () => void;
}

export default function CompetitorDetailSidebar({
  competitor,
  insights,
  isOpen,
  onClose,
}: CompetitorDetailSidebarProps) {
  if (!competitor) return null;

  const competitorInsights = insights.filter(
    i => i.competitorId === competitor.id
  );

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Mock review data
  const reviewStats = {
    positive: Math.floor(competitor.totalReviews * 0.4),
    neutral: Math.floor(competitor.totalReviews * 0.3),
    negative: Math.floor(competitor.totalReviews * 0.3),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden'
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className='fixed right-0 top-0 bottom-0 w-full lg:w-[600px] bg-gradient-to-br from-slate-900 to-purple-900 border-l border-white/20 shadow-2xl z-50 overflow-y-auto'
          >
            {/* Header */}
            <div className='sticky top-0 bg-black/40 backdrop-blur-md border-b border-white/10 p-6 z-10'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='text-3xl'>{competitor.logo}</div>
                  <div>
                    <h2 className='text-xl font-bold text-white'>
                      {competitor.name}
                    </h2>
                    <p className='text-sm text-gray-400 capitalize'>
                      {competitor.platform}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-3 gap-3'>
                <div className='bg-black/30 rounded-lg p-3 border border-white/10'>
                  <p className='text-xs text-gray-400 mb-1'>Sentiment</p>
                  <p
                    className={`text-lg font-bold ${getSentimentColor(competitor.sentimentScore)}`}
                  >
                    {competitor.sentimentScore}%
                  </p>
                </div>
                <div className='bg-black/30 rounded-lg p-3 border border-white/10'>
                  <p className='text-xs text-gray-400 mb-1'>Yorumlar</p>
                  <p className='text-lg font-bold text-white'>
                    {competitor.totalReviews.toLocaleString()}
                  </p>
                </div>
                <div className='bg-black/30 rounded-lg p-3 border border-white/10'>
                  <p className='text-xs text-gray-400 mb-1'>Fırsatlar</p>
                  <p className='text-lg font-bold text-blue-400'>
                    {competitor.opportunities}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              {/* Description */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
                  <BarChart3 size={16} className='text-blue-400' />
                  Genel Bilgiler
                </h3>
                <p className='text-sm text-gray-300 mb-4'>
                  {competitor.description}
                </p>
                <div className='flex items-center gap-2'>
                  <a
                    href={competitor.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors'
                  >
                    <ExternalLink size={14} />
                    Website'yi Ziyaret Et
                  </a>
                </div>
              </div>

              {/* Sentiment Analysis */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                  <Star size={16} className='text-yellow-400' />
                  Sentiment Analizi
                </h3>

                {/* Sentiment Progress Bars */}
                <div className='space-y-3'>
                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <ThumbsUp size={14} className='text-green-400' />
                        <span className='text-xs text-gray-400'>Pozitif</span>
                      </div>
                      <span className='text-xs text-green-400 font-medium'>
                        {reviewStats.positive} yorum
                      </span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-green-500 h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${(reviewStats.positive / competitor.totalReviews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <MessageSquare size={14} className='text-yellow-400' />
                        <span className='text-xs text-gray-400'>Nötr</span>
                      </div>
                      <span className='text-xs text-yellow-400 font-medium'>
                        {reviewStats.neutral} yorum
                      </span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-yellow-500 h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${(reviewStats.neutral / competitor.totalReviews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <ThumbsDown size={14} className='text-red-400' />
                        <span className='text-xs text-gray-400'>Negatif</span>
                      </div>
                      <span className='text-xs text-red-400 font-medium'>
                        {reviewStats.negative} yorum
                      </span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-red-500 h-2 rounded-full transition-all duration-300'
                        style={{
                          width: `${(reviewStats.negative / competitor.totalReviews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunities */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                  <Target size={16} className='text-purple-400' />
                  Tespit Edilen Fırsatlar
                </h3>

                {competitorInsights.length > 0 ? (
                  <div className='space-y-3'>
                    {competitorInsights.map(insight => (
                      <div
                        key={insight.id}
                        className='bg-white/5 rounded-lg p-3 border border-white/10'
                      >
                        <div className='flex items-start justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <div
                              className={`p-1 rounded ${
                                insight.opportunityLevel === 'critical'
                                  ? 'bg-red-500/20'
                                  : insight.opportunityLevel === 'high'
                                    ? 'bg-orange-500/20'
                                    : 'bg-yellow-500/20'
                              }`}
                            >
                              <AlertTriangle
                                size={12}
                                className={
                                  insight.opportunityLevel === 'critical'
                                    ? 'text-red-400'
                                    : insight.opportunityLevel === 'high'
                                      ? 'text-orange-400'
                                      : 'text-yellow-400'
                                }
                              />
                            </div>
                            <span className='text-xs font-medium text-white capitalize'>
                              {insight.category}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              insight.opportunityLevel === 'critical'
                                ? 'bg-red-500/20 text-red-400'
                                : insight.opportunityLevel === 'high'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {insight.opportunityLevel}
                          </span>
                        </div>
                        <p className='text-xs text-gray-300 mb-2'>
                          {insight.description}
                        </p>
                        <div className='flex items-center justify-between text-xs'>
                          <span className='text-gray-500'>
                            {insight.complaintCount} şikayet
                          </span>
                          <div className='flex items-center gap-1'>
                            {insight.trend === 'increasing' ? (
                              <TrendingUp size={12} className='text-red-400' />
                            ) : insight.trend === 'decreasing' ? (
                              <TrendingDown
                                size={12}
                                className='text-green-400'
                              />
                            ) : null}
                            <span
                              className={
                                insight.trend === 'increasing'
                                  ? 'text-red-400'
                                  : insight.trend === 'decreasing'
                                    ? 'text-green-400'
                                    : 'text-gray-400'
                              }
                            >
                              {insight.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-gray-400 text-center py-4'>
                    Henüz fırsat tespit edilmedi
                  </p>
                )}
              </div>

              {/* Last Analyzed */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <Clock size={14} />
                  <span>
                    Son Analiz:{' '}
                    {new Date(competitor.lastAnalyzed).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className='sticky bottom-0 bg-black/40 backdrop-blur-md border-t border-white/10 p-6'>
              <div className='flex gap-3'>
                <button className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all'>
                  <TrendingUp size={18} />
                  Yeni Analiz Başlat
                </button>
                <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all'>
                  <Target size={18} />
                  Strateji Üret
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
