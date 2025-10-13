import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import Button from '../../components/base/Button';

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState('ecommerce');

  const demoSteps = [
    {
      title: 'AI Ürün Analizi',
      description: 'Yapay zeka ürünlerinizi analiz ediyor...',
      icon: 'ri-search-eye-line',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Pazaryeri Optimizasyonu',
      description: 'En uygun pazaryerleri belirleniyor...',
      icon: 'ri-store-line',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Fiyat Stratejisi',
      description: 'Rekabetçi fiyatlandırma hesaplanıyor...',
      icon: 'ri-price-tag-3-line',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Otomasyon Kurulumu',
      description: 'İş akışları otomatik hale getiriliyor...',
      icon: 'ri-settings-4-line',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const demoTypes = [
    {
      id: 'ecommerce',
      title: 'E-ticaret Yönetimi',
      description: 'Shopify, Amazon, Trendyol entegrasyonu',
      icon: 'ri-shopping-cart-line',
      features: [
        'Ürün senkronizasyonu',
        'Stok yönetimi',
        'Sipariş takibi',
        'Müşteri analizi',
      ],
    },
    {
      id: 'export',
      title: 'E-ihracat Süreçleri',
      description: 'Alibaba, eBay, global pazarlar',
      icon: 'ri-global-line',
      features: [
        'Gümrük işlemleri',
        'Kargo optimizasyonu',
        'Döviz yönetimi',
        'Uluslararası SEO',
      ],
    },
    {
      id: 'analytics',
      title: 'AI Analitik',
      description: 'Gelişmiş raporlama ve öngörüler',
      icon: 'ri-bar-chart-line',
      features: [
        'Satış tahminleri',
        'Trend analizi',
        'Müşteri segmentasyonu',
        'ROI optimizasyonu',
      ],
    },
  ];

  const startDemo = () => {
    setIsProcessing(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(interval);
          setIsProcessing(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <main className="relative pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 mb-6">
              <i className="ri-rocket-line mr-2 text-blue-400"></i>
              <span className="text-blue-300 text-sm font-medium">
                Canlı Demo Deneyimi
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI'nin Gücünü
              </span>
              <br />
              Hemen Deneyimleyin
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Otoniq.ai'nin yapay zeka destekli e-ticaret ve e-ihracat
              çözümlerini interaktif demo ile keşfedin. Gerçek zamanlı AI
              işlemlerini görün.
            </p>
          </div>

          {/* Demo Type Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {demoTypes.map(demo => (
              <div
                key={demo.id}
                onClick={() => setSelectedDemo(demo.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedDemo === demo.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/20 bg-white/5 hover:border-blue-400/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedDemo === demo.id ? 'bg-blue-500' : 'bg-white/10'
                  }`}
                >
                  <i
                    className={`${demo.icon} text-xl ${
                      selectedDemo === demo.id ? 'text-white' : 'text-blue-400'
                    }`}
                  ></i>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {demo.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{demo.description}</p>

                <div className="space-y-2">
                  {demo.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-300"
                    >
                      <i className="ri-check-line mr-2 text-green-400"></i>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Demo Interface */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                <i className="ri-brain-line mr-3 text-purple-400"></i>
                AI Demo Konsolu
              </h2>
              <p className="text-gray-300">
                Seçtiğiniz demo türü için AI işlemlerini başlatın ve gerçek
                zamanlı sonuçları görün
              </p>
            </div>

            {/* Demo Steps */}
            {!isProcessing && currentStep === 0 ? (
              <div className="text-center">
                <Button
                  onClick={startDemo}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25"
                >
                  <i className="ri-play-circle-line mr-3 text-xl"></i>
                  AI Demo'yu Başlat
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {demoSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      index <= currentStep
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        index < currentStep
                          ? 'bg-green-500'
                          : index === currentStep
                            ? `bg-gradient-to-r ${step.color}`
                            : 'bg-white/10'
                      }`}
                    >
                      {index < currentStep ? (
                        <i className="ri-check-line text-white text-xl"></i>
                      ) : index === currentStep ? (
                        <i
                          className={`${step.icon} text-white text-xl ${isProcessing ? 'animate-pulse' : ''}`}
                        ></i>
                      ) : (
                        <i className={`${step.icon} text-gray-400 text-xl`}></i>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          index <= currentStep ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          index <= currentStep
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>

                    {index === currentStep && isProcessing && (
                      <div className="ml-4">
                        <i className="ri-loader-4-line animate-spin text-blue-400 text-xl"></i>
                      </div>
                    )}

                    {index < currentStep && (
                      <div className="ml-4">
                        <span className="text-green-400 text-sm font-medium">
                          Tamamlandı
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {currentStep >= demoSteps.length - 1 && !isProcessing && (
                  <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                    <i className="ri-check-double-line text-4xl text-green-400 mb-4"></i>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Demo Tamamlandı!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      AI süreçleri başarıyla simüle edildi. Gerçek platformda bu
                      işlemler otomatik olarak gerçekleşir.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => {
                          setCurrentStep(0);
                          setIsProcessing(false);
                        }}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                      >
                        <i className="ri-refresh-line mr-2"></i>
                        Tekrar Dene
                      </Button>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <i className="ri-rocket-line mr-2"></i>
                        Hemen Başla
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Features Showcase */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: 'ri-speed-line',
                title: '10x Hızlı',
                desc: 'Manuel işlemlere göre',
                color: 'text-blue-400',
              },
              {
                icon: 'ri-shield-check-line',
                title: '%99.9 Güvenilir',
                desc: 'Otomatik yedekleme',
                color: 'text-green-400',
              },
              {
                icon: 'ri-global-line',
                title: '50+ Pazaryeri',
                desc: 'Tek platformda',
                color: 'text-purple-400',
              },
              {
                icon: 'ri-brain-line',
                title: 'AI Destekli',
                desc: 'Sürekli öğrenen sistem',
                color: 'text-cyan-400',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
              >
                <i
                  className={`${feature.icon} text-3xl ${feature.color} mb-3`}
                ></i>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl p-12 border border-blue-500/30">
            <h2 className="text-3xl font-bold text-white mb-4">
              Demo'dan Etkilendiniz mi?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Otoniq.ai ile işletmenizin dijital dönüşümünü başlatın. 14 gün
              ücretsiz deneme ile tüm özellikleri keşfedin.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4">
                <i className="ri-rocket-line mr-2"></i>
                Ücretsiz Başla
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4"
              >
                <i className="ri-phone-line mr-2"></i>
                Demo Randevusu Al
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
