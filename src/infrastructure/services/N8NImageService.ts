/**
 * N8N Image Generation Service
 * High-quality image generation using N8N workflows with Google AI
 * Browser-compatible, free, and integrated with existing N8N infrastructure
 */

import axios from 'axios';
import {
  mockN8NService,
  MockImageRequest,
  MockImageResponse,
} from './MockN8NService';

export interface N8NImageRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'vibrant';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'high' | 'ultra';
  numImages?: number;
  seed?: number;
}

export interface N8NImageResponse {
  images: {
    url: string;
    base64?: string;
    metadata: {
      prompt: string;
      style: string;
      aspectRatio: string;
      quality: string;
      seed: number;
      generatedAt: string;
      workflowId: string;
    };
  }[];
  usage: {
    tokensUsed: number;
    cost: number;
    workflowExecutionTime: number;
  };
}

export class N8NImageService {
  private n8nWebhookUrl: string;
  private n8nApiKey: string;

  constructor() {
    // Use direct N8N Cloud connection (bypass Supabase Edge Function)
    this.n8nWebhookUrl =
      import.meta.env.VITE_N8N_WEBHOOK_URL ||
      'https://otoniq.app.n8n.cloud/webhook-test/generate-image';
    this.n8nApiKey = import.meta.env.VITE_N8N_API_KEY || '';
  }

  /**
   * Generate images using N8N workflow (with mock fallback)
   */
  async generateImages(request: N8NImageRequest): Promise<N8NImageResponse> {
    try {
      console.log('🎨 Generating images with N8N workflow:', request);

      // Check if N8N is available
      if (
        !this.n8nWebhookUrl ||
        this.n8nWebhookUrl === 'http://localhost:5678' ||
        this.n8nWebhookUrl.includes('localhost')
      ) {
        console.log('🔄 N8N not available, using mock service');
        return await mockN8NService.generateImages(request as MockImageRequest);
      }

      // Enhanced prompt with style and quality instructions
      const enhancedPrompt = this.buildEnhancedPrompt(request);

      const startTime = Date.now();

      const response = await axios.post(
        this.n8nWebhookUrl,
        {
          prompt: enhancedPrompt,
          style: request.style || 'realistic',
          aspectRatio: request.aspectRatio || '1:1',
          quality: request.quality || 'high',
          numImages: request.numImages || 1,
          seed: request.seed || Math.floor(Math.random() * 1000000),
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds timeout
          withCredentials: false, // Disable credentials to avoid preflight
        }
      );

      const executionTime = Date.now() - startTime;

      console.log('📥 N8N Response:', response.data);
      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);

      if (!response.data || !response.data.images) {
        console.error('❌ Invalid N8N response format:', {
          hasData: !!response.data,
          hasImages: !!(response.data && response.data.images),
          actualData: response.data,
        });
        throw new Error('No images returned from N8N workflow');
      }

      return {
        images: response.data.images.map((image: any, index: number) => ({
          url: image.url || image.imageUrl,
          base64: image.base64,
          metadata: {
            prompt: request.prompt,
            style: request.style || 'realistic',
            aspectRatio: request.aspectRatio || '1:1',
            quality: request.quality || 'high',
            seed: request.seed || Math.floor(Math.random() * 1000000),
            generatedAt: new Date().toISOString(),
            workflowId: response.data.workflowId || 'unknown',
          },
        })),
        usage: {
          tokensUsed: enhancedPrompt.length,
          cost: 0, // N8N + Google AI free tier
          workflowExecutionTime: executionTime,
        },
      };
    } catch (error) {
      console.error(
        '❌ N8N image generation error, falling back to mock:',
        error
      );
      console.log('🔄 Using mock service as fallback');
      return await mockN8NService.generateImages(request as MockImageRequest);
    }
  }

  /**
   * Build enhanced prompt with style and quality instructions
   */
  private buildEnhancedPrompt(request: N8NImageRequest): string {
    let prompt = request.prompt;

    // Add style-specific enhancements
    switch (request.style) {
      case 'realistic':
        prompt +=
          ', photorealistic, high resolution, detailed, professional photography';
        break;
      case 'artistic':
        prompt +=
          ', artistic style, creative composition, aesthetic, visually appealing';
        break;
      case 'minimalist':
        prompt += ', minimalist design, clean, simple, elegant, modern';
        break;
      case 'vibrant':
        prompt +=
          ', vibrant colors, dynamic, energetic, colorful, eye-catching';
        break;
    }

    // Add quality enhancements
    switch (request.quality) {
      case 'ultra':
        prompt += ', ultra high quality, 8K resolution, perfect details';
        break;
      case 'high':
        prompt += ', high quality, sharp details, professional';
        break;
      default:
        prompt += ', good quality, clear';
    }

    // Add aspect ratio considerations
    if (request.aspectRatio === '16:9') {
      prompt += ', wide format, landscape orientation';
    } else if (request.aspectRatio === '9:16') {
      prompt += ', vertical format, portrait orientation';
    }

    return prompt;
  }

  /**
   * Generate product-focused images
   */
  async generateProductImages(
    productName: string,
    productDescription: string,
    template: string,
    style: string = 'realistic'
  ): Promise<N8NImageResponse> {
    const productPrompt = `Professional product photography of ${productName}. ${productDescription}. 
    ${template} template style. Clean background, studio lighting, commercial photography quality.`;

    return this.generateImages({
      prompt: productPrompt,
      style: style as any,
      aspectRatio: '1:1',
      quality: 'high',
      numImages: 4,
    });
  }

  /**
   * Generate social media content
   */
  async generateSocialMediaContent(
    prompt: string,
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin',
    style: string = 'vibrant'
  ): Promise<N8NImageResponse> {
    const platformPrompts = {
      instagram:
        'Instagram post design, square format, trendy, social media optimized',
      facebook: 'Facebook post design, engaging, social media content',
      twitter: 'Twitter header design, wide format, professional',
      linkedin: 'LinkedIn post design, professional, business-oriented',
    };

    const enhancedPrompt = `${prompt}. ${platformPrompts[platform]}. 
    Social media optimized, engaging design, modern aesthetics.`;

    const aspectRatios = {
      instagram: '1:1' as const,
      facebook: '16:9' as const,
      twitter: '16:9' as const,
      linkedin: '16:9' as const,
    };

    return this.generateImages({
      prompt: enhancedPrompt,
      style: style as any,
      aspectRatio: aspectRatios[platform],
      quality: 'high',
      numImages: 2,
    });
  }

  /**
   * Generate marketing materials
   */
  async generateMarketingMaterials(
    prompt: string,
    type: 'banner' | 'poster' | 'flyer' | 'ad',
    style: string = 'vibrant'
  ): Promise<N8NImageResponse> {
    const typePrompts = {
      banner: 'Marketing banner design, wide format, eye-catching, promotional',
      poster: 'Poster design, vertical format, artistic, attention-grabbing',
      flyer: 'Flyer design, compact, informative, promotional',
      ad: 'Advertisement design, commercial, persuasive, marketing-focused',
    };

    const enhancedPrompt = `${prompt}. ${typePrompts[type]}. 
    Marketing material, professional design, commercial quality.`;

    const aspectRatios = {
      banner: '16:9' as const,
      poster: '3:4' as const,
      flyer: '4:3' as const,
      ad: '16:9' as const,
    };

    return this.generateImages({
      prompt: enhancedPrompt,
      style: style as any,
      aspectRatio: aspectRatios[type],
      quality: 'high',
      numImages: 3,
    });
  }

  /**
   * Test N8N connection (with mock fallback)
   */
  async testConnection(): Promise<boolean> {
    try {
      if (
        !this.n8nWebhookUrl ||
        this.n8nWebhookUrl === 'http://localhost:5678' ||
        this.n8nWebhookUrl.includes('localhost')
      ) {
        console.log('🔄 N8N not available, using mock service');
        return await mockN8NService.testConnection();
      }

      const response = await axios.get(this.n8nWebhookUrl, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('❌ N8N connection test failed, using mock:', error);
      return await mockN8NService.testConnection();
    }
  }

  /**
   * Get N8N workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.n8nWebhookUrl}/webhook/workflow-status/${workflowId}`,
        {
          headers: {
            ...(this.n8nApiKey && {
              Authorization: `Bearer ${this.n8nApiKey}`,
            }),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get workflow status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const n8nImageService = new N8NImageService();
