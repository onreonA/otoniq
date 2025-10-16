import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface TextAnalysisResult {
  id: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  emotions: Record<string, number>;
  keywords: string[];
  entities: Array<{
    type: string;
    text: string;
    confidence: number;
  }>;
  readabilityScore: number;
  seoScore: number;
  seoIssues: string[];
  seoSuggestions: string[];
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

export class NLPService {
  /**
   * Analyze product description
   */
  static async analyzeProductDescription(
    tenantId: string,
    productId: string,
    description: string
  ): Promise<TextAnalysisResult> {
    const analysis = await this.analyzeText(description);

    // Save to database
    const { error } = await supabase.from('text_analysis').insert({
      tenant_id: tenantId,
      entity_type: 'product',
      entity_id: productId,
      text_content: description,
      sentiment: analysis.sentiment,
      sentiment_score: analysis.sentimentScore,
      sentiment_confidence: 0.85,
      keywords: analysis.keywords,
      entities: analysis.entities,
      readability_score: analysis.readabilityScore,
      seo_score: analysis.seoScore,
      seo_issues: analysis.seoIssues,
      seo_suggestions: analysis.seoSuggestions,
      word_count: description.split(/\s+/).length,
      sentence_count: description.split(/[.!?]+/).length,
    });

    if (error) throw error;
    return { ...analysis, id: crypto.randomUUID() };
  }

  /**
   * Analyze text (general purpose)
   */
  static async analyzeText(text: string): Promise<TextAnalysisResult> {
    // Mock NLP analysis (in production: OpenAI, HuggingFace, Google NLP)
    const words = text.toLowerCase().split(/\s+/);
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'love'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate'];

    const positiveCount = words.filter(w =>
      positiveWords.some(pw => w.includes(pw))
    ).length;
    const negativeCount = words.filter(w =>
      negativeWords.some(nw => w.includes(nw))
    ).length;

    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';
    let sentimentScore = 0;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      sentimentScore = 0.5 + (positiveCount / words.length) * 2;
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      sentimentScore = -0.5 - (negativeCount / words.length) * 2;
    } else if (positiveCount > 0 && negativeCount > 0) {
      sentiment = 'mixed';
    }

    return {
      id: crypto.randomUUID(),
      sentiment,
      sentimentScore: Math.max(-1, Math.min(1, sentimentScore)),
      emotions: {
        joy: sentiment === 'positive' ? 0.8 : 0.2,
        sadness: sentiment === 'negative' ? 0.7 : 0.1,
        anger: sentiment === 'negative' ? 0.5 : 0.05,
        surprise: 0.3,
        fear: 0.1,
      },
      keywords: this.extractKeywords(text),
      entities: this.extractEntities(text),
      readabilityScore: this.calculateReadability(text),
      seoScore: this.calculateSEOScore(text),
      seoIssues: this.getSEOIssues(text),
      seoSuggestions: this.getSEOSuggestions(text),
    };
  }

  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'her',
      'was',
      'one',
      'our',
      'out',
      'this',
      'that',
      'with',
      'have',
      'from',
    ]);

    const filtered = words.filter(w => !stopWords.has(w));

    // Count frequency
    const frequency: Record<string, number> = {};
    filtered.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Sort by frequency and return top 10
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Extract named entities
   */
  private static extractEntities(
    text: string
  ): Array<{ type: string; text: string; confidence: number }> {
    // Mock entity extraction (in production: use NER models)
    const entities: Array<{ type: string; text: string; confidence: number }> =
      [];

    // Extract potential brand names (capitalized words)
    const brandPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const brands = text.match(brandPattern) || [];
    brands.slice(0, 3).forEach(brand => {
      entities.push({
        type: 'BRAND',
        text: brand,
        confidence: 0.8 + Math.random() * 0.2,
      });
    });

    return entities;
  }

  /**
   * Calculate readability score (Flesch Reading Ease)
   */
  private static calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce(
      (sum, word) => sum + this.countSyllables(word),
      0
    );

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word (simple approximation)
   */
  private static countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (const char of word) {
      const isVowel = vowels.includes(char);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      count--;
    }

    return Math.max(1, count);
  }

  /**
   * Calculate SEO score
   */
  private static calculateSEOScore(text: string): number {
    let score = 0.5;

    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 50 && wordCount <= 300) score += 0.2;
    if (wordCount > 100) score += 0.1;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 3) score += 0.1;

    if (text.length > 0) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Get SEO issues
   */
  private static getSEOIssues(text: string): string[] {
    const issues: string[] = [];
    const wordCount = text.split(/\s+/).length;

    if (wordCount < 50) issues.push('Description is too short (< 50 words)');
    if (wordCount > 300) issues.push('Description is too long (> 300 words)');
    if (text.length === 0) issues.push('Description is empty');

    return issues;
  }

  /**
   * Get SEO suggestions
   */
  private static getSEOSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const wordCount = text.split(/\s+/).length;

    if (wordCount < 50)
      suggestions.push(
        'Add more details to improve SEO (aim for 50-150 words)'
      );
    if (!text.includes('?'))
      suggestions.push('Consider adding questions to engage readers');

    suggestions.push('Include relevant keywords naturally');
    suggestions.push('Use bullet points for key features');

    return suggestions;
  }

  /**
   * Analyze customer review sentiment
   */
  static async analyzeReview(
    tenantId: string,
    productId: string,
    customerId: string,
    reviewText: string,
    rating: number
  ): Promise<void> {
    const analysis = await this.analyzeText(reviewText);

    // Detect aspects (quality, price, shipping, etc.)
    const aspects = this.extractAspects(reviewText);

    await supabase.from('review_sentiment').insert({
      tenant_id: tenantId,
      product_id: productId,
      customer_id: customerId,
      review_text: reviewText,
      rating,
      sentiment: analysis.sentiment,
      sentiment_score: analysis.sentimentScore,
      aspects,
      positive_aspects: aspects
        .filter((a: any) => a.sentiment === 'positive')
        .map((a: any) => a.aspect),
      negative_aspects: aspects
        .filter((a: any) => a.sentiment === 'negative')
        .map((a: any) => a.aspect),
    });
  }

  /**
   * Extract aspects from review text
   */
  private static extractAspects(text: string): Array<{
    aspect: string;
    sentiment: string;
    score: number;
  }> {
    const aspects: Array<{ aspect: string; sentiment: string; score: number }> =
      [];

    // Mock aspect extraction
    if (text.toLowerCase().includes('quality')) {
      aspects.push({ aspect: 'quality', sentiment: 'positive', score: 0.8 });
    }
    if (text.toLowerCase().includes('price')) {
      aspects.push({ aspect: 'price', sentiment: 'neutral', score: 0.5 });
    }

    return aspects;
  }

  /**
   * Get product sentiment summary
   */
  static async getProductSentimentSummary(productId: string): Promise<any> {
    const { data, error } = await supabase.rpc(
      'get_product_sentiment_summary',
      {
        p_product_id: productId,
      }
    );

    if (error) throw error;
    return data;
  }

  /**
   * Generate AI content
   */
  static async generateContent(
    tenantId: string,
    generationType: string,
    inputPrompt: string,
    inputData: any
  ): Promise<string> {
    // Mock content generation (in production: OpenAI GPT-4)
    const templates: Record<string, string> = {
      product_description:
        'Discover our premium ${product_name} - crafted with excellence and designed for your needs. Perfect for ${use_case}.',
      ad_copy:
        'Limited Time Offer! Get ${product_name} now with ${discount}% off. Shop today!',
      email_subject: 'Exclusive Deal: ${product_name} - ${discount}% Off!',
    };

    let content = templates[generationType] || inputPrompt;

    // Replace variables
    Object.entries(inputData).forEach(([key, value]) => {
      content = content.replace(
        new RegExp(`\\$\\{${key}\\}`, 'g'),
        String(value)
      );
    });

    // Save to database
    await supabase.from('ai_content_generation').insert({
      tenant_id: tenantId,
      generation_type: generationType,
      input_prompt: inputPrompt,
      input_data: inputData,
      generated_content: content,
      content_quality_score: 0.85,
      ai_model: 'gpt-4-turbo',
      tokens_used: 150,
    });

    return content;
  }
}
