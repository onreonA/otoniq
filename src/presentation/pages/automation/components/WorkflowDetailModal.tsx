/**
 * Workflow Detail Modal
 * Shows detailed information, runs history, and logs
 */

import { useState } from 'react';
import {
  WorkflowData,
  generateWorkflowRuns,
  generateWorkflowLogs,
} from '../../../mocks/automation';

interface Props {
  workflow: WorkflowData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowDetailModal({
  workflow,
  isOpen,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'runs' | 'logs'>(
    'overview'
  );

  if (!isOpen || !workflow) return null;

  const runs = generateWorkflowRuns(workflow.id, 10);
  const logs = generateWorkflowLogs(workflow.id, 20);

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: 'ri-dashboard-line' },
    { id: 'runs', label: 'Koşum Geçmişi', icon: 'ri-history-line' },
    { id: 'logs', label: 'Loglar', icon: 'ri-file-list-line' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className='relative bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div
          className={`bg-gradient-to-r ${workflow.color} p-6 border-b border-white/10`}
        >
          <div className='flex items-start justify-between'>
            <div className='flex items-start gap-4'>
              <div className='w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                <i className={`${workflow.icon} text-white text-3xl`}></i>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-white mb-2'>
                  {workflow.name}
                </h2>
                <p className='text-white/80'>{workflow.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-white/80 hover:text-white transition-colors'
            >
              <i className='ri-close-line text-2xl'></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-black/20 border-b border-white/10 px-6'>
          <div className='flex space-x-4'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 font-medium transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? 'text-white border-blue-500'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-240px)]'>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Stats Grid */}
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                  <p className='text-gray-400 text-sm mb-1'>Toplam Koşum</p>
                  <p className='text-2xl font-bold text-white'>
                    {workflow.totalRuns}
                  </p>
                </div>
                <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                  <p className='text-gray-400 text-sm mb-1'>Başarı Oranı</p>
                  <p className='text-2xl font-bold text-white'>
                    %{workflow.successRate}
                  </p>
                </div>
                <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                  <p className='text-gray-400 text-sm mb-1'>Durum</p>
                  <p className='text-2xl font-bold text-white capitalize'>
                    {workflow.status}
                  </p>
                </div>
              </div>

              {/* Configuration */}
              <div className='bg-white/5 rounded-xl p-4 border border-white/10'>
                <h4 className='text-white font-semibold mb-3'>Yapılandırma</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Kategori:</span>
                    <span className='text-white capitalize'>
                      {workflow.category.replace('-', ' ')}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Son Koşum:</span>
                    <span className='text-white'>
                      {new Date(workflow.lastRunAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Runs History Tab */}
          {activeTab === 'runs' && (
            <div className='space-y-3'>
              {runs.map(run => (
                <div
                  key={run.id}
                  className='bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <i
                        className={`${
                          run.status === 'success'
                            ? 'ri-checkbox-circle-fill text-green-400'
                            : 'ri-close-circle-fill text-red-400'
                        } text-2xl`}
                      ></i>
                      <div>
                        <p className='text-white font-medium'>
                          {new Date(run.startedAt).toLocaleString('tr-TR')}
                        </p>
                        <p className='text-sm text-gray-400'>
                          {run.itemsProcessed} öğe işlendi • {run.duration}s
                        </p>
                        {run.errorMessage && (
                          <p className='text-sm text-red-400 mt-1'>
                            {run.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        run.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {run.status === 'success' ? 'Başarılı' : 'Başarısız'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className='space-y-2 font-mono text-sm'>
              {logs.map(log => (
                <div
                  key={log.id}
                  className='bg-black/40 rounded-lg p-3 border border-white/5'
                >
                  <div className='flex items-start gap-3'>
                    <span className='text-gray-500 text-xs whitespace-nowrap'>
                      {log.timestamp}
                    </span>
                    <span
                      className={`${getLevelColor(log.level)} font-semibold uppercase text-xs`}
                    >
                      [{log.level}]
                    </span>
                    <span className='text-gray-300 flex-1'>{log.message}</span>
                  </div>
                  {log.details && (
                    <p className='text-xs text-gray-500 mt-2 ml-32'>
                      {log.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
