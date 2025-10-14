/**
 * IoT Dashboard Page
 * Real-time warehouse monitoring, sensors, and alerts
 */

import { motion } from 'framer-motion';
import FeatureIntro from '../../components/common/FeatureIntro';
import {
  mockSensors,
  mockAlerts,
  mockWarehouseZones,
  getOnlineSensors,
  getWarningSensors,
  getCriticalAlerts,
} from '../../mocks/iot';
import {
  Activity,
  AlertTriangle,
  Wifi,
  WifiOff,
  Battery,
  Thermometer,
} from 'lucide-react';

export default function IoTPage() {
  const onlineSensors = getOnlineSensors();
  const warningSensors = getWarningSensors();
  const criticalAlerts = getCriticalAlerts();

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return '🌡️';
      case 'humidity':
        return '💧';
      case 'motion':
        return '👁️';
      case 'door':
        return '🚪';
      case 'stock':
        return '📦';
      case 'energy':
        return '⚡';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'offline':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        <FeatureIntro
          storageKey='iotIntro'
          title='📡 IoT ile Akıllı Depo Yönetimi'
          subtitle='Gerçek zamanlı sensör verileri ile deponuzu 7/24 izleyin, sıcaklık, nem, hareket ve stok seviyelerini takip edin.'
          items={[
            'Gerçek zamanlı sensör izleme',
            'Otomatik alarm sistemi',
            'Enerji tüketimi analizi',
            'Akıllı stok takibi',
            'Uzaktan kontrol',
            'Tarihsel data analizi',
          ]}
          variant='orange'
          dismissible={true}
        />

        {/* Stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Wifi size={20} className='text-green-400' />
              <span className='text-xs text-gray-400'>Aktif Sensörler</span>
            </div>
            <p className='text-3xl font-bold text-white'>
              {onlineSensors.length}
            </p>
            <p className='text-sm text-gray-300'>
              /{mockSensors.length} Toplam
            </p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <AlertTriangle size={20} className='text-yellow-400' />
              <span className='text-xs text-gray-400'>Uyarılar</span>
            </div>
            <p className='text-3xl font-bold text-white'>
              {warningSensors.length}
            </p>
            <p className='text-sm text-gray-300'>Dikkat Gerekli</p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Activity size={20} className='text-red-400' />
              <span className='text-xs text-gray-400'>Kritik Alarmlar</span>
            </div>
            <p className='text-3xl font-bold text-white'>
              {criticalAlerts.length}
            </p>
            <p className='text-sm text-gray-300'>Acil Müdahale</p>
          </motion.div>

          <motion.div
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <Thermometer size={20} className='text-blue-400' />
              <span className='text-xs text-gray-400'>Depo Sıcaklığı</span>
            </div>
            <p className='text-3xl font-bold text-white'>22.5°C</p>
            <p className='text-sm text-gray-300'>Normal Seviye</p>
          </motion.div>
        </div>

        {/* Sensors Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {mockSensors.map((sensor, index) => (
            <motion.div
              key={sensor.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all'
            >
              <div className='flex items-start justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>{getSensorIcon(sensor.type)}</span>
                  <div>
                    <h3 className='font-semibold text-white text-sm'>
                      {sensor.name}
                    </h3>
                    <p className='text-xs text-gray-400'>{sensor.location}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(sensor.status)}`}
                >
                  {sensor.status}
                </span>
              </div>

              <div className='mb-3'>
                <p className='text-3xl font-bold text-white'>
                  {sensor.currentValue.toFixed(1)}
                  <span className='text-lg text-gray-400 ml-1'>
                    {sensor.unit}
                  </span>
                </p>
                <p className='text-xs text-gray-400 mt-1'>
                  Eşik: {sensor.minThreshold} - {sensor.maxThreshold}{' '}
                  {sensor.unit}
                </p>
              </div>

              <div className='flex items-center justify-between text-xs text-gray-400'>
                <div className='flex items-center gap-1'>
                  <Battery size={12} />
                  {sensor.battery}%
                </div>
                <div>
                  {sensor.status === 'online' ? (
                    <Wifi size={12} className='text-green-400' />
                  ) : (
                    <WifiOff size={12} className='text-red-400' />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Alerts */}
        {mockAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
          >
            <h2 className='text-xl font-bold text-white mb-4'>
              🚨 Son Alarmlar
            </h2>
            <div className='space-y-3'>
              {mockAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.type === 'critical'
                      ? 'bg-red-600/10 border-red-500/30'
                      : alert.type === 'warning'
                        ? 'bg-yellow-600/10 border-yellow-500/30'
                        : 'bg-blue-600/10 border-blue-500/30'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-white mb-1'>
                        {alert.sensorName}
                      </h3>
                      <p className='text-sm text-gray-300'>{alert.message}</p>
                      <p className='text-xs text-gray-400 mt-2'>
                        {new Date(alert.timestamp).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <button className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors'>
                        Onayla
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
