import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

  // Skip authentication completely for testing
  console.log('N8N Proxy: Processing request without authentication');

  try {
    const { prompt, style, aspectRatio, quality, numImages, seed } =
      await req.json();

    // Forward request to N8N Cloud
    const n8nResponse = await fetch(
      'https://otoniq.app.n8n.cloud/webhook-test/generate-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style: style || 'realistic',
          aspectRatio: aspectRatio || '1:1',
          quality: quality || 'high',
          numImages: numImages || 1,
          seed: seed || Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!n8nResponse.ok) {
      throw new Error(`N8N API error: ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('N8N Proxy error:', error);

    return new Response(
      JSON.stringify({
        error: 'N8N proxy failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
