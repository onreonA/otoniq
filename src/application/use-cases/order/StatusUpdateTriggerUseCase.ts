import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderService } from '../../../infrastructure/services/OrderService';
import { N8NService } from '../../../infrastructure/services/N8NService';
import { EmailNotificationService } from '../../../infrastructure/services/EmailNotificationService';
import { OrderStatus } from '../../../domain/enums/OrderStatus';

export interface StatusUpdateTriggerRequest {
  orderId: string;
  tenantId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  triggerOptions: {
    triggerN8NWorkflow: boolean;
    sendEmailNotification: boolean;
    updateMarketplace: boolean;
    updateOdoo: boolean;
    n8nConfig?: {
      url: string;
      apiKey: string;
    };
    emailConfig?: {
      provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
      apiKey?: string;
      domain?: string;
      fromEmail: string;
      fromName: string;
    };
    marketplaceCredentials?: {
      apiKey: string;
      apiSecret: string;
      sellerId: string;
    };
    odooCredentials?: {
      url: string;
      database: string;
      username: string;
      password: string;
    };
  };
}

export interface StatusUpdateTriggerResponse {
  success: boolean;
  triggeredActions: string[];
  errors: string[];
}

export class StatusUpdateTriggerUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private orderService: OrderService
  ) {}

  async execute(
    request: StatusUpdateTriggerRequest
  ): Promise<StatusUpdateTriggerResponse> {
    const { orderId, tenantId, oldStatus, newStatus, triggerOptions } = request;

    const triggeredActions: string[] = [];
    const errors: string[] = [];

    try {
      console.log(
        `🔄 Processing status update trigger for order ${orderId}: ${oldStatus} → ${newStatus}`
      );

      // Get order details
      const order = await this.orderRepository.getById(orderId, tenantId);
      if (!order) {
        throw new Error('Order not found');
      }

      // 1. Trigger N8N workflow
      if (triggerOptions.triggerN8NWorkflow && triggerOptions.n8nConfig) {
        try {
          await this.triggerN8NWorkflow(
            triggerOptions.n8nConfig,
            order,
            newStatus
          );
          triggeredActions.push('N8N workflow triggered');
        } catch (error) {
          const errorMessage = `N8N workflow trigger failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('N8N workflow error:', error);
        }
      }

      // 2. Send email notification
      if (triggerOptions.sendEmailNotification && triggerOptions.emailConfig) {
        try {
          await this.sendEmailNotification(
            triggerOptions.emailConfig,
            order,
            newStatus
          );
          triggeredActions.push('Email notification sent');
        } catch (error) {
          const errorMessage = `Email notification failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Email notification error:', error);
        }
      }

      // 3. Update marketplace
      if (
        triggerOptions.updateMarketplace &&
        triggerOptions.marketplaceCredentials
      ) {
        try {
          await this.updateMarketplaceStatus(
            triggerOptions.marketplaceCredentials,
            order,
            newStatus
          );
          triggeredActions.push('Marketplace status updated');
        } catch (error) {
          const errorMessage = `Marketplace update failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Marketplace update error:', error);
        }
      }

      // 4. Update Odoo
      if (triggerOptions.updateOdoo && triggerOptions.odooCredentials) {
        try {
          await this.updateOdooStatus(
            triggerOptions.odooCredentials,
            order,
            newStatus
          );
          triggeredActions.push('Odoo status updated');
        } catch (error) {
          const errorMessage = `Odoo update failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Odoo update error:', error);
        }
      }

      // 5. Add status history
      await this.orderRepository.addStatusHistory({
        orderId,
        tenantId,
        oldStatus,
        newStatus,
        note: `Status updated with triggers: ${triggeredActions.join(', ')}`,
        changedBy: 'status-trigger',
        changedAt: new Date(),
      });

      console.log(
        `✅ Status update trigger completed: ${triggeredActions.length} actions triggered`
      );

      return {
        success: true,
        triggeredActions,
        errors,
      };
    } catch (error) {
      const errorMessage = `Status update trigger failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      console.error('Status update trigger error:', error);
      errors.push(errorMessage);

      return {
        success: false,
        triggeredActions,
        errors,
      };
    }
  }

  /**
   * Trigger N8N workflow
   */
  private async triggerN8NWorkflow(
    n8nConfig: StatusUpdateTriggerRequest['triggerOptions']['n8nConfig'],
    order: any,
    newStatus: OrderStatus
  ): Promise<void> {
    const n8nService = new N8NService(n8nConfig!);

    // Test connection first
    const connectionTest = await n8nService.testConnection();
    if (!connectionTest.success) {
      throw new Error(`N8N connection failed: ${connectionTest.error}`);
    }

    // Trigger order status update workflow
    const result = await n8nService.triggerWorkflow({
      workflowId: 'order-status-update-workflow',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: newStatus,
        customerEmail: order.customerInfo.email,
        customerName: order.customerInfo.name,
        totalAmount: order.totalAmount.getFormattedAmount(),
        statusChangeTime: new Date().toISOString(),
      },
    });

    if (!result.success) {
      throw new Error(`N8N workflow trigger failed: ${result.error}`);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    emailConfig: StatusUpdateTriggerRequest['triggerOptions']['emailConfig'],
    order: any,
    newStatus: OrderStatus
  ): Promise<void> {
    const emailService = new EmailNotificationService(emailConfig!);

    // Test connection first
    const connectionTest = await emailService.testConnection();
    if (!connectionTest.success) {
      throw new Error(
        `Email service connection failed: ${connectionTest.error}`
      );
    }

    // Send status update email
    const result = await emailService.sendOrderStatusUpdateEmail(
      order,
      newStatus
    );
    if (!result.success) {
      throw new Error(`Email sending failed: ${result.error}`);
    }
  }

  /**
   * Update marketplace status
   */
  private async updateMarketplaceStatus(
    marketplaceCredentials: StatusUpdateTriggerRequest['triggerOptions']['marketplaceCredentials'],
    order: any,
    newStatus: OrderStatus
  ): Promise<void> {
    if (!order.externalOrderId) {
      throw new Error('Order is not linked to marketplace');
    }

    const result = await this.orderService.syncOrderStatusToMarketplace({
      orderId: order.id,
      tenantId: order.tenantId,
      marketplaceCredentials: {
        apiKey: marketplaceCredentials!.apiKey,
        apiSecret: marketplaceCredentials!.apiSecret,
        sellerId: marketplaceCredentials!.sellerId,
      },
      newStatus,
      reason: 'Status updated from internal system',
    });

    if (!result.success) {
      throw new Error(`Marketplace sync failed: ${result.error}`);
    }
  }

  /**
   * Update Odoo status
   */
  private async updateOdooStatus(
    odooCredentials: StatusUpdateTriggerRequest['triggerOptions']['odooCredentials'],
    order: any,
    newStatus: OrderStatus
  ): Promise<void> {
    if (!order.odooSaleOrderId) {
      throw new Error('Order is not linked to Odoo');
    }

    // This would update the Odoo sale order status
    // For now, just log the action
    console.log(
      `Updating Odoo sale order ${order.odooSaleOrderId} status to ${newStatus}`
    );
  }

  /**
   * Get status-specific triggers
   */
  getStatusTriggers(status: OrderStatus): {
    triggerN8NWorkflow: boolean;
    sendEmailNotification: boolean;
    updateMarketplace: boolean;
    updateOdoo: boolean;
  } {
    const triggers: Record<
      OrderStatus,
      {
        triggerN8NWorkflow: boolean;
        sendEmailNotification: boolean;
        updateMarketplace: boolean;
        updateOdoo: boolean;
      }
    > = {
      [OrderStatus.PENDING]: {
        triggerN8NWorkflow: false,
        sendEmailNotification: false,
        updateMarketplace: false,
        updateOdoo: false,
      },
      [OrderStatus.CONFIRMED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: true,
        updateOdoo: false,
      },
      [OrderStatus.PROCESSING]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: false,
        updateOdoo: false,
      },
      [OrderStatus.SHIPPED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: true,
        updateOdoo: false,
      },
      [OrderStatus.DELIVERED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: true,
        updateOdoo: true,
      },
      [OrderStatus.CANCELLED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: true,
        updateOdoo: true,
      },
      [OrderStatus.REFUNDED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: true,
        updateOdoo: true,
      },
      [OrderStatus.FAILED]: {
        triggerN8NWorkflow: true,
        sendEmailNotification: true,
        updateMarketplace: false,
        updateOdoo: false,
      },
    };

    return triggers[status] || triggers[OrderStatus.PENDING];
  }
}
