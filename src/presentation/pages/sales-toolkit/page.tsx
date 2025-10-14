import { Link } from 'react-router-dom';
import {
  FileText,
  Presentation,
  Mail,
  Phone,
  MessageSquare,
  Download,
  ExternalLink,
  CheckCircle,
  Briefcase,
  Target,
  TrendingUp,
} from 'lucide-react';

const SalesToolkit = () => {
  const tools = [
    {
      id: 'pitch-deck',
      title: 'Pitch Deck',
      description: 'İnteraktif 10 slaytlık sunum',
      icon: <Presentation className='w-8 h-8' />,
      color: 'from-blue-600 to-cyan-600',
      link: '/pitch-deck',
      type: 'internal',
      features: [
        'Problem & Çözüm',
        'Özellikler & ROI',
        'Müşteri hikayeleri',
        'Fiyatlandırma',
      ],
    },
    {
      id: 'one-pager',
      title: 'One-Pager',
      description: 'Tek sayfa özet (PDF olarak indirilebilir)',
      icon: <FileText className='w-8 h-8' />,
      color: 'from-purple-600 to-pink-600',
      link: '/one-pager',
      type: 'internal',
      features: [
        'Kompakt format',
        'PDF export',
        'Yazdırılabilir',
        'Email eklenebilir',
      ],
    },
    {
      id: 'email-templates',
      title: 'Email Templates',
      description: '5 farklı email şablonu',
      icon: <Mail className='w-8 h-8' />,
      color: 'from-green-600 to-teal-600',
      link: '#email-templates',
      type: 'anchor',
      features: [
        'Cold email',
        'Demo takibi',
        'Deneme hatırlatma',
        'Win-back campaign',
      ],
    },
    {
      id: 'phone-scripts',
      title: 'Phone Scripts',
      description: 'Telefon görüşme senaryoları',
      icon: <Phone className='w-8 h-8' />,
      color: 'from-orange-600 to-red-600',
      link: '#phone-scripts',
      type: 'anchor',
      features: [
        'Açılış cümleleri',
        'Objection handling',
        'Kapanış teknikleri',
        'Follow-up stratejisi',
      ],
    },
    {
      id: 'linkedin-messages',
      title: 'LinkedIn Messages',
      description: 'Sosyal medya outreach şablonları',
      icon: <MessageSquare className='w-8 h-8' />,
      color: 'from-indigo-600 to-purple-600',
      link: '#linkedin',
      type: 'anchor',
      features: [
        'Kısa & etkili',
        'Kişiselleştirilebilir',
        'CTA odaklı',
        'Professional tone',
      ],
    },
    {
      id: 'sales-materials',
      title: 'Tüm Materyaller (MD)',
      description: 'Markdown doküman formatında tüm içerikler',
      icon: <Download className='w-8 h-8' />,
      color: 'from-gray-600 to-gray-800',
      link: '/SALES_MATERIALS.md',
      type: 'external',
      features: [
        'Pitch deck metni',
        'Email templates',
        'Phone scripts',
        'Objection handling',
      ],
    },
  ];

  const quickStats = [
    {
      icon: <TrendingUp className='w-6 h-6' />,
      label: 'Ortalama ROI',
      value: '3.1x',
      color: 'text-green-600',
    },
    {
      icon: <Target className='w-6 h-6' />,
      label: 'Hedef Müşteri',
      value: '20',
      color: 'text-blue-600',
    },
    {
      icon: <Briefcase className='w-6 h-6' />,
      label: 'Demo Süre',
      value: '30 dk',
      color: 'text-purple-600',
    },
    {
      icon: <CheckCircle className='w-6 h-6' />,
      label: 'Toplam Materyal',
      value: '6',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-gray-900 mb-3'>
          Satış Materyal Merkezi
        </h1>
        <p className='text-lg text-gray-600'>
          Demo, sunum ve satış için ihtiyacınız olan tüm materyaller tek yerde.
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-4 gap-6 mb-8'>
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all'
          >
            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
            <p className='text-2xl font-bold text-gray-900 mb-1'>
              {stat.value}
            </p>
            <p className='text-sm text-gray-600'>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
        {tools.map(tool => (
          <div
            key={tool.id}
            className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group'
          >
            {/* Card Header */}
            <div
              className={`bg-gradient-to-r ${tool.color} p-6 text-white relative overflow-hidden`}
            >
              <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16'></div>
              <div className='relative z-10'>
                <div className='mb-3'>{tool.icon}</div>
                <h3 className='text-xl font-bold mb-2'>{tool.title}</h3>
                <p className='text-sm text-white/90'>{tool.description}</p>
              </div>
            </div>

            {/* Card Body */}
            <div className='p-6'>
              <ul className='space-y-2 mb-6'>
                {tool.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className='flex items-start text-sm text-gray-700'
                  >
                    <CheckCircle className='w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5' />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              {tool.type === 'internal' && (
                <Link
                  to={tool.link}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${tool.color} text-white rounded-lg hover:opacity-90 transition-all font-semibold`}
                >
                  <span>Görüntüle</span>
                  <ExternalLink className='w-4 h-4' />
                </Link>
              )}

              {tool.type === 'anchor' && (
                <a
                  href={tool.link}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${tool.color} text-white rounded-lg hover:opacity-90 transition-all font-semibold`}
                >
                  <span>Git</span>
                  <ExternalLink className='w-4 h-4' />
                </a>
              )}

              {tool.type === 'external' && (
                <a
                  href={tool.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${tool.color} text-white rounded-lg hover:opacity-90 transition-all font-semibold`}
                >
                  <Download className='w-4 h-4' />
                  <span>İndir</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Email Templates Section */}
      <div id='email-templates' className='mb-12 scroll-mt-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
            <Mail className='w-8 h-8 text-green-600 mr-3' />
            Email Templates
          </h2>
          <div className='space-y-4'>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-bold text-gray-900 mb-2'>
                1. İlk İletişim (Cold Email)
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                Konu: [İsim], E-ticaret operasyonlarınızı %90 hızlandırabilir
                miyiz?
              </p>
              <p className='text-sm text-gray-700'>
                → Potansiyel müşterilere ilk ulaşım için kullanın
              </p>
            </div>

            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-bold text-gray-900 mb-2'>
                2. Demo Sonrası Takip
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                Konu: [İsim], demo özeti ve özel teklifimiz
              </p>
              <p className='text-sm text-gray-700'>
                → Demo sonrası 24 saat içinde gönder
              </p>
            </div>

            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-bold text-gray-900 mb-2'>
                3. Ücretsiz Deneme Hatırlatma
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                Konu: [İsim], ücretsiz denemeniz 3 gün sonra bitiyor
              </p>
              <p className='text-sm text-gray-700'>
                → Deneme bitimine 3 gün kala gönder
              </p>
            </div>

            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-bold text-gray-900 mb-2'>
                4. Kayıp Müşteri Geri Kazanma
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                Konu: [İsim], sizi özledik! Özel dönüş teklifi 🎁
              </p>
              <p className='text-sm text-gray-700'>
                → İptal eden müşterilere 30 gün sonra gönder
              </p>
            </div>

            <div className='p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-bold text-gray-900 mb-2'>
                5. Referans İsteği
              </h3>
              <p className='text-sm text-gray-600 mb-2'>
                Konu: [İsim], başarınızı paylaşır mısınız? 🌟
              </p>
              <p className='text-sm text-gray-700'>
                → Memnun müşterilere 90 gün sonra gönder
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Scripts Section */}
      <div id='phone-scripts' className='mb-12 scroll-mt-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
            <Phone className='w-8 h-8 text-orange-600 mr-3' />
            Telefon Görüşme Scripti
          </h2>
          <div className='space-y-6'>
            <div>
              <h3 className='font-bold text-gray-900 mb-2'>
                AÇILIŞ (10 saniye)
              </h3>
              <div className='p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600'>
                <p className='text-gray-700'>
                  "Merhaba, ben [İsim], Otoniq.ai'den arıyorum. [İsim Bey/Hanım]
                  ile görüşebilir miyim?"
                </p>
              </div>
            </div>

            <div>
              <h3 className='font-bold text-gray-900 mb-2'>
                VALUE PROPOSITION (30 saniye)
              </h3>
              <div className='p-4 bg-green-50 rounded-lg border-l-4 border-green-600'>
                <p className='text-gray-700'>
                  "Harika! Kısaca anlatayım: Otoniq.ai ile müşterilerimiz ürün
                  listeleme süresini %90 azaltıyor. Örneğin Fashion Store
                  Turkey, 4 saat süren işlemi 20 dakikaya indirdi."
                </p>
              </div>
            </div>

            <div>
              <h3 className='font-bold text-gray-900 mb-2'>CTA (10 saniye)</h3>
              <div className='p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600'>
                <p className='text-gray-700'>
                  "Sizin için de 30 dakikalık ücretsiz bir demo ayarlayabilir
                  miyim? Hangi gün uygun?"
                </p>
              </div>
            </div>

            <div>
              <h3 className='font-bold text-gray-900 mb-2'>
                OBJECTION HANDLING
              </h3>
              <div className='space-y-2'>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm font-semibold text-gray-900 mb-1'>
                    "Çok pahalı"
                  </p>
                  <p className='text-sm text-gray-700'>
                    → "Anlıyorum. Aylık ₺5,000 ilk başta yüksek görünebilir. Ama
                    şöyle düşünün: Tasarımcı ₺3,500, müşteri destek ₺2,500..."
                  </p>
                </div>
                <div className='p-3 bg-gray-50 rounded-lg'>
                  <p className='text-sm font-semibold text-gray-900 mb-1'>
                    "Bütçemiz yok"
                  </p>
                  <p className='text-sm text-gray-700'>
                    → "Pilot programımız var, ilk 3 ay ücretsiz. Sonuçları
                    görün, sonra karar verin."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Messages Section */}
      <div id='linkedin' className='mb-12 scroll-mt-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center'>
            <MessageSquare className='w-8 h-8 text-indigo-600 mr-3' />
            LinkedIn Mesaj Şablonu
          </h2>
          <div className='p-6 bg-indigo-50 rounded-lg border-l-4 border-indigo-600'>
            <p className='text-gray-700 mb-4'>Merhaba [İsim],</p>
            <p className='text-gray-700 mb-4'>
              [Şirket]'daki çalışmalarınızı LinkedIn'de takip ediyorum.
              E-ticaret alanındaki başarınız etkileyici!
            </p>
            <p className='text-gray-700 mb-4'>
              Kısa bir sorum var: Ürün listeleme ve stok yönetimi için günde kaç
              saat harcıyorsunuz?
            </p>
            <p className='text-gray-700 mb-4'>
              Bizim müşterilerimiz (Fashion Store Turkey, Teknoloji Perakende)
              bu süreçleri AI ile otomatikleştirerek günde 4-6 saat kazanıyor.
            </p>
            <p className='text-gray-700 mb-4'>
              5 dakikalık bir görüşme ile nasıl yardımcı olabileceğimizi
              anlatabilir miyim?
            </p>
            <p className='text-gray-700 font-semibold'>[Calendly Link]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesToolkit;
