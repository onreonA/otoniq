import axios from 'axios';

/**
 * Canva Service
 * Integrates with Canva API for automated design generation
 * Docs: https://www.canva.dev/docs/connect/
 */

export interface CanvaDesignRequest {
  templateId?: string;
  title: string;
  width?: number;
  height?: number;
  format?:
    | 'instagram-post'
    | 'facebook-post'
    | 'twitter-post'
    | 'story'
    | 'custom';
  elements?: CanvaElement[];
}

export interface CanvaElement {
  type: 'text' | 'image' | 'shape';
  content?: string;
  imageUrl?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export interface CanvaDesign {
  id: string;
  title: string;
  thumbnailUrl: string;
  editUrl: string;
  exportUrl: string;
  createdAt: string;
}

export class CanvaService {
  private static readonly API_KEY = import.meta.env.VITE_CANVA_API_KEY;
  private static readonly API_URL = 'https://api.canva.com/v1';

  /**
   * Check if Canva is configured
   */
  static isConfigured(): boolean {
    return !!this.API_KEY && this.API_KEY !== 'your-canva-api-key-here';
  }

  /**
   * Get API client
   */
  private static getClient() {
    return axios.create({
      baseURL: this.API_URL,
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new design from template or scratch
   */
  static async createDesign(request: CanvaDesignRequest): Promise<CanvaDesign> {
    if (!this.isConfigured()) {
      return this.getMockDesign(request);
    }

    try {
      const client = this.getClient();

      // Get dimensions based on format
      const dimensions = this.getFormatDimensions(request.format || 'custom');

      const response = await client.post('/designs', {
        title: request.title,
        width: request.width || dimensions.width,
        height: request.height || dimensions.height,
        template_id: request.templateId,
      });

      const design = response.data;

      // If elements provided, add them to the design
      if (request.elements && request.elements.length > 0) {
        await this.addElements(design.id, request.elements);
      }

      return {
        id: design.id,
        title: design.title,
        thumbnailUrl: design.thumbnail_url,
        editUrl: design.edit_url,
        exportUrl: design.export_url,
        createdAt: design.created_at,
      };
    } catch (error) {
      console.error('Error creating Canva design:', error);
      return this.getMockDesign(request);
    }
  }

  /**
   * Add elements to an existing design
   */
  static async addElements(
    designId: string,
    elements: CanvaElement[]
  ): Promise<void> {
    if (!this.isConfigured()) return;

    try {
      const client = this.getClient();

      for (const element of elements) {
        await client.post(`/designs/${designId}/elements`, {
          type: element.type,
          content: element.content,
          image_url: element.imageUrl,
          position: {
            x: element.x || 0,
            y: element.y || 0,
          },
          size: {
            width: element.width || 100,
            height: element.height || 100,
          },
          style: {
            font_size: element.fontSize,
            font_family: element.fontFamily,
            color: element.color,
          },
        });
      }
    } catch (error) {
      console.error('Error adding elements to design:', error);
    }
  }

  /**
   * Export design to various formats
   */
  static async exportDesign(
    designId: string,
    format: 'png' | 'jpg' | 'pdf' | 'mp4' = 'png'
  ): Promise<string> {
    if (!this.isConfigured()) {
      return `https://via.placeholder.com/1080x1080.${format}?text=Mock+Design`;
    }

    try {
      const client = this.getClient();

      const response = await client.post(`/designs/${designId}/export`, {
        format,
        quality: 'high',
      });

      return response.data.export_url;
    } catch (error) {
      console.error('Error exporting design:', error);
      return `https://via.placeholder.com/1080x1080.${format}?text=Mock+Design`;
    }
  }

  /**
   * Generate social media post design from product data
   */
  static async generateProductPost(
    productName: string,
    productImage: string,
    price: number,
    platform: 'instagram' | 'facebook' | 'twitter'
  ): Promise<CanvaDesign> {
    const dimensions = this.getFormatDimensions(
      platform === 'instagram'
        ? 'instagram-post'
        : platform === 'facebook'
          ? 'facebook-post'
          : 'twitter-post'
    );

    const design = await this.createDesign({
      title: `${productName} - ${platform} Post`,
      format: `${platform}-post` as any,
      elements: [
        {
          type: 'image',
          imageUrl: productImage,
          x: 0,
          y: 0,
          width: dimensions.width,
          height: dimensions.height * 0.7,
        },
        {
          type: 'text',
          content: productName,
          x: 50,
          y: dimensions.height * 0.75,
          fontSize: 48,
          fontFamily: 'Montserrat',
          color: '#FFFFFF',
        },
        {
          type: 'text',
          content: `₺${price.toFixed(2)}`,
          x: 50,
          y: dimensions.height * 0.85,
          fontSize: 36,
          fontFamily: 'Montserrat',
          color: '#FFD700',
        },
      ],
    });

    return design;
  }

  /**
   * Get format dimensions
   */
  private static getFormatDimensions(format: string): {
    width: number;
    height: number;
  } {
    const formats: Record<string, { width: number; height: number }> = {
      'instagram-post': { width: 1080, height: 1080 },
      'instagram-story': { width: 1080, height: 1920 },
      'facebook-post': { width: 1200, height: 630 },
      'twitter-post': { width: 1200, height: 675 },
      story: { width: 1080, height: 1920 },
      custom: { width: 1920, height: 1080 },
    };

    return formats[format] || formats.custom;
  }

  /**
   * Get mock design for development
   */
  private static getMockDesign(request: CanvaDesignRequest): CanvaDesign {
    const dimensions = this.getFormatDimensions(request.format || 'custom');
    const mockId = `mock-${Date.now()}`;

    return {
      id: mockId,
      title: request.title,
      thumbnailUrl: `https://via.placeholder.com/${dimensions.width}x${dimensions.height}?text=${encodeURIComponent(request.title)}`,
      editUrl: `https://www.canva.com/design/${mockId}/edit`,
      exportUrl: `https://via.placeholder.com/${dimensions.width}x${dimensions.height}.png?text=${encodeURIComponent(request.title)}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * List available templates
   */
  static async getTemplates(
    category?: 'social-media' | 'marketing' | 'branding' | 'all'
  ): Promise<
    Array<{ id: string; title: string; thumbnailUrl: string; category: string }>
  > {
    if (!this.isConfigured()) {
      return this.getMockTemplates();
    }

    try {
      const client = this.getClient();

      const response = await client.get('/templates', {
        params: {
          category: category === 'all' ? undefined : category,
          limit: 20,
        },
      });

      return response.data.templates.map((t: any) => ({
        id: t.id,
        title: t.title,
        thumbnailUrl: t.thumbnail_url,
        category: t.category,
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.getMockTemplates();
    }
  }

  /**
   * Get mock templates
   */
  private static getMockTemplates(): Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    category: string;
  }> {
    return [
      {
        id: 'template-1',
        title: 'Instagram Product Post',
        thumbnailUrl: 'https://via.placeholder.com/300x300?text=Instagram+Post',
        category: 'social-media',
      },
      {
        id: 'template-2',
        title: 'Facebook Ad Banner',
        thumbnailUrl: 'https://via.placeholder.com/300x300?text=Facebook+Ad',
        category: 'marketing',
      },
      {
        id: 'template-3',
        title: 'Story Template',
        thumbnailUrl: 'https://via.placeholder.com/300x533?text=Story',
        category: 'social-media',
      },
      {
        id: 'template-4',
        title: 'Product Catalog',
        thumbnailUrl: 'https://via.placeholder.com/300x400?text=Catalog',
        category: 'marketing',
      },
      {
        id: 'template-5',
        title: 'Brand Logo Set',
        thumbnailUrl: 'https://via.placeholder.com/300x300?text=Logo',
        category: 'branding',
      },
    ];
  }

  /**
   * Bulk generate designs for multiple products
   */
  static async bulkGenerateProductPosts(
    products: Array<{
      name: string;
      image: string;
      price: number;
    }>,
    platform: 'instagram' | 'facebook' | 'twitter'
  ): Promise<CanvaDesign[]> {
    const designs: CanvaDesign[] = [];

    for (const product of products) {
      try {
        const design = await this.generateProductPost(
          product.name,
          product.image,
          product.price,
          platform
        );
        designs.push(design);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error generating design for ${product.name}:`, error);
      }
    }

    return designs;
  }
}
