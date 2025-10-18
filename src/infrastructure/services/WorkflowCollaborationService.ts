/**
 * Workflow Collaboration Service
 * Team management and workflow collaboration
 */

import { supabase } from '../database/supabase/client';

export interface WorkflowTeam {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  teamType:
    | 'development'
    | 'operations'
    | 'analytics'
    | 'management'
    | 'custom';
  color: string;
  icon: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'contributor';
  permissions: any;
  joinedAt: Date;
  invitedBy?: string;
  isActive: boolean;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkflowSharing {
  id: string;
  workflowId: string;
  sharedBy: string;
  sharedWithUserId?: string;
  sharedWithTeamId?: string;
  permissionLevel: 'view' | 'edit' | 'admin' | 'owner';
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowComment {
  id: string;
  workflowId: string;
  userId: string;
  parentCommentId?: string;
  content: string;
  commentType:
    | 'general'
    | 'suggestion'
    | 'question'
    | 'bug_report'
    | 'feature_request';
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  mentions: string[];
  attachments: any[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkflowActivity {
  id: string;
  workflowId: string;
  userId: string;
  activityType:
    | 'created'
    | 'updated'
    | 'deleted'
    | 'executed'
    | 'shared'
    | 'commented'
    | 'approved'
    | 'rejected'
    | 'published'
    | 'archived'
    | 'restored';
  activityDescription: string;
  metadata: any;
  createdAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkflowReview {
  id: string;
  workflowId: string;
  reviewerId: string;
  reviewType:
    | 'code_review'
    | 'security_review'
    | 'performance_review'
    | 'compliance_review';
  status: 'pending' | 'approved' | 'rejected' | 'needs_changes';
  reviewNotes?: string;
  feedback: any;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkflowApproval {
  id: string;
  workflowId: string;
  approverId: string;
  approvalType: 'deployment' | 'publish' | 'share' | 'delete' | 'modify';
  status: 'pending' | 'approved' | 'rejected';
  approvalNotes?: string;
  approvedAt?: Date;
  createdAt: Date;
  approver?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export interface WorkflowNotification {
  id: string;
  userId: string;
  workflowId?: string;
  notificationType:
    | 'workflow_shared'
    | 'workflow_updated'
    | 'workflow_executed'
    | 'workflow_failed'
    | 'comment_added'
    | 'review_requested'
    | 'approval_requested'
    | 'approval_granted'
    | 'team_invitation'
    | 'permission_changed';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata: any;
  createdAt: Date;
}

export interface TeamWorkflowTemplate {
  id: string;
  teamId: string;
  templateName: string;
  templateDescription?: string;
  workflowData: any;
  category?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
}

export class WorkflowCollaborationService {
  /**
   * Get all teams for tenant
   */
  async getTeams(tenantId: string): Promise<WorkflowTeam[]> {
    try {
      // Mock data for now - will be replaced with real database calls
      return [
        {
          id: '1',
          tenantId: tenantId,
          name: 'Development Team',
          description: 'Core development team for workflow automation',
          teamType: 'development',
          color: '#3B82F6',
          icon: 'ri-code-line',
          isActive: true,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          tenantId: tenantId,
          name: 'Operations Team',
          description: 'Operations and monitoring team',
          teamType: 'operations',
          color: '#10B981',
          icon: 'ri-settings-line',
          isActive: true,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } catch (error) {
      console.error('Get teams error:', error);
      throw error;
    }
  }

  /**
   * Create a new team
   */
  async createTeam(
    teamData: Omit<WorkflowTeam, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowTeam> {
    try {
      const { data, error } = await supabase
        .from('workflow_teams')
        .insert({
          tenant_id: teamData.tenantId,
          name: teamData.name,
          description: teamData.description,
          team_type: teamData.teamType,
          color: teamData.color,
          icon: teamData.icon,
          is_active: teamData.isActive,
          created_by: teamData.createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        description: data.description,
        teamType: data.team_type,
        color: data.color,
        icon: data.icon,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Create team error:', error);
      throw error;
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_team_members')
        .select(
          `
          *,
          user:profiles!workflow_team_members_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        teamId: member.team_id,
        userId: member.user_id,
        role: member.role,
        permissions: member.permissions,
        joinedAt: new Date(member.joined_at),
        invitedBy: member.invited_by,
        isActive: member.is_active,
        createdAt: new Date(member.created_at),
        user: member.user
          ? {
              id: member.user.id,
              fullName: member.user.full_name,
              email: member.user.email,
              avatar: member.user.avatar_url,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Get team members error:', error);
      throw error;
    }
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    role: TeamMember['role'],
    invitedBy: string
  ): Promise<TeamMember> {
    try {
      const { data, error } = await supabase
        .from('workflow_team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
          invited_by: invitedBy,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        teamId: data.team_id,
        userId: data.user_id,
        role: data.role,
        permissions: data.permissions,
        joinedAt: new Date(data.joined_at),
        invitedBy: data.invited_by,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Add team member error:', error);
      throw error;
    }
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_team_members')
        .update({ is_active: false })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove team member error:', error);
      throw error;
    }
  }

  /**
   * Share workflow with user or team
   */
  async shareWorkflow(
    workflowId: string,
    sharedBy: string,
    sharedWithUserId?: string,
    sharedWithTeamId?: string,
    permissionLevel: WorkflowSharing['permissionLevel'] = 'view',
    expiresAt?: Date
  ): Promise<WorkflowSharing> {
    try {
      const { data, error } = await supabase
        .from('workflow_sharing')
        .insert({
          workflow_id: workflowId,
          shared_by: sharedBy,
          shared_with_user_id: sharedWithUserId,
          shared_with_team_id: sharedWithTeamId,
          permission_level: permissionLevel,
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        workflowId: data.workflow_id,
        sharedBy: data.shared_by,
        sharedWithUserId: data.shared_with_user_id,
        sharedWithTeamId: data.shared_with_team_id,
        permissionLevel: data.permission_level,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Share workflow error:', error);
      throw error;
    }
  }

  /**
   * Get workflow comments
   */
  async getWorkflowComments(workflowId: string): Promise<WorkflowComment[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_comments')
        .select(
          `
          *,
          user:profiles!workflow_comments_user_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(comment => ({
        id: comment.id,
        workflowId: comment.workflow_id,
        userId: comment.user_id,
        parentCommentId: comment.parent_comment_id,
        content: comment.content,
        commentType: comment.comment_type,
        isResolved: comment.is_resolved,
        resolvedBy: comment.resolved_by,
        resolvedAt: comment.resolved_at
          ? new Date(comment.resolved_at)
          : undefined,
        mentions: comment.mentions || [],
        attachments: comment.attachments || [],
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
        user: comment.user
          ? {
              id: comment.user.id,
              fullName: comment.user.full_name,
              email: comment.user.email,
              avatar: comment.user.avatar_url,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Get workflow comments error:', error);
      throw error;
    }
  }

  /**
   * Add comment to workflow
   */
  async addComment(
    workflowId: string,
    userId: string,
    content: string,
    commentType: WorkflowComment['commentType'] = 'general',
    parentCommentId?: string,
    mentions: string[] = [],
    attachments: any[] = []
  ): Promise<WorkflowComment> {
    try {
      const { data, error } = await supabase
        .from('workflow_comments')
        .insert({
          workflow_id: workflowId,
          user_id: userId,
          content,
          comment_type: commentType,
          parent_comment_id: parentCommentId,
          mentions,
          attachments,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        workflowId: data.workflow_id,
        userId: data.user_id,
        parentCommentId: data.parent_comment_id,
        content: data.content,
        commentType: data.comment_type,
        isResolved: data.is_resolved,
        resolvedBy: data.resolved_by,
        resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
        mentions: data.mentions || [],
        attachments: data.attachments || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }

  /**
   * Get workflow activity feed
   */
  async getWorkflowActivity(
    workflowId: string,
    limit: number = 50
  ): Promise<WorkflowActivity[]> {
    try {
      const { data, error } = await supabase.rpc('get_workflow_activity_feed', {
        p_workflow_id: workflowId,
        p_limit: limit,
      });

      if (error) throw error;

      return (data || []).map(activity => ({
        id: activity.id,
        workflowId: workflowId,
        userId: activity.user_id,
        activityType: activity.activity_type,
        activityDescription: activity.activity_description,
        metadata: activity.metadata,
        createdAt: new Date(activity.created_at),
        user: activity.user_name
          ? {
              id: activity.user_id,
              fullName: activity.user_name,
              email: activity.user_email,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Get workflow activity error:', error);
      throw error;
    }
  }

  /**
   * Log workflow activity
   */
  async logActivity(
    workflowId: string,
    userId: string,
    activityType: WorkflowActivity['activityType'],
    activityDescription: string,
    metadata: any = {}
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_workflow_activity', {
        p_workflow_id: workflowId,
        p_user_id: userId,
        p_activity_type: activityType,
        p_activity_description: activityDescription,
        p_metadata: metadata,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Log activity error:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20
  ): Promise<WorkflowNotification[]> {
    try {
      // Mock data for now - will be replaced with real database calls
      return [
        {
          id: '1',
          userId: userId,
          workflowId: 'workflow-1',
          notificationType: 'workflow_shared',
          title: 'Workflow Shared',
          message: 'A new workflow has been shared with you',
          isRead: false,
          readAt: null,
          actionUrl: '/workflows/workflow-1',
          metadata: {},
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: userId,
          workflowId: 'workflow-2',
          notificationType: 'team_invitation',
          title: 'Team Invitation',
          message: 'You have been invited to join a team',
          isRead: true,
          readAt: new Date(),
          actionUrl: '/teams/team-1',
          metadata: {},
          createdAt: new Date(),
        },
      ];
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Get workflow collaborators
   */
  async getWorkflowCollaborators(workflowId: string): Promise<
    Array<{
      userId: string;
      userName: string;
      userEmail: string;
      role: string;
      permissionLevel: string;
      joinedAt: Date;
    }>
  > {
    try {
      const { data, error } = await supabase.rpc('get_workflow_collaborators', {
        p_workflow_id: workflowId,
      });

      if (error) throw error;

      return (data || []).map(collaborator => ({
        userId: collaborator.user_id,
        userName: collaborator.user_name,
        userEmail: collaborator.user_email,
        role: collaborator.role,
        permissionLevel: collaborator.permission_level,
        joinedAt: new Date(collaborator.joined_at),
      }));
    } catch (error) {
      console.error('Get workflow collaborators error:', error);
      throw error;
    }
  }

  /**
   * Create team invitation
   */
  async createTeamInvitation(
    teamId: string,
    invitedUserId: string,
    role: TeamMember['role'],
    invitedBy: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_team_invitation', {
        p_team_id: teamId,
        p_invited_user_id: invitedUserId,
        p_role: role,
        p_invited_by: invitedBy,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Create team invitation error:', error);
      throw error;
    }
  }

  /**
   * Get team workflow templates
   */
  async getTeamTemplates(teamId: string): Promise<TeamWorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('team_workflow_templates')
        .select(
          `
          *,
          creator:profiles!team_workflow_templates_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `
        )
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(template => ({
        id: template.id,
        teamId: template.team_id,
        templateName: template.template_name,
        templateDescription: template.template_description,
        workflowData: template.workflow_data,
        category: template.category,
        tags: template.tags || [],
        isPublic: template.is_public,
        usageCount: template.usage_count,
        createdBy: template.created_by,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at),
        creator: template.creator
          ? {
              id: template.creator.id,
              fullName: template.creator.full_name,
              email: template.creator.email,
              avatar: template.creator.avatar_url,
            }
          : undefined,
      }));
    } catch (error) {
      console.error('Get team templates error:', error);
      throw error;
    }
  }

  /**
   * Create team template
   */
  async createTeamTemplate(
    teamId: string,
    templateName: string,
    templateDescription: string,
    workflowData: any,
    createdBy: string,
    category?: string,
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<TeamWorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('team_workflow_templates')
        .insert({
          team_id: teamId,
          template_name: templateName,
          template_description: templateDescription,
          workflow_data: workflowData,
          category,
          tags,
          is_public: isPublic,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        teamId: data.team_id,
        templateName: data.template_name,
        templateDescription: data.template_description,
        workflowData: data.workflow_data,
        category: data.category,
        tags: data.tags || [],
        isPublic: data.is_public,
        usageCount: data.usage_count,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Create team template error:', error);
      throw error;
    }
  }
}

export const workflowCollaborationService = new WorkflowCollaborationService();
