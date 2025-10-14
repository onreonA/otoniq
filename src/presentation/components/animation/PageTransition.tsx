/**
 * PageTransition Component
 * Provides smooth transitions between pages
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  transition?: 'fade' | 'slide' | 'scale' | 'none';
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

/**
 * PageTransition Component
 */
export function PageTransition({
  children,
  transition = 'fade',
}: PageTransitionProps) {
  const location = useLocation();
  const variant = variants[transition];

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        initial={variant.initial}
        animate={variant.animate}
        exit={variant.exit}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className='w-full'
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
