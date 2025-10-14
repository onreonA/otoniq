/**
 * SkeletonLoader Component
 * Placeholder loading state for various UI elements
 */

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'avatar' | 'button' | 'image' | 'table-row';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

/**
 * SkeletonLoader Component
 */
export function SkeletonLoader({
  type = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonLoaderProps) {
  // Base styles for all skeleton types
  const baseStyle = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  // Type-specific styles
  const typeStyles = {
    text: 'h-4 rounded',
    card: 'rounded-lg',
    avatar: 'rounded-full',
    button: 'h-10 rounded-md',
    image: 'rounded-md',
    'table-row': 'h-12 rounded',
  };

  // Default dimensions based on type
  const getDefaultDimensions = () => {
    switch (type) {
      case 'avatar':
        return { width: 'w-10', height: 'h-10' };
      case 'button':
        return { width: 'w-24', height: 'h-10' };
      case 'card':
        return { width: 'w-full', height: 'h-40' };
      case 'image':
        return { width: 'w-full', height: 'h-48' };
      case 'table-row':
        return { width: 'w-full', height: 'h-12' };
      case 'text':
      default:
        return { width: 'w-full', height: 'h-4' };
    }
  };

  const defaultDimensions = getDefaultDimensions();
  const widthClass = width || defaultDimensions.width;
  const heightClass = height || defaultDimensions.height;

  // Generate multiple skeleton items if count > 1
  if (count > 1) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`${baseStyle} ${typeStyles[type]} ${widthClass} ${heightClass} ${className}`}
          />
        ))}
      </div>
    );
  }

  // Single skeleton item
  return (
    <div
      className={`${baseStyle} ${typeStyles[type]} ${widthClass} ${heightClass} ${className}`}
    />
  );
}
