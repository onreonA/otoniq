/**
 * NodeLibrary Component
 * Sidebar with draggable workflow nodes
 */

import React, { useState } from 'react';

interface NodeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  nodes: {
    type: string;
    name: string;
    icon: string;
    description: string;
  }[];
}

interface NodeLibraryProps {
  categories: NodeCategory[];
  onAddNode: (nodeType: string, nodeName: string) => void;
}

export default function NodeLibrary({
  categories,
  onAddNode,
}: NodeLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['triggers', 'actions'])
  );

  // Filter categories based on search and selection
  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      searchQuery === '' ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.nodes.some(
        node =>
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || category.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Toggle category expansion
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

  // Handle node drag start
  const handleNodeDragStart = (
    nodeType: string,
    nodeName: string,
    event: React.DragEvent
  ) => {
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: nodeType,
        name: nodeName,
      })
    );
    event.dataTransfer.effectAllowed = 'copy';
  };

  // Handle node click (alternative to drag)
  const handleNodeClick = (nodeType: string, nodeName: string) => {
    onAddNode(nodeType, nodeName);
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-white/10'>
        <h3 className='text-lg font-semibold text-white mb-3'>
          Node Kütüphanesi
        </h3>

        {/* Search */}
        <div className='relative mb-3'>
          <input
            type='text'
            placeholder='Node ara...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
          />
          <i className='ri-search-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
        >
          <option value='all'>Tüm Kategoriler</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div className='flex-1 overflow-y-auto'>
        {filteredCategories.map(category => (
          <div
            key={category.id}
            className='border-b border-white/10 last:border-b-0'
          >
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className='w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors'
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 rounded-lg bg-${category.color}-500/20 flex items-center justify-center`}
                >
                  <i
                    className={`${category.icon} text-${category.color}-400 text-sm`}
                  ></i>
                </div>
                <div className='text-left'>
                  <h4 className='text-white font-medium'>{category.name}</h4>
                  <p className='text-gray-400 text-xs'>
                    {category.nodes.length} node
                  </p>
                </div>
              </div>
              <i
                className={`ri-arrow-down-s-line text-gray-400 transition-transform ${
                  expandedCategories.has(category.id) ? 'rotate-180' : ''
                }`}
              ></i>
            </button>

            {/* Category Nodes */}
            {expandedCategories.has(category.id) && (
              <div className='px-4 pb-4 space-y-2'>
                {category.nodes.map(node => (
                  <div
                    key={node.type}
                    className='bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer group'
                    draggable
                    onDragStart={e =>
                      handleNodeDragStart(node.type, node.name, e)
                    }
                    onClick={() => handleNodeClick(node.type, node.name)}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-6 h-6 rounded bg-${category.color}-500/20 flex items-center justify-center flex-shrink-0`}
                      >
                        <i
                          className={`${node.icon} text-${category.color}-400 text-xs`}
                        ></i>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h5 className='text-white font-medium text-sm group-hover:text-blue-400 transition-colors'>
                          {node.name}
                        </h5>
                        <p className='text-gray-400 text-xs mt-1 line-clamp-2'>
                          {node.description}
                        </p>
                      </div>
                      <i className='ri-drag-drop-line text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity'></i>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className='p-8 text-center'>
            <div className='w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3'>
              <i className='ri-search-line text-gray-400 text-xl'></i>
            </div>
            <p className='text-gray-400 text-sm'>
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Node bulunamadı'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-white/10'>
        <div className='text-xs text-gray-400 text-center'>
          <p className='mb-1'>💡 İpucu</p>
          <p>Node'ları sürükleyin veya tıklayın</p>
        </div>
      </div>
    </div>
  );
}
