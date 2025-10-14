/**
 * 3D Model Gallery Component
 * Display grid of 3D product models
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, Maximize2, Filter } from 'lucide-react';
import { mock3DModels, Product3DModel } from '../../../mocks/arVr';

interface Model3DGalleryProps {
  onSelectModel: (model: Product3DModel) => void;
}

export default function Model3DGallery({ onSelectModel }: Model3DGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'interactions' | 'recent'>(
    'views'
  );

  const categories = ['all', ...new Set(mock3DModels.map(m => m.category))];

  const filteredModels = mock3DModels
    .filter(model =>
      selectedCategory === 'all' ? true : model.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'interactions':
          return b.interactions - a.interactions;
        case 'recent':
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div className='flex items-center justify-between flex-wrap gap-4'>
        {/* Category Filter */}
        <div className='flex items-center gap-2 overflow-x-auto pb-2'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'Tümü' : cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className='flex items-center gap-2'>
          <Filter size={16} className='text-gray-400' />
          <select
            value={sortBy}
            onChange={e =>
              setSortBy(e.target.value as 'views' | 'interactions' | 'recent')
            }
            className='bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50'
          >
            <option value='views'>En Çok Görüntülenen</option>
            <option value='interactions'>En Çok Etkileşim</option>
            <option value='recent'>En Yeni</option>
          </select>
        </div>
      </div>

      {/* Model Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnimatePresence mode='popLayout'>
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all group'
            >
              {/* Model Preview */}
              <div className='relative aspect-square bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center overflow-hidden'>
                <div className='text-8xl'>{model.thumbnailUrl}</div>

                {/* Hover Overlay */}
                <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
                  <button
                    onClick={() => onSelectModel(model)}
                    className='p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors'
                    title='3D Görünüm'
                  >
                    <Maximize2 size={20} className='text-white' />
                  </button>
                  <button
                    className='p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors'
                    title='İndir'
                  >
                    <Download size={20} className='text-white' />
                  </button>
                </div>

                {/* Badges */}
                <div className='absolute top-3 left-3 flex gap-2'>
                  {model.arCompatible && (
                    <span className='px-2 py-1 bg-green-600/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm'>
                      AR
                    </span>
                  )}
                  {model.vrCompatible && (
                    <span className='px-2 py-1 bg-purple-600/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm'>
                      VR
                    </span>
                  )}
                </div>
              </div>

              {/* Model Info */}
              <div className='p-4'>
                <h3 className='font-semibold text-white mb-1 line-clamp-1'>
                  {model.productName}
                </h3>
                <p className='text-sm text-gray-400 mb-3'>{model.category}</p>

                <div className='flex items-center justify-between text-xs text-gray-400'>
                  <div className='flex items-center gap-3'>
                    <span className='flex items-center gap-1'>
                      <Eye size={12} />
                      {model.views.toLocaleString()}
                    </span>
                    <span>{model.fileSize}</span>
                  </div>
                  <span>{model.polyCount.toLocaleString()} poly</span>
                </div>

                {/* Features */}
                <div className='flex items-center gap-2 mt-3 flex-wrap'>
                  {model.hasTextures && (
                    <span className='px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-lg'>
                      🎨 Texture
                    </span>
                  )}
                  {model.hasAnimations && (
                    <span className='px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-lg'>
                      🎬 Animation
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredModels.length === 0 && (
        <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
          <p>Bu kategoride 3D model bulunamadı</p>
        </div>
      )}
    </div>
  );
}
