/**
 * Social Listening Tab
 * Mention tracking, sentiment analysis
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Smile,
  Meh,
  Frown,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import {
  mockSocialMentions,
  getMentionsBySentiment,
} from '../../../mocks/socialMedia';

export default function SocialListeningTab() {
  const [filter, setFilter] = useState<
    'all' | 'positive' | 'neutral' | 'negative'
  >('all');
  const mentions =
    filter === 'all' ? mockSocialMentions : getMentionsBySentiment(filter);

  const sentimentStats = {
    positive: getMentionsBySentiment('positive').length,
    neutral: getMentionsBySentiment('neutral').length,
    negative: getMentionsBySentiment('negative').length,
  };

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid grid-cols-4 gap-4'>
        {[
          {
            label: 'Toplam Mention',
            value: mockSocialMentions.length,
            icon: MessageCircle,
            color: 'blue',
          },
          {
            label: 'Pozitif',
            value: sentimentStats.positive,
            icon: Smile,
            color: 'green',
          },
          {
            label: 'Nötr',
            value: sentimentStats.neutral,
            icon: Meh,
            color: 'yellow',
          },
          {
            label: 'Negatif',
            value: sentimentStats.negative,
            icon: Frown,
            color: 'red',
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

      {/* Search & Filter */}
      <div className='flex items-center gap-4'>
        <div className='flex-1 relative'>
          <Search
            size={18}
            className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Mention, hashtag veya kullanıcı ara...'
            className='w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div className='bg-black/30 border border-white/10 rounded-lg p-1 inline-flex gap-1'>
          {[
            { id: 'all', label: 'Tümü', icon: MessageCircle },
            { id: 'positive', label: 'Pozitif', icon: Smile },
            { id: 'neutral', label: 'Nötr', icon: Meh },
            { id: 'negative', label: 'Negatif', icon: Frown },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                filter === f.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <f.icon size={16} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mentions List */}
      <div className='space-y-3'>
        {mentions.map((mention, index) => (
          <motion.div
            key={mention.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all'
          >
            <div className='flex items-start gap-4'>
              {/* Sentiment Indicator */}
              <div
                className={`p-3 rounded-xl ${
                  mention.sentiment === 'positive'
                    ? 'bg-green-500/20'
                    : mention.sentiment === 'negative'
                      ? 'bg-red-500/20'
                      : 'bg-yellow-500/20'
                }`}
              >
                {mention.sentiment === 'positive' ? (
                  <Smile size={24} className='text-green-400' />
                ) : mention.sentiment === 'negative' ? (
                  <Frown size={24} className='text-red-400' />
                ) : (
                  <Meh size={24} className='text-yellow-400' />
                )}
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-sm font-semibold text-white'>
                    {mention.author}
                  </span>
                  <span className='text-xs text-gray-500'>
                    @{mention.authorUsername}
                  </span>
                  <span className='px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300 capitalize'>
                    {mention.platform}
                  </span>
                  <span className='text-xs text-gray-600'>•</span>
                  <span className='text-xs text-gray-500'>
                    {new Date(mention.timestamp).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className='text-sm text-white mb-3'>{mention.content}</p>
                <div className='flex items-center gap-6 text-xs text-gray-400'>
                  <span>{mention.engagement.likes} beğeni</span>
                  <span>{mention.engagement.comments} yorum</span>
                  <span>{mention.engagement.shares} paylaşım</span>
                  <span className='ml-auto'>
                    Sentiment:{' '}
                    <span
                      className={`font-bold ${
                        mention.sentiment === 'positive'
                          ? 'text-green-400'
                          : mention.sentiment === 'negative'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {(mention.sentimentScore * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mention.isReplied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {mention.isReplied ? 'Yanıtlandı ✓' : 'Yanıtla'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trending Topics */}
      <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
          <TrendingUp size={16} className='text-orange-400' />
          Trending Hashtag'ler
        </h3>
        <div className='flex flex-wrap gap-2'>
          {[
            '#eticaret',
            '#AI',
            '#otomasyon',
            '#dijitalpazarlama',
            '#startup',
            '#teknoloji',
          ].map((hashtag, index) => (
            <button
              key={index}
              className='px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-blue-400 transition-all'
            >
              {hashtag}{' '}
              <span className='text-xs text-gray-500 ml-1'>
                ({42 - index * 5})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
