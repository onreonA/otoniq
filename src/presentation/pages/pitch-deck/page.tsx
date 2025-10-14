import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  Target,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  Zap,
  Users,
  Mail,
  Phone,
} from 'lucide-react';

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'OTONIQ.AI',
      subtitle: 'AI Destekli E-Ticaret & E-İhracat Otomasyonu',
      tagline: '"İşletmenizi Otomatikleştirin, Büyümeye Odaklanın"',
      type: 'cover',
      gradient: 'from-blue-600 via-purple-600 to-pink-600',
    },
    {
      id: 2,
      title: 'E-Ticaret Sahiplerinin En Büyük Sorunları',
      type: 'problem',
      gradient: 'from-red-600 to-orange-600',
      problems: [
        {
          icon: '⏱️',
          title: 'Manuel Süreçler',
          items: [
            'Ürün listeleme saatler alıyor',
            'Çoklu pazaryeri yönetimi kaotik',
          ],
        },
        {
          icon: '⌛',
          title: 'Zaman Kaybı',
          items: [
            'Günde 4-6 saat tekrarlayan işler',
            'Stratejik işlere zaman kalmıyor',
          ],
        },
        {
          icon: '💸',
          title: 'Yüksek Maliyetler',
          items: [
            'Tasarımcı: ₺3K-8K/ay',
            'Müşteri destek: ₺8K-15K/ay',
            'IT uzmanı: ₺10K-20K/ay',
          ],
        },
        {
          icon: '📉',
          title: 'Veri Analizi Eksikliği',
          items: [
            'Hangi ürün sattığını bilmiyor',
            'Kararlar sezgisel, data-driven değil',
          ],
        },
      ],
    },
    {
      id: 3,
      title: 'OTONIQ.AI: AI Destekli Otomasyon Platformu',
      type: 'solution',
      gradient: 'from-green-600 to-teal-600',
      solutions: [
        {
          icon: <Rocket className="w-8 h-8" />,
          title: 'AI Otomasyonu',
          items: [
            'Ürün listeleme: 4 saat → 5 dakika',
            'Sosyal medya içerik: Otomatik',
            'Müşteri destek: 7/24 AI bot',
          ],
        },
        {
          icon: <TrendingUp className="w-8 h-8" />,
          title: 'Akıllı Analitik',
          items: ['Satış tahminleri', 'Anomali tespiti', 'Trend analizi'],
        },
        {
          icon: <Zap className="w-8 h-8" />,
          title: 'Entegrasyonlar',
          items: [
            'Shopify, Trendyol, Hepsiburada, N11',
            'Odoo ERP, N8N',
            'WhatsApp, Telegram',
          ],
        },
        {
          icon: <Target className="w-8 h-8" />,
          title: 'IoT & AR/VR (Enterprise)',
          items: [
            'Sensor monitoring',
            '3D ürün görüntüleme',
            'Virtual showroom',
          ],
        },
      ],
    },
    {
      id: 4,
      title: '3 Adımda Başlayın',
      type: 'how-it-works',
      gradient: 'from-indigo-600 to-purple-600',
      steps: [
        {
          number: '1',
          title: 'BAĞLANIN',
          subtitle: '5 dakika',
          description: 'Shopify, ERP, Marketplaces',
          detail: 'Tek tıkla entegrasyon',
        },
        {
          number: '2',
          title: 'OTOMATİKLEŞTİRİN',
          subtitle: '10 dakika',
          description: 'AI workflow'ları aktifleştir',
          detail: 'Kuralları belirle',
        },
        {
          number: '3',
          title: 'BÜYÜYÜN',
          subtitle: 'Sınırsız',
          description: 'Zaman kazanın',
          detail: 'Data-driven kararlar + Ölçeklenin',
        },
      ],
    },
    {
      id: 5,
      title: 'Temel Özellikler',
      type: 'features',
      gradient: 'from-purple-600 to-pink-600',
      features: [
        {
          title: 'Ürün Yönetimi',
          items: [
            'Çoklu marketplace sync',
            'Otomatik SEO optimizasyonu',
            'Stok senkronizasyonu',
          ],
        },
        {
          title: 'AI Özellikleri',
          items: [
            'Satış tahminleri',
            'Fiyat optimizasyonu',
            'Anomali tespiti',
          ],
        },
        {
          title: 'Sosyal Medya',
          items: [
            'AI içerik üretimi',
            'Zamanlanmış paylaşım',
            'Multi-platform',
          ],
        },
        {
          title: 'Müşteri Destek',
          items: [
            'WhatsApp/Telegram bot',
            'Sentiment analizi',
            '7/24 otomatik yanıt',
          ],
        },
        {
          title: 'Entegrasyonlar',
          items: ['ERP (Odoo, SAP)', 'N8N automation', 'Custom API'],
        },
        {
          title: 'IoT & AR/VR',
          items: [
            'Sensor monitoring',
            '3D product viewer',
            'Virtual try-on',
          ],
          badge: 'Enterprise',
        },
      ],
    },
    {
      id: 6,
      title: 'ROI & Tasarruf',
      type: 'roi',
      gradient: 'from-green-600 to-emerald-600',
      plans: [
        {
          name: 'STARTER',
          price: '₺2K/ay',
          saving: '₺3,750/ay',
          roi: '1.87x',
          payback: 'İlk ay',
          color: 'from-blue-500 to-cyan-500',
        },
        {
          name: 'PROFESSIONAL',
          price: '₺5K/ay',
          saving: '₺15,500/ay',
          roi: '3.1x',
          payback: 'İlk ay',
          color: 'from-purple-500 to-pink-500',
          popular: true,
        },
        {
          name: 'ENTERPRISE',
          price: '₺10K/ay',
          saving: '₺61,000/ay',
          roi: '5.6x',
          payback: 'İlk ay',
          color: 'from-orange-500 to-red-500',
        },
      ],
      savings: [
        'Zaman (15-100 saat/ay)',
        'Tasarımcı (₺1K-8K/ay)',
        'Müşteri destek (₺2.5K-10K/ay)',
        'IT uzmanı (₺1.5K-5K/ay)',
        'Stok kaybı (₺3K-10K/ay)',
      ],
    },
    {
      id: 7,
      title: 'Başarı Hikayeleri',
      type: 'testimonials',
      gradient: 'from-yellow-600 to-orange-600',
      testimonials: [
        {
          company: 'Fashion Store Turkey',
          quote: 'Ürün listeleme süremizi %90 azalttık',
          stats: '4 saat → 20 dakika | Satışlar %35 arttı',
          plan: 'Professional',
          avatar: '👩‍💼',
        },
        {
          company: 'Teknoloji Perakende A.Ş.',
          quote: 'Stok kayıplarımız %60 azaldı',
          stats: 'IoT monitoring ile | Yıllık ₺120K tasarruf',
          plan: 'Enterprise',
          avatar: '👨‍💼',
        },
        {
          company: 'Organik Gıda Evi',
          quote: 'Sosyal medya maliyetimiz ₺0\'a indi',
          stats: 'AI içerik üretimi ile | Engagement %150 arttı',
          plan: 'Starter',
          avatar: '🌱',
        },
      ],
    },
    {
      id: 8,
      title: 'Neden Otoniq.ai?',
      type: 'advantage',
      gradient: 'from-indigo-600 to-blue-600',
      comparisons: [
        {
          title: 'VS Manuel Süreçler',
          advantages: [
            '%98 daha hızlı',
            '%100 daha az hata',
            '7/24 çalışıyor',
          ],
        },
        {
          title: 'VS Diğer Platformlar',
          advantages: [
            'AI-first yaklaşım',
            'Türkiye pazarına özel',
            'Lokal destek (Türkçe)',
            'Tüm özellikler entegre',
          ],
        },
        {
          title: 'VS Freelancer/Ajans',
          advantages: [
            'Daha ucuz (₺2K vs ₺10K+)',
            'Daha hızlı',
            'Ölçeklenebilir',
          ],
        },
      ],
    },
    {
      id: 9,
      title: 'Fiyatlandırma',
      type: 'pricing',
      gradient: 'from-purple-600 to-indigo-600',
      pricingPlans: [
        {
          name: 'STARTER',
          price: '₺2,000/ay',
          features: [
            '1 kullanıcı, 500 ürün',
            '2 marketplace',
            'AI Asistan (100 sorgu)',
            'Email destek',
          ],
          ideal: 'Yeni başlayanlar',
        },
        {
          name: 'PROFESSIONAL',
          price: '₺5,000/ay',
          features: [
            '5 kullanıcı, 5K ürün',
            '5 marketplace',
            'AI Asistan (500 sorgu)',
            'ERP entegrasyon',
            'Chat + Telefon destek',
          ],
          ideal: 'Büyüyen şirketler',
          popular: true,
        },
        {
          name: 'ENTERPRISE',
          price: '₺10,000/ay',
          features: [
            'Sınırsız her şey',
            'IoT & AR/VR',
            'SLA garantisi',
            'Dedicated manager',
          ],
          ideal: 'Büyük işletmeler',
        },
      ],
    },
    {
      id: 10,
      title: 'Hemen Başlayın!',
      type: 'cta',
      gradient: 'from-pink-600 via-purple-600 to-indigo-600',
      options: [
        {
          title: 'ÜCRETSİZ DENEME',
          description: '14 gün tüm özellikler',
          detail: 'Kredi kartı gerektirmez',
          icon: <CheckCircle className="w-12 h-12" />,
        },
        {
          title: 'DEMO RANDEVUSU',
          description: '30 dakika 1-1 demo',
          detail: 'Özelleştirilmiş ROI hesabı',
          icon: <Users className="w-12 h-12" />,
        },
        {
          title: 'PİLOT PROGRAM',
          description: '3 ay ücretsiz',
          detail: 'İlk 5 müşteri için',
          icon: <Star className="w-12 h-12" />,
        },
      ],
    },
  ];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const renderSlide = (slide: (typeof slides)[0]) => {
    switch (slide.type) {
      case 'cover':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="mb-8">
              <Rocket className="w-32 h-32 text-white mx-auto animate-bounce" />
            </div>
            <h1 className="text-7xl font-bold text-white mb-6">{slide.title}</h1>
            <p className="text-3xl text-white/90 mb-8">{slide.subtitle}</p>
            <p className="text-2xl text-white/80 italic">{slide.tagline}</p>
            <div className="mt-16 text-white/60">
              <p className="text-xl">www.otoniq.ai</p>
            </div>
          </div>
        );

      case 'problem':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-2 gap-8 mb-12">
              {slide.problems?.map((problem, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                >
                  <div className="text-5xl mb-4">{problem.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {problem.title}
                  </h3>
                  <ul className="space-y-2">
                    {problem.items.map((item, i) => (
                      <li key={i} className="text-lg text-white/90 flex items-start">
                        <span className="mr-2">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-2xl text-white italic">
                "E-ticaret sahipleri operasyonel işlerde boğuluyor, büyümeye
                odaklanamıyor."
              </p>
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
              {slide.solutions?.map((solution, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                >
                  <div className="text-green-400 mb-4">{solution.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {solution.title}
                  </h3>
                  <ul className="space-y-2">
                    {solution.items.map((item, i) => (
                      <li key={i} className="text-lg text-white/90 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-2xl text-white font-semibold">
                "Tek platformda tüm e-ticaret operasyonlarınız"
              </p>
            </div>
          </div>
        );

      case 'how-it-works':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="flex justify-center items-center gap-8 mb-12">
              {slide.steps?.map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border-4 border-white">
                      <span className="text-6xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xl text-white/80 mb-2">{step.subtitle}</p>
                    <p className="text-lg text-white/70 text-center">
                      {step.description}
                    </p>
                    <p className="text-base text-white/60 text-center">
                      {step.detail}
                    </p>
                  </div>
                  {idx < (slide.steps?.length || 0) - 1 && (
                    <ChevronRight className="w-12 h-12 text-white/50 mx-4" />
                  )}
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-2xl text-white font-semibold">
                Setup: 15 dakika | ROI: İlk aydan itibaren
              </p>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {slide.features?.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative"
                >
                  {feature.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                      {feature.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="text-base text-white/90 flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-1 text-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 'roi':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-3 gap-8 mb-8">
              {slide.plans?.map((plan, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${plan.color} rounded-2xl p-6 relative ${plan.popular ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-yellow-400 text-black text-sm font-bold rounded-full">
                        EN POPÜLER
                      </span>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-2xl text-white/90 mb-4">{plan.price}</p>
                  <div className="space-y-2 text-white/90">
                    <p className="text-lg">
                      <span className="font-semibold">Tasarruf:</span>{' '}
                      {plan.saving}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">ROI:</span> {plan.roi}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Geri Dönüş:</span>{' '}
                      {plan.payback}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-2xl text-white text-center mb-4 font-semibold">
                "Her ₺1 yatırım → ₺2-6 geri dönüş"
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {slide.savings?.map((saving, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white/20 rounded-lg text-white text-sm"
                  >
                    ✓ {saving}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="space-y-6">
              {slide.testimonials?.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 flex items-start gap-6"
                >
                  <div className="text-6xl">{testimonial.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {testimonial.company}
                    </h3>
                    <p className="text-xl text-white/90 mb-3 italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-lg text-white/80 mb-2">
                      → {testimonial.stats}
                    </p>
                    <span className="inline-block px-4 py-1 bg-white/20 rounded-full text-white text-sm">
                      Plan: {testimonial.plan}
                    </span>
                  </div>
                  <Star className="w-12 h-12 text-yellow-400 flex-shrink-0" />
                </div>
              ))}
            </div>
            <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-2xl text-white font-semibold">
                "Müşterilerimiz ortalama %200 ROI görüyor"
              </p>
            </div>
          </div>
        );

      case 'advantage':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-3 gap-8 mb-8">
              {slide.comparisons?.map((comparison, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    {comparison.title}
                  </h3>
                  <ul className="space-y-3">
                    {comparison.advantages.map((advantage, i) => (
                      <li
                        key={i}
                        className="text-lg text-white/90 flex items-center"
                      >
                        <CheckCircle className="w-6 h-6 mr-3 text-green-400 flex-shrink-0" />
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-400">
              <p className="text-2xl text-white text-center font-bold">
                UNIQUE VALUE PROPOSITION
              </p>
              <p className="text-xl text-white/90 text-center mt-4 italic">
                "Türkiye'nin ilk AI-native e-ticaret otomasyon platformu"
              </p>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="p-12">
            <h2 className="text-5xl font-bold text-white mb-12 text-center">
              {slide.title}
            </h2>
            <div className="grid grid-cols-3 gap-8 mb-8">
              {slide.pricingPlans?.map((plan, idx) => (
                <div
                  key={idx}
                  className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 relative ${plan.popular ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Star className="w-8 h-8 text-yellow-400" />
                    </div>
                  )}
                  <h3 className="text-3xl font-bold text-white mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-bold text-white mb-6">
                    {plan.price}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="text-base text-white/90 flex items-start"
                      >
                        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-green-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-sm text-white/80">
                      <span className="font-semibold">İdeal:</span> {plan.ideal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-400">
              <p className="text-2xl text-white text-center font-bold mb-2">
                ✨ ÖZEL TEKLİF
              </p>
              <div className="flex justify-center gap-8 text-white/90">
                <p>• İlk 20 müşteri: %30 indirim</p>
                <p>• 14 gün ücretsiz deneme</p>
                <p>• Pilot program (3 ay ücretsiz)</p>
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <h2 className="text-6xl font-bold text-white mb-16">
              {slide.title}
            </h2>
            <div className="grid grid-cols-3 gap-8 mb-16 w-full">
              {slide.options?.map((option, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <div className="text-white mb-4 flex justify-center">
                    {option.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {option.title}
                  </h3>
                  <p className="text-xl text-white/90 mb-2">
                    {option.description}
                  </p>
                  <p className="text-base text-white/70">{option.detail}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 w-full">
              <p className="text-3xl font-bold text-white mb-6">İLETİŞİM</p>
              <div className="flex justify-center gap-12 text-white/90 text-lg">
                <div className="flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  <span>sales@otoniq.ai</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-6 h-6" />
                  <span>+90 (212) 123 45 67</span>
                </div>
              </div>
              <p className="text-white/60 mt-4 text-xl">www.otoniq.ai</p>
            </div>
            <p className="text-3xl text-white/90 mt-12 italic">
              "İşletmenizi otomatikleştirin, büyümeye odaklanın!"
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const current = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Slide Container */}
      <div
        className={`min-h-screen bg-gradient-to-br ${current.gradient} transition-all duration-500`}
      >
        {renderSlide(current)}
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide
                    ? 'w-12 h-3 bg-white rounded-full'
                    : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Slide Counter */}
        <div className="text-center mt-4">
          <span className="text-white/60 text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed top-8 right-8 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white/60 text-sm">
        <span className="mr-2">←→</span>
        <span>Keyboard navigation</span>
      </div>
    </div>
  );
};

export default PitchDeck;

