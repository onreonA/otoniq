/**
 * WhatsApp Webhook Edge Function
 * Handles incoming WhatsApp Business API webhooks
 * - Webhook verification (GET)
 * - Message handling (POST)
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

    // GET: Webhook verification from Meta
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('📥 Webhook verification request:', { mode, token });

      if (
        mode === 'subscribe' &&
        token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')
      ) {
        console.log('✅ Webhook verified successfully');
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }

      console.log('❌ Webhook verification failed');
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // POST: Handle incoming messages
    if (req.method === 'POST') {
      const payload = await req.json();
      console.log('📨 Received WhatsApp webhook:', JSON.stringify(payload));

      // Parse WhatsApp webhook payload
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        console.log('ℹ️  No messages in payload, returning ok');
        return new Response(
          JSON.stringify({ success: true, message: 'No messages' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Process each message
      for (const message of messages) {
        await handleWhatsAppMessage(message, value, supabaseClient);
      }

      return new Response(
        JSON.stringify({ success: true, processed: messages.length }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('❌ Error in WhatsApp webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Handle individual WhatsApp message
 */
async function handleWhatsAppMessage(
  message: any,
  value: any,
  supabaseClient: any
) {
  try {
    const from = message.from; // Customer phone number
    const messageId = message.id;
    const timestamp = message.timestamp;

    // Extract message content based on type
    let content = '';
    let contentType = 'text';
    let mediaUrl = null;

    if (message.type === 'text') {
      content = message.text?.body || '';
    } else if (message.type === 'image') {
      content = message.image?.caption || '[Image]';
      contentType = 'image';
      mediaUrl = message.image?.id; // Media ID from WhatsApp
    } else if (message.type === 'video') {
      content = message.video?.caption || '[Video]';
      contentType = 'video';
      mediaUrl = message.video?.id;
    } else if (message.type === 'audio') {
      content = '[Voice message]';
      contentType = 'audio';
      mediaUrl = message.audio?.id;
    } else if (message.type === 'document') {
      content = message.document?.filename || '[Document]';
      contentType = 'file';
      mediaUrl = message.document?.id;
    } else {
      content = `[Unsupported message type: ${message.type}]`;
    }

    console.log('📝 Processing message:', {
      from,
      content,
      type: contentType,
    });

    // Get customer name from contacts
    const customerName =
      value.contacts?.find((c: any) => c.wa_id === from)?.profile?.name ||
      'Unknown';

    // Find or create conversation
    // Note: We need to determine tenant_id. For now, we'll use the first tenant.
    // In production, you'd map phone numbers or use a routing table.
    const { data: tenants } = await supabaseClient
      .from('tenants')
      .select('id')
      .limit(1)
      .single();

    if (!tenants) {
      console.error('❌ No tenant found');
      return;
    }

    const tenantId = tenants.id;

    // Upsert conversation
    const { data: conversation, error: convError } = await supabaseClient
      .from('chat_conversations')
      .upsert(
        {
          tenant_id: tenantId,
          platform: 'whatsapp',
          customer_phone: from,
          customer_name: customerName,
          status: 'active',
          last_message_at: new Date(parseInt(timestamp) * 1000).toISOString(),
          unread_count: 1, // Will be incremented by trigger if needed
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
        whatsapp_message_id: messageId,
        sent_at: new Date(parseInt(timestamp) * 1000).toISOString(),
        read_status: false,
        delivered_status: true,
      });

    if (messageError) {
      console.error('❌ Error saving message:', messageError);
      return;
    }

    console.log('✅ Message saved to database');

    // Check for template match (auto-reply)
    const { data: templates } = await supabaseClient
      .from('chat_templates')
      .select('*')
      .eq('is_active', true)
      .contains('enabled_platforms', ['whatsapp'])
      .order('priority', { ascending: true });

    let matchedTemplate = null;

    // Find matching template based on trigger keywords
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

    // Send auto-reply if template matched
    if (matchedTemplate) {
      console.log('🤖 Matched template:', matchedTemplate.name);

      // Replace variables in response text
      let responseText = matchedTemplate.response_text;
      responseText = responseText.replace('{customer_name}', customerName);

      // Send WhatsApp message
      await sendWhatsAppMessage(from, responseText);

      // Save bot message to database
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

      // Update template usage stats
      await supabaseClient
        .from('chat_templates')
        .update({
          usage_count: (matchedTemplate.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', matchedTemplate.id);

      console.log('✅ Auto-reply sent');
    } else {
      console.log('ℹ️  No matching template, no auto-reply');
    }
  } catch (error) {
    console.error('❌ Error handling message:', error);
  }
}

/**
 * Send WhatsApp message via Business API
 */
async function sendWhatsAppMessage(to: string, text: string) {
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');

  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing WhatsApp credentials');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ WhatsApp API error:', error);
      throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    console.log('✅ WhatsApp message sent:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
}
