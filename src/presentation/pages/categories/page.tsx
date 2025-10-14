import { useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  mockCategories,
  mockCategoryStats,
  getCategoryStatusColor,
  type Category,
} from './mocks/categoriesMockData';
import { MockBadge } from '../../components/common/MockBadge';

const CategoriesPage = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['cat_001', 'cat_011', 'cat_015'])
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategoryTree = (categories: Category[], level: number = 0) => {
    return categories.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <div key={category.id} className='mb-1'>
          {/* Category Row */}
          <div
            className='flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer'
            style={{ marginLeft: `${level * 24}px` }}
            onClick={() => setSelectedCategory(category)}
          >
            {/* Expand/Collapse Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                if (hasChildren) toggleCategory(category.id);
              }}
              className='p-1 hover:bg-white/10 rounded transition-colors'
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className='w-4 h-4 text-white/70' />
                ) : (
                  <ChevronRight className='w-4 h-4 text-white/70' />
                )
              ) : (
                <div className='w-4 h-4' />
              )}
            </button>

            {/* Icon */}
            <FolderTree className='w-5 h-5 text-purple-400' />

            {/* Name */}
            <span className='flex-1 text-white font-medium'>
              {category.name}
            </span>

            {/* Product Count */}
            <div className='flex items-center gap-1 text-xs text-white/60'>
              <Package className='w-3 h-3' />
              <span>{category.productCount}</span>
            </div>

            {/* Status Badge */}
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryStatusColor(category.isActive)}`}
            >
              {category.isActive ? (
                <CheckCircle className='w-3 h-3 inline mr-1' />
              ) : (
                <XCircle className='w-3 h-3 inline mr-1' />
              )}
              {category.isActive ? 'Aktif' : 'Pasif'}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-1'>
              <button className='p-2 hover:bg-blue-500/20 rounded transition-colors'>
                <Edit2 className='w-4 h-4 text-blue-400' />
              </button>
              <button className='p-2 hover:bg-red-500/20 rounded transition-colors'>
                <Trash2 className='w-4 h-4 text-red-400' />
              </button>
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className='mt-1'>
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Mock Badge */}
      <MockBadge storageKey='mock-badge-categories' />

      {/* Page Header */}
      <div className='mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>
              Kategori Yönetimi
            </h1>
            <p className='text-white/80'>
              Ürün kategorilerinizi düzenleyin ve yönetin
            </p>
          </div>
          <button className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2'>
            <Plus className='w-5 h-5' />
            Yeni Kategori
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Kategori</span>
            <FolderTree className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCategoryStats.totalCategories}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Aktif Kategori</span>
            <CheckCircle className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCategoryStats.activeCategories}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Ürün</span>
            <Package className='w-5 h-5 text-blue-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCategoryStats.totalProducts}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>
              Ortalama Ürün/Kategori
            </span>
            <TrendingUp className='w-5 h-5 text-orange-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCategoryStats.avgProductsPerCategory}
          </p>
        </div>
      </div>

      {/* Category Tree */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h2 className='text-xl font-bold text-white mb-4'>Kategori Ağacı</h2>
        <div className='space-y-1'>{renderCategoryTree(mockCategories)}</div>
      </div>

      {/* Selected Category Detail (Simple Modal-like) */}
      {selectedCategory && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-lg w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-white'>
                {selectedCategory.name}
              </h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className='text-white/60 hover:text-white'
              >
                ✕
              </button>
            </div>
            <div className='space-y-3 text-sm'>
              <div>
                <span className='text-white/60'>Slug:</span>
                <p className='text-white font-medium'>
                  {selectedCategory.slug}
                </p>
              </div>
              <div>
                <span className='text-white/60'>Açıklama:</span>
                <p className='text-white font-medium'>
                  {selectedCategory.description}
                </p>
              </div>
              <div>
                <span className='text-white/60'>Ürün Sayısı:</span>
                <p className='text-white font-medium'>
                  {selectedCategory.productCount}
                </p>
              </div>
              <div>
                <span className='text-white/60'>Durum:</span>
                <p className='text-white font-medium'>
                  {selectedCategory.isActive ? 'Aktif' : 'Pasif'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
