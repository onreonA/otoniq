/**
 * Analytics Page
 * AI Business Intelligence Dashboard with KPIs, forecasts, and anomaly detection
 */

import FeatureIntro from '../../components/common/FeatureIntro';
import AnalyticsKPICards from './components/AnalyticsKPICards';

export default function AnalyticsPage() {
  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='analytics'
          title='🤖 AI İş Zekası: Verilerinizi anlamlandırın, geleceği tahmin edin'
          subtitle='Satış tahminleri, anomali tespiti, trend analizi ve daha fazlası ile işletmenizi optimize edin'
          items={[
            'Gelir ve sipariş tahminleri (7/30/90 günlük)',
            'Gerçek zamanlı anomali tespiti ve uyarılar',
            'Kanal ve kategori bazlı trend analizi',
            'Akıllı öneriler ve aksiyonlar',
          ]}
          actions={[
            {
              label: 'Rapor Oluştur',
              onClick: () => alert('Rapor oluşturma özelliği yakında!'),
              variant: 'primary',
            },
            {
              label: 'Ayarlar',
              to: '#settings',
              variant: 'secondary',
            },
          ]}
          variant='blue'
          icon='ri-bar-chart-box-line'
        />

        {/* Page Header */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  📊 AI İş Zekası
                </h1>
                <p className='text-gray-300'>
                  Veriye dayalı kararlar alın, işletmenizi büyütün
                </p>
              </div>
              <div className='hidden md:block'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <i className='ri-brain-line text-white text-2xl'></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <AnalyticsKPICards />

        {/* Coming Soon - Placeholder for other components */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Sales Forecast Placeholder */}
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white'>
                Satış Tahminleri
              </h3>
              <span className='text-xs text-gray-400 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full'>
                Yakında
              </span>
            </div>
            <div className='h-64 flex items-center justify-center text-gray-500'>
              <div className='text-center'>
                <i className='ri-line-chart-line text-4xl mb-2'></i>
                <p>Satış tahmin grafiği</p>
                <p className='text-sm'>GÜN 2'de eklenecek</p>
              </div>
            </div>
          </div>

          {/* Trend Analysis Placeholder */}
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white'>
                Trend Analizi
              </h3>
              <span className='text-xs text-gray-400 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full'>
                Yakında
              </span>
            </div>
            <div className='h-64 flex items-center justify-center text-gray-500'>
              <div className='text-center'>
                <i className='ri-bar-chart-grouped-line text-4xl mb-2'></i>
                <p>Trend analizi grafiği</p>
                <p className='text-sm'>GÜN 2'de eklenecek</p>
              </div>
            </div>
          </div>
        </div>

        {/* Anomaly Detection Placeholder */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-white'>
              Anomali Tespiti
            </h3>
            <span className='text-xs text-gray-400 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full'>
              Yakında
            </span>
          </div>
          <div className='h-48 flex items-center justify-center text-gray-500'>
            <div className='text-center'>
              <i className='ri-alert-line text-4xl mb-2'></i>
              <p>Anomali tespiti ve uyarılar</p>
              <p className='text-sm'>GÜN 3'te eklenecek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
