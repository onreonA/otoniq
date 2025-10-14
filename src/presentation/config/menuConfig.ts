/**
 * Menu Configuration
 * Defines navigation menu structure for different user roles
 */

import type { MenuGroup } from '../store/ui/uiStore.types';

/**
 * Super Admin Menu Configuration
 */
export const superAdminMenuConfig: MenuGroup[] = [
  {
    id: 'main',
    label: 'Ana Menü',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
      },
      {
        id: 'admin',
        label: 'Admin Panel',
        icon: 'Shield',
        path: '/admin',
      },
    ],
  },
  {
    id: 'management',
    label: 'Yönetim',
    items: [
      {
        id: 'tenants',
        label: 'Müşteriler',
        icon: 'Building2',
        path: '/admin',
        badge: 'new',
      },
      {
        id: 'users',
        label: 'Kullanıcılar',
        icon: 'Users',
        path: '/admin',
      },
      {
        id: 'products',
        label: 'Ürünler',
        icon: 'Package',
        path: '/products',
      },
    ],
  },
  {
    id: 'intelligence',
    label: 'AI & Otomasyon',
    items: [
      {
        id: 'analytics',
        label: 'AI İş Zekası',
        icon: 'Brain',
        path: '/analytics',
        badge: 'new',
      },
      {
        id: 'automation',
        label: 'Otomasyon Merkezi',
        icon: 'Zap',
        path: '/automation',
        badge: 'new',
      },
      {
        id: 'creative',
        label: 'Görsel Otomasyon',
        icon: 'Palette',
        path: '/creative',
        badge: 'new',
      },
      {
        id: 'chat-automation',
        label: 'Chat Otomasyonu',
        icon: 'MessageSquare',
        path: '/chat-automation',
        badge: 'new',
      },
      {
        id: 'ar-vr',
        label: 'AR/VR Deneyimleri',
        icon: 'Glasses',
        path: '/ar-vr',
        badge: 'new',
      },
      {
        id: 'iot',
        label: 'IoT Monitoring',
        icon: 'Activity',
        path: '/iot',
        badge: 'new',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistem',
    items: [
      {
        id: 'settings',
        label: 'Ayarlar',
        icon: 'Settings',
        path: '/settings',
      },
    ],
  },
];

/**
 * Tenant Customer Menu Configuration
 */
export const tenantMenuConfig: MenuGroup[] = [
  {
    id: 'main',
    label: 'Ana Menü',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-Ticaret',
    items: [
      {
        id: 'products',
        label: 'Ürünler',
        icon: 'Package',
        path: '/products',
        children: [
          {
            id: 'all-products',
            label: 'Tüm Ürünler',
            icon: 'List',
            path: '/products',
          },
          {
            id: 'categories',
            label: 'Kategoriler',
            icon: 'FolderTree',
            path: '/products/categories',
          },
          {
            id: 'inventory',
            label: 'Stok Yönetimi',
            icon: 'Database',
            path: '/products/inventory',
          },
        ],
      },
      {
        id: 'orders',
        label: 'Siparişler',
        icon: 'ShoppingCart',
        path: '/orders',
        badge: 5,
      },
      {
        id: 'customers',
        label: 'Müşteriler',
        icon: 'Users',
        path: '/customers',
      },
    ],
  },
  {
    id: 'integrations',
    label: 'Entegrasyonlar',
    items: [
      {
        id: 'marketplaces',
        label: 'Pazaryerleri',
        icon: 'Store',
        path: '/marketplace',
        children: [
          {
            id: 'shopify',
            label: 'Shopify',
            icon: 'ShoppingBag',
            path: '/marketplace/shopify',
          },
          {
            id: 'trendyol',
            label: 'Trendyol',
            icon: 'TrendingUp',
            path: '/marketplace/trendyol',
          },
          {
            id: 'amazon',
            label: 'Amazon',
            icon: 'Package',
            path: '/marketplace/amazon',
          },
        ],
      },
      {
        id: 'erp',
        label: 'ERP (Odoo)',
        icon: 'Database',
        path: '/integrations/odoo',
      },
      {
        id: 'automation',
        label: 'Otomasyon (N8N)',
        icon: 'Workflow',
        path: '/automation',
      },
    ],
  },
  {
    id: 'ai-features',
    label: 'AI Özellikleri',
    items: [
      {
        id: 'ai-assistant',
        label: 'AI Asistan',
        icon: 'Bot',
        path: '/ai/assistant',
      },
      {
        id: 'ai-analytics',
        label: 'AI İş Zekası',
        icon: 'Brain',
        path: '/analytics',
        badge: 'new',
      },
      {
        id: 'chat-automation',
        label: 'Chat Otomasyonu',
        icon: 'MessageSquare',
        path: '/chat-automation',
        badge: 'new',
      },
      {
        id: 'visual-automation',
        label: 'Görsel Otomasyon',
        icon: 'Image',
        path: '/creative',
        badge: 'new',
      },
      {
        id: 'ar-vr',
        label: 'AR/VR Deneyimleri',
        icon: 'Glasses',
        path: '/ar-vr',
        badge: 'new',
      },
      {
        id: 'iot',
        label: 'IoT Monitoring',
        icon: 'Activity',
        path: '/iot',
        badge: 'new',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Ayarlar',
    items: [
      {
        id: 'profile',
        label: 'Profil',
        icon: 'UserCircle',
        path: '/profile',
      },
      {
        id: 'company',
        label: 'Firma Bilgileri',
        icon: 'Building2',
        path: '/company',
      },
      {
        id: 'settings',
        label: 'Ayarlar',
        icon: 'Settings',
        path: '/settings',
      },
    ],
  },
];

/**
 * Get menu configuration based on user role
 */
export function getMenuConfig(
  role: 'super_admin' | 'tenant_admin' | 'tenant_user'
): MenuGroup[] {
  if (role === 'super_admin') {
    return superAdminMenuConfig;
  }
  return tenantMenuConfig;
}
