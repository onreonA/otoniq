import { N8NService } from '../services/N8NService';
import axios from 'axios';

export class WorkflowInstaller {
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
      const N8N_API_URL = import.meta.env.VITE_N8N_API_URL;
      const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY;

      if (!N8N_API_URL || !N8N_API_KEY) {
        throw new Error(
          'N8N API credentials not configured. Please set VITE_N8N_API_URL and VITE_N8N_API_KEY in .env.local'
        );
      }

      // Upload workflow to N8N Cloud
      const client = axios.create({
        baseURL: `${N8N_API_URL}/api/v1`,
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
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
    } catch (error: any) {
      console.error('Error installing workflow:', error);
      if (error.response) {
        throw new Error(
          `N8N API Error: ${error.response.data?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Install all default workflows for a tenant
   */
  static async installDefaultWorkflows(tenantId: string): Promise<void> {
    try {
      const workflows = [
        {
          name: 'Daily Sales Report',
          description:
            'Automatically sends daily sales report every morning at 9 AM',
          json: this.getDailyReportWorkflow(),
        },
        {
          name: 'Low Stock Alert',
          description:
            'Monitors inventory and sends alerts when products are running low',
          json: this.getLowStockAlertWorkflow(),
        },
        {
          name: 'Social Media Auto-Post',
          description:
            'Automatically posts scheduled content to Facebook, Twitter, and Instagram',
          json: this.getSocialMediaWorkflow(),
        },
        {
          name: 'Email Campaign Scheduler',
          description: 'Sends scheduled email campaigns to customer segments',
          json: this.getEmailCampaignWorkflow(),
        },
      ];

      for (const workflow of workflows) {
        try {
          await this.installWorkflow(
            tenantId,
            workflow.json,
            workflow.name,
            workflow.description
          );
          console.log(`✅ Installed: ${workflow.name}`);
        } catch (error) {
          console.error(`❌ Failed to install ${workflow.name}:`, error);
          // Continue with other workflows even if one fails
        }
      }

      console.log('✅ Default workflows installation complete');
    } catch (error) {
      console.error('❌ Error installing default workflows:', error);
      throw error;
    }
  }

  /**
   * Get Daily Sales Report workflow JSON
   */
  private static getDailyReportWorkflow() {
    return {
      name: 'Daily Sales Report',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: 'cronExpression',
                  expression: '0 9 * * *',
                },
              ],
            },
          },
          name: 'Schedule Daily 9 AM',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: `=${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_daily_sales_report`,
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
            options: {},
          },
          name: 'Get Sales Data',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
        },
        {
          parameters: {
            operation: 'sendEmail',
            fromEmail: 'noreply@otoniq.ai',
            toEmail: '={{$json.tenant_email}}',
            subject: '📊 Günlük Satış Raporu',
            text: `=Merhaba,

Dünkü satış performansınız:

- Toplam Gelir: ₺{{$json.total_sales}}
- Sipariş Sayısı: {{$json.total_orders}}
- Ortalama Sepet: ₺{{$json.avg_order_value}}

İyi çalışmalar!`,
          },
          name: 'Send Email Report',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 2,
          position: [650, 300],
        },
      ],
      connections: {
        'Schedule Daily 9 AM': {
          main: [[{ node: 'Get Sales Data', type: 'main', index: 0 }]],
        },
        'Get Sales Data': {
          main: [[{ node: 'Send Email Report', type: 'main', index: 0 }]],
        },
      },
    };
  }

  /**
   * Get Low Stock Alert workflow JSON
   */
  private static getLowStockAlertWorkflow() {
    return {
      name: 'Low Stock Alert',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: 'cronExpression',
                  expression: '0 */6 * * *',
                },
              ],
            },
          },
          name: 'Check Every 6 Hours',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: `=${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_low_stock_products`,
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
          },
          name: 'Get Low Stock Products',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
        },
        {
          parameters: {
            conditions: {
              number: [
                {
                  value1: '={{$json.length}}',
                  operation: 'larger',
                  value2: 0,
                },
              ],
            },
          },
          name: 'Has Low Stock Items',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [650, 300],
        },
        {
          parameters: {
            operation: 'sendEmail',
            fromEmail: 'alerts@otoniq.ai',
            toEmail: '={{$json.tenant_email}}',
            subject: '⚠️ Düşük Stok Uyarısı',
            text: `=Merhaba,

Aşağıdaki ürünlerinizin stoğu kritik seviyede:

{{$json.products.map(p => \`- \${p.name}: \${p.stock} adet kaldı\`).join('\\n')}}

Lütfen stok yenilemesi yapın.`,
          },
          name: 'Send Alert Email',
          type: 'n8n-nodes-base.emailSend',
          typeVersion: 2,
          position: [850, 300],
        },
      ],
      connections: {
        'Check Every 6 Hours': {
          main: [[{ node: 'Get Low Stock Products', type: 'main', index: 0 }]],
        },
        'Get Low Stock Products': {
          main: [[{ node: 'Has Low Stock Items', type: 'main', index: 0 }]],
        },
        'Has Low Stock Items': {
          main: [[{ node: 'Send Alert Email', type: 'main', index: 0 }]],
        },
      },
    };
  }

  /**
   * Get Social Media Auto-Post workflow JSON
   */
  private static getSocialMediaWorkflow() {
    return {
      name: 'Social Media Auto-Post',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                { field: 'cronExpression', expression: '0 10,14,18 * * *' },
              ],
            },
          },
          name: 'Schedule 3x Daily',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/get_pending_social_posts`,
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
          },
          name: 'Get Pending Posts',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
        },
      ],
      connections: {
        'Schedule 3x Daily': {
          main: [[{ node: 'Get Pending Posts', type: 'main', index: 0 }]],
        },
      },
    };
  }

  /**
   * Get Email Campaign Scheduler workflow JSON
   */
  private static getEmailCampaignWorkflow() {
    return {
      name: 'Email Campaign Scheduler',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                { field: 'cronExpression', expression: '*/15 * * * *' },
              ],
            },
          },
          name: 'Check Every 15 Minutes',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/email_campaigns?status=eq.scheduled`,
            authentication: 'genericCredentialType',
            genericAuthType: 'httpHeaderAuth',
          },
          name: 'Get Scheduled Campaigns',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [450, 300],
        },
      ],
      connections: {
        'Check Every 15 Minutes': {
          main: [[{ node: 'Get Scheduled Campaigns', type: 'main', index: 0 }]],
        },
      },
    };
  }
}
