/**
 * WorkflowInstaller
 * Utility for installing pre-built N8N workflows
 */

import { N8NService, N8NWorkflow } from '../services/N8NService';
import dailyReportWorkflow from './daily-report.workflow.json';
import lowStockAlertWorkflow from './low-stock-alert.workflow.json';
import newOrderNotificationWorkflow from './new-order-notification.workflow.json';
import socialMediaPostWorkflow from './social-media-post.workflow.json';
import emailCampaignWorkflow from './email-campaign.workflow.json';

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
          'Stok seviyesi eşik değerin altına düştüğünde otomatik uyarı gönderir (E-posta + WhatsApp)',
        category: 'inventory',
        triggerType: 'webhook',
        workflowJson: lowStockAlertWorkflow,
        defaultConfig: {
          notificationChannels: ['email', 'whatsapp', 'in-app'],
        },
        icon: 'ri-alert-line',
        color: 'orange',
      },
      {
        name: 'Yeni Sipariş Bildirimi',
        description:
          'Yeni sipariş geldiğinde anında bildirim gönderir ve müşteriye onay e-postası atar',
        category: 'orders',
        triggerType: 'webhook',
        workflowJson: newOrderNotificationWorkflow,
        defaultConfig: {
          notifyCustomer: true,
          notificationChannels: ['email', 'whatsapp', 'in-app'],
        },
        icon: 'ri-shopping-bag-line',
        color: 'green',
      },
      {
        name: 'Sosyal Medya Otomasyonu',
        description:
          "Ürün bazlı veya manuel olarak Instagram, Facebook ve Twitter'a otomatik gönderi oluşturur ve yayınlar",
        category: 'social_media',
        triggerType: 'webhook',
        workflowJson: socialMediaPostWorkflow,
        defaultConfig: {
          platforms: ['instagram', 'facebook', 'twitter'],
          aiGenerated: true,
        },
        icon: 'ri-share-line',
        color: 'purple',
      },
      {
        name: 'E-posta Kampanyası',
        description:
          'Segmentlenmiş müşteri listelerine kişiselleştirilmiş toplu e-posta kampanyaları gönderir ve analiz sağlar',
        category: 'email_marketing',
        triggerType: 'webhook',
        workflowJson: emailCampaignWorkflow,
        defaultConfig: {
          batchSize: 10,
          rateLimitDelay: 1,
        },
        icon: 'ri-mail-send-line',
        color: 'cyan',
      },
    ];
  }

  /**
   * Install a workflow for a tenant
   */
  static async installWorkflow(
    tenantId: string,
    templateName: string,
    customConfig?: any,
    createdBy?: string
  ): Promise<string> {
    const template = this.getTemplates().find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Workflow template not found: ${templateName}`);
    }

    const workflow: N8NWorkflow = {
      tenantId,
      workflowName: template.name,
      workflowDescription: template.description,
      triggerType: template.triggerType,
      workflowJson: template.workflowJson,
      triggerConfig: customConfig || template.defaultConfig,
      isActive: false, // Start as inactive, user can activate later
      createdBy,
      metadata: {
        category: template.category,
        icon: template.icon,
        color: template.color,
        templateVersion: '1.0.0',
      },
    };

    // For webhook workflows, generate webhook URL placeholder
    if (template.triggerType === 'webhook') {
      workflow.webhookUrl = `${import.meta.env.VITE_N8N_WEBHOOK_BASE_URL}/${templateName
        .toLowerCase()
        .replace(/\s+/g, '-')}`;
    }

    const workflowId = await N8NService.createWorkflow(workflow);
    return workflowId;
  }

  /**
   * Install all default workflows for a new tenant
   */
  static async installDefaultWorkflows(
    tenantId: string,
    createdBy?: string
  ): Promise<string[]> {
    const templates = this.getTemplates();
    const workflowIds: string[] = [];

    for (const template of templates) {
      try {
        const workflowId = await this.installWorkflow(
          tenantId,
          template.name,
          undefined,
          createdBy
        );
        workflowIds.push(workflowId);
        console.log(`✅ Installed workflow: ${template.name}`);
      } catch (error) {
        console.error(`❌ Failed to install workflow: ${template.name}`, error);
      }
    }

    return workflowIds;
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
