import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  className = '',
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Handle files
  const handleFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maksimum ${maxImages} resim yükleyebilirsiniz`);
      return;
    }

    setUploading(true);

    try {
      const newImages: string[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} geçerli bir resim dosyası değil`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} çok büyük (maksimum 5MB)`);
          continue;
        }

        // Convert to base64 for now (in production, upload to cloud storage)
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} resim yüklendi`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Resimler yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  // Move image up
  const moveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      onImagesChange(newImages);
    }
  };

  // Move image down
  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      onImagesChange(newImages);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type='file'
          multiple
          accept='image/*'
          onChange={handleFileInputChange}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />

        <div className='space-y-4'>
          <div className='text-6xl text-gray-400'>
            <i className='ri-image-add-line'></i>
          </div>
          <div>
            <p className='text-lg font-medium text-white'>
              Resimleri buraya sürükleyin veya tıklayın
            </p>
            <p className='text-sm text-gray-400 mt-1'>
              PNG, JPG, GIF formatları desteklenir (maksimum 5MB)
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              {images.length}/{maxImages} resim yüklendi
            </p>
          </div>
          {uploading && (
            <div className='flex items-center justify-center'>
              <div className='w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
              <span className='ml-2 text-blue-400'>Yükleniyor...</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className='space-y-4'>
          <h4 className='text-white font-medium'>Yüklenen Resimler</h4>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {images.map((image, index) => (
              <div key={index} className='relative group'>
                <div className='aspect-square rounded-lg overflow-hidden bg-gray-700'>
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className='absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded'>
                    Ana Resim
                  </div>
                )}

                {/* Controls */}
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2'>
                  <button
                    onClick={() => moveImageUp(index)}
                    disabled={index === 0}
                    className='bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors'
                    title='Yukarı taşı'
                  >
                    <i className='ri-arrow-up-line'></i>
                  </button>
                  <button
                    onClick={() => moveImageDown(index)}
                    disabled={index === images.length - 1}
                    className='bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors'
                    title='Aşağı taşı'
                  >
                    <i className='ri-arrow-down-line'></i>
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className='bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors'
                    title='Sil'
                  >
                    <i className='ri-delete-bin-line'></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
