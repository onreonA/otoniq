/**
 * Creative Studio Mock Data
 * Mock data for visual automation and content generation
 */

export interface TemplateData {
  id: string;
  name: string;
  category: 'social' | 'marketplace' | 'email' | 'ad';
  thumbnail: string;
  platform: string[];
  dimensions: string;
  format: string;
}

export const mockTemplates: TemplateData[] = [
  {
    id: '1',
    name: 'Instagram Story Ürün Tanıtımı',
    category: 'social',
    thumbnail: '🎨',
    platform: ['Instagram', 'Facebook'],
    dimensions: '1080x1920',
    format: 'PNG/JPG',
  },
  {
    id: '2',
    name: 'Instagram Post - Kare Format',
    category: 'social',
    thumbnail: '📱',
    platform: ['Instagram', 'Facebook', 'LinkedIn'],
    dimensions: '1080x1080',
    format: 'PNG/JPG',
  },
  {
    id: '3',
    name: 'Facebook Cover Tasarımı',
    category: 'social',
    thumbnail: '🖼️',
    platform: ['Facebook'],
    dimensions: '820x312',
    format: 'PNG/JPG',
  },
  {
    id: '4',
    name: 'Twitter Header',
    category: 'social',
    thumbnail: '🐦',
    platform: ['Twitter/X'],
    dimensions: '1500x500',
    format: 'PNG/JPG',
  },
  {
    id: '5',
    name: 'Trendyol Ürün Görseli',
    category: 'marketplace',
    thumbnail: '🛒',
    platform: ['Trendyol', 'Hepsiburada'],
    dimensions: '1000x1000',
    format: 'PNG/JPG',
  },
  {
    id: '6',
    name: 'Amazon Ürün Listesi',
    category: 'marketplace',
    thumbnail: '📦',
    platform: ['Amazon'],
    dimensions: '2000x2000',
    format: 'PNG/JPG',
  },
  {
    id: '7',
    name: 'E-posta Banner',
    category: 'email',
    thumbnail: '✉️',
    platform: ['Email'],
    dimensions: '600x200',
    format: 'PNG/JPG',
  },
  {
    id: '8',
    name: 'Google Ads Banner',
    category: 'ad',
    thumbnail: '🎯',
    platform: ['Google Ads'],
    dimensions: '728x90',
    format: 'PNG/JPG',
  },
];

export interface CreativeJobData {
  id: string;
  templateId: string;
  templateName: string;
  status: 'processing' | 'completed' | 'failed';
  productName: string;
  createdAt: string;
  completedAt?: string;
  outputUrl?: string;
}

export const mockCreativeJobs: CreativeJobData[] = [
  {
    id: '1',
    templateId: '1',
    templateName: 'Instagram Story Ürün Tanıtımı',
    status: 'completed',
    productName: 'Wireless Kulaklık Pro',
    createdAt: '2025-01-14 15:30:00',
    completedAt: '2025-01-14 15:32:15',
    outputUrl: '/outputs/story-1.png',
  },
  {
    id: '2',
    templateId: '2',
    templateName: 'Instagram Post - Kare Format',
    status: 'completed',
    productName: 'Akıllı Saat X1',
    createdAt: '2025-01-14 14:15:00',
    completedAt: '2025-01-14 14:16:45',
    outputUrl: '/outputs/post-1.png',
  },
  {
    id: '3',
    templateId: '5',
    templateName: 'Trendyol Ürün Görseli',
    status: 'processing',
    productName: 'Premium Mouse Pad',
    createdAt: '2025-01-14 16:00:00',
  },
];

export interface CreativeStats {
  totalGenerated: number;
  totalTemplates: number;
  successRate: number;
  avgProcessTime: number; // seconds
}

export const mockCreativeStats: CreativeStats = {
  totalGenerated: 2847,
  totalTemplates: mockTemplates.length,
  successRate: 98.5,
  avgProcessTime: 45,
};
