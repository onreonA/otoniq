import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/base/Button';
import { useAuth } from '../../hooks/useAuth';
import { TwoFactorAuthService } from '../../../infrastructure/services/TwoFactorAuthService';
import { AccountLockoutService } from '../../../infrastructure/services/AccountLockoutService';
import { toast } from 'react-hot-toast';
import { Shield, Smartphone, Key, AlertTriangle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      return;
    }

    // If 2FA step is shown, verify 2FA code
    if (showTwoFactor) {
      await handleTwoFactorVerification();
      return;
    }

    // Initial login
    await handleInitialLogin();
  };

  const handleInitialLogin = async () => {
    try {
      // Check if login should be blocked
      const blockStatus = await AccountLockoutService.shouldBlockLogin(email);
      if (blockStatus.shouldBlock) {
        toast.error(blockStatus.reason || 'Giriş engellendi');
        return;
      }

      // Record login attempt
      const result = await login(email, password);

      if (result?.user) {
        // Record successful login attempt
        await AccountLockoutService.recordLoginAttempt(
          email,
          true,
          'login',
          result.user.id
        );

        // Check if user has 2FA enabled
        const has2FA = await TwoFactorAuthService.isTwoFactorEnabled(
          result.user.id
        );
        if (has2FA) {
          setShowTwoFactor(true);
          toast.info('2FA doğrulama kodu gerekli');
          return;
        }
      } else {
        // Record failed login attempt
        await AccountLockoutService.recordLoginAttempt(
          email,
          false,
          'login',
          undefined,
          'Invalid credentials'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      // Record failed login attempt
      await AccountLockoutService.recordLoginAttempt(
        email,
        false,
        'login',
        undefined,
        'Login error'
      );
    }
  };

  const handleTwoFactorVerification = async () => {
    if (!twoFactorCode) {
      toast.error('Lütfen doğrulama kodunu girin');
      return;
    }

    setIsVerifying2FA(true);
    try {
      // Get user ID from current session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Kullanıcı oturumu bulunamadı');
        return;
      }

      const verification = await TwoFactorAuthService.verifyTwoFactor(
        user.id,
        twoFactorCode
      );

      if (verification.isValid) {
        // Record successful 2FA verification
        await AccountLockoutService.recordLoginAttempt(
          email,
          true,
          '2fa_verification',
          user.id
        );

        toast.success('2FA doğrulaması başarılı!');
        // Redirect to dashboard or handle successful login
        window.location.href = '/dashboard';
      } else {
        // Record failed 2FA verification
        await AccountLockoutService.recordLoginAttempt(
          email,
          false,
          '2fa_verification',
          user.id,
          'Invalid 2FA code'
        );

        toast.error('Geçersiz doğrulama kodu');
        setTwoFactorCode('');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      toast.error('2FA doğrulaması sırasında hata oluştu');
    } finally {
      setIsVerifying2FA(false);
    }
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

          {/* 2FA Code Field - Only show if 2FA step is active */}
          {showTwoFactor && (
            <div>
              <label
                htmlFor='twoFactorCode'
                className='block text-base font-medium text-gray-200 mb-2'
              >
                <Shield className='w-5 h-5 inline mr-2' />
                2FA Doğrulama Kodu
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Smartphone className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='twoFactorCode'
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  className='w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-center text-2xl tracking-widest'
                  placeholder='123456'
                  maxLength={6}
                  required
                />
              </div>
              <p className='text-sm text-gray-400 mt-2 text-center'>
                Authenticator uygulamanızdan aldığınız 6 haneli kodu girin
              </p>
            </div>
          )}

          {/* Login Button */}
          <Button
            type='submit'
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all'
            disabled={isLoading || isVerifying2FA}
          >
            {isLoading || isVerifying2FA ? (
              <>
                <i className='ri-loader-4-line animate-spin mr-2'></i>
                {showTwoFactor ? '2FA Doğrulanıyor...' : 'Giriş yapılıyor...'}
              </>
            ) : (
              <>
                <i className='ri-login-circle-line mr-2'></i>
                {showTwoFactor ? '2FA Doğrula' : 'Giriş Yap'}
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
