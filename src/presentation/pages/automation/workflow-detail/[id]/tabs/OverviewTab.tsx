/**
 * Overview Tab
 * General workflow information and statistics
 */

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  category: string;
  triggerType: string;
  isActive: boolean;
  totalExecutions: number;
  successRate: number;
  lastRunAt?: string;
  createdAt: string;
}

interface OverviewTabProps {
  workflow: WorkflowData;
}

export default function OverviewTab({ workflow }: OverviewTabProps) {
  const stats = [
    {
      label: 'Toplam Çalışma',
      value: workflow.totalExecutions,
      icon: 'ri-play-circle-line',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      label: 'Başarı Oranı',
      value: `${workflow.successRate}%`,
      icon: 'ri-checkbox-circle-line',
      color: 'from-green-600 to-emerald-600',
    },
    {
      label: 'Başarısız',
      value: Math.round(
        (workflow.totalExecutions * (100 - workflow.successRate)) / 100
      ),
      icon: 'ri-close-circle-line',
      color: 'from-red-600 to-orange-600',
    },
    {
      label: 'Ort. Süre',
      value: '2.3s',
      icon: 'ri-time-line',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4'
          >
            <div className='flex items-center justify-between mb-2'>
              <span className='text-gray-400 text-sm'>{stat.label}</span>
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}
              >
                <i className={`${stat.icon} text-white text-lg`}></i>
              </div>
            </div>
            <p className='text-2xl font-bold text-white'>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Workflow Info */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-information-line'></i>
          Workflow Bilgileri
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Kategori</p>
            <p className='text-white font-medium capitalize'>
              {workflow.category}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Tetikleyici Tipi</p>
            <p className='text-white font-medium uppercase'>
              {workflow.triggerType}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Oluşturulma Tarihi</p>
            <p className='text-white font-medium'>
              {new Date(workflow.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Son Çalışma</p>
            <p className='text-white font-medium'>
              {workflow.lastRunAt
                ? new Date(workflow.lastRunAt).toLocaleString('tr-TR')
                : 'Henüz çalışmadı'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-time-line'></i>
          Son Aktiviteler
        </h3>
        <div className='space-y-3'>
          {[
            {
              status: 'success',
              message: 'Workflow başarıyla tamamlandı',
              time: '5 dakika önce',
            },
            {
              status: 'success',
              message: 'Workflow başarıyla tamamlandı',
              time: '1 saat önce',
            },
            {
              status: 'failed',
              message: 'Workflow hata ile sonuçlandı: API timeout',
              time: '2 saat önce',
            },
            {
              status: 'success',
              message: 'Workflow başarıyla tamamlandı',
              time: '3 saat önce',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg'
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <div className='flex-1'>
                <p className='text-white text-sm'>{activity.message}</p>
                <p className='text-gray-400 text-xs'>{activity.time}</p>
              </div>
              <button className='text-gray-400 hover:text-white transition-colors'>
                <i className='ri-arrow-right-line'></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-flashlight-line'></i>
          Hızlı İşlemler
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <button className='bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/20 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'>
            <i className='ri-eye-line'></i>
            Tüm Logları Görüntüle
          </button>
          <button className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/20 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'>
            <i className='ri-download-line'></i>
            Tüm Çıktıları İndir
          </button>
          <button className='bg-gradient-to-r from-orange-600/20 to-red-600/20 hover:from-orange-600/30 hover:to-red-600/30 border border-orange-500/20 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'>
            <i className='ri-refresh-line'></i>
            Sıfırla ve Yeniden Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
