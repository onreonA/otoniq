import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { Mail, Users, TrendingUp, Send, Plus, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function EmailCampaignsPage() {
  const { userProfile } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'campaigns' | 'recipients' | 'templates'
  >('campaigns');

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: campaignsData } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('tenant_id', userProfile?.tenant_id)
        .order('created_at', { ascending: false })
        .limit(50);

      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('Error loading email campaigns:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_time: 'Tek Seferlik',
      drip: 'Otomatik Serisi',
      promotional: 'Promosyon',
      newsletter: 'Bülten',
      transactional: 'İşlemsel',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      scheduled: 'bg-yellow-500/20 text-yellow-400',
      sending: 'bg-blue-500/20 text-blue-400',
      sent: 'bg-green-500/20 text-green-400',
      paused: 'bg-orange-500/20 text-orange-400',
      failed: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Taslak',
      scheduled: 'Zamanlanmış',
      sending: 'Gönderiliyor',
      sent: 'Gönderildi',
      paused: 'Duraklatıldı',
      failed: 'Başarısız',
    };
    return labels[status] || status;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-white mb-2'>
            E-posta Kampanyaları
          </h1>
          <p className='text-gray-400'>
            Müşterilerinize e-posta kampanyaları oluşturun ve gönderin
          </p>
        </div>
        <button className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2'>
          <Plus size={18} />
          Yeni Kampanya
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center'>
              <Mail size={20} className='text-blue-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Toplam Kampanya</div>
              <div className='text-2xl font-bold text-white'>
                {campaigns.length}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center'>
              <Send size={20} className='text-green-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Gönderilen</div>
              <div className='text-2xl font-bold text-white'>
                {campaigns.reduce(
                  (sum, c) => sum + (c.sent_count || 0),
                  0
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center'>
              <TrendingUp size={20} className='text-purple-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Açılma Oranı</div>
              <div className='text-2xl font-bold text-white'>
                {campaigns.length > 0
                  ? (
                      (campaigns.reduce(
                        (sum, c) => sum + (c.opened_count || 0),
                        0
                      ) /
                        campaigns.reduce(
                          (sum, c) => sum + (c.sent_count || 1),
                          0
                        )) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center gap-3 mb-2'>
            <div className='w-10 h-10 bg-yellow-600/20 rounded-xl flex items-center justify-center'>
              <Users size={20} className='text-yellow-400' />
            </div>
            <div>
              <div className='text-gray-400 text-sm'>Tıklama Oranı</div>
              <div className='text-2xl font-bold text-white'>
                {campaigns.length > 0
                  ? (
                      (campaigns.reduce(
                        (sum, c) => sum + (c.clicked_count || 0),
                        0
                      ) /
                        campaigns.reduce(
                          (sum, c) => sum + (c.sent_count || 1),
                          0
                        )) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-white/10'>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Kampanyalar
        </button>
        <button
          onClick={() => setActiveTab('recipients')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'recipients'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Alıcılar
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Şablonlar
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className='space-y-4'>
              {campaigns.length === 0 ? (
                <div className='text-center py-12 text-gray-400'>
                  Henüz kampanya oluşturulmamış
                </div>
              ) : (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all'
                  >
                    <div className='flex justify-between items-start mb-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='text-white font-semibold text-lg'>
                            {campaign.campaign_name}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                          >
                            {getStatusLabel(campaign.status)}
                          </span>
                          <span className='px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400'>
                            {getCampaignTypeLabel(campaign.campaign_type)}
                          </span>
                        </div>
                        <p className='text-gray-400 text-sm mb-3'>
                          {campaign.subject_line}
                        </p>
                        {campaign.scheduled_at && (
                          <div className='flex items-center gap-2 text-sm text-gray-400'>
                            <Calendar size={16} />
                            <span>
                              Planlandı:{' '}
                              {new Date(
                                campaign.scheduled_at
                              ).toLocaleString('tr-TR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='grid grid-cols-4 gap-4 pt-4 border-t border-white/10'>
                      <div>
                        <div className='text-gray-400 text-xs mb-1'>
                          Gönderilen
                        </div>
                        <div className='text-white font-semibold'>
                          {campaign.sent_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-400 text-xs mb-1'>
                          Açılan
                        </div>
                        <div className='text-white font-semibold'>
                          {campaign.opened_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-400 text-xs mb-1'>
                          Tıklanan
                        </div>
                        <div className='text-white font-semibold'>
                          {campaign.clicked_count || 0}
                        </div>
                      </div>
                      <div>
                        <div className='text-gray-400 text-xs mb-1'>
                          İptal
                        </div>
                        <div className='text-white font-semibold'>
                          {campaign.unsubscribed_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Recipients Tab */}
          {activeTab === 'recipients' && (
            <div className='text-center py-12 text-gray-400'>
              Alıcı listeleri özelliği yakında eklenecek
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className='text-center py-12 text-gray-400'>
              E-posta şablonları özelliği yakında eklenecek
            </div>
          )}
        </>
      )}
    </div>
  );
}

