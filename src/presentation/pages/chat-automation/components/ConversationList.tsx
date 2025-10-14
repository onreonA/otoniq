/**
 * Conversation List Component
 * Lists all WhatsApp & Telegram conversations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, AlertCircle } from 'lucide-react';
import {
  mockConversations,
  ChatConversation,
  getActiveConversations,
  getConversationsByPlatform,
  getConversationsByStatus,
} from '../../../mocks/chatAutomation';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ConversationListProps {
  onSelectConversation: (conversation: ChatConversation) => void;
  selectedConversationId: string | null;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const [filter, setFilter] = useState<
    'all' | 'whatsapp' | 'telegram' | 'active' | 'pending'
  >('all');

  const getFilteredConversations = () => {
    switch (filter) {
      case 'whatsapp':
        return getConversationsByPlatform('whatsapp');
      case 'telegram':
        return getConversationsByPlatform('telegram');
      case 'active':
        return getConversationsByStatus('active');
      case 'pending':
        return getConversationsByStatus('pending');
      default:
        return mockConversations;
    }
  };

  const filteredConversations = getFilteredConversations();

  const getSentimentColor = (sentiment: ChatConversation['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/20 text-green-400';
      case 'negative':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: ChatConversation['status']) => {
    switch (status) {
      case 'active':
        return (
          <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></div>
        );
      case 'pending':
        return <Clock size={12} className='text-yellow-400' />;
      case 'escalated':
        return <AlertCircle size={12} className='text-red-400' />;
      default:
        return <div className='w-2 h-2 rounded-full bg-gray-500'></div>;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Filter Tabs */}
      <div className='flex items-center gap-2 mb-4 overflow-x-auto pb-2'>
        {[
          { key: 'all', label: 'Tümü', count: mockConversations.length },
          {
            key: 'active',
            label: 'Aktif',
            count: getConversationsByStatus('active').length,
          },
          {
            key: 'pending',
            label: 'Bekleyen',
            count: getConversationsByStatus('pending').length,
          },
          {
            key: 'whatsapp',
            label: '💬 WhatsApp',
            count: getConversationsByPlatform('whatsapp').length,
          },
          {
            key: 'telegram',
            label: '✈️ Telegram',
            count: getConversationsByPlatform('telegram').length,
          },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.label}{' '}
            <span
              className={`ml-1 ${filter === tab.key ? 'text-blue-200' : 'text-gray-500'}`}
            >
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className='flex-1 overflow-y-auto space-y-2'>
        <AnimatePresence mode='popLayout'>
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedConversationId === conversation.id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'bg-black/20 border border-white/10 hover:bg-black/30'
              }`}
            >
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='text-3xl'>{conversation.customerAvatar}</div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h4 className='font-semibold text-white'>
                        {conversation.customerName}
                      </h4>
                      {getStatusIcon(conversation.status)}
                    </div>
                    <p className='text-xs text-gray-400'>
                      {conversation.customerPhone}
                    </p>
                  </div>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <span className='text-xs text-gray-400'>
                    {formatDistanceToNow(
                      new Date(conversation.lastMessageTime),
                      {
                        addSuffix: true,
                        locale: tr,
                      }
                    )}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className='px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full'>
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <p className='text-sm text-gray-300 line-clamp-1 mb-2'>
                {conversation.lastMessage}
              </p>

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      conversation.platform === 'whatsapp'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {conversation.platform === 'whatsapp'
                      ? 'WhatsApp'
                      : 'Telegram'}
                  </span>
                  {conversation.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className='px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${getSentimentColor(
                    conversation.sentiment
                  )}`}
                >
                  {conversation.sentiment === 'positive'
                    ? '😊'
                    : conversation.sentiment === 'negative'
                      ? '😠'
                      : '😐'}
                </span>
              </div>

              {conversation.assignedAgent && (
                <div className='mt-2 pt-2 border-t border-white/5'>
                  <p className='text-xs text-gray-400'>
                    👤 Temsilci:{' '}
                    <span className='text-gray-300'>
                      {conversation.assignedAgent}
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredConversations.length === 0 && (
          <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
            <MessageSquare size={48} className='mb-3 opacity-50' />
            <p>Bu filtre için konuşma bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
