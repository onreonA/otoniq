/**
 * Competitor Insights Component
 * Rakip fırsatları ve analiz detayları
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Users,
  MessageSquare,
  Zap,
  Eye,
} from 'lucide-react';
import type {
  CompetitorInsight,
  CompetitorProfile,
} from '../../../mocks/competitorAnalysis';

interface CompetitorInsightsProps {
  insights: CompetitorInsight[];
  competitors: CompetitorProfile[];
}

export default function CompetitorInsights({
  insights,
  competitors,
}: CompetitorInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tümü', icon: BarChart3 },
    { id: 'shipping', label: 'Kargo', icon: Target },
    { id: 'quality', label: 'Kalite', icon: CheckCircle },
    { id: 'price', label: 'Fiyat', icon: TrendingUp },
    { id: 'support', label: 'Destek', icon: Users },
    { id: 'packaging', label: 'Paketleme', icon: MessageSquare },
  ];

  const getOpportunityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp size={16} className='text-red-400' />;
      case 'decreasing':
        return <TrendingDown size={16} className='text-green-400' />;
      default:
        return <BarChart3 size={16} className='text-gray-400' />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle size={16} className='text-green-400' />;
      case 'negative':
        return <AlertTriangle size={16} className='text-red-400' />;
      default:
        return <BarChart3 size={16} className='text-yellow-400' />;
    }
  };

  const filteredInsights = insights.filter(insight => {
    const categoryMatch =
      selectedCategory === 'all' || insight.category === selectedCategory;
    const competitorMatch =
      selectedCompetitor === 'all' ||
      insight.competitorId === selectedCompetitor;
    return categoryMatch && competitorMatch;
  });

  const getCompetitorName = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    return competitor?.name || 'Bilinmeyen';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-white'>Fırsat Analizi</h3>
          <p className='text-sm text-gray-400 mt-1'>
            {filteredInsights.length} fırsat tespit edildi
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4'>
        {/* Category Filter */}
        <div className='flex gap-2'>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <category.icon size={14} />
              {category.label}
            </button>
          ))}
        </div>

        {/* Competitor Filter */}
        <div className='flex gap-2'>
          <button
            onClick={() => setSelectedCompetitor('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCompetitor === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tüm Rakipler
          </button>
          {competitors.map(competitor => (
            <button
              key={competitor.id}
              onClick={() => setSelectedCompetitor(competitor.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCompetitor === competitor.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {competitor.name}
            </button>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'
          >
            {/* Header */}
            <div className='flex items-start justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-white/10 rounded-lg'>
                  {getSentimentIcon(insight.sentiment)}
                </div>
                <div>
                  <h4 className='text-lg font-semibold text-white capitalize'>
                    {insight.category} Analizi
                  </h4>
                  <p className='text-sm text-gray-400'>
                    {getCompetitorName(insight.competitorId)}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getOpportunityColor(insight.opportunityLevel)}`}
              >
                {insight.opportunityLevel}
              </div>
            </div>

            {/* Description */}
            <p className='text-sm text-gray-300 mb-4'>{insight.description}</p>

            {/* Stats */}
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='bg-white/5 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  <MessageSquare size={14} className='text-blue-400' />
                  <span className='text-xs text-gray-400'>Şikayet Sayısı</span>
                </div>
                <p className='text-lg font-semibold text-white'>
                  {insight.complaintCount}
                </p>
              </div>

              <div className='bg-white/5 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-1'>
                  {getTrendIcon(insight.trend)}
                  <span className='text-xs text-gray-400'>Trend</span>
                </div>
                <p className='text-sm font-medium text-white capitalize'>
                  {insight.trend}
                </p>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mb-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Zap size={16} className='text-blue-400' />
                <span className='text-sm font-medium text-blue-400'>
                  AI Önerisi
                </span>
              </div>
              <p className='text-sm text-white'>{insight.aiRecommendation}</p>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <button className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                <Target size={14} />
                Strateji Üret
              </button>

              <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                <Eye size={14} />
                Detaylar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className='text-center py-12'>
          <Target size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-semibold text-white mb-2'>
            Fırsat bulunamadı
          </h3>
          <p className='text-gray-400 mb-6'>
            {selectedCategory === 'all'
              ? 'Henüz fırsat analizi yapılmamış.'
              : 'Bu filtre için fırsat bulunamadı.'}
          </p>
          <button className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'>
            Analiz Başlat
          </button>
        </div>
      )}
    </div>
  );
}
