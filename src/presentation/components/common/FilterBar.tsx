import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Filter Bar Component
 * Provides search and filter functionality
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Ara...',
  filters = [],
  actions,
  className = '',
}) => {
  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6 ${className}`}
    >
      <div className='flex flex-col md:flex-row gap-4'>
        {/* Search */}
        {onSearchChange && (
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50' />
            <input
              type='text'
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            />
          </div>
        )}

        {/* Filters */}
        {filters.map((filter, index) => (
          <div key={index} className='min-w-[200px]'>
            <label className='block text-xs font-medium text-white/60 mb-1'>
              {filter.label}
            </label>
            <select
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50'
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Actions */}
        {actions && <div className='flex items-end gap-2'>{actions}</div>}
      </div>
    </div>
  );
};
