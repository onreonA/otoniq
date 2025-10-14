/**
 * LoadingSpinner Component
 * Animated loading indicator with different sizes and colors
 */

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
}

/**
 * LoadingSpinner Component
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-3',
  };

  // Color mapping
  const colorMap = {
    primary: 'border-t-primary-600 border-primary-200',
    white: 'border-t-white border-white/30',
    gray: 'border-t-gray-800 border-gray-200',
  };

  // Text size mapping
  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const spinnerElement = (
    <div
      className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : ''}`}
    >
      <motion.div
        className={`rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className={`mt-3 ${textSizeMap[size]} text-text-secondary`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-background-primary bg-opacity-75 flex items-center justify-center z-50'>
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
