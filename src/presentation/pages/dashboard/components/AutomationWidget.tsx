/**
 * Automation Widget Component
 * Shows active N8N workflows and quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Loader2,
} from 'lucide-react';
import { N8NService } from '../../../../infrastructure/services/N8NService';
import { useAuthStore } from '../../../store/auth/authStore';
import toast from 'react-hot-toast';

interface Workflow {
  id: string;
  tenantId: string;
  workflowName: string;
  n8nWorkflowId: string;
  triggerType: string;
  webhookUrl?: string;
  isActive: boolean;
  lastExecutionAt?: string;
  lastExecutionStatus?: 'success' | 'failed' | 'running' | 'waiting';
  metadata?: {
    category?: string;
    icon?: string;
    color?: string;
  };
}

export default function AutomationWidget() {
  const { userProfile } = useAuthStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningWorkflows, setRunningWorkflows] = useState<Set<string>>(
    new Set()
  );

  // Fetch workflows from database
  useEffect(() => {
    async function fetchWorkflows() {
      if (!userProfile?.tenant_id) {
        console.log('❌ No tenant_id found in userProfile:', userProfile);
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching workflows for tenant:', userProfile.tenant_id);

      try {
        const data = await N8NService.getTenantWorkflows(userProfile.tenant_id);
        console.log('✅ Workflows fetched:', data);
        setWorkflows(data);
      } catch (error) {
        console.error('❌ Error fetching workflows:', error);
        toast.error("Workflow'lar yüklenemedi");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, [userProfile?.tenant_id]);

  // Handle workflow run
  const handleRunWorkflow = async (e: React.MouseEvent, workflow: Workflow) => {
    e.preventDefault();
    e.stopPropagation();

    // For schedule-based workflows without webhook URL
    if (!workflow.webhookUrl) {
      toast.success(
        `${workflow.workflowName} zamanlanmış olarak çalışıyor. Sonraki çalışma: ${workflow.triggerConfig?.schedule || 'Belirsiz'}`
      );
      return;
    }

    setRunningWorkflows(prev => new Set(prev).add(workflow.id));

    try {
      const result = await N8NService.triggerWebhook(workflow.webhookUrl, {
        tenantId: workflow.tenantId,
        trigger: 'manual',
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        toast.success(`${workflow.workflowName} başlatıldı!`);
      } else {
        toast.error(result.error || 'Workflow başlatılamadı');
      }
    } catch (error: any) {
      console.error('Error running workflow:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setRunningWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflow.id);
        return newSet;
      });
    }
  };

  // Helper functions
  const getScheduleText = (workflowName: string) => {
    if (workflowName.includes('Günlük')) return 'Her gün 09:00';
    if (workflowName.includes('Stok')) return 'Her 6 saatte';
    return 'Zamanlanmış';
  };

  const n8nWorkflows = workflows;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'paused':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className='text-green-400' />;
      case 'paused':
        return <Clock size={14} className='text-gray-400' />;
      case 'error':
        return <AlertCircle size={14} className='text-red-400' />;
      default:
        return <Clock size={14} className='text-gray-400' />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className='bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl'>
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='animate-spin text-purple-400' size={24} />
        </div>
      </div>
    );
  }

  // No workflows state
  if (!workflows.length) {
    return (
      <div className='bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl'>
        <div className='text-center py-6'>
          <Zap size={32} className='text-gray-500 mx-auto mb-2' />
          <p className='text-gray-400 text-sm'>Henüz workflow yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg'>
            <Zap size={18} className='text-white' />
          </div>
          <div>
            <h3 className='text-white font-semibold text-base'>
              ⚡ N8N Otomasyonları
            </h3>
            <p className='text-xs text-gray-400'>
              {workflows.filter(w => w.isActive).length} aktif workflow
            </p>
          </div>
        </div>
        <Link
          to='/automation'
          className='text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1'
        >
          Tümünü Gör
          <i className='ri-arrow-right-line'></i>
        </Link>
      </div>

      {/* Workflow List */}
      <div className='space-y-2 mb-4'>
        {workflows.slice(0, 3).map(workflow => {
          const isRunning = runningWorkflows.has(workflow.id);
          const isActive = workflow.isActive;

          return (
            <Link
              key={workflow.id}
              to={`/automation/workflow-detail/${workflow.id}`}
              className='flex items-center justify-between bg-black/20 hover:bg-black/30 rounded-lg p-3 transition-all group'
            >
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                {getStatusIcon(isActive ? 'active' : 'paused')}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-white font-medium truncate'>
                    {workflow.workflowName}
                  </p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-400'>
                      {getScheduleText(workflow.workflowName)}
                    </span>
                    {workflow.lastExecutionAt && (
                      <>
                        <span className='text-xs text-gray-600'>•</span>
                        <span className='text-xs text-green-400'>
                          {workflow.lastExecutionStatus === 'success'
                            ? 'Başarılı'
                            : 'Çalıştı'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={e => handleRunWorkflow(e, workflow)}
                disabled={isRunning}
                className='p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50'
                title='Şimdi Çalıştır'
              >
                {isRunning ? (
                  <Loader2 size={14} className='text-white animate-spin' />
                ) : (
                  <Play size={14} className='text-white' fill='white' />
                )}
              </button>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-3 gap-2 p-3 bg-black/20 rounded-lg'>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Aktif</p>
          <p className='text-lg font-bold text-white'>
            {workflows.filter(w => w.isActive).length}
          </p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Toplam</p>
          <p className='text-lg font-bold text-green-400'>{workflows.length}</p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Durum</p>
          <p className='text-lg font-bold text-blue-400'>
            <CheckCircle className='inline' size={18} />
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='flex gap-2 mt-4'>
        <Link
          to='/automation'
          className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all'
        >
          <Settings size={14} />
          Ayarlar
        </Link>
        <Link
          to='/automation/outputs'
          className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-all'
        >
          <i className='ri-history-line'></i>
          Geçmiş
        </Link>
      </div>
    </div>
  );
}
