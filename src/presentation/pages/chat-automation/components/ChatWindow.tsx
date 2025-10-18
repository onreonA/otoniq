/**
 * Chat Window Component
 * Displays conversation messages with real-time simulation
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  User,
  Bot,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getSupabaseClient } from '../../../../infrastructure/database/supabase/client';

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

interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'bot' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
}

interface ChatWindowProps {
  conversation: ChatConversation | null;
}

export default function ChatWindow({ conversation }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabaseClient = getSupabaseClient();

  // Load messages from database when conversation changes
  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
    } else {
      setLocalMessages([]);
    }
  }, [conversation]);

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      const transformedMessages: ChatMessage[] =
        data?.map(msg => ({
          id: msg.id,
          sender: msg.sender_type,
          content: msg.content,
          timestamp: msg.sent_at || msg.created_at,
          read: msg.read_status || false,
          type: msg.content_type || 'text',
        })) || [];

      setLocalMessages(transformedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !conversation) return;

    const newMessage: ChatMessage = {
      id: `MSG${Date.now()}`,
      sender: 'agent',
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    setLocalMessages([...localMessages, newMessage]);
    setMessageInput('');

    // Simulate bot response after 2 seconds
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: `MSG${Date.now() + 1}`,
        sender: 'bot',
        content:
          'Mesajınız müşteriye iletildi. Bot otomatik yanıt vermeye devam edecek.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
      };
      setLocalMessages(prev => [...prev, botResponse]);
    }, 2000);
  };

  if (!conversation) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-400'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <MessageSquare size={64} className='mx-auto mb-4 opacity-50' />
          <h3 className='text-xl font-semibold text-white mb-2'>
            Bir konuşma seçin
          </h3>
          <p className='text-sm'>
            Mesajları görüntülemek için sol taraftan bir konuşma seçin
          </p>
        </motion.div>
      </div>
    );
  }

  if (isLoadingMessages) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-gray-400'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-center'
        >
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-sm'>Mesajlar yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  const getMessageAlignment = (sender: ChatMessage['sender']) => {
    if (sender === 'customer') return 'justify-start';
    return 'justify-end';
  };

  const getMessageStyle = (sender: ChatMessage['sender']) => {
    switch (sender) {
      case 'customer':
        return 'bg-white/10 text-white';
      case 'bot':
        return 'bg-blue-600/20 border border-blue-500/30 text-white';
      case 'agent':
        return 'bg-green-600/20 border border-green-500/30 text-white';
      default:
        return 'bg-gray-600/20 text-white';
    }
  };

  const getMessageIcon = (sender: ChatMessage['sender']) => {
    switch (sender) {
      case 'bot':
        return <Bot size={14} className='text-blue-400' />;
      case 'agent':
        return <User size={14} className='text-green-400' />;
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Chat Header */}
      <div className='bg-black/30 backdrop-blur-sm border-b border-white/10 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='text-3xl'>{conversation.customerAvatar}</div>
            <div>
              <h3 className='font-semibold text-white'>
                {conversation.customerName}
              </h3>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-400'>
                  {conversation.customerPhone}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    conversation.platform === 'whatsapp'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {conversation.platform === 'whatsapp'
                    ? 'WhatsApp'
                    : 'Telegram'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
              <Phone size={18} className='text-gray-300' />
            </button>
            <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
              <Video size={18} className='text-gray-300' />
            </button>
            <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
              <Info size={18} className='text-gray-300' />
            </button>
            <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
              <MoreVertical size={18} className='text-gray-300' />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className='flex items-center gap-2 mt-3 flex-wrap'>
          {conversation.tags.map(tag => (
            <span
              key={tag}
              className='px-2 py-1 rounded-lg bg-white/5 text-gray-300 text-xs'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <AnimatePresence>
          {localMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`flex ${getMessageAlignment(message.sender)}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-3 ${getMessageStyle(
                  message.sender
                )}`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  {getMessageIcon(message.sender)}
                  <span className='text-xs font-medium text-gray-300'>
                    {message.sender === 'customer'
                      ? conversation.customerName
                      : message.sender === 'bot'
                        ? 'AI Bot'
                        : 'Temsilci'}
                  </span>
                </div>
                <p className='text-sm mb-1'>{message.content}</p>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs text-gray-400'>
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                  {!message.read && message.sender !== 'customer' && (
                    <span className='text-xs text-blue-400'>●</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className='bg-black/30 backdrop-blur-sm border-t border-white/10 p-4'>
        <div className='flex items-center gap-3'>
          <button className='p-2 hover:bg-white/10 rounded-lg transition-colors'>
            <Paperclip size={20} className='text-gray-300' />
          </button>
          <input
            type='text'
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder='Mesajınızı yazın...'
            className='flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50'
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className='p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors'
          >
            <Send size={20} className='text-white' />
          </button>
        </div>
        <p className='text-xs text-gray-400 mt-2'>
          💡 AI Bot otomatik yanıt vermeye devam ediyor. Müdahale etmek için
          mesaj gönderin.
        </p>
      </div>
    </div>
  );
}
