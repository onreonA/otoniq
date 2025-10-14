/**
 * AR/VR Mock Data
 * 3D product models, AR experiences, and virtual showroom data
 */

import { format, subDays, subHours } from 'date-fns';

// --- Types ---
export interface Product3DModel {
  id: string;
  productId: string;
  productName: string;
  category: string;
  modelUrl: string; // In real app, this would be a .glb or .gltf file
  thumbnailUrl: string;
  fileSize: string; // e.g., "2.5 MB"
  polyCount: number;
  hasTextures: boolean;
  hasAnimations: boolean;
  arCompatible: boolean;
  vrCompatible: boolean;
  uploadedAt: string;
  lastModified: string;
  views: number;
  interactions: number;
}

export interface ARExperience {
  id: string;
  name: string;
  description: string;
  productId: string;
  type: 'try-on' | 'placement' | 'visualization' | 'interactive';
  platform: 'ios' | 'android' | 'web' | 'all';
  status: 'active' | 'draft' | 'archived';
  qrCodeUrl: string;
  deepLink: string;
  analytics: {
    totalScans: number;
    uniqueUsers: number;
    avgSessionDuration: number; // in seconds
    conversionRate: number; // percentage
  };
  createdAt: string;
}

export interface VirtualShowroom {
  id: string;
  name: string;
  description: string;
  theme: 'modern' | 'classic' | 'futuristic' | 'minimal';
  products: string[]; // product IDs
  hotspots: VirtualHotspot[];
  backgroundMusic?: string;
  lighting: 'natural' | 'studio' | 'dramatic' | 'soft';
  status: 'active' | 'draft';
  visits: number;
  avgTimeSpent: number; // in seconds
  createdAt: string;
}

export interface VirtualHotspot {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'product' | 'info' | 'video' | 'link';
  title: string;
  content: string;
  productId?: string;
}

export interface ARAnalytics {
  date: string;
  scans: number;
  uniqueUsers: number;
  conversions: number;
  avgSessionDuration: number;
}

// --- Mock 3D Models ---
export const mock3DModels: Product3DModel[] = [
  {
    id: '3D001',
    productId: 'PROD001',
    productName: 'iPhone 15 Pro - Titanium',
    category: 'Elektronik',
    modelUrl: '/models/iphone-15-pro.glb',
    thumbnailUrl: '📱',
    fileSize: '3.2 MB',
    polyCount: 45000,
    hasTextures: true,
    hasAnimations: false,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 10).toISOString(),
    lastModified: subDays(new Date(), 2).toISOString(),
    views: 1247,
    interactions: 523,
  },
  {
    id: '3D002',
    productId: 'PROD002',
    productName: 'Nike Air Max 2024',
    category: 'Ayakkabı',
    modelUrl: '/models/nike-air-max.glb',
    thumbnailUrl: '👟',
    fileSize: '2.8 MB',
    polyCount: 38000,
    hasTextures: true,
    hasAnimations: true,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 15).toISOString(),
    lastModified: subDays(new Date(), 5).toISOString(),
    views: 2156,
    interactions: 892,
  },
  {
    id: '3D003',
    productId: 'PROD003',
    productName: 'Koltuk Takımı - Modern',
    category: 'Mobilya',
    modelUrl: '/models/sofa-modern.glb',
    thumbnailUrl: '🛋️',
    fileSize: '5.1 MB',
    polyCount: 72000,
    hasTextures: true,
    hasAnimations: false,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 20).toISOString(),
    lastModified: subDays(new Date(), 8).toISOString(),
    views: 856,
    interactions: 334,
  },
  {
    id: '3D004',
    productId: 'PROD004',
    productName: 'Ray-Ban Aviator Güneş Gözlüğü',
    category: 'Aksesuar',
    modelUrl: '/models/rayban-aviator.glb',
    thumbnailUrl: '🕶️',
    fileSize: '1.5 MB',
    polyCount: 18000,
    hasTextures: true,
    hasAnimations: false,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 5).toISOString(),
    lastModified: subDays(new Date(), 1).toISOString(),
    views: 3421,
    interactions: 1567,
  },
  {
    id: '3D005',
    productId: 'PROD005',
    productName: 'MacBook Pro 16" M3',
    category: 'Elektronik',
    modelUrl: '/models/macbook-pro-16.glb',
    thumbnailUrl: '💻',
    fileSize: '4.3 MB',
    polyCount: 52000,
    hasTextures: true,
    hasAnimations: true,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 12).toISOString(),
    lastModified: subDays(new Date(), 3).toISOString(),
    views: 1892,
    interactions: 745,
  },
  {
    id: '3D006',
    productId: 'PROD006',
    productName: 'Saat - Rolex Submariner',
    category: 'Aksesuar',
    modelUrl: '/models/rolex-submariner.glb',
    thumbnailUrl: '⌚',
    fileSize: '2.1 MB',
    polyCount: 28000,
    hasTextures: true,
    hasAnimations: true,
    arCompatible: true,
    vrCompatible: true,
    uploadedAt: subDays(new Date(), 8).toISOString(),
    lastModified: subDays(new Date(), 1).toISOString(),
    views: 4523,
    interactions: 2134,
  },
];

// --- Mock AR Experiences ---
export const mockARExperiences: ARExperience[] = [
  {
    id: 'AR001',
    name: 'iPhone 15 Pro - AR Deneme',
    description: "iPhone 15 Pro'yu elinizde tutuyormuş gibi deneyimleyin",
    productId: 'PROD001',
    type: 'placement',
    platform: 'all',
    status: 'active',
    qrCodeUrl: '/qr/ar001.png',
    deepLink: 'otoniq://ar/iphone-15-pro',
    analytics: {
      totalScans: 1247,
      uniqueUsers: 892,
      avgSessionDuration: 45,
      conversionRate: 12.5,
    },
    createdAt: subDays(new Date(), 10).toISOString(),
  },
  {
    id: 'AR002',
    name: 'Nike Ayakkabı - Sanal Deneme',
    description: 'Ayakkabıyı ayağınızda görün',
    productId: 'PROD002',
    type: 'try-on',
    platform: 'ios',
    status: 'active',
    qrCodeUrl: '/qr/ar002.png',
    deepLink: 'otoniq://ar/nike-air-max',
    analytics: {
      totalScans: 2156,
      uniqueUsers: 1523,
      avgSessionDuration: 62,
      conversionRate: 18.3,
    },
    createdAt: subDays(new Date(), 15).toISOString(),
  },
  {
    id: '003',
    name: 'Koltuk - Mekan Yerleştirme',
    description: 'Koltuğu evinizde görün',
    productId: 'PROD003',
    type: 'placement',
    platform: 'all',
    status: 'active',
    qrCodeUrl: '/qr/ar003.png',
    deepLink: 'otoniq://ar/sofa-modern',
    analytics: {
      totalScans: 856,
      uniqueUsers: 634,
      avgSessionDuration: 78,
      conversionRate: 22.1,
    },
    createdAt: subDays(new Date(), 20).toISOString(),
  },
  {
    id: 'AR004',
    name: 'Güneş Gözlüğü - Sanal Deneme',
    description: 'Gözlüğü yüzünüzde görün',
    productId: 'PROD004',
    type: 'try-on',
    platform: 'all',
    status: 'active',
    qrCodeUrl: '/qr/ar004.png',
    deepLink: 'otoniq://ar/rayban-aviator',
    analytics: {
      totalScans: 3421,
      uniqueUsers: 2567,
      avgSessionDuration: 38,
      conversionRate: 15.7,
    },
    createdAt: subDays(new Date(), 5).toISOString(),
  },
];

// --- Mock Virtual Showrooms ---
export const mockVirtualShowrooms: VirtualShowroom[] = [
  {
    id: 'VS001',
    name: 'Elektronik Showroom',
    description: 'En yeni teknoloji ürünlerini keşfedin',
    theme: 'futuristic',
    products: ['PROD001', 'PROD005'],
    hotspots: [
      {
        id: 'HS001',
        position: { x: 0, y: 1.5, z: -2 },
        type: 'product',
        title: 'iPhone 15 Pro',
        content: 'Yeni nesil akıllı telefon',
        productId: 'PROD001',
      },
      {
        id: 'HS002',
        position: { x: 2, y: 1.2, z: -2 },
        type: 'product',
        title: 'MacBook Pro',
        content: 'Profesyoneller için güç',
        productId: 'PROD005',
      },
    ],
    lighting: 'studio',
    status: 'active',
    visits: 4523,
    avgTimeSpent: 125,
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: 'VS002',
    name: 'Moda & Aksesuar Galerisi',
    description: 'Trendleri yakından görün',
    theme: 'modern',
    products: ['PROD002', 'PROD004', 'PROD006'],
    hotspots: [
      {
        id: 'HS003',
        position: { x: -1.5, y: 1, z: -3 },
        type: 'product',
        title: 'Nike Air Max',
        content: 'Spor ve stil bir arada',
        productId: 'PROD002',
      },
      {
        id: 'HS004',
        position: { x: 0, y: 1.5, z: -2.5 },
        type: 'product',
        title: 'Ray-Ban Aviator',
        content: 'Klasik tasarım',
        productId: 'PROD004',
      },
      {
        id: 'HS005',
        position: { x: 1.5, y: 1.3, z: -3 },
        type: 'product',
        title: 'Rolex Submariner',
        content: 'Lüks ve zarafet',
        productId: 'PROD006',
      },
    ],
    lighting: 'natural',
    status: 'active',
    visits: 3214,
    avgTimeSpent: 98,
    createdAt: subDays(new Date(), 25).toISOString(),
  },
  {
    id: 'VS003',
    name: 'Ev & Yaşam Mağazası',
    description: 'Hayalinizdeki evi tasarlayın',
    theme: 'minimal',
    products: ['PROD003'],
    hotspots: [
      {
        id: 'HS006',
        position: { x: 0, y: 0.5, z: -4 },
        type: 'product',
        title: 'Modern Koltuk Takımı',
        content: 'Konfor ve estetik',
        productId: 'PROD003',
      },
      {
        id: 'HS007',
        position: { x: -3, y: 1.5, z: -2 },
        type: 'info',
        title: 'Tasarım İpuçları',
        content: 'Evinizi nasıl dekore edersiniz?',
      },
    ],
    lighting: 'soft',
    status: 'active',
    visits: 1892,
    avgTimeSpent: 156,
    createdAt: subDays(new Date(), 18).toISOString(),
  },
];

// --- Mock AR Analytics ---
export const generateARAnalytics = (days: number): ARAnalytics[] => {
  const data: ARAnalytics[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    data.push({
      date: format(date, 'MMM dd'),
      scans: Math.floor(Math.random() * 500) + 100,
      uniqueUsers: Math.floor(Math.random() * 400) + 80,
      conversions: Math.floor(Math.random() * 50) + 10,
      avgSessionDuration: Math.floor(Math.random() * 60) + 30,
    });
  }

  return data;
};

// --- Helper Functions ---
export const get3DModelsByCategory = (category: string) =>
  mock3DModels.filter(model => model.category === category);

export const getARExperiencesByType = (type: ARExperience['type']) =>
  mockARExperiences.filter(exp => exp.type === type);

export const getActiveShowrooms = () =>
  mockVirtualShowrooms.filter(showroom => showroom.status === 'active');

export const getTotalARScans = () =>
  mockARExperiences.reduce((sum, exp) => sum + exp.analytics.totalScans, 0);

export const getAvgConversionRate = () => {
  const total = mockARExperiences.reduce(
    (sum, exp) => sum + exp.analytics.conversionRate,
    0
  );
  return (total / mockARExperiences.length).toFixed(1);
};

export const getTotalShowroomVisits = () =>
  mockVirtualShowrooms.reduce((sum, showroom) => sum + showroom.visits, 0);
