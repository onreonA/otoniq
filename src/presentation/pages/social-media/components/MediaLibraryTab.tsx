/**
 * Media Library Tab
 * Medya kütüphanesi yönetimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  Folder,
  Image,
  Video,
  FileImage,
  Trash2,
  Download,
  Eye,
} from 'lucide-react';
import { mockMediaAssets } from '../../../mocks/socialMedia';

export default function MediaLibraryTab() {
  const [assets] = useState(mockMediaAssets);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');

  const folders = ['all', ...Array.from(new Set(assets.map(a => a.folder)))];
  const filteredAssets =
    selectedFolder === 'all'
      ? assets
      : assets.filter(a => a.folder === selectedFolder);

  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image size={40} className='text-blue-400' />;
      case 'video':
        return <Video size={40} className='text-purple-400' />;
      case 'gif':
        return <FileImage size={40} className='text-pink-400' />;
      default:
        return <FileImage size={40} className='text-gray-400' />;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Medya Kütüphanesi</h2>
          <p className='text-sm text-gray-400 mt-1'>{assets.length} dosya</p>
        </div>
        <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all'>
          <Upload size={18} />
          Dosya Yükle
        </button>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        {/* Left Sidebar - Folders */}
        <div className='col-span-3 space-y-4'>
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
            <h3 className='text-sm font-semibold text-white mb-3'>Klasörler</h3>
            <div className='space-y-1'>
              {folders.map(folder => {
                const count =
                  folder === 'all'
                    ? assets.length
                    : assets.filter(a => a.folder === folder).length;
                return (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedFolder === folder
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className='flex items-center gap-2'>
                      <Folder size={14} />
                      {folder === 'all' ? 'Tümü' : folder}
                    </span>
                    <span className='text-xs'>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
            <h3 className='text-sm font-semibold text-white mb-3'>
              İstatistikler
            </h3>
            <div className='space-y-3'>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-gray-400'>Görseller</span>
                  <span className='text-xs font-bold text-blue-400'>
                    {assets.filter(a => a.fileType === 'image').length}
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-1.5'>
                  <div
                    className='bg-blue-500 h-1.5 rounded-full'
                    style={{
                      width: `${(assets.filter(a => a.fileType === 'image').length / assets.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-xs text-gray-400'>Videolar</span>
                  <span className='text-xs font-bold text-purple-400'>
                    {assets.filter(a => a.fileType === 'video').length}
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-1.5'>
                  <div
                    className='bg-purple-500 h-1.5 rounded-full'
                    style={{
                      width: `${(assets.filter(a => a.fileType === 'video').length / assets.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Files Grid */}
        <div className='col-span-9'>
          {/* Search */}
          <div className='mb-4 relative'>
            <Search
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              placeholder='Dosya ara...'
              className='w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Files Grid */}
          <div className='grid grid-cols-3 gap-4'>
            {filteredAssets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all group'
              >
                {/* Preview Area */}
                <div className='aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative'>
                  <div className='text-6xl'>{asset.thumbnail}</div>

                  {/* Hover Actions */}
                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2'>
                    <button className='p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all'>
                      <Eye size={18} />
                    </button>
                    <button className='p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all'>
                      <Download size={18} />
                    </button>
                    <button className='p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all'>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* File Info */}
                <div className='p-3'>
                  <h4 className='text-sm font-medium text-white truncate mb-1'>
                    {asset.fileName}
                  </h4>
                  <div className='flex items-center justify-between text-xs text-gray-400'>
                    <span className='capitalize'>{asset.fileType}</span>
                    <span>{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className='flex items-center gap-1 mt-2'>
                    {asset.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
