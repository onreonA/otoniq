import { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  DollarSign,
  Star,
  AlertTriangle,
  Eye,
  Mail,
  Phone as PhoneIcon,
} from 'lucide-react';
import { useCustomers } from '../../hooks/useCustomers';
import type { CustomerSegment } from '../../../domain/entities/Customer';

const CustomersPage = () => {
  const [filterSegment, setFilterSegment] = useState<CustomerSegment | 'all'>(
    'all'
  );
  const [searchTerm, setSearchTerm] = useState('');

  const { customers, stats, loading, error } = useCustomers();

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      if (filterSegment !== 'all' && customer.segment !== filterSegment)
        return false;
      if (
        searchTerm &&
        !customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [customers, filterSegment, searchTerm]);

  const segmentCounts = useMemo(
    () => ({
      all: customers.length,
      new: stats?.new || 0,
      vip: stats?.vip || 0,
      b2b: stats?.b2b || 0,
      repeat: stats?.repeat || 0,
      at_risk: stats?.atRisk || 0,
      inactive: stats?.inactive || 0,
    }),
    [customers.length, stats]
  );

  // Helper functions
  const getSegmentLabel = (segment: string) => {
    switch (segment) {
      case 'new':
        return 'Yeni';
      case 'vip':
        return 'VIP';
      case 'b2b':
        return 'B2B';
      case 'repeat':
        return 'Tekrarlayan';
      case 'at_risk':
        return 'Risk Altında';
      case 'inactive':
        return 'Pasif';
      default:
        return segment;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'b2b':
        return 'bg-green-100 text-green-800';
      case 'repeat':
        return 'bg-teal-100 text-teal-800';
      case 'at_risk':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'individual':
        return 'Bireysel';
      case 'business':
        return 'Kurumsal';
      default:
        return type;
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Error Display */}
      {error && (
        <div className='mb-6 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3'>
          <AlertTriangle className='w-5 h-5 text-red-400' />
          <p className='text-red-200'>{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className='mb-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20'>
        <h1 className='text-3xl font-bold text-white mb-2'>
          Müşteri Yönetimi (CRM)
        </h1>
        <p className='text-white/80'>
          Müşterilerinizi segmentlere ayırın ve ilişkilerinizi güçlendirin
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-6 gap-4 mb-6'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Toplam Müşteri</span>
            <Users className='w-5 h-5 text-blue-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.total || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Aktif</span>
            <UserCheck className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.active || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Bu Ay Yeni</span>
            <UserPlus className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.new || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Ort. LTV</span>
            <DollarSign className='w-5 h-5 text-yellow-400' />
          </div>
          <p className='text-2xl font-bold text-white'>
            ₺{(stats?.averageLifetimeValue || 0).toLocaleString('tr-TR')}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>VIP</span>
            <Star className='w-5 h-5 text-orange-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.vip || 0}</p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Risk Altında</span>
            <AlertTriangle className='w-5 h-5 text-red-400' />
          </div>
          <p className='text-3xl font-bold text-white'>{stats?.atRisk || 0}</p>
        </div>
      </div>

      {/* Filters & Segment Tabs */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6'>
        <div className='flex flex-col md:flex-row gap-4 mb-4'>
          {/* Search */}
          <div className='flex-1'>
            <input
              type='text'
              placeholder='Müşteri adı, email veya numara ara...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50'
            />
          </div>

          {/* Action Button */}
          <button className='px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all'>
            + Yeni Müşteri
          </button>
        </div>

        {/* Segment Tabs */}
        <div className='flex items-center gap-2 overflow-x-auto pb-2'>
          {(Object.keys(segmentCounts) as Array<CustomerSegment | 'all'>).map(
            segment => (
              <button
                key={segment}
                onClick={() =>
                  setFilterSegment(segment as CustomerSegment | 'all')
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filterSegment === segment
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {segment === 'all' ? 'Tümü' : getSegmentLabel(segment)} (
                {segmentCounts[segment as keyof typeof segmentCounts]})
              </button>
            )
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-white/5 border-b border-white/10'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Müşteri
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Tip
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Segment
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Sipariş
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Toplam Harcama
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider'>
                  LTV
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  Son Sipariş
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider'>
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/10'>
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className='hover:bg-white/5'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold'>
                        {(customer.firstName || customer.companyName || 'N')
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className='text-sm font-medium text-white'>
                          {customer.firstName && customer.lastName
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.companyName || 'N/A'}
                        </div>
                        <div className='text-xs text-white/50 flex items-center gap-2'>
                          <Mail className='w-3 h-3' />
                          {customer.email || 'N/A'}
                        </div>
                        <div className='text-xs text-white/50 flex items-center gap-2'>
                          <PhoneIcon className='w-3 h-3' />
                          {customer.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='text-sm text-white/70'>
                      {getCustomerTypeLabel(customer.customerType)}
                    </div>
                    {customer.companyName && (
                      <div className='text-xs text-white/50'>
                        {customer.companyName}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSegmentColor(customer.segment)}`}
                    >
                      {getSegmentLabel(customer.segment)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='text-sm font-semibold text-white'>
                      {customer.totalOrders || 0}
                    </div>
                    <div className='text-xs text-white/50'>
                      ₺
                      {(customer.averageOrderValue || 0).toLocaleString(
                        'tr-TR',
                        {
                          maximumFractionDigits: 0,
                        }
                      )}{' '}
                      ort.
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <div className='text-sm font-semibold text-white'>
                      ₺
                      {(customer.totalSpent || 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <div className='text-sm font-semibold text-purple-400'>
                      ₺
                      {((customer.totalSpent || 0) * 1.2).toLocaleString(
                        'tr-TR',
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    {customer.lastOrderDate ? (
                      <div className='text-sm text-white/70'>
                        {customer.lastOrderDate.toLocaleDateString('tr-TR')}
                      </div>
                    ) : (
                      <div className='text-sm text-white/50'>-</div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <button className='p-2 hover:bg-blue-500/20 rounded transition-colors'>
                      <Eye className='w-4 h-4 text-blue-400' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className='text-center py-12'>
            <Users className='w-16 h-16 text-white/20 mx-auto mb-4' />
            <p className='text-white/60'>Müşteri bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
