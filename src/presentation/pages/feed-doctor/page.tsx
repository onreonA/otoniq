/**
 * Feed Doktoru Dashboard
 * AI-powered product quality analysis and optimization
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FeedDoctorService,
  AnalysisStats,
  FeedAnalysis,
} from '../../../infrastructure/services/FeedDoctorService';
import FeatureIntro from '../../components/common/FeatureIntro';
import toast from 'react-hot-toast';
import { supabase } from '../../../infrastructure/database/supabase/client';

export default function FeedDoctorPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [analyses, setAnalyses] = useState<FeedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filterScore, setFilterScore] = useState<
    'all' | 'low' | 'medium' | 'high'
  >('all');

  // Bulk analysis states
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadData();
    }
  }, [userProfile?.tenant_id]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (userProfile?.tenant_id && !analyzing) {
        console.log('🔄 Auto refreshing data...');
        loadData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userProfile?.tenant_id, analyzing]);

  const loadData = async () => {
    if (!userProfile?.tenant_id) return;

    try {
      console.log(
        '🔄 Loading feed doctor data for tenant:',
        userProfile.tenant_id
      );
      setLoading(true);

      const [statsData, analysesData] = await Promise.all([
        FeedDoctorService.getAnalysisStats(userProfile.tenant_id),
        FeedDoctorService.getAnalyses(userProfile.tenant_id),
      ]);

      console.log('📊 Stats data:', statsData);
      console.log('📋 Analyses data:', analysesData);
      console.log('📋 Analyses count:', analysesData.length);

      setStats(statsData);
      setAnalyses(analysesData);
    } catch (error) {
      console.error('❌ Error loading feed doctor data:', error);
      // Don't show error toast, just set empty data
      setStats({
        totalProducts: 0,
        analyzedProducts: 0,
        avgScore: 0,
        lowScoreCount: 0,
        mediumScoreCount: 0,
        highScoreCount: 0,
        pendingAnalysis: 0,
      });
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAll = async () => {
    if (!userProfile?.tenant_id || analyzing) return;

    try {
      setAnalyzing(true);
      toast.loading('Tüm ürünler analiz ediliyor...', { id: 'bulk-analyze' });

      // Get all products for this tenant
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('tenant_id', userProfile.tenant_id);

      if (productsError) throw productsError;

      console.log(
        '🔄 Starting bulk analysis for',
        products?.length || 0,
        'products'
      );

      // Analyze each product
      for (const product of products || []) {
        try {
          await FeedDoctorService.analyzeProduct(
            userProfile.tenant_id,
            product.id
          );
          console.log('✅ Analyzed product:', product.id);
        } catch (error) {
          console.error('❌ Error analyzing product:', product.id, error);
        }
      }

      toast.success('Analiz tamamlandı!', { id: 'bulk-analyze' });

      // Force refresh data to show results
      console.log('🔄 Force refreshing data after bulk analysis...');
      await loadData();

      // Additional delay to ensure database consistency
      setTimeout(async () => {
        console.log('🔄 Secondary refresh after delay...');
        await loadData();
      }, 2000);
    } catch (error) {
      console.error('❌ Bulk analysis error:', error);
      toast.error('Analiz sırasında hata oluştu', { id: 'bulk-analyze' });
    } finally {
      setAnalyzing(false);
    }
  };

  // Bulk analysis functions
  const handleBulkAnalyze = async () => {
    if (!userProfile?.tenant_id || selectedProducts.length === 0) return;

    setBulkAnalyzing(true);
    setBulkProgress({ current: 0, total: selectedProducts.length });

    try {
      toast.loading(
        `Seçili ${selectedProducts.length} ürün analiz ediliyor...`,
        {
          id: 'bulk-analyze',
        }
      );

      for (let i = 0; i < selectedProducts.length; i++) {
        const productId = selectedProducts[i];
        try {
          await FeedDoctorService.analyzeProduct(
            userProfile.tenant_id,
            productId
          );
          setBulkProgress({ current: i + 1, total: selectedProducts.length });
          console.log(
            `✅ Analyzed product ${i + 1}/${selectedProducts.length}:`,
            productId
          );
        } catch (error) {
          console.error('❌ Error analyzing product:', productId, error);
        }
      }

      toast.success(`${selectedProducts.length} ürün analizi tamamlandı!`, {
        id: 'bulk-analyze',
      });

      // Refresh data
      await loadData();
      setSelectedProducts([]);
    } catch (error) {
      console.error('❌ Bulk analysis error:', error);
      toast.error('Toplu analiz sırasında hata oluştu', { id: 'bulk-analyze' });
    } finally {
      setBulkAnalyzing(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredAnalyses.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredAnalyses.map(a => a.productId));
    }
  };

  // Export functions
  const handleExportCSV = () => {
    if (analyses.length === 0) {
      toast.error('Dışa aktarılacak analiz bulunmuyor');
      return;
    }

    const csvData = analyses.map(analysis => ({
      'Ürün ID': analysis.productId,
      'Genel Skor': analysis.overallScore,
      'Başlık Skoru': analysis.titleScore,
      'Açıklama Skoru': analysis.descriptionScore,
      'Görsel Skoru': analysis.imageScore,
      'Kategori Skoru': analysis.categoryScore,
      'Fiyat Skoru': analysis.priceScore,
      'Sorun Sayısı': analysis.issues?.length || 0,
      'Öneri Sayısı': analysis.suggestions?.length || 0,
      'Analiz Tarihi': new Date(analysis.analyzedAt).toLocaleDateString(
        'tr-TR'
      ),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `feed-doctor-analiz-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV raporu başarıyla dışa aktarıldı');
  };

  const handleExportPDF = () => {
    if (analyses.length === 0) {
      toast.error('Dışa aktarılacak analiz bulunmuyor');
      return;
    }

    // For now, we'll create a simple HTML report that can be printed as PDF
    const reportContent = `
      <html>
        <head>
          <title>Feed Doctor Analiz Raporu</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #8b5cf6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .score-high { color: #10b981; }
            .score-medium { color: #f59e0b; }
            .score-low { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Feed Doctor Analiz Raporu</h1>
          <p>Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}</p>
          <p>Toplam Analiz: ${analyses.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>Ürün ID</th>
                <th>Genel Skor</th>
                <th>Başlık</th>
                <th>Açıklama</th>
                <th>Görsel</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Sorunlar</th>
                <th>Öneriler</th>
              </tr>
            </thead>
            <tbody>
              ${analyses
                .map(
                  analysis => `
                <tr>
                  <td>${analysis.productId.slice(0, 8)}...</td>
                  <td class="score-${analysis.overallScore >= 70 ? 'high' : analysis.overallScore >= 40 ? 'medium' : 'low'}">${analysis.overallScore}/100</td>
                  <td>${analysis.titleScore}/100</td>
                  <td>${analysis.descriptionScore}/100</td>
                  <td>${analysis.imageScore}/100</td>
                  <td>${analysis.categoryScore}/100</td>
                  <td>${analysis.priceScore}/100</td>
                  <td>${analysis.issues?.length || 0}</td>
                  <td>${analysis.suggestions?.length || 0}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success('PDF raporu hazırlandı');
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
              label: 'Verileri Yenile',
              onClick: loadData,
              variant: 'secondary',
            },
            {
              label: 'Optimizasyon Kuralları',
              to: '/feed-doctor/rules',
              variant: 'secondary',
            },
            {
              label: 'CSV Dışa Aktar',
              onClick: handleExportCSV,
              variant: 'secondary',
            },
            {
              label: 'PDF Rapor',
              onClick: handleExportPDF,
              variant: 'secondary',
            },
          ]}
          variant='purple'
          icon='ri-stethoscope-line'
        />

        {/* Bulk Analysis Controls */}
        {selectedProducts.length > 0 && (
          <div className='bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
                  <i className='ri-checkbox-multiple-line text-white text-2xl'></i>
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    Toplu Analiz Seçimi
                  </h3>
                  <p className='text-gray-300'>
                    {selectedProducts.length} ürün seçildi
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                {bulkAnalyzing && (
                  <div className='flex items-center space-x-2 text-sm text-gray-300'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400'></div>
                    <span>
                      {bulkProgress.current}/{bulkProgress.total} analiz
                      ediliyor...
                    </span>
                  </div>
                )}

                <button
                  onClick={handleBulkAnalyze}
                  disabled={bulkAnalyzing}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    bulkAnalyzing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {bulkAnalyzing ? (
                    <>
                      <i className='ri-loader-4-line animate-spin mr-2'></i>
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-play-line mr-2'></i>
                      Seçili Ürünleri Analiz Et
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedProducts([])}
                  className='px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300'
                >
                  <i className='ri-close-line mr-2'></i>
                  Seçimi Temizle
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Advanced Analytics Dashboard */}
        {stats && analyses.length > 0 && (
          <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
            <h3 className='text-xl font-semibold text-white mb-6 flex items-center'>
              <i className='ri-bar-chart-line text-purple-400 mr-3'></i>
              📈 Gelişmiş Analitik Dashboard
            </h3>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Trend Analysis */}
              <div className='bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <i className='ri-line-chart-line text-blue-400 mr-2'></i>
                  Trend Analizi
                </h4>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Ortalama Skor Trendi</span>
                    <span className='text-blue-400 font-semibold'>
                      {Math.round(
                        analyses.reduce((sum, a) => sum + a.overallScore, 0) /
                          analyses.length
                      )}
                      /100
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>En Yüksek Skor</span>
                    <span className='text-green-400 font-semibold'>
                      {Math.max(...analyses.map(a => a.overallScore))}/100
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>En Düşük Skor</span>
                    <span className='text-red-400 font-semibold'>
                      {Math.min(...analyses.map(a => a.overallScore))}/100
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Skor Varyansı</span>
                    <span className='text-yellow-400 font-semibold'>
                      {Math.round(
                        Math.sqrt(
                          analyses.reduce(
                            (sum, a) =>
                              sum +
                              Math.pow(
                                a.overallScore -
                                  analyses.reduce(
                                    (s, a) => s + a.overallScore,
                                    0
                                  ) /
                                    analyses.length,
                                2
                              ),
                            0
                          ) / analyses.length
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Issue Analysis */}
              <div className='bg-gradient-to-br from-red-600/20 to-pink-600/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <i className='ri-error-warning-line text-red-400 mr-2'></i>
                  Sorun Analizi
                </h4>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Toplam Sorun</span>
                    <span className='text-red-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) => sum + (a.issues?.length || 0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Kritik Sorunlar</span>
                    <span className='text-red-500 font-semibold'>
                      {analyses.reduce(
                        (sum, a) =>
                          sum +
                          (a.issues?.filter(i => i.severity === 'critical')
                            .length || 0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Uyarılar</span>
                    <span className='text-yellow-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) =>
                          sum +
                          (a.issues?.filter(i => i.severity === 'warning')
                            .length || 0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Bilgi Notları</span>
                    <span className='text-blue-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) =>
                          sum +
                          (a.issues?.filter(i => i.severity === 'info')
                            .length || 0),
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Breakdown */}
              <div className='bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <i className='ri-speed-up-line text-green-400 mr-2'></i>
                  Performans Dağılımı
                </h4>

                <div className='space-y-3'>
                  {[
                    {
                      label: 'Başlık',
                      key: 'titleScore',
                      color: 'text-blue-400',
                    },
                    {
                      label: 'Açıklama',
                      key: 'descriptionScore',
                      color: 'text-purple-400',
                    },
                    {
                      label: 'Görseller',
                      key: 'imageScore',
                      color: 'text-pink-400',
                    },
                    {
                      label: 'Kategori',
                      key: 'categoryScore',
                      color: 'text-green-400',
                    },
                    {
                      label: 'Fiyat',
                      key: 'priceScore',
                      color: 'text-yellow-400',
                    },
                  ].map(({ label, key, color }) => {
                    const avgScore = Math.round(
                      analyses.reduce(
                        (sum, a) => sum + (a[key as keyof typeof a] as number),
                        0
                      ) / analyses.length
                    );
                    return (
                      <div
                        key={key}
                        className='flex items-center justify-between'
                      >
                        <span className='text-gray-300'>{label}</span>
                        <div className='flex items-center space-x-2'>
                          <div className='w-20 bg-gray-700 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500`}
                              style={{ width: `${avgScore}%` }}
                            ></div>
                          </div>
                          <span className={`font-semibold ${color}`}>
                            {avgScore}/100
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optimization Suggestions */}
              <div className='bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center'>
                  <i className='ri-lightbulb-line text-purple-400 mr-2'></i>
                  Optimizasyon Önerileri
                </h4>

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Toplam Öneri</span>
                    <span className='text-purple-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) => sum + (a.suggestions?.length || 0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>
                      Otomatik Düzeltilebilir
                    </span>
                    <span className='text-green-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) =>
                          sum +
                          (a.suggestions?.filter(s => s.autoFixable).length ||
                            0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>
                      Manuel Müdahale Gerekli
                    </span>
                    <span className='text-orange-400 font-semibold'>
                      {analyses.reduce(
                        (sum, a) =>
                          sum +
                          (a.suggestions?.filter(s => !s.autoFixable).length ||
                            0),
                        0
                      )}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-300'>Ortalama Öneri/Ürün</span>
                    <span className='text-cyan-400 font-semibold'>
                      {Math.round(
                        analyses.reduce(
                          (sum, a) => sum + (a.suggestions?.length || 0),
                          0
                        ) / analyses.length
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
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

          {filteredAnalyses.length > 0 && (
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleSelectAll}
                className='px-4 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all duration-300'
              >
                {selectedProducts.length === filteredAnalyses.length ? (
                  <>
                    <i className='ri-checkbox-line mr-2'></i>
                    Seçimi Kaldır
                  </>
                ) : (
                  <>
                    <i className='ri-checkbox-multiple-line mr-2'></i>
                    Tümünü Seç
                  </>
                )}
              </button>

              {selectedProducts.length > 0 && (
                <span className='text-sm text-gray-400'>
                  {selectedProducts.length} seçildi
                </span>
              )}
            </div>
          )}
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
                className={`bg-gradient-to-br ${getScoreBg(analysis.overallScore)} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 ${
                  selectedProducts.includes(analysis.productId)
                    ? 'ring-2 ring-purple-500/50'
                    : ''
                }`}
              >
                <div className='flex items-start justify-between mb-4'>
                  {/* Checkbox */}
                  <div className='flex items-center space-x-3'>
                    <input
                      type='checkbox'
                      checked={selectedProducts.includes(analysis.productId)}
                      onChange={e => {
                        e.stopPropagation();
                        handleSelectProduct(analysis.productId);
                      }}
                      className='w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2'
                    />
                    <div className='flex-1'>
                      <h3
                        className='text-lg font-semibold text-white mb-2 cursor-pointer hover:text-purple-300 transition-colors'
                        onClick={() => navigate(`/feed-doctor/${analysis.id}`)}
                      >
                        {analysis.optimizedTitle || 'Ürün Başlığı'}
                      </h3>
                      <div className='flex items-center gap-4 text-sm text-gray-400'>
                        <span>Ürün ID: {analysis.productId.slice(0, 8)}</span>
                        <span>•</span>
                        <span>
                          {new Date(
                            analysis.analyzedAt || ''
                          ).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
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
