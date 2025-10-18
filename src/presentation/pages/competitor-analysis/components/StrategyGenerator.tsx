/**
 * Strategy Generator Component
 * AI ile üretilen stratejiler ve kampanyalar
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  FileText,
  Target,
  Gift,
  Copy,
  ExternalLink,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import type {
  CompetitorStrategy,
  CompetitorProfile,
} from '../../../mocks/competitorAnalysis';

interface StrategyGeneratorProps {
  strategies: CompetitorStrategy[];
  competitors: CompetitorProfile[];
  onStrategyClick?: (strategy: CompetitorStrategy) => void;
}

export default function StrategyGenerator({
  strategies,
  competitors,
  onStrategyClick,
}: StrategyGeneratorProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const strategyTypes = [
    { id: 'all', label: 'Tümü', icon: Target },
    { id: 'instagram_post', label: 'Instagram', icon: Instagram },
    { id: 'blog_article', label: 'Blog Yazısı', icon: FileText },
    { id: 'ad_campaign', label: 'Reklam Kampanyası', icon: Target },
    { id: 'product_campaign', label: 'Ürün Kampanyası', icon: Gift },
  ];

  const statusOptions = [
    { id: 'all', label: 'Tümü', color: 'text-gray-400' },
    { id: 'draft', label: 'Taslak', color: 'text-yellow-400' },
    { id: 'ready', label: 'Hazır', color: 'text-green-400' },
    { id: 'published', label: 'Yayında', color: 'text-blue-400' },
    { id: 'paused', label: 'Duraklatıldı', color: 'text-red-400' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instagram_post':
        return Instagram;
      case 'blog_article':
        return FileText;
      case 'ad_campaign':
        return Target;
      case 'product_campaign':
        return Gift;
      default:
        return Target;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'instagram_post':
        return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      case 'blog_article':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'ad_campaign':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'product_campaign':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'ready':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'published':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'paused':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCompetitorName = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    return competitor?.name || 'Bilinmeyen';
  };

  const filteredStrategies = strategies.filter(strategy => {
    const typeMatch = selectedType === 'all' || strategy.type === selectedType;
    const statusMatch =
      selectedStatus === 'all' || strategy.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-white'>Strateji Üretimi</h3>
          <p className='text-sm text-gray-400 mt-1'>
            {filteredStrategies.length} strateji bulundu
          </p>
        </div>

        <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'>
          <Zap size={16} />
          Yeni Strateji Üret
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4'>
        {/* Type Filter */}
        <div className='flex gap-2'>
          {strategyTypes.map(type => (
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

        {/* Status Filter */}
        <div className='flex gap-2'>
          {statusOptions.map(status => (
            <button
              key={status.id}
              onClick={() => setSelectedStatus(status.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedStatus === status.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strategies Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {filteredStrategies.map((strategy, index) => {
          const TypeIcon = getTypeIcon(strategy.type);

          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onStrategyClick?.(strategy)}
              className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-200'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg border ${getTypeColor(strategy.type)}`}
                  >
                    <TypeIcon size={20} />
                  </div>
                  <div>
                    <h4 className='text-lg font-semibold text-white'>
                      {strategy.title}
                    </h4>
                    <p className='text-sm text-gray-400'>
                      {getCompetitorName(strategy.competitorId)}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(strategy.status)}`}
                >
                  {strategy.status === 'ready' && <CheckCircle size={12} />}
                  {strategy.status === 'draft' && <Clock size={12} />}
                  {strategy.status === 'published' && <Play size={12} />}
                  {strategy.status === 'paused' && <Pause size={12} />}
                  {strategy.status}
                </div>
              </div>

              {/* Content Preview */}
              <div className='bg-white/5 rounded-lg p-4 mb-4'>
                <p className='text-sm text-gray-300 line-clamp-3'>
                  {strategy.content}
                </p>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-2 gap-4 mb-4'>
                {strategy.budget && (
                  <div className='bg-white/5 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <DollarSign size={14} className='text-green-400' />
                      <span className='text-xs text-gray-400'>Bütçe</span>
                    </div>
                    <p className='text-lg font-semibold text-white'>
                      ₺{strategy.budget.toLocaleString()}
                    </p>
                  </div>
                )}

                {strategy.expectedROI && (
                  <div className='bg-white/5 rounded-lg p-3'>
                    <div className='flex items-center gap-2 mb-1'>
                      <TrendingUp size={14} className='text-blue-400' />
                      <span className='text-xs text-gray-400'>
                        Beklenen ROI
                      </span>
                    </div>
                    <p className='text-lg font-semibold text-white'>
                      ₺{strategy.expectedROI.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div className='bg-white/5 rounded-lg p-3 mb-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Users size={14} className='text-purple-400' />
                  <span className='text-sm font-medium text-purple-400'>
                    Hedef Kitle
                  </span>
                </div>
                <p className='text-sm text-white'>{strategy.targetAudience}</p>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                {strategy.status === 'ready' && (
                  <button className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                    <Play size={14} />
                    Yayınla
                  </button>
                )}

                {strategy.status === 'draft' && (
                  <button className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                    <Edit size={14} />
                    Düzenle
                  </button>
                )}

                <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                  <Copy size={14} />
                </button>

                <button className='flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* Created Date */}
              <div className='mt-4 pt-4 border-t border-white/10'>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <Clock size={12} />
                  Oluşturuldu:{' '}
                  {new Date(strategy.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStrategies.length === 0 && (
        <div className='text-center py-12'>
          <Target size={48} className='mx-auto text-gray-400 mb-4' />
          <h3 className='text-lg font-semibold text-white mb-2'>
            Strateji bulunamadı
          </h3>
          <p className='text-gray-400 mb-6'>
            {selectedType === 'all'
              ? 'Henüz strateji üretilmemiş.'
              : 'Bu filtre için strateji bulunamadı.'}
          </p>
          <button className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200'>
            İlk Stratejiyi Üret
          </button>
        </div>
      )}
    </div>
  );
}
