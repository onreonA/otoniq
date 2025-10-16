import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface WorkflowConfiguration {
  id: string;
  workflowId: string;
  inputSchema: any;
  outputSchema: any;
  defaultInputs: any;
  validationRules: any[];
  environmentVariables: any;
  retryConfig: {
    max_retries: number;
    retry_delay_ms: number;
  };
  timeoutMs: number;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  workflowJson: any;
  configuration: any;
  changeSummary?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface WorkflowAnalytics {
  date: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  avgDurationMs: number;
  successRate: number;
  errorRate: number;
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  triggerType: 'webhook' | 'schedule' | 'manual' | 'event';
  triggerConfig: any;
  webhookUrl?: string;
  webhookMethod?: string;
  scheduleCron?: string;
  scheduleTimezone?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  nodeName?: string;
  message: string;
  details: any;
  timestamp: string;
}

export class WorkflowDetailService {
  /**
   * Get workflow configuration
   */
  static async getConfiguration(
    workflowId: string
  ): Promise<WorkflowConfiguration | null> {
    const { data, error } = await supabase
      .from('workflow_configurations')
      .select('*')
      .eq('workflow_id', workflowId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Update workflow configuration
   */
  static async updateConfiguration(
    workflowId: string,
    config: Partial<WorkflowConfiguration>
  ): Promise<WorkflowConfiguration> {
    const { data, error } = await supabase
      .from('workflow_configurations')
      .upsert(
        {
          workflow_id: workflowId,
          input_schema: config.inputSchema,
          output_schema: config.outputSchema,
          default_inputs: config.defaultInputs,
          validation_rules: config.validationRules,
          environment_variables: config.environmentVariables,
          retry_config: config.retryConfig,
          timeout_ms: config.timeoutMs,
        },
        { onConflict: 'workflow_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get workflow versions
   */
  static async getVersions(workflowId: string): Promise<WorkflowVersion[]> {
    const { data, error } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create new version
   */
  static async createVersion(
    workflowId: string,
    workflowJson: any,
    changeSummary?: string
  ): Promise<WorkflowVersion> {
    const { data: user } = await supabase.auth.getUser();

    // Get latest version number
    const { data: versions } = await supabase
      .from('workflow_versions')
      .select('version_number')
      .eq('workflow_id', workflowId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion =
      versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Deactivate all previous versions
    await supabase
      .from('workflow_versions')
      .update({ is_active: false })
      .eq('workflow_id', workflowId);

    // Create new version
    const { data, error } = await supabase
      .from('workflow_versions')
      .insert({
        workflow_id: workflowId,
        version_number: nextVersion,
        workflow_json: workflowJson,
        change_summary: changeSummary,
        is_active: true,
        created_by: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get workflow statistics
   */
  static async getStatistics(
    workflowId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const { data, error } = await supabase.rpc('get_workflow_statistics', {
      p_workflow_id: workflowId,
      p_start_date:
        startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      p_end_date: endDate || new Date().toISOString().split('T')[0],
    });

    if (error) throw error;
    return data?.[0] || {};
  }

  /**
   * Get execution timeline
   */
  static async getExecutionTimeline(
    workflowId: string,
    days: number = 30
  ): Promise<WorkflowAnalytics[]> {
    const { data, error } = await supabase.rpc(
      'get_workflow_execution_timeline',
      {
        p_workflow_id: workflowId,
        p_days: days,
      }
    );

    if (error) throw error;
    return data || [];
  }

  /**
   * Get workflow triggers
   */
  static async getTriggers(workflowId: string): Promise<WorkflowTrigger[]> {
    const { data, error } = await supabase
      .from('workflow_triggers')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create or update trigger
   */
  static async upsertTrigger(
    workflowId: string,
    trigger: Partial<WorkflowTrigger>
  ): Promise<WorkflowTrigger> {
    const { data, error } = await supabase
      .from('workflow_triggers')
      .upsert({
        workflow_id: workflowId,
        trigger_type: trigger.triggerType,
        trigger_config: trigger.triggerConfig,
        webhook_url: trigger.webhookUrl,
        webhook_method: trigger.webhookMethod,
        schedule_cron: trigger.scheduleCron,
        schedule_timezone: trigger.scheduleTimezone,
        is_active: trigger.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get execution logs
   */
  static async getExecutionLogs(
    executionId: string,
    limit: number = 100
  ): Promise<ExecutionLog[]> {
    const { data, error } = await supabase.rpc('get_recent_execution_logs', {
      p_execution_id: executionId,
      p_limit: limit,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add execution log
   */
  static async addExecutionLog(
    executionId: string,
    workflowId: string,
    log: {
      logLevel: 'debug' | 'info' | 'warning' | 'error';
      nodeName?: string;
      message: string;
      details?: any;
    }
  ): Promise<void> {
    const { error } = await supabase.from('workflow_execution_logs').insert({
      execution_id: executionId,
      workflow_id: workflowId,
      log_level: log.logLevel,
      node_name: log.nodeName,
      message: log.message,
      details: log.details || {},
    });

    if (error) throw error;
  }

  /**
   * Get workflow dependencies
   */
  static async getDependencies(workflowId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('workflow_dependencies')
      .select(
        '*, child_workflow:n8n_workflows!child_workflow_id(id, workflow_name)'
      )
      .eq('parent_workflow_id', workflowId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Add workflow dependency
   */
  static async addDependency(
    parentWorkflowId: string,
    childWorkflowId: string,
    dependencyType: string,
    isRequired: boolean = false
  ): Promise<void> {
    const { error } = await supabase.from('workflow_dependencies').insert({
      parent_workflow_id: parentWorkflowId,
      child_workflow_id: childWorkflowId,
      dependency_type: dependencyType,
      is_required: isRequired,
    });

    if (error) throw error;
  }

  /**
   * Get workflow tags
   */
  static async getTags(workflowId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('workflow_tags')
      .select('*')
      .eq('workflow_id', workflowId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Add workflow tag
   */
  static async addTag(
    workflowId: string,
    tagName: string,
    tagColor?: string
  ): Promise<void> {
    const { error } = await supabase.from('workflow_tags').insert({
      workflow_id: workflowId,
      tag_name: tagName,
      tag_color: tagColor,
    });

    if (error) throw error;
  }

  /**
   * Remove workflow tag
   */
  static async removeTag(workflowId: string, tagName: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_tags')
      .delete()
      .eq('workflow_id', workflowId)
      .eq('tag_name', tagName);

    if (error) throw error;
  }

  /**
   * Get workflow analytics summary
   */
  static async getAnalyticsSummary(workflowId: string): Promise<{
    today: WorkflowAnalytics;
    yesterday: WorkflowAnalytics;
    last7Days: WorkflowAnalytics;
    last30Days: WorkflowAnalytics;
  }> {
    const timeline = await this.getExecutionTimeline(workflowId, 30);

    const today = timeline.find(
      t => t.date === new Date().toISOString().split('T')[0]
    ) || {
      date: new Date().toISOString().split('T')[0],
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      avgDurationMs: 0,
      successRate: 0,
      errorRate: 0,
    };

    const yesterday =
      timeline.find(
        t =>
          t.date ===
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ) || today;

    const last7Days = this.aggregateAnalytics(timeline.slice(0, 7));
    const last30Days = this.aggregateAnalytics(timeline);

    return { today, yesterday, last7Days, last30Days };
  }

  /**
   * Aggregate analytics data
   */
  private static aggregateAnalytics(
    data: WorkflowAnalytics[]
  ): WorkflowAnalytics {
    if (data.length === 0) {
      return {
        date: new Date().toISOString().split('T')[0],
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        avgDurationMs: 0,
        successRate: 0,
        errorRate: 0,
      };
    }

    const total = data.reduce((sum, d) => sum + d.totalExecutions, 0);
    const successful = data.reduce((sum, d) => sum + d.successfulExecutions, 0);
    const failed = data.reduce((sum, d) => sum + d.failedExecutions, 0);
    const avgDuration =
      data.reduce((sum, d) => sum + d.avgDurationMs, 0) / data.length;

    return {
      date: data[0].date,
      totalExecutions: total,
      successfulExecutions: successful,
      failedExecutions: failed,
      avgDurationMs: Math.round(avgDuration),
      successRate: total > 0 ? (successful / total) * 100 : 0,
      errorRate: total > 0 ? (failed / total) * 100 : 0,
    };
  }
}
