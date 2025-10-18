/**
 * ActivityFeed Component
 * Workflow activity feed
 */

import React from 'react';
import { WorkflowActivity } from '../../../../../infrastructure/services/WorkflowCollaborationService';

interface ActivityFeedProps {
  activity: WorkflowActivity[];
}

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return 'ri-add-circle-line';
      case 'updated':
        return 'ri-edit-line';
      case 'deleted':
        return 'ri-delete-bin-line';
      case 'executed':
        return 'ri-play-circle-line';
      case 'shared':
        return 'ri-share-line';
      case 'commented':
        return 'ri-chat-3-line';
      case 'approved':
        return 'ri-check-circle-line';
      case 'rejected':
        return 'ri-close-circle-line';
      case 'published':
        return 'ri-upload-line';
      case 'archived':
        return 'ri-archive-line';
      case 'restored':
        return 'ri-refresh-line';
      default:
        return 'ri-activity-line';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'green';
      case 'updated':
        return 'blue';
      case 'deleted':
        return 'red';
      case 'executed':
        return 'purple';
      case 'shared':
        return 'orange';
      case 'commented':
        return 'cyan';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      case 'published':
        return 'blue';
      case 'archived':
        return 'gray';
      case 'restored':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'created':
        return 'Oluşturuldu';
      case 'updated':
        return 'Güncellendi';
      case 'deleted':
        return 'Silindi';
      case 'executed':
        return 'Çalıştırıldı';
      case 'shared':
        return 'Paylaşıldı';
      case 'commented':
        return 'Yorum yapıldı';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'published':
        return 'Yayınlandı';
      case 'archived':
        return 'Arşivlendi';
      case 'restored':
        return 'Geri yüklendi';
      default:
        return 'Aktivite';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-white font-semibold text-lg'>Aktivite Akışı</h3>
        <div className='flex items-center gap-2'>
          <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'>
            <i className='ri-filter-line mr-2'></i>
            Filtrele
          </button>
          <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'>
            <i className='ri-refresh-line mr-2'></i>
            Yenile
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className='space-y-4'>
        {activity.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-activity-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-lg mb-2'>Henüz aktivite yok</p>
            <p className='text-gray-500 text-sm'>
              Workflow aktiviteleri burada görünecek
            </p>
          </div>
        ) : (
          activity.map(item => {
            const color = getActivityColor(item.activityType);
            const icon = getActivityIcon(item.activityType);
            const label = getActivityLabel(item.activityType);

            return (
              <div
                key={item.id}
                className='bg-white/5 border border-white/10 rounded-lg p-4'
              >
                <div className='flex items-start gap-3'>
                  {/* Activity Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}
                  >
                    <i className={`${icon} text-${color}-400 text-lg`}></i>
                  </div>

                  {/* Activity Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h4 className='text-white font-medium mb-1'>
                          {item.activityDescription}
                        </h4>
                        <p className='text-gray-400 text-sm'>{label}</p>
                      </div>
                      <span className='text-gray-500 text-xs'>
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* User Info */}
                    {item.user && (
                      <div className='flex items-center gap-2 mb-3'>
                        <div className='w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                          <span className='text-white text-xs font-medium'>
                            {item.user.fullName.charAt(0)}
                          </span>
                        </div>
                        <span className='text-gray-300 text-sm'>
                          {item.user.fullName}
                        </span>
                        <span className='text-gray-500 text-xs'>•</span>
                        <span className='text-gray-500 text-xs'>
                          {item.user.email}
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className='bg-white/5 rounded-lg p-3'>
                        <p className='text-gray-300 text-sm font-medium mb-2'>
                          Detaylar:
                        </p>
                        <div className='text-xs text-gray-400'>
                          <pre className='whitespace-pre-wrap'>
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Activity Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-activity-line text-blue-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Toplam Aktivite</span>
          </div>
          <p className='text-white font-bold text-2xl'>{activity.length}</p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-user-line text-green-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Aktif Kullanıcı</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {new Set(activity.map(a => a.userId)).size}
          </p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-time-line text-orange-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Son 24 Saat</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {
              activity.filter(a => {
                const now = new Date();
                const activityDate = new Date(a.createdAt);
                return (
                  now.getTime() - activityDate.getTime() < 24 * 60 * 60 * 1000
                );
              }).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
