/**
 * EmptyState Component
 * Display when there's no data to show
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col items-center justify-center py-16 px-4'
    >
      {/* Icon or Emoji */}
      <div className='w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mb-6'>
        {Icon && <Icon className='w-10 h-10 text-gray-400' />}
        {emoji && <span className='text-4xl'>{emoji}</span>}
      </div>

      {/* Text */}
      <h3 className='text-2xl font-bold text-white mb-2'>{title}</h3>
      <p className='text-gray-400 text-center max-w-md mb-6'>{description}</p>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all'
        >
          {action.icon && <action.icon className='w-5 h-5' />}
          {action.label}
        </button>
      )}

      {/* Custom Children */}
      {children && <div className='mt-6'>{children}</div>}
    </motion.div>
  );
}
