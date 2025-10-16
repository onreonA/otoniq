import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SocialMediaAccount {
  id: string;
  tenant_id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube';
  account_name: string;
  account_username: string;
  account_id: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_connected: boolean;
  profile_picture_url?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaPost {
  id: string;
  tenant_id: string;
  account_id: string;
  platform: string;
  post_type: 'feed' | 'story' | 'reel' | 'video' | 'carousel';
  caption?: string;
  media_urls?: string[];
  hashtags?: string[];
  mentions?: string[];
  scheduled_at?: string;
  published_at?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  platform_post_id?: string;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  views_count?: number;
  engagement_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  views_count: number;
  reach_count: number;
  engagement_rate: number;
  top_countries?: any;
  top_cities?: any;
  audience_demographics?: any;
  tracked_at: string;
  created_at: string;
}

export class SocialMediaService {
  /**
   * Get all social media accounts for a tenant
   */
  static async getAccounts(tenantId: string): Promise<SocialMediaAccount[]> {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching social media accounts:', error);
      throw error;
    }
  }

  /**
   * Connect a new social media account
   */
  static async connectAccount(
    tenantId: string,
    accountData: Partial<SocialMediaAccount>
  ): Promise<SocialMediaAccount> {
    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .insert({
          tenant_id: tenantId,
          ...accountData,
          is_connected: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error connecting social media account:', error);
      throw error;
    }
  }

  /**
   * Disconnect a social media account
   */
  static async disconnectAccount(accountId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .update({ is_connected: false })
        .eq('id', accountId);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting social media account:', error);
      throw error;
    }
  }

  /**
   * Get all posts for a tenant
   */
  static async getPosts(
    tenantId: string,
    filters?: {
      platform?: string;
      status?: string;
      accountId?: string;
    }
  ): Promise<SocialMediaPost[]> {
    try {
      let query = supabase
        .from('social_media_posts')
        .select('*')
        .eq('tenant_id', tenantId);

      if (filters?.platform) {
        query = query.eq('platform', filters.platform);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      throw error;
    }
  }

  /**
   * Create a new post
   */
  static async createPost(
    tenantId: string,
    postData: Partial<SocialMediaPost>
  ): Promise<SocialMediaPost> {
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .insert({
          tenant_id: tenantId,
          ...postData,
          status: postData.status || 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating social media post:', error);
      throw error;
    }
  }

  /**
   * Update a post
   */
  static async updatePost(
    postId: string,
    updates: Partial<SocialMediaPost>
  ): Promise<SocialMediaPost> {
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating social media post:', error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('social_media_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting social media post:', error);
      throw error;
    }
  }

  /**
   * Get post analytics
   */
  static async getPostAnalytics(postId: string): Promise<PostAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('social_media_post_analytics')
        .select('*')
        .eq('post_id', postId)
        .order('tracked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      throw error;
    }
  }

  /**
   * Sync account analytics
   */
  static async syncAccountAnalytics(accountId: string): Promise<void> {
    try {
      // This would integrate with platform APIs to sync analytics
      // For now, just update last_synced_at
      const { error } = await supabase
        .from('social_media_accounts')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing account analytics:', error);
      throw error;
    }
  }

  /**
   * Publish a scheduled post
   */
  static async publishPost(postId: string): Promise<SocialMediaPost> {
    try {
      // In production, this would call platform APIs to publish
      const { data, error } = await supabase
        .from('social_media_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error publishing post:', error);
      throw error;
    }
  }

  /**
   * Get account statistics
   */
  static async getAccountStats(tenantId: string): Promise<{
    totalAccounts: number;
    connectedAccounts: number;
    totalPosts: number;
    publishedPosts: number;
    scheduledPosts: number;
    totalEngagement: number;
  }> {
    try {
      const [accountsData, postsData] = await Promise.all([
        supabase
          .from('social_media_accounts')
          .select('id, is_connected')
          .eq('tenant_id', tenantId),
        supabase
          .from('social_media_posts')
          .select('id, status, likes_count, comments_count, shares_count')
          .eq('tenant_id', tenantId),
      ]);

      const accounts = accountsData.data || [];
      const posts = postsData.data || [];

      return {
        totalAccounts: accounts.length,
        connectedAccounts: accounts.filter((a) => a.is_connected).length,
        totalPosts: posts.length,
        publishedPosts: posts.filter((p) => p.status === 'published').length,
        scheduledPosts: posts.filter((p) => p.status === 'scheduled').length,
        totalEngagement: posts.reduce(
          (sum, p) =>
            sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0),
          0
        ),
      };
    } catch (error) {
      console.error('Error fetching account stats:', error);
      throw error;
    }
  }
}
