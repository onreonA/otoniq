import { STATUS_COLORS } from '../../styles/gradients';
import { LucideIcon } from 'lucide-react';

export type StatusType = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  icon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Standardized Status Badge Component
 * Provides consistent status badge styling across all pages
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  icon: Icon,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} leading-5 font-semibold rounded-full border ${STATUS_COLORS[status]} ${className}`}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
};

/**
 * Custom Status Badge with custom colors
 */
interface CustomStatusBadgeProps {
  label: string;
  icon?: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CustomStatusBadge: React.FC<CustomStatusBadgeProps> = ({
  label,
  icon: Icon,
  bgColor,
  textColor,
  borderColor,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} leading-5 font-semibold rounded-full border ${bgColor} ${textColor} ${borderColor} ${className}`}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
};
