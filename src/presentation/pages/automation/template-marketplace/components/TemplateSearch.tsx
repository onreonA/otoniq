/**
 * TemplateSearch Component
 * Search input for templates
 */

import React, { useState } from 'react';

interface TemplateSearchProps {
  onSearch: (query: string) => void;
}

export default function TemplateSearch({ onSearch }: TemplateSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div>
      <h3 className='text-white font-semibold mb-3'>Template Ara</h3>
      <form onSubmit={handleSubmit} className='relative'>
        <input
          type='text'
          placeholder='Template ara...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 pl-10 text-white text-sm focus:outline-none focus:border-blue-400'
        />
        <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
        {query && (
          <button
            type='button'
            onClick={handleClear}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line'></i>
          </button>
        )}
      </form>
    </div>
  );
}
