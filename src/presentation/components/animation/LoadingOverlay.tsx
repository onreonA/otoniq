/**
 * LoadingOverlay Component
 * Overlay with loading spinner and optional message
 */

import { AnimatePresence, motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingOverlay Component
 */
export function LoadingOverlay({
  isLoading,
  message,
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`
            ${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} 
            bg-background-primary bg-opacity-75 
            flex items-center justify-center z-50
          `}
        >
          <LoadingSpinner
            size={fullScreen ? 'lg' : 'md'}
            color='primary'
            text={message || 'Yükleniyor...'}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
