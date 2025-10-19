/**
 * LoadingSpinner Component
 * Reusable loading spinner with different sizes and variants
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'white' | 'gradient';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const variantClasses = {
  primary: 'text-blue-500',
  white: 'text-white',
  gradient:
    'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500',
};

export const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  text,
  className = '',
}: LoadingSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        <Loader2 className='w-full h-full' />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='text-sm text-gray-400'
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * FullPageLoader Component
 * Full screen loading overlay
 */
export const FullPageLoader = ({
  text = 'Yükleniyor...',
}: {
  text?: string;
}) => {
  return (
    <div className='fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-4'
      >
        <LoadingSpinner size='xl' variant='gradient' />
        <p className='text-white text-lg font-medium'>{text}</p>
      </motion.div>
    </div>
  );
};

/**
 * InlineLoader Component
 * Inline loading indicator for buttons or small areas
 */
export const InlineLoader = ({
  size = 'sm',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} ${className}`}
    >
      <Loader2 className='w-full h-full' />
    </motion.div>
  );
};
