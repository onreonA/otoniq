/**
 * Accounts Tab - Platform bağlantıları
 */

import { motion } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { mockSocialAccounts } from '../../../mocks/socialMedia';

export default function AccountsTab() {
  const accounts = mockSocialAccounts;

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'from-pink-600 to-purple-600',
      facebook: 'from-blue-600 to-blue-700',
      twitter: 'from-sky-500 to-blue-600',
      linkedin: 'from-blue-700 to-blue-800',
      tiktok: 'from-gray-900 to-pink-600',
      youtube: 'from-red-600 to-red-700',
      pinterest: 'from-red-500 to-pink-600',
      threads: 'from-gray-800 to-gray-900',
    };
    return colors[platform] || 'from-gray-600 to-gray-700';
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>
            Sosyal Medya Hesapları
          </h2>
          <p className='text-sm text-gray-400 mt-1'>
            {accounts.filter(a => a.isConnected).length} / {accounts.length}{' '}
            hesap bağlı
          </p>
        </div>
        <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all'>
          <Plus size={18} />
          Yeni Hesap Bağla
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all'
          >
            <div className='flex items-center gap-4 mb-4'>
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPlatformColor(account.platform)} flex items-center justify-center text-2xl`}
              >
                {account.profileImage}
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-base font-semibold text-white truncate'>
                  {account.accountName}
                </h3>
                <p className='text-sm text-gray-400 truncate'>
                  @{account.accountUsername}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${account.isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              />
            </div>

            {account.isConnected ? (
              <>
                <div className='grid grid-cols-3 gap-3 mb-4'>
                  <div className='bg-white/5 rounded-lg p-2 text-center'>
                    <p className='text-xs text-gray-400 mb-0.5'>Takipçi</p>
                    <p className='text-sm font-bold text-white'>
                      {account.followers.toLocaleString()}
                    </p>
                  </div>
                  <div className='bg-white/5 rounded-lg p-2 text-center'>
                    <p className='text-xs text-gray-400 mb-0.5'>Post</p>
                    <p className='text-sm font-bold text-white'>
                      {account.postsCount}
                    </p>
                  </div>
                  <div className='bg-white/5 rounded-lg p-2 text-center'>
                    <p className='text-xs text-gray-400 mb-0.5'>Etkileşim</p>
                    <p className='text-sm font-bold text-green-400'>
                      {account.engagementRate}%
                    </p>
                  </div>
                </div>

                <button className='w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                  <RefreshCw size={14} />
                  Senkronize Et
                </button>
              </>
            ) : (
              <button className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                <Plus size={14} />
                Hesabı Bağla
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
