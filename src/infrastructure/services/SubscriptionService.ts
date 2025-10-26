/**
 * Subscription Service
 *
 * Manages subscription plans, tenant subscriptions, trials, and usage limits.
 */

import { getSupabaseClient } from '../database/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  display_name: string;
  description: string | null;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  discount_yearly_percent: number;
  features: Record<string, any>;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  badge_text: string | null;
  badge_color: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status:
    | 'trial'
    | 'active'
    | 'past_due'
    | 'suspended'
    | 'cancelled'
    | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  billing_email: string | null;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  cancel_at_period_end: boolean;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  next_payment_date: string | null;
  next_payment_amount: number | null;
  usage_data: Record<string, any>;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  cancellation_reason: string | null;
  admin_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  plan_name: string;
  display_name: string;
  description?: string;
  tagline?: string;
  price_monthly: number;
  price_yearly: number;
  currency?: string;
  discount_yearly_percent?: number;
  features: Record<string, any>;
  is_popular?: boolean;
  is_active?: boolean;
  sort_order?: number;
  badge_text?: string;
  badge_color?: string;
}

export type UpdatePlanRequest = Partial<CreatePlanRequest>;

export interface CreateSubscriptionRequest {
  tenant_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  billing_email?: string;
  is_trial?: boolean;
  trial_days?: number;
}

export interface UpdateSubscriptionRequest {
  plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  billing_email?: string;
  status?: TenantSubscription['status'];
  auto_renew?: boolean;
  cancel_at_period_end?: boolean;
  admin_notes?: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  cancelled_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate: number;
}

// ============================================================================
// SUBSCRIPTION SERVICE
// ============================================================================

export class SubscriptionService {
  private supabase = getSupabaseClient();

  // ==========================================================================
  // PLAN MANAGEMENT
  // ==========================================================================

  /**
   * Get all subscription plans
   */
  async getAllPlans(includeInactive = false): Promise<SubscriptionPlan[]> {
    try {
      let query = this.supabase
        .from('subscription_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    }
  }

  /**
   * Get plan by name
   */
  async getPlanByName(planName: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('plan_name', planName)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching plan by name:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(request: CreatePlanRequest): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .insert([
          {
            ...request,
            currency: request.currency || 'TRY',
            discount_yearly_percent: request.discount_yearly_percent || 0,
            is_popular: request.is_popular || false,
            is_active: request.is_active !== false,
            sort_order: request.sort_order || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  /**
   * Update a subscription plan
   */
  async updatePlan(
    planId: string,
    request: UpdatePlanRequest
  ): Promise<SubscriptionPlan> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .update(request)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(planId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  // ==========================================================================
  // TENANT SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  /**
   * Get tenant's active subscription
   */
  async getTenantSubscription(
    tenantId: string
  ): Promise<TenantSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('status', ['trial', 'active', 'past_due'])
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    } catch (error) {
      console.error('Error fetching tenant subscription:', error);
      throw error;
    }
  }

  /**
   * Get tenant subscription with plan details
   */
  async getTenantSubscriptionWithPlan(tenantId: string) {
    try {
      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .eq('tenant_id', tenantId)
        .in('status', ['trial', 'active', 'past_due'])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tenant subscription with plan:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription for a tenant
   */
  async createSubscription(
    request: CreateSubscriptionRequest
  ): Promise<TenantSubscription> {
    try {
      const plan = await this.getPlanById(request.plan_id);
      if (!plan) throw new Error('Plan not found');

      const now = new Date();
      const isTrial = request.is_trial || false;
      const trialDays = request.trial_days || 14;

      const periodStart = now;
      const periodEnd = new Date(now);
      let trialEndsAt = null;

      if (isTrial) {
        // Trial period
        periodEnd.setDate(periodEnd.getDate() + trialDays);
        trialEndsAt = periodEnd;
      } else {
        // Paid subscription
        if (request.billing_cycle === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }
      }

      const nextPaymentAmount =
        request.billing_cycle === 'yearly'
          ? plan.price_yearly
          : plan.price_monthly;

      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .insert([
          {
            tenant_id: request.tenant_id,
            plan_id: request.plan_id,
            billing_cycle: request.billing_cycle,
            billing_email: request.billing_email,
            status: isTrial ? 'trial' : 'active',
            current_period_start: periodStart.toISOString().split('T')[0],
            current_period_end: periodEnd.toISOString().split('T')[0],
            trial_ends_at: trialEndsAt
              ? trialEndsAt.toISOString().split('T')[0]
              : null,
            next_payment_date: periodEnd.toISOString().split('T')[0],
            next_payment_amount: isTrial ? 0 : nextPaymentAmount,
            auto_renew: true,
            cancel_at_period_end: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Initialize usage quotas based on plan features
      await this.initializeUsageQuotas(request.tenant_id, plan.features);

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update a subscription
   */
  async updateSubscription(
    subscriptionId: string,
    request: UpdateSubscriptionRequest
  ): Promise<TenantSubscription> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .update(request)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    cancelImmediately = false
  ): Promise<TenantSubscription> {
    try {
      const updateData: any = {
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      };

      if (cancelImmediately) {
        updateData.status = 'cancelled';
        updateData.auto_renew = false;
      } else {
        updateData.cancel_at_period_end = true;
        updateData.auto_renew = false;
      }

      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Reactivate a cancelled subscription
   */
  async reactivateSubscription(
    subscriptionId: string
  ): Promise<TenantSubscription> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .update({
          status: 'active',
          cancel_at_period_end: false,
          auto_renew: true,
          cancelled_at: null,
          cancellation_reason: null,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Renew a subscription
   */
  async renewSubscription(subscriptionId: string): Promise<TenantSubscription> {
    try {
      const subscription = await this.supabase
        .from('tenant_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subscription.error) throw subscription.error;

      const plan = await this.getPlanById(subscription.data.plan_id);
      if (!plan) throw new Error('Plan not found');

      const currentEnd = new Date(subscription.data.current_period_end);
      const newEnd = new Date(currentEnd);

      if (subscription.data.billing_cycle === 'yearly') {
        newEnd.setFullYear(newEnd.getFullYear() + 1);
      } else {
        newEnd.setMonth(newEnd.getMonth() + 1);
      }

      const nextPaymentAmount =
        subscription.data.billing_cycle === 'yearly'
          ? plan.price_yearly
          : plan.price_monthly;

      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .update({
          current_period_start: currentEnd.toISOString().split('T')[0],
          current_period_end: newEnd.toISOString().split('T')[0],
          last_payment_date: new Date().toISOString().split('T')[0],
          last_payment_amount: nextPaymentAmount,
          next_payment_date: newEnd.toISOString().split('T')[0],
          next_payment_amount: nextPaymentAmount,
          status: 'active',
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  // ==========================================================================
  // TRIAL MANAGEMENT
  // ==========================================================================

  /**
   * Start a trial for a tenant
   */
  async startTrial(
    tenantId: string,
    planId: string,
    trialDays = 14
  ): Promise<TenantSubscription> {
    return this.createSubscription({
      tenant_id: tenantId,
      plan_id: planId,
      billing_cycle: 'monthly',
      is_trial: true,
      trial_days: trialDays,
    });
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrialToPaid(
    subscriptionId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<TenantSubscription> {
    try {
      const subscription = await this.supabase
        .from('tenant_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (subscription.error) throw subscription.error;

      const plan = await this.getPlanById(subscription.data.plan_id);
      if (!plan) throw new Error('Plan not found');

      const now = new Date();
      const periodEnd = new Date(now);

      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const nextPaymentAmount =
        billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

      const { data, error } = await this.supabase
        .from('tenant_subscriptions')
        .update({
          status: 'active',
          billing_cycle: billingCycle,
          current_period_start: now.toISOString().split('T')[0],
          current_period_end: periodEnd.toISOString().split('T')[0],
          next_payment_date: periodEnd.toISOString().split('T')[0],
          next_payment_amount: nextPaymentAmount,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error converting trial to paid:', error);
      throw error;
    }
  }

  // ==========================================================================
  // USAGE LIMITS
  // ==========================================================================

  /**
   * Initialize usage quotas for a tenant based on plan features
   */
  private async initializeUsageQuotas(
    tenantId: string,
    features: Record<string, any>
  ): Promise<void> {
    try {
      const quotas = [
        {
          metric_name: 'products_count',
          quota_limit: features.max_products || -1,
        },
        { metric_name: 'users_count', quota_limit: features.max_users || -1 },
        {
          metric_name: 'ai_credits_used',
          quota_limit: features.ai_credits_monthly || -1,
        },
        {
          metric_name: 'storage_used_bytes',
          quota_limit: features.storage_gb
            ? features.storage_gb * 1024 * 1024 * 1024
            : -1,
        },
        {
          metric_name: 'api_calls',
          quota_limit: features.api_calls_per_day || -1,
        },
      ];

      for (const quota of quotas) {
        await this.supabase.from('usage_quotas').insert([
          {
            tenant_id: tenantId,
            ...quota,
            reset_period: 'monthly',
          },
        ]);
      }
    } catch (error) {
      console.error('Error initializing usage quotas:', error);
      // Don't throw, just log
    }
  }

  /**
   * Check if tenant has exceeded usage limit
   */
  async checkUsageLimit(
    tenantId: string,
    metric: string
  ): Promise<{ exceeded: boolean; current: number; limit: number }> {
    try {
      const { data, error } = await this.supabase
        .from('usage_quotas')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('metric_name', metric)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return { exceeded: false, current: 0, limit: -1 };
      }

      return {
        exceeded: data.is_exceeded,
        current: data.current_usage,
        limit: data.quota_limit,
      };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      throw error;
    }
  }

  /**
   * Increment usage for a metric
   */
  async incrementUsage(
    tenantId: string,
    metric: string,
    value = 1
  ): Promise<void> {
    try {
      // Call the database function
      const { error } = await this.supabase.rpc('increment_usage', {
        p_tenant_id: tenantId,
        p_metric_name: metric,
        p_value: value,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      // Get subscription counts
      const { data: subscriptions, error: subsError } = await this.supabase
        .from('tenant_subscriptions')
        .select('status, billing_cycle, next_payment_amount');

      if (subsError) throw subsError;

      const total = subscriptions?.length || 0;
      const active =
        subscriptions?.filter(s => s.status === 'active').length || 0;
      const trial =
        subscriptions?.filter(s => s.status === 'trial').length || 0;
      const cancelled =
        subscriptions?.filter(s => s.status === 'cancelled').length || 0;

      // Calculate MRR (Monthly Recurring Revenue)
      const mrr =
        subscriptions
          ?.filter(s => s.status === 'active')
          .reduce((sum, s) => {
            const amount =
              s.billing_cycle === 'yearly'
                ? (s.next_payment_amount || 0) / 12
                : s.next_payment_amount || 0;
            return sum + amount;
          }, 0) || 0;

      // Calculate ARR (Annual Recurring Revenue)
      const arr = mrr * 12;

      // Calculate churn rate (simplified)
      const churnRate = total > 0 ? (cancelled / total) * 100 : 0;

      return {
        total_subscriptions: total,
        active_subscriptions: active,
        trial_subscriptions: trial,
        cancelled_subscriptions: cancelled,
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(arr * 100) / 100,
        churn_rate: Math.round(churnRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions (for admin)
   */
  async getAllSubscriptions() {
    try {
      const { data, error } = await this.supabase
        .from('active_subscriptions_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
