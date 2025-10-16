-- Week 12: Advanced AI & ML - Predictive Analytics & ML Models

-- 1. ML models registry
CREATE TABLE IF NOT EXISTS ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  model_type VARCHAR(100) NOT NULL, -- 'sales_forecast', 'demand_prediction', 'price_optimization', 'churn_prediction'
  model_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  algorithm VARCHAR(100), -- 'linear_regression', 'random_forest', 'neural_network', 'arima'
  hyperparameters JSONB DEFAULT '{}'::jsonb,
  training_data_start DATE,
  training_data_end DATE,
  accuracy_score DECIMAL(5,4),
  mae DECIMAL(10,2), -- Mean Absolute Error
  rmse DECIMAL(10,2), -- Root Mean Square Error
  status VARCHAR(50) DEFAULT 'training', -- 'training', 'active', 'deprecated', 'failed'
  is_active BOOLEAN DEFAULT false,
  trained_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, model_type, version)
);

-- 2. Sales forecasts
CREATE TABLE IF NOT EXISTS sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  forecast_date DATE NOT NULL,
  forecast_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  predicted_revenue DECIMAL(12,2),
  predicted_orders INTEGER,
  predicted_units INTEGER,
  confidence_lower DECIMAL(12,2), -- Lower bound of confidence interval
  confidence_upper DECIMAL(12,2), -- Upper bound of confidence interval
  confidence_level DECIMAL(3,2) DEFAULT 0.95, -- 95% confidence
  actual_revenue DECIMAL(12,2), -- Filled after actual data is available
  actual_orders INTEGER,
  forecast_accuracy DECIMAL(5,2), -- Percentage accuracy
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, forecast_date, forecast_period)
);

-- 3. Demand predictions (product-level)
CREATE TABLE IF NOT EXISTS demand_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  prediction_date DATE NOT NULL,
  forecast_horizon INTEGER NOT NULL, -- Days ahead
  predicted_demand INTEGER NOT NULL,
  predicted_revenue DECIMAL(12,2),
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  seasonality_factor DECIMAL(5,4) DEFAULT 1.0,
  trend_factor DECIMAL(5,4) DEFAULT 1.0,
  actual_demand INTEGER,
  prediction_accuracy DECIMAL(5,2),
  factors JSONB DEFAULT '{}'::jsonb, -- Contributing factors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, product_id, prediction_date, forecast_horizon)
);

-- 4. Price optimization recommendations
CREATE TABLE IF NOT EXISTS price_optimization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  current_price DECIMAL(10,2) NOT NULL,
  recommended_price DECIMAL(10,2) NOT NULL,
  price_change_pct DECIMAL(5,2),
  expected_revenue_increase DECIMAL(10,2),
  expected_demand_change INTEGER,
  price_elasticity DECIMAL(5,4), -- Price elasticity coefficient
  competitor_avg_price DECIMAL(10,2),
  market_position VARCHAR(50), -- 'premium', 'competitive', 'discount'
  recommendation_reason TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  valid_from DATE,
  valid_until DATE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'applied', 'rejected', 'expired'
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Customer churn predictions
CREATE TABLE IF NOT EXISTS churn_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  prediction_date DATE DEFAULT CURRENT_DATE,
  churn_probability DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
  risk_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  predicted_churn_date DATE,
  days_until_churn INTEGER,
  churn_factors JSONB DEFAULT '[]'::jsonb, -- Top factors contributing to churn
  retention_recommendations JSONB DEFAULT '[]'::jsonb,
  customer_lifetime_value DECIMAL(12,2),
  engagement_score DECIMAL(3,2),
  last_purchase_days INTEGER,
  purchase_frequency DECIMAL(5,2),
  actual_churned BOOLEAN,
  churned_at DATE,
  prediction_accuracy BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, customer_id, prediction_date)
);

-- 6. Product recommendations (ML-based)
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  model_id UUID REFERENCES ml_models(id) ON DELETE SET NULL,
  source_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommended_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL, -- 'cross_sell', 'up_sell', 'similar', 'frequently_bought_together'
  confidence_score DECIMAL(3,2) NOT NULL,
  recommendation_strength VARCHAR(20), -- 'weak', 'moderate', 'strong'
  co_purchase_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4),
  avg_order_value_increase DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, source_product_id, recommended_product_id, recommendation_type)
);

-- 7. Anomaly detection logs
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  detection_type VARCHAR(100) NOT NULL, -- 'sales_spike', 'sales_drop', 'inventory_shortage', 'price_anomaly'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  entity_type VARCHAR(50), -- 'product', 'category', 'customer', 'order'
  entity_id UUID,
  detected_value DECIMAL(12,2),
  expected_value DECIMAL(12,2),
  deviation_pct DECIMAL(5,2),
  anomaly_score DECIMAL(5,4), -- 0.00 to 1.00
  detection_algorithm VARCHAR(100), -- 'isolation_forest', 'z_score', 'moving_average'
  description TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_ml_models_tenant_id ON ml_models(tenant_id);
CREATE INDEX idx_ml_models_type_status ON ml_models(model_type, status);
CREATE INDEX idx_sales_forecasts_tenant_date ON sales_forecasts(tenant_id, forecast_date);
CREATE INDEX idx_demand_predictions_product ON demand_predictions(product_id, prediction_date);
CREATE INDEX idx_price_optimization_product ON price_optimization(product_id, status);
CREATE INDEX idx_churn_predictions_customer ON churn_predictions(customer_id);
CREATE INDEX idx_churn_predictions_risk ON churn_predictions(risk_level, churn_probability);
CREATE INDEX idx_churn_predictions_date ON churn_predictions(prediction_date);
CREATE INDEX idx_product_recommendations_source ON product_recommendations(source_product_id);
CREATE INDEX idx_anomaly_detections_tenant_type ON anomaly_detections(tenant_id, detection_type, created_at);
CREATE INDEX idx_anomaly_detections_unresolved ON anomaly_detections(tenant_id, is_resolved) WHERE is_resolved = false;

-- RLS Policies
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;

-- ML models policies
CREATE POLICY "Users can view ML models in their tenant"
  ON ml_models FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage ML models"
  ON ml_models FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Forecasts policies (read access for all users in tenant)
CREATE POLICY "Users can view sales forecasts in their tenant"
  ON sales_forecasts FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view demand predictions in their tenant"
  ON demand_predictions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view price optimization in their tenant"
  ON price_optimization FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view churn predictions in their tenant"
  ON churn_predictions FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view product recommendations in their tenant"
  ON product_recommendations FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view anomalies in their tenant"
  ON anomaly_detections FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Update triggers
CREATE TRIGGER update_ml_models_updated_at
  BEFORE UPDATE ON ml_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_optimization_updated_at
  BEFORE UPDATE ON price_optimization
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_churn_predictions_updated_at
  BEFORE UPDATE ON churn_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to get sales forecast summary
CREATE OR REPLACE FUNCTION get_sales_forecast_summary(
  p_tenant_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_predicted_revenue DECIMAL,
  total_predicted_orders INTEGER,
  avg_confidence_level DECIMAL,
  forecast_accuracy DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(predicted_revenue)::DECIMAL,
    SUM(predicted_orders)::INTEGER,
    AVG(confidence_level)::DECIMAL,
    AVG(forecast_accuracy)::DECIMAL
  FROM sales_forecasts
  WHERE tenant_id = p_tenant_id
    AND forecast_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get high-risk churn customers
CREATE OR REPLACE FUNCTION get_high_risk_customers(
  p_tenant_id UUID,
  p_min_clv DECIMAL DEFAULT 0
) RETURNS TABLE (
  customer_id UUID,
  churn_probability DECIMAL,
  days_until_churn INTEGER,
  customer_lifetime_value DECIMAL,
  churn_factors JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.customer_id,
    cp.churn_probability,
    cp.days_until_churn,
    cp.customer_lifetime_value,
    cp.churn_factors
  FROM churn_predictions cp
  WHERE cp.tenant_id = p_tenant_id
    AND cp.risk_level IN ('high', 'critical')
    AND cp.customer_lifetime_value >= p_min_clv
    AND cp.created_at = (
      SELECT MAX(created_at)
      FROM churn_predictions
      WHERE customer_id = cp.customer_id
    )
  ORDER BY cp.churn_probability DESC, cp.customer_lifetime_value DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get product recommendations
CREATE OR REPLACE FUNCTION get_product_recommendations_for(
  p_product_id UUID,
  p_recommendation_type VARCHAR DEFAULT NULL,
  p_min_confidence DECIMAL DEFAULT 0.50
) RETURNS TABLE (
  recommended_product_id UUID,
  product_name VARCHAR,
  confidence_score DECIMAL,
  recommendation_type VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.recommended_product_id,
    p.name,
    pr.confidence_score,
    pr.recommendation_type
  FROM product_recommendations pr
  JOIN products p ON pr.recommended_product_id = p.id
  WHERE pr.source_product_id = p_product_id
    AND pr.is_active = true
    AND pr.confidence_score >= p_min_confidence
    AND (p_recommendation_type IS NULL OR pr.recommendation_type = p_recommendation_type)
  ORDER BY pr.confidence_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

