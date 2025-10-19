import axios, { AxiosInstance } from 'axios';

export interface N8NConfig {
  url: string;
  apiKey: string;
  webhookUrl?: string;
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8NNode[];
  connections: Record<string, any>;
  settings: Record<string, any>;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

export interface N8NExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data: any;
  error?: string;
}

export interface TriggerWorkflowRequest {
  workflowId: string;
  data: Record<string, any>;
  waitForCompletion?: boolean;
}

export interface TriggerWorkflowResponse {
  success: boolean;
  executionId?: string;
  error?: string;
}

export class N8NService {
  private api: AxiosInstance;
  private config: N8NConfig;

  constructor(config: N8NConfig) {
    this.config = config;
    this.api = axios.create({
      baseURL: config.url,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': config.apiKey,
      },
    });
  }

  /**
   * Test N8N connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.api.get('/api/v1/workflows');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8NWorkflow[]> {
    try {
      const response = await this.api.get('/api/v1/workflows');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get N8N workflows:', error);
      throw new Error(`Failed to get workflows: ${error}`);
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8NWorkflow> {
    try {
      const response = await this.api.get(`/api/v1/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get N8N workflow:', error);
      throw new Error(`Failed to get workflow: ${error}`);
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<N8NWorkflow>): Promise<N8NWorkflow> {
    try {
      const response = await this.api.post('/api/v1/workflows', workflow);
      return response.data;
    } catch (error) {
      console.error('Failed to create N8N workflow:', error);
      throw new Error(`Failed to create workflow: ${error}`);
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(
    workflowId: string,
    updates: Partial<N8NWorkflow>
  ): Promise<N8NWorkflow> {
    try {
      const response = await this.api.patch(
        `/api/v1/workflows/${workflowId}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update N8N workflow:', error);
      throw new Error(`Failed to update workflow: ${error}`);
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.delete(`/api/v1/workflows/${workflowId}`);
    } catch (error) {
      console.error('Failed to delete N8N workflow:', error);
      throw new Error(`Failed to delete workflow: ${error}`);
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.post(`/api/v1/workflows/${workflowId}/activate`);
    } catch (error) {
      console.error('Failed to activate N8N workflow:', error);
      throw new Error(`Failed to activate workflow: ${error}`);
    }
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      await this.api.post(`/api/v1/workflows/${workflowId}/deactivate`);
    } catch (error) {
      console.error('Failed to deactivate N8N workflow:', error);
      throw new Error(`Failed to deactivate workflow: ${error}`);
    }
  }

  /**
   * Trigger workflow execution
   */
  async triggerWorkflow(
    request: TriggerWorkflowRequest
  ): Promise<TriggerWorkflowResponse> {
    try {
      const response = await this.api.post(
        `/api/v1/workflows/${request.workflowId}/execute`,
        {
          data: request.data,
        }
      );

      return {
        success: true,
        executionId: response.data.executionId,
      };
    } catch (error) {
      console.error('Failed to trigger N8N workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<N8NExecution> {
    try {
      const response = await this.api.get(`/api/v1/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get N8N execution:', error);
      throw new Error(`Failed to get execution: ${error}`);
    }
  }

  /**
   * Get workflow executions
   */
  async getWorkflowExecutions(
    workflowId: string,
    limit = 10
  ): Promise<N8NExecution[]> {
    try {
      const response = await this.api.get(`/api/v1/executions`, {
        params: {
          workflowId,
          limit,
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get N8N executions:', error);
      throw new Error(`Failed to get executions: ${error}`);
    }
  }

  /**
   * Create order processing workflow
   */
  async createOrderProcessingWorkflow(): Promise<N8NWorkflow> {
    const workflow: Partial<N8NWorkflow> = {
      name: 'Order Processing Workflow',
      active: false,
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Order Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'order-processing',
            httpMethod: 'POST',
          },
        },
        {
          id: 'order-validation',
          name: 'Validate Order',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [300, 100],
          parameters: {
            functionCode: `
              // Validate order data
              const order = $input.first().json;
              
              if (!order.id || !order.customerInfo || !order.items) {
                throw new Error('Invalid order data');
              }
              
              return { json: order };
            `,
          },
        },
        {
          id: 'update-inventory',
          name: 'Update Inventory',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 100],
          parameters: {
            url: '={{ $env.INVENTORY_API_URL }}/update-stock',
            method: 'POST',
            body: {
              items: '={{ $json.items }}',
            },
          },
        },
        {
          id: 'send-notification',
          name: 'Send Notification',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [700, 100],
          parameters: {
            url: '={{ $env.NOTIFICATION_API_URL }}/send',
            method: 'POST',
            body: {
              type: 'order_processed',
              orderId: '={{ $json.id }}',
              customerEmail: '={{ $json.customerInfo.email }}',
            },
          },
        },
      ],
      connections: {
        'Order Webhook': {
          main: [
            [
              {
                node: 'Validate Order',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
        'Validate Order': {
          main: [
            [
              {
                node: 'Update Inventory',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
        'Update Inventory': {
          main: [
            [
              {
                node: 'Send Notification',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
      },
      settings: {
        executionOrder: 'v1',
      },
    };

    return await this.createWorkflow(workflow);
  }

  /**
   * Get tenant workflows (mock implementation)
   */
  static async getTenantWorkflows(tenantId: string): Promise<any[]> {
    // Mock data for tenant workflows
    const mockWorkflows = [
      {
        id: 'workflow-1',
        tenantId,
        workflowName: 'Günlük Stok Güncelleme',
        n8nWorkflowId: 'n8n-workflow-1',
        triggerType: 'schedule',
        webhookUrl: null,
        isActive: true,
        lastExecutionAt: new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString(), // 2 hours ago
        lastExecutionStatus: 'success',
        metadata: {
          category: 'inventory',
          icon: 'package',
          color: 'blue',
        },
      },
      {
        id: 'workflow-2',
        tenantId,
        workflowName: 'Sipariş Durumu Senkronizasyonu',
        n8nWorkflowId: 'n8n-workflow-2',
        triggerType: 'webhook',
        webhookUrl: 'https://n8n.example.com/webhook/order-sync',
        isActive: true,
        lastExecutionAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        lastExecutionStatus: 'success',
        metadata: {
          category: 'orders',
          icon: 'shopping-cart',
          color: 'green',
        },
      },
      {
        id: 'workflow-3',
        tenantId,
        workflowName: 'Müşteri Bildirimleri',
        n8nWorkflowId: 'n8n-workflow-3',
        triggerType: 'schedule',
        webhookUrl: null,
        isActive: false,
        lastExecutionAt: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day ago
        lastExecutionStatus: 'failed',
        metadata: {
          category: 'notifications',
          icon: 'mail',
          color: 'purple',
        },
      },
    ];

    console.log(
      `📋 Returning ${mockWorkflows.length} mock workflows for tenant: ${tenantId}`
    );
    return mockWorkflows;
  }

  /**
   * Trigger webhook (mock implementation)
   */
  static async triggerWebhook(
    webhookUrl: string,
    data: any
  ): Promise<{ success: boolean; error?: string }> {
    console.log(`🚀 Triggering webhook: ${webhookUrl}`, data);

    // Simulate webhook call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock success response
    return {
      success: true,
    };
  }

  /**
   * Create order status update workflow
   */
  async createOrderStatusUpdateWorkflow(): Promise<N8NWorkflow> {
    const workflow: Partial<N8NWorkflow> = {
      name: 'Order Status Update Workflow',
      active: false,
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Status Update Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'order-status-update',
            httpMethod: 'POST',
          },
        },
        {
          id: 'update-order-status',
          name: 'Update Order Status',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [300, 100],
          parameters: {
            url: '={{ $env.ORDER_API_URL }}/orders/{{ $json.orderId }}/status',
            method: 'PUT',
            body: {
              status: '={{ $json.status }}',
              note: '={{ $json.note }}',
            },
          },
        },
        {
          id: 'sync-to-marketplace',
          name: 'Sync to Marketplace',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 1,
          position: [500, 100],
          parameters: {
            url: '={{ $env.MARKETPLACE_API_URL }}/sync-status',
            method: 'POST',
            body: {
              orderId: '={{ $json.orderId }}',
              status: '={{ $json.status }}',
            },
          },
        },
      ],
      connections: {
        'Status Update Webhook': {
          main: [
            [
              {
                node: 'Update Order Status',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
        'Update Order Status': {
          main: [
            [
              {
                node: 'Sync to Marketplace',
                type: 'main',
                index: 0,
              },
            ],
          ],
        },
      },
      settings: {
        executionOrder: 'v1',
      },
    };

    return await this.createWorkflow(workflow);
  }
}
