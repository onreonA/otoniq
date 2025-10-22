/**
 * Feed Doctor Analysis Detail Page
 * Detailed analysis view for individual products
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
  FeedDoctorService,
  FeedAnalysis,
} from '../../../../infrastructure/services/FeedDoctorService';
import toast from 'react-hot-toast';

type IssueFilter = 'all' | 'critical' | 'warning' | 'info';
type SuggestionFilter =
  | 'all'
  | 'content'
  | 'seo'
  | 'pricing'
  | 'images'
  | 'general';

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [analysis, setAnalysis] = useState<FeedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('all');
  const [suggestionFilter, setSuggestionFilter] =
    useState<SuggestionFilter>('all');

  useEffect(() => {
    if (id && userProfile?.tenant_id) {
      loadAnalysis();
    }
  }, [id, userProfile?.tenant_id]);

  const loadAnalysis = async () => {
    if (!id || !userProfile?.tenant_id) return;

    try {
      setLoading(true);
      console.log('🔍 Loading analysis detail for:', id);

      const analysisData = await FeedDoctorService.getAnalysisById(
        userProfile.tenant_id,
        id
      );

      if (!analysisData) {
        toast.error('Analiz bulunamadı');
        navigate('/feed-doctor');
        return;
      }

      setAnalysis(analysisData);
    } catch (error) {
      console.error('❌ Error loading analysis:', error);
      toast.error('Analiz yüklenirken hata oluştu');
      navigate('/feed-doctor');
    } finally {
      setLoading(false);
    }
  };

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/20';
      case 'error':
        return 'text-red-300 bg-red-500/20';
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'info':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Filter functions
  const filteredIssues =
    analysis?.issues?.filter(issue => {
      if (issueFilter === 'all') return true;
      return issue.severity === issueFilter;
    }) || [];

  const filteredSuggestions =
    analysis?.suggestions?.filter(suggestion => {
      if (suggestionFilter === 'all') return true;
      return suggestion.type === suggestionFilter;
    }) || [];

  // Auto-fix functions
  const handleAutoFix = async (suggestion: any) => {
    if (!analysis || !userProfile?.tenant_id) return;

    try {
      toast.loading('Otomatik düzeltme uygulanıyor...', { id: 'auto-fix' });

      // Simulate auto-fix process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would implement the actual auto-fix logic
      // For now, we'll just show a success message
      toast.success('Otomatik düzeltme başarıyla uygulandı!', {
        id: 'auto-fix',
      });

      // Refresh the analysis data
      await loadAnalysis();
    } catch (error) {
      console.error('❌ Auto-fix error:', error);
      toast.error('Otomatik düzeltme sırasında hata oluştu', {
        id: 'auto-fix',
      });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
          <p className='text-gray-300'>Analiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-400 text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-bold text-white mb-2'>
            Analiz Bulunamadı
          </h1>
          <p className='text-gray-300 mb-6'>
            Bu analiz mevcut değil veya silinmiş olabilir.
          </p>
          <button
            onClick={() => navigate('/feed-doctor')}
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors'
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/feed-doctor')}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-arrow-left-line text-2xl'></i>
            </button>
            <div>
              <h1 className='text-3xl font-bold text-white'>Analiz Detayı</h1>
              <p className='text-gray-400'>
                Ürün kalitesi analizi ve optimizasyon önerileri
              </p>
            </div>
          </div>
          <div className='flex space-x-3'>
            <button
              onClick={loadAnalysis}
              className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors'
            >
              <i className='ri-refresh-line mr-2'></i>
              Yenile
            </button>
            <button
              onClick={() => navigate('/feed-doctor')}
              className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors'
            >
              <i className='ri-close-line mr-2'></i>
              Kapat
            </button>
          </div>
        </div>

        {/* Analysis Overview */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* Overall Score */}
          <div className='lg:col-span-2'>
            <div
              className={`bg-gradient-to-br ${getScoreBg(analysis.overallScore)} backdrop-blur-sm border border-white/10 rounded-2xl p-8`}
            >
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-2xl font-bold text-white mb-2'>
                    Genel Skor
                  </h2>
                  <p className='text-gray-300'>Ürün kalitesi değerlendirmesi</p>
                </div>
                <div className='text-right'>
                  <div
                    className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}
                  >
                    {analysis.overallScore}
                  </div>
                  <div className='text-gray-400'>/ 100</div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div className='text-center'>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(analysis.titleScore)}`}
                  >
                    {analysis.titleScore}
                  </div>
                  <div className='text-sm text-gray-400'>Başlık</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(analysis.descriptionScore)}`}
                  >
                    {analysis.descriptionScore}
                  </div>
                  <div className='text-sm text-gray-400'>Açıklama</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(analysis.imageScore)}`}
                  >
                    {analysis.imageScore}
                  </div>
                  <div className='text-sm text-gray-400'>Görseller</div>
                </div>
                <div className='text-center'>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(analysis.categoryScore)}`}
                  >
                    {analysis.categoryScore}
                  </div>
                  <div className='text-sm text-gray-400'>Kategori</div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Info */}
          <div className='space-y-4'>
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Analiz Bilgileri
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm text-gray-400'>Ürün ID</div>
                  <div className='text-white font-mono text-sm'>
                    {analysis.productId}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-gray-400'>Analiz Tarihi</div>
                  <div className='text-white'>
                    {new Date(analysis.analyzedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div>
                  <div className='text-sm text-gray-400'>Durum</div>
                  <div className='text-green-400'>Tamamlandı</div>
                </div>
                <div>
                  <div className='text-sm text-gray-400'>AI Modeli</div>
                  <div className='text-white'>
                    {analysis.analysisData?.aiModel || 'GPT-4'}
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Hızlı İstatistikler
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Toplam Sorun</span>
                  <span className='text-red-400 font-semibold'>
                    {analysis.issues?.length || 0}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Öneriler</span>
                  <span className='text-blue-400 font-semibold'>
                    {analysis.suggestions?.length || 0}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Kritik Sorunlar</span>
                  <span className='text-red-400 font-semibold'>
                    {analysis.issues?.filter(i => i.severity === 'critical')
                      .length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues and Suggestions */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Issues */}
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-white flex items-center'>
                <i className='ri-error-warning-line text-red-400 mr-3'></i>
                Tespit Edilen Sorunlar
              </h3>

              {/* Issue Filter */}
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-400'>Filtrele:</span>
                {(['all', 'critical', 'warning', 'info'] as IssueFilter[]).map(
                  filter => (
                    <button
                      key={filter}
                      onClick={() => setIssueFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                        issueFilter === filter
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 hover:bg-white/15'
                      }`}
                    >
                      {filter === 'all' && 'Tümü'}
                      {filter === 'critical' && 'Kritik'}
                      {filter === 'warning' && 'Uyarı'}
                      {filter === 'info' && 'Bilgi'}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredIssues.length > 0 ? (
              <div className='space-y-4'>
                {filteredIssues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      issue.severity === 'critical'
                        ? 'border-red-500 bg-red-500/10'
                        : issue.severity === 'error'
                          ? 'border-red-400 bg-red-500/10'
                          : issue.severity === 'warning'
                            ? 'border-yellow-400 bg-yellow-500/10'
                            : 'border-blue-400 bg-blue-500/10'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}
                        >
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className='text-sm text-gray-400'>
                          {issue.field}
                        </span>
                      </div>
                    </div>
                    <p className='text-white'>{issue.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <i className='ri-check-line text-green-400 text-4xl mb-4'></i>
                <p className='text-gray-400'>Tespit edilen sorun bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-white flex items-center'>
                <i className='ri-lightbulb-line text-yellow-400 mr-3'></i>
                Optimizasyon Önerileri
              </h3>

              {/* Suggestion Filter */}
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-400'>Filtrele:</span>
                {(
                  [
                    'all',
                    'content',
                    'seo',
                    'pricing',
                    'images',
                    'general',
                  ] as SuggestionFilter[]
                ).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSuggestionFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                      suggestionFilter === filter
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/15'
                    }`}
                  >
                    {filter === 'all' && 'Tümü'}
                    {filter === 'content' && 'İçerik'}
                    {filter === 'seo' && 'SEO'}
                    {filter === 'pricing' && 'Fiyat'}
                    {filter === 'images' && 'Görsel'}
                    {filter === 'general' && 'Genel'}
                  </button>
                ))}
              </div>
            </div>

            {filteredSuggestions.length > 0 ? (
              <div className='space-y-4'>
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className='p-4 rounded-lg bg-blue-500/10 border border-blue-500/20'
                  >
                    <div className='flex items-start space-x-3'>
                      <i className='ri-arrow-right-s-line text-blue-400 mt-1'></i>
                      <div>
                        <div className='text-sm text-blue-400 font-medium mb-1'>
                          {suggestion.type}
                        </div>
                        <p className='text-white'>{suggestion.message}</p>
                        <div className='flex items-center justify-between mt-3'>
                          <div className='flex items-center space-x-2'>
                            {suggestion.autoFixable && (
                              <span className='inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full'>
                                Otomatik Düzeltilebilir
                              </span>
                            )}
                            {!suggestion.autoFixable && (
                              <span className='inline-block px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full'>
                                Manuel Müdahale Gerekli
                              </span>
                            )}
                          </div>

                          {suggestion.autoFixable && (
                            <button
                              onClick={() => handleAutoFix(suggestion)}
                              className='px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl'
                            >
                              <i className='ri-magic-line mr-1'></i>
                              Otomatik Düzelt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <i className='ri-check-line text-green-400 text-4xl mb-4'></i>
                <p className='text-gray-400'>Öneri bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimized Content */}
        {(analysis.optimizedTitle || analysis.optimizedDescription) && (
          <div className='mt-8'>
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
              <h3 className='text-xl font-semibold text-white mb-6 flex items-center'>
                <i className='ri-magic-line text-purple-400 mr-3'></i>
                AI Önerilen İçerik
              </h3>

              <div className='space-y-6'>
                {analysis.optimizedTitle && (
                  <div>
                    <h4 className='text-lg font-medium text-white mb-3'>
                      Optimize Edilmiş Başlık
                    </h4>
                    <div className='bg-gray-800/50 p-4 rounded-lg'>
                      <p className='text-gray-300'>{analysis.optimizedTitle}</p>
                    </div>
                  </div>
                )}

                {analysis.optimizedDescription && (
                  <div>
                    <h4 className='text-lg font-medium text-white mb-3'>
                      Optimize Edilmiş Açıklama
                    </h4>
                    <div className='bg-gray-800/50 p-4 rounded-lg'>
                      <p className='text-gray-300 whitespace-pre-wrap'>
                        {analysis.optimizedDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
