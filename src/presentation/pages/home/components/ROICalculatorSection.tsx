import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function ROICalculatorSection() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(350000);
  const [teamSize, setTeamSize] = useState(5);

  // Calculation logic
  const hoursSaved = teamSize * 20; // Average 20 hours/person saved
  const designerCost = 3500;
  const supportCost = 2500;
  const itCost = 1500;
  const totalSavings = designerCost + supportCost + itCost;
  const estimatedSalesIncrease = Math.floor(monthlyRevenue * 0.35);
  const platformCost =
    monthlyRevenue > 500000 ? 10000 : monthlyRevenue > 200000 ? 5000 : 2000;
  const netBenefit = totalSavings - platformCost;
  const roi = ((totalSavings + estimatedSalesIncrease) / platformCost).toFixed(
    2
  );

  return (
    <section className='py-24 bg-gradient-to-b from-white to-blue-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium mb-4'>
            <Calculator className='w-4 h-4 mr-2' />
            ROI Hesaplama
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Ne Kadar
            <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Tasarruf Edersiniz?
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            İşletmenizin büyüklüğüne göre Otoniq.ai'nin size sağlayacağı
            tasarrufu ve ROI'yi hesaplayın.
          </p>
        </div>

        {/* Calculator */}
        <div className='max-w-5xl mx-auto'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12'>
            {/* Inputs */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
              {/* Monthly Revenue Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Aylık Cironuz (₺)
                </label>
                <input
                  type='range'
                  min='50000'
                  max='5000000'
                  step='50000'
                  value={monthlyRevenue}
                  onChange={e => setMonthlyRevenue(parseInt(e.target.value))}
                  className='w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider'
                />
                <div className='mt-3 text-center'>
                  <span className='text-3xl font-bold text-blue-600'>
                    ₺{monthlyRevenue.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Team Size Input */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>
                  Ekip Büyüklüğü (Kişi)
                </label>
                <input
                  type='range'
                  min='1'
                  max='50'
                  step='1'
                  value={teamSize}
                  onChange={e => setTeamSize(parseInt(e.target.value))}
                  className='w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer slider'
                />
                <div className='mt-3 text-center'>
                  <span className='text-3xl font-bold text-purple-600'>
                    {teamSize} Kişi
                  </span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
              {/* Hours Saved */}
              <div className='bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200'>
                <div className='flex items-center mb-3'>
                  <Clock className='w-6 h-6 text-blue-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Zaman Tasarrufu
                  </h3>
                </div>
                <div className='text-3xl font-bold text-blue-600 mb-1'>
                  {hoursSaved} saat
                </div>
                <div className='text-xs text-gray-600'>
                  Aylık kazanılan zaman
                </div>
              </div>

              {/* Cost Savings */}
              <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200'>
                <div className='flex items-center mb-3'>
                  <DollarSign className='w-6 h-6 text-green-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Maliyet Tasarrufu
                  </h3>
                </div>
                <div className='text-3xl font-bold text-green-600 mb-1'>
                  ₺{totalSavings.toLocaleString('tr-TR')}
                </div>
                <div className='text-xs text-gray-600'>Aylık tasarruf</div>
              </div>

              {/* Sales Increase */}
              <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200'>
                <div className='flex items-center mb-3'>
                  <TrendingUp className='w-6 h-6 text-purple-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>
                    Satış Artışı
                  </h3>
                </div>
                <div className='text-3xl font-bold text-purple-600 mb-1'>
                  ₺{estimatedSalesIncrease.toLocaleString('tr-TR')}
                </div>
                <div className='text-xs text-gray-600'>Tahmini aylık artış</div>
              </div>

              {/* ROI */}
              <div className='bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200'>
                <div className='flex items-center mb-3'>
                  <Calculator className='w-6 h-6 text-orange-600 mr-2' />
                  <h3 className='text-sm font-medium text-gray-700'>ROI</h3>
                </div>
                <div className='text-3xl font-bold text-orange-600 mb-1'>
                  {roi}x
                </div>
                <div className='text-xs text-gray-600'>Yatırım getirisi</div>
              </div>
            </div>

            {/* Summary */}
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-center'>
                <div className='md:col-span-2'>
                  <h3 className='text-2xl font-bold mb-2'>
                    Önerilen Plan:{' '}
                    {platformCost === 10000
                      ? 'Enterprise'
                      : platformCost === 5000
                        ? 'Professional'
                        : 'Starter'}
                  </h3>
                  <p className='text-blue-100 mb-4'>
                    Aylık sadece ₺{platformCost.toLocaleString('tr-TR')} ile ₺
                    {netBenefit.toLocaleString('tr-TR')} net tasarruf + ₺
                    {estimatedSalesIncrease.toLocaleString('tr-TR')} satış
                    artışı!
                  </p>
                  <div className='flex items-center'>
                    <div className='w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse'></div>
                    <span className='text-sm'>
                      İlk aydan itibaren ROI: {roi}x
                    </span>
                  </div>
                </div>
                <div className='md:text-right'>
                  <a
                    href='/pricing'
                    className='inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg'
                  >
                    Hemen Başla →
                  </a>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h4 className='text-lg font-bold text-gray-900 mb-4'>
                Tasarruf Detayları:
              </h4>
              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>
                    Tasarımcı Maliyeti (₺3.5K/ay)
                  </span>
                  <span className='font-semibold text-green-600'>
                    → ₺0 (AI üretimi)
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>
                    Müşteri Destek Maliyeti (₺2.5K/ay)
                  </span>
                  <span className='font-semibold text-green-600'>
                    → %80 azalma (AI bot)
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-gray-600'>
                    IT/Yazılım Maliyeti (₺1.5K/ay)
                  </span>
                  <span className='font-semibold text-green-600'>
                    → ₺0 (All-in-one platform)
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm pt-3 border-t border-gray-200'>
                  <span className='text-gray-900 font-bold'>
                    Toplam Aylık Tasarruf:
                  </span>
                  <span className='font-bold text-green-600 text-lg'>
                    ₺{totalSavings.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
