/**
 * Product-Based Automation Tab
 * Step 1: Select product(s)
 * Step 2: Select template(s) (Instagram, Facebook, etc.)
 * Step 3: Configure AI settings
 * Step 4: Generate & preview
 */

import { useState } from 'react';
import { mockTemplates, mockCreativeStats } from '../../../mocks/creative';
import toast from 'react-hot-toast';
import { n8nImageService } from '../../../../infrastructure/services/N8NImageService';

type Step = 1 | 2 | 3 | 4;

export default function ProductBasedTab() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  // Mock products for demo
  const mockProducts = [
    {
      id: '1',
      name: 'Premium T-Shirt',
      image: 'https://via.placeholder.com/150',
      price: 299,
    },
    {
      id: '2',
      name: 'Denim Jeans',
      image: 'https://via.placeholder.com/150',
      price: 499,
    },
    {
      id: '3',
      name: 'Running Shoes',
      image: 'https://via.placeholder.com/150',
      price: 899,
    },
    {
      id: '4',
      name: 'Hoodie',
      image: 'https://via.placeholder.com/150',
      price: 399,
    },
  ];

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleGenerate = async () => {
    if (selectedProducts.length === 0 || selectedTemplates.length === 0) {
      toast.error('Lütfen en az 1 ürün ve 1 şablon seçin');
      return;
    }

    setGenerating(true);
    toast.loading('N8N workflow ile görseller oluşturuluyor...', {
      id: 'generate',
    });

    try {
      // Generate images for each selected product and template combination
      const generationPromises = [];

      for (const productId of selectedProducts) {
        for (const templateId of selectedTemplates) {
          const template = mockTemplates.find(t => t.id === templateId);
          const product = mockProducts.find(p => p.id === productId);

          if (template && product) {
            const prompt = `${product.name} ürünü için ${template.name} şablonu. ${template.description}. 
            Ürün açıklaması: ${product.description}. 
            Profesyonel e-ticaret görseli, temiz arka plan, yüksek kalite.`;

            generationPromises.push(
              n8nImageService.generateImages({
                prompt,
                style: 'realistic',
                aspectRatio: '1:1',
                quality: 'high',
                numImages: 2,
              })
            );
          }
        }
      }

      const results = await Promise.all(generationPromises);
      console.log('🎨 Generated images:', results);

      setGenerating(false);
      toast.success(`${results.length} görsel seti başarıyla oluşturuldu! ✨`, {
        id: 'generate',
      });
      setCurrentStep(4);
    } catch (error) {
      console.error('❌ Generation error:', error);
      setGenerating(false);
      toast.error(
        'Görsel oluşturma sırasında hata oluştu. Lütfen tekrar deneyin.',
        {
          id: 'generate',
        }
      );
    }
  };

  const steps = [
    { num: 1, label: 'Ürün Seçimi', icon: 'ri-product-hunt-line' },
    { num: 2, label: 'Şablon Seçimi', icon: 'ri-layout-grid-line' },
    { num: 3, label: 'AI Ayarları', icon: 'ri-settings-3-line' },
    { num: 4, label: 'Oluştur & Önizle', icon: 'ri-eye-line' },
  ];

  return (
    <div>
      {/* Progress Steps */}
      <div className='mb-8'>
        <div className='flex items-center justify-between max-w-4xl mx-auto'>
          {steps.map((step, index) => (
            <div key={step.num} className='flex-1 flex items-center'>
              <div className='flex flex-col items-center flex-1'>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all duration-300 ${
                    currentStep >= step.num
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-110'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  <i className={step.icon}></i>
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep >= step.num ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step.num
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'bg-white/10'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {currentStep === 1 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            📦 Ürün Seçimi ({selectedProducts.length} seçili)
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            {mockProducts.map(product => (
              <div
                key={product.id}
                onClick={() => handleProductToggle(product.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedProducts.includes(product.id)
                    ? 'ring-4 ring-pink-500 scale-105'
                    : 'hover:scale-102'
                } bg-white/10 p-3`}
              >
                <div className='aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center'>
                  <i className='ri-image-line text-4xl text-gray-400'></i>
                </div>
                <h4 className='text-sm font-medium text-white mb-1 truncate'>
                  {product.name}
                </h4>
                <p className='text-xs text-gray-400'>₺{product.price}</p>
                {selectedProducts.includes(product.id) && (
                  <div className='absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center'>
                    <i className='ri-check-line text-white text-sm'></i>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCurrentStep(2)}
            disabled={selectedProducts.length === 0}
            className='w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Devam Et →
          </button>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {currentStep === 2 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-semibold text-white mb-4'>
            🎨 Şablon Seçimi ({selectedTemplates.length} seçili)
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
            {mockTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleTemplateToggle(template.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedTemplates.includes(template.id)
                    ? 'ring-4 ring-pink-500 scale-105'
                    : 'hover:scale-102'
                } bg-white/10 p-4`}
              >
                <div className='aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg mb-3 flex items-center justify-center'>
                  <i className={`${template.icon} text-4xl text-pink-400`}></i>
                </div>
                <h4 className='text-sm font-medium text-white mb-1'>
                  {template.name}
                </h4>
                <p className='text-xs text-gray-400'>{template.category}</p>
                {selectedTemplates.includes(template.id) && (
                  <div className='absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center'>
                    <i className='ri-check-line text-white text-sm'></i>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setCurrentStep(1)}
              className='flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/15 transition-all duration-300'
            >
              ← Geri
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={selectedTemplates.length === 0}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Devam Et →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Settings */}
      {currentStep === 3 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-semibold text-white mb-6'>
            ⚙️ AI Ayarları
          </h3>

          <div className='space-y-4 mb-6'>
            {/* Style */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Görsel Stili
              </label>
              <select className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500'>
                <option value='modern'>Modern & Minimalist</option>
                <option value='vibrant'>Canlı & Renkli</option>
                <option value='elegant'>Zarif & Profesyonel</option>
                <option value='playful'>Eğlenceli & Dinamik</option>
              </select>
            </div>

            {/* Colors */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Renk Şeması
              </label>
              <div className='flex gap-3'>
                {['pink', 'blue', 'green', 'purple', 'orange'].map(color => (
                  <button
                    key={color}
                    className={`w-12 h-12 rounded-xl bg-${color}-500 hover:scale-110 transition-all duration-300`}
                  />
                ))}
              </div>
            </div>

            {/* AI Prompt */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Ek AI Talimatları (Opsiyonel)
              </label>
              <textarea
                className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 resize-none'
                rows={3}
                placeholder='Örn: "Ürünü merkeze yerleştir, arka plana çiçek motifleri ekle..."'
              />
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => setCurrentStep(2)}
              className='flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/15 transition-all duration-300'
            >
              ← Geri
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {generating ? 'Oluşturuluyor...' : '✨ Oluştur'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-semibold text-white mb-6'>
            🎉 Görselleriniz Hazır!
          </h3>

          {/* Mock Results Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
            {selectedProducts.flatMap(productId =>
              selectedTemplates.map((templateId, idx) => (
                <div
                  key={`${productId}-${templateId}`}
                  className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-4 hover:scale-105 transition-all duration-300'
                >
                  <div className='aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center'>
                    <i className='ri-image-line text-4xl text-pink-400'></i>
                  </div>
                  <p className='text-xs text-gray-300 text-center'>
                    Görsel {idx + 1}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className='flex gap-3'>
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedProducts([]);
                setSelectedTemplates([]);
              }}
              className='flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/15 transition-all duration-300'
            >
              🔄 Yeni Üretim
            </button>
            <button
              onClick={() => toast.success('Tüm görseller indirildi!')}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300'
            >
              📥 Tümünü İndir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
