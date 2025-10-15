/**
 * Integration Log Domain Entities
 */

export type IntegrationType =
  | 'odoo'
  | 'shopify'
  | 'trendyol'
  | 'n11'
  | 'hepsiburada'
  | 'amazon'
  | 'etsy'
  | 'ebay'
  | 'custom';

export type OperationType = 'sync' | 'import' | 'export' | 'webhook' | 'manual';
export type Direction = 'inbound' | 'outbound' | 'bidirectional';
export type LogStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'partial_success'
  | 'failed'
  | 'cancelled';

export interface IntegrationLog {
  id: string;
  tenantId: string;

  // Integration Details
  integrationType: IntegrationType;
  operationType: OperationType;
  direction: Direction;

  // Operation Details
  entityType?: string;
  entityId?: string;
  entityCount: number;

  // Status & Results
  status: LogStatus;
  successCount: number;
  errorCount: number;
  warningCount: number;

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;

  // Details
  requestData?: Record<string, unknown>;
  responseData?: Record<string, unknown>;
  errorMessage?: string;
  errorDetails?: Record<string, unknown>;
  warnings?: string[];
  metadata?: Record<string, unknown>;

  // Tracking
  triggeredBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntegrationLogDTO {
  integrationType: IntegrationType;
  operationType: OperationType;
  direction: Direction;
  entityType?: string;
  entityId?: string;
  entityCount?: number;
  status?: LogStatus;
  requestData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateIntegrationLogDTO {
  status?: LogStatus;
  successCount?: number;
  errorCount?: number;
  warningCount?: number;
  completedAt?: Date;
  durationMs?: number;
  responseData?: Record<string, unknown>;
  errorMessage?: string;
  errorDetails?: Record<string, unknown>;
  warnings?: string[];
}

export interface IntegrationStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalEntities: number;
  successRate: number;
  avgDurationMs: number;
  lastSyncAt?: Date;
}
