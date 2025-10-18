import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceType } from '../../../../domain/entities/Marketplace';
import toast from 'react-hot-toast';

export default function ConnectMarketplacePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMarketplace, setSelectedMarketplace] =
    useState<MarketplaceType | null>(null);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    sellerId: '',
    accessToken: '',
    refreshToken: '',
  });
  const [settings, setSettings] = useState({
    autoSync: true,
    syncInterval: 3600,
    priceMarkup: 0,
    stockBuffer: 0,
  });
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);

  const marketplaces = [
    {
      type: 'trendyol' as MarketplaceType,
      name: 'Trendyol',
      description: "Türkiye'nin en büyük e-ticaret platformu",
      icon: 'ri-store-2-line',
      color: 'from-orange-500 to-red-500',
      requirements: ['API Key', 'API Secret', 'Seller ID'],
    },
    {
      type: 'amazon' as MarketplaceType,
      name: 'Amazon',
      description: 'Dünya çapında e-ticaret devi',
      icon: 'ri-amazon-line',
      color: 'from-yellow-500 to-orange-500',
      requirements: ['Access Token', 'Refresh Token'],
    },
    {
      type: 'hepsiburada' as MarketplaceType,
      name: 'Hepsiburada',
      description: "Türkiye'nin önde gelen e-ticaret sitesi",
      icon: 'ri-shopping-bag-line',
      color: 'from-blue-500 to-purple-500',
      requirements: ['API Key', 'API Secret'],
    },
    {
      type: 'n11' as MarketplaceType,
      name: 'N11',
      description: "Türkiye'nin dijital alışveriş merkezi",
      icon: 'ri-shopping-cart-line',
      color: 'from-green-500 to-teal-500',
      requirements: ['API Key', 'API Secret'],
    },
    {
      type: 'gittigidiyor' as MarketplaceType,
      name: 'GittiGidiyor',
      description: "Türkiye'nin online alışveriş sitesi",
      icon: 'ri-truck-line',
      color: 'from-purple-500 to-pink-500',
      requirements: ['API Key', 'API Secret'],
    },
    {
      type: 'ciceksepeti' as MarketplaceType,
      name: 'Çiçeksepeti',
      description: "Türkiye'nin çiçek ve hediye sitesi",
      icon: 'ri-plant-line',
      color: 'from-pink-500 to-rose-500',
      requirements: ['API Key', 'API Secret'],
    },
  ];

  const handleMarketplaceSelect = (type: MarketplaceType) => {
    setSelectedMarketplace(type);
    setCurrentStep(2);
  };

  const handleCredentialsChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const testConnection = async () => {
    if (!selectedMarketplace) return;

    setTesting(true);
    try {
      // TODO: Implement actual connection test
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      toast.success('Bağlantı testi başarılı!');
      setCurrentStep(3);
    } catch (error) {
      toast.error(
        'Bağlantı testi başarısız. Lütfen bilgilerinizi kontrol edin.'
      );
    } finally {
      setTesting(false);
    }
  };

  const createConnection = async () => {
    if (!selectedMarketplace) return;

    setLoading(true);
    try {
      // TODO: Implement actual connection creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      toast.success('Pazaryeri bağlantısı başarıyla oluşturuldu!');
      navigate('/marketplaces');
    } catch (error) {
      toast.error('Bağlantı oluşturulurken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMarketplace = () => {
    return marketplaces.find(m => m.type === selectedMarketplace);
  };

  const getRequiredFields = () => {
    if (!selectedMarketplace) return [];

    const marketplace = getSelectedMarketplace();
    if (!marketplace) return [];

    const fieldMap: Record<string, string[]> = {
      'API Key': ['apiKey'],
      'API Secret': ['apiSecret'],
      'Seller ID': ['sellerId'],
      'Access Token': ['accessToken'],
      'Refresh Token': ['refreshToken'],
    };

    return marketplace.requirements.flatMap(req => fieldMap[req] || []);
  };

  const isCredentialsValid = () => {
    const requiredFields = getRequiredFields();
    return requiredFields.every(
      field => credentials[field as keyof typeof credentials].trim() !== ''
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-4'>
            <button
              onClick={() => navigate('/marketplaces')}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-arrow-left-line text-xl'></i>
            </button>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                Pazaryeri Bağlantısı Kur
              </h1>
              <p className='text-gray-300'>
                Ürünlerinizi pazaryerlerinde satmaya başlayın
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className='flex items-center gap-4'>
            {[1, 2, 3, 4].map(step => (
              <div key={step} className='flex items-center gap-2'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step < currentStep ? 'bg-blue-500' : 'bg-white/10'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Marketplace Selection */}
        {currentStep === 1 && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8'>
            <h2 className='text-2xl font-bold text-white mb-6'>
              Pazaryeri Seçin
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {marketplaces.map(marketplace => (
                <button
                  key={marketplace.type}
                  onClick={() => handleMarketplaceSelect(marketplace.type)}
                  className='bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-6 text-left transition-all duration-200 group'
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${marketplace.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <i
                      className={`${marketplace.icon} text-white text-2xl`}
                    ></i>
                  </div>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    {marketplace.name}
                  </h3>
                  <p className='text-gray-400 text-sm mb-4'>
                    {marketplace.description}
                  </p>
                  <div className='space-y-1'>
                    <p className='text-gray-500 text-xs'>Gerekli Bilgiler:</p>
                    {marketplace.requirements.map((req, index) => (
                      <p key={index} className='text-gray-400 text-xs'>
                        • {req}
                      </p>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Credentials */}
        {currentStep === 2 && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <button
                onClick={() => setCurrentStep(1)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </button>
              <div>
                <h2 className='text-2xl font-bold text-white'>API Bilgileri</h2>
                <p className='text-gray-300'>
                  Seçtiğiniz pazaryeri için gerekli API bilgilerini girin
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              {getRequiredFields().map(field => (
                <div key={field}>
                  <label className='block text-gray-300 text-sm mb-2'>
                    {field === 'apiKey'
                      ? 'API Key'
                      : field === 'apiSecret'
                        ? 'API Secret'
                        : field === 'sellerId'
                          ? 'Seller ID'
                          : field === 'accessToken'
                            ? 'Access Token'
                            : field === 'refreshToken'
                              ? 'Refresh Token'
                              : field}
                  </label>
                  <input
                    type={
                      field.includes('Secret') || field.includes('Token')
                        ? 'password'
                        : 'text'
                    }
                    value={credentials[field as keyof typeof credentials]}
                    onChange={e =>
                      handleCredentialsChange(field, e.target.value)
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                    placeholder={`${field} girin`}
                  />
                </div>
              ))}
            </div>

            <div className='flex justify-end mt-8'>
              <button
                onClick={testConnection}
                disabled={!isCredentialsValid() || testing}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {testing ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400'></div>
                    Test Ediliyor...
                  </>
                ) : (
                  <>
                    <i className='ri-check-line'></i>
                    Bağlantıyı Test Et
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <button
                onClick={() => setCurrentStep(2)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </button>
              <div>
                <h2 className='text-2xl font-bold text-white'>Ayarlar</h2>
                <p className='text-gray-300'>
                  Pazaryeri bağlantısı için ayarları yapılandırın
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center justify-between p-4 bg-white/5 rounded-xl'>
                <div>
                  <h3 className='text-white font-medium'>
                    Otomatik Senkronizasyon
                  </h3>
                  <p className='text-gray-400 text-sm'>
                    Ürün bilgilerini otomatik olarak senkronize et
                  </p>
                </div>
                <label className='relative inline-flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={settings.autoSync}
                    onChange={e =>
                      handleSettingsChange('autoSync', e.target.checked)
                    }
                    className='sr-only peer'
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.autoSync && (
                <div>
                  <label className='block text-gray-300 text-sm mb-2'>
                    Senkronizasyon Aralığı (saniye)
                  </label>
                  <select
                    value={settings.syncInterval}
                    onChange={e =>
                      handleSettingsChange(
                        'syncInterval',
                        parseInt(e.target.value)
                      )
                    }
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
                  >
                    <option value={900}>15 Dakika</option>
                    <option value={1800}>30 Dakika</option>
                    <option value={3600}>1 Saat</option>
                    <option value={7200}>2 Saat</option>
                    <option value={14400}>4 Saat</option>
                  </select>
                </div>
              )}

              <div>
                <label className='block text-gray-300 text-sm mb-2'>
                  Fiyat Marjı (%)
                </label>
                <input
                  type='number'
                  value={settings.priceMarkup}
                  onChange={e =>
                    handleSettingsChange(
                      'priceMarkup',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  placeholder='0'
                />
              </div>

              <div>
                <label className='block text-gray-300 text-sm mb-2'>
                  Stok Tamponu
                </label>
                <input
                  type='number'
                  value={settings.stockBuffer}
                  onChange={e =>
                    handleSettingsChange(
                      'stockBuffer',
                      parseInt(e.target.value) || 0
                    )
                  }
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  placeholder='0'
                />
              </div>
            </div>

            <div className='flex justify-end mt-8'>
              <button
                onClick={() => setCurrentStep(4)}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2'
              >
                <i className='ri-arrow-right-line'></i>
                Devam Et
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <button
                onClick={() => setCurrentStep(3)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </button>
              <div>
                <h2 className='text-2xl font-bold text-white'>Onay</h2>
                <p className='text-gray-300'>
                  Bağlantı bilgilerinizi kontrol edin
                </p>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='bg-white/5 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Bağlantı Bilgileri
                </h3>
                <div className='space-y-3'>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Pazaryeri:</span>
                    <span className='text-white'>
                      {getSelectedMarketplace()?.name}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>
                      Otomatik Senkronizasyon:
                    </span>
                    <span className='text-white'>
                      {settings.autoSync ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  {settings.autoSync && (
                    <div className='flex justify-between'>
                      <span className='text-gray-400'>
                        Senkronizasyon Aralığı:
                      </span>
                      <span className='text-white'>
                        {settings.syncInterval / 60} Dakika
                      </span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Fiyat Marjı:</span>
                    <span className='text-white'>%{settings.priceMarkup}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-400'>Stok Tamponu:</span>
                    <span className='text-white'>
                      {settings.stockBuffer} Adet
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-end mt-8'>
              <button
                onClick={createConnection}
                disabled={loading}
                className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <i className='ri-check-line'></i>
                    Bağlantıyı Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
