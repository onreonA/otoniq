import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated registration process
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(3);
    }, 2000);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <>
      {/* Progress Steps */}
      <div className='flex justify-center mb-8'>
        <div className='flex items-center space-x-4'>
          {[1, 2, 3].map(step => (
            <div key={step} className='flex items-center'>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-gray-400 border border-white/20'
                }`}
              >
                {currentStep > step ? <i className='ri-check-line'></i> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    currentStep > step
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-white/20'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Registration Card */}
      <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl'>
        {currentStep === 1 && (
          <>
            {/* Step 1: Personal Info */}
            <div className='text-center mb-8'>
              <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <i className='ri-user-add-line text-white text-3xl'></i>
              </div>
              <h1 className='text-4xl font-bold text-white mb-3'>
                Hesap Oluşturun
              </h1>
              <p className='text-gray-300 text-lg'>
                Kişisel bilgilerinizi girin
              </p>
            </div>

            <form className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-base font-medium text-gray-200 mb-2'>
                    Ad
                  </label>
                  <input
                    type='text'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='Adınız'
                    required
                  />
                </div>
                <div>
                  <label className='block text-base font-medium text-gray-200 mb-2'>
                    Soyad
                  </label>
                  <input
                    type='text'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='Soyadınız'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-base font-medium text-gray-200 mb-2'>
                  E-posta Adresi
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <i className='ri-mail-line text-gray-400'></i>
                  </div>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='ornek@email.com'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-base font-medium text-gray-200 mb-2'>
                  Telefon
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <i className='ri-phone-line text-gray-400'></i>
                  </div>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='+90 5XX XXX XX XX'
                  />
                </div>
              </div>

              <Button
                type='button'
                onClick={nextStep}
                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all'
              >
                Devam Et
                <i className='ri-arrow-right-line ml-2'></i>
              </Button>
            </form>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Step 2: Company & Password */}
            <div className='text-center mb-8'>
              <div className='w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <i className='ri-building-line text-white text-3xl'></i>
              </div>
              <h1 className='text-4xl font-bold text-white mb-3'>
                Şirket Bilgileri
              </h1>
              <p className='text-gray-300 text-lg'>
                Şirket bilgilerinizi ve şifrenizi belirleyin
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label className='block text-base font-medium text-gray-200 mb-2'>
                  Şirket Adı
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <i className='ri-building-line text-gray-400'></i>
                  </div>
                  <input
                    type='text'
                    name='company'
                    value={formData.company}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='Şirket adınız'
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-base font-medium text-gray-200 mb-2'>
                  Şifre
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <i className='ri-lock-line text-gray-400'></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='••••••••'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer'
                  >
                    <i
                      className={`ri-${showPassword ? 'eye-off' : 'eye'}-line`}
                    ></i>
                  </button>
                </div>
              </div>

              <div>
                <label className='block text-base font-medium text-gray-200 mb-2'>
                  Şifre Tekrar
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <i className='ri-lock-line text-gray-400'></i>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className='w-full pl-10 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                    placeholder='••••••••'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer'
                  >
                    <i
                      className={`ri-${showConfirmPassword ? 'eye-off' : 'eye'}-line`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className='flex items-center'>
                <input
                  type='checkbox'
                  className='w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 cursor-pointer'
                  required
                />
                <span className='ml-2 text-gray-300'>
                  <a
                    href='#'
                    className='text-blue-400 hover:text-blue-300 cursor-pointer'
                  >
                    Kullanım Şartları
                  </a>{' '}
                  ve{' '}
                  <a
                    href='#'
                    className='text-blue-400 hover:text-blue-300 cursor-pointer'
                  >
                    Gizlilik Politikası
                  </a>
                  'nı kabul ediyorum
                </span>
              </div>

              <div className='flex space-x-4'>
                <Button
                  type='button'
                  onClick={prevStep}
                  variant='outline'
                  className='flex-1 border-white/30 text-white hover:bg-white/10 py-4 text-lg'
                >
                  <i className='ri-arrow-left-line mr-2'></i>
                  Geri
                </Button>
                <Button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className='ri-loader-4-line animate-spin mr-2'></i>
                      Hesap Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <i className='ri-user-add-line mr-2'></i>
                      Hesap Oluştur
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Step 3: Success */}
            <div className='text-center'>
              <div className='w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg'>
                <i className='ri-check-double-line text-white text-3xl'></i>
              </div>
              <h1 className='text-3xl font-bold text-white mb-4'>
                Hoş Geldiniz!
              </h1>
              <p className='text-gray-300 mb-8'>
                Hesabınız başarıyla oluşturuldu. E-posta adresinize doğrulama
                linki gönderildi.
              </p>

              <div className='bg-blue-500/20 border border-blue-500/30 rounded-xl p-6 mb-8'>
                <h3 className='text-lg font-semibold text-white mb-3'>
                  <i className='ri-gift-line mr-2 text-yellow-400'></i>
                  14 Gün Ücretsiz Deneme
                </h3>
                <p className='text-gray-300 text-sm mb-4'>
                  Tüm premium özellikleri ücretsiz deneyebilirsiniz. Kredi kartı
                  bilgisi gerekmez.
                </p>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div className='text-gray-300'>
                    <i className='ri-check-line mr-2 text-green-400'></i>
                    Sınırsız ürün yönetimi
                  </div>
                  <div className='text-gray-300'>
                    <i className='ri-check-line mr-2 text-green-400'></i>
                    AI destekli analitik
                  </div>
                  <div className='text-gray-300'>
                    <i className='ri-check-line mr-2 text-green-400'></i>
                    Çoklu pazaryeri entegrasyonu
                  </div>
                  <div className='text-gray-300'>
                    <i className='ri-check-line mr-2 text-green-400'></i>
                    7/24 destek
                  </div>
                </div>
              </div>

              <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
                <Button
                  as={Link}
                  to='/dashboard'
                  className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                >
                  <i className='ri-dashboard-line mr-2'></i>
                  Dashboard'a Git
                </Button>
                <Button
                  as={Link}
                  to='/demo'
                  variant='outline'
                  className='flex-1 border-white/30 text-white hover:bg-white/10 py-4 text-lg'
                >
                  <i className='ri-play-circle-line mr-2'></i>
                  Demo İzle
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Login Link */}
        {currentStep < 3 && (
          <div className='mt-8 text-center'>
            <p className='text-gray-300'>
              Zaten hesabınız var mı?{' '}
              <Link
                to='/login'
                className='text-blue-400 hover:text-blue-300 font-medium cursor-pointer'
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
