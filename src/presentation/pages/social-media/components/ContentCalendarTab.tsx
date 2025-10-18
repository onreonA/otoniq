/**
 * Content Calendar Tab
 * İçerik takvimi ve zamanlama
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { mockSocialPosts } from '../../../mocks/socialMedia';

export default function ContentCalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const posts = mockSocialPosts.filter(p => p.status === 'scheduled');

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  return (
    <div className='space-y-6'>
      {/* Calendar Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
            className='p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all'
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className='text-2xl font-bold text-white'>
            {currentDate.toLocaleDateString('tr-TR', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
            className='p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all'
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className='flex items-center gap-3'>
          <div className='bg-black/30 border border-white/10 rounded-lg p-1 inline-flex gap-1'>
            {['month', 'week', 'day'].map(v => (
              <button
                key={v}
                onClick={() => setView(v as typeof view)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  view === v
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {v === 'month' ? 'Aylık' : v === 'week' ? 'Haftalık' : 'Günlük'}
              </button>
            ))}
          </div>
          <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-all'>
            <Plus size={18} />
            Yeni Post Planla
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
        <div className='grid grid-cols-7 gap-2 mb-4'>
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div
              key={day}
              className='text-center text-sm font-semibold text-gray-400 py-2'
            >
              {day}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-2'>
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className='aspect-square' />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPosts = posts.filter(p => {
              const postDate = new Date(p.scheduledDate || '');
              return (
                postDate.getDate() === day &&
                postDate.getMonth() === currentDate.getMonth()
              );
            });

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`aspect-square p-2 rounded-lg border transition-all cursor-pointer ${
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth()
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className='text-sm font-semibold text-white mb-1'>
                  {day}
                </div>
                <div className='space-y-1'>
                  {dayPosts.slice(0, 2).map(post => (
                    <div
                      key={post.id}
                      className={`w-full h-1 rounded-full ${
                        post.platform.includes('instagram')
                          ? 'bg-pink-500'
                          : post.platform.includes('facebook')
                            ? 'bg-blue-500'
                            : 'bg-cyan-500'
                      }`}
                    />
                  ))}
                  {dayPosts.length > 2 && (
                    <div className='text-xs text-gray-500'>
                      +{dayPosts.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Posts Queue */}
      <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
        <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
          <Clock size={16} className='text-yellow-400' />
          Zamanlanmış Post Kuyruğu ({posts.length})
        </h3>
        <div className='space-y-3'>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className='flex items-start gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-2'>
                  {post.platform.map(p => (
                    <span
                      key={p}
                      className='px-2 py-0.5 bg-white/10 rounded text-xs font-medium text-gray-300 capitalize'
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <p className='text-sm text-white line-clamp-2 mb-2'>
                  {post.caption}
                </p>
                <div className='flex items-center gap-4 text-xs text-gray-400'>
                  <span className='flex items-center gap-1'>
                    <Calendar size={12} />
                    {new Date(post.scheduledDate || '').toLocaleDateString(
                      'tr-TR'
                    )}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Clock size={12} />
                    {new Date(post.scheduledDate || '').toLocaleTimeString(
                      'tr-TR',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button className='p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all'>
                  <Edit size={14} />
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
