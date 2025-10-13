export default function SolutionsSection() {
  const solutions = [
    {
      title: 'Startup & KOBİ',
      subtitle: 'Hızlı Başlangıç Paketi',
      description:
        'E-ticaret yolculuğunuza AI destekli araçlarla hızlı ve güçlü başlayın',
      features: [
        'Temel AI otomasyon araçları',
        '5 pazaryeri entegrasyonu',
        'Akıllı fiyatlandırma',
        'Otomatik stok yönetimi',
        '24/7 AI müşteri desteği',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Modern%20startup%20office%20with%20young%20entrepreneurs%20working%20on%20AI-powered%20e-commerce%20platform%2C%20holographic%20displays%20showing%20automated%20workflows%2C%20futuristic%20workspace%20with%20blue%20and%20purple%20lighting%2C%20innovative%20technology%20atmosphere&width=600&height=400&seq=startup-ai&orientation=landscape',
      color: 'from-blue-500 to-cyan-500',
      price: '₺299',
      period: '/ay',
    },
    {
      title: 'Büyüyen İşletmeler',
      subtitle: 'Profesyonel AI Paketi',
      description:
        'Ölçeklenen operasyonlarınız için gelişmiş yapay zeka çözümleri',
      features: [
        'Gelişmiş AI otomasyon suite',
        '20+ pazaryeri entegrasyonu',
        'Predictive analytics',
        'Çoklu kanal optimizasyonu',
        'Özel AI asistan eğitimi',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Professional%20business%20team%20analyzing%20AI-powered%20e-commerce%20analytics%20on%20large%20displays%2C%20sophisticated%20office%20environment%20with%20advanced%20technology%20interfaces%2C%20data%20visualization%20and%20automation%20dashboards%2C%20corporate%20atmosphere%20with%20blue%20lighting&width=600&height=400&seq=professional-ai&orientation=landscape',
      color: 'from-indigo-500 to-purple-500',
      price: '₺999',
      period: '/ay',
      popular: true,
    },
    {
      title: 'Enterprise',
      subtitle: 'Tam Otonom Sistem',
      description: 'Kurumsal seviye tam otonom AI ile sınırsız ölçekleme',
      features: [
        'Tam otonom AI sistemi',
        'Sınırsız entegrasyon',
        'Custom AI model eğitimi',
        'White-label çözümler',
        'Dedicated AI uzman desteği',
      ],
      image:
        'https://readdy.ai/api/search-image?query=Large%20enterprise%20corporation%20command%20center%20with%20AI-powered%20global%20e-commerce%20operations%2C%20massive%20holographic%20displays%20showing%20worldwide%20data%20flows%2C%20futuristic%20corporate%20headquarters%20with%20advanced%20artificial%20intelligence%20systems&width=600&height=400&seq=enterprise-ai&orientation=landscape',
      color: 'from-purple-500 to-pink-500',
      price: 'Özel',
      period: 'fiyat',
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <i className="ri-settings-4-line mr-2"></i>
            Her İşletme Büyüklüğü İçin AI Çözümleri
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Büyüklüğünüze Uygun
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Otomasyon Paketi
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Startup'tan enterprise'a kadar her seviyede işletme için
            özelleştirilmiş yapay zeka otomasyon çözümleri.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group ${solution.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}
            >
              {solution.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    En Popüler
                  </div>
                </div>
              )}

              <div className="relative h-48 overflow-hidden">
                <img
                  src={solution.image}
                  alt={solution.title}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${solution.color} opacity-80`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-sm opacity-90">{solution.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {solution.price}
                    </span>
                    <span className="text-gray-500 ml-1">
                      {solution.period}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {solution.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start text-gray-700"
                    >
                      <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                        <i className="ri-check-line text-green-500 text-lg"></i>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 px-6 bg-gradient-to-r ${solution.color} text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer whitespace-nowrap group-hover:scale-105`}
                >
                  <i className="ri-rocket-line mr-2"></i>
                  {solution.price === 'Özel' ? 'İletişime Geç' : 'Hemen Başla'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom guarantee */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium">
            <i className="ri-shield-check-line mr-2"></i>
            30 gün para iade garantisi • Anında kurulum • 7/24 AI destek
          </div>
        </div>
      </div>
    </section>
  );
}
