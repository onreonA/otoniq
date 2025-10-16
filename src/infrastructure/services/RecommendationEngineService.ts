import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface ProductRecommendation {
  productId: string;
  productName: string;
  imageUrl?: string;
  price: number;
  confidenceScore: number;
  recommendationType:
    | 'cross_sell'
    | 'up_sell'
    | 'similar'
    | 'frequently_bought_together';
  reason: string;
}

export interface PersonalizedRecommendation {
  customerId: string;
  recommendations: ProductRecommendation[];
  recommendationReason: string;
  generatedAt: string;
}

export class RecommendationEngineService {
  /**
   * Get product recommendations (cross-sell, up-sell, similar)
   */
  static async getProductRecommendations(
    productId: string,
    type?: 'cross_sell' | 'up_sell' | 'similar' | 'frequently_bought_together',
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    const { data, error } = await supabase.rpc(
      'get_product_recommendations_for',
      {
        p_product_id: productId,
        p_recommendation_type: type || null,
        p_min_confidence: 0.5,
      }
    );

    if (error) throw error;

    return (data || []).slice(0, limit).map((item: any) => ({
      productId: item.recommended_product_id,
      productName: item.product_name,
      price: 0, // Would be joined from products table
      confidenceScore: item.confidence_score,
      recommendationType: item.recommendation_type,
      reason: this.getRecommendationReason(item.recommendation_type),
    }));
  }

  /**
   * Generate recommendations based on collaborative filtering
   */
  static async generateCollaborativeRecommendations(
    tenantId: string,
    customerId: string,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    // Mock collaborative filtering (in production: use ML models)
    // Find customers with similar purchase patterns
    const { data: customerOrders } = await supabase
      .from('orders')
      .select('id, items')
      .eq('customer_id', customerId)
      .eq('tenant_id', tenantId)
      .limit(10);

    if (!customerOrders || customerOrders.length === 0) {
      return this.generatePopularRecommendations(tenantId, limit);
    }

    // Get products they haven't purchased yet
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('tenant_id', tenantId)
      .limit(limit);

    return (allProducts || []).map(product => ({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images?.[0],
      price: product.price || 0,
      confidenceScore: 0.7 + Math.random() * 0.3,
      recommendationType: 'similar' as const,
      reason: 'Based on your purchase history',
    }));
  }

  /**
   * Generate personalized recommendations for customer
   */
  static async getPersonalizedRecommendations(
    tenantId: string,
    customerId: string
  ): Promise<PersonalizedRecommendation> {
    const recommendations = await this.generateCollaborativeRecommendations(
      tenantId,
      customerId,
      8
    );

    return {
      customerId,
      recommendations,
      recommendationReason: 'Based on your browsing and purchase history',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get trending/popular products
   */
  static async generatePopularRecommendations(
    tenantId: string,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    // Get most ordered products
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(product => ({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images?.[0],
      price: product.price || 0,
      confidenceScore: 0.9,
      recommendationType: 'similar' as const,
      reason: 'Popular products',
    }));
  }

  /**
   * Generate "Frequently Bought Together" recommendations
   */
  static async generateFrequentlyBoughtTogether(
    tenantId: string,
    productId: string
  ): Promise<ProductRecommendation[]> {
    // In production: analyze order patterns to find co-purchased items
    const { data } = await supabase
      .from('product_recommendations')
      .select('*, product:products!recommended_product_id(name, price, images)')
      .eq('source_product_id', productId)
      .eq('recommendation_type', 'frequently_bought_together')
      .eq('is_active', true)
      .order('confidence_score', { ascending: false })
      .limit(5);

    if (!data || data.length === 0) {
      // Fallback to similar products
      return this.getSimilarProducts(tenantId, productId, 5);
    }

    return data.map(item => ({
      productId: item.recommended_product_id,
      productName: item.product?.name || 'Unknown',
      imageUrl: item.product?.images?.[0],
      price: item.product?.price || 0,
      confidenceScore: item.confidence_score,
      recommendationType: 'frequently_bought_together' as const,
      reason: `${item.co_purchase_count} customers bought this together`,
    }));
  }

  /**
   * Get similar products (content-based filtering)
   */
  static async getSimilarProducts(
    tenantId: string,
    productId: string,
    limit: number = 10
  ): Promise<ProductRecommendation[]> {
    // Get the source product
    const { data: sourceProduct } = await supabase
      .from('products')
      .select('category_id, price')
      .eq('id', productId)
      .single();

    if (!sourceProduct) return [];

    // Find products in same category with similar price
    const { data: similarProducts } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('tenant_id', tenantId)
      .eq('category_id', sourceProduct.category_id)
      .neq('id', productId)
      .limit(limit);

    return (similarProducts || []).map(product => ({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images?.[0],
      price: product.price || 0,
      confidenceScore: 0.75 + Math.random() * 0.2,
      recommendationType: 'similar' as const,
      reason: 'Similar products you might like',
    }));
  }

  /**
   * Generate up-sell recommendations (higher-priced alternatives)
   */
  static async getUpSellRecommendations(
    tenantId: string,
    productId: string,
    limit: number = 5
  ): Promise<ProductRecommendation[]> {
    const { data: sourceProduct } = await supabase
      .from('products')
      .select('category_id, price')
      .eq('id', productId)
      .single();

    if (!sourceProduct) return [];

    // Find products in same category with 20-50% higher price
    const minPrice = sourceProduct.price * 1.2;
    const maxPrice = sourceProduct.price * 1.5;

    const { data: upSellProducts } = await supabase
      .from('products')
      .select('id, name, price, images')
      .eq('tenant_id', tenantId)
      .eq('category_id', sourceProduct.category_id)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .neq('id', productId)
      .limit(limit);

    return (upSellProducts || []).map(product => ({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images?.[0],
      price: product.price || 0,
      confidenceScore: 0.8,
      recommendationType: 'up_sell' as const,
      reason: 'Premium alternative with enhanced features',
    }));
  }

  /**
   * Train recommendation model (update co-purchase patterns)
   */
  static async trainRecommendationModel(tenantId: string): Promise<void> {
    // In production: analyze order data and update product_recommendations table
    console.log(`Training recommendation model for tenant: ${tenantId}`);

    // Mock: Generate some recommendations based on order data
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('tenant_id', tenantId)
      .limit(50);

    if (!products) return;

    const recommendations = [];
    for (let i = 0; i < products.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 5, products.length); j++) {
        recommendations.push({
          tenant_id: tenantId,
          source_product_id: products[i].id,
          recommended_product_id: products[j].id,
          recommendation_type: 'similar',
          confidence_score: 0.7 + Math.random() * 0.3,
          recommendation_strength: 'moderate',
        });
      }
    }

    // Save recommendations
    await supabase.from('product_recommendations').upsert(recommendations, {
      onConflict:
        'tenant_id,source_product_id,recommended_product_id,recommendation_type',
    });
  }

  /**
   * Get recommendation reason text
   */
  private static getRecommendationReason(type: string): string {
    const reasons: Record<string, string> = {
      cross_sell: 'Customers also viewed',
      up_sell: 'Premium alternative',
      similar: 'Similar products',
      frequently_bought_together: 'Frequently bought together',
    };

    return reasons[type] || 'Recommended for you';
  }

  /**
   * Get recommendation stats
   */
  static async getRecommendationStats(tenantId: string): Promise<{
    totalRecommendations: number;
    avgConfidence: number;
    topPerformingType: string;
  }> {
    const { data } = await supabase
      .from('product_recommendations')
      .select('confidence_score, recommendation_type, conversion_rate')
      .eq('tenant_id', tenantId);

    if (!data || data.length === 0) {
      return {
        totalRecommendations: 0,
        avgConfidence: 0,
        topPerformingType: 'similar',
      };
    }

    const avgConfidence =
      data.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / data.length;

    // Find type with highest conversion rate
    const typePerformance: Record<string, number> = {};
    data.forEach(r => {
      if (!typePerformance[r.recommendation_type]) {
        typePerformance[r.recommendation_type] = 0;
      }
      typePerformance[r.recommendation_type] += r.conversion_rate || 0;
    });

    const topPerformingType =
      Object.entries(typePerformance).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'similar';

    return {
      totalRecommendations: data.length,
      avgConfidence,
      topPerformingType,
    };
  }
}
