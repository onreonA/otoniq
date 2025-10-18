/**
 * Usage Analytics Component
 * System-wide usage analytics and metrics
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tenantManagementService } from '../../../../infrastructure/services/TenantManagementService';

export default function UsageAnalytics() {
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const stats = await tenantManagementService.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-700 rounded w-1/3 mb-4'></div>
            <div className='h-4 bg-gray-700 rounded w-1/2'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Kullanım Analizi
            </h2>
            <p className='text-gray-300'>
              Sistem geneli kullanım metrikleri ve istatistikleri
            </p>
          </div>

          {/* Time Range Selector */}
          <div className='flex space-x-2 bg-black/20 p-1 rounded-xl'>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              7 Gün
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              30 Gün
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '90d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              90 Gün
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Stats */}
      {systemStats && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
                <i className='ri-building-line text-blue-400 text-xl'></i>
              </div>
              <span className='text-blue-400 text-sm font-medium'>Toplam</span>
            </div>
            <div className='text-3xl font-bold text-white mb-1'>
              {systemStats.total_tenants}
            </div>
            <div className='text-gray-400 text-sm'>Müşteri</div>
            <div className='mt-4 flex items-center text-green-400 text-sm'>
              <i className='ri-arrow-up-line mr-1'></i>
              <span>{systemStats.active_tenants} aktif</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/20 rounded-xl p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center'>
                <i className='ri-user-line text-green-400 text-xl'></i>
              </div>
              <span className='text-green-400 text-sm font-medium'>Toplam</span>
            </div>
            <div className='text-3xl font-bold text-white mb-1'>
              {systemStats.total_users}
            </div>
            <div className='text-gray-400 text-sm'>Kullanıcı</div>
            <div className='mt-4 flex items-center text-gray-400 text-sm'>
              <i className='ri-user-add-line mr-1'></i>
              <span>
                Ortalama{' '}
                {Math.round(
                  systemStats.total_users / systemStats.total_tenants
                )}{' '}
                kullanıcı/müşteri
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center'>
                <i className='ri-money-dollar-circle-line text-purple-400 text-xl'></i>
              </div>
              <span className='text-purple-400 text-sm font-medium'>MRR</span>
            </div>
            <div className='text-3xl font-bold text-white mb-1'>
              ₺{systemStats.mrr?.toLocaleString('tr-TR') || 0}
            </div>
            <div className='text-gray-400 text-sm'>Aylık Gelir</div>
            <div className='mt-4 flex items-center text-purple-400 text-sm'>
              <i className='ri-line-chart-line mr-1'></i>
              <span>₺{systemStats.arr?.toLocaleString('tr-TR') || 0} ARR</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-gradient-to-br from-orange-600/20 to-orange-600/10 border border-orange-500/20 rounded-xl p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center'>
                <i className='ri-test-tube-line text-orange-400 text-xl'></i>
              </div>
              <span className='text-orange-400 text-sm font-medium'>
                Deneme
              </span>
            </div>
            <div className='text-3xl font-bold text-white mb-1'>
              {systemStats.trial_tenants}
            </div>
            <div className='text-gray-400 text-sm'>Deneme Hesabı</div>
            <div className='mt-4 flex items-center text-orange-400 text-sm'>
              <i className='ri-percent-line mr-1'></i>
              <span>
                %
                {Math.round(
                  (systemStats.trial_tenants / systemStats.total_tenants) * 100
                )}{' '}
                oran
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Usage Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* API Calls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        >
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-bold text-white mb-1'>
                API Çağrıları
              </h3>
              <p className='text-gray-400 text-sm'>
                Son{' '}
                {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'}{' '}
                gün
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
              <i className='ri-code-s-slash-line text-blue-400 text-xl'></i>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-300'>Toplam Çağrı</span>
              <span className='text-white font-bold text-lg'>1.2M</span>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full'
                style={{ width: '75%' }}
              ></div>
            </div>
            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Başarılı</div>
                <div className='text-green-400 font-bold'>98.5%</div>
              </div>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Hatalı</div>
                <div className='text-red-400 font-bold'>1.5%</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Storage Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        >
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-bold text-white mb-1'>
                Depolama Kullanımı
              </h3>
              <p className='text-gray-400 text-sm'>Toplam kapasite</p>
            </div>
            <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center'>
              <i className='ri-database-2-line text-purple-400 text-xl'></i>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-300'>Kullanılan</span>
              <span className='text-white font-bold text-lg'>
                245 GB / 500 GB
              </span>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full'
                style={{ width: '49%' }}
              ></div>
            </div>
            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Dosyalar</div>
                <div className='text-white font-bold'>180 GB</div>
              </div>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Veritabanı</div>
                <div className='text-white font-bold'>65 GB</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        >
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-bold text-white mb-1'>
                AI Kredileri
              </h3>
              <p className='text-gray-400 text-sm'>Aylık kullanım</p>
            </div>
            <div className='w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center'>
              <i className='ri-brain-line text-green-400 text-xl'></i>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-300'>Kullanılan</span>
              <span className='text-white font-bold text-lg'>45.2K / 100K</span>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full'
                style={{ width: '45%' }}
              ></div>
            </div>
            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Ortalama/Gün</div>
                <div className='text-white font-bold'>1.5K</div>
              </div>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Kalan</div>
                <div className='text-green-400 font-bold'>54.8K</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* N8N Executions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        >
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h3 className='text-xl font-bold text-white mb-1'>
                N8N Çalıştırmaları
              </h3>
              <p className='text-gray-400 text-sm'>Otomasyon workflow'ları</p>
            </div>
            <div className='w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center'>
              <i className='ri-robot-line text-orange-400 text-xl'></i>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-300'>Toplam</span>
              <span className='text-white font-bold text-lg'>8.5K</span>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <div
                className='bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full'
                style={{ width: '85%' }}
              ></div>
            </div>
            <div className='grid grid-cols-2 gap-4 pt-4 border-t border-white/10'>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Başarılı</div>
                <div className='text-green-400 font-bold'>96.2%</div>
              </div>
              <div>
                <div className='text-gray-400 text-sm mb-1'>Başarısız</div>
                <div className='text-red-400 font-bold'>3.8%</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Tenants by Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
      >
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h3 className='text-xl font-bold text-white mb-1'>
              En Çok Kullanan Müşteriler
            </h3>
            <p className='text-gray-400 text-sm'>
              Son {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'}{' '}
              gün
            </p>
          </div>
          <button className='text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors'>
            Tümünü Gör
            <i className='ri-arrow-right-line ml-1'></i>
          </button>
        </div>

        <div className='space-y-4'>
          {[
            {
              name: 'Acme Corporation',
              usage: 95,
              api: '125K',
              storage: '45 GB',
            },
            { name: 'TechStart Inc.', usage: 82, api: '98K', storage: '38 GB' },
            {
              name: 'Global Trade Co.',
              usage: 76,
              api: '87K',
              storage: '32 GB',
            },
            {
              name: 'Digital Solutions',
              usage: 68,
              api: '76K',
              storage: '28 GB',
            },
            {
              name: 'Innovation Labs',
              usage: 54,
              api: '62K',
              storage: '22 GB',
            },
          ].map((tenant, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors'
            >
              <div className='flex items-center space-x-4 flex-1'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold'>
                  {index + 1}
                </div>
                <div className='flex-1'>
                  <div className='text-white font-medium mb-1'>
                    {tenant.name}
                  </div>
                  <div className='w-full bg-white/10 rounded-full h-1.5'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full'
                      style={{ width: `${tenant.usage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-6 ml-6'>
                <div className='text-right'>
                  <div className='text-gray-400 text-xs mb-1'>API</div>
                  <div className='text-white text-sm font-medium'>
                    {tenant.api}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-gray-400 text-xs mb-1'>Depolama</div>
                  <div className='text-white text-sm font-medium'>
                    {tenant.storage}
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-gray-400 text-xs mb-1'>Kullanım</div>
                  <div className='text-blue-400 text-sm font-bold'>
                    {tenant.usage}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
      >
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h3 className='text-xl font-bold text-white mb-1'>
              Özellik Kullanım Oranları
            </h3>
            <p className='text-gray-400 text-sm'>Popüler özellikler</p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[
            { name: 'Ürün Yönetimi', usage: 92, color: 'blue' },
            { name: 'Marketplace Entegrasyonu', usage: 85, color: 'purple' },
            { name: 'N8N Otomasyon', usage: 78, color: 'orange' },
            { name: 'AI Analitik', usage: 71, color: 'green' },
            { name: 'Sipariş Yönetimi', usage: 68, color: 'pink' },
            { name: 'Sosyal Medya', usage: 54, color: 'cyan' },
          ].map((feature, index) => (
            <div key={index} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-300 text-sm'>{feature.name}</span>
                <span className={`text-${feature.color}-400 font-bold text-sm`}>
                  {feature.usage}%
                </span>
              </div>
              <div className='w-full bg-white/10 rounded-full h-2'>
                <div
                  className={`bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 h-2 rounded-full`}
                  style={{ width: `${feature.usage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
