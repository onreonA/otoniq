import { ScheduledOrderSyncUseCase } from '../../application/use-cases/order/ScheduledOrderSyncUseCase';
import { OrderService } from './OrderService';
import { SupabaseOrderRepository } from '../database/supabase/repositories/SupabaseOrderRepository';
import { MarketplaceCredentials } from '../../domain/entities/Marketplace';

export interface ScheduledTask {
  id: string;
  name: string;
  type: 'order_sync' | 'status_sync' | 'inventory_sync';
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  frequency: 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
  config: Record<string, any>;
}

export interface CreateScheduledTaskRequest {
  name: string;
  type: 'order_sync' | 'status_sync' | 'inventory_sync';
  tenantId: string;
  marketplaceCredentials: MarketplaceCredentials;
  frequency: 'hourly' | 'daily' | 'weekly';
  config?: Record<string, any>;
}

export class ScheduledTaskService {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private orderService: OrderService;
  private scheduledOrderSyncUseCase: ScheduledOrderSyncUseCase;

  constructor() {
    this.orderService = new OrderService();
    this.scheduledOrderSyncUseCase = new ScheduledOrderSyncUseCase(
      new SupabaseOrderRepository(),
      this.orderService
    );
  }

  /**
   * Create a new scheduled task
   */
  async createTask(
    request: CreateScheduledTaskRequest
  ): Promise<ScheduledTask> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const nextRunAt = this.calculateNextRunTime(request.frequency);

    const task: ScheduledTask = {
      id: taskId,
      name: request.name,
      type: request.type,
      tenantId: request.tenantId,
      marketplaceCredentials: request.marketplaceCredentials,
      frequency: request.frequency,
      isActive: true,
      nextRunAt,
      config: request.config || {},
    };

    this.tasks.set(taskId, task);
    this.scheduleTask(task);

    console.log(`✅ Created scheduled task: ${task.name} (${taskId})`);
    console.log(`⏰ Next run: ${nextRunAt.toISOString()}`);

    return task;
  }

  /**
   * Start a scheduled task
   */
  startTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return false;
    }

    if (task.isActive) {
      console.log(`⚠️ Task already active: ${task.name}`);
      return false;
    }

    task.isActive = true;
    this.scheduleTask(task);
    console.log(`▶️ Started task: ${task.name}`);
    return true;
  }

  /**
   * Stop a scheduled task
   */
  stopTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return false;
    }

    task.isActive = false;
    const interval = this.intervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(taskId);
    }

    console.log(`⏹️ Stopped task: ${task.name}`);
    return true;
  }

  /**
   * Delete a scheduled task
   */
  deleteTask(taskId: string): boolean {
    this.stopTask(taskId);
    const deleted = this.tasks.delete(taskId);

    if (deleted) {
      console.log(`🗑️ Deleted task: ${taskId}`);
    }

    return deleted;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Run a task immediately
   */
  async runTaskNow(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.error(`❌ Task not found: ${taskId}`);
      return false;
    }

    console.log(`🚀 Running task immediately: ${task.name}`);
    await this.executeTask(task);
    return true;
  }

  /**
   * Schedule a task based on its frequency
   */
  private scheduleTask(task: ScheduledTask): void {
    if (!task.isActive) return;

    const intervalMs = this.getIntervalMs(task.frequency);

    const interval = setInterval(async () => {
      if (task.isActive) {
        await this.executeTask(task);
        task.nextRunAt = this.calculateNextRunTime(task.frequency);
      }
    }, intervalMs);

    this.intervals.set(task.id, interval);
  }

  /**
   * Execute a scheduled task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      console.log(`🔄 Executing task: ${task.name}`);
      task.lastRunAt = new Date();

      switch (task.type) {
        case 'order_sync':
          await this.executeOrderSyncTask(task);
          break;
        case 'status_sync':
          await this.executeStatusSyncTask(task);
          break;
        case 'inventory_sync':
          await this.executeInventorySyncTask(task);
          break;
        default:
          console.error(`❌ Unknown task type: ${task.type}`);
      }

      console.log(`✅ Task completed: ${task.name}`);
    } catch (error) {
      console.error(`❌ Task execution failed: ${task.name}`, error);
    }
  }

  /**
   * Execute order sync task
   */
  private async executeOrderSyncTask(task: ScheduledTask): Promise<void> {
    const result = await this.scheduledOrderSyncUseCase.execute({
      tenantId: task.tenantId,
      marketplaceCredentials: task.marketplaceCredentials,
      syncOptions: {
        frequency: task.frequency,
        maxOrdersPerSync: task.config.maxOrdersPerSync || 100,
        retryOnFailure: task.config.retryOnFailure || true,
        maxRetries: task.config.maxRetries || 3,
      },
    });

    console.log(
      `📊 Order sync result: ${result.totalSynced}/${result.totalProcessed} orders`
    );
  }

  /**
   * Execute status sync task
   */
  private async executeStatusSyncTask(task: ScheduledTask): Promise<void> {
    // TODO: Implement status sync logic
    console.log(`🔄 Status sync task: ${task.name}`);
  }

  /**
   * Execute inventory sync task
   */
  private async executeInventorySyncTask(task: ScheduledTask): Promise<void> {
    // TODO: Implement inventory sync logic
    console.log(`🔄 Inventory sync task: ${task.name}`);
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRunTime(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000);
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get interval milliseconds for frequency
   */
  private getIntervalMs(frequency: string): number {
    switch (frequency) {
      case 'hourly':
        return 60 * 60 * 1000; // 1 hour
      case 'daily':
        return 24 * 60 * 60 * 1000; // 1 day
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 1 week
      default:
        return 24 * 60 * 60 * 1000; // Default to 1 day
    }
  }

  /**
   * Cleanup all tasks
   */
  cleanup(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.tasks.clear();
    console.log('🧹 Cleaned up all scheduled tasks');
  }
}
