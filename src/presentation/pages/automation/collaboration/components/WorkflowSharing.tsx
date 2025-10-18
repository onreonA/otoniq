/**
 * WorkflowSharing Component
 * Workflow sharing management
 */

import React, { useState } from 'react';

export default function WorkflowSharing() {
  const [sharedWorkflows, setSharedWorkflows] = useState([
    {
      id: '1',
      name: 'Günlük Satış Raporu',
      sharedWith: 'Ahmet Yılmaz',
      permission: 'edit',
      sharedAt: new Date(),
      expiresAt: null,
    },
    {
      id: '2',
      name: 'Düşük Stok Uyarısı',
      sharedWith: 'Geliştirme Takımı',
      permission: 'view',
      sharedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'owner':
        return 'red';
      case 'admin':
        return 'orange';
      case 'edit':
        return 'blue';
      case 'view':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'owner':
        return 'Sahip';
      case 'admin':
        return 'Yönetici';
      case 'edit':
        return 'Düzenleme';
      case 'view':
        return 'Görüntüleme';
      default:
        return 'Bilinmeyen';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-white font-semibold text-lg'>Workflow Paylaşımı</h3>
        <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'>
          <i className='ri-share-line mr-2'></i>
          Yeni Paylaşım
        </button>
      </div>

      {/* Shared Workflows */}
      <div className='space-y-3'>
        {sharedWorkflows.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-share-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-lg mb-2'>Henüz paylaşım yok</p>
            <p className='text-gray-500 text-sm'>İlk workflow'unuzu paylaşın</p>
          </div>
        ) : (
          sharedWorkflows.map(workflow => (
            <div
              key={workflow.id}
              className='bg-white/5 border border-white/10 rounded-lg p-4'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center'>
                    <i className='ri-node-tree text-blue-400 text-lg'></i>
                  </div>
                  <div>
                    <h4 className='text-white font-medium'>{workflow.name}</h4>
                    <p className='text-gray-400 text-sm'>
                      {workflow.sharedWith}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium bg-${getPermissionColor(workflow.permission)}-500/20 text-${getPermissionColor(workflow.permission)}-400`}
                  >
                    {getPermissionLabel(workflow.permission)}
                  </span>
                  <div className='text-right'>
                    <p className='text-gray-400 text-xs'>
                      {workflow.sharedAt.toLocaleDateString('tr-TR')}
                    </p>
                    {workflow.expiresAt && (
                      <p className='text-orange-400 text-xs'>
                        {workflow.expiresAt.toLocaleDateString('tr-TR')} sona
                        erer
                      </p>
                    )}
                  </div>
                  <button className='text-gray-400 hover:text-white transition-colors'>
                    <i className='ri-more-line text-lg'></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sharing Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-share-line text-blue-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Toplam Paylaşım</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {sharedWorkflows.length}
          </p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-user-line text-green-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Paylaşılan Kişi</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {new Set(sharedWorkflows.map(w => w.sharedWith)).size}
          </p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-time-line text-orange-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Süresi Dolacak</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {
              sharedWorkflows.filter(
                w => w.expiresAt && w.expiresAt > new Date()
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
