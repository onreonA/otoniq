import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SalesForecast {
  id: string;
  tenantId: string;
  forecastDate: string;
  forecastPeriod: 'daily' | 'weekly' | 'monthly';
  predictedRevenue: number;
  predictedOrders: number;
  confidenceLower: number;
  confidenceUpper: number;
  actualRevenue?: number;
  forecastAccuracy?: number;
}

export interface DemandPrediction {
  id: string;
  productId: string;
  predictionDate: string;
  forecastHorizon: number;
  predictedDemand: number;
  predictedRevenue: number;
  confidenceScore: number;
  actualDemand?: number;
}

export interface PriceOptimization {
  id: string;
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChangePct: number;
  expectedRevenueIncrease: number;
  priceElasticity: number;
  marketPosition: string;
  recommendationReason: string;
  status: 'pending' | 'applied' | 'rejected';
}

export interface ChurnPrediction {
  id: string;
  customerId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  daysUntilChurn?: number;
  churnFactors: string[];
  retentionRecommendations: string[];
  customerLifetimeValue: number;
}

export class PredictiveAnalyticsService {
  /**
   * Get sales forecast for date range
   */
  static async getSalesForecast(
    tenantId: string,
    startDate: string,
    endDate: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<SalesForecast[]> {
    const { data, error } = await supabase
      .from('sales_forecasts')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('forecast_period', period)
      .gte('forecast_date', startDate)
      .lte('forecast_date', endDate)
      .order('forecast_date');

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate sales forecast (mock ML prediction)
   */
  static async generateSalesForecast(
    tenantId: string,
    daysAhead: number = 30
  ): Promise<SalesForecast[]> {
    // In production, this would call a real ML model
    const forecasts: SalesForecast[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      const baseRevenue = 10000 + Math.random() * 5000;
      const confidence = 0.95;

      forecasts.push({
        id: crypto.randomUUID(),
        tenantId,
        forecastDate: forecastDate.toISOString().split('T')[0],
        forecastPeriod: 'daily',
        predictedRevenue: baseRevenue,
        predictedOrders: Math.floor(baseRevenue / 150),
        confidenceLower: baseRevenue * (1 - confidence),
        confidenceUpper: baseRevenue * (1 + confidence),
      });
    }

    // Save to database
    const { error } = await supabase.from('sales_forecasts').upsert(
      forecasts.map(f => ({
        tenant_id: f.tenantId,
        forecast_date: f.forecastDate,
        forecast_period: f.forecastPeriod,
        predicted_revenue: f.predictedRevenue,
        predicted_orders: f.predictedOrders,
        confidence_lower: f.confidenceLower,
        confidence_upper: f.confidenceUpper,
      })),
      { onConflict: 'tenant_id,forecast_date,forecast_period' }
    );

    if (error) throw error;
    return forecasts;
  }

  /**
   * Get demand predictions for products
   */
  static async getDemandPredictions(
    tenantId: string,
    productIds?: string[]
  ): Promise<DemandPrediction[]> {
    let query = supabase
      .from('demand_predictions')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('prediction_date', { ascending: false });

    if (productIds && productIds.length > 0) {
      query = query.in('product_id', productIds);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get price optimization recommendations
   */
  static async getPriceOptimizations(
    tenantId: string,
    status: 'pending' | 'applied' | 'rejected' = 'pending'
  ): Promise<PriceOptimization[]> {
    const { data, error } = await supabase
      .from('price_optimization')
      .select('*, product:products(name)')
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .order('expected_revenue_increase', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }

  /**
   * Apply price optimization
   */
  static async applyPriceOptimization(optimizationId: string): Promise<void> {
    const { data: optimization, error: fetchError } = await supabase
      .from('price_optimization')
      .select('*')
      .eq('id', optimizationId)
      .single();

    if (fetchError) throw fetchError;

    // Update product price
    const { error: updateError } = await supabase
      .from('products')
      .update({ price: optimization.recommended_price })
      .eq('id', optimization.product_id);

    if (updateError) throw updateError;

    // Mark as applied
    const { error: statusError } = await supabase
      .from('price_optimization')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
      })
      .eq('id', optimizationId);

    if (statusError) throw statusError;
  }

  /**
   * Get high-risk churn customers
   */
  static async getHighRiskCustomers(
    tenantId: string,
    minCLV: number = 0
  ): Promise<ChurnPrediction[]> {
    const { data, error } = await supabase.rpc('get_high_risk_customers', {
      p_tenant_id: tenantId,
      p_min_clv: minCLV,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get churn predictions for all customers
   */
  static async getChurnPredictions(
    tenantId: string,
    riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<ChurnPrediction[]> {
    let query = supabase
      .from('churn_predictions')
      .select('*, customer:customers(email, name)')
      .eq('tenant_id', tenantId)
      .order('churn_probability', { ascending: false });

    if (riskLevel) {
      query = query.eq('risk_level', riskLevel);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate demand predictions (mock ML)
   */
  static async generateDemandPredictions(
    tenantId: string,
    productIds: string[]
  ): Promise<DemandPrediction[]> {
    const predictions: DemandPrediction[] = [];
    const today = new Date();

    for (const productId of productIds) {
      for (let days = 1; days <= 30; days++) {
        const predictionDate = new Date(today);
        predictionDate.setDate(today.getDate() + days);

        const baseDemand = 10 + Math.floor(Math.random() * 40);
        const seasonalityFactor = 1 + Math.sin(days / 7) * 0.2;

        predictions.push({
          id: crypto.randomUUID(),
          productId,
          predictionDate: predictionDate.toISOString().split('T')[0],
          forecastHorizon: days,
          predictedDemand: Math.floor(baseDemand * seasonalityFactor),
          predictedRevenue: baseDemand * seasonalityFactor * 50,
          confidenceScore: 0.8 - days * 0.01,
        });
      }
    }

    // Save to database
    const { error } = await supabase.from('demand_predictions').upsert(
      predictions.map(p => ({
        tenant_id: tenantId,
        product_id: p.productId,
        prediction_date: p.predictionDate,
        forecast_horizon: p.forecastHorizon,
        predicted_demand: p.predictedDemand,
        predicted_revenue: p.predictedRevenue,
        confidence_score: p.confidenceScore,
      })),
      { onConflict: 'tenant_id,product_id,prediction_date,forecast_horizon' }
    );

    if (error) throw error;
    return predictions;
  }

  /**
   * Get anomaly detections
   */
  static async getAnomalies(
    tenantId: string,
    unresolvedOnly: boolean = true
  ): Promise<any[]> {
    let query = supabase
      .from('anomaly_detections')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (unresolvedOnly) {
      query = query.eq('is_resolved', false);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;
    return data || [];
  }

  /**
   * Resolve anomaly
   */
  static async resolveAnomaly(anomalyId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('anomaly_detections')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user.user?.id,
      })
      .eq('id', anomalyId);

    if (error) throw error;
  }
}
