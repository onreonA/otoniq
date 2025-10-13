import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Ürün Yönetimi',
      description: 'Ürünlerinizi görüntüleyin ve yönetin',
      icon: 'ri-box-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-600/20',
      onClick: () => navigate('/products'),
    },
    {
      title: 'Yeni Proje',
      description: 'AI destekli proje başlat',
      icon: 'ri-add-circle-line',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600/20 to-cyan-600/20',
    },
    {
      title: 'Rapor Oluştur',
      description: 'Otomatik analiz raporu',
      icon: 'ri-file-chart-line',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600/20 to-emerald-600/20',
    },
    {
      title: 'AI Analiz',
      description: 'Veri analizi başlat',
      icon: 'ri-brain-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-600/20',
    },
    {
      title: 'Müşteri Segmenti',
      description: 'Hedef kitle analizi',
      icon: 'ri-group-line',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-600/20 to-red-600/20',
    },
    {
      title: 'Tahmin Modeli',
      description: 'Gelecek projeksiyonu',
      icon: 'ri-line-chart-line',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-600/20 to-purple-600/20',
    },
    {
      title: 'Optimizasyon',
      description: 'Süreç iyileştirme',
      icon: 'ri-settings-4-line',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-600/20 to-cyan-600/20',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
          <i className="ri-flashlight-line text-white text-2xl"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Hızlı İşlemler</h3>
          <p className="text-gray-300 text-sm">Tek tıkla AI araçları</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`bg-gradient-to-r ${action.bgColor} hover:scale-105 border border-white/10 rounded-xl p-4 transition-all duration-300 cursor-pointer group text-left`}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`${action.icon} text-white text-lg`}></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">
                  {action.title}
                </h4>
                <p className="text-gray-400 text-xs">{action.description}</p>
              </div>
              <i className="ri-arrow-right-line text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"></i>
            </div>
          </button>
        ))}
      </div>

      {/* AI Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3"></div>
          <div>
            <p className="text-green-400 font-semibold text-sm">
              AI Sistemleri Aktif
            </p>
            <p className="text-gray-300 text-xs">Tüm modeller çalışıyor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
