export default function FeaturesSection() {
  const features = [
    {
      icon: 'ri-brain-line',
      title: 'Yapay Zeka Otomasyonu',
      description:
        'Gelişmiş makine öğrenmesi algoritmaları ile tüm e-ticaret süreçlerinizi otomatikleştirin.',
      color: 'from-blue-500 to-cyan-500',
      stats: '500+ AI Araç',
    },
    {
      icon: 'ri-global-line',
      title: 'Çoklu Pazaryeri Yönetimi',
      description:
        'Amazon, Shopify, Trendyol, Alibaba ve 100+ pazaryerini tek platformdan kontrol edin.',
      color: 'from-indigo-500 to-purple-500',
      stats: '100+ Platform',
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Akıllı Fiyat Optimizasyonu',
      description:
        'AI destekli piyasa analizi ile rekabetçi fiyatlandırma ve kar maksimizasyonu.',
      color: 'from-green-500 to-emerald-500',
      stats: '%40 Kar Artışı',
    },
    {
      icon: 'ri-robot-2-line',
      title: 'Otonom Sipariş İşleme',
      description:
        'Siparişten teslimat sürecine kadar tamamen otomatik iş akışları.',
      color: 'from-orange-500 to-red-500',
      stats: '%95 Otomasyon',
    },
    {
      icon: 'ri-dashboard-3-line',
      title: 'Gerçek Zamanlı Analitik',
      description:
        'AI destekli öngörüler ve actionable insights ile data-driven kararlar alın.',
      color: 'from-purple-500 to-pink-500',
      stats: 'Anlık Raporlama',
    },
    {
      icon: 'ri-customer-service-2-line',
      title: 'AI Müşteri Asistanı',
      description:
        'Doğal dil işleme ile 7/24 müşteri desteği ve otomatik problem çözümü.',
      color: 'from-teal-500 to-blue-500',
      stats: '%99 Memnuniyet',
    },
  ];

  return (
    <section
      id='features'
      className='py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden'
    >
      {/* Background Effects */}
      <div className='absolute inset-0'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl'></div>
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-6'>
            <i className='ri-cpu-line mr-2'></i>
            Yapay Zeka Destekli Özellikler
          </div>
          <h2 className='text-5xl lg:text-6xl font-bold text-white mb-6'>
            AI Gücü ile
            <span className='block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Sınırsız Otomasyon
            </span>
          </h2>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            Gelişmiş yapay zeka teknolojileri ile e-ticaret operasyonlarınızı
            tamamen otomatikleştirin ve rekabette öne geçin.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='group relative p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105'
            >
              {/* Glow effect on hover */}
              <div className='absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 rounded-3xl transition-all duration-500'></div>

              <div className='relative z-10'>
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <i className={`${feature.icon} text-white text-3xl`}></i>
                </div>

                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-xl font-bold text-white'>
                    {feature.title}
                  </h3>
                  <span className='text-xs text-blue-400 font-semibold bg-blue-400/10 px-2 py-1 rounded-full'>
                    {feature.stats}
                  </span>
                </div>

                <p className='text-gray-300 leading-relaxed'>
                  {feature.description}
                </p>

                {/* AI indicator */}
                <div className='flex items-center mt-4 text-xs text-blue-400'>
                  <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2'></div>
                  AI Destekli
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center mt-16'>
          <button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 cursor-pointer whitespace-nowrap'>
            <i className='ri-rocket-line mr-2'></i>
            Tüm Özellikleri Keşfet
          </button>
        </div>
      </div>
    </section>
  );
}
