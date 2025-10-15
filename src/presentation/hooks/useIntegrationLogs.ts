/**
 * useIntegrationLogs Hook
 * React hook for integration logging operations
 */

import { useState, useEffect, useCallback } from 'react';
import { SupabaseIntegrationLogRepository } from '../../infrastructure/database/supabase/repositories/SupabaseIntegrationLogRepository';
import { IntegrationLogService } from '../../infrastructure/services/IntegrationLogService';
import {
  IntegrationLog,
  IntegrationStats,
  IntegrationType,
} from '../../domain/entities/IntegrationLog';
import { LogFilters } from '../../domain/repositories/IIntegrationLogRepository';
import { useAuth } from './useAuth';

const repository = new SupabaseIntegrationLogRepository();
const service = new IntegrationLogService(repository);

export const useIntegrationLogs = (
  integrationType?: IntegrationType,
  filters?: LogFilters
) => {
  const { user, tenantId } = useAuth();
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      let data: IntegrationLog[];

      if (integrationType) {
        data = await service.getByIntegrationType(
          integrationType,
          tenantId,
          filters?.limit
        );
      } else {
        data = await service.getAll(tenantId, filters);
      }

      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      console.error('Error fetching integration logs:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, integrationType, filters]);

  const fetchStats = useCallback(async () => {
    if (!tenantId || !integrationType) return;

    try {
      const data = await service.getStats(tenantId, integrationType);
      setStats(data);
    } catch (err) {
      console.error('Error fetching integration stats:', err);
    }
  }, [tenantId, integrationType]);

  const getRecentLogs = async (hours: number = 24, limit: number = 50) => {
    if (!tenantId) return [];

    try {
      return await service.getRecentLogs(tenantId, hours, limit);
    } catch (err) {
      console.error('Error fetching recent logs:', err);
      return [];
    }
  };

  const getFailedLogs = async (limit: number = 20) => {
    if (!tenantId) return [];

    try {
      return await service.getFailedLogs(tenantId, limit);
    } catch (err) {
      console.error('Error fetching failed logs:', err);
      return [];
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchLogs();
      if (integrationType) {
        fetchStats();
      }
    }
  }, [tenantId, integrationType, fetchLogs, fetchStats]);

  return {
    logs,
    stats,
    loading,
    error,
    fetchLogs,
    fetchStats,
    getRecentLogs,
    getFailedLogs,
    service, // Expose service for direct operations
  };
};
