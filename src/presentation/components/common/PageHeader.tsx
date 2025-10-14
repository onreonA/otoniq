import { LucideIcon } from 'lucide-react';
import { PageType, getPageGradient } from '../../styles/gradients';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  pageType?: PageType;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Page Header Component
 * Provides consistent header styling across all pages
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  pageType = 'default',
  actions,
  className = '',
}) => {
  const { gradient, border } = getPageGradient(pageType);

  return (
    <div
      className={`mb-6 bg-gradient-to-r ${gradient} backdrop-blur-sm rounded-2xl p-6 border ${border} ${className}`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          {Icon && (
            <div className='p-3 bg-white/10 rounded-xl'>
              <Icon className='w-8 h-8 text-white' />
            </div>
          )}
          <div>
            <h1 className='text-3xl font-bold text-white mb-2'>{title}</h1>
            {subtitle && <p className='text-white/80'>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className='flex items-center gap-3'>{actions}</div>}
      </div>
    </div>
  );
};
