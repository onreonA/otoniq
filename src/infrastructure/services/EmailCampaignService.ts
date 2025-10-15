/**
 * EmailCampaignService
 * Service for managing email marketing campaigns and recipients
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface EmailCampaign {
  id?: string;
  tenantId: string;
  workflowId?: string;
  campaignName: string;
  subjectLine: string;
  previewText?: string;
  fromName: string;
  fromEmail: string;
  replyToEmail?: string;
  htmlContent?: string;
  plainTextContent?: string;
  templateId?: string;
  segmentType?: 'all' | 'custom' | 'customers' | 'subscribers';
  segmentFilter?: any;
  scheduledAt?: string;
  sentAt?: string;
  status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  totalRecipients?: number;
  sentCount?: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  bouncedCount?: number;
  unsubscribedCount?: number;
  openRate?: number;
  clickRate?: number;
  bounceRate?: number;
  errorMessage?: string;
  metadata?: any;
  createdBy?: string;
}

export interface EmailCampaignRecipient {
  id?: string;
  campaignId: string;
  tenantId: string;
  email: string;
  customerName?: string;
  customerId?: string;
  status?:
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'unsubscribed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  firstClickedAt?: string;
  bouncedAt?: string;
  unsubscribedAt?: string;
  openCount?: number;
  clickCount?: number;
  bounceReason?: string;
  metadata?: any;
}

export class EmailCampaignService {
  /**
   * Create email campaign
   */
  static async createCampaign(campaign: EmailCampaign): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          tenant_id: campaign.tenantId,
          workflow_id: campaign.workflowId,
          campaign_name: campaign.campaignName,
          subject_line: campaign.subjectLine,
          preview_text: campaign.previewText,
          from_name: campaign.fromName,
          from_email: campaign.fromEmail,
          reply_to_email: campaign.replyToEmail,
          html_content: campaign.htmlContent,
          plain_text_content: campaign.plainTextContent,
          template_id: campaign.templateId,
          segment_type: campaign.segmentType || 'all',
          segment_filter: campaign.segmentFilter,
          scheduled_at: campaign.scheduledAt,
          status: campaign.status || 'draft',
          created_by: campaign.createdBy,
          metadata: campaign.metadata,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create campaign: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  /**
   * Get tenant's email campaigns
   */
  static async getTenantCampaigns(
    tenantId: string,
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<EmailCampaign[]> {
    try {
      let query = supabase
        .from('email_campaigns')
        .select('*')
        .eq('tenant_id', tenantId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 50);

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get campaigns: ${error.message}`);
      }

      return data.map(row => this.mapCampaignFromDb(row));
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaign(campaignId: string): Promise<EmailCampaign | null> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        throw new Error(`Failed to get campaign: ${error.message}`);
      }

      return this.mapCampaignFromDb(data);
    } catch (error) {
      console.error('Error getting campaign:', error);
      return null;
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(
    campaignId: string,
    updates: Partial<EmailCampaign>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          campaign_name: updates.campaignName,
          subject_line: updates.subjectLine,
          preview_text: updates.previewText,
          from_name: updates.fromName,
          from_email: updates.fromEmail,
          reply_to_email: updates.replyToEmail,
          html_content: updates.htmlContent,
          plain_text_content: updates.plainTextContent,
          template_id: updates.templateId,
          segment_type: updates.segmentType,
          segment_filter: updates.segmentFilter,
          scheduled_at: updates.scheduledAt,
          status: updates.status,
          metadata: updates.metadata,
        })
        .eq('id', campaignId);

      if (error) {
        throw new Error(`Failed to update campaign: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating campaign:', error);
      return false;
    }
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        throw new Error(`Failed to delete campaign: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  /**
   * Get campaign recipients
   */
  static async getCampaignRecipients(
    campaignId: string,
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<EmailCampaignRecipient[]> {
    try {
      let query = supabase
        .from('email_campaign_recipients')
        .select('*')
        .eq('campaign_id', campaignId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      query = query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 100) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to get recipients: ${error.message}`);
      }

      return data.map(row => this.mapRecipientFromDb(row));
    } catch (error) {
      console.error('Error getting recipients:', error);
      return [];
    }
  }

  /**
   * Update campaign analytics
   */
  static async updateCampaignAnalytics(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_campaign_analytics', {
        p_campaign_id: campaignId,
      });

      if (error) {
        throw new Error(
          `Failed to update campaign analytics: ${error.message}`
        );
      }

      return true;
    } catch (error) {
      console.error('Error updating campaign analytics:', error);
      return false;
    }
  }

  /**
   * Get email campaign analytics summary
   */
  static async getAnalyticsSummary(tenantId: string, days: number = 30) {
    try {
      const { data, error } = await supabase.rpc(
        'get_email_campaign_analytics',
        {
          p_tenant_id: tenantId,
          p_days: days,
        }
      );

      if (error) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }

      return data[0];
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Track email open
   */
  static async trackEmailOpen(
    recipientId: string,
    openedAt?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaign_recipients')
        .update({
          status: 'opened',
          opened_at: openedAt || new Date().toISOString(),
          open_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', recipientId);

      if (error) {
        throw new Error(`Failed to track email open: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error tracking email open:', error);
      return false;
    }
  }

  /**
   * Track email click
   */
  static async trackEmailClick(
    recipientId: string,
    clickedAt?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaign_recipients')
        .update({
          status: 'clicked',
          first_clicked_at: clickedAt || new Date().toISOString(),
          click_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', recipientId);

      if (error) {
        throw new Error(`Failed to track email click: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error tracking email click:', error);
      return false;
    }
  }

  /**
   * Schedule campaign
   */
  static async scheduleCampaign(
    campaignId: string,
    scheduledAt: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .update({
          scheduled_at: scheduledAt,
          status: 'scheduled',
        })
        .eq('id', campaignId);

      if (error) {
        throw new Error(`Failed to schedule campaign: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      return false;
    }
  }

  /**
   * Map database row to EmailCampaign
   */
  private static mapCampaignFromDb(row: any): EmailCampaign {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      workflowId: row.workflow_id,
      campaignName: row.campaign_name,
      subjectLine: row.subject_line,
      previewText: row.preview_text,
      fromName: row.from_name,
      fromEmail: row.from_email,
      replyToEmail: row.reply_to_email,
      htmlContent: row.html_content,
      plainTextContent: row.plain_text_content,
      templateId: row.template_id,
      segmentType: row.segment_type,
      segmentFilter: row.segment_filter,
      scheduledAt: row.scheduled_at,
      sentAt: row.sent_at,
      status: row.status,
      totalRecipients: row.total_recipients,
      sentCount: row.sent_count,
      deliveredCount: row.delivered_count,
      openedCount: row.opened_count,
      clickedCount: row.clicked_count,
      bouncedCount: row.bounced_count,
      unsubscribedCount: row.unsubscribed_count,
      openRate: row.open_rate,
      clickRate: row.click_rate,
      bounceRate: row.bounce_rate,
      errorMessage: row.error_message,
      metadata: row.metadata,
      createdBy: row.created_by,
    };
  }

  /**
   * Map database row to EmailCampaignRecipient
   */
  private static mapRecipientFromDb(row: any): EmailCampaignRecipient {
    return {
      id: row.id,
      campaignId: row.campaign_id,
      tenantId: row.tenant_id,
      email: row.email,
      customerName: row.customer_name,
      customerId: row.customer_id,
      status: row.status,
      sentAt: row.sent_at,
      deliveredAt: row.delivered_at,
      openedAt: row.opened_at,
      firstClickedAt: row.first_clicked_at,
      bouncedAt: row.bounced_at,
      unsubscribedAt: row.unsubscribed_at,
      openCount: row.open_count,
      clickCount: row.click_count,
      bounceReason: row.bounce_reason,
      metadata: row.metadata,
    };
  }
}
