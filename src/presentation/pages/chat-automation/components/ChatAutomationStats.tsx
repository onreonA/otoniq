/**
 * Chat Automation Stats Component
 * Displays WhatsApp & Telegram statistics
 */

import { motion } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Smile,
  TrendingUp,
} from 'lucide-react';
import { mockChatStats, getCombinedStats } from '../../../mocks/chatAutomation';

const StatCard = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  color,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  index: number;
}) => (
  <motion.div
    className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
  >
    <div className='flex items-center justify-between mb-3'>
      <Icon size={20} className={color} />
      <span className='text-xs text-gray-400'>Son 24 saat</span>
    </div>
    <div className='space-y-1'>
      <p className='text-3xl font-bold text-white'>
        {value}
        <span className='text-lg text-gray-400'>{suffix}</span>
      </p>
      <p className='text-sm text-gray-300'>{label}</p>
    </div>
  </motion.div>
);

export default function ChatAutomationStats() {
  const combinedStats = getCombinedStats();

  const stats = [
    {
      icon: MessageSquare,
      label: 'Toplam Konuşma',
      value: combinedStats.totalConversations.toLocaleString('tr-TR'),
      color: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Aktif Sohbet',
      value: combinedStats.activeConversations,
      color: 'text-green-400',
    },
    {
      icon: Clock,
      label: 'Ort. Yanıt Süresi',
      value: combinedStats.avgResponseTime,
      suffix: 's',
      color: 'text-purple-400',
    },
    {
      icon: CheckCircle,
      label: 'Çözüm Oranı',
      value: combinedStats.resolutionRate,
      suffix: '%',
      color: 'text-teal-400',
    },
    {
      icon: Smile,
      label: 'Müşteri Memnuniyeti',
      value: combinedStats.customerSatisfaction,
      suffix: '%',
      color: 'text-pink-400',
    },
    {
      icon: MessageSquare,
      label: 'Mesaj (24h)',
      value: combinedStats.messagesLast24h.toLocaleString('tr-TR'),
      color: 'text-orange-400',
    },
  ];

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-bold text-white'>İstatistikler</h2>
        <div className='flex items-center gap-3 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-green-500'></div>
            <span className='text-gray-300'>WhatsApp</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-blue-500'></div>
            <span className='text-gray-300'>Telegram</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      {/* Platform Breakdown */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {mockChatStats.map((platformStat, index) => (
          <motion.div
            key={platformStat.platform}
            className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5'
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white capitalize'>
                {platformStat.platform === 'whatsapp'
                  ? '💬 WhatsApp'
                  : '✈️ Telegram'}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  platformStat.platform === 'whatsapp'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {platformStat.activeConversations} Aktif
              </span>
            </div>

            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Toplam Konuşma</span>
                <span className='text-sm font-semibold text-white'>
                  {platformStat.totalConversations.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Yanıt Süresi</span>
                <span className='text-sm font-semibold text-white'>
                  {platformStat.avgResponseTime}s
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Çözüm Oranı</span>
                <span className='text-sm font-semibold text-green-400'>
                  {platformStat.resolutionRate}%
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-300'>Memnuniyet</span>
                <span className='text-sm font-semibold text-pink-400'>
                  {platformStat.customerSatisfaction}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
