/**
 * Integration Log Repository Interface
 */

import {
  IntegrationLog,
  CreateIntegrationLogDTO,
  UpdateIntegrationLogDTO,
  IntegrationStats,
  IntegrationType,
  LogStatus,
} from '../entities/IntegrationLog';

export interface IIntegrationLogRepository {
  // CRUD operations
  getAll(tenantId: string, filters?: LogFilters): Promise<IntegrationLog[]>;
  getById(id: string, tenantId: string): Promise<IntegrationLog | null>;
  create(
    data: CreateIntegrationLogDTO,
    tenantId: string,
    userId?: string
  ): Promise<IntegrationLog>;
  update(
    id: string,
    data: UpdateIntegrationLogDTO,
    tenantId: string
  ): Promise<IntegrationLog>;
  delete(id: string, tenantId: string): Promise<void>;

  // Integration-specific queries
  getByIntegrationType(
    integrationType: IntegrationType,
    tenantId: string,
    limit?: number
  ): Promise<IntegrationLog[]>;
  getRecentLogs(tenantId: string, hours?: number, limit?: number): Promise<IntegrationLog[]>;
  getFailedLogs(tenantId: string, limit?: number): Promise<IntegrationLog[]>;

  // Statistics
  getStats(
    tenantId: string,
    integrationType: IntegrationType,
    startDate?: Date
  ): Promise<IntegrationStats>;
  getHealthSummary(tenantId: string): Promise<IntegrationHealthSummary[]>;
}

export interface LogFilters {
  integrationType?: IntegrationType;
  operationType?: string;
  status?: LogStatus;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IntegrationHealthSummary {
  integrationType: IntegrationType;
  totalOperations: number;
  successful: number;
  failed: number;
  partial: number;
  avgDurationMs: number;
  lastSyncAt?: Date;
  successRate: number;
}

