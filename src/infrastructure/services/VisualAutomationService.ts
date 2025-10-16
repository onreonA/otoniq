import { createClient } from '@supabase/supabase-js';
import { CanvaService } from './CanvaService';
import { ImageProcessingService } from './ImageProcessingService';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface DesignTemplate {
  id: string;
  tenantId: string;
  templateName: string;
  templateType: 'product_card' | 'social_post' | 'banner' | 'story' | 'ad';
  platform?: string;
  dimensions: { width: number; height: number };
  canvaDesignId?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
}

export interface GeneratedVisual {
  id: string;
  tenantId: string;
  productId: string;
  templateId?: string;
  generationType: 'canva' | 'ai_generated' | 'enhanced' | 'resized';
  sourceImageUrl?: string;
  generatedImageUrl: string;
  width?: number;
  height?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  isPublished: boolean;
  publishedTo: string[];
}

export interface BatchVisualJob {
  id: string;
  tenantId: string;
  jobName: string;
  jobType: 'bulk_generate' | 'bulk_enhance' | 'bulk_resize' | 'bulk_watermark';
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export class VisualAutomationService {
  /**
   * Get all design templates
   */
  static async getTemplates(
    tenantId: string,
    filters?: { type?: string; platform?: string }
  ): Promise<DesignTemplate[]> {
    let query = supabase
      .from('design_templates')
      .select('*')
      .or(`tenant_id.eq.${tenantId},is_public.eq.true`)
      .order('usage_count', { ascending: false });

    if (filters?.type) {
      query = query.eq('template_type', filters.type);
    }
    if (filters?.platform) {
      query = query.eq('platform', filters.platform);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Create custom template
   */
  static async createTemplate(
    tenantId: string,
    templateData: {
      templateName: string;
      templateType: string;
      platform?: string;
      dimensions: { width: number; height: number };
      canvaDesignId?: string;
      tags?: string[];
    }
  ): Promise<DesignTemplate> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('design_templates')
      .insert({
        tenant_id: tenantId,
        template_name: templateData.templateName,
        template_type: templateData.templateType,
        platform: templateData.platform,
        dimensions: templateData.dimensions,
        canva_design_id: templateData.canvaDesignId,
        tags: templateData.tags || [],
        created_by: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Generate visual from template
   */
  static async generateVisual(
    tenantId: string,
    productId: string,
    templateId: string,
    customizations?: any
  ): Promise<GeneratedVisual> {
    try {
      // Get template
      const { data: template } = await supabase
        .from('design_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (!template) throw new Error('Template not found');

      // Get product data
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      // Generate with Canva if template has Canva ID
      let generatedUrl = '';
      let canvaDesignId = '';

      if (template.canva_design_id && CanvaService.isConfigured()) {
        const canvaResult = await CanvaService.createDesignFromTemplate(
          template.canva_design_id,
          {
            productName: product.name,
            productPrice: product.price,
            productImage: product.images?.[0],
            ...customizations,
          }
        );
        generatedUrl = canvaResult.exportUrl;
        canvaDesignId = canvaResult.designId;
      } else {
        // Fallback: Use image processing
        if (product.images?.[0]) {
          generatedUrl = await ImageProcessingService.resizeImage(
            product.images[0],
            template.dimensions.width,
            template.dimensions.height
          );
        }
      }

      // Save to database
      const { data: visual, error } = await supabase
        .from('generated_visuals')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          template_id: templateId,
          generation_type: template.canva_design_id ? 'canva' : 'resized',
          source_image_url: product.images?.[0],
          generated_image_url: generatedUrl,
          canva_design_id: canvaDesignId,
          width: template.dimensions.width,
          height: template.dimensions.height,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      // Update template usage count
      await supabase.rpc('increment', {
        table_name: 'design_templates',
        row_id: templateId,
        column_name: 'usage_count',
      });

      return visual;
    } catch (error) {
      console.error('Error generating visual:', error);
      throw error;
    }
  }

  /**
   * Bulk generate visuals
   */
  static async bulkGenerateVisuals(
    tenantId: string,
    templateId: string,
    productIds: string[]
  ): Promise<string> {
    const { data: user } = await supabase.auth.getUser();

    // Create batch job
    const { data: job, error } = await supabase
      .from('batch_visual_jobs')
      .insert({
        tenant_id: tenantId,
        job_name: `Bulk Visual Generation - ${new Date().toLocaleString()}`,
        job_type: 'bulk_generate',
        template_id: templateId,
        total_items: productIds.length,
        status: 'pending',
        created_by: user.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Start processing in background
    this.processBulkJob(job.id, tenantId, templateId, productIds);

    return job.id;
  }

  /**
   * Process bulk job (background)
   */
  private static async processBulkJob(
    jobId: string,
    tenantId: string,
    templateId: string,
    productIds: string[]
  ): Promise<void> {
    try {
      // Update job status
      await supabase
        .from('batch_visual_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', jobId);

      let successful = 0;
      let failed = 0;

      for (let i = 0; i < productIds.length; i++) {
        try {
          await this.generateVisual(tenantId, productIds[i], templateId);
          successful++;
        } catch (error) {
          failed++;
          console.error(
            `Failed to generate visual for product ${productIds[i]}:`,
            error
          );
        }

        // Update progress
        await supabase
          .from('batch_visual_jobs')
          .update({
            processed_items: i + 1,
            successful_items: successful,
            failed_items: failed,
          })
          .eq('id', jobId);
      }

      // Mark job as completed
      await supabase
        .from('batch_visual_jobs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (error) {
      console.error('Error processing bulk job:', error);
      await supabase
        .from('batch_visual_jobs')
        .update({
          status: 'failed',
          error_log: [
            { error: String(error), timestamp: new Date().toISOString() },
          ],
        })
        .eq('id', jobId);
    }
  }

  /**
   * Get generated visuals
   */
  static async getGeneratedVisuals(
    tenantId: string,
    filters?: { productId?: string; status?: string }
  ): Promise<GeneratedVisual[]> {
    let query = supabase
      .from('generated_visuals')
      .select(
        '*, product:products(name), template:design_templates(template_name)'
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  }

  /**
   * Enhance image with AI
   */
  static async enhanceImage(
    tenantId: string,
    productId: string,
    imageUrl: string,
    enhancements: string[]
  ): Promise<GeneratedVisual> {
    try {
      let enhancedUrl = imageUrl;

      // Apply enhancements
      for (const enhancement of enhancements) {
        switch (enhancement) {
          case 'upscale':
            enhancedUrl =
              await ImageProcessingService.upscaleImage(enhancedUrl);
            break;
          case 'remove_background':
            enhancedUrl =
              await ImageProcessingService.removeBackground(enhancedUrl);
            break;
          case 'enhance_quality':
            enhancedUrl =
              await ImageProcessingService.enhanceQuality(enhancedUrl);
            break;
          case 'color_correction':
            enhancedUrl =
              await ImageProcessingService.autoColorCorrect(enhancedUrl);
            break;
        }
      }

      // Save to database
      const { data, error } = await supabase
        .from('generated_visuals')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          generation_type: 'enhanced',
          source_image_url: imageUrl,
          generated_image_url: enhancedUrl,
          enhancements,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error enhancing image:', error);
      throw error;
    }
  }

  /**
   * Get batch job status
   */
  static async getBatchJobStatus(jobId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_batch_job_progress', {
      p_job_id: jobId,
    });

    if (error) throw error;
    return data?.[0] || null;
  }

  /**
   * Get visual generation statistics
   */
  static async getStats(tenantId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_visual_generation_stats', {
      p_tenant_id: tenantId,
    });

    if (error) throw error;
    return data?.[0] || {};
  }

  /**
   * Publish visual to platforms
   */
  static async publishVisual(
    visualId: string,
    platforms: string[]
  ): Promise<void> {
    const { error } = await supabase
      .from('generated_visuals')
      .update({
        is_published: true,
        published_to: platforms,
      })
      .eq('id', visualId);

    if (error) throw error;
  }
}
