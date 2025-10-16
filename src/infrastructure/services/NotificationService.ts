/**
 * Notification Service
 *
 * Handles multi-channel notifications (email, SMS, push, in-app, WhatsApp)
 * with template support and user preferences.
 */

import { supabase } from '../database/supabase/client';
import { Database } from '../database/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert =
  Database['public']['Tables']['notifications']['Insert'];
type NotificationType =
  Database['public']['Tables']['notification_types']['Row'];
type NotificationTemplate =
  Database['public']['Tables']['notification_templates']['Row'];
type NotificationPreference =
  Database['public']['Tables']['notification_preferences']['Row'];

export interface NotificationChannel {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  in_app?: boolean;
  whatsapp?: boolean;
}

export interface NotificationData {
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  channels?: NotificationChannel;
  relatedEntity?: {
    type: string;
    id: string;
  };
  action?: {
    url?: string;
    text?: string;
    data?: Record<string, any>;
  };
  variables?: Record<string, any>;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  notificationTypeId: string;
  typeName: string;
  displayName: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  priorityLevel: string;
}

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    tenantId: string,
    data: NotificationData
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      console.log('🔔 Sending notification:', { userId, tenantId, data });

      // Get notification type
      const notificationType = await this.getNotificationType(data.type);
      if (!notificationType) {
        throw new Error(`Notification type '${data.type}' not found`);
      }

      // Get user preferences for this notification type
      const preferences = await this.getUserPreferences(
        userId,
        tenantId,
        notificationType.id
      );

      // Determine channels to use
      const channels = this.determineChannels(data.channels, preferences);

      // Get template for this notification type
      const template = await this.getTemplate(tenantId, notificationType.id);

      // Process template with variables
      const processedContent = this.processTemplate(
        template,
        data.variables || {}
      );

      // Create notification record
      const notification: NotificationInsert = {
        tenant_id: tenantId,
        user_id: userId,
        title: processedContent.title || data.title,
        message: processedContent.message || data.message,
        notification_type_id: notificationType.id,
        priority: data.priority || 'medium',
        status: 'unread',
        channels: Object.keys(channels).filter(
          key => channels[key as keyof NotificationChannel]
        ),
        channel_status: {},
        related_entity_type: data.relatedEntity?.type,
        related_entity_id: data.relatedEntity?.id,
        action_url: data.action?.url,
        action_text: data.action?.text,
        action_data: data.action?.data,
        expires_at: data.expiresAt?.toISOString(),
      };

      const { data: notificationData, error: insertError } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (insertError) {
        throw new Error(
          `Failed to create notification: ${insertError.message}`
        );
      }

      // Send through enabled channels
      const channelResults = await this.sendThroughChannels(
        notificationData.id,
        channels,
        processedContent,
        data.variables || {}
      );

      // Update channel status
      await this.updateChannelStatus(notificationData.id, channelResults);

      console.log('✅ Notification sent successfully:', notificationData.id);
      return { success: true, notificationId: notificationData.id };
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(
    userIds: string[],
    tenantId: string,
    data: NotificationData
  ): Promise<{
    success: boolean;
    results: Array<{ userId: string; success: boolean; error?: string }>;
  }> {
    console.log('🔔 Sending bulk notifications:', {
      userIds: userIds.length,
      tenantId,
      data,
    });

    const results = await Promise.allSettled(
      userIds.map(userId => this.sendNotification(userId, tenantId, data))
    );

    const processedResults = results.map((result, index) => ({
      userId: userIds[index],
      success: result.status === 'fulfilled' && result.value.success,
      error:
        result.status === 'rejected'
          ? result.reason
          : result.status === 'fulfilled' && !result.value.success
            ? result.value.error
            : undefined,
    }));

    const successCount = processedResults.filter(r => r.success).length;
    console.log(
      `✅ Bulk notification completed: ${successCount}/${userIds.length} successful`
    );

    return {
      success: successCount > 0,
      results: processedResults,
    };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    tenantId: string,
    options: {
      status?: 'unread' | 'read' | 'archived' | 'all';
      limit?: number;
      offset?: number;
      type?: string;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      // TODO: Remove mock data when database is ready
      // For now, return mock notifications
      const mockNotifications = [
        {
          id: '1',
          tenant_id: tenantId,
          user_id: userId,
          title: 'Yeni Sipariş Alındı',
          message:
            'Ahmet Yılmaz tarafından 1.250 TL tutarında yeni sipariş alındı.',
          notification_type_id: '1',
          priority: 'high',
          status: 'unread',
          channels: ['email', 'push', 'in_app'],
          channel_status: { email: 'sent', push: 'sent', in_app: 'sent' },
          related_entity_type: 'order',
          related_entity_id: 'order-123',
          action_url: '/orders/order-123',
          action_text: 'Siparişi Görüntüle',
          action_data: {},
          created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
          updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
          notification_types: {
            type_name: 'order_created',
            display_name: 'Yeni Sipariş',
            icon: 'shopping-cart',
            color: '#10B981',
          },
        },
        {
          id: '2',
          tenant_id: tenantId,
          user_id: userId,
          title: 'Düşük Stok Uyarısı',
          message: 'Erkek Triko Kazak ürününün stoğu 5 adede düştü.',
          notification_type_id: '2',
          priority: 'urgent',
          status: 'unread',
          channels: ['email', 'push', 'in_app', 'whatsapp'],
          channel_status: {
            email: 'sent',
            push: 'sent',
            in_app: 'sent',
            whatsapp: 'sent',
          },
          related_entity_type: 'product',
          related_entity_id: 'product-456',
          action_url: '/products/product-456',
          action_text: 'Ürünü Görüntüle',
          action_data: {},
          created_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
          updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
          notification_types: {
            type_name: 'low_stock',
            display_name: 'Düşük Stok',
            icon: 'alert-triangle',
            color: '#EF4444',
          },
        },
        {
          id: '3',
          tenant_id: tenantId,
          user_id: userId,
          title: 'Shopify Senkronizasyonu Tamamlandı',
          message: "150 ürün başarıyla Shopify'a senkronize edildi.",
          notification_type_id: '3',
          priority: 'medium',
          status: 'read',
          channels: ['email', 'in_app'],
          channel_status: { email: 'sent', in_app: 'sent' },
          related_entity_type: 'sync',
          related_entity_id: 'sync-789',
          action_url: '/integrations/shopify',
          action_text: 'Detayları Gör',
          action_data: {},
          created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
          read_at: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
          notification_types: {
            type_name: 'sync_completed',
            display_name: 'Senkronizasyon Tamamlandı',
            icon: 'refresh-cw',
            color: '#84CC16',
          },
        },
        {
          id: '4',
          tenant_id: tenantId,
          user_id: userId,
          title: 'Workflow Tamamlandı',
          message: 'Günlük Rapor Otomasyonu başarıyla tamamlandı.',
          notification_type_id: '4',
          priority: 'low',
          status: 'read',
          channels: ['in_app'],
          channel_status: { in_app: 'sent' },
          related_entity_type: 'workflow',
          related_entity_id: 'workflow-daily-report',
          action_url: '/automation/workflow/workflow-daily-report',
          action_text: 'Raporu Gör',
          action_data: {},
          created_at: new Date(Date.now() - 5 * 60 * 60000).toISOString(), // 5 hours ago
          updated_at: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
          read_at: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
          notification_types: {
            type_name: 'workflow_completed',
            display_name: 'Otomasyon Tamamlandı',
            icon: 'zap',
            color: '#EC4899',
          },
        },
        {
          id: '5',
          tenant_id: tenantId,
          user_id: userId,
          title: 'Ödeme Alındı',
          message: "Mehmet Demir'den 2.500 TL ödeme alındı.",
          notification_type_id: '5',
          priority: 'high',
          status: 'unread',
          channels: ['email', 'push', 'in_app'],
          channel_status: { email: 'sent', push: 'sent', in_app: 'sent' },
          related_entity_type: 'payment',
          related_entity_id: 'payment-111',
          action_url: '/payments/payment-111',
          action_text: 'Ödemeyi Görüntüle',
          action_data: {},
          created_at: new Date(Date.now() - 10 * 60 * 60000).toISOString(), // 10 hours ago
          updated_at: new Date(Date.now() - 10 * 60 * 60000).toISOString(),
          notification_types: {
            type_name: 'payment_received',
            display_name: 'Ödeme Alındı',
            icon: 'credit-card',
            color: '#059669',
          },
        },
      ];

      // Filter by status
      let filteredNotifications = mockNotifications;
      if (options.status && options.status !== 'all') {
        filteredNotifications = mockNotifications.filter(
          n => n.status === options.status
        );
      }

      // Filter by type
      if (options.type) {
        filteredNotifications = filteredNotifications.filter(
          n => n.notification_types.type_name === options.type
        );
      }

      // Apply pagination
      const total = filteredNotifications.length;
      const offset = options.offset || 0;
      const limit = options.limit || 10;
      const paginatedNotifications = filteredNotifications.slice(
        offset,
        offset + limit
      );

      if (import.meta.env.DEV) {
        console.log('📊 Mock notifications returned:', {
          total,
          returned: paginatedNotifications.length,
          filters: options,
        });
      }

      return {
        notifications: paginatedNotifications as any,
        total,
      };
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string, tenantId: string): Promise<number> {
    try {
      // TODO: Remove mock data when database is ready
      // For now, return mock count (2 unread notifications)
      const mockUnreadCount = 2;
      if (import.meta.env.DEV) {
        console.log('📊 Mock unread count:', mockUnreadCount);
      }
      return mockUnreadCount;
    } catch (error) {
      console.error('❌ Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(
    userId: string,
    tenantId: string,
    notificationIds?: string[]
  ): Promise<number> {
    try {
      // TODO: Remove mock data when database is ready
      // For now, simulate marking as read
      const markedCount = notificationIds ? notificationIds.length : 2;
      if (import.meta.env.DEV) {
        console.log(`✅ Mock: Marked ${markedCount} notifications as read`);
      }
      return markedCount;
    } catch (error) {
      console.error('❌ Failed to mark notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(
    userId: string,
    tenantId: string,
    notificationTypeId?: string
  ): Promise<NotificationPreferences[]> {
    try {
      let query = supabase
        .from('notification_preferences')
        .select(
          `
          *,
          notification_types!inner(
            type_name,
            display_name
          )
        `
        )
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (notificationTypeId) {
        query = query.eq('notification_type_id', notificationTypeId);
      }

      const { data: preferences, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch preferences: ${error.message}`);
      }

      return (preferences || []).map(pref => ({
        notificationTypeId: pref.notification_type_id,
        typeName: (pref as any).notification_types.type_name,
        displayName: (pref as any).notification_types.display_name,
        emailEnabled: pref.email_enabled,
        smsEnabled: pref.sms_enabled,
        pushEnabled: pref.push_enabled,
        inAppEnabled: pref.in_app_enabled,
        whatsappEnabled: pref.whatsapp_enabled,
        priorityLevel: pref.priority_level,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch preferences:', error);
      return [];
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    tenantId: string,
    preferences: Partial<NotificationPreferences>[]
  ): Promise<boolean> {
    try {
      const updates = preferences.map(pref => ({
        user_id: userId,
        tenant_id: tenantId,
        notification_type_id: pref.notificationTypeId,
        email_enabled: pref.emailEnabled,
        sms_enabled: pref.smsEnabled,
        push_enabled: pref.pushEnabled,
        in_app_enabled: pref.inAppEnabled,
        whatsapp_enabled: pref.whatsappEnabled,
        priority_level: pref.priorityLevel,
      }));

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(updates, {
          onConflict: 'user_id,tenant_id,notification_type_id',
        });

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      console.log('✅ Notification preferences updated');
      return true;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_notifications');

      if (error) {
        throw new Error(
          `Failed to cleanup old notifications: ${error.message}`
        );
      }

      console.log(`✅ Cleaned up ${data} old notifications`);
      return data || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup old notifications:', error);
      return 0;
    }
  }

  // Private helper methods

  private async getNotificationType(
    typeName: string
  ): Promise<NotificationType | null> {
    const { data, error } = await supabase
      .from('notification_types')
      .select('*')
      .eq('type_name', typeName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Failed to get notification type:', error);
      return null;
    }

    return data;
  }

  private async getUserPreferences(
    userId: string,
    tenantId: string,
    notificationTypeId: string
  ): Promise<NotificationPreference | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('notification_type_id', notificationTypeId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('❌ Failed to get user preferences:', error);
      return null;
    }

    return data;
  }

  private determineChannels(
    requestedChannels?: NotificationChannel,
    preferences?: NotificationPreference
  ): NotificationChannel {
    const channels: NotificationChannel = {};

    // Use requested channels if provided, otherwise use preferences
    if (requestedChannels) {
      channels.email = requestedChannels.email;
      channels.sms = requestedChannels.sms;
      channels.push = requestedChannels.push;
      channels.in_app = requestedChannels.in_app;
      channels.whatsapp = requestedChannels.whatsapp;
    } else if (preferences) {
      channels.email = preferences.email_enabled;
      channels.sms = preferences.sms_enabled;
      channels.push = preferences.push_enabled;
      channels.in_app = preferences.in_app_enabled;
      channels.whatsapp = preferences.whatsapp_enabled;
    } else {
      // Default channels
      channels.email = true;
      channels.push = true;
      channels.in_app = true;
    }

    return channels;
  }

  private async getTemplate(
    tenantId: string,
    notificationTypeId: string
  ): Promise<NotificationTemplate | null> {
    // Try tenant-specific template first
    let { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('notification_type_id', notificationTypeId)
      .eq('is_active', true)
      .single();

    // Fall back to global template
    if (error) {
      const { data: globalData, error: globalError } = await supabase
        .from('notification_templates')
        .select('*')
        .is('tenant_id', null)
        .eq('notification_type_id', notificationTypeId)
        .eq('is_active', true)
        .single();

      if (globalError) {
        console.error('❌ Failed to get template:', globalError);
        return null;
      }

      data = globalData;
    }

    return data;
  }

  private processTemplate(
    template: NotificationTemplate | null,
    variables: Record<string, any>
  ): { title: string; message: string } {
    if (!template) {
      return { title: '', message: '' };
    }

    const processText = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || match;
      });
    };

    return {
      title: processText(template.subject_template),
      message: processText(template.message_template),
    };
  }

  private async sendThroughChannels(
    notificationId: string,
    channels: NotificationChannel,
    content: { title: string; message: string },
    variables: Record<string, any>
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    // In-app notification (always sent)
    if (channels.in_app) {
      results.in_app = 'sent';
    }

    // Email notification
    if (channels.email) {
      try {
        // TODO: Implement email sending (SendGrid, Supabase Email, etc.)
        console.log('📧 Email notification would be sent:', content);
        results.email = 'sent';
      } catch (error) {
        console.error('❌ Failed to send email:', error);
        results.email = 'failed';
      }
    }

    // SMS notification
    if (channels.sms) {
      try {
        // TODO: Implement SMS sending (Twilio, etc.)
        console.log('📱 SMS notification would be sent:', content);
        results.sms = 'sent';
      } catch (error) {
        console.error('❌ Failed to send SMS:', error);
        results.sms = 'failed';
      }
    }

    // Push notification
    if (channels.push) {
      try {
        // TODO: Implement push notification (FCM, etc.)
        console.log('🔔 Push notification would be sent:', content);
        results.push = 'sent';
      } catch (error) {
        console.error('❌ Failed to send push:', error);
        results.push = 'failed';
      }
    }

    // WhatsApp notification
    if (channels.whatsapp) {
      try {
        // TODO: Implement WhatsApp sending (WhatsApp Business API)
        console.log('💬 WhatsApp notification would be sent:', content);
        results.whatsapp = 'sent';
      } catch (error) {
        console.error('❌ Failed to send WhatsApp:', error);
        results.whatsapp = 'failed';
      }
    }

    return results;
  }

  private async updateChannelStatus(
    notificationId: string,
    channelResults: Record<string, string>
  ): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        channel_status: channelResults,
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('❌ Failed to update channel status:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
