/**
 * Integration Log Service
 * Business logic for integration logging and monitoring
 */

import {
  IIntegrationLogRepository,
  LogFilters,
} from '../../domain/repositories/IIntegrationLogRepository';
import {
  IntegrationLog,
  CreateIntegrationLogDTO,
  UpdateIntegrationLogDTO,
  IntegrationStats,
  IntegrationType,
} from '../../domain/entities/IntegrationLog';

export class IntegrationLogService {
  constructor(private repository: IIntegrationLogRepository) {}

  async getAll(
    tenantId: string,
    filters?: LogFilters
  ): Promise<IntegrationLog[]> {
    return this.repository.getAll(tenantId, filters);
  }

  async getById(id: string, tenantId: string): Promise<IntegrationLog | null> {
    return this.repository.getById(id, tenantId);
  }

  async create(
    data: CreateIntegrationLogDTO,
    tenantId: string,
    userId?: string
  ): Promise<IntegrationLog> {
    // Set default values
    const logData = {
      ...data,
      status: data.status || 'pending',
      entityCount: data.entityCount || 0,
    };

    return this.repository.create(logData, tenantId, userId);
  }

  async update(
    id: string,
    data: UpdateIntegrationLogDTO,
    tenantId: string
  ): Promise<IntegrationLog> {
    return this.repository.update(id, data, tenantId);
  }

  async complete(
    id: string,
    tenantId: string,
    options: {
      success?: boolean;
      successCount?: number;
      errorCount?: number;
      responseData?: Record<string, unknown>;
      errorMessage?: string;
    }
  ): Promise<IntegrationLog> {
    const startLog = await this.repository.getById(id, tenantId);
    if (!startLog) {
      throw new Error('Integration log not found');
    }

    const completedAt = new Date();
    const durationMs = startLog.startedAt
      ? completedAt.getTime() - startLog.startedAt.getTime()
      : undefined;

    const status = options.success === false ? 'failed' : 'success';

    return this.repository.update(
      id,
      {
        status,
        successCount: options.successCount || 0,
        errorCount: options.errorCount || 0,
        completedAt,
        durationMs,
        responseData: options.responseData,
        errorMessage: options.errorMessage,
      },
      tenantId
    );
  }

  async fail(
    id: string,
    tenantId: string,
    errorMessage: string,
    errorDetails?: Record<string, unknown>
  ): Promise<IntegrationLog> {
    const startLog = await this.repository.getById(id, tenantId);
    if (!startLog) {
      throw new Error('Integration log not found');
    }

    const completedAt = new Date();
    const durationMs = startLog.startedAt
      ? completedAt.getTime() - startLog.startedAt.getTime()
      : undefined;

    return this.repository.update(
      id,
      {
        status: 'failed',
        completedAt,
        durationMs,
        errorMessage,
        errorDetails,
      },
      tenantId
    );
  }

  async delete(id: string, tenantId: string): Promise<void> {
    return this.repository.delete(id, tenantId);
  }

  async getByIntegrationType(
    integrationType: IntegrationType,
    tenantId: string,
    limit?: number
  ): Promise<IntegrationLog[]> {
    return this.repository.getByIntegrationType(
      integrationType,
      tenantId,
      limit
    );
  }

  async getRecentLogs(
    tenantId: string,
    hours?: number,
    limit?: number
  ): Promise<IntegrationLog[]> {
    return this.repository.getRecentLogs(tenantId, hours, limit);
  }

  async getFailedLogs(
    tenantId: string,
    limit?: number
  ): Promise<IntegrationLog[]> {
    return this.repository.getFailedLogs(tenantId, limit);
  }

  async getStats(
    tenantId: string,
    integrationType: IntegrationType,
    startDate?: Date
  ): Promise<IntegrationStats> {
    return this.repository.getStats(tenantId, integrationType, startDate);
  }

  async getHealthSummary(tenantId: string) {
    return this.repository.getHealthSummary(tenantId);
  }

  // Helper to log a complete sync operation
  async logSync(
    tenantId: string,
    integrationType: IntegrationType,
    operation: () => Promise<{
      success: boolean;
      successCount?: number;
      errorCount?: number;
      responseData?: Record<string, unknown>;
      errorMessage?: string;
    }>,
    options?: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<IntegrationLog> {
    // Create initial log
    const log = await this.create(
      {
        integrationType,
        operationType: 'sync',
        direction: 'bidirectional',
        entityType: options?.entityType,
        entityId: options?.entityId,
        status: 'running',
        metadata: options?.metadata,
      },
      tenantId,
      options?.userId
    );

    try {
      // Execute the operation
      const result = await operation();

      // Update log with success/failure
      return await this.complete(log.id, tenantId, result);
    } catch (error) {
      // Log the failure
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return await this.fail(log.id, tenantId, errorMessage, {
        error: String(error),
      });
    }
  }
}
