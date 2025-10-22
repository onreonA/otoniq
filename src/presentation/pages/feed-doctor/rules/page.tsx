/**
 * Feed Doctor Optimization Rules Management Page
 * Manage custom optimization rules for product analysis
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../../infrastructure/database/supabase/client';
import toast from 'react-hot-toast';

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  rule_type: string;
  rule_category: string;
  rule_config: any;
  priority: number;
  weight: number;
  is_active: boolean;
  is_auto_fixable: boolean;
  created_at: string;
  updated_at: string;
}

export default function OptimizationRulesPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [rules, setRules] = useState<OptimizationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<OptimizationRule | null>(null);

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadRules();
    }
  }, [userProfile?.tenant_id]);

  const loadRules = async () => {
    if (!userProfile?.tenant_id) return;

    try {
      const { data, error } = await supabase
        .from('feed_optimization_rules')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('priority', { ascending: true });

      if (error) throw error;

      setRules(data || []);
    } catch (error) {
      console.error('❌ Error loading rules:', error);
      toast.error('Kurallar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('feed_optimization_rules')
        .update({ is_active: !isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev =>
        prev.map(rule =>
          rule.id === ruleId ? { ...rule, is_active: !isActive } : rule
        )
      );

      toast.success(`Kural ${!isActive ? 'aktif' : 'pasif'} edildi`);
    } catch (error) {
      console.error('❌ Error toggling rule:', error);
      toast.error('Kural durumu güncellenirken hata oluştu');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Bu kuralı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('feed_optimization_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast.success('Kural silindi');
    } catch (error) {
      console.error('❌ Error deleting rule:', error);
      toast.error('Kural silinirken hata oluştu');
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'keywords':
        return 'bg-blue-500/20 text-blue-400';
      case 'special_chars':
        return 'bg-red-500/20 text-red-400';
      case 'keyword_density':
        return 'bg-green-500/20 text-green-400';
      case 'length':
        return 'bg-purple-500/20 text-purple-400';
      case 'count':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRuleCategoryColor = (category: string) => {
    switch (category) {
      case 'title':
        return 'bg-blue-500/20 text-blue-400';
      case 'description':
        return 'bg-green-500/20 text-green-400';
      case 'images':
        return 'bg-pink-500/20 text-pink-400';
      case 'pricing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'general':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
          <p className='text-gray-300'>Kurallar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/feed-doctor')}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-arrow-left-line text-2xl'></i>
            </button>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                Optimizasyon Kuralları
              </h1>
              <p className='text-gray-400'>
                Ürün analizi için özel kurallar tanımlayın ve yönetin
              </p>
            </div>
          </div>

          <div className='flex space-x-3'>
            <button
              onClick={() => setShowCreateModal(true)}
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl'
            >
              <i className='ri-add-line mr-2'></i>
              Yeni Kural
            </button>
            <button
              onClick={loadRules}
              className='bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-all duration-300'
            >
              <i className='ri-refresh-line mr-2'></i>
              Yenile
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div className='space-y-4'>
          {rules.length === 0 ? (
            <div className='text-center py-12 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl'>
              <i className='ri-rules-line text-6xl mb-4 text-gray-600'></i>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Henüz kural tanımlanmamış
              </h3>
              <p className='text-gray-400 mb-6'>
                Ürün analizlerinizi özelleştirmek için özel kurallar oluşturun
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300'
              >
                <i className='ri-add-line mr-2'></i>
                İlk Kuralınızı Oluşturun
              </button>
            </div>
          ) : (
            rules.map(rule => (
              <div
                key={rule.id}
                className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <h3 className='text-lg font-semibold text-white'>
                        {rule.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRuleTypeColor(rule.rule_type)}`}
                      >
                        {rule.rule_type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRuleCategoryColor(rule.rule_category)}`}
                      >
                        {rule.rule_category}
                      </span>
                      {rule.is_auto_fixable && (
                        <span className='px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400'>
                          Otomatik Düzeltilebilir
                        </span>
                      )}
                    </div>

                    <p className='text-gray-300 mb-4'>{rule.description}</p>

                    <div className='flex items-center space-x-6 text-sm text-gray-400'>
                      <div className='flex items-center space-x-2'>
                        <i className='ri-priority-line'></i>
                        <span>Öncelik: {rule.priority}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <i className='ri-weight-line'></i>
                        <span>Ağırlık: {rule.weight}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <i className='ri-calendar-line'></i>
                        <span>
                          {new Date(rule.created_at).toLocaleDateString(
                            'tr-TR'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className='p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 transition-all duration-300'
                      title='Düzenle'
                    >
                      <i className='ri-edit-line'></i>
                    </button>

                    <button
                      onClick={() => handleToggleRule(rule.id, rule.is_active)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        rule.is_active
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300'
                          : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 hover:text-gray-300'
                      }`}
                      title={rule.is_active ? 'Pasif Et' : 'Aktif Et'}
                    >
                      <i
                        className={
                          rule.is_active ? 'ri-pause-line' : 'ri-play-line'
                        }
                      ></i>
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className='p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300'
                      title='Sil'
                    >
                      <i className='ri-delete-bin-line'></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
