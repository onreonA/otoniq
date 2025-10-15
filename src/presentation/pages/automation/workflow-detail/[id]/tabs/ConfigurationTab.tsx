/**
 * Configuration Tab
 * Workflow settings and parameters
 */

interface ConfigurationTabProps {
  workflow: any;
}

export default function ConfigurationTab({ workflow }: ConfigurationTabProps) {
  return (
    <div className='space-y-6'>
      {/* Trigger Configuration */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-time-line'></i>
          Tetikleyici Ayarları
        </h3>
        <div className='space-y-4'>
          <div>
            <label className='text-sm text-gray-300 mb-2 block'>
              Tetikleyici Tipi
            </label>
            <select className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'>
              <option>Cron (Zamanlı)</option>
              <option>Webhook (Tetiklendiğinde)</option>
              <option>Manuel</option>
            </select>
          </div>
          <div>
            <label className='text-sm text-gray-300 mb-2 block'>
              Cron İfadesi
            </label>
            <input
              type='text'
              value='0 9 * * *'
              className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white font-mono'
              readOnly
            />
            <p className='text-gray-400 text-xs mt-1'>
              Her gün saat 09:00'da çalışır
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-notification-line'></i>
          Bildirim Ayarları
        </h3>
        <div className='space-y-3'>
          <label className='flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer'>
            <input type='checkbox' className='w-4 h-4' defaultChecked />
            <span className='text-white'>Başarılı çalışmalarda bildir</span>
          </label>
          <label className='flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer'>
            <input type='checkbox' className='w-4 h-4' defaultChecked />
            <span className='text-white'>Hata durumunda bildir</span>
          </label>
          <label className='flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg cursor-pointer'>
            <input type='checkbox' className='w-4 h-4' />
            <span className='text-white'>Her çalışmada bildir</span>
          </label>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-settings-3-line'></i>
          Gelişmiş Ayarlar
        </h3>
        <div className='space-y-4'>
          <div>
            <label className='text-sm text-gray-300 mb-2 block'>
              Timeout (saniye)
            </label>
            <input
              type='number'
              value='300'
              className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'
            />
          </div>
          <div>
            <label className='text-sm text-gray-300 mb-2 block'>
              Yeniden Deneme Sayısı
            </label>
            <input
              type='number'
              value='3'
              className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'
            />
          </div>
          <div>
            <label className='text-sm text-gray-300 mb-2 block'>
              Yeniden Deneme Aralığı (saniye)
            </label>
            <input
              type='number'
              value='60'
              className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className='flex justify-end gap-3'>
        <button className='bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
          İptal
        </button>
        <button className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'>
          Kaydet
        </button>
      </div>
    </div>
  );
}
