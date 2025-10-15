/**
 * Runs History Tab
 * List of all workflow executions
 */

interface RunsHistoryTabProps {
  workflow: any;
}

export default function RunsHistoryTab({ workflow }: RunsHistoryTabProps) {
  const runs = [
    {
      id: 'run_1',
      status: 'success',
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      finishedAt: new Date(Date.now() - 3540000).toISOString(),
      duration: 60,
    },
    {
      id: 'run_2',
      status: 'success',
      startedAt: new Date(Date.now() - 86400000).toISOString(),
      finishedAt: new Date(Date.now() - 86340000).toISOString(),
      duration: 60,
    },
    {
      id: 'run_3',
      status: 'failed',
      startedAt: new Date(Date.now() - 172800000).toISOString(),
      finishedAt: new Date(Date.now() - 172740000).toISOString(),
      duration: 60,
      error: 'API timeout',
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Filter Bar */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <select className='bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'>
            <option>Tüm Durumlar</option>
            <option>Başarılı</option>
            <option>Başarısız</option>
            <option>Çalışıyor</option>
          </select>
          <input
            type='date'
            className='bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'
          />
          <input
            type='date'
            className='bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white'
          />
          <button className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
            Filtrele
          </button>
        </div>
      </div>

      {/* Runs List */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-900/50'>
              <tr>
                <th className='text-left px-6 py-3 text-sm font-semibold text-gray-300'>
                  Durum
                </th>
                <th className='text-left px-6 py-3 text-sm font-semibold text-gray-300'>
                  Başlangıç
                </th>
                <th className='text-left px-6 py-3 text-sm font-semibold text-gray-300'>
                  Bitiş
                </th>
                <th className='text-left px-6 py-3 text-sm font-semibold text-gray-300'>
                  Süre
                </th>
                <th className='text-left px-6 py-3 text-sm font-semibold text-gray-300'>
                  Hata
                </th>
                <th className='text-right px-6 py-3 text-sm font-semibold text-gray-300'>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/5'>
              {runs.map(run => (
                <tr
                  key={run.id}
                  className='hover:bg-gray-800/30 transition-colors'
                >
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                        run.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : run.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {run.status === 'success' && (
                        <i className='ri-checkbox-circle-fill'></i>
                      )}
                      {run.status === 'failed' && (
                        <i className='ri-close-circle-fill'></i>
                      )}
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-white text-sm'>
                    {new Date(run.startedAt).toLocaleString('tr-TR')}
                  </td>
                  <td className='px-6 py-4 text-white text-sm'>
                    {new Date(run.finishedAt).toLocaleString('tr-TR')}
                  </td>
                  <td className='px-6 py-4 text-white text-sm'>
                    {run.duration}s
                  </td>
                  <td className='px-6 py-4 text-red-400 text-sm'>
                    {run.error || '-'}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <button className='text-indigo-400 hover:text-indigo-300 transition-colors'>
                      <i className='ri-arrow-right-line'></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <p className='text-gray-400 text-sm'>
          Toplam {runs.length} çalışma gösteriliyor
        </p>
        <div className='flex gap-2'>
          <button className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors'>
            Önceki
          </button>
          <button className='px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors'>
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
