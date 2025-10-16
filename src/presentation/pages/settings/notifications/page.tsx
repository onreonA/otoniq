/**
 * Notification Settings Page
 *
 * User notification preferences management
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  notificationService,
  NotificationPreferences,
} from '../../../../infrastructure/services/NotificationService';

interface NotificationType {
  id: string;
  typeName: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<
    NotificationType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Mock user data - in real app, get from auth context
  const userId = 'user-123';
  const tenantId = 'tenant-123';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load notification types
      const typesResponse = await fetch('/api/notification-types');
      const types = await typesResponse.json();
      setNotificationTypes(types);

      // Load user preferences
      const userPreferences = await notificationService.getUserPreferences(
        userId,
        tenantId
      );
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (
    typeId: string,
    field: keyof NotificationPreferences,
    value: any
  ) => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.notificationTypeId === typeId ? { ...pref, [field]: value } : pref
      )
    );
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const success = await notificationService.updatePreferences(
        userId,
        tenantId,
        preferences
      );

      if (success) {
        setMessage({
          type: 'success',
          text: 'Bildirim tercihleri başarıyla kaydedildi',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Bildirim tercihleri kaydedilemedi',
        });
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({
        type: 'error',
        text: 'Bildirim tercihleri kaydedilirken hata oluştu',
      });
    } finally {
      setSaving(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className='w-4 h-4' />;
      case 'sms':
        return <MessageSquare className='w-4 h-4' />;
      case 'push':
        return <Smartphone className='w-4 h-4' />;
      case 'in_app':
        return <Bell className='w-4 h-4' />;
      case 'whatsapp':
        return <MessageSquare className='w-4 h-4' />;
      default:
        return <Bell className='w-4 h-4' />;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'E-posta';
      case 'sms':
        return 'SMS';
      case 'push':
        return 'Push Bildirim';
      case 'in_app':
        return 'Uygulama İçi';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return channel;
    }
  };

  if (loading) {
    return (
      <div className='p-6 max-w-4xl mx-auto'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          <span className='ml-3 text-gray-600'>
            Bildirim tercihleri yükleniyor...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Bildirim Tercihleri
        </h1>
        <p className='text-gray-600 mt-1'>
          Hangi bildirimleri nasıl almak istediğinizi ayarlayın
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Notification Types */}
      <div className='space-y-6'>
        {notificationTypes.map(type => {
          const preference = preferences.find(
            p => p.notificationTypeId === type.id
          );

          return (
            <div
              key={type.id}
              className='bg-white rounded-lg border border-gray-200 p-6'
            >
              {/* Type Header */}
              <div className='flex items-center space-x-3 mb-4'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center text-white'
                  style={{ backgroundColor: type.color }}
                >
                  <Bell className='w-5 h-5' />
                </div>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    {type.displayName}
                  </h3>
                  <p className='text-sm text-gray-600'>{type.description}</p>
                </div>
              </div>

              {/* Channels */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {/* Email */}
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <Mail className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-900'>
                      E-posta
                    </span>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={preference?.emailEnabled || false}
                      onChange={e =>
                        updatePreference(
                          type.id,
                          'emailEnabled',
                          e.target.checked
                        )
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Push Notification */}
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <Smartphone className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-900'>
                      Push Bildirim
                    </span>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={preference?.pushEnabled || false}
                      onChange={e =>
                        updatePreference(
                          type.id,
                          'pushEnabled',
                          e.target.checked
                        )
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* In-App */}
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <Bell className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-900'>
                      Uygulama İçi
                    </span>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={preference?.inAppEnabled || false}
                      onChange={e =>
                        updatePreference(
                          type.id,
                          'inAppEnabled',
                          e.target.checked
                        )
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* SMS */}
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <MessageSquare className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-900'>
                      SMS
                    </span>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={preference?.smsEnabled || false}
                      onChange={e =>
                        updatePreference(
                          type.id,
                          'smsEnabled',
                          e.target.checked
                        )
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* WhatsApp */}
                <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <MessageSquare className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-900'>
                      WhatsApp
                    </span>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={preference?.whatsappEnabled || false}
                      onChange={e =>
                        updatePreference(
                          type.id,
                          'whatsappEnabled',
                          e.target.checked
                        )
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Priority Level */}
              <div className='mt-4 pt-4 border-t border-gray-200'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Öncelik Seviyesi
                </label>
                <select
                  value={preference?.priorityLevel || 'medium'}
                  onChange={e =>
                    updatePreference(type.id, 'priorityLevel', e.target.value)
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='low'>Düşük</option>
                  <option value='medium'>Orta</option>
                  <option value='high'>Yüksek</option>
                  <option value='urgent'>Acil</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className='mt-8 flex items-center justify-end space-x-4'>
        <button
          onClick={loadData}
          className='px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
        >
          <RefreshCw className='w-4 h-4 mr-2' />
          Sıfırla
        </button>

        <button
          onClick={savePreferences}
          disabled={saving}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {saving ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className='w-4 h-4 mr-2' />
              Kaydet
            </>
          )}
        </button>
      </div>
    </div>
  );
}
