export default function Footer() {
  const footerLinks = {
    Ürün: [
      'Özellikler',
      'Entegrasyonlar',
      'API Dokümantasyonu',
      'Güvenlik',
      'Fiyatlandırma',
    ],
    Şirket: ['Hakkımızda', 'Kariyer', 'Basın', 'İletişim', 'Blog'],
    Destek: [
      'Yardım Merkezi',
      'Topluluk',
      'Durum Sayfası',
      'Geri Bildirim',
      'İletişim',
    ],
    Yasal: [
      'Gizlilik Politikası',
      'Kullanım Şartları',
      'Çerez Politikası',
      'KVKK',
      'Lisanslar',
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-robot-2-line text-white text-xl"></i>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Otoniq.ai
              </span>
            </div>

            <p className="text-gray-400 mb-6 leading-relaxed">
              İşletmelerin e-ticaret ve e-ihracat süreçlerini yapay zeka ile
              yöneten, akıllı otomasyon platformu. Dijital dönüşümünüzün
              güvenilir ortağı.
            </p>

            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <i className="ri-twitter-line"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <i className="ri-linkedin-line"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <i className="ri-github-line"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer"
              >
                <i className="ri-youtube-line"></i>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Otoniq.ai. Tüm hakları saklıdır.
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-gray-400 text-sm">
              Türkiye'de tasarlandı ve geliştirildi
            </div>
            <a
              href="https://readdy.ai/?origin=logo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
