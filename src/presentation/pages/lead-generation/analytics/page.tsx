/**
 * Lead Generation Analytics Page
 * Performans analizi ve raporlama
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  Target,
  DollarSign,
  Calendar,
  Download,
} from 'lucide-react';
import { getCampaignStats } from '../../../mocks/leadGeneration';

export default function AnalyticsPage() {
  const stats = getCampaignStats();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                <BarChart3 size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>Analitikler</h1>
                <p className='text-sm text-gray-300 mt-1'>
                  Lead generation performans raporları
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='bg-black/30 border border-white/10 rounded-lg p-1 inline-flex gap-1'>
                {[
                  { id: '7d', label: '7 Gün' },
                  { id: '30d', label: '30 Gün' },
                  { id: '90d', label: '90 Gün' },
                ].map(range => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id as typeof timeRange)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      timeRange === range.id
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
              <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                <Download size={18} />
                Rapor İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-6'>
        {/* Key Metrics */}
        <div className='grid grid-cols-6 gap-4 mb-6'>
          {[
            {
              label: 'Toplam Kampanya',
              value: stats.totalCampaigns,
              change: '+12%',
              icon: Target,
              color: 'blue',
            },
            {
              label: 'Aktif Kampanya',
              value: stats.activeCampaigns,
              change: '+5%',
              icon: Calendar,
              color: 'green',
            },
            {
              label: 'Toplam Lead',
              value: stats.totalLeads,
              change: '+23%',
              icon: Users,
              color: 'purple',
            },
            {
              label: 'Nitelikli Lead',
              value: stats.qualifiedLeads,
              change: '+18%',
              icon: Target,
              color: 'cyan',
            },
            {
              label: 'Kişi Bulundu',
              value: stats.totalContacts,
              change: '+31%',
              icon: Mail,
              color: 'orange',
            },
            {
              label: 'Yanıt Oranı',
              value: `${Math.round(stats.responseRate * 100)}%`,
              change: '+8%',
              icon: TrendingUp,
              color: 'yellow',
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
            >
              <div className='flex items-center justify-between mb-3'>
                <metric.icon size={18} className={`text-${metric.color}-400`} />
                <span className='text-xs text-green-400 font-medium'>
                  {metric.change}
                </span>
              </div>
              <p className='text-2xl font-bold text-white'>{metric.value}</p>
              <p className='text-xs text-gray-400 mt-1'>{metric.label}</p>
            </motion.div>
          ))}
        </div>

        <div className='grid grid-cols-2 gap-6 mb-6'>
          {/* Lead Conversion Funnel */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>
              Dönüşüm Hunisi
            </h3>
            <div className='space-y-3'>
              {[
                {
                  stage: 'Keşfedilen İşletmeler',
                  count: 226,
                  percentage: 100,
                  color: 'blue',
                },
                {
                  stage: 'Kişi Bulundu',
                  count: 174,
                  percentage: 77,
                  color: 'purple',
                },
                {
                  stage: 'İletişime Geçildi',
                  count: 113,
                  percentage: 50,
                  color: 'cyan',
                },
                {
                  stage: 'Yanıt Alındı',
                  count: 31,
                  percentage: 14,
                  color: 'green',
                },
                {
                  stage: 'Nitelikli Lead',
                  count: 15,
                  percentage: 7,
                  color: 'yellow',
                },
                {
                  stage: 'Dönüşüm',
                  count: 7,
                  percentage: 3,
                  color: 'orange',
                },
              ].map((stage, idx) => (
                <div key={stage.stage}>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white'>{stage.stage}</span>
                    <span className='text-sm font-bold text-white'>
                      {stage.count} ({stage.percentage}%)
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className={`bg-gradient-to-r from-${stage.color}-500 to-${stage.color}-600 h-2 rounded-full transition-all`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Time Analysis */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>
              Yanıt Süresi Analizi
            </h3>
            <div className='space-y-3'>
              {[
                { range: '< 24 saat', count: 12, percentage: 39 },
                { range: '1-3 gün', count: 9, percentage: 29 },
                { range: '3-7 gün', count: 6, percentage: 19 },
                { range: '> 7 gün', count: 4, percentage: 13 },
              ].map((range, idx) => (
                <div key={range.range}>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-white'>{range.range}</span>
                    <span className='text-sm font-bold text-white'>
                      {range.count} lead ({range.percentage}%)
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full'
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-6'>
          {/* Top Performing Campaigns */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>
              En Başarılı Kampanyalar
            </h3>
            <div className='space-y-3'>
              {[
                { name: 'Kadıköy Restoran', leads: 156, responses: 23 },
                { name: 'Beyoğlu Butik Otel', leads: 42, responses: 8 },
                { name: 'Ankara Çankaya E-Ticaret', leads: 28, responses: 4 },
              ].map((campaign, idx) => (
                <div key={campaign.name} className='bg-white/5 rounded-lg p-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-white'>
                      {campaign.name}
                    </span>
                    <span className='text-xs text-gray-400'>#{idx + 1}</span>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <p className='text-xs text-gray-400'>Lead</p>
                      <p className='text-sm font-bold text-white'>
                        {campaign.leads}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400'>Yanıt</p>
                      <p className='text-sm font-bold text-green-400'>
                        {campaign.responses}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>
              Kanal Performansı
            </h3>
            <div className='space-y-3'>
              {[
                {
                  channel: 'Email',
                  sent: 98,
                  opened: 72,
                  responded: 18,
                  color: 'blue',
                },
                {
                  channel: 'LinkedIn',
                  sent: 45,
                  opened: 38,
                  responded: 9,
                  color: 'purple',
                },
                {
                  channel: 'Telefon',
                  sent: 23,
                  opened: 23,
                  responded: 12,
                  color: 'green',
                },
              ].map(channel => (
                <div
                  key={channel.channel}
                  className='bg-white/5 rounded-lg p-3'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-white'>
                      {channel.channel}
                    </span>
                    <span
                      className={`text-xs font-bold text-${channel.color}-400`}
                    >
                      {Math.round((channel.responded / channel.sent) * 100)}%
                    </span>
                  </div>
                  <div className='grid grid-cols-3 gap-2'>
                    <div>
                      <p className='text-xs text-gray-400'>Gönderilen</p>
                      <p className='text-sm font-bold text-white'>
                        {channel.sent}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400'>Açılan</p>
                      <p className='text-sm font-bold text-blue-400'>
                        {channel.opened}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-400'>Yanıt</p>
                      <p className='text-sm font-bold text-green-400'>
                        {channel.responded}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROI Projection */}
          <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
            <h3 className='text-sm font-semibold text-white mb-4'>
              ROI Projeksiyonu
            </h3>
            <div className='space-y-4'>
              <div className='bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 text-center'>
                <DollarSign size={24} className='text-green-400 mx-auto mb-2' />
                <p className='text-3xl font-bold text-white mb-1'>$28,500</p>
                <p className='text-xs text-gray-300'>Tahmini Gelir</p>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-400'>
                    Kampanya Maliyeti
                  </span>
                  <span className='text-sm font-bold text-white'>$3,200</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-400'>Dönüşüm Değeri</span>
                  <span className='text-sm font-bold text-white'>$28,500</span>
                </div>
                <div className='h-px bg-white/10 my-2' />
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-400'>ROI</span>
                  <span className='text-lg font-bold text-green-400'>
                    +790%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
