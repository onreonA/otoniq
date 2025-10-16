/**
 * FeedDoctorService
 * AI-powered product quality analysis and optimization
 *
 * Analyzes products across multiple dimensions:
 * - Title quality and SEO
 * - Description completeness
 * - Image quality
 * - Category relevance
 * - Price competitiveness
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAIService } from './OpenAIService';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface FeedAnalysis {
  id?: string;
  tenantId: string;
  productId: string;
  overallScore: number;
  titleScore?: number;
  descriptionScore?: number;
  imageScore?: number;
  categoryScore?: number;
  priceScore?: number;
  analysisData?: any;
  issues: AnalysisIssue[];
  suggestions: AnalysisSuggestion[];
  optimizedTitle?: string;
  optimizedDescription?: string;
  optimizedKeywords?: string[];
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  errorMessage?: string;
  isReviewed?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  analyzedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnalysisIssue {
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  field?: string;
}

export interface AnalysisSuggestion {
  type: string;
  message: string;
  autoFixable: boolean;
  fixAction?: string;
}

export interface ChannelContent {
  id?: string;
  tenantId: string;
  productId: string;
  feedAnalysisId?: string;
  channelType:
    | 'shopify'
    | 'odoo'
    | 'trendyol'
    | 'amazon'
    | 'hepsiburada'
    | 'n11'
    | 'etsy'
    | 'facebook'
    | 'instagram'
    | 'google_shopping';
  channelId?: string;
  channelTitle: string;
  channelDescription?: string;
  channelCategory?: string;
  channelPrice?: number;
  channelCurrency?: string;
  channelMetadata?: any;
  channelTags?: string[];
  channelAttributes?: any;
  seoKeywords?: string[];
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  lastSyncedAt?: string;
  syncError?: string;
  externalProductId?: string;
  externalUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OptimizationRule {
  id?: string;
  tenantId?: string;
  ruleName: string;
  ruleDescription?: string;
  ruleCategory:
    | 'title'
    | 'description'
    | 'image'
    | 'category'
    | 'price'
    | 'general';
  channelType?: string;
  ruleType: 'length' | 'keyword' | 'format' | 'regex' | 'ai_check' | 'custom';
  ruleConfig: any;
  weight: number;
  penaltyPoints: number;
  isActive?: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical';
  isAutoFixable?: boolean;
  autoFixTemplate?: string;
}

export interface AnalysisStats {
  totalProducts: number;
  analyzedCount: number;
  averageScore: number;
  lowQualityCount: number; // score < 50
  mediumQualityCount: number; // score 50-75
  highQualityCount: number; // score > 75
  pendingAnalysis: number;
}

export class FeedDoctorService {
  /**
   * Analyze a single product
   */
  static async analyzeProduct(
    tenantId: string,
    productId: string
  ): Promise<FeedAnalysis> {
    try {
      // Fetch product data
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('tenant_id', tenantId)
        .single();

      if (productError) throw productError;
      if (!product) throw new Error('Product not found');

      // Fetch optimization rules
      const { data: rules } = await supabase
        .from('feed_optimization_rules')
        .select('*')
        .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
        .eq('is_active', true);

      // Run analysis
      const analysis = await this.runAnalysis(product, rules || []);

      // Save analysis results
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('feed_analysis')
        .upsert(
          {
            tenant_id: tenantId,
            product_id: productId,
            overall_score: analysis.overallScore,
            title_score: analysis.titleScore,
            description_score: analysis.descriptionScore,
            image_score: analysis.imageScore,
            category_score: analysis.categoryScore,
            price_score: analysis.priceScore,
            analysis_data: analysis.analysisData,
            issues: analysis.issues,
            suggestions: analysis.suggestions,
            optimized_title: analysis.optimizedTitle,
            optimized_description: analysis.optimizedDescription,
            optimized_keywords: analysis.optimizedKeywords,
            status: 'completed',
            analyzed_at: new Date().toISOString(),
          },
          {
            onConflict: 'tenant_id,product_id',
          }
        )
        .select()
        .single();

      if (saveError) throw saveError;

      return this.mapToFeedAnalysis(savedAnalysis);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error analyzing product:', error);
      }

      // Save failed analysis
      await supabase.from('feed_analysis').upsert(
        {
          tenant_id: tenantId,
          product_id: productId,
          overall_score: 0,
          status: 'failed',
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        },
        {
          onConflict: 'tenant_id,product_id',
        }
      );

      throw error;
    }
  }

  /**
   * Run analysis on product data
   */
  private static async runAnalysis(
    product: any,
    rules: OptimizationRule[]
  ): Promise<FeedAnalysis> {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];

    // Use OpenAI for intelligent analysis if available
    let aiAnalysis = null;
    if (OpenAIService.isConfigured()) {
      try {
        aiAnalysis = await OpenAIService.analyzeProduct({
          productName: product.name || '',
          description: product.description || '',
          category: product.category_id,
          price: product.price,
          images: product.images || [],
          currentTags: product.tags || [],
        });

        // Convert AI issues to our format
        aiAnalysis.issues.forEach(issue => {
          issues.push({
            type: issue.category,
            severity: issue.severity as 'info' | 'warning' | 'error' | 'critical',
            message: issue.message,
            field: issue.category,
          });
          suggestions.push({
            type: issue.category,
            message: issue.suggestion,
            autoFixable: false,
          });
        });
      } catch (error) {
        console.error('AI analysis failed, falling back to rule-based:', error);
      }
    }

    // Fallback to rule-based analysis or combine with AI
    if (!aiAnalysis) {
      // Analyze title
      const titleAnalysis = this.analyzeTitle(product.name || '', rules);
      issues.push(...titleAnalysis.issues);
      suggestions.push(...titleAnalysis.suggestions);

      // Analyze description
      const descAnalysis = this.analyzeDescription(
        product.description || '',
        rules
      );
      issues.push(...descAnalysis.issues);
      suggestions.push(...descAnalysis.suggestions);

      // Analyze images
      const imageAnalysis = this.analyzeImages(product.images || [], rules);
      issues.push(...imageAnalysis.issues);
      suggestions.push(...imageAnalysis.suggestions);

      // Analyze category
      const categoryAnalysis = this.analyzeCategory(product.category_id, rules);
      issues.push(...categoryAnalysis.issues);
      suggestions.push(...categoryAnalysis.suggestions);

      // Analyze price
      const priceAnalysis = this.analyzePrice(product.price, rules);
      issues.push(...priceAnalysis.issues);
      suggestions.push(...priceAnalysis.suggestions);

      // Calculate overall score
      const overallScore = Math.round(
        (titleAnalysis.score +
          descAnalysis.score +
          imageAnalysis.score +
          categoryAnalysis.score +
          priceAnalysis.score) /
          5
      );

      return {
        tenantId: product.tenant_id,
        productId: product.id,
        overallScore,
        titleScore: titleAnalysis.score,
        descriptionScore: descAnalysis.score,
        imageScore: imageAnalysis.score,
        categoryScore: categoryAnalysis.score,
        priceScore: priceAnalysis.score,
        analysisData: {
          productName: product.name,
          analyzedFields: ['title', 'description', 'images', 'category', 'price'],
          rulesApplied: rules.length,
        },
        issues,
        suggestions,
        optimizedTitle: this.generateOptimizedTitle(product.name || ''),
        optimizedDescription: this.generateOptimizedDescription(
          product.description || ''
        ),
        optimizedKeywords: this.extractKeywords(
          product.name || '' + ' ' + (product.description || '')
        ),
        status: 'completed',
      };
    }

    // Use AI analysis results
    return {
      tenantId: product.tenant_id,
      productId: product.id,
      overallScore: aiAnalysis.score,
      titleScore: aiAnalysis.seoScore.titleScore,
      descriptionScore: aiAnalysis.seoScore.descriptionScore,
      imageScore: product.images?.length >= 3 ? 85 : 50,
      categoryScore: product.category_id ? 90 : 40,
      priceScore: product.price ? 80 : 30,
      analysisData: {
        productName: product.name,
        analyzedFields: ['title', 'description', 'images', 'category', 'price'],
        rulesApplied: rules.length,
        aiPowered: true,
        marketInsights: aiAnalysis.marketInsights,
      },
      issues,
      suggestions,
      optimizedTitle: aiAnalysis.optimizations.suggestedTitle,
      optimizedDescription: aiAnalysis.optimizations.suggestedDescription,
      optimizedKeywords: aiAnalysis.optimizations.suggestedKeywords || [],
      status: 'completed',
    };
  }

  /**
   * Analyze title quality
   */
  private static analyzeTitle(title: string, rules: OptimizationRule[]) {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];
    let score = 100;

    const titleRules = rules.filter(r => r.ruleCategory === 'title');

    // Length check
    if (title.length < 30) {
      issues.push({
        type: 'title_too_short',
        severity: 'warning',
        message: `Title is too short (${title.length} chars). Recommended: 30-60 characters.`,
        field: 'title',
      });
      suggestions.push({
        type: 'title_length',
        message: 'Expand title with product features or brand name',
        autoFixable: false,
      });
      score -= 15;
    } else if (title.length > 80) {
      issues.push({
        type: 'title_too_long',
        severity: 'info',
        message: `Title is too long (${title.length} chars). May be truncated in listings.`,
        field: 'title',
      });
      score -= 5;
    }

    // Special characters check
    if (/[!@#$%^&*()]{3,}/.test(title)) {
      issues.push({
        type: 'title_special_chars',
        severity: 'warning',
        message: 'Title contains excessive special characters',
        field: 'title',
      });
      suggestions.push({
        type: 'title_cleanup',
        message: 'Remove unnecessary special characters',
        autoFixable: true,
        fixAction: 'clean_special_chars',
      });
      score -= 10;
    }

    // Capitalization check
    if (title === title.toUpperCase() || title === title.toLowerCase()) {
      issues.push({
        type: 'title_capitalization',
        severity: 'info',
        message: 'Title should use proper title case',
        field: 'title',
      });
      suggestions.push({
        type: 'title_case',
        message: 'Convert to title case for better readability',
        autoFixable: true,
        fixAction: 'convert_title_case',
      });
      score -= 5;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze description quality
   */
  private static analyzeDescription(
    description: string,
    rules: OptimizationRule[]
  ) {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];
    let score = 100;

    if (!description || description.length < 50) {
      issues.push({
        type: 'description_missing',
        severity: 'error',
        message:
          'Description is missing or too short. Minimum 150 characters recommended.',
        field: 'description',
      });
      suggestions.push({
        type: 'description_needed',
        message: 'Add detailed product description with benefits and features',
        autoFixable: false,
      });
      score -= 40;
    } else if (description.length < 150) {
      issues.push({
        type: 'description_short',
        severity: 'warning',
        message: 'Description is too short. Add more details for better SEO.',
        field: 'description',
      });
      score -= 15;
    }

    // Paragraph structure
    if (
      description &&
      !description.includes('\n') &&
      description.length > 200
    ) {
      issues.push({
        type: 'description_formatting',
        severity: 'info',
        message: 'Description should be structured with paragraphs',
        field: 'description',
      });
      suggestions.push({
        type: 'description_format',
        message: 'Break description into readable paragraphs',
        autoFixable: true,
        fixAction: 'add_paragraphs',
      });
      score -= 10;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze image quality
   */
  private static analyzeImages(images: string[], rules: OptimizationRule[]) {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];
    let score = 100;

    if (!images || images.length === 0) {
      issues.push({
        type: 'images_missing',
        severity: 'critical',
        message: 'Product has no images',
        field: 'images',
      });
      suggestions.push({
        type: 'images_needed',
        message: 'Add at least 3 high-quality product images',
        autoFixable: false,
      });
      score -= 50;
    } else if (images.length < 3) {
      issues.push({
        type: 'images_insufficient',
        severity: 'warning',
        message: `Only ${images.length} image(s). Recommended: 3-5 images`,
        field: 'images',
      });
      score -= 20;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze category assignment
   */
  private static analyzeCategory(
    categoryId: string | null,
    rules: OptimizationRule[]
  ) {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];
    let score = 100;

    if (!categoryId) {
      issues.push({
        type: 'category_missing',
        severity: 'error',
        message: 'Product is not assigned to any category',
        field: 'category',
      });
      suggestions.push({
        type: 'category_needed',
        message: 'Assign product to a specific category',
        autoFixable: false,
      });
      score -= 30;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Analyze price
   */
  private static analyzePrice(price: number | null, rules: OptimizationRule[]) {
    const issues: AnalysisIssue[] = [];
    const suggestions: AnalysisSuggestion[] = [];
    let score = 100;

    if (!price || price <= 0) {
      issues.push({
        type: 'price_invalid',
        severity: 'critical',
        message: 'Price is missing or invalid',
        field: 'price',
      });
      suggestions.push({
        type: 'price_needed',
        message: 'Set a valid price for the product',
        autoFixable: false,
      });
      score -= 50;
    }

    return { score: Math.max(0, score), issues, suggestions };
  }

  /**
   * Generate optimized title (mock AI)
   */
  private static generateOptimizedTitle(title: string): string {
    // Simple optimization: title case + cleanup
    return title
      .replace(/[!@#$%^&*()]{2,}/g, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate optimized description (mock AI)
   */
  private static generateOptimizedDescription(description: string): string {
    if (!description) return '';

    // Simple optimization: add structure
    const sentences = description.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 2) return description;

    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const para =
        sentences
          .slice(i, i + 2)
          .join('. ')
          .trim() + '.';
      paragraphs.push(para);
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Extract SEO keywords (mock AI)
   */
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction: most common words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Get analysis stats for dashboard
   */
  static async getAnalysisStats(tenantId: string): Promise<AnalysisStats> {
    try {
      // Total products
      const { count: totalProducts, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      if (countError) throw countError;

      // Analyzed products
      const { data: analyses, error: analysesError } = await supabase
        .from('feed_analysis')
        .select('overall_score, status')
        .eq('tenant_id', tenantId);

      if (analysesError) throw analysesError;

      const analyzedCount = analyses?.length || 0;
      const averageScore =
        analyzedCount > 0
          ? Math.round(
              (analyses?.reduce((sum, a) => sum + a.overall_score, 0) || 0) /
                analyzedCount
            )
          : 0;

      const lowQualityCount =
        analyses?.filter(a => a.overall_score < 50).length || 0;
      const mediumQualityCount =
        analyses?.filter(a => a.overall_score >= 50 && a.overall_score <= 75)
          .length || 0;
      const highQualityCount =
        analyses?.filter(a => a.overall_score > 75).length || 0;
      const pendingAnalysis = (totalProducts || 0) - analyzedCount;

      return {
        totalProducts: totalProducts || 0,
        analyzedCount,
        averageScore,
        lowQualityCount,
        mediumQualityCount,
        highQualityCount,
        pendingAnalysis,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting analysis stats:', error);
      }
      throw error;
    }
  }

  /**
   * Get all analyses for a tenant
   */
  static async getAnalyses(tenantId: string): Promise<FeedAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('feed_analysis')
        .select(
          `
          *,
          products (
            name,
            sku,
            images
          )
        `
        )
        .eq('tenant_id', tenantId)
        .order('analyzed_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapToFeedAnalysis);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting analyses:', error);
      }
      throw error;
    }
  }

  /**
   * Get single analysis
   */
  static async getAnalysis(
    tenantId: string,
    productId: string
  ): Promise<FeedAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('feed_analysis')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('product_id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.mapToFeedAnalysis(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting analysis:', error);
      }
      throw error;
    }
  }

  /**
   * Bulk analyze products
   */
  static async bulkAnalyze(
    tenantId: string,
    productIds: string[]
  ): Promise<{ succeeded: number; failed: number; errors: any[] }> {
    const errors: any[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const productId of productIds) {
      try {
        await this.analyzeProduct(tenantId, productId);
        succeeded++;
      } catch (error) {
        failed++;
        errors.push({
          productId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { succeeded, failed, errors };
  }

  /**
   * Map database row to FeedAnalysis
   */
  private static mapToFeedAnalysis(data: any): FeedAnalysis {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      productId: data.product_id,
      overallScore: data.overall_score,
      titleScore: data.title_score,
      descriptionScore: data.description_score,
      imageScore: data.image_score,
      categoryScore: data.category_score,
      priceScore: data.price_score,
      analysisData: data.analysis_data,
      issues: data.issues || [],
      suggestions: data.suggestions || [],
      optimizedTitle: data.optimized_title,
      optimizedDescription: data.optimized_description,
      optimizedKeywords: data.optimized_keywords,
      status: data.status,
      errorMessage: data.error_message,
      isReviewed: data.is_reviewed,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      reviewNotes: data.review_notes,
      analyzedAt: data.analyzed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
