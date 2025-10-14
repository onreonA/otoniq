import { useState, useEffect } from 'react';
import { Database, X } from 'lucide-react';

interface MockBadgeProps {
  /**
   * Unique key for localStorage persistence
   * e.g., "mock-badge-categories", "mock-badge-orders"
   */
  storageKey: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

/**
 * Mock Badge Component
 * Visual indicator for pages using mock data
 * Dismissible with localStorage persistence
 */
export const MockBadge: React.FC<MockBadgeProps> = ({
  storageKey,
  position = 'top-right',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-24 right-4',
    'top-left': 'top-24 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      role='alert'
    >
      <div className='bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-[280px]'>
        <div className='flex items-center gap-3 flex-1'>
          <Database className='w-5 h-5 text-yellow-400 flex-shrink-0' />
          <div>
            <p className='text-sm font-semibold text-yellow-200'>
              Mock Data Mode
            </p>
            <p className='text-xs text-yellow-300/80'>
              Bu sayfa geliştirme aşamasında mock data kullanıyor
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className='text-yellow-300 hover:text-yellow-100 transition-colors flex-shrink-0'
          aria-label='Dismiss'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

/**
 * Compact Mock Badge (for mobile or inline usage)
 */
export const CompactMockBadge: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full ${className}`}
    >
      <Database className='w-3.5 h-3.5 text-yellow-400' />
      <span className='text-xs font-medium text-yellow-200'>Mock Data</span>
    </div>
  );
};
