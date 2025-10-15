/**
 * SocialMediaService
 * Service for managing social media accounts, posts, and automation
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SocialMediaAccount {
  id?: string;
  tenantId: string;
  platform:
    | 'instagram'
    | 'facebook'
    | 'twitter'
    | 'linkedin'
    | 'tiktok'
    | 'youtube';
  accountName: string;
  accountHandle: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  accountMetadata?: any;
  isActive?: boolean;
  createdBy?: string;
}

export interface SocialMediaPost {
  id?: string;
  tenantId: string;
  accountId: string;
  productId?: string;
  workflowId?: string;
  postType: 'image' | 'video' | 'carousel' | 'story' | 'reel' | 'text';
  caption?: string;
  mediaUrls?: string[];
  hashtags?: string[];
  scheduledAt?: string;
  postedAt?: string;
  status?: 'draft' | 'scheduled' | 'posted' | 'failed' | 'deleted';
  platformPostId?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  viewsCount?: number;
  reach?: number;
  engagementRate?: number;
  isAiGenerated?: boolean;
  aiPrompt?: string;
  errorMessage?: string;
  metadata?: any;
}

export class SocialMediaService {
  /**
   * Create social media account
   */
  static async createAccount(account: SocialMediaAccount): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .insert({
          tenant_id: account.tenantId,
          platform: account.platform,
          account_name: account.accountName,
          account_handle: account.accountHandle,
          access_token: account.accessToken,
          refresh_token: account.refreshToken,
          token_expires_at: account.tokenExpiresAt,
          account_metadata: account.accountMetadata,
          is_active: account.isActive ?? true,
          created_by: account.createdBy,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(
          `Failed to create social media account: ${error.message}`
        );
      }

      return data.id;
    } catch (error) {
      console.error('Error creating social media account:', error);
      throw error;
    }
  }

  /**
   * Get tenant's social media accounts
   */
  static async getTenantAccounts(
    tenantId: string
  ): Promise<SocialMediaAccount[]> {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to get social media accounts: ${error.message}`
        );
      }

      return data.map(row => this.mapAccountFromDb(row));
    } catch (error) {
      console.error('Error getting social media accounts:', error);
      return [];
    }
  }

  /**
   * Update social media account
   */
  static async updateAccount(
    accountId: string,
    updates: Partial<SocialMediaAccount>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .update({
          account_name: updates.accountName,
          account_handle: updates.accountHandle,
          access_token: updates.accessToken,
          refresh_token: updates.refreshToken,
          token_expires_at: updates.tokenExpiresAt,
          account_metadata: updates.accountMetadata,
          is_active: updates.isActive,
        })
        .eq('id', accountId);

      if (error) {
        throw new Error(`Failed to update account: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      return false;
    }
  }

  /**
   * Delete social media account
   */
  static async deleteAccount(accountId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        throw new Error(`Failed to delete account: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  /**
   * Create social media post
   */
  static async createPost(post: SocialMediaPost): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .insert({
          tenant_id: post.tenantId,
          account_id: post.accountId,
          product_id: post.productId,
          workflow_id: post.workflowId,
          post_type: post.postType,
          caption: post.caption,
          media_urls: post.mediaUrls,
          hashtags: post.hashtags,
          scheduled_at: post.scheduledAt,
          posted_at: post.postedAt,
          status: post.status || 'draft',
          platform_post_id: post.platformPostId,
          is_ai_generated: post.isAiGenerated || false,
          ai_prompt: post.aiPrompt,
          metadata: post.metadata,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create post: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get tenant's social media posts
   */
  static async getTenantPosts(
    tenantId: string,
    filters?: {
      platform?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<SocialMediaPost[]> {
    try {
      let query = supabase
        .from('social_media_posts')
        .select('*, social_media_accounts(platform, account_name)')
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
        throw new Error(`Failed to get posts: ${error.message}`);
      }

      return data.map(row => this.mapPostFromDb(row));
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  /**
   * Update post analytics
   */
  static async updatePostAnalytics(
    postId: string,
    analytics: {
      likes: number;
      comments: number;
      shares: number;
      views: number;
      reach: number;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_post_analytics', {
        p_post_id: postId,
        p_likes: analytics.likes,
        p_comments: analytics.comments,
        p_shares: analytics.shares,
        p_views: analytics.views,
        p_reach: analytics.reach,
      });

      if (error) {
        throw new Error(`Failed to update post analytics: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating post analytics:', error);
      return false;
    }
  }

  /**
   * Get social media analytics summary
   */
  static async getAnalyticsSummary(
    tenantId: string,
    platform?: string,
    days: number = 30
  ) {
    try {
      const { data, error } = await supabase.rpc('get_social_media_analytics', {
        p_tenant_id: tenantId,
        p_platform: platform || null,
        p_days: days,
      });

      if (error) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Schedule post
   */
  static async schedulePost(
    postId: string,
    scheduledAt: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_media_posts')
        .update({
          scheduled_at: scheduledAt,
          status: 'scheduled',
        })
        .eq('id', postId);

      if (error) {
        throw new Error(`Failed to schedule post: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error scheduling post:', error);
      return false;
    }
  }

  /**
   * Map database row to SocialMediaAccount
   */
  private static mapAccountFromDb(row: any): SocialMediaAccount {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      platform: row.platform,
      accountName: row.account_name,
      accountHandle: row.account_handle,
      accessToken: row.access_token,
      refreshToken: row.refresh_token,
      tokenExpiresAt: row.token_expires_at,
      accountMetadata: row.account_metadata,
      isActive: row.is_active,
      createdBy: row.created_by,
    };
  }

  /**
   * Map database row to SocialMediaPost
   */
  private static mapPostFromDb(row: any): SocialMediaPost {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      accountId: row.account_id,
      productId: row.product_id,
      workflowId: row.workflow_id,
      postType: row.post_type,
      caption: row.caption,
      mediaUrls: row.media_urls,
      hashtags: row.hashtags,
      scheduledAt: row.scheduled_at,
      postedAt: row.posted_at,
      status: row.status,
      platformPostId: row.platform_post_id,
      likesCount: row.likes_count,
      commentsCount: row.comments_count,
      sharesCount: row.shares_count,
      viewsCount: row.views_count,
      reach: row.reach,
      engagementRate: row.engagement_rate,
      isAiGenerated: row.is_ai_generated,
      aiPrompt: row.ai_prompt,
      errorMessage: row.error_message,
      metadata: row.metadata,
    };
  }
}
