/**
 * TemplateSelector Component
 * Modal for selecting and loading workflow templates
 */

import React, { useState, useEffect } from 'react';
import { WorkflowTemplate } from '../../../../../domain/entities/WorkflowTemplate';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: WorkflowTemplate) => void;
}

export default function TemplateSelector({
  isOpen,
  onClose,
  onLoadTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Mock templates data
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTemplates: WorkflowTemplate[] = [
          new WorkflowTemplate(
            '1',
            'E-posta Kampanyası',
            'Müşterilere otomatik e-posta kampanyası gönderir',
            { nodes: [], connections: {} },
            {
              category: 'marketing',
              tags: ['email', 'campaign', 'automation'],
              difficulty: 'beginner',
              estimatedTime: 15,
              author: 'Otoniq Team',
              version: '1.0.0',
              description: "Basit e-posta kampanyası workflow'u",
            },
            {
              downloads: 150,
              likes: 25,
              rating: 4.5,
              usageCount: 45,
            },
            true,
            'otoniq-team',
            new Date(),
            new Date()
          ),
          new WorkflowTemplate(
            '2',
            'Sosyal Medya Otomasyonu',
            "Facebook, Twitter ve Instagram'a otomatik post gönderir",
            { nodes: [], connections: {} },
            {
              category: 'social-media',
              tags: ['social', 'automation', 'posting'],
              difficulty: 'intermediate',
              estimatedTime: 30,
              author: 'Otoniq Team',
              version: '1.2.0',
              description: 'Çoklu platform sosyal medya otomasyonu',
            },
            {
              downloads: 89,
              likes: 18,
              rating: 4.2,
              usageCount: 32,
            },
            true,
            'otoniq-team',
            new Date(),
            new Date()
          ),
          new WorkflowTemplate(
            '3',
            'Stok Takip Sistemi',
            'Düşük stok uyarıları ve otomatik sipariş oluşturma',
            { nodes: [], connections: {} },
            {
              category: 'inventory',
              tags: ['inventory', 'stock', 'alerts'],
              difficulty: 'advanced',
              estimatedTime: 45,
              author: 'Otoniq Team',
              version: '2.0.0',
              description: "Gelişmiş stok yönetimi workflow'u",
            },
            {
              downloads: 67,
              likes: 12,
              rating: 4.8,
              usageCount: 28,
            },
            true,
            'otoniq-team',
            new Date(),
            new Date()
          ),
        ];
        setTemplates(mockTemplates);
        setLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.matchesSearch(searchQuery);
    const matchesCategory = template.matchesCategory(selectedCategory);
    const matchesDifficulty = template.matchesDifficulty(selectedDifficulty);

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Handle template selection
  const handleSelectTemplate = (template: WorkflowTemplate) => {
    onLoadTemplate(template);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-white/10'>
          <div>
            <h2 className='text-2xl font-bold text-white'>Template Seçici</h2>
            <p className='text-gray-300 mt-1'>
              Hazır workflow şablonlarını yükleyin
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-2xl'></i>
          </button>
        </div>

        {/* Filters */}
        <div className='p-6 border-b border-white/10'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Search */}
            <div>
              <label className='block text-gray-300 text-sm mb-2'>Ara</label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Template ara...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pl-10 text-white text-sm focus:outline-none focus:border-blue-400'
                />
                <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className='block text-gray-300 text-sm mb-2'>
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              >
                <option value='all'>Tüm Kategoriler</option>
                <option value='marketing'>Marketing</option>
                <option value='social-media'>Sosyal Medya</option>
                <option value='inventory'>Envanter</option>
                <option value='analytics'>Analitik</option>
                <option value='customer-service'>Müşteri Hizmetleri</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className='block text-gray-300 text-sm mb-2'>Zorluk</label>
              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              >
                <option value='all'>Tüm Seviyeler</option>
                <option value='beginner'>Başlangıç</option>
                <option value='intermediate'>Orta</option>
                <option value='advanced'>İleri</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-96'>
          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4'></div>
                <p className='text-gray-400'>Template\'ler yükleniyor...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
                <i className='ri-search-line text-gray-400 text-2xl'></i>
              </div>
              <p className='text-gray-400 text-lg mb-2'>Template bulunamadı</p>
              <p className='text-gray-500 text-sm'>Farklı filtreler deneyin</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className='bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group'
                  onClick={() => handleSelectTemplate(template)}
                >
                  {/* Template Header */}
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex-1'>
                      <h3 className='text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors'>
                        {template.getDisplayName()}
                      </h3>
                      <p className='text-gray-400 text-sm line-clamp-2'>
                        {template.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 ml-3'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${template.getDifficultyColor()}-500/20 text-${template.getDifficultyColor()}-400`}
                      >
                        {template.getDifficulty()}
                      </span>
                      {template.isPopular() && (
                        <span className='px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400'>
                          Popüler
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Template Stats */}
                  <div className='flex items-center gap-4 text-sm text-gray-400 mb-3'>
                    <div className='flex items-center gap-1'>
                      <i className='ri-download-line'></i>
                      <span>{template.getDownloadCount()}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <i className='ri-heart-line'></i>
                      <span>{template.getLikeCount()}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <i className='ri-star-line'></i>
                      <span>{template.getRatingStars()}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <i className='ri-time-line'></i>
                      <span>{template.getEstimatedTime()}</span>
                    </div>
                  </div>

                  {/* Template Tags */}
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {template
                      .getTags()
                      .slice(0, 3)
                      .map(tag => (
                        <span
                          key={tag}
                          className='px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs'
                        >
                          {tag}
                        </span>
                      ))}
                    {template.getTags().length > 3 && (
                      <span className='px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs'>
                        +{template.getTags().length - 3}
                      </span>
                    )}
                  </div>

                  {/* Template Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='text-xs text-gray-500'>
                      {template.metadata.author} • v{template.metadata.version}
                    </div>
                    <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-1 rounded text-sm font-medium transition-colors'>
                      <i className='ri-download-line mr-1'></i>
                      Yükle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-white/10'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-400'>
              {filteredTemplates.length} template bulundu
            </div>
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                className='bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
