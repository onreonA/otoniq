/**
 * Sequences Page
 * Otomatik outreach sequence yönetimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  mockSequences,
  type OutreachSequence,
} from '../../../mocks/leadGeneration';

export default function SequencesPage() {
  const [sequences] = useState<OutreachSequence[]>(mockSequences);

  const getChannelIcon = (channel: OutreachSequence['channel']) => {
    switch (channel) {
      case 'email':
        return <Mail size={16} />;
      case 'linkedin':
        return <MessageSquare size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'multi':
        return <Zap size={16} />;
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
                <Zap size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Outreach Sequences
                </h1>
                <p className='text-sm text-gray-300 mt-1'>
                  Otomatik iletişim kampanyaları
                </p>
              </div>
            </div>

            <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all'>
              <Plus size={18} />
              Yeni Sequence
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-6'>
        {/* Stats */}
        <div className='grid grid-cols-5 gap-4 mb-6'>
          {[
            {
              label: 'Aktif Sequence',
              value: sequences.filter(s => s.active).length,
              icon: Play,
              color: 'green',
            },
            {
              label: 'Gönderilen',
              value: sequences.reduce((sum, s) => sum + s.stats.sent, 0),
              icon: Mail,
              color: 'blue',
            },
            {
              label: 'Açılma Oranı',
              value: `${Math.round((sequences.reduce((sum, s) => sum + s.stats.opened, 0) / sequences.reduce((sum, s) => sum + s.stats.sent, 0)) * 100)}%`,
              icon: TrendingUp,
              color: 'purple',
            },
            {
              label: 'Yanıt',
              value: sequences.reduce((sum, s) => sum + s.stats.responded, 0),
              icon: MessageSquare,
              color: 'cyan',
            },
            {
              label: 'Dönüşüm',
              value: sequences.reduce((sum, s) => sum + s.stats.converted, 0),
              icon: Zap,
              color: 'yellow',
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

        {/* Sequences */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {sequences.map((sequence, index) => (
            <motion.div
              key={sequence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`p-2 rounded-lg ${
                      sequence.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {getChannelIcon(sequence.channel)}
                  </div>
                  <div>
                    <h3 className='text-base font-semibold text-white'>
                      {sequence.name}
                    </h3>
                    <p className='text-xs text-gray-400 mt-1'>
                      {sequence.steps.length} adım • {sequence.channel}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sequence.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {sequence.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className='grid grid-cols-5 gap-2 mb-4'>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-gray-400'>Gönderilen</p>
                  <p className='text-sm font-bold text-white'>
                    {sequence.stats.sent}
                  </p>
                </div>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-gray-400'>Açılan</p>
                  <p className='text-sm font-bold text-blue-400'>
                    {sequence.stats.opened}
                  </p>
                </div>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-gray-400'>Tıklanan</p>
                  <p className='text-sm font-bold text-purple-400'>
                    {sequence.stats.clicked}
                  </p>
                </div>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-gray-400'>Yanıt</p>
                  <p className='text-sm font-bold text-cyan-400'>
                    {sequence.stats.responded}
                  </p>
                </div>
                <div className='bg-white/5 rounded-lg p-2'>
                  <p className='text-xs text-gray-400'>Dönüşüm</p>
                  <p className='text-sm font-bold text-green-400'>
                    {sequence.stats.converted}
                  </p>
                </div>
              </div>

              {/* Steps Timeline */}
              <div className='mb-4'>
                <p className='text-xs text-gray-400 mb-2'>Adımlar</p>
                <div className='space-y-2'>
                  {sequence.steps.slice(0, 3).map((step, idx) => (
                    <div
                      key={step.id}
                      className='flex items-center gap-3 bg-white/5 rounded-lg p-2'
                    >
                      <div className='flex items-center justify-center w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold'>
                        {step.order}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-white truncate'>
                          {step.subject}
                        </p>
                        <div className='flex items-center gap-2 text-xs text-gray-400 mt-0.5'>
                          <Clock size={10} />
                          <span>
                            {step.delayDays === 0
                              ? 'Hemen'
                              : `${step.delayDays} gün sonra`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center gap-2'>
                <button className='flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all'>
                  <Edit size={14} />
                  Düzenle
                </button>
                <button
                  className={`p-2 rounded-lg text-white transition-all ${
                    sequence.active
                      ? 'bg-orange-500/20 hover:bg-orange-500/30'
                      : 'bg-green-500/20 hover:bg-green-500/30'
                  }`}
                >
                  {sequence.active ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all'>
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
