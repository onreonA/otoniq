export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'ai_analysis',
      title: 'AI Analiz Tamamlandı',
      description: 'Müşteri segmentasyonu analizi başarıyla tamamlandı',
      time: '5 dakika önce',
      icon: 'ri-brain-line',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      id: 2,
      type: 'report',
      title: 'Aylık Rapor Oluşturuldu',
      description: 'Ekim ayı performans raporu hazırlandı',
      time: '1 saat önce',
      icon: 'ri-file-chart-line',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      id: 3,
      type: 'optimization',
      title: 'Süreç Optimizasyonu',
      description: 'Satış süreçlerinde %12 iyileştirme sağlandı',
      time: '2 saat önce',
      icon: 'ri-settings-4-line',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      id: 4,
      type: 'prediction',
      title: 'Tahmin Modeli Güncellendi',
      description: 'Gelecek ay satış tahmini yenilendi',
      time: '3 saat önce',
      icon: 'ri-line-chart-line',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      id: 5,
      type: 'alert',
      title: 'Anomali Tespit Edildi',
      description: 'Satış verilerinde beklenmedik artış',
      time: '4 saat önce',
      icon: 'ri-alert-line',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      id: 6,
      type: 'success',
      title: 'Hedef Aşıldı',
      description: 'Aylık satış hedefi %105 gerçekleşti',
      time: '5 saat önce',
      icon: 'ri-trophy-line',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-gray-500 rounded-xl flex items-center justify-center mr-4">
            <i className="ri-history-line text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Son Aktiviteler</h3>
            <p className="text-gray-300 text-sm">Sistem güncellemeleri</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
          <i className="ri-more-line text-xl"></i>
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer group"
          >
            <div
              className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
            >
              <i className={`${activity.icon} ${activity.color} text-lg`}></i>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                {activity.title}
              </h4>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-gray-500 text-xs mt-2">{activity.time}</p>
            </div>

            <div className="flex-shrink-0">
              <i className="ri-arrow-right-line text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"></i>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="w-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-white/10 rounded-xl py-3 text-white font-medium transition-all duration-300 cursor-pointer">
          Tüm Aktiviteleri Görüntüle
          <i className="ri-arrow-right-line ml-2"></i>
        </button>
      </div>
    </div>
  );
}
