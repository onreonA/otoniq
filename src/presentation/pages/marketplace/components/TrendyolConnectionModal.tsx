/**
 * Trendyol Connection Modal
 * Modal for creating and editing Trendyol marketplace connections
 */

import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TrendyolSyncService } from '../../../../infrastructure/services/TrendyolSyncService';

interface TrendyolConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  connection?: any; // MarketplaceConnection type
}

export default function TrendyolConnectionModal({
  isOpen,
  onClose,
  onSuccess,
  connection,
}: TrendyolConnectionModalProps) {
  const [formData, setFormData] = useState({
    name: connection?.name || '',
    apiKey: connection?.credentials?.apiKey || '',
    apiSecret: connection?.credentials?.apiSecret || '',
    sellerId: connection?.credentials?.sellerId || '',
    autoSync: connection?.sync_enabled || true,
    syncInterval: connection?.auto_sync_interval || 60,
  });

  const [showApiSecret, setShowApiSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const trendyolSyncService = new TrendyolSyncService();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey || !formData.apiSecret || !formData.sellerId) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await trendyolSyncService.testConnection({
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        sellerId: formData.sellerId,
      });

      setTestResult({
        success: result.success,
        message: result.success
          ? 'Bağlantı başarılı!'
          : result.error || 'Bağlantı başarısız',
      });

      if (result.success) {
        toast.success('Trendyol bağlantısı başarılı!');
      } else {
        toast.error(result.error || 'Bağlantı testi başarısız');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Bağlantı testi sırasında hata oluştu',
      });
      toast.error('Bağlantı testi sırasında hata oluştu');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.apiKey ||
      !formData.apiSecret ||
      !formData.sellerId
    ) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setIsSaving(true);

    try {
      // In a real implementation, this would save to the database
      // For now, we'll just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Trendyol bağlantısı başarıyla kaydedildi!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Bağlantı kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>T</span>
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>
                {connection
                  ? 'Trendyol Bağlantısını Düzenle'
                  : 'Yeni Trendyol Bağlantısı'}
              </h2>
              <p className='text-gray-400 text-sm'>
                Trendyol Partner API bilgilerinizi girin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Form */}
        <div className='space-y-6'>
          {/* Connection Name */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Bağlantı Adı *
            </label>
            <input
              type='text'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='Örn: Ana Trendyol Mağazam'
              className='w-full px-4 py-3 bg-gray-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
            />
          </div>

          {/* API Credentials */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                API Key *
              </label>
              <input
                type='text'
                name='apiKey'
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder='Trendyol API Key'
                className='w-full px-4 py-3 bg-gray-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Seller ID *
              </label>
              <input
                type='text'
                name='sellerId'
                value={formData.sellerId}
                onChange={handleInputChange}
                placeholder='Trendyol Seller ID'
                className='w-full px-4 py-3 bg-gray-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* API Secret */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              API Secret *
            </label>
            <div className='relative'>
              <input
                type={showApiSecret ? 'text' : 'password'}
                name='apiSecret'
                value={formData.apiSecret}
                onChange={handleInputChange}
                placeholder='Trendyol API Secret'
                className='w-full px-4 py-3 pr-12 bg-gray-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
              />
              <button
                type='button'
                onClick={() => setShowApiSecret(!showApiSecret)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
              >
                {showApiSecret ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          {/* Test Connection */}
          <div className='bg-gray-700/30 rounded-xl p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-sm font-medium text-gray-300'>
                Bağlantı Testi
              </h3>
              <button
                onClick={handleTestConnection}
                disabled={
                  isTesting ||
                  !formData.apiKey ||
                  !formData.apiSecret ||
                  !formData.sellerId
                }
                className='bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors'
              >
                <TestTube className='w-4 h-4' />
                {isTesting ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
              </button>
            </div>

            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className='w-5 h-5 text-green-400' />
                ) : (
                  <AlertCircle className='w-5 h-5 text-red-400' />
                )}
                <span
                  className={`text-sm ${
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {testResult.message}
                </span>
              </div>
            )}
          </div>

          {/* Auto Sync Settings */}
          <div className='bg-gray-700/30 rounded-xl p-4'>
            <h3 className='text-sm font-medium text-gray-300 mb-4'>
              Otomatik Senkronizasyon
            </h3>

            <div className='space-y-4'>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  name='autoSync'
                  checked={formData.autoSync}
                  onChange={handleInputChange}
                  className='w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500'
                />
                <span className='text-sm text-gray-300'>
                  Otomatik senkronizasyonu etkinleştir
                </span>
              </label>

              {formData.autoSync && (
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-2'>
                    Senkronizasyon Aralığı (dakika)
                  </label>
                  <select
                    name='syncInterval'
                    value={formData.syncInterval}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        syncInterval: parseInt(e.target.value),
                      }))
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                  >
                    <option value={15}>15 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={60}>1 saat</option>
                    <option value={120}>2 saat</option>
                    <option value={240}>4 saat</option>
                    <option value={480}>8 saat</option>
                    <option value={1440}>24 saat</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3 mt-6 pt-6 border-t border-white/10'>
          <button
            onClick={onClose}
            className='px-6 py-3 text-gray-400 hover:text-white transition-colors'
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300'
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
