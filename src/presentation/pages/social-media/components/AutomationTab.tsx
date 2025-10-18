/**
 * Automation Rules Tab
 * Otomasyon kuralları yönetimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import {
  mockAutomationRules,
  type AutomationType,
} from '../../../mocks/socialMedia';

export default function AutomationTab() {
  const [rules] = useState(mockAutomationRules);
  const [filter, setFilter] = useState<'all' | AutomationType>('all');

  const filteredRules =
    filter === 'all' ? rules : rules.filter(r => r.type === filter);

  const getTypeInfo = (type: AutomationType) => {
    const types = {
      auto_reply: { name: 'Otomatik Yanıt', color: 'blue', icon: '💬' },
      auto_engage: { name: 'Otomatik Etkileşim', color: 'purple', icon: '👍' },
      cross_post: { name: 'Çapraz Paylaşım', color: 'green', icon: '🔄' },
      content_recycle: {
        name: 'İçerik Geri Dönüşüm',
        color: 'yellow',
        icon: '♻️',
      },
      smart_schedule: { name: 'Akıllı Zamanlama', color: 'cyan', icon: '⏰' },
      crisis_management: { name: 'Kriz Yönetimi', color: 'red', icon: '🚨' },
    };
    return types[type];
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Otomasyon Kuralları</h2>
          <p className='text-sm text-gray-400 mt-1'>
            {rules.filter(r => r.isActive).length} aktif kural çalışıyor
          </p>
        </div>
        <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all'>
          <Plus size={18} />
          Yeni Kural Oluştur
        </button>
      </div>

      {/* Filter */}
      <div className='flex items-center gap-2 overflow-x-auto pb-2'>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Tümü ({rules.length})
        </button>
        {(
          [
            'auto_reply',
            'auto_engage',
            'cross_post',
            'content_recycle',
            'crisis_management',
          ] as AutomationType[]
        ).map(type => {
          const info = getTypeInfo(type);
          const count = rules.filter(r => r.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === type
                  ? `bg-${info.color}-500 text-white`
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {info.icon} {info.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Rules List */}
      <div className='space-y-3'>
        {filteredRules.map((rule, index) => {
          const typeInfo = getTypeInfo(rule.type);
          return (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all'
            >
              <div className='flex items-start gap-4'>
                {/* Status Indicator */}
                <div
                  className={`p-3 rounded-xl ${rule.isActive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}
                >
                  <span className='text-2xl'>{typeInfo.icon}</span>
                </div>

                {/* Rule Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h3 className='text-base font-semibold text-white mb-1'>
                        {rule.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 bg-${typeInfo.color}-500/20 text-${typeInfo.color}-400 rounded text-xs font-medium`}
                      >
                        {typeInfo.name}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button className='p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all'>
                        <Edit size={14} />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-all ${
                          rule.isActive
                            ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                            : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                        }`}
                      >
                        {rule.isActive ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                      </button>
                      <button className='p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all'>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Trigger & Action */}
                  <div className='grid grid-cols-2 gap-4 mb-3'>
                    <div className='bg-white/5 rounded-lg p-3'>
                      <p className='text-xs text-gray-400 mb-1'>Tetikleyici</p>
                      <p className='text-sm text-white font-medium'>
                        {rule.trigger.event}
                      </p>
                      {rule.trigger.keywords &&
                        rule.trigger.keywords.length > 0 && (
                          <div className='flex flex-wrap gap-1 mt-2'>
                            {rule.trigger.keywords.slice(0, 3).map(keyword => (
                              <span
                                key={keyword}
                                className='px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300'
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className='bg-white/5 rounded-lg p-3'>
                      <p className='text-xs text-gray-400 mb-1'>Aksiyon</p>
                      <p className='text-sm text-white font-medium'>
                        {rule.action.type}
                      </p>
                      {rule.action.delay && rule.action.delay > 0 && (
                        <p className='text-xs text-gray-500 mt-1'>
                          {rule.action.delay} saniye gecikme
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className='flex items-center gap-6 text-sm'>
                    <div>
                      <span className='text-gray-400'>Tetiklenme:</span>{' '}
                      <span className='text-white font-semibold'>
                        {rule.stats.timesTriggered}x
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Başarı Oranı:</span>{' '}
                      <span className='text-green-400 font-semibold'>
                        {rule.stats.successRate}%
                      </span>
                    </div>
                    {rule.stats.lastTriggered && (
                      <div>
                        <span className='text-gray-400'>Son:</span>{' '}
                        <span className='text-gray-300 text-xs'>
                          {new Date(rule.stats.lastTriggered).toLocaleString(
                            'tr-TR',
                            {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Setup Suggestions */}
      <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-5'>
        <h3 className='text-sm font-semibold text-white mb-3 flex items-center gap-2'>
          <CheckCircle size={16} className='text-blue-400' />
          Hızlı Kurulum Önerileri
        </h3>
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              title: 'DM Karşılama',
              desc: 'Yeni mesajlara otomatik yanıt',
              icon: '💬',
            },
            {
              title: 'Hashtag Takibi',
              desc: "Belirli hashtag'lere otomatik beğeni",
              icon: '🔖',
            },
            {
              title: 'Story Mention',
              desc: "Story'de bahsedildiğinde bildirim",
              icon: '📱',
            },
          ].map(suggestion => (
            <button
              key={suggestion.title}
              className='bg-white/5 hover:bg-white/10 rounded-lg p-4 text-left transition-all'
            >
              <div className='text-2xl mb-2'>{suggestion.icon}</div>
              <h4 className='text-sm font-semibold text-white mb-1'>
                {suggestion.title}
              </h4>
              <p className='text-xs text-gray-400'>{suggestion.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
