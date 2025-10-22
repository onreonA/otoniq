/**
 * AI Prompt-Based Tab
 * Generate images from text prompts using AI
 */

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  n8nImageService,
  N8NImageRequest,
} from '../../../../infrastructure/services/N8NImageService';

export default function AIPromptTab() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedQuality, setSelectedQuality] = useState('high');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(4);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Lütfen bir prompt girin');
      return;
    }

    setGenerating(true);
    toast.loading('N8N workflow ile görseller oluşturuluyor...', {
      id: 'ai-generate',
    });

    try {
      const request: N8NImageRequest = {
        prompt: prompt.trim(),
        style: selectedStyle as any,
        aspectRatio: selectedAspectRatio as any,
        quality: selectedQuality as any,
        numImages: numImages,
      };

      const response = await n8nImageService.generateImages(request);

      setGeneratedImages(response.images);
      setGenerating(false);

      toast.success(
        `${response.images.length} görsel başarıyla oluşturuldu! ✨`,
        {
          id: 'ai-generate',
        }
      );
    } catch (error) {
      console.error('❌ Image generation error:', error);
      setGenerating(false);
      toast.error(
        'Görsel oluşturma sırasında hata oluştu. Lütfen tekrar deneyin.',
        {
          id: 'ai-generate',
        }
      );
    }
  };

  const promptExamples = [
    '🏖️ Minimal plaj temalı ürün görseli, pastel renkler',
    '🌸 Çiçek motifleriyle süslenmiş şık bir arka plan',
    '🌃 Modern şehir manzarası, neon ışıklar',
    '🎨 Soyut sanat, geometrik şekiller, canlı renkler',
  ];

  return (
    <div className='space-y-6'>
      {/* Prompt Input Area */}
      <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <h3 className='text-xl font-semibold text-white mb-4'>
          ✨ AI Prompt Studio
        </h3>

        <div className='space-y-4'>
          {/* Main Prompt */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 resize-none'
              rows={4}
              placeholder='Örn: "Minimalist bir tasarım, arka planda soft gradient renkler, ortada ürün silüeti, modern ve profesyonel..."'
            />
          </div>

          {/* Settings Row */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Stil
              </label>
              <select
                value={selectedStyle}
                onChange={e => setSelectedStyle(e.target.value)}
                className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 text-sm'
              >
                <option value='realistic'>Realistik</option>
                <option value='artistic'>Sanatsal</option>
                <option value='minimalist'>Minimalist</option>
                <option value='vibrant'>Canlı</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Kalite
              </label>
              <select
                value={selectedQuality}
                onChange={e => setSelectedQuality(e.target.value)}
                className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 text-sm'
              >
                <option value='standard'>Standart</option>
                <option value='high'>Yüksek</option>
                <option value='ultra'>Ultra</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Boyut Oranı
              </label>
              <select
                value={selectedAspectRatio}
                onChange={e => setSelectedAspectRatio(e.target.value)}
                className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 text-sm'
              >
                <option value='1:1'>Kare (1:1)</option>
                <option value='16:9'>Geniş (16:9)</option>
                <option value='9:16'>Dikey (9:16)</option>
                <option value='4:3'>Klasik (4:3)</option>
                <option value='3:4'>Portre (3:4)</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Görsel Sayısı
              </label>
              <select
                value={numImages}
                onChange={e => setNumImages(Number(e.target.value))}
                className='w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-pink-500 text-sm'
              >
                <option value={1}>1 Görsel</option>
                <option value={2}>2 Görsel</option>
                <option value={4}>4 Görsel</option>
                <option value={6}>6 Görsel</option>
                <option value={8}>8 Görsel</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings (Collapsed) */}
          <details className='bg-white/5 rounded-xl p-4'>
            <summary className='text-sm font-medium text-gray-300 cursor-pointer hover:text-white transition-colors'>
              🎛️ Gelişmiş Ayarlar
            </summary>
            <div className='mt-4 space-y-3'>
              <div>
                <label className='block text-xs text-gray-400 mb-1'>
                  Çözünürlük
                </label>
                <select className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none text-sm'>
                  <option value='512'>512x512</option>
                  <option value='1024'>1024x1024</option>
                  <option value='1920'>1920x1080</option>
                </select>
              </div>
              <div>
                <label className='block text-xs text-gray-400 mb-1'>
                  Kalite
                </label>
                <input
                  type='range'
                  min='1'
                  max='100'
                  defaultValue='80'
                  className='w-full'
                />
              </div>
            </div>
          </details>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className='w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {generating ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <i className='ri-magic-line text-xl'></i>
                AI ile Oluştur
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prompt Examples */}
      <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <h3 className='text-sm font-semibold text-gray-300 mb-3'>
          💡 Prompt Örnekleri
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {promptExamples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(example)}
              className='text-left px-4 py-3 bg-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/15 hover:text-white transition-all duration-300'
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-white'>
              🎨 Oluşturulan Görseller
            </h3>
            <button
              onClick={() => toast.success('Tüm görseller indirildi!')}
              className='px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl text-sm hover:scale-105 transition-all duration-300'
            >
              📥 Tümünü İndir
            </button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {generatedImages.map((image, idx) => (
              <div
                key={idx}
                className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-4 hover:scale-105 transition-all duration-300 group cursor-pointer'
              >
                <div className='aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden'>
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={`Generated image ${idx + 1}`}
                      className='w-full h-full object-cover rounded-lg'
                    />
                  ) : (
                    <i className='ri-image-line text-4xl text-pink-400'></i>
                  )}
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2'>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.url;
                        link.download = `imagen-${idx + 1}.png`;
                        link.click();
                      }}
                      className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30'
                    >
                      <i className='ri-download-line text-white'></i>
                    </button>
                    <button
                      onClick={() => window.open(image.url, '_blank')}
                      className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30'
                    >
                      <i className='ri-expand-diagonal-line text-white'></i>
                    </button>
                  </div>
                </div>
                <div className='text-xs text-gray-300 text-center space-y-1'>
                  <p>N8N AI {idx + 1}</p>
                  <p className='text-gray-500'>
                    {image.metadata?.style || 'realistic'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
