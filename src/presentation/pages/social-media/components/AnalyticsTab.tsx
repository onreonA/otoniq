/**
 * Analytics Tab - Detaylı analitik ve raporlar
 */

import { motion } from 'framer-motion';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import { mockAnalytics } from '../../../mocks/socialMedia';

export default function AnalyticsTab() {
  const analytics = mockAnalytics;

  return (
    <div className='space-y-6'>
      {/* Header with Export */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-white'>Performans Analizi</h2>
        <div className='flex items-center gap-3'>
          <select className='px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
            <option>Son 7 Gün</option>
            <option>Son 30 Gün</option>
            <option>Son 90 Gün</option>
          </select>
          <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all'>
            <Download size={18} />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Platform Performance Cards */}
      <div className='grid grid-cols-2 gap-6'>
        {analytics.platformPerformance.map((platform, index) => (
          <motion.div
            key={platform.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-semibold text-white capitalize'>
                {platform.platform}
              </h3>
              <TrendingUp className='text-green-400' size={20} />
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Takipçi</p>
                <p className='text-xl font-bold text-white'>
                  {platform.followers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Etkileşim</p>
                <p className='text-xl font-bold text-blue-400'>
                  {platform.engagement.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-400 mb-1'>Erişim</p>
                <p className='text-xl font-bold text-purple-400'>
                  {platform.reach.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Best Posting Times */}
      <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
          <Calendar size={16} className='text-yellow-400' />
          En İyi Paylaşım Saatleri
        </h3>
        <div className='grid grid-cols-4 gap-4'>
          {analytics.bestPostingTimes.map((time, index) => (
            <div key={index} className='bg-white/5 rounded-lg p-4'>
              <p className='text-xs text-gray-400 mb-1'>{time.day}</p>
              <p className='text-lg font-bold text-white'>{time.hour}:00</p>
              <div className='mt-2'>
                <div className='w-full bg-gray-700 rounded-full h-1.5'>
                  <div
                    className='bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full'
                    style={{ width: `${time.performance}%` }}
                  />
                </div>
                <p className='text-xs text-green-400 mt-1'>
                  {time.performance}% performans
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audience Demographics */}
      <div className='grid grid-cols-3 gap-6'>
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Yaş Grupları
          </h3>
          <div className='space-y-3'>
            {analytics.audienceDemographics.ageGroups.map((group, index) => (
              <div key={index}>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-white'>{group.range}</span>
                  <span className='text-sm font-bold text-blue-400'>
                    {group.percentage}%
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className='bg-blue-500 h-2 rounded-full'
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Cinsiyet Dağılımı
          </h3>
          <div className='space-y-4'>
            {[
              {
                label: 'Erkek',
                value: analytics.audienceDemographics.genderSplit.male,
                color: 'blue',
              },
              {
                label: 'Kadın',
                value: analytics.audienceDemographics.genderSplit.female,
                color: 'pink',
              },
              {
                label: 'Diğer',
                value: analytics.audienceDemographics.genderSplit.other,
                color: 'purple',
              },
            ].map((item, index) => (
              <div key={index}>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-white'>{item.label}</span>
                  <span className={`text-sm font-bold text-${item.color}-400`}>
                    {item.value}%
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            En Çok Takipçi
          </h3>
          <div className='space-y-2'>
            {analytics.audienceDemographics.topLocations.map(
              (location, index) => (
                <div
                  key={index}
                  className='flex items-center justify-between bg-white/5 rounded-lg p-2'
                >
                  <span className='text-sm text-white'>{location.city}</span>
                  <span className='text-sm font-bold text-purple-400'>
                    {location.percentage}%
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
