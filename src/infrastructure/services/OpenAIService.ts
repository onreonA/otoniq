import axios from 'axios';

/**
 * OpenAI Service
 * Handles AI-powered product analysis, optimization, and content generation
 */

export interface ProductAnalysisRequest {
  productName: string;
  description: string;
  category?: string;
  price?: number;
  images?: string[];
  currentTags?: string[];
}

export interface ProductAnalysisResult {
  score: number; // 0-100
  issues: {
    severity: 'critical' | 'warning' | 'info';
    category: 'seo' | 'content' | 'pricing' | 'images' | 'general';
    message: string;
    suggestion: string;
  }[];
  optimizations: {
    suggestedTitle?: string;
    suggestedDescription?: string;
    suggestedTags?: string[];
    suggestedKeywords?: string[];
    suggestedPrice?: {
      min: number;
      max: number;
      reasoning: string;
    };
  };
  seoScore: {
    titleScore: number;
    descriptionScore: number;
    keywordDensity: number;
    readability: number;
    overall: number;
  };
  marketInsights?: {
    competitorAnalysis?: string;
    trendingKeywords?: string[];
    suggestedImprovements?: string[];
  };
}

export class OpenAIService {
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  private static readonly API_URL =
    'https://api.openai.com/v1/chat/completions';
  private static readonly MODEL = 'gpt-4-turbo-preview';

  /**
   * Check if OpenAI is configured
   */
  static isConfigured(): boolean {
    return !!this.API_KEY && this.API_KEY !== 'your-openai-api-key-here';
  }

  /**
   * Analyze product and provide optimization suggestions
   */
  static async analyzeProduct(
    request: ProductAnalysisRequest
  ): Promise<ProductAnalysisResult> {
    if (!this.isConfigured()) {
      // Return mock data if OpenAI is not configured
      return this.getMockAnalysis(request);
    }

    try {
      const prompt = this.buildAnalysisPrompt(request);

      const response = await axios.post(
        this.API_URL,
        {
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert e-commerce product analyst specializing in SEO, content optimization, and marketplace performance. Analyze products and provide actionable improvement suggestions in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.API_KEY}`,
          },
        }
      );

      const analysis = JSON.parse(response.data.choices[0].message.content);
      return this.normalizeAnalysisResult(analysis);
    } catch (error) {
      console.error('Error analyzing product with OpenAI:', error);
      // Fallback to mock data on error
      return this.getMockAnalysis(request);
    }
  }

  /**
   * Build analysis prompt for OpenAI
   */
  private static buildAnalysisPrompt(request: ProductAnalysisRequest): string {
    return `Analyze this e-commerce product and provide detailed optimization suggestions:

**Product Name**: ${request.productName}
**Description**: ${request.description}
**Category**: ${request.category || 'Not specified'}
**Price**: ${request.price ? `₺${request.price}` : 'Not specified'}
**Current Tags**: ${request.currentTags?.join(', ') || 'None'}

Please analyze and return JSON with the following structure:
{
  "score": <overall quality score 0-100>,
  "issues": [
    {
      "severity": "critical|warning|info",
      "category": "seo|content|pricing|images|general",
      "message": "Brief description of the issue",
      "suggestion": "How to fix it"
    }
  ],
  "optimizations": {
    "suggestedTitle": "Optimized SEO-friendly title",
    "suggestedDescription": "Improved description with keywords",
    "suggestedTags": ["tag1", "tag2", "tag3"],
    "suggestedKeywords": ["keyword1", "keyword2"],
    "suggestedPrice": {
      "min": <number>,
      "max": <number>,
      "reasoning": "Why this price range"
    }
  },
  "seoScore": {
    "titleScore": <0-100>,
    "descriptionScore": <0-100>,
    "keywordDensity": <0-100>,
    "readability": <0-100>,
    "overall": <0-100>
  },
  "marketInsights": {
    "competitorAnalysis": "Brief market analysis",
    "trendingKeywords": ["trend1", "trend2"],
    "suggestedImprovements": ["improvement1", "improvement2"]
  }
}`;
  }

  /**
   * Normalize AI response to match our interface
   */
  private static normalizeAnalysisResult(analysis: any): ProductAnalysisResult {
    return {
      score: analysis.score || 50,
      issues: analysis.issues || [],
      optimizations: analysis.optimizations || {},
      seoScore: analysis.seoScore || {
        titleScore: 50,
        descriptionScore: 50,
        keywordDensity: 50,
        readability: 50,
        overall: 50,
      },
      marketInsights: analysis.marketInsights || {},
    };
  }

  /**
   * Get mock analysis for development/demo
   */
  private static getMockAnalysis(
    request: ProductAnalysisRequest
  ): ProductAnalysisResult {
    const titleLength = request.productName.length;
    const descLength = request.description.length;
    const hasPrice = !!request.price;
    const hasTags = request.currentTags && request.currentTags.length > 0;

    const issues = [];
    let score = 85;

    // Title analysis
    if (titleLength < 20) {
      issues.push({
        severity: 'warning' as const,
        category: 'seo' as const,
        message: 'Ürün başlığı çok kısa',
        suggestion:
          'Başlığı 20-60 karakter arasında olacak şekilde uzatın ve anahtar kelimeler ekleyin',
      });
      score -= 10;
    }

    // Description analysis
    if (descLength < 100) {
      issues.push({
        severity: 'critical' as const,
        category: 'content' as const,
        message: 'Ürün açıklaması yetersiz',
        suggestion:
          'En az 150-200 kelimelik detaylı bir açıklama yazın. Ürünün özelliklerini, faydalarını ve kullanım alanlarını ekleyin',
      });
      score -= 15;
    }

    // Price analysis
    if (!hasPrice) {
      issues.push({
        severity: 'warning' as const,
        category: 'pricing' as const,
        message: 'Fiyat bilgisi eksik',
        suggestion: 'Rekabetçi bir fiyat belirleyin',
      });
      score -= 5;
    }

    // Tags analysis
    if (!hasTags) {
      issues.push({
        severity: 'info' as const,
        category: 'seo' as const,
        message: 'Etiket bulunmuyor',
        suggestion:
          'Ürünü kategorize etmek için 5-10 adet ilgili etiket ekleyin',
      });
      score -= 5;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      optimizations: {
        suggestedTitle: `${request.productName} - Premium Kalite | Hızlı Kargo`,
        suggestedDescription: `${request.description}\n\n✨ Ürün Özellikleri:\n• Yüksek kalite malzeme\n• Dayanıklı yapı\n• Kolay kullanım\n\n📦 Kargo: Aynı gün kargo\n🎁 Hediye paketi seçeneği mevcut\n✅ %100 müşteri memnuniyeti`,
        suggestedTags: [
          request.category?.toLowerCase() || 'genel',
          'kaliteli',
          'hızlı-kargo',
          'indirimli',
          'yeni-sezon',
        ],
        suggestedKeywords: [
          request.productName.toLowerCase(),
          request.category?.toLowerCase() || '',
          'satın al',
          'ucuz',
          'en iyi',
        ].filter(Boolean),
        suggestedPrice: {
          min: request.price ? request.price * 0.9 : 100,
          max: request.price ? request.price * 1.2 : 200,
          reasoning:
            'Piyasa analizi ve rekabet göz önüne alındığında önerilen fiyat aralığı',
        },
      },
      seoScore: {
        titleScore: titleLength >= 20 && titleLength <= 60 ? 90 : 60,
        descriptionScore: descLength >= 150 ? 95 : descLength >= 100 ? 70 : 40,
        keywordDensity: hasTags ? 80 : 30,
        readability: 85,
        overall: score,
      },
      marketInsights: {
        competitorAnalysis:
          'Benzer ürünler ortalama ₺' +
          (request.price || 150) +
          ' fiyat aralığında satılıyor. Kalite ve hizmet ile öne çıkabilirsiniz.',
        trendingKeywords: [
          'hızlı kargo',
          'yeni sezon',
          'indirim',
          'kaliteli',
          'uygun fiyat',
        ],
        suggestedImprovements: [
          'Ürün görselleri ekleyin (en az 3-5 adet)',
          'Müşteri yorumları bölümü ekleyin',
          'Video içerik hazırlayın',
          'Ürün karşılaştırma tablosu oluşturun',
        ],
      },
    };
  }

  /**
   * Bulk analyze multiple products
   */
  static async analyzeBulkProducts(
    products: ProductAnalysisRequest[]
  ): Promise<ProductAnalysisResult[]> {
    // Process in batches to avoid rate limits
    const batchSize = 5;
    const results: ProductAnalysisResult[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(product => this.analyzeProduct(product))
      );
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Generate SEO-optimized product title
   */
  static async generateSEOTitle(
    productName: string,
    category?: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      return `${productName} - Premium Kalite | ${category || 'Online Satış'}`;
    }

    try {
      const response = await axios.post(
        this.API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an SEO expert. Generate SEO-optimized product titles for e-commerce.',
            },
            {
              role: 'user',
              content: `Generate a short, SEO-optimized title (50-60 chars) for: ${productName}${category ? `, Category: ${category}` : ''}`,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.API_KEY}`,
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating SEO title:', error);
      return `${productName} - Premium Kalite | ${category || 'Online Satış'}`;
    }
  }
}
