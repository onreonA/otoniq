/**
 * Chat Automation Stats Component
 * Displays WhatsApp & Telegram statistics
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Smile,
  TrendingUp,
} from 'lucide-react';
import { useSupabaseClient } from '../../../contexts/SupabaseContext';
import useUserProfileStore from '../../../store/userProfileStore';

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
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    avgResponseTime: 0,
    resolutionRate: 0,
    customerSatisfaction: 0,
    messagesLast24h: 0,
  });
  const [platformStats, setPlatformStats] = useState<
    Array<{
      platform: 'whatsapp' | 'telegram';
      totalConversations: number;
      activeConversations: number;
      avgResponseTime: number;
      resolutionRate: number;
      customerSatisfaction: number;
    }>
  >([
    {
      platform: 'whatsapp',
      totalConversations: 0,
      activeConversations: 0,
      avgResponseTime: 0,
      resolutionRate: 0,
      customerSatisfaction: 0,
    },
    {
      platform: 'telegram',
      totalConversations: 0,
      activeConversations: 0,
      avgResponseTime: 0,
      resolutionRate: 0,
      customerSatisfaction: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseClient = useSupabaseClient();
  const userProfile = useUserProfileStore(state => state.profile);

  useEffect(() => {
    if (!supabaseClient || !userProfile?.tenant_id) return;

    loadStats();
  }, [supabaseClient, userProfile?.tenant_id]);

  const loadStats = async () => {
    if (!supabaseClient || !userProfile?.tenant_id) return;

    setIsLoading(true);
    try {
      // Load today's stats from chat_stats_daily
      const today = new Date().toISOString().split('T')[0];

      const { data: todayStats, error: statsError } = await supabaseClient
        .from('chat_stats_daily')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('stat_date', today);

      if (statsError) {
        console.error('Error loading stats:', statsError);
      }

      // Calculate combined stats
      const allPlatformStat = todayStats?.find(s => s.platform === 'all');
      const whatsappStat = todayStats?.find(s => s.platform === 'whatsapp');
      const telegramStat = todayStats?.find(s => s.platform === 'telegram');

      if (allPlatformStat) {
        setStats({
          totalConversations: allPlatformStat.total_conversations || 0,
          activeConversations: allPlatformStat.new_conversations || 0,
          avgResponseTime: allPlatformStat.avg_response_time_seconds || 0,
          resolutionRate: allPlatformStat.resolution_rate || 0,
          customerSatisfaction:
            allPlatformStat.customer_satisfaction_score || 0,
          messagesLast24h: allPlatformStat.total_messages || 0,
        });
      } else {
        // Fallback: Load directly from conversations table
        const { data: conversations } = await supabaseClient
          .from('chat_conversations')
          .select('*')
          .eq('tenant_id', userProfile.tenant_id);

        const totalConv = conversations?.length || 0;
        const activeConv =
          conversations?.filter(c => c.status === 'active').length || 0;

        setStats({
          totalConversations: totalConv,
          activeConversations: activeConv,
          avgResponseTime: 0,
          resolutionRate: 0,
          customerSatisfaction: 0,
          messagesLast24h: 0,
        });
      }

      // Set platform-specific stats
      setPlatformStats([
        {
          platform: 'whatsapp',
          totalConversations: whatsappStat?.total_conversations || 0,
          activeConversations: whatsappStat?.new_conversations || 0,
          avgResponseTime: whatsappStat?.avg_response_time_seconds || 0,
          resolutionRate: whatsappStat?.resolution_rate || 0,
          customerSatisfaction:
            whatsappStat?.customer_satisfaction_score || 0,
        },
        {
          platform: 'telegram',
          totalConversations: telegramStat?.total_conversations || 0,
          activeConversations: telegramStat?.new_conversations || 0,
          avgResponseTime: telegramStat?.avg_response_time_seconds || 0,
          resolutionRate: telegramStat?.resolution_rate || 0,
          customerSatisfaction:
            telegramStat?.customer_satisfaction_score || 0,
        },
      ]);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      icon: MessageSquare,
      label: 'Toplam Konuşma',
      value: stats.totalConversations.toLocaleString('tr-TR'),
      color: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Aktif Sohbet',
      value: stats.activeConversations,
      color: 'text-green-400',
    },
    {
      icon: Clock,
      label: 'Ort. Yanıt Süresi',
      value: stats.avgResponseTime,
      suffix: 's',
      color: 'text-purple-400',
    },
    {
      icon: CheckCircle,
      label: 'Çözüm Oranı',
      value: stats.resolutionRate,
      suffix: '%',
      color: 'text-teal-400',
    },
    {
      icon: Smile,
      label: 'Müşteri Memnuniyeti',
      value: stats.customerSatisfaction,
      suffix: '%',
      color: 'text-pink-400',
    },
    {
      icon: MessageSquare,
      label: 'Mesaj (24h)',
      value: stats.messagesLast24h.toLocaleString('tr-TR'),
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
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5 animate-pulse'
            >
              <div className='h-20'></div>
            </div>
          ))
        ) : (
          statCards.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))
        )}
      </div>

      {/* Platform Breakdown */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {platformStats.map((platformStat, index) => (
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
