/**
 * Map Scanner Page
 * Google Maps üzerinde bölge tarama ve işletme bulma
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Search,
  Filter,
  Play,
  Pause,
  Building2,
  Star,
  Phone,
  Globe,
  Target,
  Zap,
  Settings,
  Download,
} from 'lucide-react';

export default function MapScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const categories = [
    'Restoran',
    'Cafe',
    'Otel',
    'Mağaza',
    'Ofis',
    'Kuaför',
    'Spor Salonu',
    'Eczane',
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [radius, setRadius] = useState(2000);
  const [minRating, setMinRating] = useState(4.0);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStartScan = () => {
    setIsScanning(true);
    // Simüle progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                <MapPin size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Bölgesel Tarama
                </h1>
                <p className='text-sm text-gray-300 mt-1'>
                  Harita üzerinde işletmeleri keşfet ve potansiyel müşterileri
                  bul
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                <Download size={18} />
                Sonuçları İndir
              </button>
              <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                <Settings size={18} />
                Ayarlar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-6 py-6'>
        <div className='grid grid-cols-12 gap-6'>
          {/* Left Panel - Filters */}
          <div className='col-span-3 space-y-4'>
            {/* Location */}
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <MapPin size={16} className='text-blue-400' />
                Konum Seçimi
              </h3>

              <div className='space-y-3'>
                <div>
                  <label className='block text-xs text-gray-400 mb-2'>
                    Şehir
                  </label>
                  <select className='w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <option>İstanbul</option>
                    <option>Ankara</option>
                    <option>İzmir</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs text-gray-400 mb-2'>
                    İlçe
                  </label>
                  <select className='w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <option>Kadıköy</option>
                    <option>Beyoğlu</option>
                    <option>Beşiktaş</option>
                  </select>
                </div>

                <div>
                  <label className='block text-xs text-gray-400 mb-2'>
                    Yarıçap: {radius}m
                  </label>
                  <input
                    type='range'
                    min='500'
                    max='5000'
                    step='500'
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500'
                  />
                  <div className='flex justify-between text-xs text-gray-500 mt-1'>
                    <span>500m</span>
                    <span>5km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <Filter size={16} className='text-purple-400' />
                Kategori Seçimi
              </h3>

              <div className='space-y-2'>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <Star size={16} className='text-yellow-400' />
                Minimum Puan
              </h3>

              <div>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-gray-300'>Puan</span>
                  <span className='text-lg font-bold text-yellow-400'>
                    {minRating.toFixed(1)} ⭐
                  </span>
                </div>
                <input
                  type='range'
                  min='0'
                  max='5'
                  step='0.1'
                  value={minRating}
                  onChange={e => setMinRating(Number(e.target.value))}
                  className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500'
                />
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartScan}
              disabled={isScanning || selectedCategories.length === 0}
              className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all'
            >
              {isScanning ? (
                <>
                  <Pause size={20} />
                  Tarama Devam Ediyor...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Taramayı Başlat
                </>
              )}
            </button>

            {isScanning && (
              <div className='bg-black/30 border border-white/10 rounded-xl p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm text-gray-300'>İlerleme</span>
                  <span className='text-sm font-bold text-blue-400'>
                    %{scanProgress}
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className='bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center - Map */}
          <div className='col-span-6'>
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-[calc(100vh-200px)]'>
              <div className='w-full h-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center'>
                <div className='text-center'>
                  <MapPin
                    size={64}
                    className='text-blue-400 mx-auto mb-4 opacity-50'
                  />
                  <p className='text-white text-lg font-medium mb-2'>
                    Google Maps Entegrasyonu
                  </p>
                  <p className='text-gray-400 text-sm'>
                    Harita görünümü burada gösterilecek
                  </p>
                  <p className='text-xs text-gray-500 mt-4'>
                    (Google Maps API gerektirir)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className='col-span-3 space-y-4'>
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <Target size={16} className='text-green-400' />
                Bulunan İşletmeler
              </h3>

              <div className='space-y-3'>
                {/* Mock Result */}
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className='bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-all'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='text-2xl'>
                        {i === 1 ? '🍽️' : i === 2 ? '☕' : '🏨'}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-medium text-white truncate'>
                          {i === 1
                            ? 'Moda Balık'
                            : i === 2
                              ? 'Barista Coffee'
                              : 'Boutique Hotel'}
                        </h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <Star size={12} className='text-yellow-400' />
                          <span className='text-xs text-gray-400'>
                            4.{5 + i}
                          </span>
                          <span className='text-xs text-gray-600'>•</span>
                          <span className='text-xs text-gray-400'>
                            {300 + i * 100} yorum
                          </span>
                        </div>
                        <div className='flex items-center gap-1 mt-2'>
                          <Phone size={10} className='text-blue-400' />
                          <span className='text-xs text-gray-500'>✓</span>
                          <Globe size={10} className='text-green-400' />
                          <span className='text-xs text-gray-500'>
                            {i === 1 ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {scanProgress === 100 && (
                <button className='w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-all'>
                  <Zap size={18} />
                  Kampanya Oluştur
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
