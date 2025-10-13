import { useState } from 'react';

export default function AIModelStatus() {
  const [aiModels] = useState([
    {
      name: 'GPT-4 Turbo',
      type: 'Language Model',
      status: 'active',
      usage: 87,
      requests: '45,892',
      latency: '120ms',
      accuracy: '98.5%',
      cost: '₺2,450',
    },
    {
      name: 'Claude 3.5 Sonnet',
      type: 'Language Model',
      status: 'active',
      usage: 72,
      requests: '32,156',
      latency: '95ms',
      accuracy: '97.8%',
      cost: '₺1,890',
    },
    {
      name: 'DALL-E 3',
      type: 'Image Generation',
      status: 'active',
      usage: 45,
      requests: '8,234',
      latency: '2.3s',
      accuracy: '96.2%',
      cost: '₺890',
    },
    {
      name: 'Whisper',
      type: 'Speech Recognition',
      status: 'maintenance',
      usage: 0,
      requests: '0',
      latency: '-',
      accuracy: '-',
      cost: '₺0',
    },
    {
      name: 'Custom Analytics',
      type: 'Data Analysis',
      status: 'active',
      usage: 93,
      requests: '67,543',
      latency: '45ms',
      accuracy: '99.1%',
      cost: '₺3,200',
    },
  ]);

  const [selectedModel, setSelectedModel] = useState(aiModels[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'maintenance':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'error':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Bakımda';
      case 'error':
        return 'Hata';
      default:
        return 'Bilinmiyor';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'from-green-500 to-emerald-500';
    if (usage < 80) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="space-y-6">
      {/* AI Models Overview */}
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
            <i className="ri-robot-line text-white text-2xl"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Model Durumu</h3>
            <p className="text-gray-300 text-sm">Yapay zeka modelleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiModels.map((model, index) => (
            <div
              key={index}
              onClick={() => setSelectedModel(model)}
              className={`bg-white/5 hover:bg-white/10 border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                selectedModel.name === model.name
                  ? 'border-purple-400'
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">{model.name}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(model.status)}`}
                >
                  {getStatusText(model.status)}
                </span>
              </div>

              <p className="text-gray-400 text-xs mb-3">{model.type}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Kullanım</span>
                  <span className="text-white">{model.usage}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getUsageColor(model.usage)} transition-all duration-300`}
                    style={{ width: `${model.usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Model Details */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">
              {selectedModel.name}
            </h3>
            <p className="text-gray-300 text-sm">{selectedModel.type}</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-xl transition-colors cursor-pointer">
              <i className="ri-play-line mr-2"></i>
              Başlat
            </button>
            <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl transition-colors cursor-pointer">
              <i className="ri-stop-line mr-2"></i>
              Durdur
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {selectedModel.requests}
            </div>
            <div className="text-gray-400 text-sm">İstek Sayısı</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {selectedModel.latency}
            </div>
            <div className="text-gray-400 text-sm">Gecikme</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {selectedModel.accuracy}
            </div>
            <div className="text-gray-400 text-sm">Doğruluk</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {selectedModel.cost}
            </div>
            <div className="text-gray-400 text-sm">Günlük Maliyet</div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <h4 className="text-white font-medium mb-4">24 Saatlik Performans</h4>
          <div className="flex items-end justify-between h-32 space-x-1">
            {Array.from({ length: 24 }, (_, i) => {
              const height = Math.random() * 80 + 20;
              return (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${i}:00 - ${Math.round(height)}% kullanım`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">AI Öngörüleri</h3>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <i className="ri-lightbulb-line text-yellow-400 mr-2"></i>
              <span className="text-white font-medium">
                Optimizasyon Önerisi
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              GPT-4 Turbo modelinin kullanımı yoğun saatlerde %15 azaltılabilir.
              Claude 3.5 Sonnet ile yük dengelemesi öneriliyor.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <i className="ri-trending-up-line text-green-400 mr-2"></i>
              <span className="text-white font-medium">Performans Artışı</span>
            </div>
            <p className="text-gray-300 text-sm">
              Custom Analytics modeli son güncellemeden sonra %12 daha hızlı
              çalışıyor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
