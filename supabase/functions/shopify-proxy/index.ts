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
    // Shopify now uses cursor-based pagination, ignore page parameter
    const response = await fetch(`${baseUrl}/products.json?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
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

    // Transform Shopify products to Otoniq format with new fields
    const transformedProducts = products.map((product: any) => {
      const primaryVariant = product.variants?.[0];
      
      return {
        name: product.title,
        description: product.body_html || '',
        sku: primaryVariant?.sku || `SHOPIFY-${product.id}`,
        barcode: primaryVariant?.barcode || null, // NEW: Barcode for cross-platform sync
        vendor: product.vendor || null, // NEW: Vendor/Brand
        price: parseFloat(primaryVariant?.price || '0'),
        compare_at_price: parseFloat(primaryVariant?.compare_at_price || '0'), // NEW: Original price
        cost: parseFloat(primaryVariant?.compare_at_price || '0'),
        categories: product.product_type
          ? [product.product_type]
          : ['Uncategorized'],
        tags: product.tags
          ? product.tags.split(',').map((t: string) => t.trim())
          : [],
        status: product.status === 'active' ? 'active' : 'inactive',
        published_at: product.published_at ? new Date(product.published_at) : null, // NEW: Published date
        weight: primaryVariant?.grams ? primaryVariant.grams / 1000 : null, // Convert grams to kg
        volume: null, // NEW: Will be calculated if needed
        requires_shipping: primaryVariant?.requires_shipping !== false, // NEW: Shipping required
        is_taxable: primaryVariant?.taxable !== false, // NEW: Taxable
        sale_ok: product.status === 'active', // NEW: Can be sold
        purchase_ok: true, // NEW: Can be purchased
        inventory_policy: primaryVariant?.inventory_policy === 'deny' ? 'deny' : 'continue', // NEW: Inventory policy
        metadata: {
          shopify_id: product.id,
          shopify_handle: product.handle,
          product_type: product.product_type || '',
          source: 'shopify',
          synced_at: new Date().toISOString(),
          variants: product.variants,
          images: product.images,
          shopify_created_at: product.created_at,
          shopify_updated_at: product.updated_at,
        },
        updated_at: new Date().toISOString(),
      };
    });

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
    // If barcode exists, use it as conflict key; otherwise use SKU
    const productsWithBarcode = transformedProducts.filter(p => p.barcode);
    const productsWithoutBarcode = transformedProducts.filter(p => !p.barcode);

    // Upsert products with barcode
    if (productsWithBarcode.length > 0) {
      const { error: barcodeError } = await supabaseClient.from('products').upsert(
        productsWithBarcode.map(product => ({
          ...product,
          tenant_id: profile.tenant_id,
        })),
        { onConflict: 'tenant_id,barcode' }
      );

      if (barcodeError) {
        console.error('Error upserting products with barcode:', barcodeError);
        throw new Error(`Database error (barcode): ${barcodeError.message}`);
      }
    }

    // Upsert products without barcode (use SKU as fallback)
    if (productsWithoutBarcode.length > 0) {
      const { error: skuError } = await supabaseClient.from('products').upsert(
        productsWithoutBarcode.map(product => ({
          ...product,
          tenant_id: profile.tenant_id,
        })),
        { onConflict: 'tenant_id,sku' }
      );

      if (skuError) {
        console.error('Error upserting products without barcode:', skuError);
        throw new Error(`Database error (sku): ${skuError.message}`);
      }
    }

    // Create platform mappings for each product
    const mappingPromises = transformedProducts.map(async (product) => {
      if (product.barcode) {
        const { error: mappingError } = await supabaseClient
          .from('product_platform_mappings')
          .upsert({
            tenant_id: profile.tenant_id,
            product_id: null, // Will be filled by trigger or lookup
            platform: 'shopify',
            external_id: product.metadata.shopify_id.toString(),
            external_data: product.metadata,
            sync_status: 'active',
            platform_stock_quantity: product.metadata.variants?.[0]?.inventory_quantity || 0,
            platform_price: product.price,
            platform_status: product.status,
            external_created_at: product.metadata.shopify_created_at ? new Date(product.metadata.shopify_created_at) : null,
            external_updated_at: product.metadata.shopify_updated_at ? new Date(product.metadata.shopify_updated_at) : null,
          }, {
            onConflict: 'tenant_id,platform,external_id'
          });

        if (mappingError) {
          console.error('Failed to create platform mapping:', mappingError);
        }
      }
    });

    await Promise.all(mappingPromises);

    return {
      success: true,
      message: `Successfully synced ${products.length} products with platform mappings`,
      synced: products.length,
      products: transformedProducts,
    };
  } catch (error) {
    throw new Error(`Failed to sync products: ${error.message}`);
  }
}
