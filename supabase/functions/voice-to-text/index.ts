/**
 * Voice-to-Text Edge Function
 * Handles voice command recognition and execution
 * - Accepts audio file (base64 or URL)
 * - Transcribes using OpenAI Whisper or Google Speech-to-Text
 * - Matches transcript to voice commands (fuzzy matching)
 * - Executes command and returns result
 * - Logs to voice_command_logs
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile (for tenant_id)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tenantId = profile.tenant_id;

    if (req.method === 'POST') {
      const startTime = Date.now();
      const payload = await req.json();

      // Extract audio data
      const audioBase64 = payload.audio_base64; // Base64 encoded audio
      const audioUrl = payload.audio_url; // Or URL to audio file
      const language = payload.language || 'tr'; // Default Turkish

      if (!audioBase64 && !audioUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing audio_base64 or audio_url' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('🎙️ Processing voice command for tenant:', tenantId);

      // Step 1: Transcribe audio to text
      let transcript = '';
      let recognitionProvider = 'whisper'; // Default to OpenAI Whisper

      try {
        transcript = await transcribeAudio(audioBase64, audioUrl, language);
        console.log('📝 Transcript:', transcript);
      } catch (error) {
        console.error('❌ Transcription failed:', error);

        // Log failure
        await supabaseClient.from('voice_command_logs').insert({
          tenant_id: tenantId,
          user_id: user.id,
          transcript: '',
          status: 'failed',
          error_message: `Transcription failed: ${error.message}`,
          recognition_time_ms: Date.now() - startTime,
        });

        return new Response(
          JSON.stringify({
            error: 'Transcription failed',
            details: error.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const recognitionTime = Date.now() - startTime;

      // Step 2: Match transcript to voice commands (fuzzy matching)
      const { data: voiceCommands } = await supabaseClient
        .from('voice_commands')
        .select('*')
        .eq('is_active', true)
        .or(`tenant_id.eq.${tenantId},tenant_id.is.null`);

      let matchedCommand = null;
      let confidenceScore = 0;

      for (const command of voiceCommands || []) {
        // Check main command text
        const similarity = calculateSimilarity(
          transcript.toLowerCase(),
          command.command_text.toLowerCase()
        );

        if (similarity > confidenceScore && similarity >= command.min_confidence) {
          matchedCommand = command;
          confidenceScore = similarity;
        }

        // Check command variations
        for (const variation of command.command_variations || []) {
          const varSimilarity = calculateSimilarity(
            transcript.toLowerCase(),
            variation.toLowerCase()
          );

          if (
            varSimilarity > confidenceScore &&
            varSimilarity >= command.min_confidence
          ) {
            matchedCommand = command;
            confidenceScore = varSimilarity;
          }
        }
      }

      // Step 3: Execute command if matched
      let executionResult = null;
      let actionTaken = null;
      let status = 'success';
      let errorMessage = null;

      if (matchedCommand) {
        console.log(
          '✅ Matched command:',
          matchedCommand.command_text,
          'Confidence:',
          confidenceScore
        );

        try {
          const executionStart = Date.now();

          // Execute command based on action_type
          const result = await executeVoiceCommand(
            matchedCommand,
            tenantId,
            supabaseClient
          );

          executionResult = result;
          actionTaken = matchedCommand.action_type;

          const executionTime = Date.now() - executionStart;

          // Log success
          await supabaseClient.from('voice_command_logs').insert({
            tenant_id: tenantId,
            user_id: user.id,
            command_id: matchedCommand.id,
            transcript,
            matched_command: matchedCommand.command_text,
            confidence_score: confidenceScore,
            recognition_provider: recognitionProvider,
            status: 'success',
            action_taken: actionTaken,
            execution_result: result,
            recognition_time_ms: recognitionTime,
            execution_time_ms: executionTime,
          });

          // Update command stats
          await supabaseClient
            .from('voice_commands')
            .update({
              total_uses: (matchedCommand.total_uses || 0) + 1,
              success_count: (matchedCommand.success_count || 0) + 1,
              avg_confidence:
                ((matchedCommand.avg_confidence || 0) *
                  (matchedCommand.total_uses || 0) +
                  confidenceScore) /
                ((matchedCommand.total_uses || 0) + 1),
              last_used_at: new Date().toISOString(),
            })
            .eq('id', matchedCommand.id);

          return new Response(
            JSON.stringify({
              success: true,
              transcript,
              matched_command: matchedCommand.command_text,
              confidence: confidenceScore,
              action: actionTaken,
              result: executionResult,
              execution_time_ms: executionTime,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        } catch (error) {
          console.error('❌ Command execution failed:', error);
          status = 'failed';
          errorMessage = error.message;

          // Log failure
          await supabaseClient.from('voice_command_logs').insert({
            tenant_id: tenantId,
            user_id: user.id,
            command_id: matchedCommand.id,
            transcript,
            matched_command: matchedCommand.command_text,
            confidence_score: confidenceScore,
            recognition_provider: recognitionProvider,
            status: 'failed',
            error_message: errorMessage,
            recognition_time_ms: recognitionTime,
          });

          return new Response(
            JSON.stringify({
              error: 'Command execution failed',
              details: errorMessage,
              transcript,
              matched_command: matchedCommand.command_text,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        console.log('❌ No matching command found for:', transcript);
        status = 'rejected';

        // Log rejection
        await supabaseClient.from('voice_command_logs').insert({
          tenant_id: tenantId,
          user_id: user.id,
          transcript,
          matched_command: null,
          confidence_score: 0,
          recognition_provider: recognitionProvider,
          status: 'rejected',
          error_message: 'No matching command found',
          recognition_time_ms: recognitionTime,
        });

        return new Response(
          JSON.stringify({
            success: false,
            transcript,
            message: 'Komut tanınmadı. Lütfen tekrar deneyin.',
            suggestions: voiceCommands
              ?.slice(0, 3)
              .map((cmd) => cmd.command_text),
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('❌ Error in voice-to-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Transcribe audio using OpenAI Whisper API
 */
async function transcribeAudio(
  audioBase64: string | null,
  audioUrl: string | null,
  language: string
): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Convert base64 to blob if provided
  let audioBlob: Blob;

  if (audioBase64) {
    const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
    audioBlob = new Blob([audioBytes], { type: 'audio/webm' });
  } else if (audioUrl) {
    const response = await fetch(audioUrl);
    audioBlob = await response.blob();
  } else {
    throw new Error('No audio data provided');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  // Call OpenAI Whisper API
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  const result = await response.json();
  return result.text;
}

/**
 * Calculate similarity between two strings (Levenshtein distance normalized)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance algorithm (edit distance)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Execute voice command based on action_type
 */
async function executeVoiceCommand(
  command: any,
  tenantId: string,
  supabaseClient: any
): Promise<any> {
  const actionType = command.action_type;

  console.log('⚡ Executing command:', actionType);

  switch (actionType) {
    case 'SHOW_DAILY_ORDERS': {
      const today = new Date().toISOString().split('T')[0];
      const { data: orders, count } = await supabaseClient
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      return {
        action: 'SHOW_DAILY_ORDERS',
        data: orders,
        count,
        message: `Bugün ${count || 0} sipariş var.`,
        navigate_to: '/orders?filter=today',
      };
    }

    case 'LIST_OUT_OF_STOCK': {
      const { data: products, count } = await supabaseClient
        .from('products')
        .select('name, sku, stock_quantity', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .lte('stock_quantity', 0);

      return {
        action: 'LIST_OUT_OF_STOCK',
        data: products,
        count,
        message: `${count || 0} ürün stokta kalmadı.`,
        navigate_to: '/inventory?filter=out_of_stock',
      };
    }

    case 'GENERATE_WEEKLY_REPORT': {
      return {
        action: 'GENERATE_WEEKLY_REPORT',
        message: 'Haftalık rapor oluşturuluyor...',
        navigate_to: '/reports?type=weekly',
      };
    }

    case 'CHECK_SUPPORT_STATUS': {
      const { data: tickets, count } = await supabaseClient
        .from('support_tickets')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .eq('status', 'open');

      return {
        action: 'CHECK_SUPPORT_STATUS',
        data: tickets,
        count,
        message: `${count || 0} açık destek talebi var.`,
        navigate_to: '/support',
      };
    }

    case 'SHOW_BEST_SELLERS': {
      const { data: products } = await supabaseClient
        .from('products')
        .select('name, sku, sales_count')
        .eq('tenant_id', tenantId)
        .order('sales_count', { ascending: false })
        .limit(10);

      return {
        action: 'SHOW_BEST_SELLERS',
        data: products,
        message: `En çok satan ${products?.length || 0} ürün listelendi.`,
        navigate_to: '/products?sort=best_sellers',
      };
    }

    default:
      return {
        action: actionType,
        message: `"${command.command_text}" komutu yürütüldü.`,
        navigate_to: command.target_page || '/dashboard',
      };
  }
}

