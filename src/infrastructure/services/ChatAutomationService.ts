import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from './WhatsAppService';
import { TelegramService } from './TelegramService';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface ChatPlatform {
  id: string;
  tenantId: string;
  platformType: 'whatsapp' | 'telegram' | 'facebook_messenger' | 'instagram_dm';
  platformName: string;
  isActive: boolean;
  autoReplyEnabled: boolean;
  autoReplyMessage?: string;
  greetingMessage?: string;
  totalMessagesSent: number;
  totalMessagesReceived: number;
}

export interface ChatConversation {
  id: string;
  tenantId: string;
  platformId: string;
  customerId?: string;
  externalChatId: string;
  customerName?: string;
  customerPhone?: string;
  status: 'active' | 'closed' | 'archived' | 'spam';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  unreadCount: number;
  lastMessageAt?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  messageType:
    | 'text'
    | 'image'
    | 'document'
    | 'location'
    | 'contact'
    | 'audio'
    | 'video';
  direction: 'inbound' | 'outbound';
  senderType: 'customer' | 'agent' | 'bot';
  content?: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatAutomation {
  id: string;
  tenantId: string;
  platformId: string;
  automationName: string;
  automationType:
    | 'welcome'
    | 'keyword'
    | 'intent'
    | 'schedule'
    | 'abandoned_cart';
  triggerKeywords: string[];
  responseType: 'text' | 'template' | 'product_catalog' | 'order_status';
  responseContent?: string;
  isActive: boolean;
  triggerCount: number;
}

export class ChatAutomationService {
  /**
   * Get chat platforms for tenant
   */
  static async getChatPlatforms(tenantId: string): Promise<ChatPlatform[]> {
    const { data, error } = await supabase
      .from('chat_platforms')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create or update chat platform
   */
  static async upsertChatPlatform(
    tenantId: string,
    platformData: {
      platformType: string;
      platformName: string;
      whatsappPhoneNumberId?: string;
      whatsappAccessToken?: string;
      telegramBotToken?: string;
      telegramBotUsername?: string;
      autoReplyEnabled?: boolean;
      autoReplyMessage?: string;
      greetingMessage?: string;
    }
  ): Promise<ChatPlatform> {
    const { data, error } = await supabase
      .from('chat_platforms')
      .upsert(
        {
          tenant_id: tenantId,
          platform_type: platformData.platformType,
          platform_name: platformData.platformName,
          whatsapp_phone_number_id: platformData.whatsappPhoneNumberId,
          whatsapp_access_token: platformData.whatsappAccessToken,
          telegram_bot_token: platformData.telegramBotToken,
          telegram_bot_username: platformData.telegramBotUsername,
          auto_reply_enabled: platformData.autoReplyEnabled || false,
          auto_reply_message: platformData.autoReplyMessage,
          greeting_message: platformData.greetingMessage,
          is_active: true,
        },
        { onConflict: 'tenant_id,platform_type' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get conversations for tenant
   */
  static async getConversations(
    tenantId: string,
    filters?: {
      platformId?: string;
      status?: string;
      assignedTo?: string;
    }
  ): Promise<ChatConversation[]> {
    let query = supabase
      .from('chat_conversations')
      .select(
        '*, platform:chat_platforms(platform_name), customer:customers(name, email)'
      )
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false });

    if (filters?.platformId) {
      query = query.eq('platform_id', filters.platformId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  }

  /**
   * Get conversation messages
   */
  static async getConversationMessages(
    conversationId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    const { data, error } = await supabase.rpc('get_recent_chat_messages', {
      p_conversation_id: conversationId,
      p_limit: limit,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Send message
   */
  static async sendMessage(
    conversationId: string,
    messageType: 'text' | 'image' | 'document',
    content: string,
    mediaUrl?: string
  ): Promise<ChatMessage> {
    // Get conversation details
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('*, platform:chat_platforms(*)')
      .eq('id', conversationId)
      .single();

    if (!conversation) throw new Error('Conversation not found');

    // Send via appropriate platform
    let success = false;
    if (conversation.platform.platform_type === 'whatsapp') {
      success = await WhatsAppService.sendMessage(
        conversation.external_chat_id,
        messageType,
        content,
        mediaUrl
      );
    } else if (conversation.platform.platform_type === 'telegram') {
      success = await TelegramService.sendMessage(
        conversation.external_chat_id,
        content,
        mediaUrl
      );
    }

    if (!success) throw new Error('Failed to send message');

    // Save to database
    const { data: user } = await supabase.auth.getUser();
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        message_type: messageType,
        direction: 'outbound',
        sender_type: 'agent',
        sender_id: user.user?.id,
        content,
        media_url: mediaUrl,
        is_read: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from('chat_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_from: 'agent',
      })
      .eq('id', conversationId);

    return message;
  }

  /**
   * Process incoming message (webhook handler)
   */
  static async processIncomingMessage(
    platformType: string,
    chatId: string,
    message: any
  ): Promise<void> {
    try {
      // Find platform
      const { data: platform } = await supabase
        .from('chat_platforms')
        .select('*')
        .eq('platform_type', platformType)
        .eq('is_active', true)
        .single();

      if (!platform) return;

      // Find or create conversation
      let { data: conversation } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('platform_id', platform.id)
        .eq('external_chat_id', chatId)
        .single();

      if (!conversation) {
        const { data: newConversation, error } = await supabase
          .from('chat_conversations')
          .insert({
            tenant_id: platform.tenant_id,
            platform_id: platform.id,
            external_chat_id: chatId,
            customer_name: message.from?.name || message.from?.username,
            customer_phone: message.from?.phone,
            customer_username: message.from?.username,
            status: 'active',
            unread_count: 1,
          })
          .select()
          .single();

        if (error) throw error;
        conversation = newConversation;
      }

      // Save message
      await supabase.from('chat_messages').insert({
        conversation_id: conversation.id,
        external_message_id: message.id,
        message_type: message.type || 'text',
        direction: 'inbound',
        sender_type: 'customer',
        content: message.text || message.caption,
        media_url: message.media?.url,
        media_type: message.media?.type,
      });

      // Update conversation
      await supabase
        .from('chat_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_from: 'customer',
          unread_count: conversation.unread_count + 1,
        })
        .eq('id', conversation.id);

      // Check for automations
      await this.checkAutomations(conversation.id, message.text || '');

      // Send greeting if first message
      if (conversation.unread_count === 0 && platform.greeting_message) {
        await this.sendMessage(
          conversation.id,
          'text',
          platform.greeting_message
        );
      }
    } catch (error) {
      console.error('Error processing incoming message:', error);
    }
  }

  /**
   * Check and trigger automations
   */
  private static async checkAutomations(
    conversationId: string,
    messageText: string
  ): Promise<void> {
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('*, platform:chat_platforms(*)')
      .eq('id', conversationId)
      .single();

    if (!conversation) return;

    // Get active automations
    const { data: automations } = await supabase
      .from('chat_automations')
      .select('*')
      .eq('platform_id', conversation.platform_id)
      .eq('is_active', true);

    if (!automations) return;

    // Check keyword triggers
    for (const automation of automations) {
      let triggered = false;

      if (automation.automation_type === 'keyword') {
        const keywords = automation.trigger_keywords || [];
        const lowerText = messageText.toLowerCase();
        triggered = keywords.some((keyword: string) =>
          lowerText.includes(keyword.toLowerCase())
        );
      }

      if (triggered) {
        // Send automated response
        if (
          automation.response_type === 'text' &&
          automation.response_content
        ) {
          await this.sendMessage(
            conversationId,
            'text',
            automation.response_content
          );
        }

        // Update automation stats
        await supabase
          .from('chat_automations')
          .update({
            trigger_count: automation.trigger_count + 1,
            success_count: automation.success_count + 1,
            last_triggered_at: new Date().toISOString(),
          })
          .eq('id', automation.id);
      }
    }
  }

  /**
   * Get chat statistics
   */
  static async getChatStatistics(tenantId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_chat_statistics', {
      p_tenant_id: tenantId,
    });

    if (error) throw error;
    return data?.[0] || {};
  }

  /**
   * Create chat automation
   */
  static async createAutomation(
    tenantId: string,
    platformId: string,
    automation: {
      automationName: string;
      automationType: string;
      triggerKeywords?: string[];
      responseType: string;
      responseContent?: string;
    }
  ): Promise<ChatAutomation> {
    const { data, error } = await supabase
      .from('chat_automations')
      .insert({
        tenant_id: tenantId,
        platform_id: platformId,
        automation_name: automation.automationName,
        automation_type: automation.automationType,
        trigger_keywords: automation.triggerKeywords || [],
        response_type: automation.responseType,
        response_content: automation.responseContent,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get automations for platform
   */
  static async getAutomations(
    tenantId: string,
    platformId?: string
  ): Promise<ChatAutomation[]> {
    let query = supabase
      .from('chat_automations')
      .select('*, platform:chat_platforms(platform_name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Assign conversation to agent
   */
  static async assignConversation(
    conversationId: string,
    agentId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ assigned_to: agentId })
      .eq('id', conversationId);

    if (error) throw error;
  }

  /**
   * Mark conversation as read
   */
  static async markAsRead(conversationId: string): Promise<void> {
    await supabase
      .from('chat_conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);

    await supabase
      .from('chat_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('is_read', false);
  }
}
