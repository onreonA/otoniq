import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { method, url, credentials } = await req.json();

    if (
      !credentials?.apiKey ||
      !credentials?.apiSecret ||
      !credentials?.sellerId
    ) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trendyol API base URL
    const trendyolBaseUrl = 'https://api.trendyol.com/sapigw/suppliers';

    // Construct the full URL
    const fullUrl = `${trendyolBaseUrl}/${url}`;

    console.log(`🔄 Proxying ${method} request to: ${fullUrl}`);

    // Prepare headers for Trendyol API with Basic Auth
    const authString = btoa(`${credentials.apiKey}:${credentials.apiSecret}`);
    const headers = new Headers({
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      Authorization: `Basic ${authString}`,
    });

    // Prepare request body
    let body: string | undefined;
    if (req.body && method !== 'GET') {
      body = JSON.stringify(req.body);
    }

    console.log(`🔐 Using Basic Auth for Trendyol API`);

    // Make request to Trendyol API
    const response = await fetch(fullUrl, {
      method: method,
      headers: headers,
      body: body,
    });

    console.log(`✅ Trendyol API response: ${response.status}`);

    // Get response data
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('❌ Trendyol proxy error:', error);

    return new Response(
      JSON.stringify({
        error: 'Proxy request failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
