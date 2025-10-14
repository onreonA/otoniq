/**
 * Analytics Page
 * AI Business Intelligence Dashboard with KPIs, forecasts, and anomaly detection
 */

import FeatureIntro from '../../components/common/FeatureIntro';
import AnalyticsKPICards from './components/AnalyticsKPICards';
import SalesForecastChart from './components/SalesForecastChart';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import AnomalyDetection from './components/AnomalyDetection';

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

        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Sales Forecast */}
          <SalesForecastChart />

          {/* Trend Analysis */}
          <TrendAnalysisChart />
        </div>

        {/* Anomaly Detection */}
        <AnomalyDetection />
      </div>
    </div>
  );
}
