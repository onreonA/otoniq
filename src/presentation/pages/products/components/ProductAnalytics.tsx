import { useState, useEffect } from 'react';

interface ProductAnalyticsProps {
  productId?: string;
  className?: string;
}

interface AnalyticsData {
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  avgRating: number;
  reviews: number;
  stockTurnover: number;
  profitMargin: number;
  trends: {
    views: number[];
    sales: number[];
    revenue: number[];
  };
  topVariants: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    products: number;
    sales: number;
    revenue: number;
  }>;
}

export default function ProductAnalytics({
  productId,
  className = '',
}: ProductAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AnalyticsData = {
        views: 1250,
        sales: 45,
        revenue: 22500,
        conversionRate: 3.6,
        avgRating: 4.2,
        reviews: 23,
        stockTurnover: 2.1,
        profitMargin: 35.5,
        trends: {
          views: [120, 135, 110, 145, 160, 140, 155],
          sales: [3, 5, 2, 7, 8, 6, 9],
          revenue: [1500, 2500, 1000, 3500, 4000, 3000, 4500],
        },
        topVariants: [
          { name: 'Kırmızı, M', sales: 15, revenue: 7500 },
          { name: 'Mavi, L', sales: 12, revenue: 6000 },
          { name: 'Siyah, S', sales: 8, revenue: 4000 },
        ],
        categoryPerformance: [
          { category: 'Elektronik', products: 25, sales: 120, revenue: 60000 },
          { category: 'Giyim', products: 18, sales: 85, revenue: 42500 },
          { category: 'Ev & Yaşam', products: 12, sales: 45, revenue: 22500 },
        ],
      };

      setAnalytics(mockData);
      setLoading(false);
    };

    loadAnalytics();
  }, [productId, timeRange]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='text-center py-8'>
          <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>Analitik veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='text-center py-8'>
          <div className='text-gray-400 text-4xl mb-4'>
            <i className='ri-bar-chart-line'></i>
          </div>
          <p className='text-gray-400'>Analitik veriler bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-white font-medium'>Ürün Analitikleri</h4>
          <p className='text-gray-400 text-sm'>
            Performans metrikleri ve trend analizi
          </p>
        </div>

        {/* Time Range Selector */}
        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value as any)}
          className='bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-400 transition-colors'
        >
          <option value='7d'>Son 7 Gün</option>
          <option value='30d'>Son 30 Gün</option>
          <option value='90d'>Son 90 Gün</option>
          <option value='1y'>Son 1 Yıl</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white/5 border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Görüntülenme</span>
            <i className='ri-eye-line text-blue-400'></i>
          </div>
          <div className='text-2xl font-bold text-white'>
            {analytics.views.toLocaleString()}
          </div>
          <div className='text-green-400 text-sm'>+12%</div>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Satış</span>
            <i className='ri-shopping-cart-line text-green-400'></i>
          </div>
          <div className='text-2xl font-bold text-white'>{analytics.sales}</div>
          <div className='text-green-400 text-sm'>+8%</div>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Gelir</span>
            <i className='ri-money-dollar-circle-line text-yellow-400'></i>
          </div>
          <div className='text-2xl font-bold text-white'>
            ₺{analytics.revenue.toLocaleString()}
          </div>
          <div className='text-green-400 text-sm'>+15%</div>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-xl p-4'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-gray-400 text-sm'>Dönüşüm</span>
            <i className='ri-percent-line text-purple-400'></i>
          </div>
          <div className='text-2xl font-bold text-white'>
            {analytics.conversionRate}%
          </div>
          <div className='text-green-400 text-sm'>+2%</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <h5 className='text-white font-medium mb-4'>Performans Metrikleri</h5>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Ortalama Puan</span>
              <div className='flex items-center'>
                <span className='text-white font-medium mr-2'>
                  {analytics.avgRating}
                </span>
                <div className='flex text-yellow-400'>
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`ri-star-${i < Math.floor(analytics.avgRating) ? 'fill' : 'line'}`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Değerlendirme</span>
              <span className='text-white font-medium'>
                {analytics.reviews}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Stok Devir Hızı</span>
              <span className='text-white font-medium'>
                {analytics.stockTurnover}x
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-gray-400'>Kar Marjı</span>
              <span className='text-white font-medium'>
                {analytics.profitMargin}%
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <h5 className='text-white font-medium mb-4'>Trend Analizi</h5>
          <div className='space-y-4'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-gray-400 text-sm'>
                  Görüntülenme Trendi
                </span>
                <span className='text-green-400 text-sm'>+12%</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-blue-500 h-2 rounded-full'
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-gray-400 text-sm'>Satış Trendi</span>
                <span className='text-green-400 text-sm'>+8%</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full'
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-gray-400 text-sm'>Gelir Trendi</span>
                <span className='text-green-400 text-sm'>+15%</span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-yellow-500 h-2 rounded-full'
                  style={{ width: '80%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Variants */}
      <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
        <h5 className='text-white font-medium mb-4'>En Çok Satan Varyantlar</h5>
        <div className='space-y-3'>
          {analytics.topVariants.map((variant, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-white/5 rounded-lg'
            >
              <div className='flex items-center'>
                <div className='w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-sm font-medium mr-3'>
                  {index + 1}
                </div>
                <div>
                  <div className='text-white font-medium'>{variant.name}</div>
                  <div className='text-gray-400 text-sm'>
                    {variant.sales} satış
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-white font-medium'>
                  ₺{variant.revenue.toLocaleString()}
                </div>
                <div className='text-gray-400 text-sm'>gelir</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance */}
      <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
        <h5 className='text-white font-medium mb-4'>Kategori Performansı</h5>
        <div className='space-y-4'>
          {analytics.categoryPerformance.map((category, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-4 bg-white/5 rounded-lg'
            >
              <div>
                <div className='text-white font-medium'>
                  {category.category}
                </div>
                <div className='text-gray-400 text-sm'>
                  {category.products} ürün
                </div>
              </div>
              <div className='text-right'>
                <div className='text-white font-medium'>
                  {category.sales} satış
                </div>
                <div className='text-gray-400 text-sm'>
                  ₺{category.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className='flex space-x-3'>
        <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'>
          <i className='ri-download-line mr-2'></i>
          Raporu İndir
        </button>
        <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'>
          <i className='ri-share-line mr-2'></i>
          Paylaş
        </button>
        <button className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'>
          <i className='ri-settings-3-line mr-2'></i>
          Ayarlar
        </button>
      </div>
    </div>
  );
}
