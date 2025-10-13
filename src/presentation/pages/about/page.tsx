import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

const About = () => {
  const team = [
    {
      name: 'Ahmet Yılmaz',
      role: 'Kurucu & CEO',
      image:
        'https://readdy.ai/api/search-image?query=Professional%20Turkish%20business%20executive%20CEO%20in%20modern%20office%20setting%2C%20confident%20leadership%20pose%2C%20dark%20suit%2C%20clean%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20professional%20photography&width=400&height=400&seq=ceo1&orientation=squarish',
      description: 'E-ticaret ve yapay zeka alanında 15 yıllık deneyim',
    },
    {
      name: 'Elif Kaya',
      role: 'CTO & Kurucu Ortak',
      image:
        'https://readdy.ai/api/search-image?query=Professional%20Turkish%20female%20technology%20executive%20CTO%20in%20modern%20tech%20office%2C%20confident%20pose%2C%20business%20attire%2C%20clean%20minimalist%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20professional%20photography&width=400&height=400&seq=cto1&orientation=squarish',
      description: 'Makine öğrenmesi ve büyük veri uzmanı',
    },
    {
      name: 'Mehmet Demir',
      role: 'Ürün Geliştirme Direktörü',
      image:
        'https://readdy.ai/api/search-image?query=Professional%20Turkish%20product%20development%20director%20in%20modern%20workspace%2C%20friendly%20approachable%20pose%2C%20casual%20business%20attire%2C%20clean%20background%2C%20corporate%20headshot%20style%2C%20high%20quality%20professional%20photography&width=400&height=400&seq=pd1&orientation=squarish',
      description: 'UX/UI tasarım ve ürün stratejisi lideri',
    },
  ];

  const values = [
    {
      icon: 'ri-lightbulb-line',
      title: 'İnovasyon',
      description:
        'Sürekli gelişim ve yenilikçi çözümlerle sektöre öncülük ediyoruz.',
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Güvenilirlik',
      description:
        'Müşterilerimizin verilerini ve işlerini en yüksek güvenlik standartlarıyla koruyoruz.',
    },
    {
      icon: 'ri-team-line',
      title: 'İşbirliği',
      description:
        'Müşterilerimizle uzun vadeli ortaklıklar kurarak birlikte büyüyoruz.',
    },
    {
      icon: 'ri-rocket-line',
      title: 'Performans',
      description:
        'Hızlı, etkili ve ölçülebilir sonuçlar sunarak işletmeleri güçlendiriyoruz.',
    },
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Kuruluş',
      description: 'Otoniq.ai, e-ticaret otomasyonu vizyonuyla kuruldu',
    },
    {
      year: '2021',
      title: 'İlk Ürün',
      description: 'AI destekli pazaryeri entegrasyon platformu lansmanı',
    },
    {
      year: '2022',
      title: 'Büyüme',
      description:
        '500+ işletme Otoniq.ai ile operasyonlarını otomatikleştirdi',
    },
    {
      year: '2023',
      title: 'Genişleme',
      description: 'Uluslararası pazarlara açılım ve yeni AI modülleri',
    },
    {
      year: '2024',
      title: 'Liderlik',
      description: "Türkiye'nin önde gelen e-ticaret AI platformu",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section
        className="pt-32 pb-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20technology%20office%20environment%20with%20AI%20visualization%2C%20holographic%20displays%2C%20futuristic%20workspace%2C%20clean%20minimalist%20design%2C%20blue%20and%20purple%20lighting%2C%20professional%20atmosphere%2C%20high-tech%20innovation%20center&width=1920&height=800&seq=about-hero&orientation=landscape')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Geleceğin E-ticaret
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              Zekası
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Otoniq.ai olarak, yapay zekanın gücüyle işletmelerin dijital
            dönüşümüne öncülük ediyoruz. E-ticaret ve e-ihracat süreçlerini
            otomatikleştirerek, işletmelerin küresel pazarlarda rekabet avantajı
            kazanmasını sağlıyoruz.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Misyonumuz
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                İşletmelerin e-ticaret operasyonlarını yapay zeka ile
                otomatikleştirerek, onları global pazarlarda daha rekabetçi hale
                getirmek. Teknolojinin karmaşıklığını ortadan kaldırarak,
                işletmelerin asıl işlerine odaklanmalarını sağlamak.
              </p>
              <p className="text-lg text-gray-600">
                Her büyüklükteki işletmenin, dünya çapında müşterilere
                ulaşabilmesi için gereken araçları ve zekayı
                demokratikleştiriyoruz.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://readdy.ai/api/search-image?query=AI%20automation%20workflow%20visualization%2C%20interconnected%20systems%2C%20data%20flow%20diagrams%2C%20modern%20digital%20transformation%2C%20blue%20and%20purple%20color%20scheme%2C%20clean%20professional%20design%2C%20technology%20innovation%20concept&width=600&height=400&seq=mission&orientation=landscape"
                alt="Misyon"
                className="rounded-2xl shadow-2xl object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Değerlerimiz
            </h2>
            <p className="text-xl text-gray-600">
              Bizi yönlendiren temel prensipler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className={`${value.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Yolculuğumuz
            </h2>
            <p className="text-xl text-gray-600">
              Otoniq.ai'nin gelişim hikayesi
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>

            {milestones.map((milestone, index) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Ekibimiz</h2>
            <p className="text-xl text-gray-600">
              Otoniq.ai'yi hayata geçiren uzman ekip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Rakamlarla Otoniq.ai
            </h2>
            <p className="text-xl text-blue-100">
              Başarılarımızı gösteren veriler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: '1000+', label: 'Aktif İşletme' },
              { number: '50M+', label: 'İşlenen Sipariş' },
              { number: '25+', label: 'Pazaryeri Entegrasyonu' },
              { number: '%95', label: 'Müşteri Memnuniyeti' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Bizimle İletişime Geçin
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Otoniq.ai hakkında daha fazla bilgi almak veya demo talep etmek için
            bize ulaşın
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 whitespace-nowrap">
            İletişime Geç
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
