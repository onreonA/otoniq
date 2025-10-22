import { supabase } from '../database/supabase/client';

export interface SyncHistoryRecord {
  id: string;
  tenant_id: string;
  sync_type: 'products' | 'prices' | 'both';
  sync_status: 'success' | 'failed' | 'partial';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_items: number;
  successful_items: number;
  failed_items: number;
  error_message?: string;
  sync_details?: any;
}

export interface ProductMatchingRecord {
  id: string;
  tenant_id: string;
  odoo_product_id: number;
  odoo_product_name: string;
  odoo_sku?: string;
  otoniq_product_id?: string;
  otoniq_product_name?: string;
  otoniq_sku?: string;
  match_type: 'perfect' | 'sku' | 'name_similarity' | 'manual' | 'no_match';
  confidence_score?: number;
  is_imported: boolean;
  matched_at?: string;
  imported_at?: string;
}

export interface ErrorLogRecord {
  id: string;
  tenant_id: string;
  error_type: 'connection' | 'auth' | 'data_format' | 'timeout';
  error_message: string;
  error_details?: any;
  sync_id?: string;
  occurred_at: string;
  resolved_at?: string;
  is_resolved: boolean;
}

export interface PerformanceMetrics {
  id: string;
  tenant_id: string;
  metric_date: string;
  avg_response_time?: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  data_transfer_mb?: number;
}

export interface AnalyticsSummary {
  tenant_id: string;
  company_name: string;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_products: number;
  matched_products: number;
  imported_products: number;
  avg_sync_time: number;
  total_errors: number;
  connection_errors: number;
  auth_errors: number;
  data_format_errors: number;
  timeout_errors: number;
}

export class OdooAnalyticsService {
  // Sync History Methods
  static async recordSyncStart(
    tenantId: string,
    syncType: 'products' | 'prices' | 'both'
  ): Promise<string> {
    const { data, error } = await supabase
      .from('odoo_sync_history')
      .insert({
        tenant_id: tenantId,
        sync_type: syncType,
        sync_status: 'partial',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording sync start:', error);
      throw error;
    }

    return data.id;
  }

  static async recordSyncComplete(
    syncId: string,
    status: 'success' | 'failed' | 'partial',
    totalItems: number = 0,
    successfulItems: number = 0,
    failedItems: number = 0,
    errorMessage?: string,
    syncDetails?: any
  ): Promise<void> {
    const completedAt = new Date().toISOString();

    // Calculate duration
    const { data: syncRecord } = await supabase
      .from('odoo_sync_history')
      .select('started_at')
      .eq('id', syncId)
      .single();

    let durationSeconds = 0;
    if (syncRecord?.started_at) {
      const startTime = new Date(syncRecord.started_at);
      const endTime = new Date(completedAt);
      durationSeconds = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      );
    }

    const { error } = await supabase
      .from('odoo_sync_history')
      .update({
        sync_status: status,
        completed_at: completedAt,
        duration_seconds: durationSeconds,
        total_items: totalItems,
        successful_items: successfulItems,
        failed_items: failedItems,
        error_message: errorMessage,
        sync_details: syncDetails,
      })
      .eq('id', syncId);

    if (error) {
      console.error('Error recording sync completion:', error);
      throw error;
    }
  }

  // Product Matching Methods
  static async recordProductMatch(
    tenantId: string,
    odooProduct: any,
    otoniqProduct: any,
    matchType: 'perfect' | 'sku' | 'name_similarity' | 'manual' | 'no_match',
    confidenceScore?: number
  ): Promise<string> {
    const { data, error } = await supabase
      .from('odoo_product_matching')
      .insert({
        tenant_id: tenantId,
        odoo_product_id: odooProduct.id,
        odoo_product_name: odooProduct.name,
        odoo_sku: odooProduct.default_code,
        otoniq_product_id: otoniqProduct?.id,
        otoniq_product_name: otoniqProduct?.name,
        otoniq_sku: otoniqProduct?.sku,
        match_type: matchType,
        confidence_score: confidenceScore,
        matched_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error recording product match:', error);
      throw error;
    }

    return data.id;
  }

  static async markProductAsImported(matchingId: string): Promise<void> {
    const { error } = await supabase
      .from('odoo_product_matching')
      .update({
        is_imported: true,
        imported_at: new Date().toISOString(),
      })
      .eq('id', matchingId);

    if (error) {
      console.error('Error marking product as imported:', error);
      throw error;
    }
  }

  // Error Logging Methods
  static async logError(
    tenantId: string,
    errorType: 'connection' | 'auth' | 'data_format' | 'timeout',
    errorMessage: string,
    errorDetails?: any,
    syncId?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('odoo_error_logs')
      .insert({
        tenant_id: tenantId,
        error_type: errorType,
        error_message: errorMessage,
        error_details: errorDetails,
        sync_id: syncId,
        occurred_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging error:', error);
      throw error;
    }

    return data.id;
  }

  // Performance Metrics Methods
  static async recordPerformanceMetrics(
    tenantId: string,
    avgResponseTime: number,
    totalRequests: number,
    successfulRequests: number,
    failedRequests: number,
    dataTransferMB: number
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('odoo_performance_metrics').upsert({
      tenant_id: tenantId,
      metric_date: today,
      avg_response_time: avgResponseTime,
      total_requests: totalRequests,
      successful_requests: successfulRequests,
      failed_requests: failedRequests,
      data_transfer_mb: dataTransferMB,
    });

    if (error) {
      console.error('Error recording performance metrics:', error);
      throw error;
    }
  }

  // Analytics Methods
  static async getAnalyticsSummary(
    tenantId: string
  ): Promise<AnalyticsSummary | null> {
    const { data, error } = await supabase
      .from('odoo_analytics_summary')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching analytics summary:', error);
      return null;
    }

    return data;
  }

  static async getSyncHistory(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<SyncHistoryRecord[]> {
    const { data, error } = await supabase
      .from('odoo_sync_history')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }

    return data || [];
  }

  static async getProductMatching(
    tenantId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ProductMatchingRecord[]> {
    const { data, error } = await supabase
      .from('odoo_product_matching')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching product matching:', error);
      return [];
    }

    return data || [];
  }

  static async getErrorLogs(
    tenantId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ErrorLogRecord[]> {
    const { data, error } = await supabase
      .from('odoo_error_logs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching error logs:', error);
      return [];
    }

    return data || [];
  }

  static async getPerformanceMetrics(
    tenantId: string,
    days: number = 30
  ): Promise<PerformanceMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('odoo_performance_metrics')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false });

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }

    return data || [];
  }

  // Weekly Sync Statistics
  static async getWeeklySyncStats(tenantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('odoo_sync_history')
      .select('started_at, sync_status')
      .eq('tenant_id', tenantId)
      .gte(
        'started_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('started_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly sync stats:', error);
      return [];
    }

    // Group by date and calculate stats
    const dailyStats: {
      [key: string]: { syncs: number; success: number; failed: number };
    } = {};

    data?.forEach(record => {
      const date = record.started_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { syncs: 0, success: 0, failed: 0 };
      }

      dailyStats[date].syncs++;
      if (record.status === 'success') {
        dailyStats[date].success++;
      } else if (record.status === 'failed') {
        dailyStats[date].failed++;
      }
    });

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      syncs: stats.syncs,
      success: stats.success,
      failed: stats.failed,
    }));
  }

  // Error Type Statistics
  static async getErrorTypeStats(
    tenantId: string
  ): Promise<{ [key: string]: number }> {
    const { data, error } = await supabase
      .from('odoo_error_logs')
      .select('error_type')
      .eq('tenant_id', tenantId)
      .gte(
        'occurred_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (error) {
      console.error('Error fetching error type stats:', error);
      return {};
    }

    const errorCounts: { [key: string]: number } = {};
    data?.forEach(record => {
      errorCounts[record.error_type] =
        (errorCounts[record.error_type] || 0) + 1;
    });

    return errorCounts;
  }
}
