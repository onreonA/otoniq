/**
 * Demo Company Data
 * Realistic company profiles for demo scenarios
 */

export interface DemoCompany {
  id: string;
  name: string;
  industry: string;
  description: string;
  logo: string;
  website: string;
  foundedYear: number;
  employeeCount: string;
  monthlyRevenue: string;
  integrations: string[];
  features: string[];
}

export const demoCompanies: DemoCompany[] = [
  {
    id: 'fashion-store-tr',
    name: 'Fashion Store Turkey',
    industry: 'E-ticaret - Moda',
    description:
      "Türkiye'nin önde gelen online moda mağazalarından biri. 50,000+ aktif ürün, 5 pazaryerinde satış.",
    logo: '👗',
    website: 'fashionstoretr.com',
    foundedYear: 2018,
    employeeCount: '15-25',
    monthlyRevenue: '₺450,000',
    integrations: [
      'Shopify',
      'Trendyol',
      'Hepsiburada',
      'N11',
      'Instagram Shopping',
    ],
    features: [
      'Ürün Yönetimi',
      'Marketplace Sync',
      'Görsel Otomasyon',
      'Chat Bot',
    ],
  },
  {
    id: 'teknoloji-perakende',
    name: 'Teknoloji Perakende A.Ş.',
    industry: 'Perakende - Elektronik',
    description:
      '12 şube ile Türkiye genelinde elektronik ürün satışı. Omnichannel stratejisi ile hem fiziksel hem online.',
    logo: '💻',
    website: 'teknostore.com.tr',
    foundedYear: 2015,
    employeeCount: '50-100',
    monthlyRevenue: '₺2,500,000',
    integrations: [
      'Odoo ERP',
      'IoT Sensors',
      'Shopify POS',
      'WhatsApp Business',
    ],
    features: [
      'Stok Yönetimi',
      'IoT Monitoring',
      'Şube Yönetimi',
      'AI Analytics',
    ],
  },
  {
    id: 'organik-gida',
    name: 'Organik Gıda Evi',
    industry: 'Gıda - Organik Ürünler',
    description:
      'Sertifikalı organik ürünlerin e-ticareti. Farm-to-table konsepti ile tarladan sofraya.',
    logo: '🌿',
    website: 'organikgidaevi.com',
    foundedYear: 2019,
    employeeCount: '10-15',
    monthlyRevenue: '₺180,000',
    integrations: ['Shopify', 'GetirYemek', 'Trendyol Yemek', 'Instagram'],
    features: ['Ürün Yönetimi', 'Tedarikçi Yönetimi', 'Sosyal Medya Otomasyon'],
  },
  {
    id: 'mobilya-dunyasi',
    name: 'Mobilya Dünyası',
    industry: 'E-ticaret - Mobilya & Dekorasyon',
    description:
      'Online mobilya ve ev dekorasyon ürünleri. AR teknolojisi ile sanal showroom deneyimi.',
    logo: '🛋️',
    website: 'mobilyadunyasi.com.tr',
    foundedYear: 2020,
    employeeCount: '20-30',
    monthlyRevenue: '₺620,000',
    integrations: ['Shopify', 'Trendyol', 'Hepsiburada', 'AR Viewer'],
    features: [
      'Ürün Yönetimi',
      'AR/VR Deneyimi',
      'Görsel Otomasyon',
      'AI Analytics',
    ],
  },
  {
    id: 'spor-market',
    name: 'Spor Market',
    industry: 'E-ticaret - Spor Ekipmanları',
    description:
      'Spor giyim ve ekipmanları. Fitness, koşu, outdoor kategorilerinde uzman.',
    logo: '⚽',
    website: 'spormarket.com',
    foundedYear: 2017,
    employeeCount: '15-20',
    monthlyRevenue: '₺380,000',
    integrations: [
      'Shopify',
      'Trendyol',
      'N11',
      'Instagram Shopping',
      'Facebook Marketplace',
    ],
    features: ['Marketplace Sync', 'Chat Otomasyonu', 'Sosyal Medya Yönetimi'],
  },
];

export function getCompanyById(id: string): DemoCompany | undefined {
  return demoCompanies.find(c => c.id === id);
}

export function getCompaniesByIndustry(industry: string): DemoCompany[] {
  return demoCompanies.filter(c => c.industry.includes(industry));
}
