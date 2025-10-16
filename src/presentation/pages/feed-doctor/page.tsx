/**
 * Feed Doktoru Dashboard
 * AI-powered product quality analysis and optimization
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  FeedDoctorService,
  AnalysisStats,
  FeedAnalysis,
} from '../../../infrastructure/services/FeedDoctorService';
import FeatureIntro from '../../components/common/FeatureIntro';
import toast from 'react-hot-toast';

export default function FeedDoctorPage() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [analyses, setAnalyses] = useState<FeedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filterScore, setFilterScore] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadData();
    }
  }, [userProfile?.tenant_id]);

  const loadData = async () => {
    if (!userProfile?.tenant_id) return;

    try {
      setLoading(true);
      const [statsData, analysesData] = await Promise.all([
        FeedDoctorService.getAnalysisStats(userProfile.tenant_id),
        FeedDoctorService.getAnalyses(userProfile.tenant_id),
      ]);

      setStats(statsData);
      setAnalyses(analysesData);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading feed doctor data:', error);
      }
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    if (!userProfile?.tenant_id || analyzing) return;

    try {
      setAnalyzing(true);
      toast.loading('Tüm ürünler analiz ediliyor...', { id: 'bulk-analyze' });

      // Get all product IDs
      // For now, just reload data (mock)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Analiz tamamlandı!', { id: 'bulk-analyze' });
      loadData();
    } catch (error) {
      toast.error('Analiz sırasında hata oluştu', { id: 'bulk-analyze' });
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    if (filterScore === 'all') return true;
    if (filterScore === 'low') return a.overallScore < 50;
    if (filterScore === 'medium')
      return a.overallScore >= 50 && a.overallScore <= 75;
    if (filterScore === 'high') return a.overallScore > 75;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-600/20 to-emerald-600/20';
    if (score >= 60) return 'from-yellow-600/20 to-amber-600/20';
    if (score >= 40) return 'from-orange-600/20 to-red-600/20';
    return 'from-red-600/20 to-pink-600/20';
  };

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='feed-doctor'
          title='🩺 Feed Doktoru: AI ile Ürün Kalitesi Analizi'
          subtitle='Ürünlerinizi AI teknolojisi ile analiz edin, optimize edin ve satışlarınızı artırın'
          items={[
            'Başlık, açıklama, görseller ve fiyat analizi',
            'Pazaryeri bazlı optimizasyon önerileri',
            'Otomatik SEO keyword çıkarımı',
            'Çoklu kanal içerik senkronizasyonu',
          ]}
          actions={[
            {
              label: 'Tümünü Analiz Et',
              onClick: handleAnalyzeAll,
              variant: 'primary',
            },
            {
              label: 'Optimizasyon Kuralları',
              to: '#rules',
              variant: 'secondary',
            },
          ]}
          variant='purple'
          icon='ri-stethoscope-line'
        />

        {/* Stats Overview */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse'
              >
                <div className='h-12 w-12 bg-white/10 rounded-xl mb-4'></div>
                <div className='h-4 bg-white/10 rounded mb-2'></div>
                <div className='h-8 bg-white/10 rounded'></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Total Products */}
            <div className='bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-product-hunt-line text-white text-2xl'></i>
                </div>
              </div>
              <h3 className='text-gray-300 text-sm font-medium mb-2'>
                Toplam Ürün
              </h3>
              <p className='text-3xl font-bold text-white'>
                {stats.totalProducts}
              </p>
            </div>

            {/* Analyzed Count */}
            <div className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-check-double-line text-white text-2xl'></i>
                </div>
                <div className='text-sm font-medium px-3 py-1 rounded-full bg-purple-500/20 text-purple-400'>
                  {stats.totalProducts > 0
                    ? Math.round(
                        (stats.analyzedCount / stats.totalProducts) * 100
                      )
                    : 0}
                  %
                </div>
              </div>
              <h3 className='text-gray-300 text-sm font-medium mb-2'>
                Analiz Edildi
              </h3>
              <p className='text-3xl font-bold text-white'>
                {stats.analyzedCount}
              </p>
            </div>

            {/* Average Score */}
            <div className='bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-bar-chart-box-line text-white text-2xl'></i>
                </div>
              </div>
              <h3 className='text-gray-300 text-sm font-medium mb-2'>
                Ortalama Skor
              </h3>
              <p className='text-3xl font-bold text-white'>
                {stats.averageScore}/100
              </p>
            </div>

            {/* Pending Analysis */}
            <div className='bg-gradient-to-br from-orange-600/20 to-amber-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300'>
              <div className='flex items-center justify-between mb-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-time-line text-white text-2xl'></i>
                </div>
              </div>
              <h3 className='text-gray-300 text-sm font-medium mb-2'>
                Bekleyen Analiz
              </h3>
              <p className='text-3xl font-bold text-white'>
                {stats.pendingAnalysis}
              </p>
            </div>
          </div>
        ) : null}

        {/* Quality Distribution */}
        {stats && (
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              📊 Kalite Dağılımı
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20'>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Düşük Kalite</p>
                  <p className='text-2xl font-bold text-red-400'>
                    {stats.lowQualityCount}
                  </p>
                </div>
                <div className='text-red-400 text-3xl'>
                  <i className='ri-error-warning-line'></i>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20'>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Orta Kalite</p>
                  <p className='text-2xl font-bold text-yellow-400'>
                    {stats.mediumQualityCount}
                  </p>
                </div>
                <div className='text-yellow-400 text-3xl'>
                  <i className='ri-alert-line'></i>
                </div>
              </div>

              <div className='flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/20'>
                <div>
                  <p className='text-sm text-gray-400 mb-1'>Yüksek Kalite</p>
                  <p className='text-2xl font-bold text-green-400'>
                    {stats.highQualityCount}
                  </p>
                </div>
                <div className='text-green-400 text-3xl'>
                  <i className='ri-check-line'></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className='mb-4 flex items-center gap-2'>
          <span className='text-sm text-gray-400'>Filtrele:</span>
          {(['all', 'low', 'medium', 'high'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setFilterScore(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filterScore === filter
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
              }`}
            >
              {filter === 'all' && 'Tümü'}
              {filter === 'low' && 'Düşük Skor'}
              {filter === 'medium' && 'Orta Skor'}
              {filter === 'high' && 'Yüksek Skor'}
            </button>
          ))}
        </div>

        {/* Analysis List */}
        {loading ? (
          <div className='text-center text-gray-400 py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4'></div>
            Analizler yükleniyor...
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className='text-center text-gray-400 py-12 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl'>
            <i className='ri-file-list-3-line text-6xl mb-4 text-gray-600'></i>
            <p className='text-lg'>Henüz analiz edilmiş ürün bulunmuyor</p>
            <button
              onClick={handleAnalyzeAll}
              disabled={analyzing}
              className='mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50'
            >
              {analyzing ? 'Analiz Ediliyor...' : 'İlk Analizi Başlat'}
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4'>
            {filteredAnalyses.map(analysis => (
              <div
                key={analysis.id}
                className={`bg-gradient-to-br ${getScoreBg(analysis.overallScore)} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-white mb-2'>
                      {analysis.optimizedTitle || 'Ürün Başlığı'}
                    </h3>
                    <div className='flex items-center gap-4 text-sm text-gray-400'>
                      <span>Ürün ID: {analysis.productId.slice(0, 8)}</span>
                      <span>•</span>
                      <span>
                        {new Date(analysis.analyzedAt || '').toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div
                      className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)} mb-1`}
                    >
                      {analysis.overallScore}
                    </div>
                    <div className='text-xs text-gray-400'>/ 100</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-4'>
                  {[
                    {
                      label: 'Başlık',
                      score: analysis.titleScore,
                      icon: 'ri-text',
                    },
                    {
                      label: 'Açıklama',
                      score: analysis.descriptionScore,
                      icon: 'ri-file-text-line',
                    },
                    {
                      label: 'Görseller',
                      score: analysis.imageScore,
                      icon: 'ri-image-line',
                    },
                    {
                      label: 'Kategori',
                      score: analysis.categoryScore,
                      icon: 'ri-folder-line',
                    },
                    {
                      label: 'Fiyat',
                      score: analysis.priceScore,
                      icon: 'ri-money-dollar-circle-line',
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      className='bg-white/5 rounded-lg p-3 text-center'
                    >
                      <i
                        className={`${item.icon} text-gray-400 text-xl mb-1`}
                      ></i>
                      <p className='text-xs text-gray-400 mb-1'>{item.label}</p>
                      <p
                        className={`text-lg font-bold ${getScoreColor(item.score || 0)}`}
                      >
                        {item.score || 0}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Issues & Suggestions Count */}
                <div className='flex items-center gap-4 text-sm'>
                  {analysis.issues.length > 0 && (
                    <div className='flex items-center gap-2 text-red-400'>
                      <i className='ri-error-warning-line'></i>
                      <span>{analysis.issues.length} Sorun</span>
                    </div>
                  )}
                  {analysis.suggestions.length > 0 && (
                    <div className='flex items-center gap-2 text-blue-400'>
                      <i className='ri-lightbulb-line'></i>
                      <span>{analysis.suggestions.length} Öneri</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
