/**
 * Create Tenant Modal - Multi-step form for creating new tenants
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { tenantManagementService } from '../../../../infrastructure/services/TenantManagementService';
import { subscriptionService, SubscriptionPlan } from '../../../../infrastructure/services/SubscriptionService';

interface CreateTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1: Company Info
  company_name: string;
  domain: string;
  contact_email: string;
  contact_phone: string;

  // Step 2: Subscription Plan
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  is_trial: boolean;
  trial_days: number;

  // Step 3: Admin User
  admin_name: string;
  admin_email: string;
  admin_password: string;
  send_welcome_email: boolean;

  // Step 4: Configuration
  settings: {
    timezone: string;
    language: string;
    currency: string;
  };
}

export default function CreateTenantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTenantModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    domain: '',
    contact_email: '',
    contact_phone: '',
    plan_id: '',
    billing_cycle: 'monthly',
    is_trial: true,
    trial_days: 14,
    admin_name: '',
    admin_email: '',
    admin_password: '',
    send_welcome_email: true,
    settings: {
      timezone: 'Europe/Istanbul',
      language: 'tr',
      currency: 'TRY',
    },
  });

  // Load subscription plans
  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const data = await subscriptionService.getAllPlans();
      setPlans(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, plan_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Planlar yüklenirken hata oluştu');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.startsWith('settings.')) {
        const settingKey = field.split('.')[1];
        return {
          ...prev,
          settings: {
            ...prev.settings,
            [settingKey]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        if (!formData.company_name.trim()) {
          toast.error('Şirket adı gerekli');
          return false;
        }
        if (!formData.contact_email.trim()) {
          toast.error('İletişim e-postası gerekli');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
          toast.error('Geçerli bir e-posta adresi girin');
          return false;
        }
        return true;

      case 2:
        if (!formData.plan_id) {
          toast.error('Bir plan seçin');
          return false;
        }
        return true;

      case 3:
        if (!formData.admin_name.trim()) {
          toast.error('Admin adı gerekli');
          return false;
        }
        if (!formData.admin_email.trim()) {
          toast.error('Admin e-postası gerekli');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
          toast.error('Geçerli bir e-posta adresi girin');
          return false;
        }
        if (!formData.is_trial && !formData.admin_password.trim()) {
          toast.error('Şifre gerekli');
          return false;
        }
        if (formData.admin_password && formData.admin_password.length < 8) {
          toast.error('Şifre en az 8 karakter olmalı');
          return false;
        }
        return true;

      case 4:
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);

      await tenantManagementService.createTenant({
        company_name: formData.company_name,
        domain: formData.domain || undefined,
        admin_user: {
          email: formData.admin_email,
          full_name: formData.admin_name,
          password: formData.admin_password || undefined,
        },
        plan_id: formData.plan_id,
        billing_cycle: formData.billing_cycle,
        is_trial: formData.is_trial,
        settings: formData.settings,
      });

      toast.success('Müşteri başarıyla oluşturuldu!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      toast.error(error.message || 'Müşteri oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      company_name: '',
      domain: '',
      contact_email: '',
      contact_phone: '',
      plan_id: plans[0]?.id || '',
      billing_cycle: 'monthly',
      is_trial: true,
      trial_days: 14,
      admin_name: '',
      admin_email: '',
      admin_password: '',
      send_welcome_email: true,
      settings: {
        timezone: 'Europe/Istanbul',
        language: 'tr',
        currency: 'TRY',
      },
    });
    onClose();
  };

  const getSelectedPlan = () => {
    return plans.find((p) => p.id === formData.plan_id);
  };

  const calculatePrice = () => {
    const plan = getSelectedPlan();
    if (!plan) return 0;
    return formData.billing_cycle === 'yearly'
      ? plan.price_yearly
      : plan.price_monthly;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Yeni Müşteri Oluştur
              </h2>
              <p className="text-gray-300 text-sm">
                Adım {currentStep} / 4
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all ${
                  step <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Şirket Bilgileri
                </h3>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Şirket Adı <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      handleInputChange('company_name', e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="Örn: Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Domain (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) =>
                      handleInputChange('domain', e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="acme.otoniq.ai"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      İletişim E-postası <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        handleInputChange('contact_email', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="contact@acme.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Telefon (Opsiyonel)
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        handleInputChange('contact_phone', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Subscription Plan */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Abonelik Planı
                </h3>

                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button
                    onClick={() => handleInputChange('billing_cycle', 'monthly')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      formData.billing_cycle === 'monthly'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    onClick={() => handleInputChange('billing_cycle', 'yearly')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      formData.billing_cycle === 'yearly'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    Yıllık
                    <span className="ml-2 text-green-400 text-sm">
                      %{plans[0]?.discount_yearly_percent || 17} İndirim
                    </span>
                  </button>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => handleInputChange('plan_id', plan.id)}
                      className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.plan_id === plan.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {plan.is_popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">
                            {plan.badge_text}
                          </span>
                        </div>
                      )}

                      <h4 className="text-lg font-bold text-white mb-2">
                        {plan.display_name}
                      </h4>

                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">
                          ₺
                          {formData.billing_cycle === 'yearly'
                            ? plan.price_yearly
                            : plan.price_monthly}
                        </span>
                        <span className="text-gray-400 text-sm">
                          /{formData.billing_cycle === 'yearly' ? 'yıl' : 'ay'}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-4">
                        {plan.description}
                      </p>

                      <ul className="space-y-2 text-sm">
                        {plan.features.max_products !== -1 && (
                          <li className="text-gray-300 flex items-center">
                            <i className="ri-check-line text-green-400 mr-2"></i>
                            {plan.features.max_products} ürün
                          </li>
                        )}
                        {plan.features.max_users !== -1 && (
                          <li className="text-gray-300 flex items-center">
                            <i className="ri-check-line text-green-400 mr-2"></i>
                            {plan.features.max_users} kullanıcı
                          </li>
                        )}
                        {plan.features.ai_credits_monthly !== -1 && (
                          <li className="text-gray-300 flex items-center">
                            <i className="ri-check-line text-green-400 mr-2"></i>
                            {plan.features.ai_credits_monthly} AI kredi
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Trial Option */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_trial}
                      onChange={(e) =>
                        handleInputChange('is_trial', e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-white font-medium">
                        Deneme Süresi Başlat
                      </span>
                      <p className="text-gray-400 text-sm">
                        {formData.trial_days} gün ücretsiz deneme
                      </p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 3: Admin User */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Admin Kullanıcısı
                </h3>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Ad Soyad <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.admin_name}
                    onChange={(e) =>
                      handleInputChange('admin_name', e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    E-posta <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.admin_email}
                    onChange={(e) =>
                      handleInputChange('admin_email', e.target.value)
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="admin@acme.com"
                  />
                </div>

                {!formData.is_trial && (
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Şifre <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) =>
                        handleInputChange('admin_password', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="En az 8 karakter"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Boş bırakılırsa otomatik oluşturulur
                    </p>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.send_welcome_email}
                      onChange={(e) =>
                        handleInputChange('send_welcome_email', e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">
                      Hoş geldiniz e-postası gönder
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step 4: Configuration & Summary */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">
                  Yapılandırma ve Özet
                </h3>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Saat Dilimi
                    </label>
                    <select
                      value={formData.settings.timezone}
                      onChange={(e) =>
                        handleInputChange('settings.timezone', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="Europe/Istanbul">İstanbul</option>
                      <option value="Europe/London">London</option>
                      <option value="America/New_York">New York</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Dil</label>
                    <select
                      value={formData.settings.language}
                      onChange={(e) =>
                        handleInputChange('settings.language', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Para Birimi</label>
                    <select
                      value={formData.settings.currency}
                      onChange={(e) =>
                        handleInputChange('settings.currency', e.target.value)
                      }
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-4">
                    Özet
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Şirket:</span>
                      <span className="text-white font-medium">
                        {formData.company_name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Plan:</span>
                      <span className="text-white font-medium">
                        {getSelectedPlan()?.display_name}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Faturalama:</span>
                      <span className="text-white font-medium">
                        {formData.billing_cycle === 'yearly' ? 'Yıllık' : 'Aylık'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Durum:</span>
                      <span className="text-blue-400 font-medium">
                        {formData.is_trial
                          ? `${formData.trial_days} Gün Deneme`
                          : 'Ücretli'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Admin:</span>
                      <span className="text-white font-medium">
                        {formData.admin_email}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">
                          Toplam:
                        </span>
                        <span className="text-2xl font-bold text-white">
                          {formData.is_trial ? (
                            <span className="text-green-400">Ücretsiz</span>
                          ) : (
                            `₺${calculatePrice()}`
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Geri
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              İptal
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all"
              >
                İleri
                <i className="ri-arrow-right-line ml-2"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Oluştur
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

