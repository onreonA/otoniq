import { Star, TrendingUp, Award } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Ayşe Yılmaz',
      role: 'Kurucu & CEO',
      company: 'Fashion Store Turkey',
      avatar: '👩‍💼',
      quote:
        "Otoniq.ai'yi kullanmadan önce ekibim operasyonel işlerde boğuluyordu. Şimdi AI her şeyi otomatik hallediyor. İlk 6 ayda satışlarımız %35 arttı!",
      plan: 'Professional',
      metrics: {
        sales: '+35%',
        time: '-90%',
        cost: '₺10.5K',
      },
      rating: 5,
    },
    {
      name: 'Mehmet Demir',
      role: 'Operasyon Müdürü',
      company: 'Teknoloji Perakende A.Ş.',
      avatar: '👨‍💼',
      quote:
        "IoT sensör monitoring özelliği işimizi kurtardı. Geçen yaz bir depomuzda klima arızalandı, Otoniq.ai anında uyarı verdi ve ₺25K'lık ürün kaybını önledik.",
      plan: 'Enterprise',
      metrics: {
        savings: '₺420K/yıl',
        roi: '3.5x',
        loss: '-60%',
      },
      rating: 5,
    },
    {
      name: 'Zeynep Kaya',
      role: 'Kurucu & CEO',
      company: 'Organik Gıda Evi',
      avatar: '🌱',
      quote:
        "Küçük bir ekibiz. Otoniq.ai ile sanki bir dijital pazarlama ekibi çalıştırıyormuşuz gibi hissediyoruz. Engagement'ımız 4 kat arttı!",
      plan: 'Starter',
      metrics: {
        engagement: '+300%',
        sales: '+69%',
        hours: '-75%',
      },
      rating: 5,
    },
  ];

  return (
    <section className='py-24 bg-gradient-to-b from-gray-50 to-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <div className='inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium mb-4'>
            <Award className='w-4 h-4 mr-2' />
            Müşteri Başarı Hikayeleri
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Müşterilerimiz
            <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Neler Söylüyor?
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Otoniq.ai ile işlerini dönüştüren gerçek işletme sahiplerinin
            hikayelerini keşfedin.
          </p>
        </div>

        {/* Overall Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6 mb-16'>
          <div className='text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='text-4xl font-bold text-blue-600 mb-2'>4.8/5.0</div>
            <div className='text-sm text-gray-600'>Müşteri Memnuniyeti</div>
          </div>
          <div className='text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='text-4xl font-bold text-green-600 mb-2'>%200</div>
            <div className='text-sm text-gray-600'>Ortalama ROI</div>
          </div>
          <div className='text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='text-4xl font-bold text-purple-600 mb-2'>%85</div>
            <div className='text-sm text-gray-600'>Zaman Tasarrufu</div>
          </div>
          <div className='text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200'>
            <div className='text-4xl font-bold text-orange-600 mb-2'>%42</div>
            <div className='text-sm text-gray-600'>Satış Artışı</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all'
            >
              {/* Rating */}
              <div className='flex items-center mb-4'>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className='w-5 h-5 text-yellow-400 fill-current'
                  />
                ))}
              </div>

              {/* Quote */}
              <p className='text-gray-700 mb-6 italic'>"{testimonial.quote}"</p>

              {/* Metrics */}
              <div className='grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200'>
                {Object.entries(testimonial.metrics).map(([key, value], i) => (
                  <div key={i} className='text-center'>
                    <div className='text-lg font-bold text-blue-600'>
                      {value}
                    </div>
                    <div className='text-xs text-gray-500 capitalize'>
                      {key}
                    </div>
                  </div>
                ))}
              </div>

              {/* Author */}
              <div className='flex items-center'>
                <div className='text-4xl mr-4'>{testimonial.avatar}</div>
                <div>
                  <div className='font-bold text-gray-900'>
                    {testimonial.name}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {testimonial.role}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Plan Badge */}
              <div className='mt-4'>
                <span className='inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'>
                  Plan: {testimonial.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='text-center'>
          <p className='text-lg text-gray-600 mb-4'>
            Siz de başarı hikayenizi yazmak ister misiniz?
          </p>
          <a
            href='/pricing'
            className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl'
          >
            <TrendingUp className='w-5 h-5 mr-2' />
            Planları İncele
          </a>
        </div>
      </div>
    </section>
  );
}
