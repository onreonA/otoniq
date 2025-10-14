/**
 * Product 3D Viewer Component
 * Interactive 3D product visualization with rotation, zoom, and lighting controls
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  Grid3x3,
  Eye,
  Download,
  Share2,
} from 'lucide-react';
import { Product3DModel } from '../../../mocks/arVr';

interface Product3DViewerProps {
  model: Product3DModel;
  onClose?: () => void;
}

export default function Product3DViewer({
  model,
  onClose,
}: Product3DViewerProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [lighting, setLighting] = useState<'bright' | 'normal' | 'dark'>(
    'normal'
  );
  const [showGrid, setShowGrid] = useState(false);
  const [showWireframe, setShowWireframe] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Auto-rotate effect
  useEffect(() => {
    if (!isAutoRotate || isDragging) return;

    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: (prev.y + 1) % 360 }));
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoRotate, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x + deltaY * 0.5)),
      y: (prev.y + deltaX * 0.5) % 360,
    }));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleResetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
    setIsAutoRotate(true);
  };

  const getLightingClass = () => {
    switch (lighting) {
      case 'bright':
        return 'brightness-125';
      case 'dark':
        return 'brightness-75';
      default:
        return 'brightness-100';
    }
  };

  return (
    <div className='flex flex-col h-full bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-white/10'>
        <div>
          <h3 className='text-lg font-semibold text-white'>
            {model.productName}
          </h3>
          <p className='text-sm text-gray-400'>
            {model.polyCount.toLocaleString()} polygons • {model.fileSize}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
            <Download size={18} className='text-gray-300' />
          </button>
          <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
            <Share2 size={18} className='text-gray-300' />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/10 rounded-lg transition-colors'
            >
              <Maximize2 size={18} className='text-gray-300' />
            </button>
          )}
        </div>
      </div>

      {/* 3D Viewer Area */}
      <div
        ref={viewerRef}
        className='flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid Background */}
        {showGrid && (
          <div className='absolute inset-0 opacity-20'>
            <div
              className='w-full h-full'
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
        )}

        {/* 3D Model Placeholder (Emoji-based mock) */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.div
            className={`text-9xl select-none ${getLightingClass()}`}
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
              filter: showWireframe ? 'contrast(2) brightness(0.5)' : 'none',
            }}
            animate={{
              scale: [zoom, zoom * 1.02, zoom],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {model.thumbnailUrl}
          </motion.div>
        </div>

        {/* Rotation Indicator */}
        <div className='absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white'>
          <div>X: {rotation.x.toFixed(0)}°</div>
          <div>Y: {rotation.y.toFixed(0)}°</div>
          <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
        </div>

        {/* Auto-rotate indicator */}
        {isAutoRotate && (
          <motion.div
            className='absolute top-4 right-4 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2 text-xs text-blue-400'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RotateCw size={14} className='inline mr-1' />
            Otomatik Döndürme
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className='p-4 border-t border-white/10 space-y-3'>
        {/* Zoom & Rotation Controls */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleZoomOut}
              className='p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors'
              title='Uzaklaştır'
            >
              <ZoomOut size={18} className='text-gray-300' />
            </button>
            <button
              onClick={handleZoomIn}
              className='p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors'
              title='Yakınlaştır'
            >
              <ZoomIn size={18} className='text-gray-300' />
            </button>
            <button
              onClick={handleResetView}
              className='px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm text-gray-300'
            >
              Sıfırla
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`p-2 rounded-lg transition-colors ${
                isAutoRotate
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-white/5 text-gray-300'
              }`}
              title='Otomatik Döndürme'
            >
              <RotateCw size={18} />
            </button>
          </div>
        </div>

        {/* Lighting & Display Controls */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-400'>Aydınlatma:</span>
            <button
              onClick={() => setLighting('bright')}
              className={`p-2 rounded-lg transition-colors ${
                lighting === 'bright'
                  ? 'bg-yellow-600/20 text-yellow-400'
                  : 'bg-white/5 text-gray-300'
              }`}
              title='Parlak'
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setLighting('normal')}
              className={`p-2 rounded-lg transition-colors ${
                lighting === 'normal'
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'bg-white/5 text-gray-300'
              }`}
              title='Normal'
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => setLighting('dark')}
              className={`p-2 rounded-lg transition-colors ${
                lighting === 'dark'
                  ? 'bg-purple-600/20 text-purple-400'
                  : 'bg-white/5 text-gray-300'
              }`}
              title='Karanlık'
            >
              <Moon size={16} />
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-white/5 text-gray-300'
              }`}
              title='Grid Göster/Gizle'
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>

        {/* Model Info */}
        <div className='flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5'>
          <div className='flex items-center gap-4'>
            <span>
              {model.hasTextures && '🎨 Texture'}
              {model.hasAnimations && ' • 🎬 Animation'}
            </span>
            <span>
              {model.arCompatible && '📱 AR'}
              {model.vrCompatible && ' • 🥽 VR'}
            </span>
          </div>
          <div>
            👁️ {model.views.toLocaleString()} • 🖱️{' '}
            {model.interactions.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
