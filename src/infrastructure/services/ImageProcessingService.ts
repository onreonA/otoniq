/**
 * Image Processing Service
 * AI-powered image enhancement, optimization, and manipulation
 * Uses OpenAI DALL-E for generation, browser APIs for basic processing
 */

export interface ImageEnhancementOptions {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  sharpness?: number; // 0 to 100
  autoEnhance?: boolean;
  removeBackground?: boolean;
  resize?: {
    width: number;
    height: number;
    maintainAspectRatio?: boolean;
  };
}

export interface ImageGenerationOptions {
  prompt: string;
  style?: 'photorealistic' | 'artistic' | 'cartoon' | 'minimalist';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number; // Number of images to generate
}

export class ImageProcessingService {
  /**
   * Enhance image using canvas manipulation
   */
  static async enhanceImage(
    imageUrl: string,
    options: ImageEnhancementOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size
        if (options.resize) {
          canvas.width = options.resize.width;
          canvas.height = options.resize.height;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply enhancements
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (options.autoEnhance) {
          // Auto-enhance: increase contrast and saturation slightly
          this.applyAutoEnhance(data);
        } else {
          // Apply manual adjustments
          if (options.brightness !== undefined) {
            this.applyBrightness(data, options.brightness);
          }
          if (options.contrast !== undefined) {
            this.applyContrast(data, options.contrast);
          }
          if (options.saturation !== undefined) {
            this.applySaturation(data, options.saturation);
          }
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert to blob and return URL
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Apply auto-enhance
   */
  private static applyAutoEnhance(data: Uint8ClampedArray): void {
    this.applyContrast(data, 15);
    this.applySaturation(data, 10);
  }

  /**
   * Apply brightness adjustment
   */
  private static applyBrightness(data: Uint8ClampedArray, brightness: number): void {
    const factor = (brightness / 100) * 255;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + factor));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + factor));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + factor));
    }
  }

  /**
   * Apply contrast adjustment
   */
  private static applyContrast(data: Uint8ClampedArray, contrast: number): void {
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }
  }

  /**
   * Apply saturation adjustment
   */
  private static applySaturation(data: Uint8ClampedArray, saturation: number): void {
    const factor = (saturation + 100) / 100;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      
      data[i] = Math.max(0, Math.min(255, gray + factor * (data[i] - gray)));
      data[i + 1] = Math.max(0, Math.min(255, gray + factor * (data[i + 1] - gray)));
      data[i + 2] = Math.max(0, Math.min(255, gray + factor * (data[i + 2] - gray)));
    }
  }

  /**
   * Resize image
   */
  static async resizeImage(
    imageUrl: string,
    width: number,
    height: number,
    maintainAspectRatio: boolean = true
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let targetWidth = width;
        let targetHeight = height;

        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height;
          if (width / height > aspectRatio) {
            targetWidth = height * aspectRatio;
          } else {
            targetHeight = width / aspectRatio;
          }
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Compress image for web optimization
   */
  static async compressImage(
    imageUrl: string,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<{ url: string; size: number; originalSize: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                url,
                size: blob.size,
                originalSize: img.src.length, // Approximate
              });
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Generate image using AI (DALL-E via OpenAI)
   */
  static async generateImage(options: ImageGenerationOptions): Promise<string[]> {
    // This would integrate with OpenAI DALL-E API
    // For now, return placeholder
    console.log('Generating image with prompt:', options.prompt);

    const mockUrls: string[] = [];
    const count = options.n || 1;

    for (let i = 0; i < count; i++) {
      mockUrls.push(
        `https://via.placeholder.com/${options.size || '1024x1024'}?text=${encodeURIComponent(options.prompt)}`
      );
    }

    return mockUrls;
  }

  /**
   * Extract dominant colors from image
   */
  static async extractColors(imageUrl: string, count: number = 5): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Scale down for faster processing
        canvas.width = 100;
        canvas.height = 100;

        ctx.drawImage(img, 0, 0, 100, 100);

        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;

        // Simple color extraction (count RGB occurrences)
        const colorMap = new Map<string, number>();

        for (let i = 0; i < data.length; i += 4) {
          const r = Math.floor(data[i] / 32) * 32;
          const g = Math.floor(data[i + 1] / 32) * 32;
          const b = Math.floor(data[i + 2] / 32) * 32;
          const color = `rgb(${r},${g},${b})`;

          colorMap.set(color, (colorMap.get(color) || 0) + 1);
        }

        // Sort by frequency and get top colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, count)
          .map(([color]) => {
            // Convert to hex
            const rgb = color.match(/\d+/g)!.map(Number);
            return `#${rgb.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
          });

        resolve(sortedColors);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  /**
   * Create product collage from multiple images
   */
  static async createCollage(
    imageUrls: string[],
    layout: 'grid' | 'mosaic' = 'grid',
    width: number = 1200,
    height: number = 1200
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const imagesLoaded = imageUrls.map(
        (url) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
          })
      );

      Promise.all(imagesLoaded)
        .then((images) => {
          if (layout === 'grid') {
            // Simple grid layout
            const cols = Math.ceil(Math.sqrt(images.length));
            const rows = Math.ceil(images.length / cols);
            const cellWidth = width / cols;
            const cellHeight = height / rows;

            images.forEach((img, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              const x = col * cellWidth;
              const y = row * cellHeight;

              ctx.drawImage(img, x, y, cellWidth, cellHeight);
            });
          }

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        })
        .catch(reject);
    });
  }

  /**
   * Add watermark to image
   */
  static async addWatermark(
    imageUrl: string,
    watermarkText: string,
    options?: {
      position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
      fontSize?: number;
      color?: string;
      opacity?: number;
    }
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        // Configure watermark
        const fontSize = options?.fontSize || 24;
        const color = options?.color || '#FFFFFF';
        const opacity = options?.opacity || 0.5;
        const position = options?.position || 'bottom-right';

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;

        const textMetrics = ctx.measureText(watermarkText);
        const padding = 20;

        let x = padding;
        let y = canvas.height - padding;

        switch (position) {
          case 'bottom-right':
            x = canvas.width - textMetrics.width - padding;
            y = canvas.height - padding;
            break;
          case 'top-right':
            x = canvas.width - textMetrics.width - padding;
            y = padding + fontSize;
            break;
          case 'top-left':
            x = padding;
            y = padding + fontSize;
            break;
          case 'center':
            x = (canvas.width - textMetrics.width) / 2;
            y = canvas.height / 2;
            break;
        }

        ctx.fillText(watermarkText, x, y);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }
}

