/**
 * Supabase Integration Log Repository Implementation
 */

import { supabase } from '../client';
import {
  IIntegrationLogRepository,
  LogFilters,
  IntegrationHealthSummary,
} from '../../../../domain/repositories/IIntegrationLogRepository';
import {
  IntegrationLog,
  CreateIntegrationLogDTO,
  UpdateIntegrationLogDTO,
  IntegrationStats,
  IntegrationType,
} from '../../../../domain/entities/IntegrationLog';

export class SupabaseIntegrationLogRepository
  implements IIntegrationLogRepository
{
  private mapToEntity(data: any): IntegrationLog {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      integrationType: data.integration_type,
      operationType: data.operation_type,
      direction: data.direction,
      entityType: data.entity_type,
      entityId: data.entity_id,
      entityCount: data.entity_count || 0,
      status: data.status,
      successCount: data.success_count || 0,
      errorCount: data.error_count || 0,
      warningCount: data.warning_count || 0,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      durationMs: data.duration_ms,
      requestData: data.request_data,
      responseData: data.response_data,
      errorMessage: data.error_message,
      errorDetails: data.error_details,
      warnings: data.warnings,
      metadata: data.metadata,
      triggeredBy: data.triggered_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async getAll(
    tenantId: string,
    filters: LogFilters = {}
  ): Promise<IntegrationLog[]> {
    let query = supabase
      .from('integration_logs')
      .select('*')
      .eq('tenant_id', tenantId);

    // Apply filters
    if (filters.integrationType) {
      query = query.eq('integration_type', filters.integrationType);
    }

    if (filters.operationType) {
      query = query.eq('operation_type', filters.operationType);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 50) - 1
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return (data || []).map(item => this.mapToEntity(item));
  }

  async getById(id: string, tenantId: string): Promise<IntegrationLog | null> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error) throw error;
    return data ? this.mapToEntity(data) : null;
  }

  async create(
    data: CreateIntegrationLogDTO,
    tenantId: string,
    userId?: string
  ): Promise<IntegrationLog> {
    const { data: result, error } = await supabase
      .from('integration_logs')
      .insert({
        tenant_id: tenantId,
        integration_type: data.integrationType,
        operation_type: data.operationType,
        direction: data.direction,
        entity_type: data.entityType,
        entity_id: data.entityId,
        entity_count: data.entityCount || 0,
        status: data.status || 'pending',
        request_data: data.requestData,
        metadata: data.metadata,
        triggered_by: userId,
        started_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return this.mapToEntity(result);
  }

  async update(
    id: string,
    data: UpdateIntegrationLogDTO,
    tenantId: string
  ): Promise<IntegrationLog> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.status) updateData.status = data.status;
    if (data.successCount !== undefined)
      updateData.success_count = data.successCount;
    if (data.errorCount !== undefined) updateData.error_count = data.errorCount;
    if (data.warningCount !== undefined)
      updateData.warning_count = data.warningCount;
    if (data.completedAt) {
      updateData.completed_at = data.completedAt.toISOString();
    }
    if (data.durationMs !== undefined) updateData.duration_ms = data.durationMs;
    if (data.responseData) updateData.response_data = data.responseData;
    if (data.errorMessage) updateData.error_message = data.errorMessage;
    if (data.errorDetails) updateData.error_details = data.errorDetails;
    if (data.warnings) updateData.warnings = data.warnings;

    const { data: result, error } = await supabase
      .from('integration_logs')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select('*')
      .single();

    if (error) throw error;
    return this.mapToEntity(result);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_logs')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) throw error;
  }

  async getByIntegrationType(
    integrationType: IntegrationType,
    tenantId: string,
    limit: number = 20
  ): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('integration_type', integrationType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => this.mapToEntity(item));
  }

  async getRecentLogs(
    tenantId: string,
    hours: number = 24,
    limit: number = 50
  ): Promise<IntegrationLog[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => this.mapToEntity(item));
  }

  async getFailedLogs(
    tenantId: string,
    limit: number = 20
  ): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => this.mapToEntity(item));
  }

  async getStats(
    tenantId: string,
    integrationType: IntegrationType,
    startDate?: Date
  ): Promise<IntegrationStats> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const { data, error } = await supabase.rpc('get_integration_stats', {
      p_tenant_id: tenantId,
      p_integration_type: integrationType,
      p_start_date: start.toISOString(),
    });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        totalEntities: 0,
        successRate: 0,
        avgDurationMs: 0,
      };
    }

    const stats = data[0];
    return {
      totalSyncs: parseInt(stats.total_syncs) || 0,
      successfulSyncs: parseInt(stats.successful_syncs) || 0,
      failedSyncs: parseInt(stats.failed_syncs) || 0,
      totalEntities: parseInt(stats.total_entities) || 0,
      successRate: parseFloat(stats.success_rate) || 0,
      avgDurationMs: parseFloat(stats.avg_duration_ms) || 0,
      lastSyncAt: stats.last_sync_at ? new Date(stats.last_sync_at) : undefined,
    };
  }

  async getHealthSummary(
    tenantId: string
  ): Promise<IntegrationHealthSummary[]> {
    const { data, error } = await supabase
      .from('integration_health_summary')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;

    return (data || []).map(item => ({
      integrationType: item.integration_type,
      totalOperations: parseInt(item.total_operations) || 0,
      successful: parseInt(item.successful) || 0,
      failed: parseInt(item.failed) || 0,
      partial: parseInt(item.partial) || 0,
      avgDurationMs: parseFloat(item.avg_duration_ms) || 0,
      lastSyncAt: item.last_sync_at ? new Date(item.last_sync_at) : undefined,
      successRate: parseFloat(item.success_rate) || 0,
    }));
  }
}
