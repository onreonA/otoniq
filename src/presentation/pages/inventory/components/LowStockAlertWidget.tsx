/**
 * Low Stock Alert Widget Component
 * Shows N8N automated low stock alert configuration
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Settings,
  Zap,
  Bell,
  Mail,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { N8NService } from '../../../../infrastructure/services/N8NService';
import { useAuthStore } from '../../../store/auth/authStore';

export default function LowStockAlertWidget() {
  const { userProfile } = useAuthStore();
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkflow() {
      if (!userProfile?.tenant_id) {
        setLoading(false);
        return;
      }

      try {
        const workflows = await N8NService.getTenantWorkflows(
          userProfile.tenant_id
        );
        const lowStockWorkflow = workflows.find(w =>
          w.n8nWorkflowId?.includes('rqn2AxkOapqUKpCm')
        );
        setWorkflow(lowStockWorkflow);
      } catch (error) {
        console.error('Error fetching low stock workflow:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflow();
  }, [userProfile?.tenant_id]);

  if (loading) {
    return (
      <div className='bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-5 shadow-xl'>
        <div className='flex items-center justify-center py-6'>
          <Loader2 className='animate-spin text-orange-400' size={24} />
        </div>
      </div>
    );
  }

  if (!workflow) return null;

  const config = workflow.triggerConfig || {};
  const isActive = workflow.isActive;

  return (
    <div className='bg-gradient-to-br from-orange-900/20 to-red-900/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-5 shadow-xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg'>
            <AlertTriangle size={20} className='text-white' />
          </div>
          <div>
            <h3 className='text-white font-semibold text-base flex items-center gap-2'>
              ⚠️ Düşük Stok Uyarısı
              <span className='px-2 py-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded text-xs font-medium text-orange-400 flex items-center gap-1'>
                <Zap size={10} />
                N8N
              </span>
            </h3>
            <p className='text-xs text-gray-400'>
              Otomatik stok takibi ve bildirimler
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          <CheckCircle size={12} />
          {isActive ? 'Aktif' : 'Pasif'}
        </div>
      </div>

      {/* Configuration Info */}
      <div className='space-y-3 mb-4'>
        <div className='bg-black/20 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-400'>Eşik Değeri</span>
            <span className='text-sm font-bold text-orange-400'>
              {config.stockThreshold || 10} birim
            </span>
          </div>
          <p className='text-xs text-gray-500'>
            Stok bu seviyenin altına düştüğünde uyarı gönderilir
          </p>
        </div>

        <div className='bg-black/20 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-400'>Kontrol Sıklığı</span>
            <span className='text-sm font-bold text-blue-400'>
              Her {config.checkInterval || 5} dakika
            </span>
          </div>
          <p className='text-xs text-gray-500'>
            Stok seviyeleri otomatik olarak kontrol edilir
          </p>
        </div>

        <div className='bg-black/20 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-400'>Bildirim Kanalları</span>
            <div className='flex items-center gap-2'>
              {config.alertChannels?.includes('email') && (
                <Mail size={14} className='text-blue-400' />
              )}
              {config.alertChannels?.includes('slack') && (
                <i className='ri-slack-line text-purple-400 text-sm'></i>
              )}
              {config.alertChannels?.includes('sms') && (
                <Bell size={14} className='text-green-400' />
              )}
            </div>
          </div>
          <p className='text-xs text-gray-500'>
            {config.alertChannels?.join(', ') || 'Yapılandırılmamış'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-2 p-3 bg-black/20 rounded-lg mb-4'>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Son Çalışma</p>
          <p className='text-sm font-bold text-white'>
            {new Date(lowStockWorkflow.lastRunAt).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Başarı</p>
          <p className='text-sm font-bold text-green-400'>
            %{lowStockWorkflow.successRate.toFixed(0)}
          </p>
        </div>
        <div className='text-center'>
          <p className='text-xs text-gray-400 mb-1'>Toplam</p>
          <p className='text-sm font-bold text-blue-400'>
            {lowStockWorkflow.totalRuns}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <Link
          to={`/automation/workflow-detail/${lowStockWorkflow.id}`}
          className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all'
        >
          <Settings size={14} />
          Ayarları Düzenle
        </Link>
        <Link
          to='/automation'
          className='flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-all'
        >
          <i className='ri-history-line'></i>
        </Link>
      </div>

      {/* Info Box */}
      <div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
        <p className='text-xs text-blue-400 leading-relaxed'>
          <strong>💡 İpucu:</strong> N8N workflow'u sayesinde stok seviyeleri
          otomatik olarak takip edilir ve belirlediğiniz eşiğin altına
          düştüğünde anında bildirim alırsınız.
        </p>
      </div>
    </div>
  );
}
