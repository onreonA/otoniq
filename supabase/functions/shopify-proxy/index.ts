import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { method, credentials, params } = await req.json();

    if (!credentials || !credentials.shop || !credentials.accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing Shopify credentials' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { shop, accessToken, apiVersion = '2023-10' } = credentials;
    const baseUrl = `https://${shop}/admin/api/${apiVersion}`;

    let response: any = {};

    switch (method) {
      case 'testConnection':
        response = await testShopifyConnection(baseUrl, accessToken);
        break;

      case 'getProducts':
        const { limit = 50, page = 1 } = params || {};
        response = await getShopifyProducts(baseUrl, accessToken, limit, page);
        break;

      case 'getProduct':
        const { productId } = params || {};
        if (!productId) {
          throw new Error('Product ID is required');
        }
        response = await getShopifyProduct(baseUrl, accessToken, productId);
        break;

      case 'syncProducts':
        response = await syncProductsToDatabase(
          supabaseClient,
          baseUrl,
          accessToken,
          user.id
        );
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Shopify proxy error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function testShopifyConnection(baseUrl: string, accessToken: string) {
  try {
    console.log('🔍 Testing Shopify connection:', {
      baseUrl,
      accessToken: accessToken.substring(0, 10) + '...',
    });

    const response = await fetch(`${baseUrl}/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Shopify API response:', {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const shopData = await response.json();
    console.log('✅ Shopify connection successful:', shopData.shop?.name);

    return {
      success: true,
      shop: shopData.shop,
      message: 'Connection successful',
    };
  } catch (error) {
    console.error('❌ Shopify connection failed:', error);
    throw new Error(`Failed to connect to Shopify: ${error.message}`);
  }
}

async function getShopifyProducts(
  baseUrl: string,
  accessToken: string,
  limit: number,
  page: number
) {
  try {
    const response = await fetch(
      `${baseUrl}/products.json?limit=${limit}&page=${page}`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      products: data.products,
      count: data.products.length,
      pagination: {
        page,
        limit,
        hasNext: data.products.length === limit,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
}

async function getShopifyProduct(
  baseUrl: string,
  accessToken: string,
  productId: string
) {
  try {
    const response = await fetch(`${baseUrl}/products/${productId}.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      product: data.product,
    };
  } catch (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
}

async function syncProductsToDatabase(
  supabaseClient: any,
  baseUrl: string,
  accessToken: string,
  userId: string
) {
  try {
    // Get all products from Shopify
    const productsResponse = await getShopifyProducts(
      baseUrl,
      accessToken,
      250,
      1
    );
    const products = productsResponse.products;

    if (!products || products.length === 0) {
      return {
        success: true,
        message: 'No products to sync',
        synced: 0,
      };
    }

    // Transform Shopify products to Otoniq format
    const transformedProducts = products.map((product: any) => ({
      name: product.title,
      description: product.body_html || '',
      sku: product.variants?.[0]?.sku || '',
      price: parseFloat(product.variants?.[0]?.price || '0'),
      cost_price: parseFloat(product.variants?.[0]?.compare_at_price || '0'),
      stock_quantity: product.variants?.[0]?.inventory_quantity || 0,
      category: product.product_type || 'Uncategorized',
      brand: product.vendor || '',
      tags: product.tags || '',
      status: product.status === 'active' ? 'active' : 'inactive',
      source: 'shopify',
      external_id: product.id.toString(),
      external_data: {
        shopify_id: product.id,
        shopify_handle: product.handle,
        variants: product.variants,
        images: product.images,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Get user's tenant_id
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('tenant_id')
      .eq('id', userId)
      .single();

    if (!profile?.tenant_id) {
      throw new Error('User tenant not found');
    }

    // Upsert products to database
    const { error: upsertError } = await supabaseClient.from('products').upsert(
      transformedProducts.map(product => ({
        ...product,
        tenant_id: profile.tenant_id,
      })),
      { onConflict: 'tenant_id,external_id' }
    );

    if (upsertError) {
      throw new Error(`Database error: ${upsertError.message}`);
    }

    return {
      success: true,
      message: `Successfully synced ${products.length} products`,
      synced: products.length,
      products: transformedProducts,
    };
  } catch (error) {
    throw new Error(`Failed to sync products: ${error.message}`);
  }
}
