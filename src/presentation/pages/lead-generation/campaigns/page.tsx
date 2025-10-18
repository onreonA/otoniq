/**
 * Campaigns Page
 * Lead generation kampanyaları yönetimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Folder,
  Plus,
  MapPin,
  TrendingUp,
  Users,
  Mail,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Trash2,
  Eye,
  BarChart3,
} from 'lucide-react';
import {
  mockCampaigns,
  type LeadCampaign,
} from '../../../mocks/leadGeneration';

export default function CampaignsPage() {
  const [campaigns] = useState<LeadCampaign[]>(mockCampaigns);
  const [filter, setFilter] = useState<'all' | 'scanning' | 'completed'>('all');

  const filteredCampaigns = campaigns.filter(c =>
    filter === 'all' ? true : c.status === filter
  );

  const getStatusColor = (status: LeadCampaign['status']) => {
    switch (status) {
      case 'scanning':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'analyzing':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: LeadCampaign['status']) => {
    switch (status) {
      case 'scanning':
        return <Clock size={14} />;
      case 'analyzing':
        return <BarChart3 size={14} />;
      case 'completed':
        return <CheckCircle size={14} />;
      case 'paused':
        return <Pause size={14} />;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                <Folder size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>Kampanyalar</h1>
                <p className='text-sm text-gray-300 mt-1'>
                  Tüm lead generation kampanyalarınızı yönetin
                </p>
              </div>
            </div>

            <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all'>
              <Plus size={18} />
              Yeni Kampanya
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-6'>
        {/* Stats */}
        <div className='grid grid-cols-4 gap-4 mb-6'>
          {[
            {
              label: 'Toplam Kampanya',
              value: campaigns.length,
              icon: Folder,
              color: 'blue',
            },
            {
              label: 'Bulunan Lead',
              value: campaigns.reduce(
                (sum, c) => sum + c.stats.totalBusinesses,
                0
              ),
              icon: Users,
              color: 'purple',
            },
            {
              label: 'Gönderilen Email',
              value: campaigns.reduce((sum, c) => sum + c.stats.emailsSent, 0),
              icon: Mail,
              color: 'green',
            },
            {
              label: 'Yanıt Oranı',
              value: `${Math.round((campaigns.reduce((sum, c) => sum + c.stats.responses, 0) / campaigns.reduce((sum, c) => sum + c.stats.emailsSent, 0)) * 100)}%`,
              icon: TrendingUp,
              color: 'orange',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
            >
              <div className='flex items-center justify-between mb-3'>
                <stat.icon size={20} className={`text-${stat.color}-400`} />
              </div>
              <p className='text-2xl font-bold text-white'>{stat.value}</p>
              <p className='text-xs text-gray-400 mt-1'>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-2 mb-6 inline-flex gap-1'>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'scanning', label: 'Taranıyor' },
            { id: 'completed', label: 'Tamamlandı' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Campaigns Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='text-base font-semibold text-white mb-2'>
                    {campaign.name}
                  </h3>
                  <div className='flex items-center gap-2 text-xs text-gray-400'>
                    <MapPin size={12} />
                    {campaign.location.city}, {campaign.location.district}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}
                >
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </div>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <div className='bg-white/5 rounded-lg p-3'>
                  <p className='text-xs text-gray-400 mb-1'>İşletmeler</p>
                  <p className='text-lg font-bold text-white'>
                    {campaign.stats.totalBusinesses}
                  </p>
                </div>
                <div className='bg-white/5 rounded-lg p-3'>
                  <p className='text-xs text-gray-400 mb-1'>Yanıtlar</p>
                  <p className='text-lg font-bold text-green-400'>
                    {campaign.stats.responses}
                  </p>
                </div>
              </div>

              {/* Progress */}
              {campaign.status !== 'completed' && (
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-xs text-gray-400'>İlerleme</span>
                    <span className='text-xs text-blue-400'>65%</span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-1.5'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full'
                      style={{ width: '65%' }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className='flex items-center gap-2'>
                <button className='flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all'>
                  <Eye size={14} />
                  Görüntüle
                </button>
                <button className='p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all'>
                  <Play size={14} />
                </button>
                <button className='p-2 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-lg transition-all'>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
