/**
 * Input Validation & Sanitization Utilities
 * Protects against XSS, SQL injection, and other input-based attacks
 */

import validator from 'validator';
import DOMPurify from 'dompurify';
import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Validate and sanitize email
 */
export function validateEmail(email: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = validator.trim(email.toLowerCase());

  if (!validator.isEmail(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: 'Geçersiz e-posta formatı',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate and sanitize URL
 */
export function validateURL(url: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = validator.trim(url);

  if (
    !validator.isURL(sanitized, {
      protocols: ['http', 'https'],
      require_protocol: true,
    })
  ) {
    return {
      isValid: false,
      sanitized,
      error: 'Geçersiz URL formatı',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate phone number (Turkish format)
 */
export function validatePhone(phone: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Turkish phone: 10 digits (5XXXXXXXXX) or 12 with country code (905XXXXXXXXX)
  if (digits.length === 10 && digits.startsWith('5')) {
    return {
      isValid: true,
      sanitized: `+90${digits}`,
    };
  } else if (digits.length === 12 && digits.startsWith('905')) {
    return {
      isValid: true,
      sanitized: `+${digits}`,
    };
  }

  return {
    isValid: false,
    sanitized: phone,
    error: 'Geçersiz telefon numarası (Türkiye formatı: 5XXXXXXXXX)',
  };
}

/**
 * Validate and sanitize integer
 */
export function validateInteger(value: any): {
  isValid: boolean;
  sanitized: number;
  error?: string;
} {
  const num = parseInt(String(value), 10);

  if (isNaN(num)) {
    return {
      isValid: false,
      sanitized: 0,
      error: 'Geçersiz sayı',
    };
  }

  return {
    isValid: true,
    sanitized: num,
  };
}

/**
 * Validate and sanitize float
 */
export function validateFloat(
  value: any,
  decimals: number = 2
): { isValid: boolean; sanitized: number; error?: string } {
  const num = parseFloat(String(value));

  if (isNaN(num)) {
    return {
      isValid: false,
      sanitized: 0,
      error: 'Geçersiz sayı',
    };
  }

  return {
    isValid: true,
    sanitized: parseFloat(num.toFixed(decimals)),
  };
}

/**
 * Validate JSON string
 */
export function validateJSON(jsonString: string): {
  isValid: boolean;
  parsed: any;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);
    return {
      isValid: true,
      parsed,
    };
  } catch (error) {
    return {
      isValid: false,
      parsed: null,
      error: 'Geçersiz JSON formatı',
    };
  }
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid chars with underscore
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Limit length
}

/**
 * Validate file size
 */
export function validateFileSize(
  sizeInBytes: number,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `Dosya boyutu ${maxSizeMB}MB'den küçük olmalıdır`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validate file extension
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): { isValid: boolean; error?: string } {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `İzin verilen dosya türleri: ${allowedExtensions.join(', ')}`,
    };
  }

  return {
    isValid: true,
  };
}

// =========================
// Zod Schemas for API Validation
// =========================

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  email: z.string().email('Geçersiz e-posta'),
  full_name: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(100, 'Ad en fazla 100 karakter olabilir'),
  phone: z.string().optional(),
  avatar_url: z.string().url('Geçersiz URL').optional().or(z.literal('')),
  role: z.enum(['super_admin', 'tenant_admin', 'tenant_user']),
});

/**
 * Product schema
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Ürün adı en az 3 karakter olmalı')
    .max(200, 'Ürün adı en fazla 200 karakter olabilir'),
  sku: z.string().min(1, 'SKU gereklidir').max(100),
  description: z
    .string()
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir')
    .optional(),
  price: z.number().positive('Fiyat pozitif olmalıdır'),
  cost: z.number().positive('Maliyet pozitif olmalıdır').optional(),
  stock_quantity: z.number().int().nonnegative('Stok negatif olamaz'),
  category_id: z.string().uuid('Geçersiz kategori ID').optional(),
  is_active: z.boolean().default(true),
  images: z.array(z.string().url('Geçersiz resim URL')).optional(),
  attributes: z.record(z.any()).optional(),
});

/**
 * Order schema
 */
export const orderSchema = z.object({
  customer_id: z.string().uuid('Geçersiz müşteri ID'),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid('Geçersiz ürün ID'),
        quantity: z.number().int().positive('Miktar pozitif olmalıdır'),
        price: z.number().positive('Fiyat pozitif olmalıdır'),
      })
    )
    .min(1, 'En az 1 ürün olmalı'),
  shipping_address: z.object({
    street: z.string().min(5, 'Adres en az 5 karakter olmalı'),
    city: z.string().min(2, 'Şehir gereklidir'),
    postal_code: z.string().min(5, 'Posta kodu gereklidir'),
    country: z.string().min(2, 'Ülke gereklidir'),
  }),
  notes: z
    .string()
    .max(1000, 'Notlar en fazla 1000 karakter olabilir')
    .optional(),
});

/**
 * Category schema
 */
export const categorySchema = z.object({
  name: z.string().min(2, 'Kategori adı en az 2 karakter olmalı').max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .max(100),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid('Geçersiz üst kategori ID').optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().nonnegative().default(0),
});

/**
 * Tenant schema
 */
export const tenantSchema = z.object({
  name: z.string().min(3, 'Firma adı en az 3 karakter olmalı').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .max(100),
  domain: z.string().optional(),
  email: z.string().email('Geçersiz e-posta'),
  phone: z.string().optional(),
  address: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  settings: z.record(z.any()).optional(),
});

/**
 * Integration credentials schema
 */
export const integrationCredentialsSchema = z.object({
  integration_type: z.enum([
    'odoo',
    'shopify',
    'trendyol',
    'amazon',
    'alibaba',
    'n8n',
  ]),
  credentials: z.record(z.string()),
  is_active: z.boolean().default(true),
});

/**
 * Notification preference schema
 */
export const notificationPreferenceSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),
  push_notifications: z.boolean().default(true),
  whatsapp_notifications: z.boolean().default(false),
  notification_types: z.object({
    orders: z.boolean().default(true),
    inventory: z.boolean().default(true),
    system: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }),
});

/**
 * Validate data against a Zod schema
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; data?: T; errors?: z.ZodIssue[] } {
  try {
    const validated = schema.parse(data);
    return {
      isValid: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues,
      };
    }
    return {
      isValid: false,
      errors: [
        {
          code: 'custom' as any,
          path: [],
          message: 'Validation error',
        },
      ],
    };
  }
}

/**
 * Format Zod errors for display
 */
export function formatZodErrors(errors: z.ZodIssue[]): string[] {
  return errors.map(error => {
    const path = error.path.join('.');
    return path ? `${path}: ${error.message}` : error.message;
  });
}
