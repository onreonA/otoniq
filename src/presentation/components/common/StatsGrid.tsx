import { LucideIcon } from 'lucide-react';
import { ICON_COLORS } from '../../styles/gradients';

export interface StatCard {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: keyof typeof ICON_COLORS;
  subtext?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

interface StatsGridProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

/**
 * Standardized Stats Grid Component
 * Displays KPI cards in a responsive grid layout
 */
export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = 4,
  className = '',
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6 ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const iconColor = stat.iconColor
          ? ICON_COLORS[stat.iconColor]
          : ICON_COLORS.blue;

        return (
          <div
            key={index}
            className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all'
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-white/60'>{stat.label}</span>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className='flex items-baseline gap-2'>
              <p className='text-3xl font-bold text-white'>{stat.value}</p>
              {stat.change && (
                <span
                  className={`text-sm font-medium ${
                    stat.change.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stat.change.isPositive ? '↑' : '↓'}{' '}
                  {Math.abs(stat.change.value)}%
                </span>
              )}
            </div>
            {stat.subtext && (
              <p className='text-xs text-white/50 mt-1'>{stat.subtext}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
