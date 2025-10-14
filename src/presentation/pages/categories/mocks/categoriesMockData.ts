/**
 * Mock data for Categories Management
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  productCount: number;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
  avgProductsPerCategory: number;
}

export const mockCategoryStats: CategoryStats = {
  totalCategories: 24,
  activeCategories: 22,
  totalProducts: 1247,
  avgProductsPerCategory: 52,
};

export const mockCategories: Category[] = [
  {
    id: 'cat_001',
    name: 'Elektronik',
    slug: 'elektronik',
    parentId: null,
    description: 'Tüm elektronik ürünler',
    productCount: 458,
    isActive: true,
    displayOrder: 1,
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    children: [
      {
        id: 'cat_002',
        name: 'Bilgisayar & Tablet',
        slug: 'bilgisayar-tablet',
        parentId: 'cat_001',
        description: 'Dizüstü, masaüstü ve tablet bilgisayarlar',
        productCount: 178,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
        children: [
          {
            id: 'cat_003',
            name: 'Dizüstü Bilgisayar',
            slug: 'dizustu-bilgisayar',
            parentId: 'cat_002',
            description: 'Laptop ve notebook modelleri',
            productCount: 89,
            isActive: true,
            displayOrder: 1,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
          {
            id: 'cat_004',
            name: 'Masaüstü Bilgisayar',
            slug: 'masaustu-bilgisayar',
            parentId: 'cat_002',
            description: 'Desktop PC sistemleri',
            productCount: 52,
            isActive: true,
            displayOrder: 2,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
          {
            id: 'cat_005',
            name: 'Tablet',
            slug: 'tablet',
            parentId: 'cat_002',
            description: 'iPad ve Android tabletler',
            productCount: 37,
            isActive: true,
            displayOrder: 3,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
        ],
      },
      {
        id: 'cat_006',
        name: 'Telefon & Aksesuar',
        slug: 'telefon-aksesuar',
        parentId: 'cat_001',
        description: 'Akıllı telefonlar ve aksesuarları',
        productCount: 156,
        isActive: true,
        displayOrder: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
        children: [
          {
            id: 'cat_007',
            name: 'Akıllı Telefon',
            slug: 'akilli-telefon',
            parentId: 'cat_006',
            description: 'Smartphone modelleri',
            productCount: 98,
            isActive: true,
            displayOrder: 1,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
          {
            id: 'cat_008',
            name: 'Telefon Kılıfı',
            slug: 'telefon-kilifi',
            parentId: 'cat_006',
            description: 'Koruyucu kılıflar',
            productCount: 38,
            isActive: true,
            displayOrder: 2,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
          {
            id: 'cat_009',
            name: 'Şarj Cihazları',
            slug: 'sarj-cihazlari',
            parentId: 'cat_006',
            description: 'Şarj aleti ve powerbank',
            productCount: 20,
            isActive: true,
            displayOrder: 3,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-12-20'),
          },
        ],
      },
      {
        id: 'cat_010',
        name: 'Ses & Görüntü',
        slug: 'ses-goruntu',
        parentId: 'cat_001',
        description: 'Kulaklık, hoparlör ve kamera',
        productCount: 124,
        isActive: true,
        displayOrder: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
    ],
  },
  {
    id: 'cat_011',
    name: 'Moda & Giyim',
    slug: 'moda-giyim',
    parentId: null,
    description: 'Kadın, erkek ve çocuk giyim',
    productCount: 342,
    isActive: true,
    displayOrder: 2,
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    children: [
      {
        id: 'cat_012',
        name: 'Kadın Giyim',
        slug: 'kadin-giyim',
        parentId: 'cat_011',
        description: 'Kadın kıyafetleri',
        productCount: 156,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_013',
        name: 'Erkek Giyim',
        slug: 'erkek-giyim',
        parentId: 'cat_011',
        description: 'Erkek kıyafetleri',
        productCount: 128,
        isActive: true,
        displayOrder: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_014',
        name: 'Çocuk Giyim',
        slug: 'cocuk-giyim',
        parentId: 'cat_011',
        description: 'Çocuk kıyafetleri',
        productCount: 58,
        isActive: true,
        displayOrder: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
    ],
  },
  {
    id: 'cat_015',
    name: 'Ev & Yaşam',
    slug: 'ev-yasam',
    parentId: null,
    description: 'Ev dekorasyonu ve yaşam ürünleri',
    productCount: 267,
    isActive: true,
    displayOrder: 3,
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    children: [
      {
        id: 'cat_016',
        name: 'Mobilya',
        slug: 'mobilya',
        parentId: 'cat_015',
        description: 'Ev mobilyaları',
        productCount: 102,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_017',
        name: 'Dekorasyon',
        slug: 'dekorasyon',
        parentId: 'cat_015',
        description: 'Dekoratif ürünler',
        productCount: 89,
        isActive: true,
        displayOrder: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_018',
        name: 'Mutfak',
        slug: 'mutfak',
        parentId: 'cat_015',
        description: 'Mutfak eşyaları',
        productCount: 76,
        isActive: true,
        displayOrder: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
    ],
  },
  {
    id: 'cat_019',
    name: 'Spor & Outdoor',
    slug: 'spor-outdoor',
    parentId: null,
    description: 'Spor ve açık hava ürünleri',
    productCount: 180,
    isActive: true,
    displayOrder: 4,
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    children: [
      {
        id: 'cat_020',
        name: 'Fitness',
        slug: 'fitness',
        parentId: 'cat_019',
        description: 'Fitness ekipmanları',
        productCount: 87,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_021',
        name: 'Kamp & Doğa',
        slug: 'kamp-doga',
        parentId: 'cat_019',
        description: 'Kamp malzemeleri',
        productCount: 52,
        isActive: true,
        displayOrder: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
      {
        id: 'cat_022',
        name: 'Bisiklet',
        slug: 'bisiklet',
        parentId: 'cat_019',
        description: 'Bisiklet ve aksesuarları',
        productCount: 41,
        isActive: true,
        displayOrder: 3,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-12-20'),
      },
    ],
  },
  {
    id: 'cat_023',
    name: 'Kitap & Kırtasiye',
    slug: 'kitap-kirtasiye',
    parentId: null,
    description: 'Kitaplar ve kırtasiye ürünleri',
    productCount: 0,
    isActive: false,
    displayOrder: 5,
    imageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
  },
];

/**
 * Get category by ID (including nested children)
 */
export const getCategoryById = (
  id: string,
  categories: Category[] = mockCategories
): Category | null => {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.children) {
      const found = getCategoryById(id, category.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get category breadcrumb path
 */
export const getCategoryBreadcrumb = (
  id: string,
  categories: Category[] = mockCategories
): Category[] => {
  const path: Category[] = [];

  const findPath = (
    targetId: string,
    cats: Category[],
    currentPath: Category[]
  ): boolean => {
    for (const cat of cats) {
      const newPath = [...currentPath, cat];
      if (cat.id === targetId) {
        path.push(...newPath);
        return true;
      }
      if (cat.children && findPath(targetId, cat.children, newPath)) {
        return true;
      }
    }
    return false;
  };

  findPath(id, categories, []);
  return path;
};

/**
 * Flatten category tree
 */
export const flattenCategories = (
  categories: Category[] = mockCategories
): Category[] => {
  const flattened: Category[] = [];

  const flatten = (cats: Category[]) => {
    for (const cat of cats) {
      flattened.push(cat);
      if (cat.children) {
        flatten(cat.children);
      }
    }
  };

  flatten(categories);
  return flattened;
};

/**
 * Get status color classes
 */
export const getCategoryStatusColor = (isActive: boolean): string => {
  return isActive
    ? 'bg-green-100 text-green-800 border-green-300'
    : 'bg-gray-100 text-gray-800 border-gray-300';
};
