import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface OdooCredentials {
  url: string;
  db: string;
  username: string;
  password: string;
}

interface OdooRequest {
  method:
    | 'authenticate'
    | 'search_read'
    | 'create'
    | 'write'
    | 'unlink'
    | 'call_kw';
  model?: string;
  args?: any[];
  kwargs?: any;
  credentials: OdooCredentials;
  sessionId?: string;
}

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      method,
      model,
      args = [],
      kwargs = {},
      credentials,
      sessionId,
    }: OdooRequest = await req.json();

    console.log(`🔄 Odoo API Request: ${method} on ${model || 'common'}`);

    let odooUrl: string;
    let requestBody: any;

    // Special handling for authentication
    if (method === 'authenticate') {
      odooUrl = `${credentials.url}/jsonrpc`;

      requestBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'common',
          method: 'authenticate',
          args: [
            credentials.db,
            credentials.username,
            credentials.password,
            {},
          ],
        },
        id: Math.floor(Math.random() * 1000000),
      };
    } else {
      // Handle other methods (like search_read) with JSON-RPC
      odooUrl = `${credentials.url}/jsonrpc`;

      if (!sessionId) {
        return new Response(
          JSON.stringify({
            error: 'Session ID is required for object methods',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      requestBody = {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            credentials.db,
            parseInt(sessionId),
            credentials.password,
            model,
            method,
            args,
            kwargs,
          ],
        },
        id: Math.floor(Math.random() * 1000000),
      };
    }

    console.log(`📤 Sending ${method} request to: ${odooUrl}`);
    console.log(
      `📦 JSON-RPC Request body:`,
      JSON.stringify(requestBody, null, 2)
    );

    const response = await fetch(odooUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OtoniqAI/1.0',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log(`✅ Odoo API response: ${response.status}`);
    console.log(`📄 Odoo JSON response:`, JSON.stringify(data, null, 2));

    // Handle authentication response
    if (method === 'authenticate') {
      if (data.result && typeof data.result === 'number' && data.result > 0) {
        console.log(`✅ Extracted UID: ${data.result}`);
        return new Response(JSON.stringify({ result: data.result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else {
        console.error('❌ Odoo authentication failed:', data.error);
        return new Response(
          JSON.stringify({ error: 'Odoo authentication failed' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
    } else {
      // Handle other methods response
      if (data.result) {
        console.log(`✅ Method ${method} successful`);
        return new Response(JSON.stringify({ result: data.result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } else if (data.error) {
        console.error(`❌ Odoo ${method} failed:`, data.error);
        return new Response(
          JSON.stringify({
            error: `Odoo ${method} failed: ${JSON.stringify(data.error)}`,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      } else {
        console.error('❌ Unexpected Odoo response:', data);
        return new Response(
          JSON.stringify({ error: 'Unexpected Odoo response' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }
  } catch (error: any) {
    console.error('❌ Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
