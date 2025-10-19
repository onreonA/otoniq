/**
 * ErrorState Component
 * Display when there's an error
 */

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Bir Hata Oluştu',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
    >
      {/* Error Icon */}
      <div className='w-20 h-20 bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-full flex items-center justify-center mb-6'>
        <AlertTriangle className='w-10 h-10 text-red-500' />
      </div>

      {/* Text */}
      <h3 className='text-2xl font-bold text-white mb-2'>{title}</h3>
      <p className='text-gray-400 text-center max-w-md mb-6'>{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl font-semibold flex items-center gap-2 transition-all'
        >
          <RefreshCw className='w-5 h-5' />
          Tekrar Dene
        </button>
      )}
    </motion.div>
  );
};

/**
 * InlineError Component
 * Small inline error message
 */
export const InlineError = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className='flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg'
    >
      <AlertTriangle className='w-4 h-4 text-red-500 flex-shrink-0 mt-0.5' />
      <p className='text-sm text-red-400'>{message}</p>
    </motion.div>
  );
};
