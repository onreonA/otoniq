/**
 * AR/VR Page
 * 3D product viewer, AR experiences, and virtual showrooms
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import FeatureIntro from '../../components/common/FeatureIntro';
import Model3DGallery from './components/Model3DGallery';
import Product3DViewer from './components/Product3DViewer';
import { Product3DModel, mock3DModels } from '../../mocks/arVr';
import { Box, Glasses, Store, TrendingUp } from 'lucide-react';

export default function ARVRPage() {
  const [activeTab, setActiveTab] = useState<
    '3d-models' | 'ar-experiences' | 'virtual-showrooms' | 'analytics'
  >('3d-models');
  const [selectedModel, setSelectedModel] = useState<Product3DModel | null>(
    null
  );

  // Stats
  const totalModels = mock3DModels.length;
  const totalViews = mock3DModels.reduce((sum, m) => sum + m.views, 0);
  const totalInteractions = mock3DModels.reduce(
    (sum, m) => sum + m.interactions,
    0
  );
  const arCompatibleCount = mock3DModels.filter(m => m.arCompatible).length;

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='arVrIntro'
          title='🥽 AR/VR ile Ürünlerinizi Hayata Geçirin'
          subtitle='3D ürün modelleri, artırılmış gerçeklik deneyimleri ve sanal mağazalarla müşterilerinize benzersiz bir alışveriş deneyimi sunun.'
          items={[
            'İnteraktif 3D ürün görüntüleme',
            'AR ile sanal deneme',
            'VR mağaza deneyimi',
            'Gerçek zamanlı analitik',
            'Çoklu platform desteği',
            'Yüksek dönüşüm oranları',
          ]}
          variant='purple'
          dismissible={true}
        />

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Box size={20} className='text-blue-400' />
              <span className='text-xs text-gray-400'>3D Modeller</span>
            </div>
            <p className='text-3xl font-bold text-white'>{totalModels}</p>
            <p className='text-sm text-gray-300'>Toplam Model</p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <TrendingUp size={20} className='text-green-400' />
              <span className='text-xs text-gray-400'>Görüntülenme</span>
            </div>
            <p className='text-3xl font-bold text-white'>
              {totalViews.toLocaleString()}
            </p>
            <p className='text-sm text-gray-300'>Toplam View</p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Glasses size={20} className='text-purple-400' />
              <span className='text-xs text-gray-400'>AR Uyumlu</span>
            </div>
            <p className='text-3xl font-bold text-white'>{arCompatibleCount}</p>
            <p className='text-sm text-gray-300'>AR Model</p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Store size={20} className='text-pink-400' />
              <span className='text-xs text-gray-400'>Etkileşim</span>
            </div>
            <p className='text-3xl font-bold text-white'>
              {totalInteractions.toLocaleString()}
            </p>
            <p className='text-sm text-gray-300'>Toplam İnteraksiyon</p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className='flex items-center gap-3 mb-6 overflow-x-auto pb-2'>
          <button
            onClick={() => setActiveTab('3d-models')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === '3d-models'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🧊 3D Modeller
          </button>
          <button
            onClick={() => setActiveTab('ar-experiences')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ar-experiences'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            📱 AR Deneyimleri
          </button>
          <button
            onClick={() => setActiveTab('virtual-showrooms')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'virtual-showrooms'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🏬 Sanal Mağazalar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            📊 Analitik
          </button>
        </div>

        {/* Content Area */}
        {activeTab === '3d-models' && !selectedModel && (
          <Model3DGallery onSelectModel={setSelectedModel} />
        )}

        {activeTab === '3d-models' && selectedModel && (
          <div className='h-[700px]'>
            <Product3DViewer
              model={selectedModel}
              onClose={() => setSelectedModel(null)}
            />
          </div>
        )}

        {activeTab === 'ar-experiences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center'
          >
            <div className='text-6xl mb-4'>📱</div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              AR Deneyimleri
            </h3>
            <p className='text-gray-400'>
              Yakında: Artırılmış gerçeklik deneyimleri yönetimi
            </p>
          </motion.div>
        )}

        {activeTab === 'virtual-showrooms' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center'
          >
            <div className='text-6xl mb-4'>🏬</div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              Sanal Mağazalar
            </h3>
            <p className='text-gray-400'>
              Yakında: VR mağaza deneyimleri yönetimi
            </p>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center'
          >
            <div className='text-6xl mb-4'>📊</div>
            <h3 className='text-xl font-semibold text-white mb-2'>
              AR/VR Analitik
            </h3>
            <p className='text-gray-400'>
              Yakında: Detaylı AR/VR kullanım istatistikleri
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
