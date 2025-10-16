-- Week 9: IoT & Advanced Features - IoT Platform, Amazon/Hepsiburada APIs, Performance

-- 1. IoT devices
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100) NOT NULL, -- 'temperature_sensor', 'humidity_sensor', 'camera', 'scale', 'barcode_scanner'
  device_model VARCHAR(100),
  device_serial VARCHAR(255) UNIQUE,
  mac_address VARCHAR(17),
  ip_address INET,
  -- Location
  location_name VARCHAR(255),
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  location_coordinates JSONB, -- {"lat": 41.0082, "lng": 28.9784}
  -- Connection
  connection_type VARCHAR(50) NOT NULL, -- 'wifi', 'ethernet', 'cellular', 'bluetooth', 'zigbee'
  connection_status VARCHAR(50) DEFAULT 'offline', -- 'online', 'offline', 'maintenance', 'error'
  last_seen_at TIMESTAMP WITH TIME ZONE,
  firmware_version VARCHAR(50),
  battery_level INTEGER, -- 0-100 for battery-powered devices
  -- Configuration
  sampling_interval_seconds INTEGER DEFAULT 60,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  device_settings JSONB DEFAULT '{}'::jsonb,
  -- Security
  device_key TEXT, -- Encryption key for device communication
  is_secure BOOLEAN DEFAULT false,
  last_security_check TIMESTAMP WITH TIME ZONE,
  -- Status
  is_active BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  installation_date DATE,
  warranty_expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. IoT sensor data
CREATE TABLE IF NOT EXISTS iot_sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES iot_devices(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- Data
  sensor_type VARCHAR(100) NOT NULL, -- 'temperature', 'humidity', 'weight', 'motion', 'door_status'
  sensor_value DECIMAL(10,4) NOT NULL,
  sensor_unit VARCHAR(20), -- 'celsius', 'fahrenheit', 'percent', 'kg', 'boolean'
  raw_data JSONB, -- Original sensor payload
  -- Quality
  data_quality VARCHAR(20) DEFAULT 'good', -- 'good', 'warning', 'poor', 'error'
  signal_strength INTEGER, -- RSSI or similar
  -- Timestamp
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Amazon marketplace listings
CREATE TABLE IF NOT EXISTS amazon_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  -- Amazon identifiers
  asin VARCHAR(20) UNIQUE,
  seller_sku VARCHAR(100),
  amazon_product_id VARCHAR(50),
  marketplace_id VARCHAR(20) DEFAULT 'A1PA6795UKMFR9', -- Amazon Turkey
  -- Listing details
  listing_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'inactive', 'suppressed', 'incomplete'
  fulfillment_channel VARCHAR(20) DEFAULT 'MFN', -- 'MFN' (Merchant), 'AFN' (Amazon)
  amazon_title TEXT,
  amazon_description TEXT,
  amazon_bullet_points JSONB DEFAULT '[]'::jsonb,
  amazon_keywords TEXT,
  amazon_category VARCHAR(255),
  amazon_subcategory VARCHAR(255),
  -- Pricing
  amazon_price DECIMAL(10,2),
  amazon_sale_price DECIMAL(10,2),
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  minimum_price DECIMAL(10,2),
  maximum_price DECIMAL(10,2),
  -- Inventory
  amazon_quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  inbound_quantity INTEGER DEFAULT 0,
  -- Images
  amazon_main_image TEXT,
  amazon_additional_images JSONB DEFAULT '[]'::jsonb,
  -- Attributes
  amazon_attributes JSONB DEFAULT '{}'::jsonb,
  variation_data JSONB DEFAULT '{}'::jsonb,
  -- Performance
  amazon_rank INTEGER,
  bsr_category VARCHAR(255), -- Best Seller Rank category
  review_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  -- Sync
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'syncing', 'synced', 'error'
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, seller_sku)
);

-- 4. Hepsiburada marketplace listings
CREATE TABLE IF NOT EXISTS hepsiburada_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  -- Hepsiburada identifiers
  hb_product_id VARCHAR(50),
  merchant_sku VARCHAR(100),
  barcode VARCHAR(50),
  -- Listing details
  listing_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'passive', 'rejected'
  hb_title TEXT,
  hb_description TEXT,
  hb_brand VARCHAR(255),
  hb_model VARCHAR(255),
  hb_category_id INTEGER,
  hb_category_name VARCHAR(255),
  -- Pricing
  hb_price DECIMAL(10,2),
  hb_sale_price DECIMAL(10,2),
  discount_percentage DECIMAL(5,2),
  vat_rate DECIMAL(5,2) DEFAULT 18.00,
  -- Inventory
  hb_quantity INTEGER DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 1,
  maximum_quantity INTEGER DEFAULT 9999,
  -- Shipping
  shipping_template_id INTEGER,
  cargo_company VARCHAR(100),
  shipping_cost DECIMAL(8,2),
  free_shipping_limit DECIMAL(10,2),
  -- Images
  hb_main_image TEXT,
  hb_additional_images JSONB DEFAULT '[]'::jsonb,
  -- Attributes
  hb_attributes JSONB DEFAULT '{}'::jsonb,
  variant_attributes JSONB DEFAULT '{}'::jsonb,
  -- Performance
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  hb_review_count INTEGER DEFAULT 0,
  hb_average_rating DECIMAL(2,1),
  -- Sync
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, merchant_sku)
);

-- 5. Performance cache
CREATE TABLE IF NOT EXISTS performance_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(500) NOT NULL,
  cache_value JSONB NOT NULL,
  cache_type VARCHAR(100) NOT NULL, -- 'query_result', 'api_response', 'computed_data'
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- TTL and expiration
  ttl_seconds INTEGER DEFAULT 3600,
  expires_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  cache_size_bytes INTEGER,
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cache_key)
);

-- 6. API rate limits tracking
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  api_provider VARCHAR(100) NOT NULL, -- 'amazon', 'hepsiburada', 'openai', 'canva'
  api_endpoint VARCHAR(255) NOT NULL,
  rate_limit_type VARCHAR(50) NOT NULL, -- 'per_minute', 'per_hour', 'per_day'
  max_requests INTEGER NOT NULL,
  current_requests INTEGER DEFAULT 0,
  reset_time TIMESTAMP WITH TIME ZONE,
  -- Status
  is_rate_limited BOOLEAN DEFAULT false,
  last_request_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, api_provider, api_endpoint, rate_limit_type)
);

-- Indexes
CREATE INDEX idx_iot_devices_tenant ON iot_devices(tenant_id);
CREATE INDEX idx_iot_devices_type ON iot_devices(device_type, connection_status);
CREATE INDEX idx_iot_devices_warehouse ON iot_devices(warehouse_id) WHERE warehouse_id IS NOT NULL;
CREATE INDEX idx_iot_sensor_data_device ON iot_sensor_data(device_id, measured_at);
CREATE INDEX idx_iot_sensor_data_tenant ON iot_sensor_data(tenant_id, measured_at);
CREATE INDEX idx_iot_sensor_data_type ON iot_sensor_data(sensor_type, measured_at);
CREATE INDEX idx_amazon_listings_tenant ON amazon_listings(tenant_id);
CREATE INDEX idx_amazon_listings_product ON amazon_listings(product_id);
CREATE INDEX idx_amazon_listings_asin ON amazon_listings(asin) WHERE asin IS NOT NULL;
CREATE INDEX idx_amazon_listings_status ON amazon_listings(listing_status, last_synced_at);
CREATE INDEX idx_hepsiburada_listings_tenant ON hepsiburada_listings(tenant_id);
CREATE INDEX idx_hepsiburada_listings_product ON hepsiburada_listings(product_id);
CREATE INDEX idx_hepsiburada_listings_status ON hepsiburada_listings(listing_status, last_synced_at);
CREATE INDEX idx_performance_cache_key ON performance_cache(cache_key);
CREATE INDEX idx_performance_cache_expires ON performance_cache(expires_at);
CREATE INDEX idx_performance_cache_tenant ON performance_cache(tenant_id);
CREATE INDEX idx_api_rate_limits_provider ON api_rate_limits(api_provider, api_endpoint);
CREATE INDEX idx_api_rate_limits_reset ON api_rate_limits(reset_time) WHERE is_rate_limited = true;

-- Partition iot_sensor_data by date for performance
-- CREATE TABLE iot_sensor_data_y2024m01 PARTITION OF iot_sensor_data FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- RLS Policies
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE amazon_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hepsiburada_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- IoT devices policies
CREATE POLICY "Users can view IoT devices in their tenant"
  ON iot_devices FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage IoT devices"
  ON iot_devices FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- IoT sensor data policies
CREATE POLICY "Users can view sensor data in their tenant"
  ON iot_sensor_data FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Marketplace listings policies
CREATE POLICY "Users can view Amazon listings in their tenant"
  ON amazon_listings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view Hepsiburada listings in their tenant"
  ON hepsiburada_listings FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Performance cache policies
CREATE POLICY "Users can access cache in their tenant"
  ON performance_cache FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Update triggers
CREATE TRIGGER update_iot_devices_updated_at
  BEFORE UPDATE ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amazon_listings_updated_at
  BEFORE UPDATE ON amazon_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hepsiburada_listings_updated_at
  BEFORE UPDATE ON hepsiburada_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM performance_cache 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cache hit count
CREATE OR REPLACE FUNCTION update_cache_hit(p_cache_key VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE performance_cache 
  SET 
    hit_count = hit_count + 1,
    last_accessed_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get IoT device statistics
CREATE OR REPLACE FUNCTION get_iot_statistics(p_tenant_id UUID)
RETURNS TABLE (
  total_devices INTEGER,
  online_devices INTEGER,
  offline_devices INTEGER,
  devices_with_alerts INTEGER,
  total_sensors INTEGER,
  data_points_today INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE connection_status = 'online')::INTEGER,
    COUNT(*) FILTER (WHERE connection_status = 'offline')::INTEGER,
    COUNT(*) FILTER (WHERE maintenance_mode = true OR battery_level < 20)::INTEGER,
    COUNT(DISTINCT device_type)::INTEGER,
    (
      SELECT COUNT(*)::INTEGER 
      FROM iot_sensor_data 
      WHERE tenant_id = p_tenant_id 
        AND DATE(measured_at) = CURRENT_DATE
    )
  FROM iot_devices
  WHERE tenant_id = p_tenant_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get marketplace statistics
CREATE OR REPLACE FUNCTION get_marketplace_statistics(p_tenant_id UUID)
RETURNS TABLE (
  amazon_listings INTEGER,
  amazon_active INTEGER,
  hepsiburada_listings INTEGER,
  hepsiburada_active INTEGER,
  total_marketplace_revenue DECIMAL,
  sync_errors INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(al.id)::INTEGER,
    COUNT(al.id) FILTER (WHERE al.listing_status = 'active')::INTEGER,
    COUNT(hl.id)::INTEGER,
    COUNT(hl.id) FILTER (WHERE hl.listing_status = 'active')::INTEGER,
    0.00::DECIMAL, -- Placeholder for revenue calculation
    (COUNT(al.id) FILTER (WHERE al.sync_status = 'error') + 
     COUNT(hl.id) FILTER (WHERE hl.sync_status = 'error'))::INTEGER
  FROM amazon_listings al
  FULL OUTER JOIN hepsiburada_listings hl ON al.tenant_id = hl.tenant_id
  WHERE COALESCE(al.tenant_id, hl.tenant_id) = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to check API rate limit
CREATE OR REPLACE FUNCTION check_api_rate_limit(
  p_tenant_id UUID,
  p_api_provider VARCHAR,
  p_api_endpoint VARCHAR,
  p_rate_limit_type VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_rate_limit RECORD;
  v_allowed BOOLEAN := true;
BEGIN
  SELECT * INTO v_rate_limit
  FROM api_rate_limits
  WHERE tenant_id = p_tenant_id
    AND api_provider = p_api_provider
    AND api_endpoint = p_api_endpoint
    AND rate_limit_type = p_rate_limit_type;

  IF NOT FOUND THEN
    -- No rate limit record, allow request
    RETURN true;
  END IF;

  -- Check if rate limit period has reset
  IF v_rate_limit.reset_time < NOW() THEN
    -- Reset the counter
    UPDATE api_rate_limits
    SET 
      current_requests = 1,
      reset_time = CASE p_rate_limit_type
        WHEN 'per_minute' THEN NOW() + INTERVAL '1 minute'
        WHEN 'per_hour' THEN NOW() + INTERVAL '1 hour'
        WHEN 'per_day' THEN NOW() + INTERVAL '1 day'
      END,
      is_rate_limited = false,
      last_request_at = NOW()
    WHERE id = v_rate_limit.id;
    
    RETURN true;
  END IF;

  -- Check if under limit
  IF v_rate_limit.current_requests < v_rate_limit.max_requests THEN
    -- Increment counter
    UPDATE api_rate_limits
    SET 
      current_requests = current_requests + 1,
      last_request_at = NOW()
    WHERE id = v_rate_limit.id;
    
    RETURN true;
  ELSE
    -- Rate limited
    UPDATE api_rate_limits
    SET is_rate_limited = true
    WHERE id = v_rate_limit.id;
    
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
