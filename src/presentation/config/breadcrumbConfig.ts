/**
 * Breadcrumb Configuration
 * Maps routes to breadcrumb labels
 */

export interface BreadcrumbConfig {
  [key: string]: string;
}

/**
 * Route to breadcrumb label mapping
 */
export const breadcrumbLabels: BreadcrumbConfig = {
  // Main routes
  '/': 'Ana Sayfa',
  '/dashboard': 'Dashboard',
  '/admin': 'Admin Panel',

  // Products
  '/products': 'Ürünler',
  '/products/categories': 'Kategoriler',
  '/products/inventory': 'Stok Yönetimi',

  // Orders
  '/orders': 'Siparişler',
  '/orders/new': 'Yeni Sipariş',
  '/orders/pending': 'Bekleyen Siparişler',
  '/orders/completed': 'Tamamlanan Siparişler',

  // Customers
  '/customers': 'Müşteriler',
  '/customers/new': 'Yeni Müşteri',

  // Marketplace
  '/marketplace': 'Pazaryerleri',
  '/marketplace/shopify': 'Shopify',
  '/marketplace/trendyol': 'Trendyol',
  '/marketplace/amazon': 'Amazon',

  // Integrations
  '/integrations': 'Entegrasyonlar',
  '/integrations/odoo': 'Odoo ERP',
  '/automation': 'Otomasyon Merkezi',

  // AI Features
  '/ai': 'AI Özellikleri',
  '/ai/assistant': 'AI Asistan',
  '/ai/analytics': 'AI İş Zekası',
  '/ai/visual': 'Görsel Otomasyon',
  '/analytics': 'AI İş Zekası',
  '/creative': 'Görsel Otomasyon Stüdyosu',
  '/chat-automation': 'Chat Otomasyonu',
  '/ar-vr': 'AR/VR Deneyimleri',
  '/iot': 'IoT Monitoring',

  // Settings
  '/profile': 'Profil',
  '/company': 'Firma Bilgileri',
  '/settings': 'Ayarlar',

  // About
  '/about': 'Hakkında',
  '/pricing': 'Fiyatlandırma',
  '/demo': 'Demo',
};

/**
 * Get breadcrumb label for a route
 */
export function getBreadcrumbLabel(path: string): string {
  return breadcrumbLabels[path] || path.split('/').pop() || 'Sayfa';
}
