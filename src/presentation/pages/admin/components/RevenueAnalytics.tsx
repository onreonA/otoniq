import { useState } from 'react';

export default function RevenueAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  const revenueData = {
    month: {
      total: '₺2,847,250',
      growth: '+18.5%',
      data: [65, 78, 85, 92, 88, 95, 102, 98, 105, 112, 108, 115],
      labels: [
        'Oca',
        'Şub',
        'Mar',
        'Nis',
        'May',
        'Haz',
        'Tem',
        'Ağu',
        'Eyl',
        'Eki',
        'Kas',
        'Ara',
      ],
    },
    week: {
      total: '₺687,450',
      growth: '+12.3%',
      data: [85, 92, 88, 95, 102, 98, 105],
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    },
    year: {
      total: '₺28,450,000',
      growth: '+24.7%',
      data: [
        2100, 2300, 2500, 2800, 2600, 2900, 3100, 2950, 3200, 3400, 3300, 3500,
      ],
      labels: [
        '2023 Oca',
        '2023 Şub',
        '2023 Mar',
        '2023 Nis',
        '2023 May',
        '2023 Haz',
        '2023 Tem',
        '2023 Ağu',
        '2023 Eyl',
        '2023 Eki',
        '2023 Kas',
        '2023 Ara',
      ],
    },
  };

  const currentData = revenueData[timeRange as keyof typeof revenueData];
  const maxValue = Math.max(...currentData.data);

  const planRevenue = [
    {
      plan: 'Enterprise',
      revenue: '₺1,245,000',
      users: 89,
      color: 'from-purple-500 to-pink-500',
    },
    {
      plan: 'Pro',
      revenue: '₺892,500',
      users: 234,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      plan: 'Basic',
      revenue: '₺456,750',
      users: 567,
      color: 'from-green-500 to-emerald-500',
    },
    {
      plan: 'Free',
      revenue: '₺0',
      users: 1247,
      color: 'from-gray-500 to-slate-500',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Revenue Overview */}
      <div className='bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Gelir Analizi
            </h2>
            <p className='text-gray-300'>Detaylı finansal performans</p>
          </div>

          {/* Time Range Selector */}
          <div className='flex bg-white/10 rounded-xl p-1'>
            {[
              { key: 'week', label: 'Hafta' },
              { key: 'month', label: 'Ay' },
              { key: 'year', label: 'Yıl' },
            ].map(range => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                  timeRange === range.key
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white/5 rounded-xl p-6 text-center'>
            <div className='text-3xl font-bold text-green-400 mb-2'>
              {currentData.total}
            </div>
            <div className='text-gray-300 text-sm'>Toplam Gelir</div>
            <div className='text-green-400 text-sm mt-1'>
              {currentData.growth}
            </div>
          </div>
          <div className='bg-white/5 rounded-xl p-6 text-center'>
            <div className='text-3xl font-bold text-blue-400 mb-2'>₺3,247</div>
            <div className='text-gray-300 text-sm'>Ortalama İşlem</div>
            <div className='text-blue-400 text-sm mt-1'>+8.2%</div>
          </div>
          <div className='bg-white/5 rounded-xl p-6 text-center'>
            <div className='text-3xl font-bold text-purple-400 mb-2'>2,137</div>
            <div className='text-gray-300 text-sm'>Aktif Abonelik</div>
            <div className='text-purple-400 text-sm mt-1'>+15.7%</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className='mb-6'>
          <h4 className='text-white font-semibold mb-4'>Gelir Trendi</h4>
          <div className='flex items-end justify-between h-64 space-x-2'>
            {currentData.data.map((value, index) => (
              <div key={index} className='flex-1 flex flex-col items-center'>
                <div
                  className='w-full flex items-end justify-center mb-2'
                  style={{ height: '200px' }}
                >
                  <div
                    className='w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all duration-1000 ease-out hover:scale-105 cursor-pointer relative group'
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  >
                    <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      {timeRange === 'year' ? `₺${value}K` : `₺${value}K`}
                    </div>
                  </div>
                </div>
                <span className='text-gray-400 text-xs'>
                  {currentData.labels[index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Revenue Breakdown */}
      <div className='bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <h3 className='text-xl font-bold text-white mb-6'>
          Plan Bazında Gelir
        </h3>

        <div className='space-y-4'>
          {planRevenue.map((plan, index) => (
            <div key={index} className='bg-white/5 rounded-xl p-4'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-4 h-4 bg-gradient-to-r ${plan.color} rounded-full`}
                  ></div>
                  <span className='text-white font-medium'>{plan.plan}</span>
                </div>
                <div className='text-right'>
                  <div className='text-white font-bold'>{plan.revenue}</div>
                  <div className='text-gray-400 text-sm'>
                    {plan.users} kullanıcı
                  </div>
                </div>
              </div>

              <div className='w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
                <div
                  className={`h-full bg-gradient-to-r ${plan.color} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${(parseFloat(plan.revenue.replace(/[^\d]/g, '')) / 1245000) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Top Customers */}
        <div className='bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-bold text-white mb-4'>
            En Değerli Müşteriler
          </h3>
          <div className='space-y-3'>
            {[
              {
                name: 'TechCorp A.Ş.',
                revenue: '₺245,000',
                plan: 'Enterprise',
              },
              { name: 'InnovateLab', revenue: '₺189,500', plan: 'Enterprise' },
              { name: 'Digital Solutions', revenue: '₺156,750', plan: 'Pro' },
              { name: 'StartupHub', revenue: '₺134,200', plan: 'Pro' },
            ].map((customer, index) => (
              <div
                key={index}
                className='bg-white/5 rounded-xl p-3 flex items-center justify-between'
              >
                <div>
                  <div className='text-white font-medium text-sm'>
                    {customer.name}
                  </div>
                  <div className='text-gray-400 text-xs'>{customer.plan}</div>
                </div>
                <div className='text-yellow-400 font-bold'>
                  {customer.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className='bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <h3 className='text-xl font-bold text-white mb-4'>
            Ödeme Yöntemleri
          </h3>
          <div className='space-y-4'>
            {[
              { method: 'Kredi Kartı', percentage: 68, amount: '₺1,935,850' },
              { method: 'Banka Transferi', percentage: 24, amount: '₺683,340' },
              { method: 'PayPal', percentage: 8, amount: '₺227,780' },
            ].map((payment, index) => (
              <div key={index} className='bg-white/5 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-white font-medium'>
                    {payment.method}
                  </span>
                  <span className='text-cyan-400 font-bold'>
                    {payment.amount}
                  </span>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='flex-1 h-2 bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ease-out'
                      style={{ width: `${payment.percentage}%` }}
                    ></div>
                  </div>
                  <span className='text-gray-400 text-sm'>
                    {payment.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
