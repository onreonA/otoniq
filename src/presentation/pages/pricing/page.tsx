import { useState } from 'react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Yeni başlayan e-ticaret siteleri için',
      monthlyPrice: 2000,
      annualPrice: 19200,
      features: [
        '1 kullanıcı hesabı',
        '500 ürün limiti',
        '2 marketplace entegrasyonu',
        'Stok senkronizasyonu (günde 2x)',
        'AI Asistan (100 sorgu/ay)',
        'Sosyal medya içerik (20 post/ay)',
        'WhatsApp bot (100 konuşma/ay)',
        'Email destek (48 saat)',
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-500',
      targetRevenue: '₺50K - ₺200K/ay',
      roi: '1.87x',
    },
    {
      name: 'Professional',
      description: 'Büyüyen e-ticaret şirketleri için',
      monthlyPrice: 5000,
      annualPrice: 48000,
      features: [
        '5 kullanıcı hesabı',
        '5,000 ürün limiti',
        '5 marketplace entegrasyonu',
        'Stok senkronizasyonu (saatlik)',
        'AI Asistan (500 sorgu/ay)',
        'Gelişmiş AI analytics + Satış tahminleri',
        'Sosyal medya içerik (100 post/ay)',
        'WhatsApp + Telegram bot (500 konuşma)',
        'Odoo ERP + N8N entegrasyonu',
        'API erişimi (Basic)',
        'Chat + Telefon desteği',
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500',
      targetRevenue: '₺200K - ₺1M/ay',
      roi: '3.1x',
    },
    {
      name: 'Enterprise',
      description: 'Büyük işletmeler ve perakende zincirleri için',
      monthlyPrice: 10000,
      annualPrice: 96000,
      features: [
        'Sınırsız kullanıcı & ürün',
        'Sınırsız marketplace entegrasyonu',
        'Real-time stok senkronizasyonu',
        'AI Asistan (Sınırsız)',
        'IoT & Sensor monitoring',
        'AR/VR özellikleri',
        'Voice command support',
        'Sınırsız sosyal medya & video içerik',
        'Tüm ERP sistemleri + Custom API',
        'SLA garantisi (%99.9 uptime)',
        'Dedicated account manager',
        '7/24 öncelikli destek',
        'White-label seçeneği',
      ],
      popular: false,
      color: 'from-orange-500 to-red-500',
      targetRevenue: '₺1M+/ay',
      roi: '5.6x',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className='pt-32 pb-20 bg-gradient-to-br from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
            İşinize Uygun
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              {' '}
              Planı{' '}
            </span>
            Seçin
          </h1>
          <p className='text-xl text-gray-600 mb-12 max-w-3xl mx-auto'>
            Yapay zeka destekli e-ticaret otomasyonu ile işletmenizi bir sonraki
            seviyeye taşıyın. Her büyüklükteki işletme için özel olarak
            tasarlanmış planlarımızı keşfedin.
          </p>

          {/* Billing Toggle */}
          <div className='flex items-center justify-center mb-16'>
            <span
              className={`mr-3 text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Aylık
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`ml-3 text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Yıllık
            </span>
            {isAnnual && (
              <span className='ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                %20 İndirim
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                    <span className='inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white'>
                      En Popüler
                    </span>
                  </div>
                )}

                <div className='text-center mb-8'>
                  <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                    {plan.name}
                  </h3>
                  <p className='text-gray-600 mb-4'>{plan.description}</p>

                  {/* Target Revenue & ROI Badges */}
                  <div className='flex items-center justify-center gap-2 mb-6'>
                    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      Ciro: {plan.targetRevenue}
                    </span>
                    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                      ROI: {plan.roi}
                    </span>
                  </div>

                  <div className='mb-6'>
                    <span className='text-5xl font-bold text-gray-900'>
                      ₺
                      {isAnnual
                        ? Math.floor(plan.annualPrice / 12).toLocaleString(
                            'tr-TR'
                          )
                        : plan.monthlyPrice.toLocaleString('tr-TR')}
                    </span>
                    <span className='text-gray-600 ml-2'>/ay</span>
                    {isAnnual && (
                      <div className='text-sm text-gray-500 mt-1'>
                        Yıllık ₺{plan.annualPrice.toLocaleString('tr-TR')}{' '}
                        faturalandırılır
                      </div>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 whitespace-nowrap ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
                    }`}
                  >
                    Hemen Başla
                  </button>
                </div>

                <div className='space-y-4'>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className='flex items-center'>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r ${plan.color}`}
                      >
                        <i className='ri-check-line text-white text-sm'></i>
                      </div>
                      <span className='text-gray-700'>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Sıkça Sorulan Sorular
            </h2>
            <p className='text-xl text-gray-600'>
              Fiyatlandırma ile ilgili merak ettikleriniz
            </p>
          </div>

          <div className='space-y-6'>
            {[
              {
                question: 'Ücretsiz deneme süresi var mı?',
                answer:
                  'Evet, tüm planlarımızda 14 günlük ücretsiz deneme süresi bulunmaktadır. Kredi kartı bilgisi gerektirmez.',
              },
              {
                question: 'Plan değişikliği nasıl yapılır?',
                answer:
                  'Planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. Değişiklik anında geçerli olur ve fatura döngünüze göre hesaplanır.',
              },
              {
                question: 'İptal politikanız nedir?',
                answer:
                  'İstediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmetiniz devam eder.',
              },
              {
                question: 'Özel entegrasyonlar için ek ücret var mı?',
                answer:
                  'Kurumsal planda temel entegrasyonlar dahildir. Özel geliştirme gerektiren entegrasyonlar için ayrı fiyatlandırma yapılır.',
              },
            ].map((faq, index) => (
              <div key={index} className='bg-white rounded-xl p-6 shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  {faq.question}
                </h3>
                <p className='text-gray-600'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-blue-600 to-purple-600'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-4xl font-bold text-white mb-6'>
            Hemen Başlamaya Hazır mısınız?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            14 günlük ücretsiz deneme ile Otoniq.ai'nin gücünü keşfedin
          </p>
          <button className='bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors whitespace-nowrap'>
            Ücretsiz Denemeyi Başlat
          </button>
        </div>
      </section>
    </>
  );
};

export default Pricing;
