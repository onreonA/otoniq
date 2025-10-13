import { useState } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminStats from './components/AdminStats';
import UserManagement from './components/UserManagement';
import TenantManagement from './components/TenantManagement';
import SystemMonitoring from './components/SystemMonitoring';
import AIModelStatus from './components/AIModelStatus';
import RevenueAnalytics from './components/RevenueAnalytics';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Genel Bakış', icon: 'ri-dashboard-line' },
    { id: 'tenants', name: 'Müşteri Yönetimi', icon: 'ri-building-line' },
    { id: 'users', name: 'Kullanıcı Yönetimi', icon: 'ri-user-settings-line' },
    { id: 'system', name: 'Sistem İzleme', icon: 'ri-computer-line' },
    { id: 'ai', name: 'AI Modelleri', icon: 'ri-robot-line' },
    {
      id: 'revenue',
      name: 'Gelir Analizi',
      icon: 'ri-money-dollar-circle-line',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <AdminStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SystemMonitoring />
              <AIModelStatus />
            </div>
          </div>
        );
      case 'tenants':
        return <TenantManagement />;
      case 'users':
        return <UserManagement />;
      case 'system':
        return <SystemMonitoring />;
      case 'ai':
        return <AIModelStatus />;
      case 'revenue':
        return <RevenueAnalytics />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        <AdminHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    🛡️ Admin Panel
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Otoniq.ai sistem yönetimi ve kullanıcı kontrolü
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <i className="ri-shield-star-line text-white text-3xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
              <div className="flex space-x-2 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`${tab.icon} text-lg`}></i>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-96">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
