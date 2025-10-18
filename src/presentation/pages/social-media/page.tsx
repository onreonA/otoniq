/**
 * Social Media Management Page
 * Comprehensive social media automation platform
 */

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import DashboardTab from './components/DashboardTab';
import AccountsTab from './components/AccountsTab';
import AIContentTab from './components/AIContentTab';
import ContentCalendarTab from './components/ContentCalendarTab';
import AutomationTab from './components/AutomationTab';
import AnalyticsTab from './components/AnalyticsTab';
import SocialListeningTab from './components/SocialListeningTab';
import MediaLibraryTab from './components/MediaLibraryTab';

type TabId =
  | 'dashboard'
  | 'accounts'
  | 'ai-content'
  | 'calendar'
  | 'automation'
  | 'analytics'
  | 'listening'
  | 'media';

export default function SocialMediaPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Genel Bakış', icon: '🏠' },
    { id: 'accounts', label: 'Hesap Yönetimi', icon: '📱' },
    { id: 'ai-content', label: 'AI İçerik Üretici', icon: '✨' },
    { id: 'calendar', label: 'İçerik Takvimi', icon: '📅' },
    { id: 'automation', label: 'Otomasyon Kuralları', icon: '⚡' },
    { id: 'analytics', label: 'Analitik & Raporlar', icon: '📊' },
    { id: 'listening', label: 'Sosyal Dinleme', icon: '👂' },
    { id: 'media', label: 'Medya Kütüphanesi', icon: '🎨' },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
                <Share2 size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Sosyal Medya Otomasyon
                </h1>
                <p className='text-sm text-gray-300 mt-1'>
                  Tüm platformlarınızı tek yerden yönetin, AI ile içerik üretin,
                  otomatikleştirin
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-black/20 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md'>
        <div className='container mx-auto px-6'>
          <div className='flex items-center gap-1 overflow-x-auto pb-0'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-5 py-4 font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <span className='text-lg'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className='container mx-auto px-6 py-6'>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'accounts' && <AccountsTab />}
        {activeTab === 'ai-content' && <AIContentTab />}
        {activeTab === 'calendar' && <ContentCalendarTab />}
        {activeTab === 'automation' && <AutomationTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'listening' && <SocialListeningTab />}
        {activeTab === 'media' && <MediaLibraryTab />}
      </div>
    </div>
  );
}
