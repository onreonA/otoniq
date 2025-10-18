/**
 * AI Content Generator Tab
 * AI destekli içerik üretimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import type { Platform } from '../../../mocks/socialMedia';

export default function AIContentTab() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    'instagram',
  ]);
  const [contentType, setContentType] = useState('product');
  const [tone, setTone] = useState('friendly');
  const [useEmoji, setUseEmoji] = useState(true);
  const [hashtagCount, setHashtagCount] = useState(5);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const platforms: Array<{ id: Platform; name: string; color: string }> = [
    {
      id: 'instagram',
      name: 'Instagram',
      color: 'from-pink-600 to-purple-600',
    },
    { id: 'facebook', name: 'Facebook', color: 'from-blue-600 to-blue-700' },
    { id: 'twitter', name: 'Twitter/X', color: 'from-sky-500 to-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', color: 'from-blue-700 to-blue-800' },
    { id: 'tiktok', name: 'TikTok', color: 'from-gray-900 to-pink-600' },
  ];

  const contentTypes = [
    { id: 'product', name: 'Ürün Tanıtımı', icon: '📦' },
    { id: 'story', name: 'Hikaye', icon: '📖' },
    { id: 'educational', name: 'Eğitici', icon: '🎓' },
    { id: 'entertaining', name: 'Eğlenceli', icon: '🎉' },
    { id: 'campaign', name: 'Kampanya', icon: '🎯' },
    { id: 'announcement', name: 'Duyuru', icon: '📢' },
  ];

  const tones = [
    { id: 'professional', name: 'Profesyonel', icon: '💼' },
    { id: 'friendly', name: 'Samimi', icon: '🤝' },
    { id: 'fun', name: 'Eğlenceli', icon: '😄' },
    { id: 'excited', name: 'Heyecanlı', icon: '🔥' },
    { id: 'urgent', name: 'Acil', icon: '⚡' },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent([
        `${useEmoji ? '🚀 ' : ''}Yeni ürünümüzle tanışın! E-ticaret işinizi bir üst seviyeye taşıyın. ${useEmoji ? '✨' : ''}\n\nOtoniq AI ile sosyal medya yönetimi artık çok kolay!\n\n${Array.from({ length: hashtagCount }, (_, i) => `#eticaret${i + 1}`).join(' ')}`,
        `${useEmoji ? '💡 ' : ''}İşinizi büyütmeye hazır mısınız? Otoniq AI ile tüm sosyal medya hesaplarınızı tek yerden yönetin! ${useEmoji ? '🎯' : ''}\n\n${Array.from({ length: hashtagCount }, (_, i) => `#ai${i + 1}`).join(' ')}`,
        `${useEmoji ? '✨ ' : ''}Başarı hikayeniz burada başlıyor! Otoniq AI ile içerik üretin, planlayın ve analiz edin. ${useEmoji ? '📈' : ''}\n\n${Array.from({ length: hashtagCount }, (_, i) => `#otomasyon${i + 1}`).join(' ')}`,
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className='grid grid-cols-12 gap-6'>
      {/* Left Panel - Settings */}
      <div className='col-span-4 space-y-4'>
        {/* Platform Selection */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Platform Seçimi
          </h3>
          <div className='space-y-2'>
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() =>
                  setSelectedPlatforms(prev =>
                    prev.includes(platform.id)
                      ? prev.filter(p => p !== platform.id)
                      : [...prev, platform.id]
                  )
                }
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? `bg-gradient-to-r ${platform.color} text-white`
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${selectedPlatforms.includes(platform.id) ? 'bg-white' : 'bg-gray-600'}`}
                />
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>İçerik Tipi</h3>
          <div className='grid grid-cols-2 gap-2'>
            {contentTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  contentType === type.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>Ton</h3>
          <div className='space-y-2'>
            {tones.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tone === t.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{t.icon}</span>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>Seçenekler</h3>
          <div className='space-y-4'>
            <label className='flex items-center justify-between'>
              <span className='text-sm text-gray-300'>Emoji Kullan</span>
              <button
                onClick={() => setUseEmoji(!useEmoji)}
                className={`w-12 h-6 rounded-full transition-all ${
                  useEmoji ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    useEmoji ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <div>
              <label className='flex items-center justify-between mb-2'>
                <span className='text-sm text-gray-300'>Hashtag Sayısı</span>
                <span className='text-sm font-bold text-blue-400'>
                  {hashtagCount}
                </span>
              </label>
              <input
                type='range'
                min='0'
                max='30'
                value={hashtagCount}
                onChange={e => setHashtagCount(Number(e.target.value))}
                className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Prompt & Generate */}
      <div className='col-span-5 space-y-4'>
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
            <Sparkles size={16} className='text-yellow-400' />
            AI Prompt
          </h3>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder='Neyi paylaşmak istiyorsunuz? Ürününüzü, kampanyanızı veya fikrimi detaylı anlatın...'
            className='w-full h-32 px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          />

          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className='w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all'
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className='animate-spin' />
                AI İçerik Üretiyor...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                AI ile Üret
              </>
            )}
          </button>
        </div>

        {/* Generated Content */}
        {generatedContent.length > 0 && (
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold text-white'>
              Üretilen Varyasyonlar
            </h3>
            {generatedContent.map((content, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
              >
                <div className='flex items-start justify-between mb-3'>
                  <span className='text-xs font-semibold text-blue-400'>
                    Varyasyon #{index + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(content, index)}
                    className='flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-all'
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={14} className='text-green-400' />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Kopyala
                      </>
                    )}
                  </button>
                </div>
                <p className='text-sm text-white whitespace-pre-wrap'>
                  {content}
                </p>
                <div className='mt-4 pt-4 border-t border-white/10 flex items-center justify-between'>
                  <span className='text-xs text-gray-400'>
                    {content.length} karakter
                  </span>
                  <button className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all'>
                    Kullan ve Zamanla
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className='col-span-3'>
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 sticky top-6'>
          <h3 className='text-sm font-semibold text-white mb-4'>Önizleme</h3>
          <div className='space-y-4'>
            {selectedPlatforms.map(platform => (
              <div
                key={platform}
                className='bg-white/5 rounded-lg p-4 border border-white/10'
              >
                <div className='text-xs text-gray-400 mb-2 capitalize'>
                  {platform} Görünümü
                </div>
                <div className='bg-black/50 rounded-lg p-3 min-h-[100px]'>
                  {generatedContent[0] ? (
                    <p className='text-xs text-white whitespace-pre-wrap line-clamp-6'>
                      {generatedContent[0]}
                    </p>
                  ) : (
                    <p className='text-xs text-gray-600'>
                      İçerik üretildiğinde burada görünecek...
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className='bg-blue-500/10 border border-blue-500/30 rounded-lg p-3'>
              <p className='text-xs text-blue-400'>
                💡 <strong>İpucu:</strong> En iyi posting saati:{' '}
                <span className='font-semibold'>Çarşamba 14:00</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
