import { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

/**
 * Standardized Data Table Component
 * Generic table with sorting, custom rendering, and responsive design
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortDirection,
  onSort,
  loading,
  emptyState,
  className = '',
}: DataTableProps<T>) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (!onSort || sortKey !== columnKey) {
      return <ArrowUpDown className='w-3 h-3 text-white/30' />;
    }

    return sortDirection === 'asc' ? (
      <ArrowUp className='w-3 h-3 text-white' />
    ) : (
      <ArrowDown className='w-3 h-3 text-white' />
    );
  };

  if (loading) {
    return (
      <div
        className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden ${className}`}
      >
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div
        className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden ${className}`}
      >
        <div className='py-12'>{emptyState}</div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden ${className}`}
    >
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-white/5 border-b border-white/10'>
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 ${getAlignClass(column.align)} text-xs font-medium text-white/60 uppercase tracking-wider whitespace-nowrap`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.sortable && onSort ? (
                    <button
                      onClick={() => onSort(column.key)}
                      className='inline-flex items-center gap-1 hover:text-white transition-colors'
                    >
                      {column.label}
                      {renderSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-white/10'>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className='hover:bg-white/5 transition-colors'
              >
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap ${getAlignClass(column.align)}`}
                  >
                    {column.render ? (
                      column.render(item, index)
                    ) : (
                      <span className='text-sm text-white'>
                        {String((item as any)[column.key] ?? '-')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
