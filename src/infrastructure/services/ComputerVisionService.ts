import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface ImageAnalysisResult {
  id: string;
  productId: string;
  imageUrl: string;
  qualityScore: number;
  detectedObjects: Array<{
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  dominantColors: string[];
  aiTags: string[];
  isSafe: boolean;
  recommendations: string[];
}

export interface VisualSearchResult {
  productId: string;
  productName: string;
  imageUrl: string;
  similarityScore: number;
  price: number;
}

export class ComputerVisionService {
  /**
   * Analyze product image
   */
  static async analyzeImage(
    tenantId: string,
    productId: string,
    imageUrl: string
  ): Promise<ImageAnalysisResult> {
    // In production, this would call OpenAI Vision API or similar
    const mockAnalysis: ImageAnalysisResult = {
      id: crypto.randomUUID(),
      productId,
      imageUrl,
      qualityScore: 0.85 + Math.random() * 0.15,
      detectedObjects: [
        {
          label: 'product',
          confidence: 0.95,
          bbox: [100, 100, 300, 300],
        },
        {
          label: 'background',
          confidence: 0.88,
          bbox: [0, 0, 500, 500],
        },
      ],
      dominantColors: ['#FF5733', '#33FF57', '#3357FF'],
      aiTags: [
        'professional',
        'high-quality',
        'studio-lighting',
        'white-background',
      ],
      isSafe: true,
      recommendations: [
        'Consider adding lifestyle images',
        'Image quality is excellent',
        'Background is clean and professional',
      ],
    };

    // Save to database
    const { error } = await supabase.from('image_analysis').insert({
      tenant_id: tenantId,
      product_id: productId,
      image_url: imageUrl,
      analysis_type: 'quality',
      quality_score: mockAnalysis.qualityScore,
      detected_objects: mockAnalysis.detectedObjects,
      object_count: mockAnalysis.detectedObjects.length,
      dominant_colors: mockAnalysis.dominantColors,
      ai_tags: mockAnalysis.aiTags,
      is_safe: mockAnalysis.isSafe,
    });

    if (error) throw error;
    return mockAnalysis;
  }

  /**
   * Visual search - find similar products by image
   */
  static async visualSearch(
    tenantId: string,
    imageUrl: string,
    limit: number = 20
  ): Promise<VisualSearchResult[]> {
    // In production, this would use image embeddings and vector similarity
    const { data, error } = await supabase
      .from('products')
      .select('id, name, images, price')
      .eq('tenant_id', tenantId)
      .limit(limit);

    if (error) throw error;

    // Mock similarity scores
    const results: VisualSearchResult[] = (data || []).map(product => ({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images?.[0] || '',
      similarityScore: 0.7 + Math.random() * 0.3,
      price: product.price || 0,
    }));

    // Sort by similarity
    results.sort((a, b) => b.similarityScore - a.similarityScore);

    // Save search history
    await supabase.from('visual_search_history').insert({
      tenant_id: tenantId,
      search_image_url: imageUrl,
      search_type: 'similar',
      results_count: results.length,
      top_results: results.slice(0, 5).map(r => ({
        product_id: r.productId,
        similarity: r.similarityScore,
      })),
    });

    return results;
  }

  /**
   * Get image quality recommendations
   */
  static async getImageQualityRecommendations(
    tenantId: string,
    minQualityScore: number = 0.7
  ): Promise<
    Array<{
      productId: string;
      productName: string;
      imageUrl: string;
      qualityScore: number;
      issues: string[];
    }>
  > {
    const { data, error } = await supabase
      .from('image_analysis')
      .select('*, product:products(name)')
      .eq('tenant_id', tenantId)
      .lt('quality_score', minQualityScore)
      .order('quality_score')
      .limit(50);

    if (error) throw error;

    return (data || []).map(item => ({
      productId: item.product_id,
      productName: item.product?.name || 'Unknown',
      imageUrl: item.image_url,
      qualityScore: item.quality_score,
      issues: [
        item.is_blurry ? 'Image is blurry' : null,
        item.quality_score < 0.5 ? 'Low resolution' : null,
        'Consider retaking photo',
      ].filter(Boolean) as string[],
    }));
  }

  /**
   * Detect objects in image
   */
  static async detectObjects(
    imageUrl: string
  ): Promise<Array<{ label: string; confidence: number }>> {
    // Mock object detection (in production: OpenAI Vision, Google Vision, etc.)
    return [
      { label: 'product', confidence: 0.95 },
      { label: 'background', confidence: 0.88 },
      { label: 'text', confidence: 0.72 },
    ];
  }

  /**
   * Extract dominant colors from image
   */
  static async extractColors(imageUrl: string): Promise<string[]> {
    // Mock color extraction (in production: use color-thief or similar)
    return ['#FF5733', '#33FF57', '#3357FF', '#F0F0F0'];
  }

  /**
   * Check image for inappropriate content
   */
  static async moderateImage(imageUrl: string): Promise<{
    isSafe: boolean;
    labels: string[];
    confidence: number;
  }> {
    // Mock moderation (in production: OpenAI Moderation, AWS Rekognition, etc.)
    return {
      isSafe: true,
      labels: [],
      confidence: 0.99,
    };
  }

  /**
   * Generate AI tags for image
   */
  static async generateImageTags(imageUrl: string): Promise<string[]> {
    // Mock AI tagging (in production: OpenAI Vision API)
    return [
      'professional',
      'high-quality',
      'studio-lighting',
      'white-background',
      'product-photography',
      'e-commerce',
    ];
  }

  /**
   * Compare two images for similarity
   */
  static async compareImages(
    imageUrl1: string,
    imageUrl2: string
  ): Promise<number> {
    // Mock similarity score (in production: use CLIP or similar models)
    return 0.75 + Math.random() * 0.25;
  }

  /**
   * Get image analysis history
   */
  static async getAnalysisHistory(
    tenantId: string,
    productId?: string
  ): Promise<ImageAnalysisResult[]> {
    let query = supabase
      .from('image_analysis')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      productId: item.product_id,
      imageUrl: item.image_url,
      qualityScore: item.quality_score,
      detectedObjects: item.detected_objects || [],
      dominantColors: item.dominant_colors || [],
      aiTags: item.ai_tags || [],
      isSafe: item.is_safe,
      recommendations: [],
    }));
  }
}
