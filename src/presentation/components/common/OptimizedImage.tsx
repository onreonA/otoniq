/**
 * OptimizedImage Component
 * Lazy loading images with blur placeholder
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  aspectRatio?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23282c34" width="400" height="400"/%3E%3C/svg%3E',
  aspectRatio = '1/1',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio }}>
      {/* Placeholder */}
      {!isLoaded && !error && (
        <div className='absolute inset-0 bg-gray-800 animate-pulse' />
      )}

      {/* Main Image */}
      {!error && (
        <motion.img
          src={src}
          alt={alt}
          className='w-full h-full object-cover'
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          loading='lazy'
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      )}

      {/* Error State */}
      {error && (
        <div className='absolute inset-0 bg-gray-800 flex items-center justify-center'>
          <div className='text-gray-500 text-center p-4'>
            <i className='ri-image-line text-4xl mb-2'></i>
            <p className='text-xs'>Görsel yüklenemedi</p>
          </div>
        </div>
      )}
    </div>
  );
}

