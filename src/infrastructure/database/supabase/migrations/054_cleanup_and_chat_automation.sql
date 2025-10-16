-- ============================================================================
-- Migration 054: Cleanup & Chat Automation System (FRESH START)
-- ============================================================================
-- This migration first drops any existing chat tables, then creates them fresh

-- ============================================================================
-- CLEANUP: Drop existing tables if any (in reverse dependency order)
-- ============================================================================
DROP TABLE IF EXISTS public.chat_stats_daily CASCADE;
DROP TABLE IF EXISTS public.telegram_bot_commands CASCADE;
DROP TABLE IF EXISTS public.voice_command_logs CASCADE;
DROP TABLE IF EXISTS public.voice_commands CASCADE;
DROP TABLE IF EXISTS public.chat_templates CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_conversations CASCADE;

-- ============================================================================
-- 1. CHAT CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE public.chat_conversations (
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
  sentiment_score DECIMAL(3, 2),
  intent_category TEXT,
  
  -- Tags & Classification
  tags TEXT[] DEFAULT '{}',
  
  -- Metrics
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  response_time_avg_seconds INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_conversations_tenant_platform ON public.chat_conversations(tenant_id, platform);
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status) WHERE status IN ('active', 'pending');
CREATE INDEX idx_chat_conversations_assigned_agent ON public.chat_conversations(assigned_agent_id) WHERE assigned_agent_id IS NOT NULL;
CREATE INDEX idx_chat_conversations_last_message ON public.chat_conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_chat_conversations_unread ON public.chat_conversations(unread_count) WHERE unread_count > 0;
CREATE UNIQUE INDEX unique_conversation_per_customer ON public.chat_conversations(tenant_id, platform, customer_phone);

COMMENT ON TABLE public.chat_conversations IS 'WhatsApp and Telegram conversations';

-- ============================================================================
-- 2. CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  
  -- Message Details
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'bot', 'agent', 'system')),
  sender_id UUID REFERENCES public.profiles(id),
  
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'product', 'order')),
  
  -- Media & Metadata
  media_url TEXT,
  metadata JSONB DEFAULT '{}',
  
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

-- ============================================================================
-- 3. CHAT TEMPLATES TABLE
-- ============================================================================
CREATE TABLE public.chat_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Template Details
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('greeting', 'order-status', 'product-info', 'complaint', 'general', 'closing')),
  
  -- Triggers
  trigger_keywords TEXT[] DEFAULT '{}',
  trigger_conditions JSONB DEFAULT '{}',
  
  -- Response
  response_text TEXT NOT NULL,
  response_variables TEXT[] DEFAULT '{}',
  
  -- Media
  includes_media BOOLEAN DEFAULT false,
  media_url TEXT,
  media_type TEXT,
  
  -- Configuration
  language TEXT DEFAULT 'tr',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Platforms
  enabled_platforms TEXT[] DEFAULT ARRAY['whatsapp', 'telegram'],
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2),
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

-- ============================================================================
-- 4. VOICE COMMANDS TABLE
-- ============================================================================
CREATE TABLE public.voice_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Command Details
  command_text TEXT NOT NULL,
  command_variations TEXT[] DEFAULT '{}',
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('order', 'product', 'report', 'support', 'navigation', 'action')),
  action_type TEXT NOT NULL,
  
  -- Execution
  target_page TEXT,
  target_function TEXT,
  required_parameters TEXT[] DEFAULT '{}',
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  requires_confirmation BOOLEAN DEFAULT false,
  
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

-- ============================================================================
-- 5. VOICE COMMAND LOGS TABLE
-- ============================================================================
CREATE TABLE public.voice_command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  command_id UUID REFERENCES public.voice_commands(id),
  
  -- Input
  audio_url TEXT,
  transcript TEXT NOT NULL,
  
  -- Recognition
  matched_command TEXT,
  confidence_score DECIMAL(3, 2),
  recognition_provider TEXT,
  
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
CREATE TABLE public.telegram_bot_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Command Details
  command TEXT NOT NULL,
  description TEXT NOT NULL,
  example_usage TEXT,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN ('navigation', 'query', 'action', 'support')),
  
  -- Handler
  handler_function TEXT NOT NULL,
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_telegram_commands_tenant ON public.telegram_bot_commands(tenant_id);
CREATE INDEX idx_telegram_commands_active ON public.telegram_bot_commands(is_active, command) WHERE is_active = true;
CREATE INDEX idx_telegram_commands_category ON public.telegram_bot_commands(category);
CREATE UNIQUE INDEX unique_telegram_commands_per_tenant ON public.telegram_bot_commands(tenant_id, command) WHERE tenant_id IS NOT NULL;

COMMENT ON TABLE public.telegram_bot_commands IS 'Telegram bot command definitions and handlers';

-- ============================================================================
-- 7. CHAT STATS DAILY TABLE
-- ============================================================================
CREATE TABLE public.chat_stats_daily (
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
  resolution_rate DECIMAL(5, 2),
  customer_satisfaction_score DECIMAL(3, 2),
  sentiment_positive_count INTEGER DEFAULT 0,
  sentiment_neutral_count INTEGER DEFAULT 0,
  sentiment_negative_count INTEGER DEFAULT 0,
  
  -- Agent Metrics
  active_agents_count INTEGER DEFAULT 0,
  avg_conversations_per_agent DECIMAL(5, 2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_stats_date ON public.chat_stats_daily(stat_date DESC);
CREATE INDEX idx_chat_stats_tenant_platform ON public.chat_stats_daily(tenant_id, platform, stat_date DESC);
CREATE UNIQUE INDEX unique_chat_stats_per_day ON public.chat_stats_daily(tenant_id, stat_date, platform);

COMMENT ON TABLE public.chat_stats_daily IS 'Daily aggregated chat automation statistics';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_command_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bot_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_stats_daily ENABLE ROW LEVEL SECURITY;

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

-- Chat Templates Policies
CREATE POLICY "Users can view chat templates"
  ON public.chat_templates FOR SELECT
  USING (tenant_id IS NULL OR tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage tenant templates"
  ON public.chat_templates FOR ALL
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Voice Commands Policies
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

-- Telegram Bot Commands Policies
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
GRANT ALL ON public.chat_conversations TO authenticated, service_role;
GRANT ALL ON public.chat_messages TO authenticated, service_role;
GRANT ALL ON public.chat_templates TO authenticated, service_role;
GRANT ALL ON public.voice_commands TO authenticated, service_role;
GRANT ALL ON public.voice_command_logs TO authenticated, service_role;
GRANT ALL ON public.telegram_bot_commands TO authenticated, service_role;
GRANT ALL ON public.chat_stats_daily TO authenticated, service_role;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
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
-- INITIAL DATA
-- ============================================================================
INSERT INTO public.chat_templates (tenant_id, name, category, trigger_keywords, response_text, language, is_active, priority, enabled_platforms)
VALUES
  (NULL, 'Hoş Geldin Mesajı', 'greeting', ARRAY['merhaba', 'selam', 'hi', 'hello', '/start'], 
   'Merhaba! 👋 Otoniq.ai müşteri destek botuna hoş geldiniz. Size nasıl yardımcı olabilirim?', 
   'tr', true, 1, ARRAY['whatsapp', 'telegram']),
   
  (NULL, 'Sipariş Takibi', 'order-status', ARRAY['sipariş', 'kargo', 'teslimat', 'nerede', '/siparis'], 
   'Sipariş takibi için sipariş numaranızı (#12345 formatında) paylaşır mısınız?', 
   'tr', true, 2, ARRAY['whatsapp', 'telegram']);

INSERT INTO public.voice_commands (tenant_id, command_text, command_variations, category, action_type, target_page, min_confidence, language, is_active)
VALUES
  (NULL, 'Bugünkü siparişleri göster', ARRAY['bugünkü siparişler', 'bugün kaç sipariş var'], 
   'order', 'SHOW_DAILY_ORDERS', '/dashboard/orders?filter=today', 0.85, 'tr', true),
   
  (NULL, 'Stokta olmayan ürünleri listele', ARRAY['tükenen ürünler', 'stokta ne kalmadı'], 
   'product', 'LIST_OUT_OF_STOCK', '/products?stock=out', 0.85, 'tr', true);

INSERT INTO public.telegram_bot_commands (tenant_id, command, description, example_usage, category, handler_function, is_active, rate_limit_per_minute)
VALUES
  (NULL, '/start', 'Bot ile konuşmaya başla', '/start', 'navigation', 'handleStart', true, 10),
  (NULL, '/help', 'Yardım menüsünü göster', '/help', 'navigation', 'handleHelp', true, 10),
  (NULL, '/siparis', 'Sipariş durumunu sorgula', '/siparis #12345', 'query', 'handleOrderStatus', true, 20);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 054 completed successfully!';
  RAISE NOTICE '📊 Created 7 tables for chat automation';
  RAISE NOTICE '🔐 Configured RLS policies';
  RAISE NOTICE '📝 Inserted initial data';
END $$;

