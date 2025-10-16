/**
 * Manual Upload Tab
 * Upload images and edit them
 */

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ManualUploadTab() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      setUploadedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} görsel yüklendi!`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      toast.success(`${files.length} görsel yüklendi!`);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-white/20 bg-black/20'
        } backdrop-blur-sm`}
      >
        <input
          type='file'
          multiple
          accept='image/*'
          onChange={handleFileInput}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        <div className='pointer-events-none'>
          <div className='w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center'>
            <i className='ri-upload-cloud-line text-white text-4xl'></i>
          </div>
          <h3 className='text-xl font-semibold text-white mb-2'>
            Görselleri Sürükle & Bırak
          </h3>
          <p className='text-gray-400 mb-4'>ya da dosya seçmek için tıklayın</p>
          <p className='text-sm text-gray-500'>
            PNG, JPG, WebP desteklenir (Maks. 10MB)
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-white'>
              📁 Yüklenen Görseller ({uploadedFiles.length})
            </h3>
            <button
              onClick={() => {
                setUploadedFiles([]);
                toast.success('Tüm görseller temizlendi');
              }}
              className='px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-all duration-300'
            >
              Tümünü Temizle
            </button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className='relative bg-white/10 rounded-xl p-3 hover:scale-105 transition-all duration-300'
              >
                <div className='aspect-square bg-white/5 rounded-lg mb-2 flex items-center justify-center'>
                  <i className='ri-image-line text-4xl text-gray-400'></i>
                </div>
                <p className='text-xs text-gray-300 truncate'>{file.name}</p>
                <p className='text-xs text-gray-500'>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={() =>
                    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
                  }
                  className='absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300'
                >
                  <i className='ri-close-line text-white text-sm'></i>
                </button>
              </div>
            ))}
          </div>

          <div className='mt-6 flex gap-3'>
            <button
              onClick={() => toast.info('Düzenleme özelliği yakında!')}
              className='flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/15 transition-all duration-300'
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={() => toast.info('Toplu işleme özelliği yakında!')}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300'
            >
              🚀 Toplu İşle
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[
          {
            icon: 'ri-crop-line',
            label: 'Kırp & Boyutlandır',
            color: 'from-blue-600/20 to-cyan-600/20',
          },
          {
            icon: 'ri-contrast-line',
            label: 'Filtreler',
            color: 'from-purple-600/20 to-pink-600/20',
          },
          {
            icon: 'ri-text',
            label: 'Metin Ekle',
            color: 'from-green-600/20 to-emerald-600/20',
          },
          {
            icon: 'ri-water-percent-line',
            label: 'Watermark',
            color: 'from-orange-600/20 to-amber-600/20',
          },
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => toast.info(`${action.label} özelliği yakında!`)}
            className={`bg-gradient-to-br ${action.color} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300`}
          >
            <i className={`${action.icon} text-3xl text-white mb-2 block`}></i>
            <p className='text-sm font-medium text-white'>{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
