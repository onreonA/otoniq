import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      return;
    }

    // Login
    await login(email, password);
  };

  return (
    <>
      {/* Login Card */}
      <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg'>
            <i className='ri-shield-keyhole-line text-white text-3xl'></i>
          </div>
          <h1 className='text-4xl font-bold text-white mb-3'>Hoş Geldiniz</h1>
          <p className='text-gray-300 text-lg'>
            Otoniq.ai hesabınıza giriş yapın
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Email Field */}
          <div>
            <label
              htmlFor='email'
              className='block text-base font-medium text-gray-200 mb-2'
            >
              E-posta Adresi
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <i className='ri-mail-line text-gray-400'></i>
              </div>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all'
                placeholder='ornek@email.com'
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor='password'
              className='block text-base font-medium text-gray-200 mb-2'
            >
              Şifre
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <i className='ri-lock-line text-gray-400'></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          {/* Remember & Forgot */}
          <div className='flex items-center justify-between'>
            <label className='flex items-center'>
              <input
                type='checkbox'
                className='w-5 h-5 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500 cursor-pointer'
              />
              <span className='ml-2 text-gray-300'>Beni hatırla</span>
            </label>
            <a
              href='#'
              className='text-blue-400 hover:text-blue-300 cursor-pointer'
            >
              Şifremi unuttum
            </a>
          </div>

          {/* Login Button */}
          <Button
            type='submit'
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className='ri-loader-4-line animate-spin mr-2'></i>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                <i className='ri-login-circle-line mr-2'></i>
                Giriş Yap
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className='my-8 flex items-center'>
          <div className='flex-1 border-t border-white/20'></div>
          <span className='px-4 text-gray-400 text-sm'>veya</span>
          <div className='flex-1 border-t border-white/20'></div>
        </div>

        {/* Social Login */}
        <div className='space-y-3'>
          <button className='w-full flex items-center justify-center px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all cursor-pointer text-lg'>
            <i className='ri-google-fill mr-3 text-red-400 text-xl'></i>
            Google ile devam et
          </button>
          <button className='w-full flex items-center justify-center px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all cursor-pointer text-lg'>
            <i className='ri-microsoft-fill mr-3 text-blue-400 text-xl'></i>
            Microsoft ile devam et
          </button>
        </div>

        {/* Sign Up Link */}
        <div className='mt-8 text-center'>
          <p className='text-gray-300 text-lg'>
            Hesabınız yok mu?{' '}
            <Link
              to='/signup'
              className='text-blue-400 hover:text-blue-300 font-semibold cursor-pointer'
            >
              Ücretsiz kayıt olun
            </Link>
          </p>
        </div>
      </div>

      {/* AI Features Preview */}
      <div className='mt-10 text-center'>
        <div className='bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='flex items-center justify-center mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-3'>
              <i className='ri-sparkle-line text-white text-2xl'></i>
            </div>
            <h3 className='text-xl font-semibold text-white'>
              AI Destekli Özellikler
            </h3>
          </div>
          <div className='grid grid-cols-2 gap-6 text-base'>
            <div className='flex items-center text-gray-300'>
              <i className='ri-robot-line mr-3 text-blue-400 text-xl'></i>
              Akıllı Otomasyon
            </div>
            <div className='flex items-center text-gray-300'>
              <i className='ri-bar-chart-line mr-3 text-green-400 text-xl'></i>
              Gelişmiş Analitik
            </div>
            <div className='flex items-center text-gray-300'>
              <i className='ri-shopping-cart-line mr-3 text-purple-400 text-xl'></i>
              E-ticaret Yönetimi
            </div>
            <div className='flex items-center text-gray-300'>
              <i className='ri-global-line mr-3 text-cyan-400 text-xl'></i>
              Çoklu Pazaryeri
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
