/**
 * Chat Automation Page
 * WhatsApp, Telegram bot management and voice commands
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import FeatureIntro from '../../components/common/FeatureIntro';
import ChatAutomationStats from './components/ChatAutomationStats';
import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';
import VoiceCommandsPanel from './components/VoiceCommandsPanel';
import ChatTemplates from './components/ChatTemplates';
import TelegramCommands from './components/TelegramCommands';

interface ChatConversation {
  id: string;
  platform: 'whatsapp' | 'telegram';
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'resolved' | 'pending' | 'escalated' | 'archived';
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  assignedAgent?: string;
}

export default function ChatAutomationPage() {
  const [activeTab, setActiveTab] = useState<
    'conversations' | 'voice' | 'templates' | 'telegram'
  >('conversations');
  const [selectedConversation, setSelectedConversation] =
    useState<ChatConversation | null>(null);

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='chatAutomationIntro'
          title='🤖 AI Chatbot Otomasyonu ile 7/24 Müşteri Desteği'
          subtitle='WhatsApp ve Telegram üzerinden otomatik müşteri desteği sağlayın, sesli komutlarla sistemi yönetin ve müşteri memnuniyetini artırın.'
          items={[
            'WhatsApp & Telegram entegrasyonu',
            'Otomatik yanıt şablonları',
            'Sesli komut desteği',
            'Gerçek zamanlı konuşma takibi',
            'AI destekli sentiment analizi',
            'Müşteri memnuniyet raporları',
          ]}
          variant='green'
          dismissible={true}
        />

        {/* Stats Section */}
        <ChatAutomationStats />

        {/* Tab Navigation */}
        <div className='flex items-center gap-3 mb-6 overflow-x-auto pb-2'>
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'conversations'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            💬 Konuşmalar
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            📝 Şablonlar
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            ✈️ Telegram Komutları
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            🎙️ Sesli Komutlar
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'conversations' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Conversation List - Left Sidebar */}
            <motion.div
              className='lg:col-span-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4 h-[700px]'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ConversationList
                onSelectConversation={setSelectedConversation}
                selectedConversationId={selectedConversation?.id || null}
              />
            </motion.div>

            {/* Chat Window - Main Area */}
            <motion.div
              className='lg:col-span-2 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden h-[700px]'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ChatWindow conversation={selectedConversation} />
            </motion.div>
          </div>
        )}

        {activeTab === 'templates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatTemplates />
          </motion.div>
        )}

        {activeTab === 'telegram' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TelegramCommands />
          </motion.div>
        )}

        {activeTab === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VoiceCommandsPanel />
          </motion.div>
        )}
      </div>
    </div>
  );
}
