-- ============================================================================
-- Migration 054: Chat Automation System (WhatsApp, Telegram, Voice Commands)
-- ============================================================================
-- This migration creates the complete chat automation infrastructure:
-- - WhatsApp & Telegram conversations and messages
-- - Automated response templates
-- - Voice command recognition and execution
-- - Telegram bot command handlers
-- - Daily analytics and statistics

-- ============================================================================
-- 1. CHAT CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Platform & Customer
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram')),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_avatar TEXT,
  customer_metadata JSONB DEFAULT '{}',
  
  -- Conversation Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'pending', 'escalated', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Assignment
  assigned_agent_id UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- AI Analysis
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3, 2), -- 0.00 to 1.00
  intent_category TEXT, -- 'order', 'complaint', 'inquiry', etc.
  
  -- Tags & Classification
  tags TEXT[] DEFAULT '{}',
  
  -- Metrics
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  response_time_avg_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per tenant per platform per customer
  UNIQUE(tenant_id, platform, customer_phone)
);

-- Indexes
CREATE INDEX idx_chat_conversations_tenant_platform ON public.chat_conversations(tenant_id, platform);
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status) WHERE status IN ('active', 'pending');
CREATE INDEX idx_chat_conversations_assigned_agent ON public.chat_conversations(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
CREATE INDEX idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_chat_conversations_unread ON public.chat_conversations(unread_count) WHERE unread_count > 0;

COMMENT ON TABLE public.chat_conversations IS 'WhatsApp and Telegram conversations';
COMMENT ON COLUMN public.chat_conversations.sentiment_score IS 'AI-calculated sentiment score from 0 (negative) to 1 (positive)';

-- ============================================================================
-- 2. CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  
  -- Message Details
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'bot', 'agent', 'system')),
  sender_id UUID REFERENCES public.profiles(id), -- NULL for customer/bot
  
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'product', 'order')),
  
  -- Media & Metadata
  media_url TEXT,
  metadata JSONB DEFAULT '{}', -- {product_id, order_id, file_name, etc.}
  
  -- External Platform IDs
  whatsapp_message_id TEXT,
  telegram_message_id TEXT,
  
  -- Status
  read_status BOOLEAN DEFAULT false,
  delivered_status BOOLEAN DEFAULT false,
  failed_reason TEXT,
  
  -- AI Processing
  processed_by_ai BOOLEAN DEFAULT false,
  ai_intent TEXT,
  ai_confidence DECIMAL(3, 2),
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_messages_tenant ON public.chat_messages(tenant_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_type, created_at DESC);
CREATE INDEX idx_chat_messages_unread ON public.chat_messages(conversation_id) WHERE read_status = false;

COMMENT ON TABLE public.chat_messages IS 'Individual messages in conversations';
COMMENT ON COLUMN public.chat_messages.ai_confidence IS 'Confidence score for AI intent detection (0.00 to 1.00)';

-- ============================================================================
-- 3. CHAT TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL = global template
  
  -- Template Details
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('greeting', 'order-status', 'product-info', 'complaint', 'general', 'closing')),
  
  -- Triggers
  trigger_keywords TEXT[] DEFAULT '{}',
  trigger_conditions JSONB DEFAULT '{}', -- {time: 'after_hours', status: 'new_conversation'}
  
  -- Response
  response_text TEXT NOT NULL,
  response_variables TEXT[] DEFAULT '{}', -- ['customer_name', 'order_number', etc.]
  
  -- Media
  includes_media BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type TEXT,
  
  -- Configuration
  language TEXT DEFAULT 'tr',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 (highest) to 10 (lowest)
  
  -- Platforms
  enabled_platforms TEXT[] DEFAULT ARRAY['whatsapp', 'telegram'],
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2), -- percentage
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_templates_tenant_category ON public.chat_templates(tenant_id, category);
CREATE INDEX idx_chat_templates_active ON public.chat_templates(is_active, priority) WHERE is_active = true;
CREATE INDEX idx_chat_templates_triggers ON public.chat_templates USING GIN (trigger_keywords);

COMMENT ON TABLE public.chat_templates IS 'Automated response templates for chatbots';
COMMENT ON COLUMN public.chat_templates.response_variables IS 'Variables that can be replaced in response_text like {customer_name}';

-- ============================================================================
-- 4. VOICE COMMANDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL = global command
  
  -- Command Details
  command_text TEXT NOT NULL,
  command_variations TEXT[] DEFAULT '{}', -- ['bugünkü siparişler', 'bugün kaç sipariş var']
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('order', 'product', 'report', 'support', 'navigation', 'action')),
  action_type TEXT NOT NULL, -- 'SHOW_DAILY_ORDERS', 'LIST_OUT_OF_STOCK', etc.
  
  -- Execution
  target_page TEXT, -- '/dashboard/orders'
  target_function TEXT, -- Function to call in frontend
  required_parameters TEXT[] DEFAULT '{}',
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  requires_confirmation BOOLEAN DEFAULT false, -- For destructive actions
  
  -- NLP Configuration
  min_confidence DECIMAL(3, 2) DEFAULT 0.80,
  language TEXT DEFAULT 'tr',
  
  -- Usage Stats
  total_uses INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  avg_confidence DECIMAL(3, 2),
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_voice_commands_tenant_category ON public.voice_commands(tenant_id, category);
CREATE INDEX idx_voice_commands_active ON public.voice_commands(is_active) WHERE is_active = true;
CREATE INDEX idx_voice_commands_action ON public.voice_commands(action_type);

COMMENT ON TABLE public.voice_commands IS 'Voice command definitions and handlers';
COMMENT ON COLUMN public.voice_commands.min_confidence IS 'Minimum confidence score (0.00-1.00) to execute command';

-- ============================================================================
-- 5. VOICE COMMAND LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.voice_command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  command_id UUID REFERENCES public.voice_commands(id),
  
  -- Input
  audio_url TEXT, -- Recorded audio file
  transcript TEXT NOT NULL, -- Speech-to-text result
  
  -- Recognition
  matched_command TEXT,
  confidence_score DECIMAL(3, 2),
  recognition_provider TEXT, -- 'google', 'azure', 'whisper'
  
  -- Execution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'rejected')),
  action_taken TEXT,
  execution_result JSONB,
  error_message TEXT,
  
  -- Performance
  recognition_time_ms INTEGER,
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_voice_command_logs_tenant ON public.voice_command_logs(tenant_id, created_at DESC);
CREATE INDEX idx_voice_command_logs_user ON public.voice_command_logs(user_id, created_at DESC);
CREATE INDEX idx_voice_command_logs_command ON public.voice_command_logs(command_id) WHERE command_id IS NOT NULL;
CREATE INDEX idx_voice_command_logs_status ON public.voice_command_logs(status, created_at DESC);

COMMENT ON TABLE public.voice_command_logs IS 'Voice command execution history and logs';

-- ============================================================================
-- 6. TELEGRAM BOT COMMANDS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.telegram_bot_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE, -- NULL = global command
  
  -- Command Details
  command TEXT NOT NULL, -- '/start', '/siparis', etc.
  description TEXT NOT NULL,
  example_usage TEXT,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('navigation', 'query', 'action', 'support')),
  
  -- Handler
  handler_function TEXT NOT NULL, -- Backend function name
  required_params TEXT[] DEFAULT '{}',
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_admin_only BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT false,
  
  -- Rate Limiting
  rate_limit_per_minute INTEGER DEFAULT 10,
  
  -- Usage Stats
  total_uses INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, command)
);

-- Indexes
CREATE INDEX idx_telegram_commands_tenant ON public.telegram_bot_commands(tenant_id);
CREATE INDEX idx_telegram_commands_active ON public.telegram_bot_commands(is_active, command) WHERE is_active = true;
CREATE INDEX idx_telegram_commands_category ON public.telegram_bot_commands(category);

COMMENT ON TABLE public.telegram_bot_commands IS 'Telegram bot command definitions and handlers';

-- ============================================================================
-- 7. CHAT STATS DAILY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chat_stats_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Date
  stat_date DATE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'telegram', 'all')),
  
  -- Conversation Metrics
  total_conversations INTEGER DEFAULT 0,
  new_conversations INTEGER DEFAULT 0,
  resolved_conversations INTEGER DEFAULT 0,
  escalated_conversations INTEGER DEFAULT 0,
  
  -- Message Metrics
  total_messages INTEGER DEFAULT 0,
  bot_messages INTEGER DEFAULT 0,
  agent_messages INTEGER DEFAULT 0,
  customer_messages INTEGER DEFAULT 0,
  
  -- Performance Metrics
  avg_response_time_seconds INTEGER,
  avg_resolution_time_minutes INTEGER,
  first_response_time_seconds INTEGER,
  
  -- Quality Metrics
  resolution_rate DECIMAL(5, 2), -- percentage
  customer_satisfaction_score DECIMAL(3, 2),
  sentiment_positive_count INTEGER DEFAULT 0,
  sentiment_neutral_count INTEGER DEFAULT 0,
  sentiment_negative_count INTEGER DEFAULT 0,
  
  -- Agent Metrics
  active_agents_count INTEGER DEFAULT 0,
  avg_conversations_per_agent DECIMAL(5, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, stat_date, platform)
);

-- Indexes
CREATE INDEX idx_chat_stats_date ON public.chat_stats_daily(stat_date DESC);
CREATE INDEX idx_chat_stats_tenant_platform ON public.chat_stats_daily(tenant_id, platform, stat_date DESC);

COMMENT ON TABLE public.chat_stats_daily IS 'Daily aggregated chat automation statistics';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_stats_daily ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their tenant's conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can manage their tenant's conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view their tenant's messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can manage their tenant's messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view chat templates" ON public.chat_templates;
DROP POLICY IF EXISTS "Users can manage tenant templates" ON public.chat_templates;
DROP POLICY IF EXISTS "Users can view voice commands" ON public.voice_commands;
DROP POLICY IF EXISTS "Users can manage tenant commands" ON public.voice_commands;
DROP POLICY IF EXISTS "Users can view their command logs" ON public.voice_command_logs;
DROP POLICY IF EXISTS "Users can create command logs" ON public.voice_command_logs;
DROP POLICY IF EXISTS "Users can view telegram commands" ON public.telegram_bot_commands;
DROP POLICY IF EXISTS "Users can manage tenant telegram commands" ON public.telegram_bot_commands;
DROP POLICY IF EXISTS "Users can view their stats" ON public.chat_stats_daily;

-- Chat Conversations Policies
CREATE POLICY "Users can view their tenant's conversations"
  ON public.chat_conversations FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their tenant's conversations"
  ON public.chat_conversations FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Chat Messages Policies
CREATE POLICY "Users can view their tenant's messages"
  ON public.chat_messages FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their tenant's messages"
  ON public.chat_messages FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Chat Templates Policies (includes global templates)
CREATE POLICY "Users can view chat templates"
  ON public.chat_templates FOR SELECT
  USING (tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant templates"
  ON public.chat_templates FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Voice Commands Policies (includes global commands)
CREATE POLICY "Users can view voice commands"
  ON public.voice_commands FOR SELECT
  USING (tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant commands"
  ON public.voice_commands FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Voice Command Logs Policies
CREATE POLICY "Users can view their command logs"
  ON public.voice_command_logs FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create command logs"
  ON public.voice_command_logs FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Telegram Bot Commands Policies (includes global commands)
CREATE POLICY "Users can view telegram commands"
  ON public.telegram_bot_commands FOR SELECT
  USING (tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant telegram commands"
  ON public.telegram_bot_commands FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Chat Stats Policies
CREATE POLICY "Users can view their stats"
  ON public.chat_stats_daily FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;

GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

GRANT ALL ON public.chat_templates TO authenticated;
GRANT ALL ON public.chat_templates TO service_role;

GRANT ALL ON public.voice_commands TO authenticated;
GRANT ALL ON public.voice_commands TO service_role;

GRANT ALL ON public.voice_command_logs TO authenticated;
GRANT ALL ON public.voice_command_logs TO service_role;

GRANT ALL ON public.telegram_bot_commands TO authenticated;
GRANT ALL ON public.telegram_bot_commands TO service_role;

GRANT ALL ON public.chat_stats_daily TO authenticated;
GRANT ALL ON public.chat_stats_daily TO service_role;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_templates_updated_at
  BEFORE UPDATE ON public.chat_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_commands_updated_at
  BEFORE UPDATE ON public.voice_commands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_bot_commands_updated_at
  BEFORE UPDATE ON public.telegram_bot_commands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA: Global Templates and Commands
-- ============================================================================

-- Insert global chat templates (available to all tenants)
INSERT INTO public.chat_templates (tenant_id, name, category, trigger_keywords, response_text, language, is_active, priority, enabled_platforms)
VALUES
  (NULL, 'Hoş Geldin Mesajı', 'greeting', ARRAY['merhaba', 'selam', 'hi', 'hello', '/start'], 
   'Merhaba! 👋 Otoniq.ai müşteri destek botuna hoş geldiniz. Size nasıl yardımcı olabilirim?', 
   'tr', true, 1, ARRAY['whatsapp', 'telegram']),
   
  (NULL, 'Sipariş Takibi', 'order-status', ARRAY['sipariş', 'kargo', 'teslimat', 'nerede', '/siparis'], 
   'Sipariş takibi için sipariş numaranızı (#12345 formatında) paylaşır mısınız?', 
   'tr', true, 2, ARRAY['whatsapp', 'telegram']),
   
  (NULL, 'Ürün Bilgisi', 'product-info', ARRAY['ürün', 'stok', 'fiyat', 'price', '/urun'], 
   'Hangi ürün hakkında bilgi almak istersiniz? Ürün adını veya kodunu paylaşabilirsiniz.', 
   'tr', true, 2, ARRAY['whatsapp', 'telegram']),
   
  (NULL, 'Canlı Destek Yönlendirme', 'general', ARRAY['destek', 'temsilci', 'insan', 'agent', '/destek'], 
   'Sizi bir müşteri temsilcisine bağlıyorum. Lütfen bekleyin... ⏳', 
   'tr', true, 3, ARRAY['whatsapp', 'telegram'])
ON CONFLICT DO NOTHING;

-- Insert global voice commands
INSERT INTO public.voice_commands (tenant_id, command_text, command_variations, category, action_type, target_page, min_confidence, language, is_active)
VALUES
  (NULL, 'Bugünkü siparişleri göster', ARRAY['bugünkü siparişler', 'bugün kaç sipariş var', 'günlük siparişler'], 
   'order', 'SHOW_DAILY_ORDERS', '/dashboard/orders?filter=today', 0.85, 'tr', true),
   
  (NULL, 'Stokta olmayan ürünleri listele', ARRAY['tükenen ürünler', 'stokta ne kalmadı', 'stok bitti'], 
   'product', 'LIST_OUT_OF_STOCK', '/products?stock=out', 0.85, 'tr', true),
   
  (NULL, 'Haftalık satış raporu oluştur', ARRAY['bu haftanın raporu', 'haftalık özet', 'haftalık rapor'], 
   'report', 'GENERATE_WEEKLY_REPORT', '/analytics/reports?type=weekly', 0.80, 'tr', true),
   
  (NULL, 'En çok satan ürünleri göster', ARRAY['en popüler ürünler', 'best seller', 'çok satanlar'], 
   'product', 'SHOW_BEST_SELLERS', '/analytics/products?sort=sales_desc', 0.85, 'tr', true)
ON CONFLICT DO NOTHING;

-- Insert global Telegram bot commands
INSERT INTO public.telegram_bot_commands (tenant_id, command, description, example_usage, category, handler_function, is_active, rate_limit_per_minute)
VALUES
  (NULL, '/start', 'Bot ile konuşmaya başla', '/start', 'navigation', 'handleStart', true, 10),
  (NULL, '/help', 'Yardım menüsünü göster', '/help', 'navigation', 'handleHelp', true, 10),
  (NULL, '/siparis', 'Sipariş durumunu sorgula', '/siparis #12345', 'query', 'handleOrderStatus', true, 20),
  (NULL, '/urun', 'Ürün bilgisi al', '/urun iPhone 15 Pro', 'query', 'handleProductQuery', true, 20),
  (NULL, '/stok', 'Stok durumunu kontrol et', '/stok PROD001', 'query', 'handleStockCheck', true, 20),
  (NULL, '/destek', 'Canlı desteğe bağlan', '/destek', 'support', 'handleSupport', true, 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 054 completed successfully!';
  RAISE NOTICE '📊 Created 7 tables for chat automation';
  RAISE NOTICE '🔐 Configured RLS policies for all tables';
  RAISE NOTICE '📝 Inserted global templates and commands';
END $$;

