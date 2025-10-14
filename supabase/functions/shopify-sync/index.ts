import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShopifyRequest {
  shop: string;
  accessToken: string;
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { shop, accessToken, endpoint, method = 'GET', body }: ShopifyRequest = await req.json()

    // Validate required parameters
    if (!shop || !accessToken || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: shop, accessToken, endpoint' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Construct Shopify API URL
    const shopifyUrl = `https://${shop}.myshopify.com/admin/api/2023-10/${endpoint}`
    
    console.log(`🚀 Making ${method} request to: ${shopifyUrl}`)

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }

    // Add body for POST/PUT requests
    if ((method === 'POST' || method === 'PUT') && body) {
      requestOptions.body = JSON.stringify(body)
    }

    // Make request to Shopify API
    const response = await fetch(shopifyUrl, requestOptions)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Shopify API error: ${response.status} ${response.statusText}`)
      console.error(`Error details: ${errorText}`)
      
      return new Response(
        JSON.stringify({ 
          error: `Shopify API error: ${response.status} ${response.statusText}`,
          details: errorText 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse and return response
    const data = await response.json()
    console.log(`✅ Shopify API success: ${response.status}`)

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})