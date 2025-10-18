/**
 * Add Competitor Modal
 * Yeni rakip ekleme modal'ı
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Globe,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Package,
} from 'lucide-react';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (competitor: NewCompetitorData) => void;
}

interface NewCompetitorData {
  name: string;
  website: string;
  platform: 'amazon' | 'shopify' | 'etsy' | 'trendyol' | 'n11' | 'hepsiburada';
  description: string;
  category: string;
  trackingEnabled: boolean;
}

const platforms = [
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '🛒',
    color: 'from-orange-500 to-yellow-600',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    color: 'from-green-500 to-emerald-600',
  },
  { id: 'etsy', name: 'Etsy', icon: '🎨', color: 'from-orange-400 to-red-500' },
  {
    id: 'trendyol',
    name: 'Trendyol',
    icon: '🇹🇷',
    color: 'from-orange-500 to-red-600',
  },
  { id: 'n11', name: 'N11', icon: '📦', color: 'from-purple-500 to-pink-600' },
  {
    id: 'hepsiburada',
    name: 'Hepsiburada',
    icon: '🟠',
    color: 'from-orange-600 to-orange-700',
  },
];

const categories = [
  'Elektronik',
  'Moda & Giyim',
  'Ev & Yaşam',
  'Spor & Outdoor',
  'Kozmetik & Kişisel Bakım',
  'Kitap & Hobi',
  'Oyuncak & Bebek',
  'Otomotiv',
  'Süpermarket',
  'Diğer',
];

export default function AddCompetitorModal({
  isOpen,
  onClose,
  onAdd,
}: AddCompetitorModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const [formData, setFormData] = useState<NewCompetitorData>({
    name: '',
    website: '',
    platform: 'shopify',
    description: '',
    category: '',
    trackingEnabled: true,
  });

  const handleUrlValidation = async () => {
    if (!formData.website) return;

    setIsValidating(true);
    setValidationResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock validation result
    const mockData = {
      name: 'Örnek Rakip Mağaza',
      description: 'E-ticaret sitesi - Elektronik ve Aksesuar',
      category: 'Elektronik',
      estimatedProducts: 1250,
      avgRating: 4.3,
      totalReviews: 856,
    };

    setValidationResult({
      valid: true,
      message: 'Website başarıyla doğrulandı!',
      data: mockData,
    });

    // Auto-fill form data
    setFormData(prev => ({
      ...prev,
      name: mockData.name,
      description: mockData.description,
      category: mockData.category,
    }));

    setIsValidating(false);
  };

  const handleSubmit = () => {
    onAdd(formData);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      website: '',
      platform: 'shopify',
      description: '',
      category: '',
      trackingEnabled: true,
    });
    setValidationResult(null);
    onClose();
  };

  const canProceedStep1 = formData.website && validationResult?.valid;
  const canProceedStep2 = formData.name && formData.platform;
  const canSubmit = formData.name && formData.website && formData.category;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed inset-4 md:inset-10 lg:left-1/4 lg:right-1/4 lg:top-10 lg:bottom-10 bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl border border-white/20 shadow-2xl z-50 overflow-hidden flex flex-col'
          >
            {/* Header */}
            <div className='flex items-center justify-between p-6 border-b border-white/10 bg-black/20'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl'>
                  <Plus size={24} className='text-white' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Yeni Rakip Ekle
                  </h2>
                  <p className='text-sm text-gray-400 mt-1'>
                    Adım {step} / 3 -{' '}
                    {step === 1
                      ? 'Website Bilgileri'
                      : step === 2
                        ? 'Platform & Kategori'
                        : 'Onay & Ayarlar'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className='p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors'
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className='px-6 pt-4'>
              <div className='flex items-center gap-2'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='flex-1 relative'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i <= step
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                          : 'bg-white/10'
                      }`}
                    />
                    {i < 3 && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full ${
                          i < step ? 'bg-purple-600' : 'bg-white/20'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto p-6'>
              <AnimatePresence mode='wait'>
                {/* Step 1: Website URL */}
                {step === 1 && (
                  <motion.div
                    key='step1'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className='space-y-6'
                  >
                    {/* URL Input */}
                    <div>
                      <label className='block text-sm font-medium text-white mb-2'>
                        Website URL *
                      </label>
                      <div className='relative'>
                        <Globe
                          size={18}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                        />
                        <input
                          type='url'
                          placeholder='https://www.rakip-site.com'
                          value={formData.website}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              website: e.target.value,
                            }))
                          }
                          className='w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                      <p className='text-xs text-gray-400 mt-2'>
                        Rakibinizin website adresini girin. Otomatik olarak
                        analiz edeceğiz.
                      </p>
                    </div>

                    {/* Validate Button */}
                    <button
                      onClick={handleUrlValidation}
                      disabled={!formData.website || isValidating}
                      className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all'
                    >
                      {isValidating ? (
                        <>
                          <Loader size={18} className='animate-spin' />
                          Analiz Ediliyor...
                        </>
                      ) : (
                        <>
                          <Search size={18} />
                          Website'yi Doğrula ve Analiz Et
                        </>
                      )}
                    </button>

                    {/* Validation Result */}
                    {validationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${
                          validationResult.valid
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className='flex items-start gap-3'>
                          {validationResult.valid ? (
                            <CheckCircle
                              size={20}
                              className='text-green-400 mt-0.5'
                            />
                          ) : (
                            <AlertCircle
                              size={20}
                              className='text-red-400 mt-0.5'
                            />
                          )}
                          <div className='flex-1'>
                            <p
                              className={`text-sm font-medium ${
                                validationResult.valid
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {validationResult.message}
                            </p>
                            {validationResult.valid &&
                              validationResult.data && (
                                <div className='mt-3 grid grid-cols-3 gap-3'>
                                  <div className='bg-white/5 rounded-lg p-2'>
                                    <div className='flex items-center gap-1 mb-1'>
                                      <Package
                                        size={12}
                                        className='text-blue-400'
                                      />
                                      <span className='text-xs text-gray-400'>
                                        Ürünler
                                      </span>
                                    </div>
                                    <p className='text-sm font-bold text-white'>
                                      {validationResult.data.estimatedProducts}
                                    </p>
                                  </div>
                                  <div className='bg-white/5 rounded-lg p-2'>
                                    <div className='flex items-center gap-1 mb-1'>
                                      <Star
                                        size={12}
                                        className='text-yellow-400'
                                      />
                                      <span className='text-xs text-gray-400'>
                                        Puan
                                      </span>
                                    </div>
                                    <p className='text-sm font-bold text-white'>
                                      {validationResult.data.avgRating}
                                    </p>
                                  </div>
                                  <div className='bg-white/5 rounded-lg p-2'>
                                    <div className='flex items-center gap-1 mb-1'>
                                      <Users
                                        size={12}
                                        className='text-purple-400'
                                      />
                                      <span className='text-xs text-gray-400'>
                                        Yorum
                                      </span>
                                    </div>
                                    <p className='text-sm font-bold text-white'>
                                      {validationResult.data.totalReviews}
                                    </p>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Platform & Details */}
                {step === 2 && (
                  <motion.div
                    key='step2'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className='space-y-6'
                  >
                    {/* Competitor Name */}
                    <div>
                      <label className='block text-sm font-medium text-white mb-2'>
                        Rakip Adı *
                      </label>
                      <div className='relative'>
                        <Building2
                          size={18}
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                        />
                        <input
                          type='text'
                          placeholder='Rakip mağaza adı'
                          value={formData.name}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className='w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    </div>

                    {/* Platform Selection */}
                    <div>
                      <label className='block text-sm font-medium text-white mb-3'>
                        Platform Seçin *
                      </label>
                      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                        {platforms.map(platform => (
                          <button
                            key={platform.id}
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                platform: platform.id as any,
                              }))
                            }
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData.platform === platform.id
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className='text-3xl mb-2'>{platform.icon}</div>
                            <p className='text-sm font-medium text-white'>
                              {platform.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className='block text-sm font-medium text-white mb-2'>
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className='w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Kategori seçin</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className='block text-sm font-medium text-white mb-2'>
                        Açıklama (Opsiyonel)
                      </label>
                      <textarea
                        placeholder='Rakip hakkında notlar...'
                        value={formData.description}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={4}
                        className='w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <motion.div
                    key='step3'
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className='space-y-6'
                  >
                    {/* Summary Card */}
                    <div className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6'>
                      <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                        <CheckCircle size={20} className='text-green-400' />
                        Özet
                      </h3>

                      <div className='space-y-4'>
                        <div className='flex items-start justify-between'>
                          <span className='text-sm text-gray-400'>
                            Rakip Adı:
                          </span>
                          <span className='text-sm font-medium text-white'>
                            {formData.name}
                          </span>
                        </div>

                        <div className='flex items-start justify-between'>
                          <span className='text-sm text-gray-400'>
                            Website:
                          </span>
                          <a
                            href={formData.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1'
                          >
                            {formData.website
                              .replace('https://', '')
                              .slice(0, 30)}
                            <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className='flex items-start justify-between'>
                          <span className='text-sm text-gray-400'>
                            Platform:
                          </span>
                          <span className='text-sm font-medium text-white capitalize'>
                            {
                              platforms.find(p => p.id === formData.platform)
                                ?.name
                            }
                          </span>
                        </div>

                        <div className='flex items-start justify-between'>
                          <span className='text-sm text-gray-400'>
                            Kategori:
                          </span>
                          <span className='text-sm font-medium text-white'>
                            {formData.category}
                          </span>
                        </div>

                        {formData.description && (
                          <div className='pt-3 border-t border-white/10'>
                            <span className='text-sm text-gray-400 block mb-2'>
                              Açıklama:
                            </span>
                            <p className='text-sm text-white'>
                              {formData.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracking Toggle */}
                    <div className='bg-black/30 rounded-xl p-5 border border-white/10'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <TrendingUp size={18} className='text-purple-400' />
                            <h4 className='text-sm font-semibold text-white'>
                              Otomatik Takip
                            </h4>
                          </div>
                          <p className='text-xs text-gray-400'>
                            Rakibinizin ürünleri, fiyatları ve yorumları
                            otomatik olarak takip edilsin mi?
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setFormData(prev => ({
                              ...prev,
                              trackingEnabled: !prev.trackingEnabled,
                            }))
                          }
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            formData.trackingEnabled
                              ? 'bg-green-500'
                              : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              formData.trackingEnabled ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className='bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4'>
                      <div className='flex items-start gap-3'>
                        <AlertCircle
                          size={18}
                          className='text-yellow-400 mt-0.5'
                        />
                        <div>
                          <p className='text-sm text-yellow-400 font-medium mb-1'>
                            Bilgilendirme
                          </p>
                          <p className='text-xs text-gray-300'>
                            İlk analiz 5-10 dakika içinde tamamlanacak. Sonuçlar
                            hazır olduğunda bildirim alacaksınız.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className='flex items-center justify-between p-6 border-t border-white/10 bg-black/20'>
              {step > 1 ? (
                <button
                  onClick={() => setStep(prev => (prev - 1) as any)}
                  className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all'
                >
                  Geri
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all'
                >
                  İptal
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={() => setStep(prev => (prev + 1) as any)}
                  disabled={
                    (step === 1 && !canProceedStep1) ||
                    (step === 2 && !canProceedStep2)
                  }
                  className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all'
                >
                  Devam Et
                  <CheckCircle size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className='flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all'
                >
                  <Plus size={18} />
                  Rakibi Ekle ve Analizi Başlat
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
