/**
 * Telegram Commands Component
 * Display and manage Telegram bot commands
 */

import { motion } from 'framer-motion';
import { Command, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface TelegramCommand {
  command: string;
  description: string;
  example: string;
  category: 'navigation' | 'query' | 'action' | 'support';
}

const telegramCommands: TelegramCommand[] = [
  {
    command: '/start',
    description: 'Bot ile konuşmaya başla',
    example: '/start',
    category: 'navigation',
  },
  {
    command: '/help',
    description: 'Yardım menüsünü göster',
    example: '/help',
    category: 'navigation',
  },
  {
    command: '/siparis',
    description: 'Sipariş durumunu sorgula',
    example: '/siparis #12345',
    category: 'query',
  },
  {
    command: '/urun',
    description: 'Ürün bilgisi al',
    example: '/urun iPhone 15 Pro',
    category: 'query',
  },
  {
    command: '/stok',
    description: 'Stok durumunu kontrol et',
    example: '/stok PROD001',
    category: 'query',
  },
  {
    command: '/bildirim',
    description: 'Stok bildirimi ayarla',
    example: '/bildirim PROD001',
    category: 'action',
  },
  {
    command: '/iade',
    description: 'İade talebi oluştur',
    example: '/iade #12345',
    category: 'action',
  },
  {
    command: '/destek',
    description: 'Canlı desteğe bağlan',
    example: '/destek',
    category: 'support',
  },
  {
    command: '/kampanya',
    description: 'Aktif kampanyaları görüntüle',
    example: '/kampanya',
    category: 'query',
  },
  {
    command: '/ayarlar',
    description: 'Bot ayarlarını düzenle',
    example: '/ayarlar',
    category: 'navigation',
  },
];

export default function TelegramCommands() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommand(command);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const getCategoryColor = (category: TelegramCommand['category']) => {
    switch (category) {
      case 'navigation':
        return 'bg-blue-500/20 text-blue-400';
      case 'query':
        return 'bg-green-500/20 text-green-400';
      case 'action':
        return 'bg-purple-500/20 text-purple-400';
      case 'support':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryLabel = (category: TelegramCommand['category']) => {
    const labels = {
      navigation: 'Navigasyon',
      query: 'Sorgulama',
      action: 'İşlem',
      support: 'Destek',
    };
    return labels[category];
  };

  const groupedCommands = telegramCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<TelegramCommand['category'], TelegramCommand[]>
  );

  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-start gap-4'>
          <div className='p-3 bg-blue-600/20 rounded-xl'>
            <Command size={24} className='text-blue-400' />
          </div>
          <div className='flex-1'>
            <h2 className='text-xl font-bold text-white mb-2'>
              ✈️ Telegram Bot Komutları
            </h2>
            <p className='text-gray-300 mb-4'>
              Telegram bot'unuzun desteklediği tüm komutlar. Müşteriler bu
              komutları kullanarak bot ile etkileşime geçebilir.
            </p>
            <div className='flex items-center gap-2 text-sm'>
              <span className='px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg'>
                {telegramCommands.length} Komut
              </span>
              <span className='px-3 py-1 bg-green-600/20 text-green-400 rounded-lg'>
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Commands by Category */}
      {Object.entries(groupedCommands).map(([category, commands], catIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: catIndex * 0.1 }}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
        >
          <div className='flex items-center gap-2 mb-4'>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold ${getCategoryColor(
                category as TelegramCommand['category']
              )}`}
            >
              {getCategoryLabel(category as TelegramCommand['category'])}
            </span>
            <span className='text-sm text-gray-400'>
              ({commands.length} komut)
            </span>
          </div>

          <div className='space-y-3'>
            {commands.map((cmd, index) => (
              <motion.div
                key={cmd.command}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className='bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <code className='px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg font-mono text-sm font-semibold'>
                        {cmd.command}
                      </code>
                      <button
                        onClick={() => copyToClipboard(cmd.command)}
                        className='opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all'
                        title='Kopyala'
                      >
                        {copiedCommand === cmd.command ? (
                          <CheckCircle size={14} className='text-green-400' />
                        ) : (
                          <Copy size={14} className='text-gray-400' />
                        )}
                      </button>
                    </div>
                    <p className='text-sm text-white mb-2'>{cmd.description}</p>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>Örnek:</span>
                      <code className='text-xs text-gray-400 bg-black/30 px-2 py-1 rounded'>
                        {cmd.example}
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Setup Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'
      >
        <h3 className='text-lg font-semibold text-white mb-4'>
          🔧 Bot Kurulum Talimatları
        </h3>
        <div className='space-y-3 text-sm text-gray-300'>
          <div className='flex items-start gap-3'>
            <span className='flex-shrink-0 w-6 h-6 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold'>
              1
            </span>
            <p>
              <strong className='text-white'>BotFather'a git:</strong>{' '}
              Telegram'da <code className='text-blue-400'>@BotFather</code>{' '}
              botunu aç
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='flex-shrink-0 w-6 h-6 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold'>
              2
            </span>
            <p>
              <strong className='text-white'>Komutları ayarla:</strong>{' '}
              <code className='text-blue-400'>/setcommands</code> komutunu
              kullan
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='flex-shrink-0 w-6 h-6 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold'>
              3
            </span>
            <p>
              <strong className='text-white'>Komut listesini yapıştır:</strong>{' '}
              Yukarıdaki komutları kopyalayıp BotFather'a gönder
            </p>
          </div>
          <div className='flex items-start gap-3'>
            <span className='flex-shrink-0 w-6 h-6 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold'>
              4
            </span>
            <p>
              <strong className='text-white'>Webhook ayarla:</strong> Otoniq.ai
              webhook URL'ini Telegram'a tanıt
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
