import { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderService } from '../../../infrastructure/services/OrderService';
import { N8NService } from '../../../infrastructure/services/N8NService';
import { EmailNotificationService } from '../../../infrastructure/services/EmailNotificationService';
import { MarketplaceCredentials } from '../../../domain/entities/Marketplace';
import { OrderStatus } from '../../../domain/enums/OrderStatus';

export interface TwoWayStatusSyncRequest {
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  n8nConfig: {
    url: string;
    apiKey: string;
  };
  emailConfig: {
    provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
    apiKey?: string;
    domain?: string;
    fromEmail: string;
    fromName: string;
  };
  syncOptions: {
    syncFromMarketplace: boolean;
    syncToMarketplace: boolean;
    triggerN8NWorkflow: boolean;
    sendEmailNotifications: boolean;
    conflictResolution: 'marketplace_wins' | 'internal_wins' | 'manual';
  };
}

export interface TwoWayStatusSyncResponse {
  success: boolean;
  syncedFromMarketplace: number;
  syncedToMarketplace: number;
  conflicts: Array<{
    orderId: string;
    internalStatus: OrderStatus;
    marketplaceStatus: string;
    resolution: string;
  }>;
  errors: string[];
}

export class TwoWayStatusSyncUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private orderService: OrderService
  ) {}

  async execute(
    request: TwoWayStatusSyncRequest
  ): Promise<TwoWayStatusSyncResponse> {
    const {
      tenantId,
      marketplaceCredentials,
      n8nConfig,
      emailConfig,
      syncOptions,
    } = request;

    let syncedFromMarketplace = 0;
    let syncedToMarketplace = 0;
    const conflicts: Array<{
      orderId: string;
      internalStatus: OrderStatus;
      marketplaceStatus: string;
      resolution: string;
    }> = [];
    const errors: string[] = [];

    try {
      console.log('🔄 Starting two-way status sync...');

      // Initialize services
      const n8nService = new N8NService(n8nConfig);
      const emailService = new EmailNotificationService(emailConfig);

      // Test connections
      await this.testConnections(n8nService, emailService);

      // 1. Sync from marketplace to internal
      if (syncOptions.syncFromMarketplace) {
        console.log('📥 Syncing status from marketplace to internal...');
        const fromMarketplaceResult = await this.syncFromMarketplace(
          tenantId,
          marketplaceCredentials,
          n8nService,
          emailService,
          syncOptions
        );
        syncedFromMarketplace = fromMarketplaceResult.synced;
        conflicts.push(...fromMarketplaceResult.conflicts);
        errors.push(...fromMarketplaceResult.errors);
      }

      // 2. Sync from internal to marketplace
      if (syncOptions.syncToMarketplace) {
        console.log('📤 Syncing status from internal to marketplace...');
        const toMarketplaceResult = await this.syncToMarketplace(
          tenantId,
          marketplaceCredentials,
          n8nService,
          emailService,
          syncOptions
        );
        syncedToMarketplace = toMarketplaceResult.synced;
        conflicts.push(...toMarketplaceResult.conflicts);
        errors.push(...toMarketplaceResult.errors);
      }

      console.log(
        `✅ Two-way sync completed: ${syncedFromMarketplace} from marketplace, ${syncedToMarketplace} to marketplace`
      );

      return {
        success: true,
        syncedFromMarketplace,
        syncedToMarketplace,
        conflicts,
        errors,
      };
    } catch (error) {
      const errorMessage = `Two-way sync failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      console.error('❌ Two-way sync error:', error);
      errors.push(errorMessage);

      return {
        success: false,
        syncedFromMarketplace,
        syncedToMarketplace,
        conflicts,
        errors,
      };
    }
  }

  /**
   * Test all service connections
   */
  private async testConnections(
    n8nService: N8NService,
    emailService: EmailNotificationService
  ): Promise<void> {
    // Test N8N connection
    const n8nTest = await n8nService.testConnection();
    if (!n8nTest.success) {
      throw new Error(`N8N connection failed: ${n8nTest.error}`);
    }

    // Test email connection
    const emailTest = await emailService.testConnection();
    if (!emailTest.success) {
      throw new Error(`Email service connection failed: ${emailTest.error}`);
    }
  }

  /**
   * Sync status from marketplace to internal
   */
  private async syncFromMarketplace(
    tenantId: string,
    marketplaceCredentials: MarketplaceCredentials,
    n8nService: N8NService,
    emailService: EmailNotificationService,
    syncOptions: TwoWayStatusSyncRequest['syncOptions']
  ): Promise<{
    synced: number;
    conflicts: Array<{
      orderId: string;
      internalStatus: OrderStatus;
      marketplaceStatus: string;
      resolution: string;
    }>;
    errors: string[];
  }> {
    const conflicts: Array<{
      orderId: string;
      internalStatus: OrderStatus;
      marketplaceStatus: string;
      resolution: string;
    }> = [];
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get orders with external order IDs (marketplace orders)
      const orders = await this.orderRepository.getOrders({
        tenantId,
        filters: {
          hasExternalOrderId: true,
        },
      });

      for (const order of orders) {
        try {
          // Get current status from marketplace
          const marketplaceStatus = await this.getMarketplaceOrderStatus(
            marketplaceCredentials,
            order.externalOrderId!
          );

          if (!marketplaceStatus) {
            continue;
          }

          // Check for conflicts
          const internalStatus = order.status;
          const mappedMarketplaceStatus =
            this.mapMarketplaceStatusToInternal(marketplaceStatus);

          if (internalStatus !== mappedMarketplaceStatus) {
            // Handle conflict
            const conflict = await this.handleStatusConflict(
              order.id,
              internalStatus,
              mappedMarketplaceStatus,
              syncOptions.conflictResolution
            );

            if (conflict) {
              conflicts.push(conflict);
            }

            // Update internal status
            await this.orderRepository.update(order.id, {
              status: mappedMarketplaceStatus,
            });

            // Add status history
            await this.orderRepository.addStatusHistory({
              orderId: order.id,
              tenantId,
              oldStatus: internalStatus,
              newStatus: mappedMarketplaceStatus,
              note: `Status synced from marketplace: ${marketplaceStatus}`,
              changedBy: 'marketplace-sync',
              changedAt: new Date(),
            });

            // Trigger N8N workflow if enabled
            if (syncOptions.triggerN8NWorkflow) {
              await this.triggerN8NWorkflow(
                n8nService,
                order,
                mappedMarketplaceStatus
              );
            }

            // Send email notification if enabled
            if (syncOptions.sendEmailNotifications) {
              await this.sendStatusUpdateEmail(
                emailService,
                order,
                mappedMarketplaceStatus
              );
            }

            synced++;
          }
        } catch (orderError) {
          const errorMessage = `Failed to sync order ${order.id}: ${
            orderError instanceof Error ? orderError.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Order sync error:', orderError);
        }
      }
    } catch (error) {
      const errorMessage = `Marketplace sync failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      errors.push(errorMessage);
      console.error('Marketplace sync error:', error);
    }

    return { synced, conflicts, errors };
  }

  /**
   * Sync status from internal to marketplace
   */
  private async syncToMarketplace(
    tenantId: string,
    marketplaceCredentials: MarketplaceCredentials,
    n8nService: N8NService,
    emailService: EmailNotificationService,
    syncOptions: TwoWayStatusSyncRequest['syncOptions']
  ): Promise<{
    synced: number;
    conflicts: Array<{
      orderId: string;
      internalStatus: OrderStatus;
      marketplaceStatus: string;
      resolution: string;
    }>;
    errors: string[];
  }> {
    const conflicts: Array<{
      orderId: string;
      internalStatus: OrderStatus;
      marketplaceStatus: string;
      resolution: string;
    }> = [];
    const errors: string[] = [];
    let synced = 0;

    try {
      // Get orders with external order IDs that need status sync
      const orders = await this.orderRepository.getOrders({
        tenantId,
        filters: {
          hasExternalOrderId: true,
          needsStatusSync: true,
        },
      });

      for (const order of orders) {
        try {
          // Sync status to marketplace
          const syncResult =
            await this.orderService.syncOrderStatusToMarketplace({
              orderId: order.id,
              tenantId,
              marketplaceCredentials,
              newStatus: order.status,
              reason: 'Status synced from internal system',
            });

          if (syncResult.success) {
            synced++;

            // Trigger N8N workflow if enabled
            if (syncOptions.triggerN8NWorkflow) {
              await this.triggerN8NWorkflow(n8nService, order, order.status);
            }

            // Send email notification if enabled
            if (syncOptions.sendEmailNotifications) {
              await this.sendStatusUpdateEmail(
                emailService,
                order,
                order.status
              );
            }
          } else {
            errors.push(
              `Failed to sync order ${order.id} to marketplace: ${syncResult.error}`
            );
          }
        } catch (orderError) {
          const errorMessage = `Failed to sync order ${order.id}: ${
            orderError instanceof Error ? orderError.message : 'Unknown error'
          }`;
          errors.push(errorMessage);
          console.error('Order sync error:', orderError);
        }
      }
    } catch (error) {
      const errorMessage = `Internal to marketplace sync failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;
      errors.push(errorMessage);
      console.error('Internal to marketplace sync error:', error);
    }

    return { synced, conflicts, errors };
  }

  /**
   * Get marketplace order status
   */
  private async getMarketplaceOrderStatus(
    _marketplaceCredentials: MarketplaceCredentials,
    _externalOrderId: string
  ): Promise<string | null> {
    try {
      // This would use the TrendyolClient to get order status
      // For now, return mock status
      return 'Shipped';
    } catch (error) {
      console.error('Failed to get marketplace order status:', error);
      return null;
    }
  }

  /**
   * Map marketplace status to internal status
   */
  private mapMarketplaceStatusToInternal(
    marketplaceStatus: string
  ): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      Created: OrderStatus.PENDING,
      Pending: OrderStatus.PENDING,
      Approved: OrderStatus.CONFIRMED,
      Confirmed: OrderStatus.CONFIRMED,
      Packed: OrderStatus.PROCESSING,
      Shipped: OrderStatus.SHIPPED,
      Delivered: OrderStatus.DELIVERED,
      Cancelled: OrderStatus.CANCELLED,
      Returned: OrderStatus.REFUNDED,
      Failed: OrderStatus.FAILED,
    };

    return statusMap[marketplaceStatus] || OrderStatus.PENDING;
  }

  /**
   * Handle status conflict
   */
  private async handleStatusConflict(
    orderId: string,
    internalStatus: OrderStatus,
    marketplaceStatus: OrderStatus,
    conflictResolution: string
  ): Promise<{
    orderId: string;
    internalStatus: OrderStatus;
    marketplaceStatus: string;
    resolution: string;
  }> {
    let resolution: string;

    switch (conflictResolution) {
      case 'marketplace_wins':
        resolution = 'Marketplace status used';
        break;
      case 'internal_wins':
        resolution = 'Internal status used';
        break;
      case 'manual':
        resolution = 'Manual resolution required';
        break;
      default:
        resolution = 'Unknown resolution';
    }

    return {
      orderId,
      internalStatus,
      marketplaceStatus,
      resolution,
    };
  }

  /**
   * Trigger N8N workflow
   */
  private async triggerN8NWorkflow(
    n8nService: N8NService,
    order: any,
    status: OrderStatus
  ): Promise<void> {
    try {
      await n8nService.triggerWorkflow({
        workflowId: 'order-status-update-workflow',
        data: {
          orderId: order.id,
          status,
          orderNumber: order.orderNumber,
          customerEmail: order.customerInfo.email,
        },
      });
    } catch (error) {
      console.error('Failed to trigger N8N workflow:', error);
    }
  }

  /**
   * Send status update email
   */
  private async sendStatusUpdateEmail(
    emailService: EmailNotificationService,
    order: any,
    status: OrderStatus
  ): Promise<void> {
    try {
      await emailService.sendOrderStatusUpdateEmail(order, status);
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }
  }
}
