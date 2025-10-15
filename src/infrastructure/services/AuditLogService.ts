/**
 * AuditLogService
 * Comprehensive audit logging for all CRUD operations
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'SYNC';

export type AuditStatus = 'success' | 'failed' | 'partial';

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  tenantId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
  errorMessage?: string;
  createdAt?: string;
}

export interface AuditLogStats {
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  uniqueUsers: number;
  actionsByType: Record<string, number>;
  topResources: Array<{ resource_type: string; count: number }>;
}

export class AuditLogService {
  /**
   * Log an audit entry
   */
  static async log(entry: AuditLogEntry): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('log_audit', {
        p_user_id: entry.userId,
        p_tenant_id: entry.tenantId,
        p_action: entry.action,
        p_resource_type: entry.resourceType,
        p_resource_id: entry.resourceId,
        p_resource_name: entry.resourceName,
        p_changes: entry.changes,
        p_metadata: entry.metadata,
        p_ip_address: entry.ipAddress,
        p_user_agent: entry.userAgent || navigator.userAgent,
        p_status: entry.status || 'success',
        p_error_message: entry.errorMessage,
      });

      if (error) {
        console.error('Failed to log audit entry:', error);
        throw new Error(`Failed to log audit entry: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error logging audit entry:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
      return '';
    }
  }

  /**
   * Log CREATE operation
   */
  static async logCreate(
    resourceType: string,
    resourceId: string,
    resourceName: string,
    data: any,
    userId?: string,
    tenantId?: string
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'CREATE',
      resourceType,
      resourceId,
      resourceName,
      changes: { after: data },
      metadata: { operation: 'create' },
    });
  }

  /**
   * Log UPDATE operation
   */
  static async logUpdate(
    resourceType: string,
    resourceId: string,
    resourceName: string,
    before: any,
    after: any,
    userId?: string,
    tenantId?: string
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'UPDATE',
      resourceType,
      resourceId,
      resourceName,
      changes: { before, after },
      metadata: { operation: 'update' },
    });
  }

  /**
   * Log DELETE operation
   */
  static async logDelete(
    resourceType: string,
    resourceId: string,
    resourceName: string,
    data: any,
    userId?: string,
    tenantId?: string
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'DELETE',
      resourceType,
      resourceId,
      resourceName,
      changes: { before: data },
      metadata: { operation: 'delete' },
    });
  }

  /**
   * Log LOGIN operation
   */
  static async logLogin(
    userId: string,
    tenantId?: string,
    metadata?: any
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'LOGIN',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        ...metadata,
        loginTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Log LOGOUT operation
   */
  static async logLogout(
    userId: string,
    tenantId?: string,
    metadata?: any
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'LOGOUT',
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        ...metadata,
        logoutTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Log SYNC operation (integrations)
   */
  static async logSync(
    integration: string,
    resourceType: string,
    syncedCount: number,
    userId?: string,
    tenantId?: string,
    status: AuditStatus = 'success',
    errorMessage?: string
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'SYNC',
      resourceType,
      resourceName: integration,
      status,
      errorMessage,
      metadata: {
        integration,
        syncedCount,
        syncTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Log EXPORT operation
   */
  static async logExport(
    resourceType: string,
    exportFormat: string,
    recordCount: number,
    userId?: string,
    tenantId?: string
  ): Promise<string> {
    return this.log({
      userId,
      tenantId,
      action: 'EXPORT',
      resourceType,
      metadata: {
        format: exportFormat,
        recordCount,
        exportTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Get audit log statistics
   */
  static async getStats(
    tenantId?: string,
    hours: number = 24
  ): Promise<AuditLogStats> {
    try {
      const { data, error } = await supabase.rpc('get_audit_stats', {
        p_tenant_id: tenantId,
        p_hours: hours,
      });

      if (error) {
        throw new Error(`Failed to get audit stats: ${error.message}`);
      }

      const result = data[0];
      return {
        totalActions: parseInt(result.total_actions) || 0,
        successfulActions: parseInt(result.successful_actions) || 0,
        failedActions: parseInt(result.failed_actions) || 0,
        uniqueUsers: parseInt(result.unique_users) || 0,
        actionsByType: result.actions_by_type || {},
        topResources: result.top_resources || [],
      };
    } catch (error) {
      console.error('Error getting audit stats:', error);
      return {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        uniqueUsers: 0,
        actionsByType: {},
        topResources: [],
      };
    }
  }

  /**
   * Search audit logs
   */
  static async search(params: {
    tenantId?: string;
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase.rpc('search_audit_logs', {
        p_tenant_id: params.tenantId,
        p_user_id: params.userId,
        p_action: params.action,
        p_resource_type: params.resourceType,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_limit: params.limit || 100,
        p_offset: params.offset || 0,
      });

      if (error) {
        throw new Error(`Failed to search audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return [];
    }
  }

  /**
   * Get user activity timeline
   */
  static async getUserActivityTimeline(
    userId: string,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_activity_timeline', {
        p_user_id: userId,
        p_limit: limit,
      });

      if (error) {
        throw new Error(`Failed to get user activity: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_audit_logs');

      if (error) {
        throw new Error(`Failed to cleanup audit logs: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up audit logs:', error);
      return 0;
    }
  }

  /**
   * Get current user and tenant IDs from session
   */
  static async getCurrentContext(): Promise<{
    userId?: string;
    tenantId?: string;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return {};

      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      return {
        userId: user.id,
        tenantId: profile?.tenant_id,
      };
    } catch (error) {
      console.error('Error getting current context:', error);
      return {};
    }
  }
}
