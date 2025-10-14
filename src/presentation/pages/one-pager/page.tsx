import {
  CheckCircle,
  TrendingUp,
  Zap,
  DollarSign,
  Star,
  Mail,
  Phone,
  Globe,
  Download,
} from 'lucide-react';

const OnePager = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='min-h-screen bg-white print:bg-white pt-20 print:pt-0'>
      {/* Print Button (Hidden in Print) */}
      <div className='fixed top-24 right-4 print:hidden print:top-4 z-50'>
        <button
          onClick={handlePrint}
          className='flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg'
        >
          <Download className='w-5 h-5' />
          <span>PDF İndir / Yazdır</span>
        </button>
      </div>

      {/* One-Pager Content */}
      <div className='max-w-4xl mx-auto p-12 print:p-8'>
        {/* Header */}
        <div className='text-center mb-8 pb-6 border-b-4 border-gray-300'>
          <h1 className='text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2'>
            OTONIQ.AI
          </h1>
          <p className='text-xl text-gray-700 font-semibold'>
            AI Destekli E-Ticaret & E-İhracat Otomasyonu
          </p>
        </div>

        {/* Problem Section */}
        <div className='mb-8'>
          <div className='bg-red-50 border-l-4 border-red-600 p-6 rounded-r-lg'>
            <h2 className='text-2xl font-bold text-red-900 mb-4 flex items-center'>
              <span className='text-3xl mr-3'>❌</span>
              PROBLEM
            </h2>
            <p className='text-gray-700 mb-3 font-semibold'>
              E-ticaret sahipleri manuel süreçlerde boğuluyor:
            </p>
            <ul className='space-y-2 text-gray-700'>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Ürün listeleme saatler alıyor</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Çoklu pazaryeri yönetimi kaotik</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Yüksek operasyonel maliyetler (₺20K-50K/ay)</span>
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>•</span>
                <span>Stratejik işlere zaman kalmıyor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Solution Section */}
        <div className='mb-8'>
          <div className='bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg'>
            <h2 className='text-2xl font-bold text-green-900 mb-4 flex items-center'>
              <span className='text-3xl mr-3'>✅</span>
              ÇÖZÜM: OTONIQ.AI
            </h2>
            <p className='text-gray-700 mb-4 font-semibold'>
              Tek platformda tüm e-ticaret operasyonlarınız:
            </p>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='bg-white p-4 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <Zap className='w-5 h-5 text-blue-600 mr-2' />
                  <h3 className='font-bold text-gray-900'>AI OTOMASYONU</h3>
                </div>
                <ul className='text-sm text-gray-700 space-y-1'>
                  <li>• Ürün listeleme: 4 saat → 5 dakika (%98 hız)</li>
                  <li>• Sosyal medya: Otomatik içerik üretimi</li>
                  <li>• Müşteri destek: 7/24 AI bot (%80 otomasyon)</li>
                </ul>
              </div>

              <div className='bg-white p-4 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <TrendingUp className='w-5 h-5 text-purple-600 mr-2' />
                  <h3 className='font-bold text-gray-900'>AKILLI ANALİTİK</h3>
                </div>
                <ul className='text-sm text-gray-700 space-y-1'>
                  <li>• Satış tahminleri (AI destekli)</li>
                  <li>• Anomali tespiti (proaktif uyarılar)</li>
                  <li>• Trend analizi (data-driven kararlar)</li>
                </ul>
              </div>

              <div className='bg-white p-4 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <CheckCircle className='w-5 h-5 text-green-600 mr-2' />
                  <h3 className='font-bold text-gray-900'>ENTEGRASYONLAR</h3>
                </div>
                <ul className='text-sm text-gray-700 space-y-1'>
                  <li>• Marketplaces: Shopify, Trendyol, Hepsiburada, N11</li>
                  <li>• ERP: Odoo, SAP, custom</li>
                  <li>• Chat: WhatsApp, Telegram</li>
                  <li>• Automation: N8N</li>
                </ul>
              </div>

              <div className='bg-white p-4 rounded-lg'>
                <div className='flex items-center mb-2'>
                  <Star className='w-5 h-5 text-yellow-600 mr-2' />
                  <h3 className='font-bold text-gray-900'>
                    ADVANCED (Enterprise)
                  </h3>
                </div>
                <ul className='text-sm text-gray-700 space-y-1'>
                  <li>• IoT sensor monitoring</li>
                  <li>• AR/VR ürün görüntüleme</li>
                  <li>• Voice commands</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & ROI Section */}
        <div className='mb-8'>
          <div className='bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg'>
            <h2 className='text-2xl font-bold text-blue-900 mb-4 flex items-center'>
              <DollarSign className='w-7 h-7 mr-2' />
              FİYATLANDIRMA & ROI
            </h2>

            <div className='overflow-x-auto'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='bg-gray-200'>
                    <th className='border border-gray-300 px-4 py-2 text-left'></th>
                    <th className='border border-gray-300 px-4 py-2 text-center font-bold'>
                      STARTER
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center font-bold bg-purple-100'>
                      PROFESSIONAL ⭐
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center font-bold'>
                      ENTERPRISE
                    </th>
                  </tr>
                </thead>
                <tbody className='text-gray-700'>
                  <tr>
                    <td className='border border-gray-300 px-4 py-2 font-semibold'>
                      Fiyat
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center'>
                      ₺2,000/ay
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center bg-purple-50'>
                      ₺5,000/ay
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center'>
                      ₺10,000/ay
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 px-4 py-2 font-semibold'>
                      Tasarruf
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center'>
                      ₺3,750/ay
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center bg-purple-50'>
                      ₺15,500/ay
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center'>
                      ₺61,000/ay
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 px-4 py-2 font-semibold'>
                      ROI
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center font-bold text-green-600'>
                      1.87x
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center font-bold text-green-600 bg-purple-50'>
                      3.1x
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center font-bold text-green-600'>
                      5.6x
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-gray-300 px-4 py-2 font-semibold'>
                      İdeal
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-xs'>
                      Yeni başlayan
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-xs bg-purple-50'>
                      Büyüyen
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-xs'>
                      Büyük
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className='mt-4 text-center'>
              <p className='text-lg font-bold text-gray-900'>
                "Her ₺1 yatırım → ₺2-6 geri dönüş"
              </p>
            </div>
          </div>
        </div>

        {/* Customer Stories Section */}
        <div className='mb-8'>
          <div className='bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg'>
            <h2 className='text-2xl font-bold text-yellow-900 mb-4 flex items-center'>
              <Star className='w-7 h-7 mr-2' />
              MÜŞTERİ HİKAYELERİ
            </h2>

            <div className='space-y-3'>
              <div className='bg-white p-3 rounded-lg'>
                <p className='font-bold text-gray-900 mb-1'>
                  Fashion Store Turkey (Professional)
                </p>
                <p className='text-sm text-gray-700'>
                  "Ürün listeleme %90 azaldı, satışlar %35 arttı"
                </p>
              </div>

              <div className='bg-white p-3 rounded-lg'>
                <p className='font-bold text-gray-900 mb-1'>
                  Teknoloji Perakende A.Ş. (Enterprise)
                </p>
                <p className='text-sm text-gray-700'>
                  "Stok kayıpları %60 azaldı, yıllık ₺120K tasarruf"
                </p>
              </div>

              <div className='bg-white p-3 rounded-lg'>
                <p className='font-bold text-gray-900 mb-1'>
                  Organik Gıda Evi (Starter)
                </p>
                <p className='text-sm text-gray-700'>
                  "Sosyal medya maliyeti ₺0'a indi, engagement %150 arttı"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='mb-8'>
          <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg'>
            <h2 className='text-2xl font-bold mb-4 text-center'>
              🚀 HEMEN BAŞLAYIN
            </h2>

            <div className='grid grid-cols-3 gap-4 mb-4'>
              <div className='bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center'>
                <CheckCircle className='w-8 h-8 mx-auto mb-2' />
                <p className='font-bold mb-1'>14 GÜN ÜCRETSİZ DENEME</p>
                <p className='text-xs'>(Kredi kartı gerektirmez)</p>
              </div>

              <div className='bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center'>
                <CheckCircle className='w-8 h-8 mx-auto mb-2' />
                <p className='font-bold mb-1'>DEMO RANDEVUSU</p>
                <p className='text-xs'>(30 dakika, özelleştirilmiş)</p>
              </div>

              <div className='bg-white/10 backdrop-blur-sm p-4 rounded-lg text-center'>
                <CheckCircle className='w-8 h-8 mx-auto mb-2' />
                <p className='font-bold mb-1'>PİLOT PROGRAM</p>
                <p className='text-xs'>(3 ay ücretsiz, ilk 5 müşteri)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Contact */}
        <div className='border-t-4 border-gray-300 pt-6 text-center'>
          <div className='flex justify-center items-center gap-8 text-gray-700'>
            <div className='flex items-center gap-2'>
              <Mail className='w-5 h-5 text-blue-600' />
              <span className='font-semibold'>sales@otoniq.ai</span>
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='w-5 h-5 text-blue-600' />
              <span className='font-semibold'>+90 (212) 123 45 67</span>
            </div>
            <div className='flex items-center gap-2'>
              <Globe className='w-5 h-5 text-blue-600' />
              <span className='font-semibold'>www.otoniq.ai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default OnePager;
