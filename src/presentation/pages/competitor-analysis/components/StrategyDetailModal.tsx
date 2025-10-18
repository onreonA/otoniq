/**
 * Strategy Detail Modal
 * Strateji detaylarını görüntüle ve düzenle
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Edit,
  Copy,
  Download,
  ExternalLink,
  Instagram,
  FileText,
  Target,
  Gift,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Check,
} from 'lucide-react';
import type { CompetitorStrategy } from '../../../mocks/competitorAnalysis';

interface StrategyDetailModalProps {
  strategy: CompetitorStrategy | null;
  isOpen: boolean;
  onClose: () => void;
  competitorName: string;
}

export default function StrategyDetailModal({
  strategy,
  isOpen,
  onClose,
  competitorName,
}: StrategyDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(strategy?.content || '');

  if (!strategy) return null;

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

  const TypeIcon = getTypeIcon(strategy.type);

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
    console.log('Saved:', editedContent);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(strategy.content);
    // Show toast notification
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
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed inset-4 md:inset-10 lg:inset-20 bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-white/10 bg-black/20'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl'>
                  <TypeIcon size={24} className='text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    {strategy.title}
                  </h2>
                  <p className='text-sm text-gray-400 mt-1'>
                    {competitorName} • {strategy.type}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
                  title='Düzenle'
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleCopy}
                  className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
                  title='Kopyala'
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={onClose}
                  className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {/* Stats Grid */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='bg-black/30 rounded-xl p-4 border border-white/10'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Calendar size={16} className='text-blue-400' />
                    <span className='text-xs text-gray-400'>Oluşturulma</span>
                  </div>
                  <p className='text-sm text-white font-medium'>
                    {new Date(strategy.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {strategy.budget && (
                  <div className='bg-black/30 rounded-xl p-4 border border-white/10'>
                    <div className='flex items-center gap-2 mb-2'>
                      <DollarSign size={16} className='text-green-400' />
                      <span className='text-xs text-gray-400'>Bütçe</span>
                    </div>
                    <p className='text-sm text-white font-medium'>
                      ₺{strategy.budget.toLocaleString()}
                    </p>
                  </div>
                )}

                {strategy.expectedROI && (
                  <div className='bg-black/30 rounded-xl p-4 border border-white/10'>
                    <div className='flex items-center gap-2 mb-2'>
                      <TrendingUp size={16} className='text-purple-400' />
                      <span className='text-xs text-gray-400'>
                        Beklenen ROI
                      </span>
                    </div>
                    <p className='text-sm text-white font-medium'>
                      ₺{strategy.expectedROI.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className='bg-black/30 rounded-xl p-4 border border-white/10'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Users size={16} className='text-orange-400' />
                    <span className='text-xs text-gray-400'>Hedef Kitle</span>
                  </div>
                  <p className='text-xs text-white font-medium line-clamp-2'>
                    {strategy.targetAudience}
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              {strategy.type === 'instagram_post' && (
                <div className='bg-black/30 rounded-xl p-6 border border-white/10'>
                  <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                    <ImageIcon size={16} className='text-blue-400' />
                    Instagram Post Önizlemesi
                  </h3>
                  <div className='max-w-md mx-auto'>
                    {/* Instagram Card Mockup */}
                    <div className='bg-white rounded-lg overflow-hidden shadow-2xl'>
                      {/* Instagram Header */}
                      <div className='flex items-center gap-3 p-3 border-b'>
                        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600' />
                        <span className='text-sm font-semibold text-gray-900'>
                          your_brand
                        </span>
                      </div>
                      {/* Image Placeholder */}
                      <div className='aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
                        <ImageIcon size={48} className='text-gray-400' />
                      </div>
                      {/* Caption */}
                      <div className='p-3'>
                        <p className='text-sm text-gray-900 whitespace-pre-wrap'>
                          {isEditing ? editedContent : strategy.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Editor */}
              <div className='bg-black/30 rounded-xl p-6 border border-white/10'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-semibold text-white flex items-center gap-2'>
                    <FileText size={16} className='text-purple-400' />
                    {strategy.type === 'blog_article'
                      ? 'Blog İçeriği'
                      : 'İçerik'}
                  </h3>
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
                    >
                      <Check size={16} />
                      Kaydet
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className='w-full h-64 bg-black/50 border border-white/20 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm'
                    placeholder='İçeriği düzenleyin...'
                  />
                ) : (
                  <div className='bg-black/50 border border-white/20 rounded-lg p-4'>
                    <p className='text-gray-300 whitespace-pre-wrap text-sm leading-relaxed'>
                      {strategy.content}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Recommendations */}
              {strategy.type === 'blog_article' && (
                <div className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6'>
                  <h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
                    <TrendingUp size={16} className='text-blue-400' />
                    SEO Önerileri
                  </h3>
                  <div className='space-y-2'>
                    <div className='flex items-start gap-2'>
                      <Check size={14} className='text-green-400 mt-0.5' />
                      <p className='text-sm text-gray-300'>
                        Anahtar kelime yoğunluğu: "hızlı kargo" - Optimal
                      </p>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Check size={14} className='text-green-400 mt-0.5' />
                      <p className='text-sm text-gray-300'>
                        Meta açıklama uzunluğu: 158 karakter - İyi
                      </p>
                    </div>
                    <div className='flex items-start gap-2'>
                      <Check size={14} className='text-yellow-400 mt-0.5' />
                      <p className='text-sm text-gray-300'>
                        İç link sayısı: 2 - Artırılabilir
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className='flex items-center justify-between p-6 border-t border-white/10 bg-black/20'>
              <div className='flex items-center gap-2'>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    strategy.status === 'ready'
                      ? 'bg-green-500/20 text-green-400'
                      : strategy.status === 'draft'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {strategy.status === 'ready'
                    ? '✓ Yayına Hazır'
                    : strategy.status === 'draft'
                      ? '✎ Taslak'
                      : '🚀 Yayında'}
                </span>
              </div>

              <div className='flex items-center gap-3'>
                <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                  <Download size={16} />
                  İndir
                </button>
                <button className='flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all'>
                  <ExternalLink size={16} />
                  Yayınla
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
