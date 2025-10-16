/**
 * WorkflowInstaller
 * Utility for installing pre-built N8N workflows to N8N Cloud
 */

import { N8NService, N8NWorkflow } from '../services/N8NService';
import axios from 'axios';
import dailyReportWorkflow from './templates/daily-report.json';
import lowStockAlertWorkflow from './templates/low-stock-alert.json';

export interface WorkflowTemplate {
  name: string;
  description: string;
  category: string;
  triggerType: 'manual' | 'webhook' | 'cron' | 'event';
  workflowJson: any;
  defaultConfig?: any;
  icon?: string;
  color?: string;
}

export class WorkflowInstaller {
  /**
   * Get all available workflow templates
   */
  static getTemplates(): WorkflowTemplate[] {
    return [
      {
        name: 'Günlük Satış Raporu',
        description:
          "Her gün saat 09:00'da otomatik olarak günlük satış raporu oluşturur ve e-posta ile gönderir",
        category: 'analytics',
        triggerType: 'cron',
        workflowJson: dailyReportWorkflow,
        defaultConfig: {
          cronExpression: '0 9 * * *',
          emailRecipients: [],
        },
        icon: 'ri-file-chart-line',
        color: 'blue',
      },
      {
        name: 'Düşük Stok Uyarısı',
        description:
          'Stok seviyesi eşik değerin altına düştüğünde otomatik uyarı gönderir (6 saatte bir kontrol)',
        category: 'inventory',
        triggerType: 'cron',
        workflowJson: lowStockAlertWorkflow,
        defaultConfig: {
          cronExpression: '0 */6 * * *',
          notificationChannels: ['email', 'in-app'],
        },
        icon: 'ri-alert-line',
        color: 'orange',
      },
    ];
  }

  /**
   * Install workflow to N8N Cloud and save to database
   */
  static async installWorkflow(
    tenantId: string,
    workflowJson: any,
    workflowName: string,
    workflowDescription: string
  ): Promise<string> {
    try {
      // Upload workflow to N8N Cloud
      const client = axios.create({
        baseURL: `${import.meta.env.VITE_N8N_API_URL}/api/v1`,
        headers: {
          'X-N8N-API-KEY': import.meta.env.VITE_N8N_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      const response = await client.post('/workflows', workflowJson);
      const n8nWorkflowId = response.data.id;

      // Activate the workflow
      await client.patch(`/workflows/${n8nWorkflowId}`, {
        active: true,
      });

      // Save to database
      const workflowId = await N8NService.createWorkflow({
        tenantId,
        workflowName,
        workflowDescription,
        n8nWorkflowId,
        workflowJson,
        triggerType: workflowJson.nodes[0].type.includes('schedule')
          ? 'cron'
          : 'webhook',
        triggerConfig: workflowJson.nodes[0].parameters,
        isActive: true,
      });

      return workflowId;
    } catch (error) {
      console.error('Error installing workflow:', error);
      throw error;
    }
  }

  /**
   * Install all default workflows for a tenant (Webhook Mode)
   */
  static async installDefaultWorkflows(tenantId: string): Promise<void> {
    try {
      // N8N Webhook URLs (configured manually in N8N Cloud)
      const dailyReportWebhook =
        'https://otoniq.app.n8n.cloud/workflow/atI6tzx75ieHfjrX';
      const lowStockAlertWebhook =
        'https://otoniq.app.n8n.cloud/workflow/rqn2AxkOapqUKpCm';

      // Install Daily Report Workflow (Webhook mode)
      await this.installWorkflowWebhook(
        tenantId,
        'Daily Sales Report',
        'Automatically sends daily sales report every morning at 9 AM',
        dailyReportWebhook,
        'cron'
      );

      // Install Low Stock Alert Workflow (Webhook mode)
      await this.installWorkflowWebhook(
        tenantId,
        'Low Stock Alert',
        'Monitors inventory and sends alerts when products are running low',
        lowStockAlertWebhook,
        'cron'
      );

      if (import.meta.env.DEV) {
        console.log(
          '✅ Default workflows installed successfully (Webhook mode)'
        );
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Error installing default workflows:', error);
      }
      throw error;
    }
  }

  /**
   * Install workflow using webhook URL (no N8N API required)
   */
  static async installWorkflowWebhook(
    tenantId: string,
    workflowName: string,
    workflowDescription: string,
    webhookUrl: string,
    triggerType: 'webhook' | 'cron'
  ): Promise<string> {
    try {
      // Save workflow to database with webhook URL
      const workflowId = await N8NService.createWorkflow({
        tenantId,
        workflowName,
        workflowDescription,
        webhookUrl,
        triggerType,
        triggerConfig: { webhookUrl },
        isActive: true,
        metadata: {
          webhookMode: true,
          manuallyConfigured: true,
        },
      });

      return workflowId;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error installing workflow (webhook):', error);
      }
      throw error;
    }
  }

  /**
   * Get workflow template by name
   */
  static getTemplate(templateName: string): WorkflowTemplate | undefined {
    return this.getTemplates().find(t => t.name === templateName);
  }

  /**
   * Get workflow templates by category
   */
  static getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return this.getTemplates().filter(t => t.category === category);
  }
}
