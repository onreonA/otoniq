/**
 * Alert Action Modal
 * Rakip uyarılarına göre aksiyon alma modal'ı
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  DollarSign,
  TrendingUp,
  Check,
  Search,
  Zap,
  Target,
  Star,
} from 'lucide-react';
import type { CompetitorAlert } from '../../../mocks/competitorAnalysis';

interface AlertActionModalProps {
  alert: CompetitorAlert | null;
  isOpen: boolean;
  onClose: () => void;
  competitorName: string;
}

// Mock products
const mockProducts = [
  {
    id: 'prod-001',
    name: 'Premium Kablosuz Kulaklık',
    sku: 'WH-001',
    stock: 45,
    price: 299,
    image: '🎧',
    category: 'Elektronik',
  },
  {
    id: 'prod-002',
    name: 'Akıllı Saat Pro',
    sku: 'SW-002',
    stock: 28,
    price: 1299,
    image: '⌚',
    category: 'Elektronik',
  },
  {
    id: 'prod-003',
    name: 'USB-C Hızlı Şarj Aleti',
    sku: 'CH-003',
    stock: 120,
    price: 149,
    image: '🔌',
    category: 'Aksesuar',
  },
  {
    id: 'prod-004',
    name: 'Bluetooth Hoparlör',
    sku: 'SP-004',
    stock: 67,
    price: 399,
    image: '🔊',
    category: 'Elektronik',
  },
];

export default function AlertActionModal({
  alert,
  isOpen,
  onClose,
  competitorName,
}: AlertActionModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');

  if (!alert) return null;

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedProductsList = mockProducts.filter(p =>
    selectedProducts.includes(p.id)
  );
  const totalRevenue = selectedProductsList.reduce(
    (sum, p) => sum + p.price * (1 - discountPercent / 100),
    0
  );

  const handleCreateCampaign = () => {
    console.log('Creating campaign with:', {
      products: selectedProducts,
      discount: discountPercent,
      alert: alert.id,
    });
    // Campaign creation logic
    onClose();
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
                <div className='p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl'>
                  <Zap size={24} className='text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Hızlı Aksiyon
                  </h2>
                  <p className='text-sm text-gray-400 mt-1'>
                    {competitorName} • Fırsat Değerlendirmesi
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {/* Alert Info */}
              <div className='bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-5'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-red-500/20 rounded-lg'>
                    <Target size={20} className='text-red-400' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-base font-semibold text-white mb-1'>
                      {alert.title}
                    </h3>
                    <p className='text-sm text-gray-300 mb-3'>
                      {alert.description}
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium'>
                        {alert.severity} öncelik
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(alert.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-base font-semibold text-white flex items-center gap-2'>
                    <Package size={18} className='text-blue-400' />
                    Ürünlerini Seç ({selectedProducts.length} seçili)
                  </h3>

                  {/* Search */}
                  <div className='relative'>
                    <Search
                      size={16}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='text'
                      placeholder='Ürün ara...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-9 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                {/* Product Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar'>
                  {filteredProducts.map(product => {
                    const isSelected = selectedProducts.includes(product.id);
                    const discountedPrice =
                      product.price * (1 - discountPercent / 100);

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`group cursor-pointer p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='text-3xl'>{product.image}</div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-white truncate'>
                              {product.name}
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-xs text-gray-500'>
                                SKU: {product.sku}
                              </span>
                              <span className='text-xs text-gray-600'>•</span>
                              <span className='text-xs text-green-400'>
                                {product.stock} stok
                              </span>
                            </div>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-xs text-gray-400 line-through'>
                                ₺{product.price}
                              </span>
                              <span className='text-sm font-bold text-green-400'>
                                ₺{Math.round(discountedPrice)}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <div className='p-1 bg-blue-500 rounded-full'>
                              <Check size={14} className='text-white' />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount Settings */}
              <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                <h3 className='text-base font-semibold text-white mb-4 flex items-center gap-2'>
                  <DollarSign size={18} className='text-green-400' />
                  İndirim Oranı
                </h3>

                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm text-gray-400'>İndirim</span>
                      <span className='text-2xl font-bold text-green-400'>
                        %{discountPercent}
                      </span>
                    </div>
                    <input
                      type='range'
                      min='5'
                      max='50'
                      value={discountPercent}
                      onChange={e => setDiscountPercent(Number(e.target.value))}
                      className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500'
                    />
                    <div className='flex items-center justify-between mt-1'>
                      <span className='text-xs text-gray-500'>%5</span>
                      <span className='text-xs text-gray-500'>%50</span>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className='flex gap-2'>
                    {[10, 15, 20, 25].map(percent => (
                      <button
                        key={percent}
                        onClick={() => setDiscountPercent(percent)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          discountPercent === percent
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        %{percent}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaign Summary */}
              {selectedProducts.length > 0 && (
                <div className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5'>
                  <h3 className='text-base font-semibold text-white mb-4 flex items-center gap-2'>
                    <TrendingUp size={18} className='text-blue-400' />
                    Kampanya Özeti
                  </h3>

                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>Seçilen Ürün</p>
                      <p className='text-xl font-bold text-white'>
                        {selectedProducts.length}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>
                        Ortalama İndirim
                      </p>
                      <p className='text-xl font-bold text-green-400'>
                        %{discountPercent}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400 mb-1'>
                        Tahmini Gelir
                      </p>
                      <p className='text-xl font-bold text-blue-400'>
                        ₺{Math.round(totalRevenue)}
                      </p>
                    </div>
                  </div>

                  <div className='mt-4 p-3 bg-black/30 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Star size={14} className='text-yellow-400' />
                      <span className='text-xs font-medium text-yellow-400'>
                        AI Önerisi
                      </span>
                    </div>
                    <p className='text-xs text-gray-300'>
                      Bu kampanya ile rakibinizin stok tükenmesi fırsatını
                      değerlendirerek %{Math.round(discountPercent * 2)} daha
                      fazla satış yapabilirsiniz!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className='flex items-center justify-between p-6 border-t border-white/10 bg-black/20'>
              <button
                onClick={onClose}
                className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all'
              >
                İptal
              </button>

              <button
                onClick={handleCreateCampaign}
                disabled={selectedProducts.length === 0}
                className='flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all'
              >
                <Zap size={18} />
                Kampanyayı Başlat
                {selectedProducts.length > 0 &&
                  ` (${selectedProducts.length} ürün)`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
