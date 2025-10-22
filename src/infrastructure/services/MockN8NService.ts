/**
 * Mock N8N Service
 * N8N kurulumu olmadan test için mock service
 */

export interface MockImageRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'minimalist' | 'vibrant';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'high' | 'ultra';
  numImages?: number;
}

export interface MockImageResponse {
  images: {
    url: string;
    base64?: string;
    metadata: {
      prompt: string;
      style: string;
      aspectRatio: string;
      quality: string;
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

export class MockN8NService {
  /**
   * Mock image generation
   */
  async generateImages(request: MockImageRequest): Promise<MockImageResponse> {
    console.log('🎨 Mock N8N generating images:', request);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock images
    const mockImages = [];
    for (let i = 0; i < (request.numImages || 1); i++) {
      mockImages.push({
        url: `https://picsum.photos/512/512?random=${Date.now()}-${i}`,
        base64: `data:image/jpeg;base64,mock-base64-${i}`,
        metadata: {
          prompt: request.prompt,
          style: request.style || 'realistic',
          aspectRatio: request.aspectRatio || '1:1',
          quality: request.quality || 'high',
          generatedAt: new Date().toISOString(),
          workflowId: 'mock-n8n-workflow',
        },
      });
    }

    return {
      images: mockImages,
      usage: {
        tokensUsed: request.prompt.length,
        cost: 0, // Mock service is free
        workflowExecutionTime: 2000,
      },
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    console.log('🔗 Mock N8N connection test');
    return true;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<any> {
    console.log('📊 Mock N8N workflow status:', workflowId);
    return {
      id: workflowId,
      status: 'active',
      lastExecution: new Date().toISOString(),
      successRate: 100,
    };
  }
}

// Export singleton instance
export const mockN8NService = new MockN8NService();
