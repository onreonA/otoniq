import { useState } from 'react';

export default function PerformanceChart() {
  const [activeTab, setActiveTab] = useState('revenue');

  const chartData = {
    revenue: {
      title: 'Gelir Analizi',
      data: [65, 78, 85, 92, 88, 95, 102],
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      color: 'from-green-500 to-emerald-500',
    },
    users: {
      title: 'Kullanıcı Aktivitesi',
      data: [45, 52, 48, 61, 58, 67, 73],
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      color: 'from-blue-500 to-cyan-500',
    },
    ai: {
      title: 'AI İşlemleri',
      data: [120, 135, 148, 162, 155, 178, 185],
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
      color: 'from-purple-500 to-pink-500',
    },
  };

  const currentData = chartData[activeTab as keyof typeof chartData];
  const maxValue = Math.max(...currentData.data);

  return (
    <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center'>
          <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-4'>
            <i className='ri-bar-chart-line text-white text-2xl'></i>
          </div>
          <div>
            <h3 className='text-xl font-bold text-white'>Performans Analizi</h3>
            <p className='text-gray-300 text-sm'>Haftalık trend analizi</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className='flex bg-white/10 rounded-xl p-1'>
          {Object.entries(chartData).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeTab === key
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {data.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className='mb-6'>
        <h4 className='text-white font-semibold mb-4'>{currentData.title}</h4>

        <div className='flex items-end justify-between h-48 space-x-2'>
          {currentData.data.map((value, index) => (
            <div key={index} className='flex-1 flex flex-col items-center'>
              <div
                className='w-full flex items-end justify-center mb-2'
                style={{ height: '160px' }}
              >
                <div
                  className={`w-full bg-gradient-to-t ${currentData.color} rounded-t-lg transition-all duration-1000 ease-out hover:scale-105 cursor-pointer relative group`}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                >
                  {/* Tooltip */}
                  <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    {value}
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

      {/* Stats Summary */}
      <div className='grid grid-cols-3 gap-4 pt-4 border-t border-white/10'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-white'>
            {currentData.data[currentData.data.length - 1]}
          </p>
          <p className='text-gray-400 text-xs'>Bugün</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-green-400'>
            +
            {Math.round(
              ((currentData.data[currentData.data.length - 1] -
                currentData.data[0]) /
                currentData.data[0]) *
                100
            )}
            %
          </p>
          <p className='text-gray-400 text-xs'>Haftalık</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-400'>
            {Math.round(
              currentData.data.reduce((a, b) => a + b, 0) /
                currentData.data.length
            )}
          </p>
          <p className='text-gray-400 text-xs'>Ortalama</p>
        </div>
      </div>
    </div>
  );
}
