import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Clock, TrendingUp, Users, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SocialMediaPage() {
  const { userProfile } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'accounts' | 'posts' | 'analytics'
  >('accounts');

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, postsData] = await Promise.all([
        supabase
          .from('social_media_accounts')
          .select('*')
          .eq('tenant_id', userProfile?.tenant_id),
        supabase
          .from('social_media_posts')
          .select('*')
          .eq('tenant_id', userProfile?.tenant_id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setAccounts(accountsData.data || []);
      setPosts(postsData.data || []);
    } catch (error) {
      console.error('Error loading social media data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: 'ri-instagram-line',
      facebook: 'ri-facebook-line',
      twitter: 'ri-twitter-x-line',
      linkedin: 'ri-linkedin-line',
      tiktok: 'ri-tiktok-line',
    };
    return icons[platform] || 'ri-global-line';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'from-pink-600 to-purple-600',
      facebook: 'from-blue-600 to-blue-700',
      twitter: 'from-sky-500 to-blue-600',
      linkedin: 'from-blue-700 to-blue-800',
      tiktok: 'from-gray-900 to-pink-600',
    };
    return colors[platform] || 'from-gray-600 to-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'text-gray-400',
      scheduled: 'text-yellow-400',
      published: 'text-green-400',
      failed: 'text-red-400',
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Sosyal Medya Yönetimi
          </h1>
          <p className='text-gray-400'>
            Tüm sosyal medya hesaplarınızı tek yerden yönetin
          </p>
        </div>
        <button className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2'>
          <Plus size={18} />
          Yeni Gönderi
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center'>
              <Users size={20} className='text-blue-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Bağlı Hesaplar</div>
              <div className='text-2xl font-bold text-white'>
                {accounts.length}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center'>
              <TrendingUp size={20} className='text-green-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Yayınlanan</div>
              <div className='text-2xl font-bold text-white'>
                {posts.filter(p => p.status === 'published').length}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-yellow-600/20 rounded-xl flex items-center justify-center'>
              <Clock size={20} className='text-yellow-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Zamanlanmış</div>
              <div className='text-2xl font-bold text-white'>
                {posts.filter(p => p.status === 'scheduled').length}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center'>
              <Calendar size={20} className='text-purple-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Toplam Etkileşim</div>
              <div className='text-2xl font-bold text-white'>
                {posts.reduce(
                  (sum, p) =>
                    sum + (p.likes_count || 0) + (p.comments_count || 0),
                  0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-white/10'>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'accounts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Hesaplar
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Gönderiler
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Analitik
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <>
          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {accounts.length === 0 ? (
                <div className='col-span-full text-center py-12 text-gray-400'>
                  Henüz bağlı sosyal medya hesabı yok
                </div>
              ) : (
                accounts.map(account => (
                  <div
                    key={account.id}
                    className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all'
                  >
                    <div className='flex items-center gap-4 mb-4'>
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlatformColor(account.platform)} flex items-center justify-center`}
                      >
                        <i
                          className={`${getPlatformIcon(account.platform)} text-2xl text-white`}
                        ></i>
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-white font-semibold'>
                          {account.account_name}
                        </h3>
                        <p className='text-gray-400 text-sm'>
                          @{account.account_username}
                        </p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${account.is_connected ? 'bg-green-400' : 'bg-red-400'}`}
                      ></div>
                    </div>
                    <div className='text-sm text-gray-400'>
                      {account.is_connected ? 'Bağlı' : 'Bağlantı Kesildi'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className='space-y-4'>
              {posts.length === 0 ? (
                <div className='text-center py-12 text-gray-400'>
                  Henüz gönderi yok
                </div>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex-1'>
                        <p className='text-white mb-2'>{post.caption}</p>
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            {post.hashtags.map((tag: string, i: number) => (
                              <span key={i} className='text-blue-400 text-sm'>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className='flex items-center gap-6 text-sm text-gray-400'>
                      <div className='flex items-center gap-1'>
                        <i className='ri-heart-line'></i>
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <i className='ri-chat-3-line'></i>
                        <span>{post.comments_count || 0}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <i className='ri-share-line'></i>
                        <span>{post.shares_count || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className='text-center py-12 text-gray-400'>
              Analitik özellikleri yakında eklenecek
            </div>
          )}
        </>
      )}
    </div>
  );
}
