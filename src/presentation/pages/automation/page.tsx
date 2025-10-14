/**
 * Automation Center Page
 * N8N workflow management, monitoring, and automation hub
 */

import { useState } from 'react';
import FeatureIntro from '../../components/common/FeatureIntro';
import WorkflowCard from './components/WorkflowCard';
import WorkflowDetailModal from './components/WorkflowDetailModal';
import {
  mockWorkflows,
  mockAutomationStats,
  WorkflowData,
} from '../../mocks/automation';

export default function AutomationPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(
    null
  );
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredWorkflows =
    filterCategory === 'all'
      ? mockWorkflows
      : mockWorkflows.filter(w => w.category === filterCategory);

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='automation'
          title='⚡ Otomasyon Merkezi: İş akışlarınızı otomatikleştirin'
          subtitle='N8N ile güçlendirilmiş otomasyon sistemi - sosyal medya, e-posta, müşteri desteği ve daha fazlası'
          items={[
            'Sosyal medya paylaşımlarını otomatikleştir',
            'E-posta kampanyalarını planla ve gönder',
            'Müşteri desteğini AI ile güçlendir',
            'Stok ve sipariş takibini otomatikleştir',
          ]}
          actions={[
            {
              label: 'Yeni Otomasyon Oluştur',
              onClick: () =>
                alert('Yeni otomasyon oluşturma özelliği yakında!'),
              variant: 'primary',
            },
            {
              label: 'N8N Ayarları',
              to: '#settings',
              variant: 'secondary',
            },
          ]}
          variant='purple'
          icon='ri-flashlight-line'
        />

        {/* Page Header */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  ⚡ Otomasyon Merkezi
                </h1>
                <p className='text-gray-300'>
                  İş akışlarınızı yönetin ve izleyin
                </p>
              </div>
              <div className='hidden md:block'>
                <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <i className='ri-robot-2-line text-white text-2xl'></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
          <div className='bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Toplam Workflow</p>
            <p className='text-2xl font-bold text-white'>
              {mockAutomationStats.totalWorkflows}
            </p>
          </div>
          <div className='bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Aktif</p>
            <p className='text-2xl font-bold text-white'>
              {mockAutomationStats.activeWorkflows}
            </p>
          </div>
          <div className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>24 Saat Koşum</p>
            <p className='text-2xl font-bold text-white'>
              {mockAutomationStats.totalRuns24h}
            </p>
          </div>
          <div className='bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Başarı Oranı</p>
            <p className='text-2xl font-bold text-white'>
              %{mockAutomationStats.successRate}
            </p>
          </div>
          <div className='bg-gradient-to-br from-orange-600/20 to-amber-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>Ort. Süre</p>
            <p className='text-2xl font-bold text-white'>
              {mockAutomationStats.avgDuration}s
            </p>
          </div>
          <div className='bg-gradient-to-br from-pink-600/20 to-rose-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <p className='text-gray-300 text-sm mb-1'>İşlenen Öğe</p>
            <p className='text-2xl font-bold text-white'>
              {mockAutomationStats.itemsProcessed24h.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className='mb-6'>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-2'>
            <div className='flex flex-wrap gap-2'>
              {[
                { id: 'all', label: 'Tümü', icon: 'ri-apps-line' },
                {
                  id: 'social-media',
                  label: 'Sosyal Medya',
                  icon: 'ri-share-line',
                },
                {
                  id: 'email-marketing',
                  label: 'E-posta',
                  icon: 'ri-mail-line',
                },
                {
                  id: 'customer-support',
                  label: 'Destek',
                  icon: 'ri-customer-service-line',
                },
                { id: 'inventory', label: 'Stok', icon: 'ri-box-line' },
                {
                  id: 'analytics',
                  label: 'Analitik',
                  icon: 'ri-bar-chart-line',
                },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    filterCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
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

        {/* Workflows Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {filteredWorkflows.map(workflow => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onViewDetails={setSelectedWorkflow}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredWorkflows.length === 0 && (
          <div className='text-center py-12 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl'>
            <i className='ri-inbox-line text-gray-500 text-5xl mb-3'></i>
            <p className='text-white font-semibold mb-1'>
              Bu kategoride workflow bulunamadı
            </p>
            <p className='text-sm text-gray-400'>Farklı bir kategori seçin</p>
          </div>
        )}
      </div>

      {/* Workflow Detail Modal */}
      <WorkflowDetailModal
        workflow={selectedWorkflow}
        isOpen={!!selectedWorkflow}
        onClose={() => setSelectedWorkflow(null)}
      />
    </div>
  );
}
