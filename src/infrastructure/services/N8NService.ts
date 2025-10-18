/**
 * N8NService
 * Service for managing N8N workflows and executions
 */

import axios, { AxiosInstance } from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface N8NWorkflow {
  id?: string;
  tenantId: string;
  workflowName: string;
  workflowDescription?: string;
  n8nWorkflowId?: string;
  workflowJson?: any;
  triggerType: 'manual' | 'webhook' | 'cron' | 'event';
  triggerConfig?: any;
  webhookUrl?: string;
  isActive?: boolean;
  executionCount?: number;
  lastExecutionAt?: string;
  lastExecutionStatus?: 'success' | 'failed' | 'running' | 'waiting';
  createdBy?: string;
  metadata?: any;
}

export interface N8NExecution {
  id?: string;
  workflowId: string;
  tenantId: string;
  n8nExecutionId: string;
  triggerType: string;
  triggerData?: any;
  status: 'running' | 'success' | 'failed' | 'waiting' | 'canceled';
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  executionData?: any;
  stepsCompleted?: number;
  stepsTotal?: number;
  outputData?: any;
}

export interface N8NCredential {
  id?: string;
  tenantId: string;
  credentialName: string;
  credentialType: string;
  credentialData: any;
  n8nCredentialId?: string;
  isActive?: boolean;
  createdBy?: string;
}

export class N8NService {
  private static apiClient: AxiosInstance | null = null;

  /**
   * Initialize N8N API client
   */
  private static getApiClient(): AxiosInstance {
    if (!this.apiClient) {
      const baseURL =
        import.meta.env.VITE_N8N_API_URL || 'http://localhost:5678';
      const apiKey = import.meta.env.VITE_N8N_API_KEY;

      this.apiClient = axios.create({
        baseURL: `${baseURL}/api/v1`,
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json',
        },
      });
    }

    return this.apiClient;
  }

  /**
   * Create a workflow in database
   */
  static async createWorkflow(workflow: N8NWorkflow): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .insert({
          tenant_id: workflow.tenantId,
          workflow_name: workflow.workflowName,
          workflow_description: workflow.workflowDescription,
          n8n_workflow_id: workflow.n8nWorkflowId,
          workflow_json: workflow.workflowJson,
          trigger_type: workflow.triggerType,
          trigger_config: workflow.triggerConfig,
          webhook_url: workflow.webhookUrl,
          is_active: workflow.isActive ?? true,
          created_by: workflow.createdBy,
          metadata: workflow.metadata,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create workflow: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Update workflow in database
   */
  static async updateWorkflow(
    workflowId: string,
    updates: Partial<N8NWorkflow>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('n8n_workflows')
        .update({
          workflow_name: updates.workflowName,
          workflow_description: updates.workflowDescription,
          n8n_workflow_id: updates.n8nWorkflowId,
          workflow_json: updates.workflowJson,
          trigger_type: updates.triggerType,
          trigger_config: updates.triggerConfig,
          webhook_url: updates.webhookUrl,
          is_active: updates.isActive,
          metadata: updates.metadata,
        })
        .eq('id', workflowId);

      if (error) {
        throw new Error(`Failed to update workflow: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating workflow:', error);
      return false;
    }
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflow(workflowId: string): Promise<N8NWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) {
        throw new Error(`Failed to get workflow: ${error.message}`);
      }

      return this.mapWorkflowFromDb(data);
    } catch (error) {
      console.error('Error getting workflow:', error);
      return null;
    }
  }

  /**
   * Get all workflows for a tenant
   */
  static async getTenantWorkflows(tenantId: string): Promise<N8NWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get workflows: ${error.message}`);
      }

      return data.map(row => this.mapWorkflowFromDb(row));
    } catch (error) {
      console.error('Error getting workflows:', error);
      return [];
    }
  }

  /**
   * Delete workflow
   */
  static async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('n8n_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) {
        throw new Error(`Failed to delete workflow: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return false;
    }
  }

  /**
   * Trigger workflow execution (webhook or manual)
   */
  static async executeWorkflow(
    workflowId: string,
    inputData?: any
  ): Promise<string> {
    try {
      // Get workflow from database
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // If N8N workflow ID exists, trigger via N8N API
      if (workflow.n8nWorkflowId) {
        const client = this.getApiClient();
        const response = await client.post(
          `/workflows/${workflow.n8nWorkflowId}/execute`,
          { data: inputData }
        );

        const n8nExecutionId = response.data.id;

        // Record execution in database
        const { data, error } = await supabase
          .from('n8n_executions')
          .insert({
            workflow_id: workflowId,
            tenant_id: workflow.tenantId,
            n8n_execution_id: n8nExecutionId,
            trigger_type: 'manual',
            trigger_data: inputData,
            status: 'running',
          })
          .select('id')
          .single();

        if (error) {
          throw new Error(`Failed to record execution: ${error.message}`);
        }

        return data.id;
      }

      // If webhook URL exists, trigger via webhook
      if (workflow.webhookUrl) {
        const response = await axios.post(workflow.webhookUrl, inputData);

        // Record execution in database
        const { data, error } = await supabase
          .from('n8n_executions')
          .insert({
            workflow_id: workflowId,
            tenant_id: workflow.tenantId,
            n8n_execution_id: `webhook_${Date.now()}`,
            trigger_type: 'webhook',
            trigger_data: inputData,
            status: 'running',
          })
          .select('id')
          .single();

        if (error) {
          throw new Error(`Failed to record execution: ${error.message}`);
        }

        return data.id;
      }

      throw new Error('Workflow has no execution method configured');
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  /**
   * Sync execution status from N8N and update database
   */
  static async syncExecutionStatus(executionId: string): Promise<N8NExecution> {
    try {
      // Get execution from database
      const { data: execution, error: fetchError } = await supabase
        .from('n8n_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (fetchError || !execution) {
        throw new Error('Execution not found');
      }

      // Get status from N8N API
      const client = this.getApiClient();
      const response = await client.get(
        `/executions/${execution.n8n_execution_id}`
      );

      const n8nExecution = response.data;
      const status = n8nExecution.finished
        ? n8nExecution.data.resultData.error
          ? 'failed'
          : 'success'
        : 'running';

      // Update database
      const { data: updated, error: updateError } = await supabase
        .from('n8n_executions')
        .update({
          status,
          finished_at: n8nExecution.stoppedAt,
          duration_ms: n8nExecution.stoppedAt
            ? new Date(n8nExecution.stoppedAt).getTime() -
              new Date(execution.started_at).getTime()
            : null,
          execution_data: n8nExecution.data,
          output_data: n8nExecution.data.resultData,
          error_message: n8nExecution.data.resultData.error?.message,
        })
        .eq('id', executionId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update execution: ${updateError.message}`);
      }

      return updated as N8NExecution;
    } catch (error) {
      console.error('Error syncing execution status:', error);
      throw error;
    }
  }

  /**
   * Get execution status from N8N
   */
  static async getExecutionStatus(
    executionId: string
  ): Promise<N8NExecution | null> {
    try {
      const { data, error } = await supabase
        .from('n8n_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) {
        throw new Error(`Failed to get execution: ${error.message}`);
      }

      // If N8N execution ID exists, fetch latest status from N8N
      if (
        data.n8n_execution_id &&
        !data.n8n_execution_id.startsWith('webhook_')
      ) {
        try {
          const client = this.getApiClient();
          const response = await client.get(
            `/executions/${data.n8n_execution_id}`
          );

          // Update execution status in database
          await supabase
            .from('n8n_executions')
            .update({
              status: response.data.finished ? 'success' : 'running',
              finished_at: response.data.stoppedAt,
              duration_ms: response.data.duration,
              execution_data: response.data,
            })
            .eq('id', executionId);

          return this.mapExecutionFromDb({ ...data, ...response.data });
        } catch (n8nError) {
          console.error('Error fetching from N8N:', n8nError);
          // Return database data if N8N fetch fails
        }
      }

      return this.mapExecutionFromDb(data);
    } catch (error) {
      console.error('Error getting execution status:', error);
      return null;
    }
  }

  /**
   * Get execution history for a workflow
   */
  static async getExecutionHistory(
    workflowId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<N8NExecution[]> {
    try {
      const { data, error } = await supabase.rpc('get_execution_history', {
        p_workflow_id: workflowId,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) {
        throw new Error(`Failed to get execution history: ${error.message}`);
      }

      return data.map((row: any) => this.mapExecutionFromDb(row));
    } catch (error) {
      console.error('Error getting execution history:', error);
      return [];
    }
  }

  /**
   * Get workflow statistics
   */
  static async getWorkflowStats(
    workflowId?: string,
    tenantId?: string,
    days: number = 30
  ) {
    try {
      const { data, error } = await supabase.rpc('get_workflow_stats', {
        p_workflow_id: workflowId,
        p_tenant_id: tenantId,
        p_days: days,
      });

      if (error) {
        throw new Error(`Failed to get workflow stats: ${error.message}`);
      }

      return data[0];
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      return null;
    }
  }

  /**
   * Create credential in database
   */
  static async createCredential(credential: N8NCredential): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('n8n_credentials')
        .insert({
          tenant_id: credential.tenantId,
          credential_name: credential.credentialName,
          credential_type: credential.credentialType,
          credential_data: credential.credentialData,
          n8n_credential_id: credential.n8nCredentialId,
          is_active: credential.isActive ?? true,
          created_by: credential.createdBy,
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to create credential: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error creating credential:', error);
      throw error;
    }
  }

  /**
   * Get tenant credentials
   */
  static async getTenantCredentials(
    tenantId: string
  ): Promise<N8NCredential[]> {
    try {
      const { data, error } = await supabase
        .from('n8n_credentials')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to get credentials: ${error.message}`);
      }

      return data.map(row => this.mapCredentialFromDb(row));
    } catch (error) {
      console.error('Error getting credentials:', error);
      return [];
    }
  }

  /**
   * Map database row to N8NWorkflow
   */
  private static mapWorkflowFromDb(row: any): N8NWorkflow {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      workflowName: row.workflow_name,
      workflowDescription: row.workflow_description,
      n8nWorkflowId: row.n8n_workflow_id,
      workflowJson: row.workflow_json,
      triggerType: row.trigger_type,
      triggerConfig: row.trigger_config,
      webhookUrl: row.webhook_url,
      isActive: row.is_active,
      executionCount: row.execution_count,
      lastExecutionAt: row.last_execution_at,
      lastExecutionStatus: row.last_execution_status,
      createdBy: row.created_by,
      metadata: row.metadata,
    };
  }

  /**
   * Map database row to N8NExecution
   */
  private static mapExecutionFromDb(row: any): N8NExecution {
    return {
      id: row.id,
      workflowId: row.workflow_id,
      tenantId: row.tenant_id,
      n8nExecutionId: row.n8n_execution_id,
      triggerType: row.trigger_type,
      triggerData: row.trigger_data,
      status: row.status,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      durationMs: row.duration_ms,
      errorMessage: row.error_message,
      executionData: row.execution_data,
      stepsCompleted: row.steps_completed,
      stepsTotal: row.steps_total,
      outputData: row.output_data,
    };
  }

  /**
   * Map database row to N8NCredential
   */
  private static mapCredentialFromDb(row: any): N8NCredential {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      credentialName: row.credential_name,
      credentialType: row.credential_type,
      credentialData: row.credential_data,
      n8nCredentialId: row.n8n_credential_id,
      isActive: row.is_active,
      createdBy: row.created_by,
    };
  }

  /**
   * Trigger workflow directly via webhook URL
   * Used for Daily Report and Low Stock Alert workflows
   */
  static async triggerWebhook(
    webhookUrl: string,
    data: any
  ): Promise<{ success: boolean; executionId?: string; error?: string }> {
    try {
      const response = await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds
      });

      return {
        success: true,
        executionId: response.data?.executionId || `webhook_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('Error triggering webhook:', error);
      return {
        success: false,
        error: error.message || 'Unknown webhook error',
      };
    }
  }

  /**
   * Trigger Daily Report workflow
   */
  static async triggerDailyReport(tenantId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const workflows = await this.getTenantWorkflows(tenantId);
      const dailyReportWorkflow = workflows.find(
        w => w.n8nWorkflowId === 'daily-sales-report-n8n'
      );

      if (!dailyReportWorkflow || !dailyReportWorkflow.webhookUrl) {
        return {
          success: false,
          message: 'Daily Report workflow not configured',
        };
      }

      const result = await this.triggerWebhook(dailyReportWorkflow.webhookUrl, {
        tenantId,
        reportDate: new Date().toISOString().split('T')[0],
        trigger: 'manual',
      });

      return {
        success: result.success,
        message: result.success
          ? 'Daily report is being generated...'
          : result.error || 'Failed to trigger daily report',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error triggering daily report',
      };
    }
  }

  /**
   * Trigger Low Stock Alert workflow
   */
  static async triggerLowStockAlert(
    tenantId: string,
    threshold?: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const workflows = await this.getTenantWorkflows(tenantId);
      const lowStockWorkflow = workflows.find(
        w => w.n8nWorkflowId === 'low-stock-alert-n8n'
      );

      if (!lowStockWorkflow || !lowStockWorkflow.webhookUrl) {
        return {
          success: false,
          message: 'Low Stock Alert workflow not configured',
        };
      }

      const result = await this.triggerWebhook(lowStockWorkflow.webhookUrl, {
        tenantId,
        threshold: threshold || 10,
        trigger: 'manual',
        checkDate: new Date().toISOString(),
      });

      return {
        success: result.success,
        message: result.success
          ? 'Checking stock levels...'
          : result.error || 'Failed to trigger stock check',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error triggering stock alert',
      };
    }
  }
}
