/**
 * Breadcrumb Component
 * Auto-generated breadcrumb navigation from current route
 */

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';
import { getBreadcrumbLabel } from '../../config/breadcrumbConfig';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

/**
 * Breadcrumb Component
 */
export function Breadcrumb() {
  const location = useLocation();

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const paths = location.pathname.split('/').filter(Boolean);

    // Always start with home
    const items: BreadcrumbItem[] = [];

    // Build breadcrumb items
    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      const label = getBreadcrumbLabel(fullPath);
      const isLast = index === paths.length - 1;

      items.push({
        label,
        path: fullPath,
        isLast,
      });
    });

    return items;
  }, [location.pathname]);

  // Don't show breadcrumb on home page or if no items
  if (location.pathname === '/' || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label='Breadcrumb' className='mb-6 px-6 py-2'>
      <ol className='flex items-center gap-2 text-sm'>
        {/* Home */}
        <li>
          <Link
            to='/dashboard'
            className='flex items-center gap-1 text-gray-300 hover:text-white transition-colors'
          >
            <Home className='w-4 h-4' />
            <span className='hidden sm:inline'>Ana Sayfa</span>
          </Link>
        </li>

        {/* Breadcrumb Items */}
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className='flex items-center gap-2'>
            <ChevronRight className='w-4 h-4 text-gray-400' />
            {item.isLast ? (
              <span className='font-medium text-white'>{item.label}</span>
            ) : (
              <Link
                to={item.path}
                className='text-gray-300 hover:text-white transition-colors'
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
