/**
 * Creative Studio Page (3-Tab Structure)
 * Tab 1: Product-Based Automation (select product → template → generate)
 * Tab 2: Manual Upload (upload & edit images)
 * Tab 3: AI Prompt-Based (text → image with AI)
 */

import { useState } from 'react';
import FeatureIntro from '../../components/common/FeatureIntro';
import ProductBasedTab from './tabs/ProductBasedTab';
import ManualUploadTab from './tabs/ManualUploadTab';
import AIPromptTab from './tabs/AIPromptTab';

type TabType = 'product' | 'upload' | 'prompt';

export default function CreativePage() {
  const [activeTab, setActiveTab] = useState<TabType>('product');

  const tabs = [
    {
      id: 'product' as TabType,
      label: 'Ürün Bazlı',
      icon: 'ri-product-hunt-line',
      description: 'Mevcut ürünlerinizden görsel oluştur',
    },
    {
      id: 'upload' as TabType,
      label: 'Manuel Yükleme',
      icon: 'ri-upload-cloud-line',
      description: 'Kendi görsellerinizi yükleyin ve düzenleyin',
    },
    {
      id: 'prompt' as TabType,
      label: 'AI Prompt',
      icon: 'ri-magic-line',
      description: 'Metinden görsel üretin',
    },
  ];

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='creative'
          title='🎨 Görsel Otomasyon: AI ile profesyonel tasarımlar'
          subtitle='Ürün görsellerinizi tüm platformlar için otomatik optimize edin ve dönüştürün'
          items={[
            'Ürünlerinizden sosyal medya içeriği otomatik üret',
            'Marketplace görselleri optimize et ve boyutlandır',
            'AI ile metin promptlarından görseller oluştur',
            'Toplu görsel işleme ve dışa aktarma',
          ]}
          actions={[
            {
              label: 'Toplu İşlem Başlat',
              onClick: () => setActiveTab('product'),
              variant: 'primary',
            },
            {
              label: 'Galeri',
              to: '/creative/gallery',
              variant: 'secondary',
            },
          ]}
          variant='pink'
          icon='ri-palette-line'
        />

        {/* Page Header with Tabs */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-pink-600/20 to-rose-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
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

            {/* Tab Navigation */}
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                      : 'bg-white/10 text-gray-300 hover:bg-white/15'
                  }`}
                >
                  <div className='flex items-center gap-2 justify-center'>
                    <i className={`${tab.icon} text-xl`}></i>
                    <div className='text-left'>
                      <div className='font-semibold'>{tab.label}</div>
                      <div className='text-xs opacity-80'>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className='min-h-[600px]'>
          {activeTab === 'product' && <ProductBasedTab />}
          {activeTab === 'upload' && <ManualUploadTab />}
          {activeTab === 'prompt' && <AIPromptTab />}
        </div>
      </div>
    </div>
  );
}
