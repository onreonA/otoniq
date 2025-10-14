/**
 * Chat Automation Mock Data
 * WhatsApp & Telegram bot conversations, templates, and analytics
 */

import { format, subMinutes, subHours, subDays } from 'date-fns';

// --- Types ---
export interface ChatMessage {
  id: string;
  sender: 'bot' | 'customer' | 'agent';
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'product' | 'order';
  metadata?: {
    productId?: string;
    orderId?: string;
    fileUrl?: string;
  };
}

export interface ChatConversation {
  id: string;
  platform: 'whatsapp' | 'telegram';
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  status: 'active' | 'resolved' | 'pending' | 'escalated';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  assignedAgent?: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ChatTemplate {
  id: string;
  name: string;
  category:
    | 'greeting'
    | 'order-status'
    | 'product-info'
    | 'complaint'
    | 'general';
  trigger: string[];
  response: string;
  includesMedia: boolean;
  language: 'tr' | 'en';
  active: boolean;
}

export interface ChatStats {
  platform: 'whatsapp' | 'telegram';
  totalConversations: number;
  activeConversations: number;
  avgResponseTime: number; // in seconds
  resolutionRate: number; // percentage
  customerSatisfaction: number; // percentage
  messagesLast24h: number;
}

export interface VoiceCommand {
  id: string;
  command: string;
  category: 'order' | 'product' | 'report' | 'support';
  action: string;
  example: string;
  parameters?: string[];
  confidence: number;
}

// --- Mock Conversations ---
export const mockConversations: ChatConversation[] = [
  {
    id: 'CONV001',
    platform: 'whatsapp',
    customerName: 'Ayşe Yılmaz',
    customerPhone: '+90 532 123 4567',
    customerAvatar: '👩',
    status: 'active',
    lastMessage: 'Siparişim ne zaman gelecek?',
    lastMessageTime: subMinutes(new Date(), 5).toISOString(),
    unreadCount: 2,
    assignedAgent: 'Mehmet Kaya',
    tags: ['Sipariş Takibi', 'Acil'],
    sentiment: 'neutral',
    messages: [
      {
        id: 'MSG001',
        sender: 'customer',
        content: 'Merhaba, siparişim hakkında bilgi alabilir miyim?',
        timestamp: subMinutes(new Date(), 15).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG002',
        sender: 'bot',
        content:
          'Merhaba! Tabii ki yardımcı olabilirim. Sipariş numaranızı paylaşır mısınız?',
        timestamp: subMinutes(new Date(), 14).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG003',
        sender: 'customer',
        content: '#12345',
        timestamp: subMinutes(new Date(), 13).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG004',
        sender: 'bot',
        content:
          '#12345 numaralı siparişiniz kargoya verildi! Takip numaranız: TK987654321. Tahmini teslimat: 2-3 iş günü.',
        timestamp: subMinutes(new Date(), 12).toISOString(),
        read: true,
        type: 'order',
        metadata: { orderId: '12345' },
      },
      {
        id: 'MSG005',
        sender: 'customer',
        content: 'Siparişim ne zaman gelecek?',
        timestamp: subMinutes(new Date(), 5).toISOString(),
        read: false,
        type: 'text',
      },
    ],
  },
  {
    id: 'CONV002',
    platform: 'telegram',
    customerName: 'Mehmet Demir',
    customerPhone: '+90 533 987 6543',
    customerAvatar: '👨',
    status: 'pending',
    lastMessage: 'Ürün stoğa ne zaman girecek?',
    lastMessageTime: subHours(new Date(), 2).toISOString(),
    unreadCount: 1,
    tags: ['Stok Sorgusu'],
    sentiment: 'neutral',
    messages: [
      {
        id: 'MSG006',
        sender: 'customer',
        content: '/start',
        timestamp: subHours(new Date(), 3).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG007',
        sender: 'bot',
        content:
          'Hoş geldiniz! 🤖\n\nSize nasıl yardımcı olabilirim?\n\n/siparis - Sipariş takibi\n/urun - Ürün sorgulama\n/destek - Canlı destek',
        timestamp: subHours(new Date(), 3).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG008',
        sender: 'customer',
        content: '/urun iPhone 15 Pro',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG009',
        sender: 'bot',
        content:
          '📱 iPhone 15 Pro - 256GB\n\n💰 Fiyat: ₺45,999\n📦 Stok: Tükendi\n🔔 Stoğa giriş bildirimi için /bildirim komutunu kullanın',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: true,
        type: 'product',
        metadata: { productId: 'PROD001' },
      },
      {
        id: 'MSG010',
        sender: 'customer',
        content: 'Ürün stoğa ne zaman girecek?',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: false,
        type: 'text',
      },
    ],
  },
  {
    id: 'CONV003',
    platform: 'whatsapp',
    customerName: 'Zeynep Kara',
    customerPhone: '+90 534 555 1234',
    customerAvatar: '👩‍💼',
    status: 'resolved',
    lastMessage: 'Çok teşekkür ederim! 😊',
    lastMessageTime: subDays(new Date(), 1).toISOString(),
    unreadCount: 0,
    assignedAgent: 'Elif Şahin',
    tags: ['İade', 'Çözüldü'],
    sentiment: 'positive',
    messages: [
      {
        id: 'MSG011',
        sender: 'customer',
        content: 'Aldığım ürünü iade etmek istiyorum.',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG012',
        sender: 'bot',
        content:
          'İade talebinizi aldım. Sipariş numaranızı ve iade sebebinizi belirtir misiniz?',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG013',
        sender: 'agent',
        content:
          'Merhaba, ben Elif. İade sürecinizde size yardımcı olacağım. İade kodunuz: IADE-2024-001. Kargo 24 saat içinde gelecek.',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG014',
        sender: 'customer',
        content: 'Çok teşekkür ederim! 😊',
        timestamp: subDays(new Date(), 1).toISOString(),
        read: true,
        type: 'text',
      },
    ],
  },
  {
    id: 'CONV004',
    platform: 'telegram',
    customerName: 'Ali Vural',
    customerPhone: '+90 535 222 3344',
    customerAvatar: '👨‍💻',
    status: 'escalated',
    lastMessage: 'Bu kabul edilemez! Yöneticinizle görüşmek istiyorum.',
    lastMessageTime: subHours(new Date(), 1).toISOString(),
    unreadCount: 3,
    assignedAgent: 'Ahmet Yıldız',
    tags: ['Şikayet', 'Acil', 'Yönetici'],
    sentiment: 'negative',
    messages: [
      {
        id: 'MSG015',
        sender: 'customer',
        content: 'Siparişim 2 haftadır gelmedi!',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG016',
        sender: 'bot',
        content:
          'Üzgünüm, siparişinizle ilgili bir sorun yaşıyorsunuz. Bir müşteri temsilcisi size yardımcı olacak.',
        timestamp: subHours(new Date(), 2).toISOString(),
        read: true,
        type: 'text',
      },
      {
        id: 'MSG017',
        sender: 'customer',
        content: 'Bu kabul edilemez! Yöneticinizle görüşmek istiyorum.',
        timestamp: subHours(new Date(), 1).toISOString(),
        read: false,
        type: 'text',
      },
    ],
  },
];

// --- Mock Templates ---
export const mockChatTemplates: ChatTemplate[] = [
  {
    id: 'TEMP001',
    name: 'Hoş Geldin Mesajı',
    category: 'greeting',
    trigger: ['/start', 'merhaba', 'selam', 'hi', 'hello'],
    response:
      'Merhaba! 👋 Otoniq.ai müşteri destek botuna hoş geldiniz. Size nasıl yardımcı olabilirim?',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
  {
    id: 'TEMP002',
    name: 'Sipariş Takibi',
    category: 'order-status',
    trigger: ['/siparis', 'sipariş', 'kargo', 'teslimat', 'nerede'],
    response:
      'Sipariş takibi için sipariş numaranızı (#12345 formatında) paylaşır mısınız?',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
  {
    id: 'TEMP003',
    name: 'Ürün Bilgisi',
    category: 'product-info',
    trigger: ['/urun', 'ürün', 'stok', 'fiyat', 'price'],
    response:
      'Hangi ürün hakkında bilgi almak istersiniz? Ürün adını veya kodunu paylaşabilirsiniz.',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
  {
    id: 'TEMP004',
    name: 'İade Süreci',
    category: 'complaint',
    trigger: ['iade', 'geri', 'iptal', 'return', 'refund'],
    response:
      'İade talebinizi anladım. Sipariş numaranızı ve iade sebebinizi paylaşır mısınız? İade sürecimiz hakkında detaylı bilgi: https://otoniq.ai/iade',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
  {
    id: 'TEMP005',
    name: 'Canlı Destek Yönlendirme',
    category: 'general',
    trigger: ['/destek', 'temsilci', 'insan', 'agent', 'human'],
    response: 'Sizi bir müşteri temsilcisine bağlıyorum. Lütfen bekleyin... ⏳',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
  {
    id: 'TEMP006',
    name: 'Çalışma Saatleri',
    category: 'general',
    trigger: ['saat', 'açık', 'kapalı', 'working hours'],
    response:
      'Çalışma saatlerimiz:\n\n📅 Hafta içi: 09:00 - 18:00\n📅 Cumartesi: 10:00 - 16:00\n📅 Pazar: Kapalı\n\n🤖 Chatbot 7/24 hizmetinizdedir!',
    includesMedia: false,
    language: 'tr',
    active: true,
  },
];

// --- Mock Stats ---
export const mockChatStats: ChatStats[] = [
  {
    platform: 'whatsapp',
    totalConversations: 1247,
    activeConversations: 34,
    avgResponseTime: 45, // 45 seconds
    resolutionRate: 87,
    customerSatisfaction: 92,
    messagesLast24h: 523,
  },
  {
    platform: 'telegram',
    totalConversations: 856,
    activeConversations: 18,
    avgResponseTime: 38,
    resolutionRate: 91,
    customerSatisfaction: 89,
    messagesLast24h: 312,
  },
];

// --- Mock Voice Commands ---
export const mockVoiceCommands: VoiceCommand[] = [
  {
    id: 'VC001',
    command: 'Bugünkü siparişleri göster',
    category: 'order',
    action: 'SHOW_DAILY_ORDERS',
    example: '"Bugünkü siparişleri listele" veya "Bugün kaç sipariş var?"',
    confidence: 0.95,
  },
  {
    id: 'VC002',
    command: 'Stokta olmayan ürünleri listele',
    category: 'product',
    action: 'LIST_OUT_OF_STOCK',
    example: '"Tükenen ürünleri göster" veya "Stokta ne kalmadı?"',
    confidence: 0.92,
  },
  {
    id: 'VC003',
    command: 'Haftalık satış raporu oluştur',
    category: 'report',
    action: 'GENERATE_WEEKLY_REPORT',
    example: '"Bu haftanın raporunu hazırla" veya "Haftalık özet"',
    parameters: ['week_number', 'year'],
    confidence: 0.89,
  },
  {
    id: 'VC004',
    command: 'Müşteri destek durumunu kontrol et',
    category: 'support',
    action: 'CHECK_SUPPORT_STATUS',
    example: '"Destek durumu nedir?" veya "Açık ticket sayısı?"',
    confidence: 0.93,
  },
  {
    id: 'VC005',
    command: 'En çok satan ürünleri göster',
    category: 'product',
    action: 'SHOW_BEST_SELLERS',
    example: '"En popüler ürünler neler?" veya "Best seller listesi"',
    parameters: ['period', 'limit'],
    confidence: 0.94,
  },
  {
    id: 'VC006',
    command: 'Bekleyen siparişleri onayla',
    category: 'order',
    action: 'APPROVE_PENDING_ORDERS',
    example: '"Tüm siparişleri onayla" veya "Bekleyen siparişleri işle"',
    confidence: 0.88,
  },
];

// --- Helper Functions ---
export const getConversationsByPlatform = (platform: 'whatsapp' | 'telegram') =>
  mockConversations.filter(conv => conv.platform === platform);

export const getConversationsByStatus = (status: ChatConversation['status']) =>
  mockConversations.filter(conv => conv.status === status);

export const getActiveConversations = () =>
  mockConversations.filter(
    conv => conv.status === 'active' || conv.status === 'pending'
  );

export const getUnreadCount = () =>
  mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

export const getTemplatesByCategory = (category: ChatTemplate['category']) =>
  mockChatTemplates.filter(template => template.category === category);

export const getCombinedStats = (): Omit<ChatStats, 'platform'> => {
  const total = mockChatStats.reduce(
    (acc, stat) => ({
      totalConversations: acc.totalConversations + stat.totalConversations,
      activeConversations: acc.activeConversations + stat.activeConversations,
      avgResponseTime: acc.avgResponseTime + stat.avgResponseTime,
      resolutionRate: acc.resolutionRate + stat.resolutionRate,
      customerSatisfaction:
        acc.customerSatisfaction + stat.customerSatisfaction,
      messagesLast24h: acc.messagesLast24h + stat.messagesLast24h,
    }),
    {
      totalConversations: 0,
      activeConversations: 0,
      avgResponseTime: 0,
      resolutionRate: 0,
      customerSatisfaction: 0,
      messagesLast24h: 0,
    }
  );

  return {
    ...total,
    avgResponseTime: Math.round(total.avgResponseTime / mockChatStats.length),
    resolutionRate: Math.round(total.resolutionRate / mockChatStats.length),
    customerSatisfaction: Math.round(
      total.customerSatisfaction / mockChatStats.length
    ),
  };
};
