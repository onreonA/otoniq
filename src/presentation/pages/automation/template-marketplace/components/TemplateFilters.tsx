/**
 * TemplateFilters Component
 * Filter and sort options for templates
 */

import React from 'react';

interface TemplateFiltersProps {
  selectedDifficulty: string;
  sortBy: string;
  onDifficultyChange: (difficulty: string) => void;
  onSortChange: (sortBy: string) => void;
  totalCount: number;
}

export default function TemplateFilters({
  selectedDifficulty,
  sortBy,
  onDifficultyChange,
  onSortChange,
  totalCount,
}: TemplateFiltersProps) {
  return (
    <div className='flex items-center justify-between'>
      {/* Results Count */}
      <div className='text-gray-300 text-sm'>
        <span className='font-medium'>{totalCount}</span> template bulundu
      </div>

      {/* Filters */}
      <div className='flex items-center gap-4'>
        {/* Difficulty Filter */}
        <div className='flex items-center gap-2'>
          <label className='text-gray-300 text-sm font-medium'>Zorluk:</label>
          <select
            value={selectedDifficulty}
            onChange={e => onDifficultyChange(e.target.value)}
            className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
          >
            <option value='all'>Tüm Seviyeler</option>
            <option value='beginner'>Başlangıç</option>
            <option value='intermediate'>Orta</option>
            <option value='advanced'>İleri</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className='flex items-center gap-2'>
          <label className='text-gray-300 text-sm font-medium'>Sırala:</label>
          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value)}
            className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
          >
            <option value='popular'>Popüler</option>
            <option value='trending'>Trend</option>
            <option value='newest'>En Yeni</option>
            <option value='rating'>En Yüksek Puan</option>
            <option value='name'>İsim</option>
          </select>
        </div>
      </div>
    </div>
  );
}
