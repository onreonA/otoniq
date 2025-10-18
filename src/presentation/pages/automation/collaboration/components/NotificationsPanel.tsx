/**
 * NotificationsPanel Component
 * User notifications management
 */

import React from 'react';
import { WorkflowNotification } from '../../../../../infrastructure/services/WorkflowCollaborationService';

interface NotificationsPanelProps {
  notifications: WorkflowNotification[];
  onMarkAsRead: (notificationId: string) => void;
}

export default function NotificationsPanel({
  notifications,
  onMarkAsRead,
}: NotificationsPanelProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workflow_shared':
        return 'ri-share-line';
      case 'workflow_updated':
        return 'ri-edit-line';
      case 'workflow_executed':
        return 'ri-play-circle-line';
      case 'workflow_failed':
        return 'ri-error-warning-line';
      case 'comment_added':
        return 'ri-chat-3-line';
      case 'review_requested':
        return 'ri-eye-line';
      case 'approval_requested':
        return 'ri-time-line';
      case 'approval_granted':
        return 'ri-check-circle-line';
      case 'team_invitation':
        return 'ri-user-add-line';
      case 'permission_changed':
        return 'ri-shield-line';
      default:
        return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'workflow_shared':
        return 'blue';
      case 'workflow_updated':
        return 'green';
      case 'workflow_executed':
        return 'purple';
      case 'workflow_failed':
        return 'red';
      case 'comment_added':
        return 'cyan';
      case 'review_requested':
        return 'orange';
      case 'approval_requested':
        return 'yellow';
      case 'approval_granted':
        return 'green';
      case 'team_invitation':
        return 'blue';
      case 'permission_changed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'workflow_shared':
        return 'Workflow Paylaşıldı';
      case 'workflow_updated':
        return 'Workflow Güncellendi';
      case 'workflow_executed':
        return 'Workflow Çalıştırıldı';
      case 'workflow_failed':
        return 'Workflow Başarısız';
      case 'comment_added':
        return 'Yorum Eklendi';
      case 'review_requested':
        return 'İnceleme İstendi';
      case 'approval_requested':
        return 'Onay İstendi';
      case 'approval_granted':
        return 'Onay Verildi';
      case 'team_invitation':
        return 'Takım Daveti';
      case 'permission_changed':
        return 'Yetki Değişti';
      default:
        return 'Bildirim';
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <h3 className='text-white font-semibold text-lg'>Bildirimler</h3>
          {unreadCount > 0 && (
            <span className='bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full'>
              {unreadCount}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'>
            <i className='ri-check-line mr-2'></i>
            Tümünü Okundu İşaretle
          </button>
          <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'>
            <i className='ri-settings-line mr-2'></i>
            Ayarlar
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className='space-y-3'>
        {notifications.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-notification-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-lg mb-2'>Henüz bildirim yok</p>
            <p className='text-gray-500 text-sm'>
              Yeni bildirimler burada görünecek
            </p>
          </div>
        ) : (
          notifications.map(notification => {
            const color = getNotificationColor(notification.notificationType);
            const icon = getNotificationIcon(notification.notificationType);
            const label = getNotificationLabel(notification.notificationType);

            return (
              <div
                key={notification.id}
                className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  notification.isRead
                    ? 'opacity-60'
                    : 'border-blue-500/50 bg-blue-500/10'
                }`}
                onClick={() =>
                  !notification.isRead && onMarkAsRead(notification.id)
                }
              >
                <div className='flex items-start gap-3'>
                  {/* Notification Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}
                  >
                    <i className={`${icon} text-${color}-400 text-lg`}></i>
                  </div>

                  {/* Notification Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <h4 className='text-white font-medium mb-1'>
                          {notification.title}
                        </h4>
                        <p className='text-gray-400 text-sm'>
                          {notification.message}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-xs text-gray-500'>{label}</span>
                          <span className='text-xs text-gray-500'>•</span>
                          <span className='text-xs text-gray-500'>
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {!notification.isRead && (
                          <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                        )}
                        <button className='text-gray-400 hover:text-white transition-colors'>
                          <i className='ri-more-line text-lg'></i>
                        </button>
                      </div>
                    </div>

                    {/* Action URL */}
                    {notification.actionUrl && (
                      <div className='mt-3'>
                        <a
                          href={notification.actionUrl}
                          className='text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors'
                        >
                          <i className='ri-external-link-line mr-1'></i>
                          Detayları Görüntüle
                        </a>
                      </div>
                    )}

                    {/* Metadata */}
                    {notification.metadata &&
                      Object.keys(notification.metadata).length > 0 && (
                        <div className='mt-3 bg-white/5 rounded-lg p-3'>
                          <p className='text-gray-300 text-sm font-medium mb-2'>
                            Ek Bilgiler:
                          </p>
                          <div className='text-xs text-gray-400'>
                            <pre className='whitespace-pre-wrap'>
                              {JSON.stringify(notification.metadata, null, 2)}
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

      {/* Notification Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-notification-line text-blue-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Toplam Bildirim</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {notifications.length}
          </p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-eye-line text-green-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Okunmuş</span>
          </div>
          <p className='text-white font-bold text-2xl'>
            {notifications.filter(n => n.isRead).length}
          </p>
        </div>
        <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
          <div className='flex items-center gap-3 mb-2'>
            <i className='ri-eye-off-line text-orange-400 text-lg'></i>
            <span className='text-gray-400 text-sm'>Okunmamış</span>
          </div>
          <p className='text-white font-bold text-2xl'>{unreadCount}</p>
        </div>
      </div>
    </div>
  );
}
