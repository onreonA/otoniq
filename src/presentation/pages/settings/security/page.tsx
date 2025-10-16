/**
 * Security Settings Page
 * Two-Factor Authentication setup and management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import {
  TwoFactorAuthService,
  TwoFactorSetup,
} from '../../../../infrastructure/services/TwoFactorAuthService';
import { toast } from 'react-hot-toast';
import {
  Shield,
  QrCode,
  Key,
  Smartphone,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    enabled: false,
    verifiedAt: null as string | null,
    backupCodesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    if (!user) return;

    try {
      const status = await TwoFactorAuthService.getTwoFactorStatus(user.id);
      setTwoFactorStatus(status);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading 2FA status:', error);
      }
      toast.error('2FA durumu yüklenirken hata oluştu');
    }
  };

  const handleSetupTwoFactor = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const setup = await TwoFactorAuthService.setupTwoFactor(user);
      setSetupData(setup);
      setBackupCodes(setup.backupCodes);
      setShowSetup(true);
      toast.success('2FA kurulumu başlatıldı');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error setting up 2FA:', error);
      }
      toast.error('2FA kurulumu sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!user || !setupData) return;

    setIsLoading(true);
    try {
      const isValid = TwoFactorAuthService.verifyTOTPCode(
        setupData.secret,
        verificationCode
      );

      if (isValid) {
        toast.success('2FA başarıyla etkinleştirildi!');
        setShowSetup(false);
        setSetupData(null);
        setVerificationCode('');
        await loadTwoFactorStatus();
      } else {
        toast.error('Geçersiz doğrulama kodu');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying 2FA setup:', error);
      }
      toast.error('Doğrulama sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!user) return;

    if (!confirm("2FA'yı devre dışı bırakmak istediğinizden emin misiniz?")) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await TwoFactorAuthService.disableTwoFactor(user.id);

      if (success) {
        toast.success('2FA devre dışı bırakıldı');
        await loadTwoFactorStatus();
      } else {
        toast.error('2FA devre dışı bırakılamadı');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error disabling 2FA:', error);
      }
      toast.error('2FA devre dışı bırakılırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewBackupCodes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const newCodes = await TwoFactorAuthService.generateNewBackupCodes(
        user.id
      );
      setBackupCodes(newCodes);
      toast.success('Yeni yedek kodlar oluşturuldu');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error generating backup codes:', error);
      }
      toast.error('Yedek kodlar oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'otoniq-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='max-w-4xl mx-auto px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>
          Güvenlik Ayarları
        </h1>
        <p className='text-gray-300'>
          Hesabınızın güvenliğini artırmak için iki faktörlü kimlik doğrulama
          (2FA) kullanın
        </p>
      </div>

      {/* 2FA Status Card */}
      <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center'>
              <Shield className='w-6 h-6 text-white' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-white'>
                İki Faktörlü Kimlik Doğrulama
              </h3>
              <p className='text-gray-300'>
                {twoFactorStatus.enabled ? 'Etkin' : 'Devre dışı'}
              </p>
              {twoFactorStatus.enabled && twoFactorStatus.verifiedAt && (
                <p className='text-sm text-gray-400'>
                  Son doğrulama:{' '}
                  {new Date(twoFactorStatus.verifiedAt).toLocaleDateString(
                    'tr-TR'
                  )}
                </p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {twoFactorStatus.enabled ? (
              <span className='px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium'>
                <CheckCircle className='w-4 h-4 inline mr-1' />
                Aktif
              </span>
            ) : (
              <span className='px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm font-medium'>
                <AlertCircle className='w-4 h-4 inline mr-1' />
                Devre dışı
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Setup */}
      {!twoFactorStatus.enabled && !showSetup && (
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            2FA'yı Etkinleştir
          </h3>
          <p className='text-gray-300 mb-6'>
            Hesabınızın güvenliğini artırmak için iki faktörlü kimlik doğrulama
            kullanın. Bu, şifreniz çalınsa bile hesabınızı korur.
          </p>
          <button
            onClick={handleSetupTwoFactor}
            disabled={isLoading}
            className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2'
          >
            <Smartphone className='w-5 h-5' />
            {isLoading ? 'Kurulum Başlatılıyor...' : "2FA'yı Etkinleştir"}
          </button>
        </div>
      )}

      {/* 2FA Setup Process */}
      {showSetup && setupData && (
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            2FA Kurulumu
          </h3>

          <div className='space-y-6'>
            {/* Step 1: QR Code */}
            <div>
              <h4 className='text-md font-medium text-white mb-3'>
                1. Authenticator Uygulaması Ekleyin
              </h4>
              <p className='text-gray-300 mb-4'>
                Google Authenticator, Authy veya benzeri bir uygulama kullanarak
                QR kodu tarayın:
              </p>
              <div className='flex justify-center'>
                <div className='bg-white p-4 rounded-xl'>
                  <img
                    src={setupData.qrCodeUrl}
                    alt='2FA QR Code'
                    className='w-48 h-48'
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div>
              <h4 className='text-md font-medium text-white mb-3'>
                2. Doğrulama Kodu Girin
              </h4>
              <p className='text-gray-300 mb-4'>
                Authenticator uygulamanızdan aldığınız 6 haneli kodu girin:
              </p>
              <div className='flex gap-4'>
                <input
                  type='text'
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  placeholder='123456'
                  maxLength={6}
                  className='flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <button
                  onClick={handleVerifySetup}
                  disabled={isLoading || verificationCode.length !== 6}
                  className='px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all duration-300'
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
                </button>
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <div>
                <h4 className='text-md font-medium text-white mb-3'>
                  3. Yedek Kodları Kaydedin
                </h4>
                <p className='text-gray-300 mb-4'>
                  Bu kodları güvenli bir yerde saklayın. Telefonunuzu
                  kaybederseniz bu kodları kullanabilirsiniz:
                </p>
                <div className='bg-black/20 rounded-xl p-4 mb-4'>
                  <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                    {backupCodes.map((code, index) => (
                      <div key={index} className='text-white/80'>
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2'
                >
                  <Download className='w-4 h-4' />
                  Yedek Kodları İndir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA Management */}
      {twoFactorStatus.enabled && (
        <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            2FA Yönetimi
          </h3>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-white font-medium'>Yedek Kodlar</p>
                <p className='text-sm text-gray-400'>
                  {twoFactorStatus.backupCodesCount} yedek kod kaldı
                </p>
              </div>
              <button
                onClick={handleGenerateNewBackupCodes}
                disabled={isLoading}
                className='px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2'
              >
                <RefreshCw className='w-4 h-4' />
                Yeni Kodlar Oluştur
              </button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-white font-medium'>
                  2FA'yı Devre Dışı Bırak
                </p>
                <p className='text-sm text-gray-400'>
                  Hesabınızın güvenliği azalacak
                </p>
              </div>
              <button
                onClick={handleDisableTwoFactor}
                disabled={isLoading}
                className='px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2'
              >
                <Trash2 className='w-4 h-4' />
                Devre Dışı Bırak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className='bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Güvenlik İpuçları
        </h3>
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start gap-2'>
            <CheckCircle className='w-5 h-5 text-green-400 mt-0.5 flex-shrink-0' />
            <span>Yedek kodlarınızı güvenli bir yerde saklayın</span>
          </li>
          <li className='flex items-start gap-2'>
            <CheckCircle className='w-5 h-5 text-green-400 mt-0.5 flex-shrink-0' />
            <span>Authenticator uygulamanızı düzenli olarak yedekleyin</span>
          </li>
          <li className='flex items-start gap-2'>
            <CheckCircle className='w-5 h-5 text-green-400 mt-0.5 flex-shrink-0' />
            <span>Şüpheli aktiviteler için hesabınızı izleyin</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
