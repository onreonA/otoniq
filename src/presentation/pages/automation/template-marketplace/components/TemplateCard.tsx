/**
 * TemplateCard Component
 * Individual template card with actions
 */

import React, { useState } from 'react';
import { WorkflowTemplate } from '../../../../../domain/entities/WorkflowTemplate';

interface TemplateCardProps {
  template: WorkflowTemplate;
  onDownload: (templateId: string) => void;
  onLike: (templateId: string) => void;
}

export default function TemplateCard({
  template,
  onDownload,
  onLike,
}: TemplateCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(template.id);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle like
  const handleLike = async () => {
    try {
      await onLike(template.id);
      setIsLiked(!isLiked);
    } catch (error) {
      // Revert like state on error
      setIsLiked(isLiked);
    }
  };

  return (
    <div className='bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group'>
      {/* Template Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <h3 className='text-white font-semibold text-lg group-hover:text-blue-400 transition-colors'>
              {template.name}
            </h3>
            {template.isFeatured && (
              <span className='px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium'>
                Popüler
              </span>
            )}
            {template.isVerified && (
              <span className='px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium'>
                Doğrulanmış
              </span>
            )}
          </div>
          <p className='text-gray-400 text-sm line-clamp-2'>
            {template.description}
          </p>
        </div>
        <div className='flex items-center gap-2 ml-4'>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              template.difficulty === 'beginner'
                ? 'bg-green-500/20 text-green-400'
                : template.difficulty === 'intermediate'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {template.difficulty}
          </span>
        </div>
      </div>

      {/* Template Preview */}
      {template.preview && (
        <div className='mb-4 rounded-lg overflow-hidden bg-gray-800'>
          <img
            src={template.preview}
            alt={template.name}
            className='w-full h-32 object-cover'
          />
        </div>
      )}

      {/* Template Stats */}
      <div className='flex items-center gap-4 text-sm text-gray-400 mb-4'>
        <div className='flex items-center gap-1'>
          <i className='ri-download-line'></i>
          <span>{template.stats.downloads}</span>
        </div>
        <div className='flex items-center gap-1'>
          <i className='ri-heart-line'></i>
          <span>{template.stats.likes}</span>
        </div>
        <div className='flex items-center gap-1'>
          <i className='ri-star-line'></i>
          <span>{template.stats.rating}</span>
        </div>
        <div className='flex items-center gap-1'>
          <i className='ri-time-line'></i>
          <span>{template.metadata?.estimatedTime || 30} dk</span>
        </div>
      </div>

      {/* Template Tags */}
      <div className='flex flex-wrap gap-1 mb-4'>
        {template.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className='px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs'
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className='px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs'>
            +{template.tags.length - 3}
          </span>
        )}
      </div>

      {/* Template Author */}
      <div className='flex items-center gap-2 mb-4'>
        <div className='w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center'>
          <i className='ri-user-line text-gray-400 text-xs'></i>
        </div>
        <span className='text-gray-400 text-sm'>{template.authorName}</span>
        <span className='text-gray-500 text-xs'>•</span>
        <span className='text-gray-500 text-xs'>v1.0.0</span>
      </div>

      {/* Template Actions */}
      <div className='flex items-center gap-2'>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className='flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isDownloading ? (
            <>
              <i className='ri-loader-4-line animate-spin mr-2'></i>
              İndiriliyor...
            </>
          ) : (
            <>
              <i className='ri-download-line mr-2'></i>
              İndir
            </>
          )}
        </button>
        <button
          onClick={handleLike}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isLiked
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
          }`}
        >
          <i className={`${isLiked ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
        </button>
        <button className='px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-colors'>
          <i className='ri-share-line'></i>
        </button>
      </div>

      {/* Template Footer */}
      <div className='mt-4 pt-4 border-t border-white/10'>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>{template.category}</span>
          <span>
            {new Date(template.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>
    </div>
  );
}
