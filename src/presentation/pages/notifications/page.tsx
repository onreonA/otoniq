/**
 * Notifications Page
 *
 * Full notifications management page with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Filter,
  Search,
  Check,
  Archive,
  Trash2,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { notificationService } from '../../../infrastructure/services/NotificationService';

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

interface NotificationFilters {
  status: 'all' | 'unread' | 'read' | 'archived';
  type: string;
  priority: string;
  dateRange: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    type: '',
    priority: '',
    dateRange: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Mock user data - in real app, get from auth context
  const userId = 'user-123';
  const tenantId = 'tenant-123';

  useEffect(() => {
    loadNotifications();
  }, [page, filters, searchTerm]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { notifications: data, total: totalCount } =
        await notificationService.getUserNotifications(userId, tenantId, {
          status: filters.status === 'all' ? undefined : filters.status,
          limit: 20,
          offset: (page - 1) * 20,
        });
      setNotifications(data as Notification[]);
      setTotal(totalCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      await notificationService.markAsRead(userId, tenantId, notificationIds);
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id) ? { ...n, status: 'read' as const } : n
        )
      );
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAsArchived = async (notificationIds: string[]) => {
    try {
      // TODO: Implement archive functionality
      console.log('Archive notifications:', notificationIds);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to archive notifications:', error);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      // TODO: Implement delete functionality
      console.log('Delete notifications:', notificationIds);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className='w-4 h-4 text-blue-500' />;
      case 'read':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'archived':
        return <Archive className='w-4 h-4 text-gray-500' />;
      default:
        return <Info className='w-4 h-4 text-gray-500' />;
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

  const filteredNotifications = notifications.filter(notification => {
    if (
      searchTerm &&
      !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className='relative z-10'>
      <div className='max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Welcome Section */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  🔔 Bildirimler
                </h1>
                <p className='text-gray-300'>
                  Tüm bildirimlerinizi buradan yönetebilirsiniz
                </p>
              </div>
              <div className='hidden md:flex items-center space-x-2'>
                <button
                  onClick={() => markAsRead(selectedNotifications)}
                  disabled={selectedNotifications.length === 0}
                  className='flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-white/10'
                >
                  <Check className='w-4 h-4' />
                  <span className='text-sm'>Okundu İşaretle</span>
                </button>

                <button
                  onClick={() => markAsArchived(selectedNotifications)}
                  disabled={selectedNotifications.length === 0}
                  className='flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 border border-white/10'
                >
                  <Archive className='w-4 h-4' />
                  <span className='text-sm'>Arşivle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className='mb-6'>
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <input
                  type='text'
                  placeholder='Bildirimlerde ara...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-3 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all text-white placeholder-gray-400 text-sm'
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={e =>
                  setFilters(prev => ({
                    ...prev,
                    status: e.target.value as any,
                  }))
                }
                className='px-3 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-white text-sm'
              >
                <option value='all' className='bg-gray-900'>
                  Tüm Durumlar
                </option>
                <option value='unread' className='bg-gray-900'>
                  Okunmamış
                </option>
                <option value='read' className='bg-gray-900'>
                  Okunmuş
                </option>
                <option value='archived' className='bg-gray-900'>
                  Arşivlenmiş
                </option>
              </select>

              {/* Type Filter */}
              <select
                value={filters.type}
                onChange={e =>
                  setFilters(prev => ({ ...prev, type: e.target.value }))
                }
                className='px-3 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-white text-sm'
              >
                <option value='' className='bg-gray-900'>
                  Tüm Türler
                </option>
                <option value='order_created' className='bg-gray-900'>
                  Yeni Sipariş
                </option>
                <option value='low_stock' className='bg-gray-900'>
                  Düşük Stok
                </option>
                <option value='sync_completed' className='bg-gray-900'>
                  Senkronizasyon
                </option>
                <option value='workflow_completed' className='bg-gray-900'>
                  Otomasyon
                </option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={e =>
                  setFilters(prev => ({ ...prev, priority: e.target.value }))
                }
                className='px-3 py-2 bg-white/10 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-white text-sm'
              >
                <option value='' className='bg-gray-900'>
                  Tüm Öncelikler
                </option>
                <option value='urgent' className='bg-gray-900'>
                  Acil
                </option>
                <option value='high' className='bg-gray-900'>
                  Yüksek
                </option>
                <option value='medium' className='bg-gray-900'>
                  Orta
                </option>
                <option value='low' className='bg-gray-900'>
                  Düşük
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
          {loading ? (
            <div className='p-12 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto'></div>
              <p className='mt-6 text-gray-300 font-medium'>
                Bildirimler yükleniyor...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className='p-12 text-center'>
              <div className='w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <Bell className='w-8 h-8 text-gray-400' />
              </div>
              <h3 className='text-lg font-bold text-white mb-2'>
                Bildirim Bulunamadı
              </h3>
              <p className='text-gray-400 text-sm'>
                Arama kriterlerinize uygun bildirim bulunmuyor.
              </p>
            </div>
          ) : (
            <div className='divide-y divide-white/5'>
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    notification.status === 'unread' ? 'bg-white/5' : ''
                  }`}
                >
                  <div className='flex items-start space-x-3'>
                    {/* Checkbox */}
                    <input
                      type='checkbox'
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [
                            ...prev,
                            notification.id,
                          ]);
                        } else {
                          setSelectedNotifications(prev =>
                            prev.filter(id => id !== notification.id)
                          );
                        }
                      }}
                      className='mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 bg-white/10 rounded transition-all'
                    />

                    {/* Icon */}
                    <div
                      className='flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white'
                      style={{
                        backgroundColor: notification.notification_types.color,
                      }}
                    >
                      <Bell className='w-5 h-5' />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center space-x-2'>
                          <h3 className='text-sm font-semibold text-white'>
                            {notification.title}
                          </h3>
                          {getStatusIcon(notification.status)}
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <span className='text-xs text-gray-400 flex items-center'>
                            <Clock className='w-3 h-3 mr-1' />
                            {formatTime(notification.created_at)}
                          </span>

                          <button className='p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all'>
                            <MoreVertical className='w-4 h-4' />
                          </button>
                        </div>
                      </div>

                      <p className='text-sm text-gray-300 leading-relaxed mb-2'>
                        {notification.message}
                      </p>

                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-400'>
                          {notification.notification_types.display_name}
                        </span>

                        {notification.status === 'unread' && (
                          <button
                            onClick={() => markAsRead([notification.id])}
                            className='text-xs font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all border border-white/10'
                          >
                            Okundu İşaretle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className='px-4 py-3 border-t border-white/10 bg-white/5 flex items-center justify-between'>
              <div className='text-xs text-gray-400'>
                Toplam {total} bildirimden {(page - 1) * 20 + 1}-
                {Math.min(page * 20, total)} arası gösteriliyor
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className='px-3 py-1 text-xs font-medium border border-white/10 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  Önceki
                </button>

                <span className='px-3 py-1 text-xs font-medium text-white bg-white/10 rounded-lg border border-white/10'>
                  Sayfa {page} / {Math.ceil(total / 20)}
                </span>

                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className='px-3 py-1 text-xs font-medium border border-white/10 text-white rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
