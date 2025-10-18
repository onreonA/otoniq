import { useState } from 'react';

interface SEOPreviewProps {
  title: string;
  description: string;
  keywords: string[];
  className?: string;
}

export default function SEOPreview({
  title,
  description,
  keywords,
  className = '',
}: SEOPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Generate preview URL
  const previewUrl = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toggle Button */}
      <div className='flex items-center justify-between'>
        <h4 className='text-white font-medium'>SEO Önizleme</h4>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm flex items-center gap-2'
        >
          <i className={`ri-eye-${showPreview ? 'off' : 'line'}`}></i>
          {showPreview ? 'Gizle' : 'Önizle'}
        </button>
      </div>

      {/* SEO Preview */}
      {showPreview && (
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          {/* Google Search Result Preview */}
          <div className='space-y-4'>
            <h5 className='text-white font-medium text-sm'>
              Google Arama Sonucu Önizlemesi
            </h5>

            <div className='bg-white rounded-lg p-4 text-gray-900'>
              {/* URL */}
              <div className='text-green-700 text-sm mb-1'>
                https://otoniq.ai/urunler/{previewUrl}
              </div>

              {/* Title */}
              <div className='text-blue-600 text-lg font-medium mb-2 line-clamp-1'>
                {title || 'Ürün Başlığı'}
              </div>

              {/* Description */}
              <div className='text-gray-600 text-sm line-clamp-2'>
                {description || 'Ürün açıklaması burada görünecek...'}
              </div>

              {/* Keywords */}
              {keywords.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                  {keywords.slice(0, 5).map((keyword, index) => (
                    <span
                      key={index}
                      className='bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs'
                    >
                      {keyword}
                    </span>
                  ))}
                  {keywords.length > 5 && (
                    <span className='text-gray-500 text-xs'>
                      +{keywords.length - 5} daha
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SEO Analysis */}
          <div className='space-y-3 mt-6'>
            <h5 className='text-white font-medium text-sm'>SEO Analizi</h5>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Title Analysis */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300 text-sm'>Başlık Uzunluğu</span>
                  <span
                    className={`text-sm ${
                      title.length === 0
                        ? 'text-red-400'
                        : title.length < 30
                          ? 'text-yellow-400'
                          : title.length > 60
                            ? 'text-red-400'
                            : 'text-green-400'
                    }`}
                  >
                    {title.length}/60
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${
                      title.length === 0
                        ? 'bg-red-500'
                        : title.length < 30
                          ? 'bg-yellow-500'
                          : title.length > 60
                            ? 'bg-red-500'
                            : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((title.length / 60) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className='text-gray-400 text-xs'>
                  {title.length === 0
                    ? 'Başlık gerekli'
                    : title.length < 30
                      ? 'Başlık çok kısa'
                      : title.length > 60
                        ? 'Başlık çok uzun'
                        : 'İdeal uzunluk'}
                </p>
              </div>

              {/* Description Analysis */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300 text-sm'>
                    Açıklama Uzunluğu
                  </span>
                  <span
                    className={`text-sm ${
                      description.length === 0
                        ? 'text-red-400'
                        : description.length < 120
                          ? 'text-yellow-400'
                          : description.length > 160
                            ? 'text-red-400'
                            : 'text-green-400'
                    }`}
                  >
                    {description.length}/160
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${
                      description.length === 0
                        ? 'bg-red-500'
                        : description.length < 120
                          ? 'bg-yellow-500'
                          : description.length > 160
                            ? 'bg-red-500'
                            : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((description.length / 160) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className='text-gray-400 text-xs'>
                  {description.length === 0
                    ? 'Açıklama gerekli'
                    : description.length < 120
                      ? 'Açıklama çok kısa'
                      : description.length > 160
                        ? 'Açıklama çok uzun'
                        : 'İdeal uzunluk'}
                </p>
              </div>

              {/* Keywords Analysis */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300 text-sm'>
                    Anahtar Kelimeler
                  </span>
                  <span
                    className={`text-sm ${
                      keywords.length === 0
                        ? 'text-red-400'
                        : keywords.length < 3
                          ? 'text-yellow-400'
                          : keywords.length > 10
                            ? 'text-red-400'
                            : 'text-green-400'
                    }`}
                  >
                    {keywords.length}/10
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${
                      keywords.length === 0
                        ? 'bg-red-500'
                        : keywords.length < 3
                          ? 'bg-yellow-500'
                          : keywords.length > 10
                            ? 'bg-red-500'
                            : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((keywords.length / 10) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className='text-gray-400 text-xs'>
                  {keywords.length === 0
                    ? 'Anahtar kelime gerekli'
                    : keywords.length < 3
                      ? 'Daha fazla anahtar kelime ekleyin'
                      : keywords.length > 10
                        ? 'Çok fazla anahtar kelime'
                        : 'İdeal sayı'}
                </p>
              </div>

              {/* Overall Score */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300 text-sm'>Genel Skor</span>
                  <span className='text-sm text-green-400'>
                    {(() => {
                      let score = 0;
                      if (title.length >= 30 && title.length <= 60) score += 25;
                      if (
                        description.length >= 120 &&
                        description.length <= 160
                      )
                        score += 25;
                      if (keywords.length >= 3 && keywords.length <= 10)
                        score += 25;
                      if (title && description && keywords.length > 0)
                        score += 25;
                      return score;
                    })()}
                    /100
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'
                    style={{
                      width: `${(() => {
                        let score = 0;
                        if (title.length >= 30 && title.length <= 60)
                          score += 25;
                        if (
                          description.length >= 120 &&
                          description.length <= 160
                        )
                          score += 25;
                        if (keywords.length >= 3 && keywords.length <= 10)
                          score += 25;
                        if (title && description && keywords.length > 0)
                          score += 25;
                        return score;
                      })()}%`,
                    }}
                  ></div>
                </div>
                <p className='text-gray-400 text-xs'>
                  {(() => {
                    let score = 0;
                    if (title.length >= 30 && title.length <= 60) score += 25;
                    if (description.length >= 120 && description.length <= 160)
                      score += 25;
                    if (keywords.length >= 3 && keywords.length <= 10)
                      score += 25;
                    if (title && description && keywords.length > 0)
                      score += 25;

                    if (score >= 75) return 'Mükemmel SEO';
                    if (score >= 50) return 'İyi SEO';
                    if (score >= 25) return 'Orta SEO';
                    return 'Zayıf SEO';
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Tips */}
          <div className='mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
            <h6 className='text-blue-400 font-medium text-sm mb-2'>
              <i className='ri-lightbulb-line mr-1'></i>
              SEO İpuçları
            </h6>
            <ul className='text-gray-300 text-xs space-y-1'>
              <li>• Başlık 30-60 karakter arasında olmalı</li>
              <li>• Açıklama 120-160 karakter arasında olmalı</li>
              <li>• 3-10 anahtar kelime kullanın</li>
              <li>• Anahtar kelimeleri doğal olarak kullanın</li>
              <li>• Benzersiz ve açıklayıcı içerik oluşturun</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
