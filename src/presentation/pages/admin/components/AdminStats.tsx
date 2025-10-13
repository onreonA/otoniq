import { useState, useEffect } from 'react';
import {
  AdminStatsService,
  AdminStats as AdminStatsType,
} from '../../../../infrastructure/database/supabase/admin-stats.service';
import toast from 'react-hot-toast';

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0, 0, 0]);

  // Stats konfigürasyonu
  const statsConfig = [
    {
      title: 'Toplam Kullanıcı',
      key: 'totalUsers' as keyof AdminStatsType,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: 'ri-user-line',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600/20 to-cyan-600/20',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Aktif Kullanıcılar',
      key: 'activeUsers' as keyof AdminStatsType,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: 'ri-pulse-line',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600/20 to-emerald-600/20',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Toplam Müşteri',
      key: 'totalTenants' as keyof AdminStatsType,
      change: '+5.1%',
      changeType: 'positive' as const,
      icon: 'ri-building-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-600/20',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Toplam Ürün',
      key: 'totalProducts' as keyof AdminStatsType,
      change: '+18.7%',
      changeType: 'positive' as const,
      icon: 'ri-box-line',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-600/20 to-red-600/20',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Günlük Gelir',
      key: 'dailyRevenue' as keyof AdminStatsType,
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: 'ri-money-dollar-circle-line',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-600/20 to-orange-600/20',
      format: (value: number) => `₺${value.toLocaleString()}`,
    },
    {
      title: 'Sistem Yükü',
      key: 'systemLoad' as keyof AdminStatsType,
      change: '-5.1%',
      changeType: 'positive' as const,
      icon: 'ri-cpu-line',
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-600/20 to-pink-600/20',
      format: (value: number) => `${value}%`,
    },
  ];

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await AdminStatsService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Stats yükleme hatası:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadStats();
  }, []);

  // Real-time güncellemeler
  useEffect(() => {
    if (!stats) return;

    const unsubscribe = AdminStatsService.subscribeToStatsUpdates(newStats => {
      setStats(newStats);
    });

    return unsubscribe;
  }, [stats]);

  // Animasyon efekti
  useEffect(() => {
    if (!stats) return;

    const timers = statsConfig.map((config, index) => {
      return setTimeout(() => {
        const targetValue = stats[config.key] as number;
        let currentValue = 0;
        const increment = targetValue / 50;

        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
          }

          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = currentValue;
            return newValues;
          });
        }, 30);
      }, index * 200);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [stats]);

  // Loading durumu
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsConfig.map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Veri yoksa
  if (!stats) {
    return (
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
        <div className="text-center">
          <i className="ri-error-warning-line text-red-400 text-4xl mb-4"></i>
          <h3 className="text-white text-lg font-medium mb-2">
            İstatistikler Yüklenemedi
          </h3>
          <p className="text-gray-300 mb-4">
            Veriler yüklenirken bir hata oluştu
          </p>
          <button
            onClick={loadStats}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            <i className="ri-refresh-line mr-2"></i>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsConfig.map((config, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${config.bgColor} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <i className={`${config.icon} text-white text-2xl`}></i>
            </div>
            <div
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                config.changeType === 'positive'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {config.change}
            </div>
          </div>

          <div>
            <h3 className="text-gray-300 text-sm font-medium mb-2">
              {config.title}
            </h3>
            <p className="text-3xl font-bold text-white">
              {config.format(animatedValues[index])}
            </p>
          </div>

          {/* Real-time indicator */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400 text-xs">Canlı</span>
            </div>
            <div className="text-gray-400 text-xs">
              {new Date().toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
