import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

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
    // Authenticate request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: authError?.message || 'No user found',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request
    const requestBody = await req.json();
    const { method, credentials, args, kwargs } = requestBody;

    if (
      !credentials ||
      !credentials.url ||
      !credentials.db ||
      !credentials.username ||
      !credentials.password
    ) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build Odoo URL
    let odooUrl = credentials.url;
    if (!odooUrl.startsWith('http://') && !odooUrl.startsWith('https://')) {
      odooUrl = `https://${odooUrl}`;
    }
    if (odooUrl.endsWith('/')) {
      odooUrl = odooUrl.slice(0, -1);
    }

    console.log('🔍 Odoo proxy request:', {
      method,
      odooUrl,
      db: credentials.db,
      username: credentials.username,
    });

    // Handle different methods
    switch (method) {
      case 'authenticate':
        return await handleAuthenticate(odooUrl, credentials);

      case 'search_read':
        return await handleSearchRead(odooUrl, credentials, { args, kwargs });

      default:
        return new Response(
          JSON.stringify({
            error: 'Unknown method',
            details: `Method '${method}' not supported`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    console.error('❌ Edge Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal error',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleAuthenticate(odooUrl: string, credentials: any) {
  try {
    console.log('🔄 Authenticating with Odoo...');

    const response = await fetch(`${odooUrl}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: credentials.db,
          login: credentials.username,
          password: credentials.password,
        },
      }),
      signal: AbortSignal.timeout(20000), // 20 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Odoo API error:', {
        status: response.status,
        errorText,
      });
      return new Response(
        JSON.stringify({
          error: 'Odoo authentication failed',
          details: `HTTP ${response.status}: ${errorText}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();

    if (data.error) {
      console.error('❌ Odoo returned error:', data.error);
      return new Response(
        JSON.stringify({
          error: 'Odoo authentication failed',
          details:
            data.error.data?.message ||
            data.error.message ||
            'Authentication error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (data.result && data.result.uid) {
      console.log('✅ Odoo authentication successful, UID:', data.result.uid);
      return new Response(
        JSON.stringify({
          success: true,
          result: data.result.uid,
          sessionId: data.result.session_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('❌ Unexpected Odoo response:', data);
      return new Response(
        JSON.stringify({
          error: 'Unexpected response',
          details: 'Odoo did not return UID',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('❌ Odoo authentication exception:', error);

    if (error.name === 'TimeoutError' || error.message.includes('timed out')) {
      return new Response(
        JSON.stringify({
          error: 'Connection timeout',
          details: 'Odoo sunucusu yanıt vermiyor (20 saniye timeout)',
        }),
        {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Connection failed',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleSearchRead(
  odooUrl: string,
  credentials: any,
  requestData: any
) {
  try {
    console.log('🔄 Fetching products from Odoo...');

    const { args, kwargs } = requestData;

    // First, authenticate to get session
    console.log('🔐 Authenticating first...');
    const authResponse = await fetch(`${odooUrl}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: credentials.db,
          login: credentials.username,
          password: credentials.password,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    if (authData.error || !authData.result?.uid) {
      throw new Error('Authentication failed');
    }

    console.log('✅ Authenticated, now fetching products...');

    // Get cookies from auth response
    const cookies = authResponse.headers.get('set-cookie') || '';

    // Now fetch products with session
    const response = await fetch(`${odooUrl}/web/dataset/call_kw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'product.product',
          method: 'search_read',
          args: args || [],
          kwargs: kwargs || {},
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Odoo API error:', {
        status: response.status,
        errorText,
      });
      return new Response(
        JSON.stringify({
          error: 'Odoo API error',
          details: `HTTP ${response.status}: ${errorText}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();

    if (data.error) {
      console.error('❌ Odoo returned error:', data.error);
      return new Response(
        JSON.stringify({
          error: 'Odoo search failed',
          details:
            data.error.data?.message || data.error.message || 'Search error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (data.result && Array.isArray(data.result)) {
      console.log(`✅ Retrieved ${data.result.length} products from Odoo`);
      return new Response(
        JSON.stringify({
          success: true,
          result: data.result,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.error('❌ Unexpected Odoo response:', data);
      return new Response(
        JSON.stringify({
          error: 'Unexpected response',
          details: 'Odoo did not return products array',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('❌ Odoo search exception:', error);

    if (error.name === 'TimeoutError' || error.message.includes('timed out')) {
      return new Response(
        JSON.stringify({
          error: 'Connection timeout',
          details: 'Odoo sunucusu yanıt vermiyor (20 saniye timeout)',
        }),
        {
          status: 504,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Connection failed',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
