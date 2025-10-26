/**
 * Template Marketplace Service
 * Community-driven template sharing and marketplace management
 */

import { supabase } from '../database/supabase/client';
import { WorkflowTemplate } from '../../domain/entities/WorkflowTemplate';

export interface TemplateSearchFilters {
  query?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  author?: string;
  minRating?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  sortBy?: 'popular' | 'trending' | 'newest' | 'rating' | 'name';
  limit?: number;
  offset?: number;
}

export interface TemplateStats {
  downloads: number;
  likes: number;
  rating: number;
  usageCount: number;
  lastDownloaded?: Date;
  lastUsed?: Date;
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface TemplateCollection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  templateCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TemplateMarketplaceService {
  /**
   * Search templates with filters
   */
  async searchTemplates(filters: TemplateSearchFilters = {}): Promise<{
    templates: WorkflowTemplate[];
    total: number;
  }> {
    try {
      const {
        query = '',
        category,
        difficulty,
        tags,
        author,
        minRating,
        isFeatured,
        isVerified,
        sortBy = 'popular',
        limit = 20,
        offset = 0,
      } = filters;

      // Mock data for now - will be replaced with real database calls
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: '1',
          name: 'E-commerce Order Processing',
          description: 'Automated order processing workflow for e-commerce',
          category: 'ecommerce',
          difficulty: 'intermediate',
          tags: ['ecommerce', 'orders', 'automation'],
          authorName: 'John Doe',
          authorId: 'user-1',
          isPublic: true,
          isFeatured: true,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 245,
            likes: 89,
            rating: 4.8,
            usageCount: 156,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Customer Support Automation',
          description: 'Automated customer support ticket routing',
          category: 'support',
          difficulty: 'beginner',
          tags: ['support', 'automation', 'tickets'],
          authorName: 'Jane Smith',
          authorId: 'user-2',
          isPublic: true,
          isFeatured: false,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 189,
            likes: 67,
            rating: 4.6,
            usageCount: 98,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'Data Sync Workflow',
          description: 'Sync data between multiple systems',
          category: 'integration',
          difficulty: 'advanced',
          tags: ['data', 'sync', 'integration'],
          authorName: 'Mike Johnson',
          authorId: 'user-3',
          isPublic: true,
          isFeatured: true,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 156,
            likes: 45,
            rating: 4.9,
            usageCount: 78,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Apply filters to mock data
      let filteredTemplates = mockTemplates;

      if (query) {
        filteredTemplates = filteredTemplates.filter(
          template =>
            template.name.toLowerCase().includes(query.toLowerCase()) ||
            template.description.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (category) {
        filteredTemplates = filteredTemplates.filter(
          template => template.category === category
        );
      }

      if (difficulty) {
        filteredTemplates = filteredTemplates.filter(
          template => template.difficulty === difficulty
        );
      }

      if (tags && tags.length > 0) {
        filteredTemplates = filteredTemplates.filter(template =>
          tags.some(tag => template.tags.includes(tag))
        );
      }

      if (author) {
        filteredTemplates = filteredTemplates.filter(template =>
          template.authorName.toLowerCase().includes(author.toLowerCase())
        );
      }

      if (minRating) {
        filteredTemplates = filteredTemplates.filter(
          template => template.stats.rating >= minRating
        );
      }

      if (isFeatured !== undefined) {
        filteredTemplates = filteredTemplates.filter(
          template => template.isFeatured === isFeatured
        );
      }

      if (isVerified !== undefined) {
        filteredTemplates = filteredTemplates.filter(
          template => template.isVerified === isVerified
        );
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          filteredTemplates.sort(
            (a, b) => b.stats.downloads - a.stats.downloads
          );
          break;
        case 'trending':
          filteredTemplates.sort(
            (a, b) => b.stats.downloads - a.stats.downloads
          );
          break;
        case 'newest':
          filteredTemplates.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          );
          break;
        case 'rating':
          filteredTemplates.sort((a, b) => b.stats.rating - a.stats.rating);
          break;
        case 'name':
          filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }

      // Apply pagination
      const paginatedTemplates = filteredTemplates.slice(
        offset,
        offset + limit
      );

      return {
        templates: paginatedTemplates,
        total: filteredTemplates.length,
      };
    } catch (error) {
      console.error('Search templates error:', error);
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<WorkflowTemplate[]> {
    try {
      // Mock data for now - will be replaced with real database calls
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: '1',
          name: 'E-commerce Order Processing',
          description: 'Automated order processing workflow for e-commerce',
          category: 'ecommerce',
          difficulty: 'intermediate',
          tags: ['ecommerce', 'orders', 'automation'],
          authorName: 'John Doe',
          authorId: 'user-1',
          isPublic: true,
          isFeatured: true,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 245,
            likes: 89,
            rating: 4.8,
            usageCount: 156,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Customer Support Automation',
          description: 'Automated customer support ticket routing',
          category: 'support',
          difficulty: 'beginner',
          tags: ['support', 'automation', 'tickets'],
          authorName: 'Jane Smith',
          authorId: 'user-2',
          isPublic: true,
          isFeatured: false,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 189,
            likes: 67,
            rating: 4.6,
            usageCount: 98,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return mockTemplates.slice(0, limit);
    } catch (error) {
      console.error('Get popular templates error:', error);
      throw error;
    }
  }

  /**
   * Get trending templates
   */
  async getTrendingTemplates(limit: number = 10): Promise<WorkflowTemplate[]> {
    try {
      // Mock data for now - will be replaced with real database calls
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: '3',
          name: 'Data Sync Workflow',
          description: 'Sync data between multiple systems',
          category: 'integration',
          difficulty: 'advanced',
          tags: ['data', 'sync', 'integration'],
          authorName: 'Mike Johnson',
          authorId: 'user-3',
          isPublic: true,
          isFeatured: true,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 156,
            likes: 45,
            rating: 4.9,
            usageCount: 78,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          name: 'Email Marketing Automation',
          description: 'Automated email marketing campaigns',
          category: 'marketing',
          difficulty: 'intermediate',
          tags: ['email', 'marketing', 'automation'],
          authorName: 'Sarah Wilson',
          authorId: 'user-4',
          isPublic: true,
          isFeatured: true,
          isVerified: true,
          workflowData: {},
          stats: {
            downloads: 134,
            likes: 52,
            rating: 4.7,
            usageCount: 89,
            lastDownloaded: new Date(),
            lastUsed: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      return mockTemplates.slice(0, limit);
    } catch (error) {
      console.error('Get trending templates error:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId: string): Promise<WorkflowTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(
          `
          *,
          template_stats!left(*)
        `
        )
        .eq('id', templateId)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      return data ? this.mapToWorkflowTemplate(data) : null;
    } catch (error) {
      console.error('Get template by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          name: template.name,
          description: template.description,
          category: template.metadata.category,
          tags: template.metadata.tags,
          difficulty: template.metadata.difficulty,
          estimated_time: template.metadata.estimatedTime,
          author_id: template.createdBy,
          author_name: template.metadata.author,
          version: template.metadata.version,
          workflow_data: template.workflowData,
          preview_image: template.metadata.preview,
          documentation: template.metadata.documentation,
          is_public: template.isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToWorkflowTemplate(data);
    } catch (error) {
      console.error('Create template error:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<WorkflowTemplate>
  ): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.metadata?.category,
          tags: updates.metadata?.tags,
          difficulty: updates.metadata?.difficulty,
          estimated_time: updates.metadata?.estimatedTime,
          version: updates.metadata?.version,
          workflow_data: updates.workflowData,
          preview_image: updates.metadata?.preview,
          documentation: updates.metadata?.documentation,
          is_public: updates.isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToWorkflowTemplate(data);
    } catch (error) {
      console.error('Update template error:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete template error:', error);
      throw error;
    }
  }

  /**
   * Download template
   */
  async downloadTemplate(templateId: string, userId: string): Promise<void> {
    try {
      // Record download
      const { error: downloadError } = await supabase
        .from('template_downloads')
        .insert({
          template_id: templateId,
          user_id: userId,
        });

      if (downloadError) throw downloadError;

      // Update stats
      const { error: statsError } = await supabase.rpc('update_template_stats');

      if (statsError) throw statsError;
    } catch (error) {
      console.error('Download template error:', error);
      throw error;
    }
  }

  /**
   * Like/Unlike template
   */
  async toggleTemplateLike(
    templateId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('template_likes')
        .select('id')
        .eq('template_id', templateId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('template_likes')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', userId);

        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase.from('template_likes').insert({
          template_id: templateId,
          user_id: userId,
        });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Toggle template like error:', error);
      throw error;
    }
  }

  /**
   * Add template review
   */
  async addTemplateReview(
    templateId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<TemplateReview> {
    try {
      const { data, error } = await supabase
        .from('template_reviews')
        .insert({
          template_id: templateId,
          user_id: userId,
          rating,
          comment,
        })
        .select(
          `
          *,
          profiles!left(full_name)
        `
        )
        .single();

      if (error) throw error;

      return {
        id: data.id,
        templateId: data.template_id,
        userId: data.user_id,
        userName: data.profiles?.full_name || 'Anonymous',
        rating: data.rating,
        comment: data.comment,
        isVerified: data.is_verified,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Add template review error:', error);
      throw error;
    }
  }

  /**
   * Get template reviews
   */
  async getTemplateReviews(templateId: string): Promise<TemplateReview[]> {
    try {
      const { data, error } = await supabase
        .from('template_reviews')
        .select(
          `
          *,
          profiles!left(full_name)
        `
        )
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(review => ({
        id: review.id,
        templateId: review.template_id,
        userId: review.user_id,
        userName: review.profiles?.full_name || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        isVerified: review.is_verified,
        createdAt: new Date(review.created_at),
      }));
    } catch (error) {
      console.error('Get template reviews error:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<
    Array<{
      id: string;
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      templateCount: number;
    }>
  > {
    // Mock data for now - will be replaced with real database calls
    return [
      {
        id: '1',
        name: 'E-commerce',
        description: 'E-commerce and online store automation',
        icon: 'ri-store-line',
        color: '#3B82F6',
        templateCount: 45,
      },
      {
        id: '2',
        name: 'Customer Support',
        description: 'Customer support and service automation',
        icon: 'ri-customer-service-line',
        color: '#10B981',
        templateCount: 32,
      },
      {
        id: '3',
        name: 'Data Integration',
        description: 'Data sync and integration workflows',
        icon: 'ri-database-line',
        color: '#F59E0B',
        templateCount: 28,
      },
      {
        id: '4',
        name: 'Marketing',
        description: 'Marketing automation and campaigns',
        icon: 'ri-marketing-line',
        color: '#EF4444',
        templateCount: 23,
      },
      {
        id: '5',
        name: 'HR & Admin',
        description: 'Human resources and administration',
        icon: 'ri-user-line',
        color: '#8B5CF6',
        templateCount: 18,
      },
    ];
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(userId: string): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select(
          `
          *,
          template_stats!left(*)
        `
        )
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToWorkflowTemplate);
    } catch (error) {
      console.error('Get user templates error:', error);
      throw error;
    }
  }

  /**
   * Get user's downloaded templates
   */
  async getUserDownloadedTemplates(
    userId: string
  ): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('template_downloads')
        .select(
          `
          workflow_templates!inner(*),
          template_stats!left(*)
        `
        )
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(download =>
        this.mapToWorkflowTemplate(download.workflow_templates)
      );
    } catch (error) {
      console.error('Get user downloaded templates error:', error);
      throw error;
    }
  }

  /**
   * Map database record to WorkflowTemplate
   */
  private mapToWorkflowTemplate(data: any): WorkflowTemplate {
    const stats = data.template_stats || {
      downloads: 0,
      likes: 0,
      rating: 0,
      usage_count: 0,
    };

    return new WorkflowTemplate(
      data.id,
      data.name,
      data.description,
      data.workflow_data,
      {
        category: data.category,
        tags: data.tags || [],
        difficulty: data.difficulty,
        estimatedTime: data.estimated_time,
        author: data.author_name,
        version: data.version,
        description: data.description,
        preview: data.preview_image,
        documentation: data.documentation,
      },
      {
        downloads: stats.downloads,
        likes: stats.likes,
        rating: stats.rating,
        usageCount: stats.usage_count,
        lastDownloaded: stats.last_downloaded
          ? new Date(stats.last_downloaded)
          : undefined,
        lastUsed: stats.last_used ? new Date(stats.last_used) : undefined,
      },
      data.is_public,
      data.author_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}

export const templateMarketplaceService = new TemplateMarketplaceService();
