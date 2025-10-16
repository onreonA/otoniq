import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface EmailCampaign {
  id: string;
  tenant_id: string;
  campaign_name: string;
  campaign_type:
    | 'one_time'
    | 'drip'
    | 'promotional'
    | 'newsletter'
    | 'transactional';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';
  subject_line: string;
  preview_text?: string;
  from_name: string;
  from_email: string;
  reply_to_email?: string;
  html_content?: string;
  text_content?: string;
  segment_criteria?: any;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailRecipient {
  id: string;
  campaign_id: string;
  tenant_id: string;
  email: string;
  name?: string;
  status:
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'opened'
    | 'clicked'
    | 'bounced'
    | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  error_message?: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  template_name: string;
  template_type: 'promotional' | 'transactional' | 'newsletter' | 'custom';
  subject_line: string;
  html_content: string;
  text_content?: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class EmailCampaignService {
  /**
   * Get all campaigns for a tenant
   */
  static async getCampaigns(tenantId: string): Promise<EmailCampaign[]> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      throw error;
    }
  }

  /**
   * Get a single campaign
   */
  static async getCampaign(campaignId: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching email campaign:', error);
      throw error;
    }
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(
    tenantId: string,
    campaignData: Partial<EmailCampaign>
  ): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          tenant_id: tenantId,
          ...campaignData,
          status: campaignData.status || 'draft',
          recipient_count: 0,
          sent_count: 0,
          delivered_count: 0,
          opened_count: 0,
          clicked_count: 0,
          bounced_count: 0,
          unsubscribed_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw error;
    }
  }

  /**
   * Update a campaign
   */
  static async updateCampaign(
    campaignId: string,
    updates: Partial<EmailCampaign>
  ): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating email campaign:', error);
      throw error;
    }
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(campaignId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting email campaign:', error);
      throw error;
    }
  }

  /**
   * Get recipients for a campaign
   */
  static async getRecipients(campaignId: string): Promise<EmailRecipient[]> {
    try {
      const { data, error } = await supabase
        .from('email_recipients')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email recipients:', error);
      throw error;
    }
  }

  /**
   * Add recipients to a campaign
   */
  static async addRecipients(
    campaignId: string,
    tenantId: string,
    recipients: Array<{ email: string; name?: string }>
  ): Promise<EmailRecipient[]> {
    try {
      const recipientRecords = recipients.map(r => ({
        campaign_id: campaignId,
        tenant_id: tenantId,
        email: r.email,
        name: r.name,
        status: 'pending' as const,
      }));

      const { data, error } = await supabase
        .from('email_recipients')
        .insert(recipientRecords)
        .select();

      if (error) throw error;

      // Update campaign recipient count
      await supabase
        .from('email_campaigns')
        .update({ recipient_count: recipients.length })
        .eq('id', campaignId);

      return data || [];
    } catch (error) {
      console.error('Error adding email recipients:', error);
      throw error;
    }
  }

  /**
   * Send a campaign
   */
  static async sendCampaign(campaignId: string): Promise<void> {
    try {
      // Update campaign status to sending
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      // In production, this would trigger N8N workflow or email service
      // For now, we'll simulate sending
      console.log('Campaign send triggered:', campaignId);
    } catch (error) {
      console.error('Error sending email campaign:', error);
      throw error;
    }
  }

  /**
   * Schedule a campaign
   */
  static async scheduleCampaign(
    campaignId: string,
    scheduledAt: string
  ): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({
          status: 'scheduled',
          scheduled_at: scheduledAt,
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error scheduling email campaign:', error);
      throw error;
    }
  }

  /**
   * Pause a campaign
   */
  static async pauseCampaign(campaignId: string): Promise<EmailCampaign> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update({ status: 'paused' })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error pausing email campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(tenantId: string): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalSent: number;
    averageOpenRate: number;
    averageClickRate: number;
    totalUnsubscribed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const campaigns = data || [];

      const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);
      const totalOpened = campaigns.reduce((sum, c) => sum + c.opened_count, 0);
      const totalClicked = campaigns.reduce(
        (sum, c) => sum + c.clicked_count,
        0
      );

      return {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(
          c => c.status === 'sending' || c.status === 'scheduled'
        ).length,
        totalSent,
        averageOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        averageClickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        totalUnsubscribed: campaigns.reduce(
          (sum, c) => sum + c.unsubscribed_count,
          0
        ),
      };
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      throw error;
    }
  }

  /**
   * Get all templates for a tenant
   */
  static async getTemplates(tenantId: string): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  }

  /**
   * Create a template
   */
  static async createTemplate(
    tenantId: string,
    templateData: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          tenant_id: tenantId,
          ...templateData,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email template:', error);
      throw error;
    }
  }

  /**
   * Update recipient status (for webhook callbacks)
   */
  static async updateRecipientStatus(
    recipientId: string,
    status: EmailRecipient['status'],
    metadata?: {
      sent_at?: string;
      delivered_at?: string;
      opened_at?: string;
      clicked_at?: string;
      bounced_at?: string;
      error_message?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_recipients')
        .update({
          status,
          ...metadata,
        })
        .eq('id', recipientId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating recipient status:', error);
      throw error;
    }
  }
}
