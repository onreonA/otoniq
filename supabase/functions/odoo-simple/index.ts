import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔄 Odoo Simple Function called');

    // Get authorization header
    const authHeader = req.headers.get('authorization');
    console.log('DEBUG: Auth header present:', !!authHeader);

    // Simple authentication check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Get request body
    const body = await req.json();
    const { method, credentials } = body;

    console.log('🔄 Method:', method);
    console.log('🔄 Credentials URL:', credentials?.url);

    // Mock response for any method
    return new Response(
      JSON.stringify({
        success: true,
        result: 1,
        sessionId: 'mock-session-id',
        message: 'Odoo Simple Function working',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Odoo Simple Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
