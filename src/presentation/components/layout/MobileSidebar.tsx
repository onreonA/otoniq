/**
 * Mobile Sidebar Component
 * Mobile overlay sidebar with touch-friendly navigation
 */

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useUIStore } from '../../store/ui/uiStore';
import { Sidebar } from './Sidebar';

/**
 * Mobile Sidebar Component
 */
export function MobileSidebar() {
  const { sidebarMobileOpen, setMobileSidebarOpen } = useUIStore();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarMobileOpen) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarMobileOpen, setMobileSidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarMobileOpen]);

  if (!sidebarMobileOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/50 z-40 md:hidden'
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden='true'
      />

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen w-64 bg-gray-900 z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className='absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-800 transition-colors'
          aria-label='Close menu'
        >
          <X className='w-5 h-5 text-gray-400' />
        </button>

        {/* Reuse Sidebar Content */}
        <div className='h-full overflow-hidden'>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
