/**
 * Lead Generation Mock Data
 * Google Maps + LinkedIn entegrasyonu için mock veriler
 */

export interface LeadCampaign {
  id: string;
  name: string;
  location: {
    city: string;
    district: string;
    coordinates: { lat: number; lng: number }[];
    radius: number;
  };
  filters: {
    categories: string[];
    minRating: number;
    hasWebsite: boolean;
    keywords: string[];
  };
  status: 'scanning' | 'analyzing' | 'completed' | 'paused';
  stats: {
    totalBusinesses: number;
    contactsFound: number;
    emailsSent: number;
    responses: number;
    conversions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessLead {
  id: string;
  campaignId: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  category: string;
  rating: number;
  reviewCount: number;
  googleMapsUrl: string;
  location: { lat: number; lng: number };

  analysis: {
    digitalMaturity: number;
    potentialScore: number;
    estimatedSize: 'micro' | 'small' | 'medium' | 'large';
    needsIdentified: string[];
    recommendedPitch: string;
  };

  linkedinData: {
    companyPage: string;
    employeeCount: number;
    decisionMakers: string[];
  };

  leadStatus:
    | 'new'
    | 'contacted'
    | 'responded'
    | 'qualified'
    | 'proposal'
    | 'won'
    | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  notes: string;
  nextFollowUp: string;
  assignedTo: string;
  createdAt: string;
}

export interface LinkedInContact {
  id: string;
  businessId: string;
  name: string;
  position: string;
  linkedInUrl: string;
  email: string;
  phone: string;
  profilePhoto: string;

  experience: number;
  skills: string[];
  interests: string[];
  recentActivity: string[];
  mutualConnections: number;

  contactStatus:
    | 'not_contacted'
    | 'connection_sent'
    | 'connected'
    | 'messaged'
    | 'responded';
  lastContact: string;
  responseRate: number;
  createdAt: string;
}

export interface OutreachSequence {
  id: string;
  name: string;
  channel: 'email' | 'phone' | 'linkedin' | 'multi';
  steps: SequenceStep[];
  active: boolean;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    responded: number;
    converted: number;
  };
  createdAt: string;
}

export interface SequenceStep {
  id: string;
  order: number;
  delayDays: number;
  type: 'email' | 'task' | 'linkedin_message' | 'phone_call';
  template: string;
  subject: string;
  content: string;
}

// Mock Data
export const mockCampaigns: LeadCampaign[] = [
  {
    id: 'camp-001',
    name: 'Kadıköy Restoran Taraması',
    location: {
      city: 'İstanbul',
      district: 'Kadıköy',
      coordinates: [
        { lat: 40.99, lng: 29.03 },
        { lat: 41.01, lng: 29.03 },
        { lat: 41.01, lng: 29.05 },
        { lat: 40.99, lng: 29.05 },
      ],
      radius: 2000,
    },
    filters: {
      categories: ['Restoran', 'Cafe', 'Bistro'],
      minRating: 4.0,
      hasWebsite: false,
      keywords: ['yeni açıldı', 'popüler'],
    },
    status: 'completed',
    stats: {
      totalBusinesses: 156,
      contactsFound: 124,
      emailsSent: 98,
      responses: 23,
      conversions: 7,
    },
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T16:30:00Z',
  },
  {
    id: 'camp-002',
    name: 'Beyoğlu Butik Otel Hedefleme',
    location: {
      city: 'İstanbul',
      district: 'Beyoğlu',
      coordinates: [
        { lat: 41.02, lng: 28.97 },
        { lat: 41.04, lng: 28.97 },
        { lat: 41.04, lng: 28.99 },
        { lat: 41.02, lng: 28.99 },
      ],
      radius: 1500,
    },
    filters: {
      categories: ['Otel', 'Butik Otel', 'Hostel'],
      minRating: 4.2,
      hasWebsite: true,
      keywords: ['butik', 'lüks', 'merkezi'],
    },
    status: 'analyzing',
    stats: {
      totalBusinesses: 42,
      contactsFound: 38,
      emailsSent: 15,
      responses: 4,
      conversions: 0,
    },
    createdAt: '2025-01-16T09:15:00Z',
    updatedAt: '2025-01-17T14:20:00Z',
  },
  {
    id: 'camp-003',
    name: 'Ankara Çankaya E-Ticaret Firmaları',
    location: {
      city: 'Ankara',
      district: 'Çankaya',
      coordinates: [
        { lat: 39.9, lng: 32.85 },
        { lat: 39.92, lng: 32.85 },
        { lat: 39.92, lng: 32.87 },
        { lat: 39.9, lng: 32.87 },
      ],
      radius: 3000,
    },
    filters: {
      categories: ['E-Ticaret', 'Online Mağaza', 'Dijital Ajans'],
      minRating: 3.8,
      hasWebsite: true,
      keywords: ['e-ticaret', 'online', 'dijital'],
    },
    status: 'scanning',
    stats: {
      totalBusinesses: 28,
      contactsFound: 12,
      emailsSent: 0,
      responses: 0,
      conversions: 0,
    },
    createdAt: '2025-01-17T11:30:00Z',
    updatedAt: '2025-01-17T13:45:00Z',
  },
];

export const mockBusinessLeads: BusinessLead[] = [
  {
    id: 'lead-001',
    campaignId: 'camp-001',
    name: 'Moda Balık Restaurant',
    address: 'Moda Caddesi No:45, Kadıköy, İstanbul',
    phone: '+90 216 555 1234',
    website: 'https://modabalik.com',
    category: 'Restoran',
    rating: 4.6,
    reviewCount: 342,
    googleMapsUrl: 'https://maps.google.com/?cid=12345',
    location: { lat: 40.9876, lng: 29.0312 },
    analysis: {
      digitalMaturity: 45,
      potentialScore: 78,
      estimatedSize: 'small',
      needsIdentified: [
        'Website yavaş ve eski',
        'Online rezervasyon yok',
        'Sosyal medya düşük etkileşim',
        'Google Ads kullanmıyor',
      ],
      recommendedPitch:
        'Dijital varlığınızı güçlendirerek online rezervasyon sayınızı 3 katına çıkarabilirsiniz.',
    },
    linkedinData: {
      companyPage: 'https://linkedin.com/company/moda-balik',
      employeeCount: 12,
      decisionMakers: ['contact-001', 'contact-002'],
    },
    leadStatus: 'responded',
    priority: 'high',
    tags: ['Restoran', 'Yüksek Potansiyel', 'Kadıköy'],
    notes: 'Sahip ile görüşme yapıldı, fiyat teklifi bekliyor.',
    nextFollowUp: '2025-01-20T10:00:00Z',
    assignedTo: 'Ahmet Yılmaz',
    createdAt: '2025-01-12T14:20:00Z',
  },
  {
    id: 'lead-002',
    campaignId: 'camp-001',
    name: 'Barista Coffee House',
    address: 'Bahariye Caddesi No:78, Kadıköy, İstanbul',
    phone: '+90 216 555 5678',
    website: '',
    category: 'Cafe',
    rating: 4.8,
    reviewCount: 567,
    googleMapsUrl: 'https://maps.google.com/?cid=67890',
    location: { lat: 40.9912, lng: 29.0278 },
    analysis: {
      digitalMaturity: 25,
      potentialScore: 92,
      estimatedSize: 'micro',
      needsIdentified: [
        'Website yok',
        'Online sipariş sistemi yok',
        'Instagram dışında sosyal medya yok',
        'Google My Business optimize edilmemiş',
      ],
      recommendedPitch:
        'Sıfırdan e-ticaret sitesi ile online sipariş gelirlerinizi %200 artırın.',
    },
    linkedinData: {
      companyPage: '',
      employeeCount: 5,
      decisionMakers: ['contact-003'],
    },
    leadStatus: 'contacted',
    priority: 'urgent',
    tags: ['Cafe', 'Website Yok', 'Yüksek Rating'],
    notes: 'İlk email gönderildi, henüz yanıt yok.',
    nextFollowUp: '2025-01-18T15:00:00Z',
    assignedTo: 'Ayşe Demir',
    createdAt: '2025-01-13T09:45:00Z',
  },
  {
    id: 'lead-003',
    campaignId: 'camp-002',
    name: 'Boutique Hotel Pera',
    address: 'İstiklal Caddesi No:123, Beyoğlu, İstanbul',
    phone: '+90 212 555 9012',
    website: 'https://boutiquehotelpera.com',
    category: 'Butik Otel',
    rating: 4.9,
    reviewCount: 1024,
    googleMapsUrl: 'https://maps.google.com/?cid=11111',
    location: { lat: 41.0312, lng: 28.9784 },
    analysis: {
      digitalMaturity: 72,
      potentialScore: 65,
      estimatedSize: 'medium',
      needsIdentified: [
        'Rezervasyon sistemi entegrasyonu gerekli',
        'Multi-language website desteği eksik',
        'Email marketing kullanmıyor',
        'Analytics & tracking optimize edilebilir',
      ],
      recommendedPitch:
        'Otomatik rezervasyon yönetimi ve çok dilli site ile doluluk oranınızı artırın.',
    },
    linkedinData: {
      companyPage: 'https://linkedin.com/company/boutique-hotel-pera',
      employeeCount: 28,
      decisionMakers: ['contact-004', 'contact-005'],
    },
    leadStatus: 'qualified',
    priority: 'high',
    tags: ['Otel', 'Butik', 'Beyoğlu', 'Yüksek Rating'],
    notes: 'GM ile toplantı yapıldı, teklif hazırlanıyor.',
    nextFollowUp: '2025-01-19T11:00:00Z',
    assignedTo: 'Mehmet Kaya',
    createdAt: '2025-01-16T16:30:00Z',
  },
];

export const mockLinkedInContacts: LinkedInContact[] = [
  {
    id: 'contact-001',
    businessId: 'lead-001',
    name: 'Ahmet Özkan',
    position: 'Kurucu & Genel Müdür',
    linkedInUrl: 'https://linkedin.com/in/ahmetozkan',
    email: 'ahmet.ozkan@modabalik.com',
    phone: '+90 532 123 4567',
    profilePhoto: '👨‍💼',
    experience: 15,
    skills: ['Restoran Yönetimi', 'Müşteri İlişkileri', 'Maliyet Kontrolü'],
    interests: ['Sürdürülebilir Gıda', 'Dijitalleşme', 'Turizm'],
    recentActivity: [
      'Yeni menü lansmanı hakkında paylaşım',
      "Kadıköy'deki işletmeler için networking etkinliği",
    ],
    mutualConnections: 8,
    contactStatus: 'messaged',
    lastContact: '2025-01-15T14:30:00Z',
    responseRate: 75,
    createdAt: '2025-01-12T14:20:00Z',
  },
  {
    id: 'contact-002',
    businessId: 'lead-001',
    name: 'Zeynep Yılmaz',
    position: 'Pazarlama Müdürü',
    linkedInUrl: 'https://linkedin.com/in/zeynepyilmaz',
    email: 'zeynep@modabalik.com',
    phone: '+90 532 234 5678',
    profilePhoto: '👩‍💼',
    experience: 8,
    skills: ['Dijital Pazarlama', 'Sosyal Medya', 'İçerik Üretimi'],
    interests: ['Growth Hacking', 'Instagram Marketing', 'Food Photography'],
    recentActivity: [
      'Restoran sektöründe dijital pazarlama trendleri makalesini paylaştı',
    ],
    mutualConnections: 12,
    contactStatus: 'connected',
    lastContact: '2025-01-14T10:15:00Z',
    responseRate: 90,
    createdAt: '2025-01-12T14:20:00Z',
  },
  {
    id: 'contact-003',
    businessId: 'lead-002',
    name: 'Can Demir',
    position: 'Sahip',
    linkedInUrl: 'https://linkedin.com/in/candemir',
    email: 'can@baristacoffee.com',
    phone: '+90 532 345 6789',
    profilePhoto: '☕',
    experience: 5,
    skills: ['Kahve Uzmanlığı', 'Müşteri Deneyimi', 'İşletme Yönetimi'],
    interests: ['Specialty Coffee', 'Barista Training', 'Cafe Culture'],
    recentActivity: [
      'Yeni kahve çeşitleri hakkında post',
      'Kadıköy cafe sahipleri buluşması',
    ],
    mutualConnections: 3,
    contactStatus: 'connection_sent',
    lastContact: '2025-01-13T09:45:00Z',
    responseRate: 0,
    createdAt: '2025-01-13T09:45:00Z',
  },
  {
    id: 'contact-004',
    businessId: 'lead-003',
    name: 'Ayşe Kara',
    position: 'Genel Müdür',
    linkedInUrl: 'https://linkedin.com/in/aysekara',
    email: 'ayse.kara@boutiquehotelpera.com',
    phone: '+90 532 456 7890',
    profilePhoto: '👩‍💼',
    experience: 18,
    skills: ['Otel Yönetimi', 'Revenue Management', 'Liderlik'],
    interests: ['Boutique Hospitality', 'Guest Experience', 'Sustainability'],
    recentActivity: [
      'Butik otelcilik trendleri raporu paylaşımı',
      'İstanbul turizm forumu katılımı',
    ],
    mutualConnections: 25,
    contactStatus: 'responded',
    lastContact: '2025-01-17T11:20:00Z',
    responseRate: 85,
    createdAt: '2025-01-16T16:30:00Z',
  },
  {
    id: 'contact-005',
    businessId: 'lead-003',
    name: 'Mehmet Arslan',
    position: 'Satış ve Pazarlama Direktörü',
    linkedInUrl: 'https://linkedin.com/in/mehmetarslan',
    email: 'm.arslan@boutiquehotelpera.com',
    phone: '+90 532 567 8901',
    profilePhoto: '👨‍💼',
    experience: 12,
    skills: ['Hotel Sales', 'Digital Marketing', 'Brand Management'],
    interests: ['Hotel Tech', 'OTA Management', 'Direct Bookings'],
    recentActivity: [
      'Doğrudan rezervasyon artırma stratejileri',
      'Google Hotel Ads deneyimleri',
    ],
    mutualConnections: 18,
    contactStatus: 'messaged',
    lastContact: '2025-01-16T17:00:00Z',
    responseRate: 70,
    createdAt: '2025-01-16T16:30:00Z',
  },
];

export const mockSequences: OutreachSequence[] = [
  {
    id: 'seq-001',
    name: 'Restoran Dijitalleşme Serisi',
    channel: 'email',
    steps: [
      {
        id: 'step-001',
        order: 1,
        delayDays: 0,
        type: 'email',
        template: 'intro-restaurant',
        subject: '{{restaurant_name}} için dijital dönüşüm fırsatı',
        content:
          "Merhaba {{contact_name}},\n\n{{restaurant_name}}'i Google Maps'te gördüm ve harika yorumlarınızı okudum...",
      },
      {
        id: 'step-002',
        order: 2,
        delayDays: 3,
        type: 'email',
        template: 'case-study',
        subject: 'Benzer bir restoran nasıl %200 büyüdü?',
        content:
          "Merhaba {{contact_name}},\n\nSize {{competitor_name}}'in başarı hikayesini paylaşmak istedim...",
      },
      {
        id: 'step-003',
        order: 3,
        delayDays: 5,
        type: 'task',
        template: 'phone-call',
        subject: 'Telefon görüşmesi planla',
        content: '{{contact_name}} ile görüşme planla ve demo sun.',
      },
    ],
    active: true,
    stats: {
      sent: 42,
      opened: 31,
      clicked: 12,
      responded: 8,
      converted: 3,
    },
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'seq-002',
    name: 'Otel LinkedIn Outreach',
    channel: 'linkedin',
    steps: [
      {
        id: 'step-004',
        order: 1,
        delayDays: 0,
        type: 'linkedin_message',
        template: 'linkedin-intro',
        subject: 'Bağlantı İsteği',
        content:
          "Merhaba {{contact_name}}, {{hotel_name}}'deki çalışmalarınızı takip ediyorum...",
      },
      {
        id: 'step-005',
        order: 2,
        delayDays: 2,
        type: 'linkedin_message',
        template: 'value-prop',
        subject: 'Değer önerisi',
        content:
          'Otel rezervasyon optimizasyonu konusunda sizinle bir şeyler paylaşmak istiyorum...',
      },
      {
        id: 'step-006',
        order: 3,
        delayDays: 7,
        type: 'email',
        template: 'meeting-request',
        subject: '15 dakikalık görüşme',
        content: 'Kısa bir görüşme için müsait misiniz?',
      },
    ],
    active: true,
    stats: {
      sent: 18,
      opened: 15,
      clicked: 6,
      responded: 4,
      converted: 1,
    },
    createdAt: '2025-01-16T09:15:00Z',
  },
];

export function getCampaignStats() {
  return {
    totalCampaigns: mockCampaigns.length,
    activeCampaigns: mockCampaigns.filter(c => c.status !== 'completed').length,
    totalLeads: mockBusinessLeads.length,
    qualifiedLeads: mockBusinessLeads.filter(l => l.leadStatus === 'qualified')
      .length,
    totalContacts: mockLinkedInContacts.length,
    responseRate:
      mockLinkedInContacts.filter(c => c.contactStatus === 'responded').length /
      mockLinkedInContacts.length,
  };
}

export function getLeadsByStatus(status: BusinessLead['leadStatus']) {
  return mockBusinessLeads.filter(lead => lead.leadStatus === status);
}

export function getLeadsByCampaign(campaignId: string) {
  return mockBusinessLeads.filter(lead => lead.campaignId === campaignId);
}

export function getContactsByBusiness(businessId: string) {
  return mockLinkedInContacts.filter(
    contact => contact.businessId === businessId
  );
}
