/**
 * Gradient Constants for Consistent Page Design
 * All pages should use these predefined gradients for consistency
 */

export const PAGE_GRADIENTS = {
  // Core Pages
  dashboard: 'from-blue-600/20 to-purple-600/20',
  admin: 'from-gray-600/20 to-slate-600/20',

  // Product Management
  products: 'from-blue-600/20 to-cyan-600/20',
  categories: 'from-green-600/20 to-emerald-600/20',
  inventory: 'from-yellow-600/20 to-orange-600/20',

  // Sales & CRM
  orders: 'from-red-600/20 to-pink-600/20',
  customers: 'from-indigo-600/20 to-purple-600/20',

  // Integrations
  integrations: 'from-purple-600/20 to-pink-600/20',
  odoo: 'from-orange-600/20 to-red-600/20',
  shopify: 'from-green-600/20 to-emerald-600/20',
  marketplace: 'from-purple-600/20 to-pink-600/20',

  // AI & Automation
  analytics: 'from-purple-600/20 to-indigo-600/20',
  automation: 'from-blue-600/20 to-cyan-600/20',
  creative: 'from-pink-600/20 to-rose-600/20',
  chatAutomation: 'from-green-600/20 to-teal-600/20',
  arVr: 'from-violet-600/20 to-purple-600/20',
  iot: 'from-cyan-600/20 to-blue-600/20',

  // Default
  default: 'from-gray-600/20 to-slate-600/20',
} as const;

export const BORDER_GRADIENTS = {
  dashboard: 'border-blue-500/20',
  admin: 'border-gray-500/20',
  products: 'border-blue-500/20',
  categories: 'border-green-500/20',
  inventory: 'border-yellow-500/20',
  orders: 'border-red-500/20',
  customers: 'border-indigo-500/20',
  integrations: 'border-purple-500/20',
  odoo: 'border-orange-500/20',
  shopify: 'border-green-500/20',
  marketplace: 'border-purple-500/20',
  analytics: 'border-purple-500/20',
  automation: 'border-blue-500/20',
  creative: 'border-pink-500/20',
  chatAutomation: 'border-green-500/20',
  arVr: 'border-violet-500/20',
  iot: 'border-cyan-500/20',
  default: 'border-gray-500/20',
} as const;

export type PageType = keyof typeof PAGE_GRADIENTS;

/**
 * Get gradient classes for a page
 */
export const getPageGradient = (pageType: PageType = 'default') => {
  return {
    gradient: PAGE_GRADIENTS[pageType],
    border: BORDER_GRADIENTS[pageType],
  };
};

/**
 * Status Colors
 */
export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800 border-green-300',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  error: 'bg-red-100 text-red-800 border-red-300',
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
} as const;

/**
 * Icon Colors (for dark backgrounds)
 */
export const ICON_COLORS = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
  indigo: 'text-indigo-400',
  cyan: 'text-cyan-400',
  gray: 'text-gray-400',
} as const;
