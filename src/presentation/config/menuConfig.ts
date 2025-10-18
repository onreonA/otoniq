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
    ],
  },
  {
    id: 'integrations',
    label: 'Entegrasyonlar',
    items: [
      {
        id: 'integrations-overview',
        label: 'Genel Bakış',
        icon: 'Puzzle',
        path: '/integrations',
      },
      {
        id: 'erp-systems',
        label: 'ERP Sistemleri',
        icon: 'Server',
        path: '/integrations',
        children: [
          {
            id: 'odoo',
            label: 'Odoo',
            icon: 'Database',
            path: '/integrations/odoo',
          },
        ],
      },
      {
        id: 'ecommerce-platforms',
        label: 'E-Ticaret Platformları',
        icon: 'ShoppingBag',
        path: '/integrations',
        children: [
          {
            id: 'shopify',
            label: 'Shopify',
            icon: 'Store',
            path: '/integrations/shopify',
          },
        ],
      },
      {
        id: 'b2b-marketplaces',
        label: 'B2B Pazaryerleri',
        icon: 'Globe',
        path: '/integrations',
        children: [
          {
            id: 'alibaba',
            label: 'Alibaba.com',
            icon: 'Building2',
            path: '/integrations/alibaba',
            badge: 'new',
          },
        ],
      },
      {
        id: 'marketplaces',
        label: 'Pazaryerleri',
        icon: 'Store',
        path: '/marketplace',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Otomasyon',
    items: [
      {
        id: 'automation',
        label: 'Otomasyon Merkezi',
        icon: 'Zap',
        path: '/automation',
        badge: 'new',
      },
      {
        id: 'automation-outputs',
        label: 'Otomasyon Çıktıları',
        icon: 'FileOutput',
        path: '/automation/outputs',
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
        children: [
          {
            id: 'security',
            label: 'Güvenlik',
            icon: 'Shield',
            path: '/settings/security',
          },
          {
            id: 'audit-logs',
            label: 'Audit Logları',
            icon: 'FileText',
            path: '/settings/audit-logs',
          },
          {
            id: 'notifications-settings',
            label: 'Bildirim Ayarları',
            icon: 'Bell',
            path: '/settings/notifications',
          },
        ],
      },
      {
        id: 'notifications',
        label: 'Bildirimler',
        icon: 'Bell',
        path: '/notifications',
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
            path: '/categories',
          },
          {
            id: 'inventory',
            label: 'Stok Yönetimi',
            icon: 'Database',
            path: '/inventory',
          },
        ],
      },
    ],
  },
  {
    id: 'sales',
    label: 'Satış',
    items: [
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
        id: 'integrations-overview',
        label: 'Genel Bakış',
        icon: 'Puzzle',
        path: '/integrations',
      },
      {
        id: 'erp-systems',
        label: 'ERP Sistemleri',
        icon: 'Server',
        path: '/integrations',
        children: [
          {
            id: 'odoo',
            label: 'Odoo',
            icon: 'Database',
            path: '/integrations/odoo',
          },
        ],
      },
      {
        id: 'ecommerce-platforms',
        label: 'E-Ticaret Platformları',
        icon: 'ShoppingBag',
        path: '/integrations',
        children: [
          {
            id: 'shopify',
            label: 'Shopify',
            icon: 'Store',
            path: '/integrations/shopify',
          },
        ],
      },
      {
        id: 'b2b-marketplaces',
        label: 'B2B Pazaryerleri',
        icon: 'Globe',
        path: '/integrations',
        children: [
          {
            id: 'alibaba',
            label: 'Alibaba.com',
            icon: 'Building2',
            path: '/integrations/alibaba',
            badge: 'new',
          },
        ],
      },
      {
        id: 'marketplaces',
        label: 'Pazaryerleri',
        icon: 'Store',
        path: '/marketplace',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Otomasyon',
    items: [
      {
        id: 'automation',
        label: 'Otomasyon Merkezi',
        icon: 'Zap',
        path: '/automation',
        badge: 'new',
      },
      {
        id: 'automation-outputs',
        label: 'Otomasyon Çıktıları',
        icon: 'FileOutput',
        path: '/automation/outputs',
      },
    ],
  },
  {
    id: 'ai-features',
    label: 'AI Özellikleri',
    items: [
      {
        id: 'analytics',
        label: 'AI İş Zekası',
        icon: 'Brain',
        path: '/analytics',
        badge: 'new',
      },
      {
        id: 'feed-doctor',
        label: 'Feed Doktoru',
        icon: 'Stethoscope',
        path: '/feed-doctor',
        badge: 'ai',
      },
      {
        id: 'creative',
        label: 'Görsel Otomasyon',
        icon: 'Palette',
        path: '/creative',
        badge: 'new',
      },
      {
        id: 'social-media',
        label: 'Sosyal Medya',
        icon: 'Share2',
        path: '/social-media',
        badge: 'new',
      },
      {
        id: 'email-campaigns',
        label: 'E-posta Kampanyaları',
        icon: 'Mail',
        path: '/email-campaigns',
        badge: 'new',
      },
      {
        id: 'chat-automation',
        label: 'Chat Otomasyonu',
        icon: 'MessageSquare',
        path: '/chat-automation',
      },
      {
        id: 'competitor-analysis',
        label: 'Rakip Fırsatları',
        icon: 'Target',
        path: '/competitor-analysis',
        badge: 'new',
      },
      {
        id: 'lead-generation',
        label: 'Lead Generation',
        icon: 'MapPin',
        path: '/lead-generation/map-scanner',
        badge: 'new',
        children: [
          {
            id: 'map-scanner',
            label: 'Bölge Taraması',
            icon: 'MapPin',
            path: '/lead-generation/map-scanner',
          },
          {
            id: 'campaigns',
            label: 'Kampanyalar',
            icon: 'Folder',
            path: '/lead-generation/campaigns',
          },
          {
            id: 'leads',
            label: "Lead'ler",
            icon: 'Users',
            path: '/lead-generation/leads',
          },
          {
            id: 'contacts',
            label: 'LinkedIn Kişiler',
            icon: 'Linkedin',
            path: '/lead-generation/contacts',
          },
          {
            id: 'sequences',
            label: 'Sequences',
            icon: 'Zap',
            path: '/lead-generation/sequences',
          },
          {
            id: 'lead-analytics',
            label: 'Analitikler',
            icon: 'BarChart3',
            path: '/lead-generation/analytics',
          },
        ],
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
        id: 'settings',
        label: 'Ayarlar',
        icon: 'Settings',
        path: '/settings',
        children: [
          {
            id: 'security',
            label: 'Güvenlik',
            icon: 'Shield',
            path: '/settings/security',
          },
          {
            id: 'notifications-settings',
            label: 'Bildirim Ayarları',
            icon: 'Bell',
            path: '/settings/notifications',
          },
        ],
      },
      {
        id: 'notifications',
        label: 'Bildirimler',
        icon: 'Bell',
        path: '/notifications',
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
