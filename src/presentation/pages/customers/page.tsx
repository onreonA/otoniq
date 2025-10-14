import { useState } from 'react';
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
import {
  mockCustomers,
  mockCustomerStats,
  getSegmentLabel,
  getSegmentColor,
  getCustomerTypeLabel,
  type Customer,
  type CustomerSegment,
} from './mocks/customersMockData';
import { MockBadge } from '../../components/common/MockBadge';

const CustomersPage = () => {
  const [filterSegment, setFilterSegment] = useState<CustomerSegment>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(customer => {
    if (filterSegment !== 'all' && customer.segment !== filterSegment)
      return false;
    if (
      searchTerm &&
      !customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !customer.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const segmentCounts: Record<CustomerSegment, number> = {
    all: mockCustomers.length,
    vip: mockCustomers.filter(c => c.segment === 'vip').length,
    b2b: mockCustomers.filter(c => c.segment === 'b2b').length,
    first_time: mockCustomers.filter(c => c.segment === 'first_time').length,
    repeat: mockCustomers.filter(c => c.segment === 'repeat').length,
    at_risk: mockCustomers.filter(c => c.segment === 'at_risk').length,
    inactive: mockCustomers.filter(c => c.segment === 'inactive').length,
  };

  return (
    <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
      {/* Mock Badge */}
      <MockBadge storageKey='mock-badge-customers' />

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
          <p className='text-3xl font-bold text-white'>
            {mockCustomerStats.totalCustomers}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Aktif</span>
            <UserCheck className='w-5 h-5 text-green-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCustomerStats.activeCustomers}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Bu Ay Yeni</span>
            <UserPlus className='w-5 h-5 text-purple-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCustomerStats.newThisMonth}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Ort. LTV</span>
            <DollarSign className='w-5 h-5 text-yellow-400' />
          </div>
          <p className='text-2xl font-bold text-white'>
            ₺{mockCustomerStats.avgLifetimeValue.toLocaleString('tr-TR')}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>VIP</span>
            <Star className='w-5 h-5 text-orange-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCustomerStats.vipCustomers}
          </p>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-white/60'>Risk Altında</span>
            <AlertTriangle className='w-5 h-5 text-red-400' />
          </div>
          <p className='text-3xl font-bold text-white'>
            {mockCustomerStats.atRiskCustomers}
          </p>
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
          {(Object.keys(segmentCounts) as CustomerSegment[]).map(segment => (
            <button
              key={segment}
              onClick={() => setFilterSegment(segment)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterSegment === segment
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {getSegmentLabel(segment)} ({segmentCounts[segment]})
            </button>
          ))}
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
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className='text-sm font-medium text-white'>
                          {customer.name}
                        </div>
                        <div className='text-xs text-white/50 flex items-center gap-2'>
                          <Mail className='w-3 h-3' />
                          {customer.email}
                        </div>
                        <div className='text-xs text-white/50 flex items-center gap-2'>
                          <PhoneIcon className='w-3 h-3' />
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <div className='text-sm text-white/70'>
                      {getCustomerTypeLabel(customer.type)}
                    </div>
                    {customer.company && (
                      <div className='text-xs text-white/50'>
                        {customer.company}
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
                      {customer.totalOrders}
                    </div>
                    <div className='text-xs text-white/50'>
                      ₺
                      {customer.averageOrderValue.toLocaleString('tr-TR', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      ort.
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <div className='text-sm font-semibold text-white'>
                      ₺
                      {customer.totalSpent.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right'>
                    <div className='text-sm font-semibold text-purple-400'>
                      ₺
                      {customer.lifetimeValue.toLocaleString('tr-TR', {
                        maximumFractionDigits: 0,
                      })}
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
