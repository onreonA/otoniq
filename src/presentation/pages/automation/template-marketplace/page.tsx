/**
 * Template Marketplace Page
 * Community-driven template sharing and discovery
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  templateMarketplaceService,
  TemplateSearchFilters,
} from '../../../../infrastructure/services/TemplateMarketplaceService';
import { WorkflowTemplate } from '../../../../domain/entities/WorkflowTemplate';
import TemplateCard from './components/TemplateCard';
import TemplateFilters from './components/TemplateFilters';
import TemplateSearch from './components/TemplateSearch';
import TemplateCategories from './components/TemplateCategories';
import TemplateStats from './components/TemplateStats';

export default function TemplateMarketplacePage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TemplateSearchFilters>({
    sortBy: 'popular',
    limit: 20,
    offset: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Load templates
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const searchFilters: TemplateSearchFilters = {
        ...filters,
        query: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty:
          selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
      };

      const result =
        await templateMarketplaceService.searchTemplates(searchFilters);
      setTemplates(result.templates);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Load templates error:', error);
      toast.error("Template'ler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Load templates on mount and filter changes
  useEffect(() => {
    loadTemplates();
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    filters.sortBy,
    currentPage,
  ]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Handle difficulty change
  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy: sortBy as any }));
    setCurrentPage(1);
  };

  // Handle template download
  const handleDownloadTemplate = async (templateId: string) => {
    try {
      // TODO: Get current user ID from auth store
      const userId = 'current-user-id'; // This should come from auth store
      await templateMarketplaceService.downloadTemplate(templateId, userId);
      toast.success('Template indirildi');
      loadTemplates(); // Refresh to update stats
    } catch (error) {
      console.error('Download template error:', error);
      toast.error('Template indirilemedi');
    }
  };

  // Handle template like
  const handleLikeTemplate = async (templateId: string) => {
    try {
      // TODO: Get current user ID from auth store
      const userId = 'current-user-id'; // This should come from auth store
      const isLiked = await templateMarketplaceService.toggleTemplateLike(
        templateId,
        userId
      );
      toast.success(isLiked ? 'Beğenildi' : 'Beğeni kaldırıldı');
      loadTemplates(); // Refresh to update stats
    } catch (error) {
      console.error('Like template error:', error);
      toast.error('Beğeni işlemi başarısız');
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, offset: (page - 1) * (prev.limit || 20) }));
  };

  const totalPages = Math.ceil(totalCount / (filters.limit || 20));

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Header */}
      <div className='bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                to='/automation'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Template Marketplace
                </h1>
                <p className='text-gray-300 mt-1'>
                  Community-driven workflow templates
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                <i className='ri-filter-line mr-2'></i>
                Filtreler
              </button>
              <Link
                to='/automation/workflow-builder'
                className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                <i className='ri-add-line mr-2'></i>
                Yeni Template
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Search */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
              <TemplateSearch onSearch={handleSearch} />
            </div>

            {/* Categories */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
              <TemplateCategories
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Stats */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
              <TemplateStats />
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            {/* Filters Bar */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6'>
              <TemplateFilters
                selectedDifficulty={selectedDifficulty}
                sortBy={filters.sortBy || 'popular'}
                onDifficultyChange={handleDifficultyChange}
                onSortChange={handleSortChange}
                totalCount={totalCount}
              />
            </div>

            {/* Templates Grid */}
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4'></div>
                  <p className='text-gray-400'>Template'ler yükleniyor...</p>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <i className='ri-search-line text-gray-400 text-2xl'></i>
                </div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Template bulunamadı
                </h3>
                <p className='text-gray-400 mb-4'>
                  Arama kriterlerinizi değiştirerek tekrar deneyin
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                    setFilters({ sortBy: 'popular', limit: 20, offset: 0 });
                  }}
                  className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <>
                {/* Templates Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8'>
                  {templates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onDownload={handleDownloadTemplate}
                      onLike={handleLikeTemplate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <i className='ri-arrow-left-line'></i>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className='bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <i className='ri-arrow-right-line'></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
