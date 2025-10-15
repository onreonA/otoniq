/**
 * Workflow Detail Page
 * 8-tab detailed workflow information and management
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Tab components (will be created)
import OverviewTab from './tabs/OverviewTab';
import WorkflowTab from './tabs/WorkflowTab';
import InputOutputTab from './tabs/InputOutputTab';
import ConfigurationTab from './tabs/ConfigurationTab';
import RunsHistoryTab from './tabs/RunsHistoryTab';
import RunDetailsTab from './tabs/RunDetailsTab';
import OutputsTab from './tabs/OutputsTab';
import AnalyticsTab from './tabs/AnalyticsTab';

type TabType =
  | 'overview'
  | 'workflow'
  | 'input-output'
  | 'configuration'
  | 'runs'
  | 'details'
  | 'outputs'
  | 'analytics';

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  isActive: boolean;
  totalExecutions: number;
  successRate: number;
  lastRunAt?: string;
  createdAt: string;
}

export default function WorkflowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    setLoading(true);
    // Mock data for now
    setTimeout(() => {
      setWorkflow({
        id: workflowId,
        name: 'Günlük Satış Raporu',
        description:
          "Her gün saat 09:00'da otomatik olarak günlük satış raporu oluşturur ve e-posta ile gönderir",
        category: 'analytics',
        triggerType: 'cron',
        isActive: true,
        totalExecutions: 127,
        successRate: 98.4,
        lastRunAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      });
      setLoading(false);
    }, 500);
  };

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Genel Bakış',
      icon: 'ri-dashboard-line',
    },
    {
      id: 'workflow' as TabType,
      label: 'Workflow',
      icon: 'ri-flow-chart',
    },
    {
      id: 'input-output' as TabType,
      label: 'Giriş/Çıkış',
      icon: 'ri-arrow-left-right-line',
    },
    {
      id: 'configuration' as TabType,
      label: 'Ayarlar',
      icon: 'ri-settings-3-line',
    },
    {
      id: 'runs' as TabType,
      label: 'Çalışmalar',
      icon: 'ri-history-line',
    },
    {
      id: 'details' as TabType,
      label: 'Detaylar',
      icon: 'ri-file-list-3-line',
    },
    {
      id: 'outputs' as TabType,
      label: 'Çıktılar',
      icon: 'ri-folder-download-line',
    },
    {
      id: 'analytics' as TabType,
      label: 'Analiz',
      icon: 'ri-line-chart-line',
    },
  ];

  const handleToggleActive = async () => {
    if (!workflow) return;
    const newStatus = !workflow.isActive;
    setWorkflow({ ...workflow, isActive: newStatus });
    toast.success(
      newStatus ? 'Workflow aktifleştirildi' : 'Workflow durduruldu'
    );
  };

  const handleRunNow = async () => {
    toast.loading('Workflow çalıştırılıyor...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Workflow başarıyla çalıştırıldı');
    }, 2000);
  };

  if (loading) {
    return (
      <div className='relative z-10'>
        <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
          <div className='flex items-center justify-center py-12'>
            <div className='text-gray-400'>Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className='relative z-10'>
        <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
          <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center'>
            <i className='ri-error-warning-line text-6xl text-red-500 mb-4'></i>
            <p className='text-gray-300 text-lg mb-4'>Workflow bulunamadı</p>
            <button
              onClick={() => navigate('/automation')}
              className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Page Header */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <button
                    onClick={() => navigate('/automation')}
                    className='text-gray-400 hover:text-white transition-colors'
                  >
                    <i className='ri-arrow-left-line text-xl'></i>
                  </button>
                  <h1 className='text-2xl font-bold text-white'>
                    {workflow.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      workflow.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {workflow.isActive ? '🟢 Aktif' : '⚫ Pasif'}
                  </span>
                </div>
                <p className='text-gray-300 text-sm mb-4'>
                  {workflow.description}
                </p>
                <div className='flex items-center gap-4 text-sm text-gray-400'>
                  <span className='flex items-center gap-1'>
                    <i className='ri-checkbox-circle-line'></i>
                    {workflow.totalExecutions} çalışma
                  </span>
                  <span className='flex items-center gap-1'>
                    <i className='ri-percent-line'></i>
                    {workflow.successRate}% başarı oranı
                  </span>
                  <span className='flex items-center gap-1'>
                    <i className='ri-time-line'></i>
                    Son çalışma:{' '}
                    {workflow.lastRunAt
                      ? new Date(workflow.lastRunAt).toLocaleString('tr-TR')
                      : 'Henüz çalışmadı'}
                  </span>
                </div>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={handleToggleActive}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    workflow.isActive
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                      : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                  }`}
                >
                  <i
                    className={
                      workflow.isActive
                        ? 'ri-stop-circle-line'
                        : 'ri-play-circle-line'
                    }
                  ></i>
                  {workflow.isActive ? 'Durdur' : 'Aktifleştir'}
                </button>
                <button
                  onClick={handleRunNow}
                  className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
                >
                  <i className='ri-play-line'></i>
                  Şimdi Çalıştır
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='mb-6'>
          <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-2'>
            <div className='flex flex-wrap gap-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span className='hidden sm:inline'>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className='bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          {activeTab === 'overview' && <OverviewTab workflow={workflow} />}
          {activeTab === 'workflow' && <WorkflowTab workflow={workflow} />}
          {activeTab === 'input-output' && (
            <InputOutputTab workflow={workflow} />
          )}
          {activeTab === 'configuration' && (
            <ConfigurationTab workflow={workflow} />
          )}
          {activeTab === 'runs' && <RunsHistoryTab workflow={workflow} />}
          {activeTab === 'details' && <RunDetailsTab workflow={workflow} />}
          {activeTab === 'outputs' && <OutputsTab workflow={workflow} />}
          {activeTab === 'analytics' && <AnalyticsTab workflow={workflow} />}
        </div>
      </div>
    </div>
  );
}
