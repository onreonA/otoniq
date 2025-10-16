import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Product3DModel {
  id: string;
  tenantId: string;
  productId: string;
  modelName: string;
  modelType: 'glb' | 'gltf' | 'obj' | 'fbx';
  modelFileUrl: string;
  modelSizeMb: number;
  hasAnimations: boolean;
  hasTextures: boolean;
  polygonCount?: number;
  textureResolution?: string;
  arEnabled: boolean;
  arScale: number;
  arAnchorType: 'plane' | 'image' | 'face';
  previewCameraPosition: { x: number; y: number; z: number };
  previewBackgroundColor: string;
  viewCount: number;
  arViewCount: number;
  status: 'processing' | 'active' | 'failed' | 'archived';
}

export interface ARSession {
  id: string;
  tenantId: string;
  productId: string;
  modelId: string;
  customerId?: string;
  sessionType: '3d_viewer' | 'ar_view' | 'vr_view';
  deviceType: string;
  browser: string;
  platform: string;
  arSupported: boolean;
  webxrSupported: boolean;
  sessionDurationSeconds?: number;
  interactionsCount: number;
  screenshotsTaken: number;
  zoomUsed: boolean;
  rotationUsed: boolean;
  arPlacementAttempts: number;
  arPlacementSuccessful: number;
  ledToPurchase: boolean;
  addedToCart: boolean;
}

export class ARViewerService {
  /**
   * Get 3D models for product
   */
  static async getProduct3DModels(
    tenantId: string,
    productId?: string
  ): Promise<Product3DModel[]> {
    let query = supabase
      .from('product_3d_models')
      .select('*, product:products(name, images)')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Upload 3D model for product
   */
  static async upload3DModel(
    tenantId: string,
    productId: string,
    modelData: {
      modelName: string;
      modelType: 'glb' | 'gltf' | 'obj' | 'fbx';
      modelFile: File;
      arEnabled?: boolean;
      arScale?: number;
      previewCameraPosition?: { x: number; y: number; z: number };
    }
  ): Promise<Product3DModel> {
    try {
      // Upload file to Supabase Storage
      const fileName = `${tenantId}/${productId}/${Date.now()}-${modelData.modelFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('3d-models')
        .upload(fileName, modelData.modelFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('3d-models')
        .getPublicUrl(fileName);

      // Create database record
      const { data, error } = await supabase
        .from('product_3d_models')
        .insert({
          tenant_id: tenantId,
          product_id: productId,
          model_name: modelData.modelName,
          model_type: modelData.modelType,
          model_file_url: publicUrlData.publicUrl,
          model_size_mb: modelData.modelFile.size / (1024 * 1024),
          ar_enabled: modelData.arEnabled || false,
          ar_scale: modelData.arScale || 1.0,
          preview_camera_position: modelData.previewCameraPosition || {
            x: 0,
            y: 0,
            z: 5,
          },
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      throw error;
    }
  }

  /**
   * Update 3D model settings
   */
  static async update3DModel(
    modelId: string,
    updates: {
      arEnabled?: boolean;
      arScale?: number;
      arAnchorType?: 'plane' | 'image' | 'face';
      previewCameraPosition?: { x: number; y: number; z: number };
      previewBackgroundColor?: string;
    }
  ): Promise<Product3DModel> {
    const { data, error } = await supabase
      .from('product_3d_models')
      .update({
        ar_enabled: updates.arEnabled,
        ar_scale: updates.arScale,
        ar_anchor_type: updates.arAnchorType,
        preview_camera_position: updates.previewCameraPosition,
        preview_background_color: updates.previewBackgroundColor,
      })
      .eq('id', modelId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Start AR/3D viewing session
   */
  static async startSession(
    tenantId: string,
    productId: string,
    modelId: string,
    sessionType: '3d_viewer' | 'ar_view' | 'vr_view',
    deviceInfo: {
      deviceType: string;
      browser: string;
      platform: string;
      arSupported: boolean;
      webxrSupported: boolean;
    },
    customerId?: string
  ): Promise<string> {
    const { data, error } = await supabase
      .from('ar_sessions')
      .insert({
        tenant_id: tenantId,
        product_id: productId,
        model_id: modelId,
        customer_id: customerId,
        session_type: sessionType,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        platform: deviceInfo.platform,
        ar_supported: deviceInfo.arSupported,
        webxr_supported: deviceInfo.webxrSupported,
        interactions_count: 0,
        screenshots_taken: 0,
        ar_placement_attempts: 0,
        ar_placement_successful: 0,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Increment view count
    await supabase.rpc('increment', {
      table_name: 'product_3d_models',
      row_id: modelId,
      column_name: sessionType === 'ar_view' ? 'ar_view_count' : 'view_count',
    });

    return data.id;
  }

  /**
   * Update session with user interactions
   */
  static async updateSession(
    sessionId: string,
    updates: {
      interactionsCount?: number;
      screenshotsTaken?: number;
      zoomUsed?: boolean;
      rotationUsed?: boolean;
      arPlacementAttempts?: number;
      arPlacementSuccessful?: number;
      addedToCart?: boolean;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('ar_sessions')
      .update({
        interactions_count: updates.interactionsCount,
        screenshots_taken: updates.screenshotsTaken,
        zoom_used: updates.zoomUsed,
        rotation_used: updates.rotationUsed,
        ar_placement_attempts: updates.arPlacementAttempts,
        ar_placement_successful: updates.arPlacementSuccessful,
        added_to_cart: updates.addedToCart,
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * End AR/3D viewing session
   */
  static async endSession(
    sessionId: string,
    sessionDurationSeconds: number,
    ledToPurchase: boolean = false
  ): Promise<void> {
    const { error } = await supabase
      .from('ar_sessions')
      .update({
        session_duration_seconds: sessionDurationSeconds,
        led_to_purchase: ledToPurchase,
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Get 3D model statistics
   */
  static async get3DModelStatistics(tenantId: string): Promise<any> {
    const { data, error } = await supabase.rpc('get_3d_model_statistics', {
      p_tenant_id: tenantId,
    });

    if (error) throw error;
    return data?.[0] || {};
  }

  /**
   * Get AR session analytics
   */
  static async getARAnalytics(
    tenantId: string,
    productId?: string,
    days: number = 30
  ): Promise<{
    totalSessions: number;
    avgSessionDuration: number;
    arConversionRate: number;
    topDevices: any[];
    sessionsByType: any[];
  }> {
    const startDate = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    let query = supabase
      .from('ar_sessions')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: sessions, error } = await query;
    if (error) throw error;

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        avgSessionDuration: 0,
        arConversionRate: 0,
        topDevices: [],
        sessionsByType: [],
      };
    }

    // Calculate metrics
    const totalSessions = sessions.length;
    const avgSessionDuration =
      sessions
        .filter(s => s.session_duration_seconds)
        .reduce((sum, s) => sum + s.session_duration_seconds, 0) /
      totalSessions;

    const conversions = sessions.filter(
      s => s.led_to_purchase || s.added_to_cart
    ).length;
    const arConversionRate = (conversions / totalSessions) * 100;

    // Top devices
    const deviceCounts: Record<string, number> = {};
    sessions.forEach(s => {
      deviceCounts[s.device_type] = (deviceCounts[s.device_type] || 0) + 1;
    });
    const topDevices = Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([device, count]) => ({ device, count }));

    // Sessions by type
    const typeCounts: Record<string, number> = {};
    sessions.forEach(s => {
      typeCounts[s.session_type] = (typeCounts[s.session_type] || 0) + 1;
    });
    const sessionsByType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
    }));

    return {
      totalSessions,
      avgSessionDuration: Math.round(avgSessionDuration),
      arConversionRate: Math.round(arConversionRate * 100) / 100,
      topDevices,
      sessionsByType,
    };
  }

  /**
   * Delete 3D model
   */
  static async delete3DModel(modelId: string): Promise<void> {
    // Get model info
    const { data: model } = await supabase
      .from('product_3d_models')
      .select('model_file_url')
      .eq('id', modelId)
      .single();

    if (model) {
      // Extract file path from URL
      const urlParts = model.model_file_url.split('/');
      const fileName = urlParts.slice(-3).join('/'); // tenant/product/file

      // Delete file from storage
      await supabase.storage.from('3d-models').remove([fileName]);
    }

    // Delete database record
    const { error } = await supabase
      .from('product_3d_models')
      .delete()
      .eq('id', modelId);

    if (error) throw error;
  }

  /**
   * Check device capabilities
   */
  static checkDeviceCapabilities(): {
    hasWebXR: boolean;
    hasDeviceOrientation: boolean;
    hasCamera: boolean;
    isSecureContext: boolean;
    supportedFormats: string[];
  } {
    const hasWebXR = 'xr' in navigator && 'isSessionSupported' in navigator.xr!;
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
    const hasCamera =
      'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    const isSecureContext =
      'isSecureContext' in window && window.isSecureContext;

    // Check supported 3D formats
    const supportedFormats: string[] = [];
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      supportedFormats.push('glb', 'gltf');

      // Check for additional format support
      const extensions = gl.getSupportedExtensions() || [];
      if (extensions.includes('OES_element_index_uint')) {
        supportedFormats.push('obj');
      }
    }

    return {
      hasWebXR,
      hasDeviceOrientation,
      hasCamera,
      isSecureContext,
      supportedFormats,
    };
  }

  /**
   * Generate 3D model preview
   */
  static async generatePreview(
    modelId: string,
    options: {
      width?: number;
      height?: number;
      cameraPosition?: { x: number; y: number; z: number };
      backgroundColor?: string;
    } = {}
  ): Promise<string> {
    // This would integrate with a 3D rendering service
    // For now, return a placeholder
    return `https://api.otoniq.ai/3d/preview/${modelId}?w=${options.width || 400}&h=${options.height || 400}`;
  }
}
