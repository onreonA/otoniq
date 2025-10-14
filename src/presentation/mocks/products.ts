/**
 * Product Mock Data
 * Realistic product data for demo scenarios
 */

import { format, subDays } from 'date-fns';

export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  currency: string;
  stock: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  images: string[];
  brand: string;
  marketplace_status: {
    shopify: 'active' | 'draft' | 'archived';
    trendyol: 'active' | 'pending' | 'rejected' | 'not_listed';
    hepsiburada: 'active' | 'pending' | 'rejected' | 'not_listed';
    n11: 'active' | 'pending' | 'rejected' | 'not_listed';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  variants?: {
    size?: string[];
    color?: string[];
  };
  rating: number;
  reviewCount: number;
  salesLast30Days: number;
  createdAt: string;
  updatedAt: string;
}

// Fashion Store Turkey Products
const fashionProducts: MockProduct[] = [
  {
    id: 'PROD-FST-001',
    name: 'Kadın Oversize Triko Kazak - Bej',
    sku: 'KAZ-OVR-BEJ-001',
    category: 'Kadın Giyim > Kazak',
    price: 299.9,
    cost: 120.0,
    currency: 'TRY',
    stock: 145,
    stockStatus: 'in_stock',
    description:
      '%100 pamuk, oversize kesim, rahat kullanım. Sonbahar-kış koleksiyonu.',
    images: ['https://via.placeholder.com/400x500?text=Triko+Kazak'],
    brand: 'Fashion Store',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'active',
      n11: 'pending',
    },
    seo: {
      title: 'Kadın Oversize Triko Kazak Bej - Fashion Store Turkey',
      description:
        '2024 sonbahar koleksiyonu oversize triko kazak. %100 pamuk, rahat kesim.',
      keywords: ['kadın kazak', 'oversize kazak', 'triko', 'sonbahar'],
    },
    variants: {
      size: ['S', 'M', 'L', 'XL'],
      color: ['Bej', 'Siyah', 'Kahverengi'],
    },
    rating: 4.7,
    reviewCount: 234,
    salesLast30Days: 87,
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'PROD-FST-002',
    name: 'Erkek Slim Fit Kot Pantolon - Lacivert',
    sku: 'PNT-SLM-LAC-002',
    category: 'Erkek Giyim > Pantolon',
    price: 449.9,
    cost: 180.0,
    currency: 'TRY',
    stock: 23,
    stockStatus: 'low_stock',
    description: 'Slim fit kesim, %98 pamuk %2 elastan. Rahat ve şık.',
    images: ['https://via.placeholder.com/400x500?text=Kot+Pantolon'],
    brand: 'Fashion Store',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'active',
      n11: 'active',
    },
    seo: {
      title: 'Erkek Slim Fit Kot Pantolon Lacivert - Fashion Store Turkey',
      description: 'Klasik slim fit kot pantolon. Her kombine uyum sağlar.',
      keywords: ['erkek pantolon', 'kot pantolon', 'slim fit', 'lacivert'],
    },
    variants: {
      size: ['30', '32', '34', '36', '38'],
    },
    rating: 4.5,
    reviewCount: 156,
    salesLast30Days: 124,
    createdAt: subDays(new Date(), 60).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'PROD-FST-003',
    name: 'Kadın Deri Ceket - Siyah',
    sku: 'CKT-DER-SYH-003',
    category: 'Kadın Giyim > Ceket',
    price: 899.9,
    cost: 350.0,
    currency: 'TRY',
    stock: 0,
    stockStatus: 'out_of_stock',
    description: 'Suni deri, astarlı, fermuarlı. Sonbahar-kış sezonu favorisi.',
    images: ['https://via.placeholder.com/400x500?text=Deri+Ceket'],
    brand: 'Fashion Store',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'rejected',
      n11: 'not_listed',
    },
    seo: {
      title: 'Kadın Deri Ceket Siyah - Fashion Store Turkey',
      description: 'Şık ve rahat suni deri ceket. Her kombine uyum sağlar.',
      keywords: ['kadın ceket', 'deri ceket', 'suni deri', 'siyah ceket'],
    },
    variants: {
      size: ['S', 'M', 'L', 'XL'],
    },
    rating: 4.9,
    reviewCount: 89,
    salesLast30Days: 45,
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
  },
];

// Teknoloji Perakende Products
const techProducts: MockProduct[] = [
  {
    id: 'PROD-TPR-001',
    name: 'iPhone 15 Pro 256GB Titanyum',
    sku: 'IPH-15P-256-TTN',
    category: 'Elektronik > Telefon > Akıllı Telefon',
    price: 54999.0,
    cost: 45000.0,
    currency: 'TRY',
    stock: 12,
    stockStatus: 'low_stock',
    description:
      'Apple iPhone 15 Pro, A17 Pro chip, Titanyum tasarım, ProMotion ekran.',
    images: ['https://via.placeholder.com/400x500?text=iPhone+15+Pro'],
    brand: 'Apple',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'active',
      n11: 'active',
    },
    seo: {
      title: 'Apple iPhone 15 Pro 256GB Titanyum - Teknoloji Perakende',
      description:
        'iPhone 15 Pro en iyi fiyatlarla. 2 yıl Apple Türkiye garantisi.',
      keywords: ['iphone 15 pro', 'apple', 'akıllı telefon', 'titanyum'],
    },
    rating: 4.8,
    reviewCount: 345,
    salesLast30Days: 28,
    createdAt: subDays(new Date(), 90).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'PROD-TPR-002',
    name: 'Samsung 55" 4K QLED TV',
    sku: 'SAM-TV-55-QLD',
    category: 'Elektronik > TV & Görüntü > TV',
    price: 24999.0,
    cost: 18000.0,
    currency: 'TRY',
    stock: 45,
    stockStatus: 'in_stock',
    description:
      '55 inch QLED ekran, 4K çözünürlük, HDR10+, Smart TV özellikleri.',
    images: ['https://via.placeholder.com/400x500?text=Samsung+QLED+TV'],
    brand: 'Samsung',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'active',
      n11: 'active',
    },
    seo: {
      title: 'Samsung 55" 4K QLED Smart TV - Teknoloji Perakende',
      description:
        'QLED teknolojisi ile muhteşem görüntü kalitesi. Ücretsiz montaj.',
      keywords: ['samsung tv', 'qled tv', '4k tv', 'smart tv'],
    },
    rating: 4.6,
    reviewCount: 178,
    salesLast30Days: 34,
    createdAt: subDays(new Date(), 120).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: 'PROD-TPR-003',
    name: 'Sony WH-1000XM5 Kablosuz Kulaklık',
    sku: 'SNY-WH-1000XM5',
    category: 'Elektronik > Ses & Görüntü > Kulaklık',
    price: 12999.0,
    cost: 9500.0,
    currency: 'TRY',
    stock: 67,
    stockStatus: 'in_stock',
    description:
      'Aktif gürültü engelleme, 30 saat pil ömrü, premium ses kalitesi.',
    images: ['https://via.placeholder.com/400x500?text=Sony+WH-1000XM5'],
    brand: 'Sony',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'pending',
      n11: 'active',
    },
    seo: {
      title: 'Sony WH-1000XM5 Kablosuz Noise Cancelling Kulaklık',
      description:
        'Dünya lideri gürültü engelleme teknolojisi. Premium ses deneyimi.',
      keywords: [
        'sony kulaklık',
        'noise cancelling',
        'kablosuz kulaklık',
        'wh-1000xm5',
      ],
    },
    rating: 4.9,
    reviewCount: 456,
    salesLast30Days: 78,
    createdAt: subDays(new Date(), 75).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
  },
];

// Organik Gıda Products
const foodProducts: MockProduct[] = [
  {
    id: 'PROD-OGE-001',
    name: 'Organik Zeytinyağı 1L',
    sku: 'ZYT-ORG-1L-001',
    category: 'Gıda > Yağ & Sos > Zeytinyağı',
    price: 189.9,
    cost: 95.0,
    currency: 'TRY',
    stock: 234,
    stockStatus: 'in_stock',
    description:
      'Soğuk sıkım, organik sertifikalı, Ege bölgesi zeytinlerinden.',
    images: ['https://via.placeholder.com/400x500?text=Zeytinyagi'],
    brand: 'Organik Gıda Evi',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'not_listed',
      n11: 'not_listed',
    },
    seo: {
      title: 'Organik Zeytinyağı 1L - Soğuk Sıkım - Organik Gıda Evi',
      description:
        'Organik sertifikalı, soğuk sıkım zeytinyağı. Farm-to-table konsepti.',
      keywords: ['organik zeytinyağı', 'soğuk sıkım', 'doğal zeytinyağı'],
    },
    rating: 4.8,
    reviewCount: 567,
    salesLast30Days: 156,
    createdAt: subDays(new Date(), 180).toISOString(),
    updatedAt: subDays(new Date(), 7).toISOString(),
  },
  {
    id: 'PROD-OGE-002',
    name: 'Organik Bal 500g',
    sku: 'BAL-ORG-500G-002',
    category: 'Gıda > Kahvaltılık > Bal',
    price: 149.9,
    cost: 75.0,
    currency: 'TRY',
    stock: 89,
    stockStatus: 'in_stock',
    description:
      'Çiçek balı, katkısız, organik sertifikalı. Karadeniz bölgesinden.',
    images: ['https://via.placeholder.com/400x500?text=Organik+Bal'],
    brand: 'Organik Gıda Evi',
    marketplace_status: {
      shopify: 'active',
      trendyol: 'active',
      hepsiburada: 'active',
      n11: 'pending',
    },
    seo: {
      title: 'Organik Çiçek Balı 500g - Katkısız - Organik Gıda Evi',
      description: 'Organik sertifikalı çiçek balı. Katkısız ve doğal.',
      keywords: ['organik bal', 'çiçek balı', 'doğal bal', 'katkısız bal'],
    },
    rating: 4.9,
    reviewCount: 234,
    salesLast30Days: 98,
    createdAt: subDays(new Date(), 150).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
  },
];

// Combine all products
export const mockProducts: MockProduct[] = [
  ...fashionProducts,
  ...techProducts,
  ...foodProducts,
];

// Helper functions
export function getProductById(id: string): MockProduct | undefined {
  return mockProducts.find(p => p.id === id);
}

export function getProductsByCategory(category: string): MockProduct[] {
  return mockProducts.filter(p => p.category.includes(category));
}

export function getProductsByStock(
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
): MockProduct[] {
  return mockProducts.filter(p => p.stockStatus === status);
}

export function getTopSellingProducts(limit: number = 10): MockProduct[] {
  return [...mockProducts]
    .sort((a, b) => b.salesLast30Days - a.salesLast30Days)
    .slice(0, limit);
}

export function getProductStats() {
  const totalProducts = mockProducts.length;
  const inStock = mockProducts.filter(p => p.stockStatus === 'in_stock').length;
  const lowStock = mockProducts.filter(
    p => p.stockStatus === 'low_stock'
  ).length;
  const outOfStock = mockProducts.filter(
    p => p.stockStatus === 'out_of_stock'
  ).length;
  const totalSales = mockProducts.reduce(
    (sum, p) => sum + p.salesLast30Days,
    0
  );
  const avgRating =
    mockProducts.reduce((sum, p) => sum + p.rating, 0) / totalProducts;

  return {
    totalProducts,
    inStock,
    lowStock,
    outOfStock,
    totalSales,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}
