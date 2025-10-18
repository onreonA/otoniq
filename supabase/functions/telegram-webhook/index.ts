/**
 * Telegram Bot Webhook Edge Function
 * Handles incoming Telegram Bot API webhooks
 * - Message handling
 * - Command processing (/start, /siparis, etc.)
 * - Auto-reply with templates
 * - Save conversations and messages to database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client (service role for write access)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // POST: Handle incoming Telegram updates
    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('📨 Received Telegram webhook:', JSON.stringify(payload));

      // Telegram sends different update types: message, edited_message, callback_query, etc.
      const message = payload.message || payload.edited_message;

      if (!message) {
        console.log('ℹ️  No message in payload, returning ok');
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await handleTelegramMessage(message, supabaseClient);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('❌ Error in Telegram webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Handle individual Telegram message
 */
async function handleTelegramMessage(message: any, supabaseClient: any) {
  try {
    const from = message.from;
    const chat = message.chat;
    const messageId = message.message_id;
    const timestamp = message.date;

    // Extract customer info
    const customerId = from.id.toString();
    const customerName =
      from.first_name + (from.last_name ? ` ${from.last_name}` : '');
    const customerUsername = from.username || null;

    // Extract message content
    let content = '';
    let contentType = 'text';
    let mediaUrl = null;

    if (message.text) {
      content = message.text;
    } else if (message.photo) {
      content = message.caption || '[Photo]';
      contentType = 'image';
      mediaUrl = message.photo[message.photo.length - 1].file_id; // Highest res
    } else if (message.video) {
      content = message.caption || '[Video]';
      contentType = 'video';
      mediaUrl = message.video.file_id;
    } else if (message.voice) {
      content = '[Voice message]';
      contentType = 'audio';
      mediaUrl = message.voice.file_id;
    } else if (message.document) {
      content = message.document.file_name || '[Document]';
      contentType = 'file';
      mediaUrl = message.document.file_id;
    } else if (message.location) {
      content = `Location: ${message.location.latitude}, ${message.location.longitude}`;
      contentType = 'location';
    } else {
      content = `[Unsupported message type]`;
    }

    console.log('📝 Processing Telegram message:', {
      from: customerName,
      content,
      type: contentType,
    });

    // TEMPORARY: Hardcoded tenant for testing (bilgi@omerfarukunsal.com)
    // TODO: Implement proper Telegram user -> tenant mapping system
    const tenantId = '86b2681e-483b-4d75-9837-717f5f43eca8';

    // Upsert conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('chat_conversations')
      .upsert(
        {
          tenant_id: tenantId,
          platform: 'telegram',
          customer_phone: customerId, // Using Telegram ID as "phone"
          customer_name: customerName,
          customer_metadata: {
            telegram_user_id: from.id,
            telegram_username: customerUsername,
            telegram_language: from.language_code,
          },
          status: 'active',
          last_message_at: new Date(timestamp * 1000).toISOString(),
          unread_count: 1,
        },
        {
          onConflict: 'tenant_id,platform,customer_phone',
        }
      )
      .select()
      .single();

    if (convError) {
      console.error('❌ Error upserting conversation:', convError);
      return;
    }

    console.log('✅ Conversation found/created:', conversation.id);

    // Save customer message
    const { error: messageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        tenant_id: tenantId,
        conversation_id: conversation.id,
        sender_type: 'customer',
        content,
        content_type: contentType,
        media_url: mediaUrl,
        telegram_message_id: messageId.toString(),
        metadata: {
          telegram_chat_id: chat.id,
          telegram_user_id: from.id,
        },
        sent_at: new Date(timestamp * 1000).toISOString(),
        read_status: false,
        delivered_status: true,
      });

    if (messageError) {
      console.error('❌ Error saving message:', messageError);
      return;
    }

    console.log('✅ Message saved to database');

    // Check if message is a command
    if (message.text && message.text.startsWith('/')) {
      await handleTelegramCommand(
        message.text,
        chat.id,
        from,
        tenantId,
        supabaseClient
      );
    } else {
      // Check for template match (auto-reply)
      await checkAndSendAutoReply(
        content,
        chat.id,
        customerName,
        conversation,
        tenantId,
        supabaseClient
      );
    }
  } catch (error) {
    console.error('❌ Error handling Telegram message:', error);
  }
}

/**
 * Handle Telegram bot commands (/start, /siparis, etc.)
 */
async function handleTelegramCommand(
  commandText: string,
  chatId: number,
  from: any,
  tenantId: string,
  supabaseClient: any
) {
  const commandParts = commandText.split(' ');
  const command = commandParts[0].toLowerCase();
  const args = commandParts.slice(1);

  console.log('⚡ Processing command:', command, 'Args:', args);

  // Find command in database
  const { data: commandDef } = await supabaseClient
    .from('telegram_bot_commands')
    .select('*')
    .eq('command', command)
    .eq('is_active', true)
    .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
    .single();

  if (!commandDef) {
    console.log('ℹ️  Command not found:', command);
    await sendTelegramMessage(
      chatId,
      '❓ Bilinmeyen komut. /help yazarak tüm komutları görebilirsiniz.'
    );
    return;
  }

  // Update command usage stats
  await supabaseClient
    .from('telegram_bot_commands')
    .update({
      total_uses: (commandDef.total_uses || 0) + 1,
      success_count: (commandDef.success_count || 0) + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', commandDef.id);

  // Handle specific commands
  let responseText = '';

  switch (command) {
    case '/start':
      responseText = `👋 Merhaba ${from.first_name}!\n\nOtoniq.ai Telegram botuna hoş geldiniz. Size nasıl yardımcı olabilirim?\n\n📋 Komutlar için /help yazın.`;
      break;

    case '/help':
      responseText = `📋 **Kullanılabilir Komutlar:**\n\n`;
      responseText += `/start - Botu başlat\n`;
      responseText += `/help - Yardım menüsü\n`;
      responseText += `/siparis <numara> - Sipariş durumu\n`;
      responseText += `/urun <kod/isim> - Ürün bilgisi\n`;
      responseText += `/stok <kod> - Stok durumu\n`;
      responseText += `/bildirim <kod> - Stok bildirimi ayarla\n`;
      responseText += `/iade <sipariş_no> - İade talebi\n`;
      responseText += `/destek - Canlı destek\n`;
      responseText += `/kampanya - Aktif kampanyalar\n`;
      responseText += `/ayarlar - Bot ayarları\n`;
      break;

    case '/siparis':
      if (args.length === 0) {
        responseText =
          '❌ Lütfen sipariş numarasını belirtin.\nÖrnek: /siparis #12345';
      } else {
        const orderNumber = args[0];
        responseText = `🔍 Sipariş ${orderNumber} sorgulanıyor...\n\n`;
        responseText += `📦 Durum: Kargoda\n`;
        responseText += `🚚 Kargo Takip: TK123456789\n`;
        responseText += `📅 Tahmini Teslimat: 2 gün içinde\n\n`;
        responseText += `💡 Kargo durumunu takip etmek için: [Tıklayın](https://example.com/track)`;
      }
      break;

    case '/urun':
      if (args.length === 0) {
        responseText =
          '❌ Lütfen ürün kodu veya ismini belirtin.\nÖrnek: /urun iPhone15';
      } else {
        const productQuery = args.join(' ');
        responseText = `🔍 "${productQuery}" ürün bilgileri:\n\n`;
        responseText += `📱 **iPhone 15 Pro**\n`;
        responseText += `💰 Fiyat: 45,000 TL\n`;
        responseText += `📦 Stok: Mevcut (12 adet)\n`;
        responseText += `🏷️ SKU: PROD12345\n\n`;
        responseText += `🛒 Sipariş vermek için: [Web Sitesi](https://otoniq.ai)`;
      }
      break;

    case '/stok':
      if (args.length === 0) {
        responseText =
          '❌ Lütfen ürün kodunu belirtin.\nÖrnek: /stok PROD12345';
      } else {
        const sku = args[0];
        responseText = `📊 ${sku} stok durumu:\n\n`;
        responseText += `✅ Stokta: 24 adet\n`;
        responseText += `🏢 Depo 1: 15 adet\n`;
        responseText += `🏢 Depo 2: 9 adet\n`;
      }
      break;

    case '/destek':
      responseText = `🙋‍♂️ Müşteri temsilcisine bağlanıyorsunuz...\n\n`;
      responseText += `⏳ Ortalama bekleme süresi: 2-3 dakika\n\n`;
      responseText += `💬 Bir temsilci en kısa sürede size dönüş yapacaktır.`;
      break;

    case '/kampanya':
      responseText = `🎉 **Aktif Kampanyalar:**\n\n`;
      responseText += `1️⃣ %20 İndirim - Tüm Elektronik Ürünlerde\n`;
      responseText += `   📅 Son: 31 Aralık\n\n`;
      responseText += `2️⃣ 3 Al 2 Öde - Seçili Ürünlerde\n`;
      responseText += `   📅 Son: 15 Aralık\n\n`;
      responseText += `🛒 Kampanya detayları: [Web Sitesi](https://otoniq.ai/kampanyalar)`;
      break;

    default:
      responseText = `ℹ️  "${command}" komutu henüz aktif değil.\n\n/help ile tüm komutları görebilirsiniz.`;
  }

  await sendTelegramMessage(chatId, responseText);
}

/**
 * Check for template match and send auto-reply
 */
async function checkAndSendAutoReply(
  content: string,
  chatId: number,
  customerName: string,
  conversation: any,
  tenantId: string,
  supabaseClient: any
) {
  const { data: templates } = await supabaseClient
    .from('chat_templates')
    .select('*')
    .eq('is_active', true)
    .contains('enabled_platforms', ['telegram'])
    .order('priority', { ascending: true });

  let matchedTemplate = null;

  for (const template of templates || []) {
    const keywords = template.trigger_keywords || [];
    const lowerContent = content.toLowerCase();

    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        matchedTemplate = template;
        break;
      }
    }

    if (matchedTemplate) break;
  }

  if (matchedTemplate) {
    console.log('🤖 Matched template:', matchedTemplate.name);

    let responseText = matchedTemplate.response_text;
    responseText = responseText.replace('{customer_name}', customerName);

    await sendTelegramMessage(chatId, responseText);

    // Save bot message
    await supabaseClient.from('chat_messages').insert({
      tenant_id: tenantId,
      conversation_id: conversation.id,
      sender_type: 'bot',
      content: responseText,
      content_type: 'text',
      sent_at: new Date().toISOString(),
      read_status: true,
      delivered_status: true,
    });

    // Update template stats
    await supabaseClient
      .from('chat_templates')
      .update({
        usage_count: (matchedTemplate.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', matchedTemplate.id);

    console.log('✅ Auto-reply sent');
  }
}

/**
 * Send Telegram message via Bot API
 */
async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

  if (!botToken) {
    console.error('❌ Missing Telegram bot token');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Telegram API error:', error);
      throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log('✅ Telegram message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error);
    throw error;
  }
}
