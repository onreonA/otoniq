-- Week 13: International & Final - Multi-Language & Multi-Currency

-- 1. Supported languages
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(5) NOT NULL UNIQUE, -- 'en', 'tr', 'de', 'fr'
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL, -- 'English', 'Türkçe', 'Deutsch', 'Français'
  is_rtl BOOLEAN DEFAULT false, -- Right-to-left languages (Arabic, Hebrew)
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Supported currencies
CREATE TABLE IF NOT EXISTS currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE, -- 'USD', 'EUR', 'TRY', 'GBP'
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL, -- '$', '€', '₺', '£'
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Exchange rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(12,6) NOT NULL,
  effective_date DATE DEFAULT CURRENT_DATE,
  source VARCHAR(100) DEFAULT 'manual', -- 'manual', 'api', 'central_bank'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_currency, to_currency, effective_date)
);

-- 4. Translations (for static content)
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code VARCHAR(5) NOT NULL,
  translation_key VARCHAR(255) NOT NULL, -- 'dashboard.title', 'product.add_button'
  translation_value TEXT NOT NULL,
  context VARCHAR(100), -- 'ui', 'email', 'sms', 'notification'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code, translation_key, context)
);

-- 5. Product translations
CREATE TABLE IF NOT EXISTS product_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  name VARCHAR(500),
  description TEXT,
  short_description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, language_code)
);

-- 6. Category translations
CREATE TABLE IF NOT EXISTS category_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  slug VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, language_code)
);

-- 7. Email template translations
CREATE TABLE IF NOT EXISTS email_template_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES custom_email_templates(id) ON DELETE CASCADE,
  language_code VARCHAR(5) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, language_code)
);

-- 8. User language preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language_code VARCHAR(5) DEFAULT 'en',
  currency_code VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(20) DEFAULT '24h', -- '12h' or '24h'
  number_format VARCHAR(20) DEFAULT 'en-US', -- '1,234.56' vs '1.234,56'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default languages
INSERT INTO languages (code, name, native_name, is_rtl, display_order) VALUES
  ('en', 'English', 'English', false, 1),
  ('tr', 'Turkish', 'Türkçe', false, 2),
  ('de', 'German', 'Deutsch', false, 3),
  ('fr', 'French', 'Français', false, 4),
  ('es', 'Spanish', 'Español', false, 5),
  ('ar', 'Arabic', 'العربية', true, 6)
ON CONFLICT DO NOTHING;

-- Insert default currencies
INSERT INTO currencies (code, name, symbol, decimal_places, display_order) VALUES
  ('USD', 'US Dollar', '$', 2, 1),
  ('EUR', 'Euro', '€', 2, 2),
  ('TRY', 'Turkish Lira', '₺', 2, 3),
  ('GBP', 'British Pound', '£', 2, 4),
  ('JPY', 'Japanese Yen', '¥', 0, 5),
  ('CNY', 'Chinese Yuan', '¥', 2, 6),
  ('AED', 'UAE Dirham', 'د.إ', 2, 7),
  ('SAR', 'Saudi Riyal', 'ر.س', 2, 8)
ON CONFLICT DO NOTHING;

-- Insert default exchange rates (base: USD)
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
  ('USD', 'USD', 1.000000, 'manual'),
  ('USD', 'EUR', 0.920000, 'manual'),
  ('USD', 'TRY', 32.500000, 'manual'),
  ('USD', 'GBP', 0.790000, 'manual'),
  ('USD', 'JPY', 149.000000, 'manual'),
  ('USD', 'CNY', 7.200000, 'manual'),
  ('USD', 'AED', 3.670000, 'manual'),
  ('USD', 'SAR', 3.750000, 'manual')
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX idx_translations_language ON translations(language_code);
CREATE INDEX idx_translations_key ON translations(translation_key);
CREATE INDEX idx_product_translations_product ON product_translations(product_id);
CREATE INDEX idx_product_translations_language ON product_translations(language_code);
CREATE INDEX idx_category_translations_category ON category_translations(category_id);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_active ON exchange_rates(is_active, effective_date) WHERE is_active = true;

-- RLS Policies
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Public read access for languages and currencies
CREATE POLICY "Anyone can view active languages"
  ON languages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active currencies"
  ON currencies FOR SELECT
  USING (is_active = true);

-- Admins can manage languages and currencies
CREATE POLICY "Admins can manage languages"
  ON languages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

CREATE POLICY "Admins can manage currencies"
  ON currencies FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Exchange rates policies
CREATE POLICY "Anyone can view active exchange rates"
  ON exchange_rates FOR SELECT
  USING (is_active = true);

-- Translations policies
CREATE POLICY "Anyone can view translations"
  ON translations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage translations"
  ON translations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));

-- Product translations policies
CREATE POLICY "Users can view product translations in their tenant"
  ON product_translations FOR SELECT
  USING (product_id IN (
    SELECT id FROM products WHERE tenant_id IN (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Update triggers
CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_translations_updated_at
  BEFORE UPDATE ON product_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_translations_updated_at
  BEFORE UPDATE ON category_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RPC function to convert currency
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL,
  p_from_currency VARCHAR,
  p_to_currency VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
  v_rate DECIMAL;
BEGIN
  -- Same currency, no conversion needed
  IF p_from_currency = p_to_currency THEN
    RETURN p_amount;
  END IF;

  -- Get exchange rate
  SELECT rate INTO v_rate
  FROM exchange_rates
  WHERE from_currency = p_from_currency
    AND to_currency = p_to_currency
    AND is_active = true
    AND effective_date <= CURRENT_DATE
  ORDER BY effective_date DESC
  LIMIT 1;

  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'Exchange rate not found for % to %', p_from_currency, p_to_currency;
  END IF;

  RETURN p_amount * v_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get product in specific language
CREATE OR REPLACE FUNCTION get_product_translation(
  p_product_id UUID,
  p_language_code VARCHAR DEFAULT 'en'
) RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  short_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(pt.name, p.name) as name,
    COALESCE(pt.description, p.description) as description,
    COALESCE(pt.short_description, p.description) as short_description
  FROM products p
  LEFT JOIN product_translations pt ON p.id = pt.product_id AND pt.language_code = p_language_code
  WHERE p.id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to get translation
CREATE OR REPLACE FUNCTION get_translation(
  p_key VARCHAR,
  p_language_code VARCHAR DEFAULT 'en',
  p_context VARCHAR DEFAULT 'ui'
) RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
BEGIN
  SELECT translation_value INTO v_translation
  FROM translations
  WHERE translation_key = p_key
    AND language_code = p_language_code
    AND (context = p_context OR context IS NULL);

  RETURN COALESCE(v_translation, p_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

