/**
 * Chat Templates Component
 * Manage automated response templates for WhatsApp & Telegram
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Power, PowerOff, Copy } from 'lucide-react';
import {
  mockChatTemplates,
  ChatTemplate,
  getTemplatesByCategory,
} from '../../../mocks/chatAutomation';

export default function ChatTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<
    ChatTemplate['category'] | 'all'
  >('all');
  const [templates, setTemplates] = useState(mockChatTemplates);
  const [editingTemplate, setEditingTemplate] = useState<ChatTemplate | null>(
    null
  );

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : getTemplatesByCategory(selectedCategory);

  const getCategoryColor = (category: ChatTemplate['category']) => {
    switch (category) {
      case 'greeting':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'order-status':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'product-info':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'complaint':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'general':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryLabel = (category: ChatTemplate['category']) => {
    const labels = {
      greeting: 'Karşılama',
      'order-status': 'Sipariş Takibi',
      'product-info': 'Ürün Bilgisi',
      complaint: 'Şikayet/İade',
      general: 'Genel',
    };
    return labels[category];
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(
      templates.map(t =>
        t.id === templateId ? { ...t, active: !t.active } : t
      )
    );
  };

  const duplicateTemplate = (template: ChatTemplate) => {
    const newTemplate: ChatTemplate = {
      ...template,
      id: `TEMP${Date.now()}`,
      name: `${template.name} (Kopya)`,
    };
    setTemplates([...templates, newTemplate]);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white mb-2'>
            📝 Otomatik Yanıt Şablonları
          </h2>
          <p className='text-gray-400'>
            Bot'un müşterilere otomatik olarak göndereceği mesaj şablonlarını
            yönetin
          </p>
        </div>
        <button className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors'>
          <Plus size={18} />
          Yeni Şablon
        </button>
      </div>

      {/* Category Filter */}
      <div className='flex items-center gap-2 overflow-x-auto pb-2'>
        {[
          { key: 'all', label: 'Tümü', count: templates.length },
          {
            key: 'greeting',
            label: 'Karşılama',
            count: getTemplatesByCategory('greeting').length,
          },
          {
            key: 'order-status',
            label: 'Sipariş',
            count: getTemplatesByCategory('order-status').length,
          },
          {
            key: 'product-info',
            label: 'Ürün',
            count: getTemplatesByCategory('product-info').length,
          },
          {
            key: 'complaint',
            label: 'Şikayet',
            count: getTemplatesByCategory('complaint').length,
          },
          {
            key: 'general',
            label: 'Genel',
            count: getTemplatesByCategory('general').length,
          },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() =>
              setSelectedCategory(cat.key as ChatTemplate['category'] | 'all')
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {cat.label}{' '}
            <span
              className={`ml-1 ${
                selectedCategory === cat.key ? 'text-blue-200' : 'text-gray-500'
              }`}
            >
              ({cat.count})
            </span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <AnimatePresence mode='popLayout'>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all'
            >
              {/* Header */}
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h3 className='font-semibold text-white'>
                      {template.name}
                    </h3>
                    {template.active ? (
                      <Power size={14} className='text-green-400' />
                    ) : (
                      <PowerOff size={14} className='text-gray-500' />
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 rounded-lg text-xs font-medium border ${getCategoryColor(
                      template.category
                    )}`}
                  >
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => toggleTemplateStatus(template.id)}
                    className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                    title={template.active ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                  >
                    {template.active ? (
                      <Power size={16} className='text-green-400' />
                    ) : (
                      <PowerOff size={16} className='text-gray-500' />
                    )}
                  </button>
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                    title='Kopyala'
                  >
                    <Copy size={16} className='text-gray-400' />
                  </button>
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                    title='Düzenle'
                  >
                    <Edit2 size={16} className='text-blue-400' />
                  </button>
                  <button
                    className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                    title='Sil'
                  >
                    <Trash2 size={16} className='text-red-400' />
                  </button>
                </div>
              </div>

              {/* Triggers */}
              <div className='mb-3'>
                <p className='text-xs text-gray-400 mb-2'>Tetikleyiciler:</p>
                <div className='flex flex-wrap gap-1'>
                  {template.trigger.map((trigger, idx) => (
                    <span
                      key={idx}
                      className='px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300'
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>

              {/* Response Preview */}
              <div className='bg-white/5 rounded-xl p-3 mb-3'>
                <p className='text-xs text-gray-400 mb-1'>Yanıt:</p>
                <p className='text-sm text-white line-clamp-3'>
                  {template.response}
                </p>
              </div>

              {/* Footer */}
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-400'>
                  {template.language === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                </span>
                <span
                  className={`px-2 py-1 rounded-lg ${
                    template.active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {template.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className='flex flex-col items-center justify-center h-64 text-gray-400'>
          <p>Bu kategoride şablon bulunamadı</p>
        </div>
      )}
    </div>
  );
}
