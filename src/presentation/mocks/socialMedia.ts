/**
 * Social Media Automation Mock Data
 * Mock data for comprehensive social media management system
 */

export type Platform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'threads';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export type AutomationType =
  | 'auto_reply'
  | 'auto_engage'
  | 'cross_post'
  | 'content_recycle'
  | 'smart_schedule'
  | 'crisis_management';

export interface SocialAccount {
  id: string;
  platform: Platform;
  accountName: string;
  accountUsername: string;
  isConnected: boolean;
  followers: number;
  following: number;
  postsCount: number;
  engagementRate: number;
  lastPostDate: string;
  profileImage: string;
  authToken?: string;
}

export interface SocialPost {
  id: string;
  platform: Platform[];
  caption: string;
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel' | 'story';
  status: PostStatus;
  scheduledDate?: string;
  publishedDate?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reachCount: number;
  impressionCount: number;
  engagementRate: number;
  createdAt: string;
}

export interface AIContentTemplate {
  id: string;
  name: string;
  category:
    | 'product'
    | 'story'
    | 'educational'
    | 'entertaining'
    | 'campaign'
    | 'announcement';
  tone: 'professional' | 'friendly' | 'fun' | 'excited' | 'urgent';
  platforms: Platform[];
  useEmoji: boolean;
  hashtagCount: number;
  includeCTA: boolean;
  prompt: string;
}

export interface ContentCalendarEvent {
  id: string;
  title: string;
  platforms: Platform[];
  date: string;
  time: string;
  status: PostStatus;
  postId?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'none';
  color: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: AutomationType;
  isActive: boolean;
  trigger: {
    event: string;
    keywords?: string[];
    platforms: Platform[];
  };
  action: {
    type: string;
    template?: string;
    delay?: number;
  };
  stats: {
    timesTriggered: number;
    successRate: number;
    lastTriggered?: string;
  };
  createdAt: string;
}

export interface SocialMention {
  id: string;
  platform: Platform;
  author: string;
  authorUsername: string;
  content: string;
  mentionType: 'direct' | 'hashtag' | 'brand';
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  timestamp: string;
  isReplied: boolean;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface MediaAsset {
  id: string;
  fileName: string;
  fileType: 'image' | 'video' | 'gif';
  fileSize: number;
  dimensions: { width: number; height: number };
  url: string;
  thumbnail: string;
  tags: string[];
  folder: string;
  usedInPosts: string[];
  createdAt: string;
}

export interface AnalyticsData {
  totalFollowers: number;
  newFollowers: number;
  followerGrowth: number;
  totalEngagement: number;
  engagementRate: number;
  totalReach: number;
  totalImpressions: number;
  postsPublished: number;
  scheduledPosts: number;
  bestPostingTimes: Array<{ day: string; hour: number; performance: number }>;
  platformPerformance: Array<{
    platform: Platform;
    followers: number;
    engagement: number;
    reach: number;
  }>;
  topPosts: SocialPost[];
  audienceDemographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    genderSplit: { male: number; female: number; other: number };
    topLocations: Array<{ city: string; percentage: number }>;
  };
}

// Mock Data
export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'acc-001',
    platform: 'instagram',
    accountName: 'Otoniq Store',
    accountUsername: 'otoniq.store',
    isConnected: true,
    followers: 12450,
    following: 890,
    postsCount: 234,
    engagementRate: 4.2,
    lastPostDate: '2025-01-17T14:30:00Z',
    profileImage: '📸',
  },
  {
    id: 'acc-002',
    platform: 'facebook',
    accountName: 'Otoniq Official',
    accountUsername: 'otoniq.official',
    isConnected: true,
    followers: 8920,
    following: 120,
    postsCount: 156,
    engagementRate: 3.8,
    lastPostDate: '2025-01-17T10:15:00Z',
    profileImage: '👍',
  },
  {
    id: 'acc-003',
    platform: 'twitter',
    accountName: 'Otoniq Tech',
    accountUsername: 'otoniq_tech',
    isConnected: true,
    followers: 5670,
    following: 430,
    postsCount: 892,
    engagementRate: 2.9,
    lastPostDate: '2025-01-17T16:45:00Z',
    profileImage: '🐦',
  },
  {
    id: 'acc-004',
    platform: 'linkedin',
    accountName: 'Otoniq AI Solutions',
    accountUsername: 'otoniq-ai',
    isConnected: true,
    followers: 3240,
    following: 89,
    postsCount: 67,
    engagementRate: 5.6,
    lastPostDate: '2025-01-16T09:00:00Z',
    profileImage: '💼',
  },
  {
    id: 'acc-005',
    platform: 'tiktok',
    accountName: 'Otoniq',
    accountUsername: '@otoniq_ai',
    isConnected: false,
    followers: 0,
    following: 0,
    postsCount: 0,
    engagementRate: 0,
    lastPostDate: '',
    profileImage: '🎵',
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: 'post-001',
    platform: ['instagram', 'facebook'],
    caption:
      'Yeni ürünümüzle tanışın! 🚀 E-ticaret işinizi bir üst seviyeye taşıyın.',
    content:
      'Otoniq AI ile tüm sosyal medya hesaplarınızı tek yerden yönetin, içerik üretin ve analiz edin.',
    hashtags: [
      'eticaret',
      'ai',
      'otomasyon',
      'dijitalpazarlama',
      'startup',
      'teknoloji',
    ],
    mediaUrls: ['https://example.com/product1.jpg'],
    mediaType: 'image',
    status: 'published',
    publishedDate: '2025-01-17T14:30:00Z',
    likesCount: 342,
    commentsCount: 28,
    sharesCount: 15,
    reachCount: 8920,
    impressionCount: 12450,
    engagementRate: 4.3,
    createdAt: '2025-01-17T10:00:00Z',
  },
  {
    id: 'post-002',
    platform: ['twitter', 'linkedin'],
    caption:
      'AI destekli sosyal medya yönetimi ile verimliliğinizi %300 artırın! 📈',
    content: 'Otoniq ile içerik üretimi, zamanlama ve analiz artık çok kolay.',
    hashtags: ['AI', 'SocialMedia', 'Automation', 'Productivity'],
    mediaUrls: ['https://example.com/infographic.jpg'],
    mediaType: 'image',
    status: 'published',
    publishedDate: '2025-01-16T16:00:00Z',
    likesCount: 156,
    commentsCount: 12,
    sharesCount: 23,
    reachCount: 4560,
    impressionCount: 6780,
    engagementRate: 3.9,
    createdAt: '2025-01-16T14:00:00Z',
  },
  {
    id: 'post-003',
    platform: ['instagram'],
    caption: 'Müşteri hikayesi: E-ticaret firması 3 ayda %450 büyüdü! 💪',
    content: 'Başarı hikayemizi okuyun ve siz de büyümeye başlayın.',
    hashtags: ['başarıhikayesi', 'eticaret', 'büyüme', 'motivasyon'],
    mediaUrls: ['https://example.com/success-story.mp4'],
    mediaType: 'video',
    status: 'scheduled',
    scheduledDate: '2025-01-18T10:00:00Z',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reachCount: 0,
    impressionCount: 0,
    engagementRate: 0,
    createdAt: '2025-01-17T11:30:00Z',
  },
  {
    id: 'post-004',
    platform: ['facebook', 'linkedin'],
    caption: 'Webinar: AI ile Sosyal Medya Stratejisi Oluşturun 🎯',
    content: '20 Ocak Pazartesi, 14:00 - Ücretsiz katılım için kayıt olun!',
    hashtags: ['webinar', 'AI', 'socialmedia', 'strategy', 'free'],
    mediaUrls: ['https://example.com/webinar-banner.jpg'],
    mediaType: 'image',
    status: 'scheduled',
    scheduledDate: '2025-01-19T09:00:00Z',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reachCount: 0,
    impressionCount: 0,
    engagementRate: 0,
    createdAt: '2025-01-17T15:00:00Z',
  },
  {
    id: 'post-005',
    platform: ['instagram'],
    caption: 'Bugün ne paylaşsam? 🤔',
    content: 'AI içerik üretici ile artık bu soruya yanıt bulmak çok kolay!',
    hashtags: ['contentcreation', 'AI', 'marketing'],
    mediaUrls: [],
    mediaType: 'story',
    status: 'draft',
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    reachCount: 0,
    impressionCount: 0,
    engagementRate: 0,
    createdAt: '2025-01-17T16:00:00Z',
  },
];

export const mockAutomationRules: AutomationRule[] = [
  {
    id: 'auto-001',
    name: 'Otomatik Karşılama Mesajı',
    type: 'auto_reply',
    isActive: true,
    trigger: {
      event: 'new_dm',
      keywords: ['merhaba', 'selam', 'hi', 'hello'],
      platforms: ['instagram', 'facebook'],
    },
    action: {
      type: 'send_message',
      template:
        "Merhaba! 👋 Otoniq Store'a hoş geldiniz. Size nasıl yardımcı olabilirim?",
      delay: 0,
    },
    stats: {
      timesTriggered: 248,
      successRate: 98.4,
      lastTriggered: '2025-01-17T14:25:00Z',
    },
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'auto-002',
    name: 'Fiyat Sorularına Otomatik Yanıt',
    type: 'auto_reply',
    isActive: true,
    trigger: {
      event: 'comment_contains',
      keywords: ['fiyat', 'price', 'ne kadar', 'ücret'],
      platforms: ['instagram', 'facebook', 'twitter'],
    },
    action: {
      type: 'send_message',
      template:
        'Fiyat listemiz için DM atın veya web sitemizi ziyaret edin: otoniq.ai/pricing 💰',
      delay: 5,
    },
    stats: {
      timesTriggered: 89,
      successRate: 95.5,
      lastTriggered: '2025-01-17T11:40:00Z',
    },
    createdAt: '2025-01-12T14:00:00Z',
  },
  {
    id: 'auto-003',
    name: 'Instagram → Twitter Çapraz Paylaşım',
    type: 'cross_post',
    isActive: true,
    trigger: {
      event: 'post_published',
      keywords: [],
      platforms: ['instagram'],
    },
    action: {
      type: 'repost_to',
      template: 'twitter',
      delay: 30,
    },
    stats: {
      timesTriggered: 34,
      successRate: 100,
      lastTriggered: '2025-01-17T14:30:00Z',
    },
    createdAt: '2025-01-08T09:00:00Z',
  },
  {
    id: 'auto-004',
    name: "En İyi Post'ları Yeniden Paylaş",
    type: 'content_recycle',
    isActive: true,
    trigger: {
      event: 'high_engagement_post',
      keywords: [],
      platforms: ['instagram', 'facebook'],
    },
    action: {
      type: 'republish',
      template: 'same_platforms',
      delay: 2592000, // 30 gün
    },
    stats: {
      timesTriggered: 12,
      successRate: 91.7,
      lastTriggered: '2025-01-15T10:00:00Z',
    },
    createdAt: '2025-01-05T12:00:00Z',
  },
  {
    id: 'auto-005',
    name: 'Negatif Yorum Uyarısı',
    type: 'crisis_management',
    isActive: true,
    trigger: {
      event: 'negative_comment',
      keywords: ['kötü', 'berbat', 'vasat', 'memnun değilim', 'rezalet'],
      platforms: ['instagram', 'facebook', 'twitter'],
    },
    action: {
      type: 'alert_admin',
      template: 'Acil: Negatif yorum algılandı!',
      delay: 0,
    },
    stats: {
      timesTriggered: 7,
      successRate: 100,
      lastTriggered: '2025-01-14T16:20:00Z',
    },
    createdAt: '2025-01-11T11:00:00Z',
  },
];

export const mockSocialMentions: SocialMention[] = [
  {
    id: 'mention-001',
    platform: 'instagram',
    author: 'Ayşe Yılmaz',
    authorUsername: '@ayseyilmaz',
    content:
      '@otoniq.store ürününüz harika! İşimi çok kolaylaştırdı, herkese tavsiye ediyorum 🙌',
    mentionType: 'direct',
    sentiment: 'positive',
    sentimentScore: 0.92,
    timestamp: '2025-01-17T15:30:00Z',
    isReplied: true,
    engagement: { likes: 23, comments: 4, shares: 2 },
  },
  {
    id: 'mention-002',
    platform: 'twitter',
    author: 'Mehmet Kaya',
    authorUsername: '@mehmetkaya',
    content:
      'AI ile sosyal medya yönetimi gerçekten mümkün mü? @otoniq_tech ile deniyorum, sonuçları paylaşacağım',
    mentionType: 'direct',
    sentiment: 'neutral',
    sentimentScore: 0.65,
    timestamp: '2025-01-17T14:15:00Z',
    isReplied: false,
    engagement: { likes: 12, comments: 3, shares: 1 },
  },
  {
    id: 'mention-003',
    platform: 'facebook',
    author: 'Can Demir',
    authorUsername: 'candemir',
    content:
      'Otoniq kullanıyorum 3 aydır. Sosyal medya hesaplarımı yönetmek artık çok kolay. #eticaret #otomasyon',
    mentionType: 'brand',
    sentiment: 'positive',
    sentimentScore: 0.88,
    timestamp: '2025-01-17T11:00:00Z',
    isReplied: true,
    engagement: { likes: 45, comments: 8, shares: 6 },
  },
  {
    id: 'mention-004',
    platform: 'instagram',
    author: 'E-ticaret Guru',
    authorUsername: '@eticaretguru',
    content:
      '#AI destekli sosyal medya araçları arasında hangisi sizce en iyi? Deneyimlerinizi paylaşır mısınız?',
    mentionType: 'hashtag',
    sentiment: 'neutral',
    sentimentScore: 0.5,
    timestamp: '2025-01-17T09:30:00Z',
    isReplied: false,
    engagement: { likes: 34, comments: 18, shares: 3 },
  },
  {
    id: 'mention-005',
    platform: 'linkedin',
    author: 'Zeynep Arslan',
    authorUsername: 'zeyneparslan',
    content:
      'Otoniq AI ile çalışmaya başladık. İlk hafta sonuçları çok umut verici! Takipçi etkileşimimiz %40 arttı.',
    mentionType: 'brand',
    sentiment: 'positive',
    sentimentScore: 0.95,
    timestamp: '2025-01-16T16:45:00Z',
    isReplied: true,
    engagement: { likes: 78, comments: 12, shares: 15 },
  },
];

export const mockMediaAssets: MediaAsset[] = [
  {
    id: 'media-001',
    fileName: 'product-hero-image.jpg',
    fileType: 'image',
    fileSize: 2458000,
    dimensions: { width: 1920, height: 1080 },
    url: 'https://example.com/media/product-hero.jpg',
    thumbnail: '🖼️',
    tags: ['product', 'hero', 'banner'],
    folder: 'Product Images',
    usedInPosts: ['post-001', 'post-003'],
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'media-002',
    fileName: 'ai-infographic.png',
    fileType: 'image',
    fileSize: 1890000,
    dimensions: { width: 1080, height: 1350 },
    url: 'https://example.com/media/ai-infographic.png',
    thumbnail: '📊',
    tags: ['infographic', 'AI', 'education'],
    folder: 'Graphics',
    usedInPosts: ['post-002'],
    createdAt: '2025-01-12T14:30:00Z',
  },
  {
    id: 'media-003',
    fileName: 'customer-testimonial.mp4',
    fileType: 'video',
    fileSize: 15600000,
    dimensions: { width: 1080, height: 1920 },
    url: 'https://example.com/media/testimonial.mp4',
    thumbnail: '🎬',
    tags: ['video', 'testimonial', 'customer'],
    folder: 'Videos',
    usedInPosts: ['post-003'],
    createdAt: '2025-01-14T09:00:00Z',
  },
  {
    id: 'media-004',
    fileName: 'otoniq-logo.png',
    fileType: 'image',
    fileSize: 125000,
    dimensions: { width: 512, height: 512 },
    url: 'https://example.com/media/logo.png',
    thumbnail: '🎨',
    tags: ['logo', 'branding'],
    folder: 'Branding',
    usedInPosts: [],
    createdAt: '2025-01-08T08:00:00Z',
  },
  {
    id: 'media-005',
    fileName: 'webinar-promo.gif',
    fileType: 'gif',
    fileSize: 3450000,
    dimensions: { width: 800, height: 600 },
    url: 'https://example.com/media/webinar.gif',
    thumbnail: '🎞️',
    tags: ['gif', 'webinar', 'promo'],
    folder: 'Campaigns',
    usedInPosts: ['post-004'],
    createdAt: '2025-01-15T11:00:00Z',
  },
];

export const mockAnalytics: AnalyticsData = {
  totalFollowers: 30280,
  newFollowers: 1248,
  followerGrowth: 4.3,
  totalEngagement: 8920,
  engagementRate: 4.1,
  totalReach: 45670,
  totalImpressions: 67890,
  postsPublished: 15,
  scheduledPosts: 8,
  bestPostingTimes: [
    { day: 'Monday', hour: 9, performance: 85 },
    { day: 'Wednesday', hour: 14, performance: 92 },
    { day: 'Friday', hour: 18, performance: 88 },
    { day: 'Saturday', hour: 11, performance: 78 },
  ],
  platformPerformance: [
    {
      platform: 'instagram',
      followers: 12450,
      engagement: 3890,
      reach: 18920,
    },
    { platform: 'facebook', followers: 8920, engagement: 2340, reach: 14560 },
    { platform: 'twitter', followers: 5670, engagement: 1450, reach: 8920 },
    { platform: 'linkedin', followers: 3240, engagement: 1240, reach: 3270 },
  ],
  topPosts: mockSocialPosts.slice(0, 3),
  audienceDemographics: {
    ageGroups: [
      { range: '18-24', percentage: 18 },
      { range: '25-34', percentage: 42 },
      { range: '35-44', percentage: 25 },
      { range: '45-54', percentage: 12 },
      { range: '55+', percentage: 3 },
    ],
    genderSplit: { male: 48, female: 50, other: 2 },
    topLocations: [
      { city: 'İstanbul', percentage: 35 },
      { city: 'Ankara', percentage: 18 },
      { city: 'İzmir', percentage: 12 },
      { city: 'Bursa', percentage: 8 },
      { city: 'Antalya', percentage: 6 },
    ],
  },
};

export function getAccountByPlatform(platform: Platform) {
  return mockSocialAccounts.find(acc => acc.platform === platform);
}

export function getPostsByStatus(status: PostStatus) {
  return mockSocialPosts.filter(post => post.status === status);
}

export function getActiveAutomations() {
  return mockAutomationRules.filter(rule => rule.isActive);
}

export function getMentionsBySentiment(
  sentiment: 'positive' | 'neutral' | 'negative'
) {
  return mockSocialMentions.filter(m => m.sentiment === sentiment);
}
