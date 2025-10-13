import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

export default function ComponentsLibrary() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Yeni mesaj',
      message: 'Sistem güncellemesi tamamlandı',
      time: '2 dk önce',
      type: 'success',
    },
    {
      id: 2,
      title: 'Uyarı',
      message: 'Disk alanı %85 dolu',
      time: '5 dk önce',
      type: 'warning',
    },
    {
      id: 3,
      title: 'Hata',
      message: 'API bağlantı hatası',
      time: '10 dk önce',
      type: 'error',
    },
  ]);
  const [progress, setProgress] = useState(65);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [rating, setRating] = useState(4);
  const [sliderValue, setSliderValue] = useState(50);
  const [toggleStates, setToggleStates] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
  });

  const componentCategories = [
    { id: 'buttons', name: 'Butonlar', icon: 'ri-cursor-line' },
    { id: 'forms', name: 'Form Elemanları', icon: 'ri-file-text-line' },
    { id: 'navigation', name: 'Navigasyon', icon: 'ri-navigation-line' },
    { id: 'cards', name: 'Kartlar', icon: 'ri-layout-grid-line' },
    { id: 'modals', name: 'Modal & Popup', icon: 'ri-window-line' },
    { id: 'data', name: 'Veri Gösterimi', icon: 'ri-bar-chart-line' },
    { id: 'feedback', name: 'Geri Bildirim', icon: 'ri-notification-line' },
    { id: 'layout', name: 'Layout', icon: 'ri-layout-line' },
    { id: 'interactive', name: 'İnteraktif', icon: 'ri-hand-heart-line' },
    { id: 'advanced', name: 'Gelişmiş', icon: 'ri-settings-3-line' },
  ];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const showCode = (code: string) => {
    setSelectedCode(code);
    setShowCodeModal(true);
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const toggleSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSwitch = (key: string) => {
    setToggleStates(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-6">
              <i className="ri-code-box-line mr-2 text-blue-600"></i>
              <span className="text-blue-700 text-sm font-medium">
                Component Kütüphanesi
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                React Component
              </span>
              <br />
              Örnekleri Koleksiyonu
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Cursor'da geliştirme yaparken kullanabileceğin kapsamlı component
              örnekleri. Kopyala, yapıştır ve projende kullan!
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Component ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {componentCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                <i className={`${category.icon} mr-2`}></i>
                {category.name}
              </button>
            ))}
          </div>

          {/* Components Grid */}
          <div className="grid gap-8">
            {/* BUTTONS SECTION */}
            {activeTab === 'buttons' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Buton Çeşitleri
                </h2>

                {/* Primary Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Primary Butonlar
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                      Standart Buton
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all whitespace-nowrap cursor-pointer">
                      Gradient Buton
                    </button>
                    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center whitespace-nowrap cursor-pointer">
                      <i className="ri-check-line mr-2"></i>
                      İkonlu Buton
                    </button>
                    <button className="px-8 py-4 bg-red-600 text-white rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors shadow-lg whitespace-nowrap cursor-pointer">
                      Büyük Buton
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      showCode(`<button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
  Standart Buton
</button>`)
                    }
                    className="text-blue-600 text-sm hover:underline cursor-pointer"
                  >
                    Kodu Görüntüle
                  </button>
                </div>

                {/* Outline Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Outline Butonlar
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap cursor-pointer">
                      Outline Buton
                    </button>
                    <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer">
                      Gri Outline
                    </button>
                    <button className="px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all whitespace-nowrap cursor-pointer">
                      Yeşil Outline
                    </button>
                  </div>
                </div>

                {/* Loading Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Loading Butonlar
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button
                      onClick={simulateLoading}
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center whitespace-nowrap cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Yükleniyor...
                        </>
                      ) : (
                        'Yükle'
                      )}
                    </button>
                    <button className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center whitespace-nowrap cursor-pointer">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      İşleniyor
                    </button>
                  </div>
                </div>

                {/* Icon Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">İkon Butonlar</h3>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button className="w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer">
                      <i className="ri-heart-line"></i>
                    </button>
                    <button className="w-12 h-12 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center cursor-pointer">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                    <button className="w-12 h-12 border-2 border-gray-300 text-gray-600 rounded-full hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center cursor-pointer">
                      <i className="ri-share-line"></i>
                    </button>
                    <button className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center cursor-pointer">
                      <i className="ri-star-line"></i>
                    </button>
                  </div>
                </div>

                {/* Button Groups */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Buton Grupları</h3>
                  <div className="space-y-4">
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                      <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                        Sol
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors border-l border-r border-gray-200 whitespace-nowrap cursor-pointer">
                        Orta
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                        Sağ
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-l-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                        Önceki
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 border-t border-b border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                        1
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 border-t border-b border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                        2
                      </button>
                      <button className="px-4 py-2 bg-white text-gray-700 border-t border-b border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">
                        3
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                        Sonraki
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORMS SECTION */}
            {activeTab === 'forms' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Form Elemanları
                </h2>

                {/* Input Fields */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Input Alanları</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Standart Input
                      </label>
                      <input
                        type="text"
                        placeholder="Metin girin..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İkonlu Input
                      </label>
                      <div className="relative">
                        <i className="ri-user-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                          type="text"
                          placeholder="Kullanıcı adı"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şifre Input
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="Şifre"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i className="ri-eye-line"></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arama Input
                      </label>
                      <div className="relative">
                        <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                          type="text"
                          placeholder="Ara..."
                          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Toggle Switches
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(toggleStates).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <button
                          onClick={() => toggleSwitch(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                            value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Range Slider */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Range Slider</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Değer: {sliderValue}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={e => setSliderValue(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CARDS SECTION */}
            {activeTab === 'cards' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Kart Çeşitleri
                </h2>

                {/* Basic Cards */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Temel Kartlar</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Basit Kart
                      </h4>
                      <p className="text-gray-600">
                        Bu basit bir kart örneğidir. İçerik buraya gelir.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
                      <h4 className="text-lg font-semibold mb-2">
                        Gradient Kart
                      </h4>
                      <p className="text-blue-100">
                        Gradient arka planlı kart örneği.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="ri-star-line text-blue-600 text-xl"></i>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        İkonlu Kart
                      </h4>
                      <p className="text-gray-600">
                        İkon içeren kart tasarımı.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Cards */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Ürün Kartları</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <i className="ri-image-line text-4xl text-gray-400"></i>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Ürün Adı
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Ürün açıklaması burada yer alır.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            ₺299
                          </span>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <i className="ri-image-line text-4xl text-green-400"></i>
                        </div>
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          %20 İndirim
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          İndirimli Ürün
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">
                          İndirimli ürün açıklaması.
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-gray-900">
                              ₺239
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₺299
                            </span>
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap cursor-pointer">
                            Satın Al
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <i className="ri-image-line text-4xl text-purple-400"></i>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">
                            Premium Ürün
                          </h4>
                          <div className="flex items-center">
                            <i className="ri-star-fill text-yellow-400"></i>
                            <span className="text-sm text-gray-600 ml-1">
                              4.8
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          Premium ürün açıklaması burada.
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-gray-900">
                            ₺599
                          </span>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap cursor-pointer">
                            İncele
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    İstatistik Kartları
                  </h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Toplam Satış</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₺125,430
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-600 text-sm font-medium">
                          +12.5%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          geçen aya göre
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Yeni Müşteri</p>
                          <p className="text-2xl font-bold text-gray-900">
                            1,234
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="ri-user-add-line text-blue-600 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-blue-600 text-sm font-medium">
                          +8.2%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          geçen aya göre
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sipariş</p>
                          <p className="text-2xl font-bold text-gray-900">
                            856
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <i className="ri-shopping-bag-line text-purple-600 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-red-600 text-sm font-medium">
                          -2.1%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          geçen aya göre
                        </span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Dönüşüm</p>
                          <p className="text-2xl font-bold text-gray-900">
                            %3.2
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <i className="ri-line-chart-line text-orange-600 text-xl"></i>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className="text-green-600 text-sm font-medium">
                          +0.8%
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          geçen aya göre
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION SECTION */}
            {activeTab === 'navigation' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Navigasyon Elemanları
                </h2>

                {/* Breadcrumbs */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Breadcrumbs</h3>
                  <div className="space-y-4">
                    <nav className="flex items-center space-x-2 text-sm">
                      <a href="#" className="text-blue-600 hover:underline">
                        Ana Sayfa
                      </a>
                      <i className="ri-arrow-right-s-line text-gray-400"></i>
                      <a href="#" className="text-blue-600 hover:underline">
                        Ürünler
                      </a>
                      <i className="ri-arrow-right-s-line text-gray-400"></i>
                      <span className="text-gray-500">Laptop</span>
                    </nav>

                    <nav className="flex items-center space-x-2 text-sm">
                      <a
                        href="#"
                        className="text-gray-600 hover:text-blue-600 flex items-center"
                      >
                        <i className="ri-home-line mr-1"></i>
                        Ana Sayfa
                      </a>
                      <span className="text-gray-400">/</span>
                      <a href="#" className="text-gray-600 hover:text-blue-600">
                        Kategoriler
                      </a>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-900 font-medium">
                        Elektronik
                      </span>
                    </nav>
                  </div>
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Pagination</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-1">
                      <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                        1
                      </button>
                      <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        2
                      </button>
                      <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        3
                      </button>
                      <span className="px-3 py-2 text-gray-500">...</span>
                      <button className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        10
                      </button>
                      <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Tab Navigasyonu
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                          <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium whitespace-nowrap">
                            Genel
                          </button>
                          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                            Ayarlar
                          </button>
                          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                            Güvenlik
                          </button>
                          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                            Bildirimler
                          </button>
                        </nav>
                      </div>
                    </div>

                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button className="px-4 py-2 bg-white text-gray-900 rounded-md shadow-sm font-medium whitespace-nowrap">
                        Günlük
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
                        Haftalık
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
                        Aylık
                      </button>
                      <button className="px-4 py-2 text-gray-600 hover:text-gray-900 whitespace-nowrap">
                        Yıllık
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODALS SECTION */}
            {activeTab === 'modals' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Modal & Popup Örnekleri
                </h2>

                {/* Modal Examples */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Modal Örnekleri
                  </h3>

                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">Basit Modal</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Modal Başlığı
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                              <i className="ri-close-line text-xl"></i>
                            </button>
                          </div>
                          <p className="text-gray-600 mb-6">
                            Bu bir modal içeriği örneğidir. Burada istediğiniz
                            içeriği gösterebilirsiniz.
                          </p>
                          <div className="flex justify-end space-x-3">
                            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 whitespace-nowrap cursor-pointer">
                              İptal
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap cursor-pointer">
                              Tamam
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Onay Modal</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto">
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                              <i className="ri-error-warning-line text-red-600 text-xl"></i>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Emin misiniz?
                              </h3>
                              <p className="text-gray-600">
                                Bu işlem geri alınamaz.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 whitespace-nowrap cursor-pointer">
                              İptal
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 whitespace-nowrap cursor-pointer">
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tooltips */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Tooltip Örnekleri
                  </h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="relative group">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap cursor-pointer">
                        Üstte Tooltip
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        Bu bir tooltip
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DATA DISPLAY SECTION */}
            {activeTab === 'data' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Veri Gösterim Elemanları
                </h2>

                {/* Tables */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Tablo Örnekleri
                  </h3>

                  <div className="mb-8">
                    <h4 className="font-medium mb-3">Modern Tablo</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-medium text-gray-900">
                              <input
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">
                              Kullanıcı
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">
                              Departman
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">
                              Son Giriş
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-900">
                              İşlemler
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            {
                              name: 'Ahmet Kaya',
                              email: 'ahmet@example.com',
                              dept: 'Geliştirme',
                              lastLogin: '2 saat önce',
                            },
                            {
                              name: 'Ayşe Demir',
                              email: 'ayse@example.com',
                              dept: 'Tasarım',
                              lastLogin: '1 gün önce',
                            },
                            {
                              name: 'Mehmet Özkan',
                              email: 'mehmet@example.com',
                              dept: 'Pazarlama',
                              lastLogin: '3 gün önce',
                            },
                          ].map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(index)}
                                  onChange={() => toggleSelection(index)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {user.name
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')}
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium text-gray-900">
                                      {user.name}
                                    </div>
                                    <div className="text-gray-500 text-sm">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-gray-900">
                                {user.dept}
                              </td>
                              <td className="px-4 py-4 text-gray-500">
                                {user.lastLogin}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button className="text-red-600 hover:text-red-800 cursor-pointer">
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    İlerleme Çubukları
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Proje İlerlemesi
                        </span>
                        <span className="text-sm text-gray-500">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Satış Hedefi
                        </span>
                        <span className="text-sm text-gray-500">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                          style={{ width: '85%' }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="relative w-20 h-20">
                        <svg
                          className="w-20 h-20 transform -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="75, 100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-900">
                            75%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEEDBACK SECTION */}
            {activeTab === 'feedback' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Geri Bildirim Elemanları
                </h2>

                {/* Alerts */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Uyarı Mesajları
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <i className="ri-information-line text-blue-600 mr-3"></i>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Bilgi</h4>
                        <p className="text-blue-700">Bu bir bilgi mesajıdır.</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>

                    <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                      <i className="ri-check-line text-green-600 mr-3"></i>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">Başarılı</h4>
                        <p className="text-green-700">
                          İşlem başarıyla tamamlandı.
                        </p>
                      </div>
                      <button className="text-green-600 hover:text-green-800 cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>

                    <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <i className="ri-error-warning-line text-red-600 mr-3"></i>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">Hata</h4>
                        <p className="text-red-700">
                          Bir hata oluştu, lütfen tekrar deneyin.
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-800 cursor-pointer">
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Değerlendirme</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Yıldız Değerlendirme</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl ${
                              star <= rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors cursor-pointer`}
                          >
                            <i className="ri-star-fill"></i>
                          </button>
                        ))}
                        <span className="ml-3 text-gray-600">({rating}/5)</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Emoji Değerlendirme</h4>
                      <div className="flex items-center space-x-2">
                        {['😢', '😕', '😐', '😊', '😍'].map((emoji, index) => (
                          <button
                            key={index}
                            className="text-3xl hover:scale-110 transition-transform p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading States */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Yükleme Durumları
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <i className="ri-loader-4-line animate-spin text-3xl text-blue-600 mb-3"></i>
                      <p className="text-gray-600">Yükleniyor...</p>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="flex justify-center mb-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-gray-600">İşleniyor...</p>
                    </div>

                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-600">Bekleyin...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LAYOUT SECTION */}
            {activeTab === 'layout' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Layout Örnekleri
                </h2>

                {/* Grid Layouts */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Grid Layout Örnekleri
                  </h3>

                  <div className="space-y-8">
                    <div>
                      <h4 className="font-medium mb-3">2 Sütunlu Grid</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="h-24 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-medium">
                          Sütun 1
                        </div>
                        <div className="h-24 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-medium">
                          Sütun 2
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">3 Sütunlu Grid</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="h-24 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-medium">
                          Sütun 1
                        </div>
                        <div className="h-24 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-medium">
                          Sütun 2
                        </div>
                        <div className="h-24 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-medium">
                          Sütun 3
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">4 Sütunlu Grid</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="h-24 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-medium">
                          1
                        </div>
                        <div className="h-24 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-medium">
                          2
                        </div>
                        <div className="h-24 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-medium">
                          3
                        </div>
                        <div className="h-24 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-medium">
                          4
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flexbox Layouts */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Flexbox Layout Örnekleri
                  </h3>

                  <div className="space-y-8">
                    <div>
                      <h4 className="font-medium mb-3">Yatay Flex</h4>
                      <div className="flex space-x-4">
                        <div className="flex-1 h-24 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-medium">
                          Flex 1
                        </div>
                        <div className="flex-1 h-24 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-medium">
                          Flex 2
                        </div>
                        <div className="flex-1 h-24 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-medium">
                          Flex 3
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Ortalanmış İçerik</h4>
                      <div className="h-32 bg-pink-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <i className="ri-heart-line text-3xl text-pink-600 mb-2"></i>
                          <p className="text-pink-700 font-medium">
                            Ortalanmış İçerik
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE SECTION */}
            {activeTab === 'interactive' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  İnteraktif Elemanlar
                </h2>

                {/* Image Gallery */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Resim Galerisi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(item => (
                      <div
                        key={item}
                        className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                      >
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <i className="ri-image-line text-2xl"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Takvim</h3>
                  <div className="max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <i className="ri-arrow-left-s-line"></i>
                      </button>
                      <h4 className="font-medium">Aralık 2024</h4>
                      <button className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pa'].map(day => (
                        <div
                          key={day}
                          className="p-2 text-center text-sm font-medium text-gray-500"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <button
                          key={day}
                          className={`p-2 text-center text-sm rounded-lg hover:bg-blue-100 cursor-pointer ${
                            day === 15
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Picker */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Renk Seçici</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Renk Paleti
                      </label>
                      <div className="grid grid-cols-8 gap-2 max-w-xs">
                        {[
                          '#ef4444',
                          '#f97316',
                          '#eab308',
                          '#22c55e',
                          '#06b6d4',
                          '#3b82f6',
                          '#8b5cf6',
                          '#ec4899',
                          '#64748b',
                          '#374151',
                          '#000000',
                          '#ffffff',
                          '#fef3c7',
                          '#ddd6fe',
                          '#fce7f3',
                          '#f3f4f6',
                        ].map(color => (
                          <button
                            key={color}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: color }}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED SECTION */}
            {activeTab === 'advanced' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gelişmiş Componentler
                </h2>

                {/* Data Visualization */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Veri Görselleştirme
                  </h3>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-3">Donut Grafik</h4>
                      <div className="relative w-48 h-48 mx-auto">
                        <svg
                          className="w-48 h-48 transform -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="60, 100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              60%
                            </div>
                            <div className="text-sm text-gray-500">
                              Tamamlandı
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Mini Grafikler</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              Satışlar
                            </div>
                            <div className="text-sm text-gray-500">Bu ay</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
                            <span className="text-green-600 text-sm font-medium">
                              +12%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              Ziyaretçiler
                            </div>
                            <div className="text-sm text-gray-500">
                              Bu hafta
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                            <span className="text-green-600 text-sm font-medium">
                              +8%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Zaman Çizelgesi
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                      {[
                        {
                          time: '10:30',
                          title: 'Proje başlatıldı',
                          desc: 'Yeni proje oluşturuldu ve ekip atandı',
                          type: 'success',
                        },
                        {
                          time: '14:15',
                          title: 'İlk milestone',
                          desc: 'Tasarım aşaması tamamlandı',
                          type: 'info',
                        },
                        {
                          time: '16:45',
                          title: 'Kod incelemesi',
                          desc: 'Frontend kodu gözden geçirildi',
                          type: 'warning',
                        },
                        {
                          time: '18:20',
                          title: 'Test aşaması',
                          desc: 'Otomatik testler çalıştırıldı',
                          type: 'error',
                        },
                      ].map((item, index) => (
                        <div key={index} className="relative flex items-start">
                          <div
                            className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              item.type === 'success'
                                ? 'bg-green-500'
                                : item.type === 'info'
                                  ? 'bg-blue-500'
                                  : item.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                            }`}
                          >
                            <i
                              className={`text-white text-sm ${
                                item.type === 'success'
                                  ? 'ri-check-line'
                                  : item.type === 'info'
                                    ? 'ri-information-line'
                                    : item.type === 'warning'
                                      ? 'ri-alert-line'
                                      : 'ri-close-line'
                              }`}
                            ></i>
                          </div>
                          <div className="ml-12">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {item.title}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {item.time}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Code Modal */}
          {showCodeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Kod Örneği
                    </h3>
                    <button
                      onClick={() => setShowCodeModal(false)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{selectedCode}</code>
                  </pre>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => copyCode(selectedCode)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                    >
                      Kopyala
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
