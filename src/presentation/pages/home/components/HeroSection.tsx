import Button from '../../../components/base/Button';

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('https://readdy.ai/api/search-image?query=Futuristic%20AI%20neural%20network%20visualization%20with%20glowing%20data%20streams%2C%20holographic%20interfaces%2C%20and%20digital%20commerce%20elements%20floating%20in%20a%20dark%20sophisticated%20environment%20with%20electric%20blue%20and%20purple%20neon%20lighting%2C%20cyberpunk%20aesthetic%2C%20high-tech%20atmosphere%20representing%20artificial%20intelligence%20power%20and%20automation&width=1920&height=1080&seq=hero-ai-bg&orientation=landscape')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/70"></div>

      {/* Animated AI Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse delay-1000"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 right-20 w-16 h-16 border border-blue-400/30 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-32 left-16 w-12 h-12 border border-purple-400/30 rotate-12 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* AI Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 rounded-full text-blue-300 text-sm font-medium mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-3"></div>
            Yapay Zeka Destekli E-ticaret Devrimi
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            İşletmenizin
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Dijital Zekâsı
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
            Yüzlerce yapay zeka aracıyla e-ticaret süreçlerinizi
            otomatikleştirin.
            <span className="text-blue-400 font-semibold">Otoniq.ai</span> ile
            geleceğin ticaretini bugün yaşayın.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              icon={<i className="ri-rocket-line"></i>}
            >
              AI Gücünü Keşfet
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
              icon={<i className="ri-play-circle-line"></i>}
            >
              Canlı Demo İzle
            </Button>
          </div>

          {/* AI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 p-6 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                500+
              </div>
              <div className="text-gray-300 text-sm">AI Araç Entegrasyonu</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-400/30 p-6 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                %98
              </div>
              <div className="text-gray-300 text-sm">Otomasyon Oranı</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-cyan-400/30 p-6 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">
                24/7
              </div>
              <div className="text-gray-300 text-sm">AI Asistan Desteği</div>
            </div>
            <div className="bg-gradient-to-br from-pink-600/20 to-red-600/20 backdrop-blur-sm border border-pink-400/30 p-6 rounded-2xl">
              <div className="text-3xl lg:text-4xl font-bold text-pink-400 mb-2">
                ∞
              </div>
              <div className="text-gray-300 text-sm">Sınırsız Ölçekleme</div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-400">
            <div className="flex items-center">
              <i className="ri-shield-check-line text-green-400 mr-2"></i>
              Enterprise Güvenlik
            </div>
            <div className="flex items-center">
              <i className="ri-time-line text-blue-400 mr-2"></i>
              Anında Kurulum
            </div>
            <div className="flex items-center">
              <i className="ri-global-line text-purple-400 mr-2"></i>
              Global Pazaryeri Desteği
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
