import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Başlangıç',
      description: 'Küçük işletmeler için ideal',
      monthlyPrice: 299,
      annualPrice: 2990,
      features: [
        '1 Pazaryeri Entegrasyonu',
        '100 Ürün Yönetimi',
        'Temel AI Otomasyonu',
        'Sipariş Takibi',
        'Email Desteği',
        'Temel Raporlama',
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Profesyonel',
      description: 'Büyüyen işletmeler için',
      monthlyPrice: 599,
      annualPrice: 5990,
      features: [
        '5 Pazaryeri Entegrasyonu',
        'Sınırsız Ürün Yönetimi',
        'Gelişmiş AI Otomasyonu',
        'Akıllı Fiyatlandırma',
        'Stok Optimizasyonu',
        'Müşteri Segmentasyonu',
        'Öncelikli Destek',
        'Detaylı Analitik',
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Kurumsal',
      description: 'Büyük ölçekli operasyonlar için',
      monthlyPrice: 1299,
      annualPrice: 12990,
      features: [
        'Sınırsız Pazaryeri Entegrasyonu',
        'Özel AI Modelleri',
        'API Erişimi',
        'Özel Entegrasyonlar',
        'Dedicated Account Manager',
        'SLA Garantisi',
        '7/24 Telefon Desteği',
        'Özel Eğitim ve Onboarding',
      ],
      popular: false,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className='min-h-screen bg-white'>
      <Header />

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
                %17 İndirim
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
                  <p className='text-gray-600 mb-6'>{plan.description}</p>

                  <div className='mb-6'>
                    <span className='text-5xl font-bold text-gray-900'>
                      ₺
                      {isAnnual
                        ? Math.floor(plan.annualPrice / 12)
                        : plan.monthlyPrice}
                    </span>
                    <span className='text-gray-600 ml-2'>/ay</span>
                    {isAnnual && (
                      <div className='text-sm text-gray-500 mt-1'>
                        Yıllık ₺{plan.annualPrice} faturalandırılır
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

      <Footer />
    </div>
  );
};

export default Pricing;
