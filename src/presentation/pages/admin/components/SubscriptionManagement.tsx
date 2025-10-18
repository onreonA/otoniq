/**
 * Subscription Management Component
 * Manages subscription plans and active subscriptions
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  subscriptionService,
  SubscriptionPlan,
} from '../../../../infrastructure/services/SubscriptionService';

export default function SubscriptionManagement() {
  const [activeView, setActiveView] = useState<'plans' | 'subscriptions'>(
    'plans'
  );
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeView]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeView === 'plans') {
        const plansData = await subscriptionService.getAllPlans(true);
        setPlans(plansData);
      } else {
        const [subsData, statsData] = await Promise.all([
          subscriptionService.getAllSubscriptions(),
          subscriptionService.getSubscriptionStats(),
        ]);
        setSubscriptions(subsData);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      await subscriptionService.updatePlan(planId, {
        is_active: !currentStatus,
      });
      toast.success(
        `Plan ${!currentStatus ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`
      );
      loadData();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Plan durumu güncellenirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Abonelik Yönetimi
            </h2>
            <p className="text-gray-300">
              Planları ve abonelikleri yönet
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('plans')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeView === 'plans'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <i className="ri-vip-crown-line mr-2"></i>
              Planlar
            </button>
            <button
              onClick={() => setActiveView('subscriptions')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeView === 'subscriptions'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <i className="ri-user-star-line mr-2"></i>
              Abonelikler
            </button>
          </div>
        </div>
      </div>

      {/* Plans View */}
      {activeView === 'plans' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-black/20 backdrop-blur-sm border rounded-2xl p-6 ${
                plan.is_popular
                  ? 'border-purple-500/50'
                  : 'border-white/10'
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && plan.badge_text && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-4 py-1 rounded-full">
                    {plan.badge_text}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    plan.is_active
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {plan.is_active ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2 mt-4">
                {plan.display_name}
              </h3>

              {/* Tagline */}
              {plan.tagline && (
                <p className="text-gray-400 text-sm mb-4">{plan.tagline}</p>
              )}

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-white">
                    ₺{plan.price_monthly}
                  </span>
                  <span className="text-gray-400 ml-2">/ay</span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-300">
                    ₺{plan.price_yearly}
                  </span>
                  <span className="text-gray-400 ml-2">/yıl</span>
                  <span className="ml-2 text-green-400 text-sm">
                    %{plan.discount_yearly_percent} indirim
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-6">{plan.description}</p>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-white font-semibold text-sm">
                  Özellikler:
                </h4>
                <ul className="space-y-2">
                  {plan.features.max_products !== undefined && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      {plan.features.max_products === -1
                        ? 'Sınırsız'
                        : plan.features.max_products}{' '}
                      ürün
                    </li>
                  )}
                  {plan.features.max_users !== undefined && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      {plan.features.max_users === -1
                        ? 'Sınırsız'
                        : plan.features.max_users}{' '}
                      kullanıcı
                    </li>
                  )}
                  {plan.features.ai_credits_monthly !== undefined && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      {plan.features.ai_credits_monthly === -1
                        ? 'Sınırsız'
                        : plan.features.ai_credits_monthly}{' '}
                      AI kredi/ay
                    </li>
                  )}
                  {plan.features.storage_gb !== undefined && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      {plan.features.storage_gb === -1
                        ? 'Sınırsız'
                        : plan.features.storage_gb}{' '}
                      GB depolama
                    </li>
                  )}
                  {plan.features.advanced_analytics && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      Gelişmiş analitik
                    </li>
                  )}
                  {plan.features.priority_support && (
                    <li className="flex items-center text-gray-300 text-sm">
                      <i className="ri-check-line text-green-400 mr-2"></i>
                      Öncelikli destek
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-white/10 flex space-x-2">
                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  <i className="ri-edit-line mr-2"></i>
                  Düzenle
                </button>
                <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors">
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Subscriptions View */}
      {activeView === 'subscriptions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-user-star-line text-blue-400 text-2xl"></i>
                  <span className="text-blue-400 text-sm">Toplam</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.total_subscriptions}
                </div>
                <div className="text-gray-400 text-sm">Abonelik</div>
              </div>

              <div className="bg-gradient-to-br from-green-600/20 to-green-600/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-check-line text-green-400 text-2xl"></i>
                  <span className="text-green-400 text-sm">Aktif</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stats.active_subscriptions}
                </div>
                <div className="text-gray-400 text-sm">Abonelik</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-money-dollar-circle-line text-purple-400 text-2xl"></i>
                  <span className="text-purple-400 text-sm">MRR</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  ₺{stats.mrr.toLocaleString('tr-TR')}
                </div>
                <div className="text-gray-400 text-sm">Aylık Gelir</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-line-chart-line text-orange-400 text-2xl"></i>
                  <span className="text-orange-400 text-sm">ARR</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  ₺{stats.arr.toLocaleString('tr-TR')}
                </div>
                <div className="text-gray-400 text-sm">Yıllık Gelir</div>
              </div>
            </div>
          )}

          {/* Subscriptions Table */}
          <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Şirket
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Plan
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Döngü
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Durum
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Sonraki Ödeme
                    </th>
                    <th className="text-left p-4 text-gray-300 font-medium">
                      Tutar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="text-white font-medium">
                          {sub.company_name}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
                          {sub.plan_display_name}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300">
                        {sub.billing_cycle === 'yearly' ? 'Yıllık' : 'Aylık'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            sub.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : sub.status === 'trial'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {sub.status === 'active'
                            ? 'Aktif'
                            : sub.status === 'trial'
                              ? 'Deneme'
                              : sub.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">
                        {sub.next_payment_date
                          ? new Date(sub.next_payment_date).toLocaleDateString(
                              'tr-TR'
                            )
                          : '-'}
                      </td>
                      <td className="p-4 text-white font-medium">
                        ₺{sub.next_payment_amount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

