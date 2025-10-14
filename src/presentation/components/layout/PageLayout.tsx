import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { PageHeader } from '../common/PageHeader';
import { PageType } from '../../styles/gradients';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  pageType?: PageType;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Standardized Page Layout Component
 * Provides consistent page structure with PageHeader and content area
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  icon,
  pageType = 'default',
  actions,
  children,
  className = '',
  contentClassName = '',
}) => {
  return (
    <div className={`p-6 ${className}`}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        pageType={pageType}
        actions={actions}
      />
      <div className={contentClassName}>{children}</div>
    </div>
  );
};
