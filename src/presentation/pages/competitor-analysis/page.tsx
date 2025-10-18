/**
 * Competitor Analysis Page
 * Rakip analizi ve fırsat tespiti sayfası
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  BarChart3,
  Zap,
  Users,
  DollarSign,
} from 'lucide-react';
import FeatureIntro from '../../components/common/FeatureIntro';
import CompetitorList from './components/CompetitorList';
import CompetitorInsights from './components/CompetitorInsights';
import StrategyGenerator from './components/StrategyGenerator';
import CompetitorAlerts from './components/CompetitorAlerts';
import StrategyDetailModal from './components/StrategyDetailModal';
import CompetitorDetailSidebar from './components/CompetitorDetailSidebar';
import AlertActionModal from './components/AlertActionModal';
import AddCompetitorModal from './components/AddCompetitorModal';
import {
  mockCompetitors,
  mockInsights,
  mockStrategies,
  mockAlerts,
  getTotalOpportunities,
  getCriticalAlerts,
  type CompetitorProfile,
  type CompetitorStrategy,
  type CompetitorAlert,
} from '../../mocks/competitorAnalysis';

export default function CompetitorAnalysisPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'competitors' | 'insights' | 'strategies' | 'alerts'
  >('overview');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(
    null
  );

  // Modal states
  const [selectedStrategy, setSelectedStrategy] =
    useState<CompetitorStrategy | null>(null);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [selectedCompetitorProfile, setSelectedCompetitorProfile] =
    useState<CompetitorProfile | null>(null);
  const [isCompetitorSidebarOpen, setIsCompetitorSidebarOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<CompetitorAlert | null>(
    null
  );
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAddCompetitorModalOpen, setIsAddCompetitorModalOpen] =
    useState(false);

  const totalOpportunities = getTotalOpportunities();
  const criticalAlerts = getCriticalAlerts();

  const stats = [
    {
      icon: Target,
      label: 'Toplam Fırsat',
      value: totalOpportunities,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: AlertTriangle,
      label: 'Kritik Uyarı',
      value: criticalAlerts.length,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
    },
    {
      icon: TrendingUp,
      label: 'Aktif Rakipler',
      value: mockCompetitors.filter(c => c.isActive).length,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      icon: CheckCircle,
      label: 'Hazır Stratejiler',
      value: mockStrategies.filter(s => s.status === 'ready').length,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
    { id: 'competitors', label: 'Rakipler', icon: Users },
    { id: 'insights', label: 'Fırsatlar', icon: Eye },
    { id: 'strategies', label: 'Stratejiler', icon: Zap },
    { id: 'alerts', label: 'Uyarılar', icon: AlertTriangle },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Compact Header with Gradient */}
      <div className='bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
                <Target size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Rakip Fırsatları
                </h1>
                <p className='text-sm text-gray-300 mt-1'>
                  AI ile rakiplerinizi analiz edin ve stratejik avantaj kazanın
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddCompetitorModalOpen(true)}
                className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200'
              >
                <Plus size={18} />
                Yeni Rakip Ekle
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-white/20 transition-all duration-200'
              >
                <Zap size={18} />
                AI Analiz
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-6 py-6'>
        {/* Stats Cards - Improved Design */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className='group relative overflow-hidden bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all duration-300 cursor-pointer'
            >
              {/* Gradient Background on Hover */}
              <div
                className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div className='relative z-10'>
                <div className='flex items-start justify-between mb-3'>
                  <div
                    className={`p-2.5 rounded-lg ${stat.bgColor} ${stat.borderColor} border group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <span className='text-[10px] uppercase tracking-wider text-gray-500 font-medium'>
                    24h
                  </span>
                </div>
                <div>
                  <p className='text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300'>
                    {stat.value}
                  </p>
                  <p className='text-xs text-gray-400 font-medium'>
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation - Card Style */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-2 mb-6'>
          <div className='flex flex-wrap gap-1'>
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={16} />
                <span className='text-sm'>{tab.label}</span>
                {tab.id === 'alerts' && criticalAlerts.length > 0 && (
                  <span className='ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full'>
                    {criticalAlerts.length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Quick Overview Cards */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                {/* Kritik Fırsatlar */}
                <div className='bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-red-500/20 rounded-lg'>
                        <AlertTriangle size={20} className='text-red-400' />
                      </div>
                      <h4 className='text-sm font-semibold text-white'>
                        Kritik Fırsatlar
                      </h4>
                    </div>
                    <span className='text-2xl font-bold text-red-400'>
                      {
                        mockInsights.filter(
                          i => i.opportunityLevel === 'critical'
                        ).length
                      }
                    </span>
                  </div>
                  <p className='text-xs text-gray-300'>
                    Hemen aksiyon gerektiren fırsatlar
                  </p>
                </div>

                {/* Aktif Stratejiler */}
                <div className='bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-green-500/20 rounded-lg'>
                        <CheckCircle size={20} className='text-green-400' />
                      </div>
                      <h4 className='text-sm font-semibold text-white'>
                        Hazır Stratejiler
                      </h4>
                    </div>
                    <span className='text-2xl font-bold text-green-400'>
                      {mockStrategies.filter(s => s.status === 'ready').length}
                    </span>
                  </div>
                  <p className='text-xs text-gray-300'>
                    Yayınlanmaya hazır kampanyalar
                  </p>
                </div>

                {/* Toplam Potansiyel ROI */}
                <div className='bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-blue-500/20 rounded-lg'>
                        <DollarSign size={20} className='text-blue-400' />
                      </div>
                      <h4 className='text-sm font-semibold text-white'>
                        Potansiyel ROI
                      </h4>
                    </div>
                    <span className='text-2xl font-bold text-blue-400'>
                      ₺
                      {mockStrategies
                        .reduce((sum, s) => sum + (s.expectedROI || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <p className='text-xs text-gray-300'>
                    Beklenen toplam getiri
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Son Fırsatlar */}
                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='text-base font-semibold text-white'>
                      🎯 Yüksek Öncelikli Fırsatlar
                    </h4>
                    <span className='text-xs text-blue-400 hover:underline cursor-pointer'>
                      Tümünü Gör →
                    </span>
                  </div>
                  <div className='space-y-2'>
                    {mockInsights.slice(0, 4).map(insight => (
                      <div
                        key={insight.id}
                        onClick={() => {
                          const competitor = mockCompetitors.find(
                            c => c.id === insight.competitorId
                          );
                          if (competitor) {
                            setSelectedCompetitorProfile(competitor);
                            setIsCompetitorSidebarOpen(true);
                          }
                        }}
                        className='group flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer'
                      >
                        <div
                          className={`p-1.5 rounded-lg ${
                            insight.opportunityLevel === 'critical'
                              ? 'bg-red-500/20'
                              : insight.opportunityLevel === 'high'
                                ? 'bg-orange-500/20'
                                : 'bg-yellow-500/20'
                          }`}
                        >
                          <AlertTriangle
                            size={14}
                            className={
                              insight.opportunityLevel === 'critical'
                                ? 'text-red-400'
                                : insight.opportunityLevel === 'high'
                                  ? 'text-orange-400'
                                  : 'text-yellow-400'
                            }
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-white font-medium truncate group-hover:text-blue-400 transition-colors'>
                            {insight.description}
                          </p>
                          <p className='text-xs text-gray-500 mt-0.5'>
                            {mockCompetitors.find(
                              c => c.id === insight.competitorId
                            )?.name || 'Unknown'}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                            insight.opportunityLevel === 'critical'
                              ? 'bg-red-500/20 text-red-400'
                              : insight.opportunityLevel === 'high'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {insight.opportunityLevel}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hazır Stratejiler */}
                <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
                  <div className='flex items-center justify-between mb-4'>
                    <h4 className='text-base font-semibold text-white'>
                      ⚡ Yayınlanmaya Hazır
                    </h4>
                    <span className='text-xs text-blue-400 hover:underline cursor-pointer'>
                      Tümünü Gör →
                    </span>
                  </div>
                  <div className='space-y-2'>
                    {mockStrategies
                      .filter(s => s.status === 'ready')
                      .slice(0, 4)
                      .map(strategy => (
                        <div
                          key={strategy.id}
                          onClick={() => {
                            setSelectedStrategy(strategy);
                            setIsStrategyModalOpen(true);
                          }}
                          className='group flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer'
                        >
                          <div className='p-1.5 rounded-lg bg-green-500/20'>
                            <CheckCircle size={14} className='text-green-400' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm text-white font-medium truncate group-hover:text-blue-400 transition-colors'>
                              {strategy.title}
                            </p>
                            <div className='flex items-center gap-2 mt-0.5'>
                              <p className='text-xs text-gray-500'>
                                {strategy.type}
                              </p>
                              {strategy.expectedROI && (
                                <>
                                  <span className='text-gray-600'>•</span>
                                  <p className='text-xs text-green-400'>
                                    ₺{strategy.expectedROI.toLocaleString()} ROI
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <span className='px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-medium uppercase'>
                            Hazır
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <CompetitorList
                competitors={mockCompetitors}
                onSelectCompetitor={setSelectedCompetitor}
                selectedCompetitor={selectedCompetitor}
                onViewDetails={competitor => {
                  setSelectedCompetitorProfile(competitor);
                  setIsCompetitorSidebarOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <CompetitorInsights
                insights={mockInsights}
                competitors={mockCompetitors}
              />
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <StrategyGenerator
                strategies={mockStrategies}
                competitors={mockCompetitors}
                onStrategyClick={strategy => {
                  setSelectedStrategy(strategy);
                  setIsStrategyModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <CompetitorAlerts
                alerts={mockAlerts}
                competitors={mockCompetitors}
                onAlertAction={alert => {
                  setSelectedAlert(alert);
                  setIsAlertModalOpen(true);
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <StrategyDetailModal
        strategy={selectedStrategy}
        isOpen={isStrategyModalOpen}
        onClose={() => {
          setIsStrategyModalOpen(false);
          setSelectedStrategy(null);
        }}
        competitorName={
          selectedStrategy
            ? mockCompetitors.find(c => c.id === selectedStrategy.competitorId)
                ?.name || 'Unknown'
            : ''
        }
      />

      <CompetitorDetailSidebar
        competitor={selectedCompetitorProfile}
        insights={mockInsights}
        isOpen={isCompetitorSidebarOpen}
        onClose={() => {
          setIsCompetitorSidebarOpen(false);
          setSelectedCompetitorProfile(null);
        }}
      />

      <AlertActionModal
        alert={selectedAlert}
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setSelectedAlert(null);
        }}
        competitorName={
          selectedAlert
            ? mockCompetitors.find(c => c.id === selectedAlert.competitorId)
                ?.name || 'Unknown'
            : ''
        }
      />

      <AddCompetitorModal
        isOpen={isAddCompetitorModalOpen}
        onClose={() => setIsAddCompetitorModalOpen(false)}
        onAdd={competitor => {
          console.log('New competitor added:', competitor);
          // TODO: Add competitor to list
          setIsAddCompetitorModalOpen(false);
        }}
      />
    </div>
  );
}
