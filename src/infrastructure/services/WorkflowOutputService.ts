import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface WorkflowOutput {
  id: string;
  tenantId: string;
  workflowId: string | null;
  executionId: string | null;
  outputType:
    | 'report'
    | 'image'
    | 'video'
    | 'email'
    | 'document'
    | 'data'
    | 'other';
  fileName: string;
  fileUrl: string | null;
  fileSize: number | null;
  mimeType: string | null;
  outputData: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  // Joined data
  workflowName?: string;
  executionStatus?: string;
}

export class WorkflowOutputService {
  /**
   * Get all workflow outputs for a tenant
   */
  static async getTenantOutputs(
    tenantId: string,
    filters?: {
      workflowId?: string;
      outputType?: string;
      searchQuery?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<WorkflowOutput[]> {
    try {
      let query = supabase
        .from('workflow_outputs')
        .select(
          `
          *,
          n8n_workflows!workflow_id (
            workflow_name
          ),
          n8n_executions!execution_id (
            status
          )
        `
        )
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.workflowId && filters.workflowId !== 'all') {
        query = query.eq('workflow_id', filters.workflowId);
      }

      if (filters?.outputType && filters.outputType !== 'all') {
        query = query.eq('output_type', filters.outputType);
      }

      if (filters?.searchQuery) {
        query = query.ilike('file_name', `%${filters.searchQuery}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workflow outputs:', error);
        throw error;
      }

      // Map the joined data
      return (data || []).map((output: any) => ({
        id: output.id,
        tenantId: output.tenant_id,
        workflowId: output.workflow_id,
        executionId: output.execution_id,
        outputType: output.output_type,
        fileName: output.file_name,
        fileUrl: output.file_url,
        fileSize: output.file_size,
        mimeType: output.mime_type,
        outputData: output.output_data,
        metadata: output.metadata,
        createdAt: output.created_at,
        updatedAt: output.updated_at,
        workflowName: output.n8n_workflows?.workflow_name || 'Unknown Workflow',
        executionStatus: output.n8n_executions?.status || 'unknown',
      }));
    } catch (error) {
      console.error('Error in getTenantOutputs:', error);
      throw error;
    }
  }

  /**
   * Get outputs for a specific workflow
   */
  static async getWorkflowOutputs(
    workflowId: string,
    limit = 50
  ): Promise<WorkflowOutput[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_outputs')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((output: any) => ({
        id: output.id,
        tenantId: output.tenant_id,
        workflowId: output.workflow_id,
        executionId: output.execution_id,
        outputType: output.output_type,
        fileName: output.file_name,
        fileUrl: output.file_url,
        fileSize: output.file_size,
        mimeType: output.mime_type,
        outputData: output.output_data,
        metadata: output.metadata,
        createdAt: output.created_at,
        updatedAt: output.updated_at,
      }));
    } catch (error) {
      console.error('Error in getWorkflowOutputs:', error);
      throw error;
    }
  }

  /**
   * Get a single output by ID
   */
  static async getOutputById(outputId: string): Promise<WorkflowOutput | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_outputs')
        .select('*')
        .eq('id', outputId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        tenantId: data.tenant_id,
        workflowId: data.workflow_id,
        executionId: data.execution_id,
        outputType: data.output_type,
        fileName: data.file_name,
        fileUrl: data.file_url,
        fileSize: data.file_size,
        mimeType: data.mime_type,
        outputData: data.output_data,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error in getOutputById:', error);
      return null;
    }
  }

  /**
   * Create a new workflow output
   */
  static async createOutput(
    output: Omit<WorkflowOutput, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowOutput> {
    try {
      const { data, error } = await supabase
        .from('workflow_outputs')
        .insert({
          tenant_id: output.tenantId,
          workflow_id: output.workflowId,
          execution_id: output.executionId,
          output_type: output.outputType,
          file_name: output.fileName,
          file_url: output.fileUrl,
          file_size: output.fileSize,
          mime_type: output.mimeType,
          output_data: output.outputData,
          metadata: output.metadata,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        tenantId: data.tenant_id,
        workflowId: data.workflow_id,
        executionId: data.execution_id,
        outputType: data.output_type,
        fileName: data.file_name,
        fileUrl: data.file_url,
        fileSize: data.file_size,
        mimeType: data.mime_type,
        outputData: data.output_data,
        metadata: data.metadata,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error in createOutput:', error);
      throw error;
    }
  }

  /**
   * Upload a file to Supabase Storage (workflow-outputs bucket)
   */
  static async uploadFile(
    tenantId: string,
    workflowId: string,
    file: File
  ): Promise<{ url: string; path: string }> {
    try {
      // Generate unique file path: {tenantId}/{workflowId}/{timestamp}_{filename}
      const timestamp = Date.now();
      const filePath = `${tenantId}/${workflowId}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('workflow-outputs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('workflow-outputs').getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * Delete a workflow output and its file from storage
   */
  static async deleteOutput(outputId: string): Promise<boolean> {
    try {
      // Get output to find file path
      const output = await this.getOutputById(outputId);
      if (!output) return false;

      // Delete from storage if file exists
      if (output.fileUrl) {
        // Extract path from URL
        const urlParts = output.fileUrl.split('/workflow-outputs/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('workflow-outputs').remove([filePath]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('workflow_outputs')
        .delete()
        .eq('id', outputId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error in deleteOutput:', error);
      return false;
    }
  }

  /**
   * Delete multiple outputs (bulk delete)
   */
  static async deleteOutputs(outputIds: string[]): Promise<number> {
    let deletedCount = 0;

    for (const id of outputIds) {
      const success = await this.deleteOutput(id);
      if (success) deletedCount++;
    }

    return deletedCount;
  }

  /**
   * Get output statistics for a tenant
   */
  static async getOutputStats(tenantId: string): Promise<{
    totalOutputs: number;
    totalSize: number;
    byType: Record<string, number>;
    recentCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('workflow_outputs')
        .select('output_type, file_size, created_at')
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = {
        totalOutputs: data?.length || 0,
        totalSize: data?.reduce((sum, o) => sum + (o.file_size || 0), 0) || 0,
        byType: {} as Record<string, number>,
        recentCount: 0,
      };

      data?.forEach((output: any) => {
        // Count by type
        stats.byType[output.output_type] =
          (stats.byType[output.output_type] || 0) + 1;

        // Count recent (last 7 days)
        if (new Date(output.created_at) > last7Days) {
          stats.recentCount++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error in getOutputStats:', error);
      return {
        totalOutputs: 0,
        totalSize: 0,
        byType: {},
        recentCount: 0,
      };
    }
  }

  /**
   * Download a file from Supabase Storage
   */
  static async downloadFile(fileUrl: string, fileName: string): Promise<void> {
    try {
      // Extract path from URL
      const urlParts = fileUrl.split('/workflow-outputs/');
      if (urlParts.length <= 1) {
        throw new Error('Invalid file URL');
      }

      const filePath = urlParts[1];

      const { data, error } = await supabase.storage
        .from('workflow-outputs')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error in downloadFile:', error);
      throw error;
    }
  }
}
