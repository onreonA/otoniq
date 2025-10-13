import Button from '../../../components/base/Button';

export default function CTASection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Futuristic%20AI%20command%20center%20with%20holographic%20displays%20showing%20e-commerce%20automation%20workflows%2C%20neural%20network%20visualizations%2C%20and%20digital%20commerce%20data%20streams%20in%20a%20sophisticated%20dark%20environment%20with%20electric%20blue%20and%20purple%20neon%20lighting&width=1920&height=600&seq=cta-ai-bg&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/90 to-gray-900/95"></div>

      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* AI Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-8">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-3"></div>
          Yapay Zeka Devrimi Başlıyor
        </div>

        <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          E-ticaret Geleceğini
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Bugün Yaşayın
          </span>
        </h2>

        <p className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed">
          Otoniq.ai ile işletmenizi yapay zeka destekli otomasyonla donatın.
          Rekabette öne geçin, verimliliği artırın, geleceği şekillendirin.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            icon={<i className="ri-rocket-line"></i>}
          >
            Ücretsiz AI Deneyimi Başlat
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 px-10 py-5 text-xl font-bold backdrop-blur-sm"
            icon={<i className="ri-phone-line"></i>}
          >
            Uzman Danışmanlık
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <i className="ri-shield-check-line text-white text-2xl"></i>
            </div>
            <h3 className="text-white font-semibold mb-2">%100 Güvenli</h3>
            <p className="text-gray-400 text-sm">Enterprise seviye güvenlik</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
              <i className="ri-time-line text-white text-2xl"></i>
            </div>
            <h3 className="text-white font-semibold mb-2">
              5 Dakikada Kurulum
            </h3>
            <p className="text-gray-400 text-sm">Anında kullanıma hazır</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <i className="ri-customer-service-2-line text-white text-2xl"></i>
            </div>
            <h3 className="text-white font-semibold mb-2">7/24 AI Destek</h3>
            <p className="text-gray-400 text-sm">Kesintisiz yardım</p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <i className="ri-user-line text-blue-400 mr-2"></i>
              10,000+ Aktif Kullanıcı
            </div>
            <div className="flex items-center">
              <i className="ri-global-line text-purple-400 mr-2"></i>
              50+ Ülkede Hizmet
            </div>
            <div className="flex items-center">
              <i className="ri-award-line text-cyan-400 mr-2"></i>
              #1 AI E-ticaret Platformu
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
