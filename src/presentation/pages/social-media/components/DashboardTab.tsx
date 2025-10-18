/**
 * Dashboard Tab - Genel Bakış
 * KPI'lar, canlı aktivite, hızlı aksiyonlar
 */

import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  Calendar,
  Heart,
  MessageCircle,
  Share2,
  Zap,
  Plus,
  Download,
  Activity,
} from 'lucide-react';
import { mockAnalytics, mockSocialMentions } from '../../../mocks/socialMedia';

export default function DashboardTab() {
  const analytics = mockAnalytics;
  const recentMentions = mockSocialMentions.slice(0, 5);

  return (
    <div className='space-y-6'>
      {/* KPI Cards */}
      <div className='grid grid-cols-4 gap-4'>
        {[
          {
            label: 'Toplam Takipçi',
            value: analytics.totalFollowers.toLocaleString(),
            change: `+${analytics.followerGrowth}%`,
            icon: Users,
            color: 'blue',
          },
          {
            label: 'Bu Ay Yeni Takipçi',
            value: analytics.newFollowers.toLocaleString(),
            change: '+12%',
            icon: TrendingUp,
            color: 'green',
          },
          {
            label: 'Etkileşim Oranı',
            value: `${analytics.engagementRate}%`,
            change: '+0.3%',
            icon: Heart,
            color: 'pink',
          },
          {
            label: 'Zamanlanmış Post',
            value: analytics.scheduledPosts,
            change: '8 post',
            icon: Calendar,
            color: 'purple',
          },
        ].map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
          >
            <div className='flex items-center justify-between mb-3'>
              <kpi.icon size={20} className={`text-${kpi.color}-400`} />
              <span className='text-xs text-green-400 font-medium'>
                {kpi.change}
              </span>
            </div>
            <p className='text-2xl font-bold text-white'>{kpi.value}</p>
            <p className='text-xs text-gray-400 mt-1'>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-3 gap-6'>
        {/* Engagement Trend */}
        <div className='col-span-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Etkileşim Trendi (Son 30 Gün)
          </h3>
          <div className='h-48 flex items-end justify-between gap-2'>
            {[45, 52, 48, 65, 58, 72, 68, 75, 82, 79, 88, 92].map(
              (height, i) => (
                <div key={i} className='flex-1 flex flex-col items-center'>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className='w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg'
                  />
                  <span className='text-xs text-gray-500 mt-2'>{i + 1}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Platform Dağılımı */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Platform Dağılımı
          </h3>
          <div className='space-y-3'>
            {analytics.platformPerformance.map((platform, index) => {
              const total = analytics.platformPerformance.reduce(
                (sum, p) => sum + p.followers,
                0
              );
              const percentage = ((platform.followers / total) * 100).toFixed(
                1
              );
              return (
                <div key={platform.platform}>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm text-white capitalize'>
                      {platform.platform}
                    </span>
                    <span className='text-sm font-bold text-white'>
                      {percentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={`h-2 rounded-full ${
                        platform.platform === 'instagram'
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                          : platform.platform === 'facebook'
                            ? 'bg-blue-600'
                            : platform.platform === 'twitter'
                              ? 'bg-sky-500'
                              : 'bg-blue-700'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-6'>
        {/* Hızlı Aksiyonlar */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            Hızlı Aksiyonlar
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            <button className='flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-3 rounded-lg font-medium transition-all'>
              <Plus size={18} />
              Hemen Paylaş
            </button>
            <button className='flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-medium transition-all'>
              <Zap size={18} />
              AI İçerik Üret
            </button>
            <button className='flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all'>
              <Activity size={18} />
              Otomasyon Kur
            </button>
            <button className='flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all'>
              <Download size={18} />
              Rapor İndir
            </button>
          </div>
        </div>

        {/* En İyi Performans Gösteren Post'lar */}
        <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-4'>
            En İyi Performans (Bu Hafta)
          </h3>
          <div className='space-y-3'>
            {analytics.topPosts.slice(0, 3).map((post, index) => (
              <div
                key={post.id}
                className='bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-lg font-bold text-blue-400'>
                    #{index + 1}
                  </span>
                  <p className='text-sm text-white line-clamp-1'>
                    {post.caption}
                  </p>
                </div>
                <div className='flex items-center gap-4 text-xs text-gray-400'>
                  <span className='flex items-center gap-1'>
                    <Heart size={12} className='text-red-400' />
                    {post.likesCount}
                  </span>
                  <span className='flex items-center gap-1'>
                    <MessageCircle size={12} className='text-blue-400' />
                    {post.commentsCount}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Share2 size={12} className='text-green-400' />
                    {post.sharesCount}
                  </span>
                  <span className='ml-auto text-cyan-400'>
                    {post.engagementRate}% etkileşim
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canlı Aktivite Akışı */}
      <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
          <Activity size={16} className='text-green-400' />
          Canlı Aktivite Akışı
        </h3>
        <div className='space-y-3'>
          {recentMentions.map((mention, index) => (
            <motion.div
              key={mention.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className='flex items-start gap-3 bg-white/5 rounded-lg p-3'
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  mention.sentiment === 'positive'
                    ? 'bg-green-400'
                    : mention.sentiment === 'negative'
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                }`}
              />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-sm font-medium text-white'>
                    {mention.author}
                  </span>
                  <span className='text-xs text-gray-500'>
                    @{mention.authorUsername}
                  </span>
                  <span className='text-xs text-gray-600'>•</span>
                  <span className='text-xs text-gray-500 capitalize'>
                    {mention.platform}
                  </span>
                </div>
                <p className='text-sm text-gray-300 line-clamp-2'>
                  {mention.content}
                </p>
              </div>
              <button className='text-xs text-blue-400 hover:text-blue-300'>
                Yanıtla
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
