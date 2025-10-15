/**
 * Analytics Tab
 * Performance metrics and charts for workflow
 */

interface AnalyticsTabProps {
  workflow: any;
}

export default function AnalyticsTab({ workflow }: AnalyticsTabProps) {
  return (
    <div className='space-y-6'>
      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          {
            label: 'Ortalama Süre',
            value: '2.3s',
            change: '-12%',
            trend: 'down',
            color: 'from-blue-600 to-cyan-600',
          },
          {
            label: 'Başarı Oranı',
            value: '98.4%',
            change: '+2.1%',
            trend: 'up',
            color: 'from-green-600 to-emerald-600',
          },
          {
            label: 'Hata Oranı',
            value: '1.6%',
            change: '-0.5%',
            trend: 'down',
            color: 'from-red-600 to-orange-600',
          },
          {
            label: 'Aylık Çalışma',
            value: '127',
            change: '+15',
            trend: 'up',
            color: 'from-purple-600 to-pink-600',
          },
        ].map((metric, index) => (
          <div
            key={index}
            className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4'
          >
            <p className='text-gray-400 text-sm mb-2'>{metric.label}</p>
            <p className='text-2xl font-bold text-white mb-1'>{metric.value}</p>
            <div className='flex items-center gap-1'>
              <span
                className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                <i
                  className={
                    metric.trend === 'up'
                      ? 'ri-arrow-up-line'
                      : 'ri-arrow-down-line'
                  }
                ></i>
                {metric.change}
              </span>
              <span className='text-gray-500 text-xs'>son 7 güne göre</span>
            </div>
          </div>
        ))}
      </div>

      {/* Success Rate Chart (Placeholder) */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-line-chart-line'></i>
          Başarı Oranı Trendi
        </h3>
        <div className='bg-gray-900/50 rounded-lg p-12 text-center border-2 border-dashed border-gray-700'>
          <i className='ri-bar-chart-line text-6xl text-gray-600 mb-4'></i>
          <p className='text-gray-400 text-lg mb-2'>Grafik Görünümü</p>
          <p className='text-gray-500 text-sm'>
            Chart.js veya Recharts entegrasyonu eklenecek
          </p>
        </div>
      </div>

      {/* Duration Analysis */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-time-line'></i>
          Süre Analizi
        </h3>
        <div className='space-y-3'>
          {[
            {
              step: 'Trigger',
              avgDuration: 0.5,
              percentage: 5,
              color: 'bg-blue-500',
            },
            {
              step: 'Fetch Data',
              avgDuration: 2.3,
              percentage: 25,
              color: 'bg-purple-500',
            },
            {
              step: 'Process',
              avgDuration: 1.5,
              percentage: 16,
              color: 'bg-cyan-500',
            },
            {
              step: 'Generate PDF',
              avgDuration: 3.2,
              percentage: 35,
              color: 'bg-green-500',
            },
            {
              step: 'Send Email',
              avgDuration: 1.8,
              percentage: 19,
              color: 'bg-orange-500',
            },
          ].map((step, index) => (
            <div key={index}>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-white text-sm'>{step.step}</span>
                <span className='text-gray-400 text-sm'>
                  {step.avgDuration}s ({step.percentage}%)
                </span>
              </div>
              <div className='w-full bg-gray-800/50 rounded-full h-2'>
                <div
                  className={`${step.color} h-2 rounded-full transition-all`}
                  style={{ width: `${step.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Analysis */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-error-warning-line text-red-400'></i>
          Hata Analizi
        </h3>
        <div className='space-y-2'>
          {[
            { error: 'API Timeout', count: 2, percentage: 50 },
            { error: 'Database Connection Failed', count: 1, percentage: 25 },
            { error: 'Invalid Input Data', count: 1, percentage: 25 },
          ].map((error, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg'
            >
              <div className='flex-1'>
                <p className='text-white text-sm font-medium'>{error.error}</p>
                <p className='text-gray-400 text-xs'>
                  {error.count} kez oluştu
                </p>
              </div>
              <span className='text-red-400 font-bold'>
                {error.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-dashboard-line'></i>
          Kaynak Kullanımı
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <p className='text-gray-400 text-sm mb-2'>CPU Kullanımı</p>
            <p className='text-2xl font-bold text-white mb-1'>12%</p>
            <div className='w-full bg-gray-800/50 rounded-full h-2'>
              <div className='bg-blue-500 h-2 rounded-full w-[12%]'></div>
            </div>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>RAM Kullanımı</p>
            <p className='text-2xl font-bold text-white mb-1'>256 MB</p>
            <div className='w-full bg-gray-800/50 rounded-full h-2'>
              <div className='bg-purple-500 h-2 rounded-full w-[25%]'></div>
            </div>
          </div>
          <div>
            <p className='text-gray-400 text-sm mb-2'>Network</p>
            <p className='text-2xl font-bold text-white mb-1'>2.3 MB</p>
            <div className='w-full bg-gray-800/50 rounded-full h-2'>
              <div className='bg-green-500 h-2 rounded-full w-[45%]'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
