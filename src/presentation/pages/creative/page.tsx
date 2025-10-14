/**
 * Creative Studio Page
 * AI-powered visual automation and content generation
 */

import { useState } from 'react';
import FeatureIntro from '../../components/common/FeatureIntro';
import {
  mockTemplates,
  mockCreativeJobs,
  mockCreativeStats,
  TemplateData,
} from '../../mocks/creative';
import toast from 'react-hot-toast';

export default function CreativePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(
    null
  );

  const filteredTemplates =
    selectedCategory === 'all'
      ? mockTemplates
      : mockTemplates.filter(t => t.category === selectedCategory);

  const handleGenerateClick = (template: TemplateData) => {
    setSelectedTemplate(template);
    toast.loading('Görsel oluşturuluyor...');
    setTimeout(() => {
      toast.success(`${template.name} başarıyla oluşturuldu! ✨`);
      setSelectedTemplate(null);
    }, 2000);
  };

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='creative'
          title='🎨 Görsel Otomasyon: AI ile profesyonel tasarımlar'
          subtitle='Ürün görsellerinizi tüm platformlar için otomatik optimize edin ve dönüştürün'
          items={[
            'Sosyal medya için otomatik içerik üret',
            'Marketplace görselleri optimize et',
            'E-posta ve reklam bannerları oluştur',
            'Toplu görsel işleme ve boyutlandırma',
          ]}
          actions={[
            {
              label: 'Toplu İşlem Başlat',
              onClick: () => alert('Toplu işlem özelliği yakında!'),
              variant: 'primary',
            },
            {
              label: 'Şablon Yükle',
              to: '#upload',
              variant: 'secondary',
            },
          ]}
          variant='pink'
          icon='ri-palette-line'
        />

        {/* Page Header */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-pink-600/20 to-rose-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  🎨 Görsel Otomasyon Stüdyosu
                </h1>
                <p className='text-gray-300'>
                  AI destekli görsel içerik üretimi
                </p>
              </div>
              <div className='hidden md:block'>
                <div className='w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <i className='ri-brush-line text-white text-2xl'></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Toplam Üretim</p>
            <p className='text-2xl font-bold text-white'>
              {mockCreativeStats.totalGenerated.toLocaleString()}
            </p>
          </div>
          <div className='bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Şablon</p>
            <p className='text-2xl font-bold text-white'>
              {mockCreativeStats.totalTemplates}
            </p>
          </div>
          <div className='bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Başarı Oranı</p>
            <p className='text-2xl font-bold text-white'>
              %{mockCreativeStats.successRate}
            </p>
          </div>
          <div className='bg-gradient-to-br from-orange-600/20 to-amber-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Ort. İşlem</p>
            <p className='text-2xl font-bold text-white'>
              {mockCreativeStats.avgProcessTime}s
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className='mb-6'>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-2'>
            <div className='flex flex-wrap gap-2'>
              {[
                { id: 'all', label: 'Tümü', icon: 'ri-apps-line' },
                { id: 'social', label: 'Sosyal Medya', icon: 'ri-share-line' },
                {
                  id: 'marketplace',
                  label: 'Marketplace',
                  icon: 'ri-store-line',
                },
                { id: 'email', label: 'E-posta', icon: 'ri-mail-line' },
                { id: 'ad', label: 'Reklam', icon: 'ri-megaphone-line' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <i className={`${cat.icon} mr-2`}></i>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className='bg-gradient-to-br from-gray-900/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group'
            >
              {/* Thumbnail */}
              <div className='w-full aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                <span className='text-6xl'>{template.thumbnail}</span>
              </div>

              {/* Info */}
              <h3 className='text-white font-semibold mb-2'>{template.name}</h3>
              <div className='space-y-2 mb-4'>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <i className='ri-aspect-ratio-line'></i>
                  <span>{template.dimensions}</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-gray-400'>
                  <i className='ri-file-line'></i>
                  <span>{template.format}</span>
                </div>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {template.platform.map((p, i) => (
                    <span
                      key={i}
                      className='text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300'
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGenerateClick(template)}
                className='w-full px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
              >
                <i className='ri-magic-line mr-2'></i>
                Oluştur
              </button>
            </div>
          ))}
        </div>

        {/* Recent Jobs */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Son İşlemler
          </h3>
          <div className='space-y-3'>
            {mockCreativeJobs.map(job => (
              <div
                key={job.id}
                className='bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h4 className='text-white font-medium mb-1'>
                      {job.productName}
                    </h4>
                    <p className='text-sm text-gray-400'>{job.templateName}</p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {new Date(job.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : job.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {job.status === 'completed'
                        ? 'Tamamlandı'
                        : job.status === 'processing'
                          ? 'İşleniyor'
                          : 'Başarısız'}
                    </span>
                    {job.status === 'completed' && (
                      <button className='text-blue-400 hover:text-blue-300'>
                        <i className='ri-download-line text-xl'></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
