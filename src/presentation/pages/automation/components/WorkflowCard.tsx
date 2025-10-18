/**
 * Workflow Card Component
 * Displays individual workflow with status and actions
 */

import { WorkflowData } from '../../../mocks/automation';
import toast from 'react-hot-toast';
import { Play, Pause, TestTube, Settings, Clock, Zap } from 'lucide-react';

interface Props {
  workflow: WorkflowData;
  onViewDetails: (workflow: WorkflowData) => void;
}

export default function WorkflowCard({ workflow, onViewDetails }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return {
          bg: 'from-green-600/20 to-emerald-600/20',
          badge: 'bg-green-500/20 text-green-400',
          icon: 'text-green-400',
        };
      case 'paused':
        return {
          bg: 'from-gray-600/20 to-slate-600/20',
          badge: 'bg-gray-500/20 text-gray-400',
          icon: 'text-gray-400',
        };
      case 'error':
        return {
          bg: 'from-red-600/20 to-orange-600/20',
          badge: 'bg-red-500/20 text-red-400',
          icon: 'text-red-400',
        };
      default:
        return {
          bg: 'from-gray-600/20 to-gray-600/20',
          badge: 'bg-gray-500/20 text-gray-400',
          icon: 'text-gray-400',
        };
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success':
        return 'ri-checkbox-circle-fill text-green-400';
      case 'fail':
        return 'ri-close-circle-fill text-red-400';
      case 'partial':
        return 'ri-error-warning-fill text-yellow-400';
      default:
        return 'ri-question-fill text-gray-400';
    }
  };

  const handleRun = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${workflow.name} çalıştırılıyor...`);
    setTimeout(() => {
      toast.success('Workflow başarıyla tamamlandı!');
    }, 2000);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${workflow.name} duraklatıldı`);
  };

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.loading('Test çalışması başlatılıyor...');
    setTimeout(() => {
      toast.success('Test başarıyla tamamlandı! ✅');
    }, 1500);
  };

  const colors = getStatusColor(workflow.status);

  return (
    <div
      onClick={() => onViewDetails(workflow)}
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group`}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-start gap-3 flex-1'>
          {/* Icon */}
          <div
            className={`w-12 h-12 bg-gradient-to-r ${workflow.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
          >
            <i className={`${workflow.icon} text-white text-2xl`}></i>
          </div>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <h3 className='text-white font-semibold text-lg'>
                {workflow.name}
              </h3>
              {workflow.isN8NManaged && (
                <span className='px-2 py-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded text-xs font-medium text-orange-400 flex items-center gap-1'>
                  <Zap size={12} />
                  N8N
                </span>
              )}
            </div>
            <p className='text-gray-300 text-sm line-clamp-2'>
              {workflow.description}
            </p>
            {workflow.schedule && (
              <div className='flex items-center gap-1 mt-2 text-xs text-gray-400'>
                <Clock size={12} />
                <span>
                  {workflow.schedule === '0 9 * * *'
                    ? 'Her gün 09:00'
                    : workflow.schedule === '*/5 * * * *'
                      ? 'Her 5 dakikada'
                      : workflow.schedule}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge} whitespace-nowrap ml-2`}
        >
          {workflow.status === 'active'
            ? 'Aktif'
            : workflow.status === 'paused'
              ? 'Duraklatıldı'
              : 'Hata'}
        </span>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-4 gap-4 mb-4 p-4 bg-black/20 rounded-xl'>
        <div>
          <p className='text-xs text-gray-400 mb-1'>Toplam Koşum</p>
          <p className='text-lg font-bold text-white'>
            {workflow.totalRuns.toLocaleString()}
          </p>
        </div>
        <div>
          <p className='text-xs text-gray-400 mb-1'>Başarı Oranı</p>
          <p className='text-lg font-bold text-white'>
            %{workflow.successRate.toFixed(1)}
          </p>
        </div>
        <div className='col-span-2'>
          <p className='text-xs text-gray-400 mb-1'>Son Koşum</p>
          <div className='flex items-center gap-2'>
            <i className={`${getResultIcon(workflow.lastResult)} text-lg`}></i>
            <p className='text-sm text-gray-300'>
              {new Date(workflow.lastRunAt).toLocaleString('tr-TR')}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2'>
        <button
          onClick={handleRun}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
        >
          <Play size={16} fill='white' />
          Çalıştır
        </button>
        <button
          onClick={handlePause}
          className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-300'
          title='Duraklat'
        >
          <Pause size={16} />
        </button>
        <button
          onClick={handleTest}
          className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-300'
          title='Test Et'
        >
          <TestTube size={16} />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            onViewDetails(workflow);
          }}
          className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-all duration-300'
          title='Ayarlar'
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
