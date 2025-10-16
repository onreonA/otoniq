/**
 * Notification Bell Component
 *
 * Shows notification count and dropdown with recent notifications
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, Archive, Trash2 } from 'lucide-react';
import {
  notificationService,
  NotificationData,
} from '../../../infrastructure/services/NotificationService';

interface NotificationBellProps {
  userId: string;
  tenantId: string;
  className?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  notification_types: {
    type_name: string;
    display_name: string;
    icon: string;
    color: string;
  };
}

export function NotificationBell({
  userId,
  tenantId,
  className = '',
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [userId, tenantId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { notifications: data } =
        await notificationService.getUserNotifications(userId, tenantId, {
          status: 'unread',
          limit: 10,
        });
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount(userId, tenantId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(userId, tenantId, [notificationId]);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'read' as const } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAsRead(userId, tenantId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-blue-500';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-blue-50 border-blue-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
      >
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-10'
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className='absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20'>
            {/* Header */}
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Bildirimler
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                  >
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className='max-h-96 overflow-y-auto'>
              {loading ? (
                <div className='p-4 text-center text-gray-500'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto'></div>
                  <p className='mt-2'>Yükleniyor...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className='p-4 text-center text-gray-500'>
                  <Bell className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                  <p>Yeni bildirim yok</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className='flex items-start space-x-3'>
                      {/* Icon */}
                      <div
                        className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white'
                        style={{
                          backgroundColor:
                            notification.notification_types.color,
                        }}
                      >
                        <Bell className='w-4 h-4' />
                      </div>

                      {/* Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium text-gray-900 truncate'>
                            {notification.title}
                          </h4>
                          <div className='flex items-center space-x-1'>
                            <span
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </span>
                            {notification.status === 'unread' && (
                              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            )}
                          </div>
                        </div>

                        <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                          {notification.message}
                        </p>

                        <div className='flex items-center justify-between mt-2'>
                          <span className='text-xs text-gray-500'>
                            {formatTime(notification.created_at)}
                          </span>

                          {notification.status === 'unread' && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className='text-xs text-blue-600 hover:text-blue-800 font-medium'
                            >
                              Okundu İşaretle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className='p-4 border-t border-gray-200'>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to notifications page
                    window.location.href = '/notifications';
                  }}
                  className='w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium'
                >
                  Tüm Bildirimleri Görüntüle
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
