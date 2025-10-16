import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface DataConsent {
  id: string;
  userId: string;
  consentType: string;
  consentGiven: boolean;
  consentMethod: string;
  createdAt: string;
}

export interface DataAccessRequest {
  id: string;
  tenantId: string;
  userId?: string;
  customerId?: string;
  requestType: 'access' | 'export' | 'delete' | 'rectify' | 'restrict';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  dueDate: string;
  createdAt: string;
}

export class ComplianceService {
  /**
   * Record user consent
   */
  static async recordConsent(
    userId: string,
    consentType: string,
    consentGiven: boolean,
    consentMethod: string = 'web_form'
  ): Promise<DataConsent> {
    const { data, error } = await supabase
      .from('data_consents')
      .insert({
        user_id: userId,
        consent_type: consentType,
        consent_given: consentGiven,
        consent_method: consentMethod,
        ip_address: await this.getClientIp(),
        user_agent: navigator.userAgent,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has given consent
   */
  static async checkConsent(
    userId: string,
    consentType: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_user_consent', {
      p_user_id: userId,
      p_consent_type: consentType,
    });

    if (error) throw error;
    return data || false;
  }

  /**
   * Withdraw consent
   */
  static async withdrawConsent(
    userId: string,
    consentType: string
  ): Promise<void> {
    const { error } = await supabase
      .from('data_consents')
      .update({ withdrawn_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .is('withdrawn_at', null);

    if (error) throw error;
  }

  /**
   * Create data access request (GDPR Article 15)
   */
  static async createAccessRequest(
    tenantId: string,
    userId: string,
    requestType: 'access' | 'export' | 'delete' | 'rectify' | 'restrict',
    reason?: string
  ): Promise<DataAccessRequest> {
    const { data, error } = await supabase
      .from('data_access_requests')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        request_type: requestType,
        status: 'pending',
        reason,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pending access requests (admin)
   */
  static async getPendingAccessRequests(
    tenantId: string
  ): Promise<DataAccessRequest[]> {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  /**
   * Process data export request
   */
  static async exportUserData(userId: string): Promise<any> {
    const { data, error } = await supabase.rpc('export_user_data', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Anonymize user data
   */
  static async anonymizeUserData(userId: string): Promise<void> {
    const { error } = await supabase.rpc('anonymize_user_data', {
      p_user_id: userId,
    });

    if (error) throw error;
  }

  /**
   * Record cookie consent
   */
  static async recordCookieConsent(
    sessionId: string,
    consents: {
      necessary: boolean;
      functional: boolean;
      analytics: boolean;
      marketing: boolean;
    }
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from('cookie_consents').insert({
      session_id: sessionId,
      user_id: user.user?.id,
      necessary_cookies: consents.necessary,
      functional_cookies: consents.functional,
      analytics_cookies: consents.analytics,
      marketing_cookies: consents.marketing,
      ip_address: await this.getClientIp(),
      user_agent: navigator.userAgent,
    });

    if (error) throw error;
  }

  /**
   * Get cookie consent
   */
  static async getCookieConsent(sessionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('cookie_consents')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Log data deletion
   */
  static async logDataDeletion(
    tenantId: string,
    entityType: string,
    entityId: string,
    deletionType: 'anonymization' | 'soft_delete' | 'hard_delete',
    reason: string
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from('data_deletion_logs').insert({
      tenant_id: tenantId,
      entity_type: entityType,
      entity_id: entityId,
      deletion_type: deletionType,
      deletion_reason: reason,
      deleted_by: user.user?.id,
    });

    if (error) throw error;
  }

  /**
   * Log automated decision (GDPR Article 22)
   */
  static async logAutomatedDecision(
    tenantId: string,
    userId: string,
    decisionType: string,
    outcome: string,
    aiModel: string,
    confidenceScore: number,
    explanation: string
  ): Promise<void> {
    const { error } = await supabase.from('automated_decision_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      decision_type: decisionType,
      decision_outcome: outcome,
      ai_model_used: aiModel,
      confidence_score: confidenceScore,
      explanation,
    });

    if (error) throw error;
  }

  /**
   * Report data breach
   */
  static async reportDataBreach(
    tenantId: string,
    breachData: {
      incidentDate: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      breachType: string;
      affectedDataTypes: string[];
      affectedUsersCount: number;
      rootCause?: string;
    }
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from('data_breach_incidents').insert({
      tenant_id: tenantId,
      incident_date: breachData.incidentDate,
      severity: breachData.severity,
      breach_type: breachData.breachType,
      affected_data_types: breachData.affectedDataTypes,
      affected_users_count: breachData.affectedUsersCount,
      root_cause: breachData.rootCause,
      reported_by: user.user?.id,
      notification_required: breachData.affectedUsersCount > 0,
    });

    if (error) throw error;
  }

  /**
   * Get active privacy policy
   */
  static async getPrivacyPolicy(
    tenantId: string,
    languageCode: string = 'en'
  ): Promise<any> {
    const { data, error } = await supabase
      .from('privacy_policy_versions')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('language_code', languageCode)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Get data processing activities (GDPR Article 30)
   */
  static async getProcessingActivities(tenantId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('data_processing_activities')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('activity_name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get client IP address
   */
  private static async getClientIp(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    tenantId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalConsents: number;
    totalAccessRequests: number;
    pendingRequests: number;
    dataBreaches: number;
    automatedDecisions: number;
  }> {
    const [consents, requests, breaches, decisions] = await Promise.all([
      supabase
        .from('data_consents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('data_access_requests')
        .select('id, status', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('data_breach_incidents')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
      supabase
        .from('automated_decision_logs')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate)
        .lte('created_at', endDate),
    ]);

    const pendingRequests =
      requests.data?.filter(r => r.status === 'pending').length || 0;

    return {
      totalConsents: consents.count || 0,
      totalAccessRequests: requests.count || 0,
      pendingRequests,
      dataBreaches: breaches.count || 0,
      automatedDecisions: decisions.count || 0,
    };
  }
}
