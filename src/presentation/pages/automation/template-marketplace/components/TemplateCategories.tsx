/**
 * TemplateCategories Component
 * Category filter for templates
 */

import React, { useState, useEffect } from 'react';
import { templateMarketplaceService } from '../../../../../infrastructure/services/TemplateMarketplaceService';

interface TemplateCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function TemplateCategories({
  selectedCategory,
  onCategoryChange,
}: TemplateCategoriesProps) {
  const [categories, setCategories] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      icon?: string;
      color?: string;
      templateCount: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await templateMarketplaceService.getTemplateCategories();
      setCategories(data);
    } catch (error) {
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className='text-white font-semibold mb-3'>Kategoriler</h3>
        <div className='space-y-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-8 bg-white/10 rounded-lg'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className='text-white font-semibold mb-3'>Kategoriler</h3>
      <div className='space-y-2'>
        {/* All Categories */}
        <button
          onClick={() => onCategoryChange('all')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
          }`}
        >
          <div className='flex items-center gap-3'>
            <div className='w-6 h-6 rounded bg-gray-500/20 flex items-center justify-center'>
              <i className='ri-grid-line text-gray-400 text-sm'></i>
            </div>
            <span className='font-medium'>Tüm Kategoriler</span>
          </div>
          <span className='text-xs text-gray-400'>
            {/* Total count would go here */}
          </span>
        </button>

        {/* Category List */}
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name.toLowerCase())}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              selectedCategory === category.name.toLowerCase()
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
            }`}
          >
            <div className='flex items-center gap-3'>
              <div
                className={`w-6 h-6 rounded bg-${category.color || 'gray'}-500/20 flex items-center justify-center`}
              >
                <i
                  className={`${category.icon || 'ri-folder-line'} text-${category.color || 'gray'}-400 text-sm`}
                ></i>
              </div>
              <div className='text-left'>
                <span className='font-medium'>{category.name}</span>
                {category.description && (
                  <p className='text-xs text-gray-400'>
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            <span className='text-xs text-gray-400'>
              {category.templateCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
