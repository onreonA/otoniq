import { useState, useEffect } from 'react';

export default function SystemMonitoring() {
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 89,
  });

  const [serverStatus] = useState([
    { name: 'Web Server 1', status: 'online', load: 34, location: 'İstanbul' },
    { name: 'Web Server 2', status: 'online', load: 28, location: 'Ankara' },
    { name: 'Database Server', status: 'online', load: 56, location: 'İzmir' },
    { name: 'AI Processing', status: 'online', load: 78, location: 'İstanbul' },
    {
      name: 'Cache Server',
      status: 'maintenance',
      load: 0,
      location: 'Ankara',
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(
          20,
          Math.min(95, prev.memory + (Math.random() - 0.5) * 8)
        ),
        disk: Math.max(30, Math.min(80, prev.disk + (Math.random() - 0.5) * 5)),
        network: Math.max(
          50,
          Math.min(100, prev.network + (Math.random() - 0.5) * 15)
        ),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'offline':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Çevrimiçi';
      case 'maintenance':
        return 'Bakımda';
      case 'offline':
        return 'Çevrimdışı';
      default:
        return 'Bilinmiyor';
    }
  };

  const getMetricColor = (value: number) => {
    if (value < 50) return 'from-green-500 to-emerald-500';
    if (value < 80) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className='space-y-6'>
      {/* System Metrics */}
      <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center mb-6'>
          <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4'>
            <i className='ri-computer-line text-white text-2xl'></i>
          </div>
          <div>
            <h3 className='text-xl font-bold text-white'>Sistem Metrikleri</h3>
            <p className='text-gray-300 text-sm'>Gerçek zamanlı performans</p>
          </div>
          <div className='ml-auto'>
            <div className='w-3 h-3 bg-green-400 rounded-full animate-pulse'></div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          {Object.entries(systemMetrics).map(([key, value]) => {
            const labels = {
              cpu: 'CPU Kullanımı',
              memory: 'Bellek',
              disk: 'Disk',
              network: 'Ağ',
            };

            return (
              <div key={key} className='bg-white/5 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-gray-300 font-medium'>
                    {labels[key as keyof typeof labels]}
                  </span>
                  <span className='text-white font-bold'>
                    {Math.round(value)}%
                  </span>
                </div>
                <div className='w-full h-3 bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full bg-gradient-to-r ${getMetricColor(value)} transition-all duration-1000 ease-out`}
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Server Status */}
      <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center'>
            <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4'>
              <i className='ri-server-line text-white text-2xl'></i>
            </div>
            <div>
              <h3 className='text-xl font-bold text-white'>Sunucu Durumu</h3>
              <p className='text-gray-300 text-sm'>Tüm sunucular</p>
            </div>
          </div>
          <button className='text-gray-400 hover:text-white transition-colors cursor-pointer'>
            <i className='ri-refresh-line text-xl'></i>
          </button>
        </div>

        <div className='space-y-3'>
          {serverStatus.map((server, index) => (
            <div
              key={index}
              className='bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      server.status === 'online'
                        ? 'bg-green-400 animate-pulse'
                        : server.status === 'maintenance'
                          ? 'bg-yellow-400'
                          : 'bg-red-400'
                    }`}
                  ></div>
                  <div>
                    <h4 className='text-white font-medium'>{server.name}</h4>
                    <p className='text-gray-400 text-sm'>{server.location}</p>
                  </div>
                </div>

                <div className='flex items-center space-x-4'>
                  <div className='text-right'>
                    <div className='text-white font-medium'>{server.load}%</div>
                    <div className='text-gray-400 text-xs'>Yük</div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(server.status)}`}
                  >
                    {getStatusText(server.status)}
                  </span>
                </div>
              </div>

              {server.status === 'online' && (
                <div className='mt-3 w-full h-2 bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full bg-gradient-to-r ${getMetricColor(server.load)} transition-all duration-300`}
                    style={{ width: `${server.load}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <h3 className='text-xl font-bold text-white mb-4'>Hızlı İşlemler</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button className='bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-colors cursor-pointer'>
            <i className='ri-restart-line text-2xl text-blue-400 mb-2'></i>
            <div className='text-white text-sm font-medium'>Yeniden Başlat</div>
          </button>
          <button className='bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-colors cursor-pointer'>
            <i className='ri-database-2-line text-2xl text-green-400 mb-2'></i>
            <div className='text-white text-sm font-medium'>Veritabanı</div>
          </button>
          <button className='bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-colors cursor-pointer'>
            <i className='ri-file-text-line text-2xl text-yellow-400 mb-2'></i>
            <div className='text-white text-sm font-medium'>
              Logları Görüntüle
            </div>
          </button>
          <button className='bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 text-center transition-colors cursor-pointer'>
            <i className='ri-settings-3-line text-2xl text-purple-400 mb-2'></i>
            <div className='text-white text-sm font-medium'>Ayarlar</div>
          </button>
        </div>
      </div>
    </div>
  );
}
