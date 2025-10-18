/**
 * CreateTeamModal Component
 * Create new team modal
 */

import React, { useState } from 'react';
import { WorkflowTeam } from '../../../../../infrastructure/services/WorkflowCollaborationService';

interface CreateTeamModalProps {
  onClose: () => void;
  onCreateTeam: (
    teamData: Omit<WorkflowTeam, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export default function CreateTeamModal({
  onClose,
  onCreateTeam,
}: CreateTeamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamType: 'development' as WorkflowTeam['teamType'],
    color: '#3B82F6',
    icon: 'ri-team-line',
  });

  const [loading, setLoading] = useState(false);

  const teamTypes = [
    { value: 'development', label: 'Geliştirme', icon: 'ri-code-line' },
    { value: 'operations', label: 'Operasyon', icon: 'ri-settings-line' },
    { value: 'analytics', label: 'Analitik', icon: 'ri-bar-chart-line' },
    { value: 'management', label: 'Yönetim', icon: 'ri-user-star-line' },
    { value: 'custom', label: 'Özel', icon: 'ri-team-line' },
  ];

  const colors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899',
    '#6366F1',
  ];

  const icons = [
    'ri-team-line',
    'ri-code-line',
    'ri-settings-line',
    'ri-bar-chart-line',
    'ri-user-star-line',
    'ri-shield-line',
    'ri-rocket-line',
    'ri-lightbulb-line',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onCreateTeam({
        tenantId: 'current-tenant-id',
        name: formData.name,
        description: formData.description,
        teamType: formData.teamType,
        color: formData.color,
        icon: formData.icon,
        isActive: true,
        createdBy: 'current-user-id',
      });
      onClose();
    } catch (error) {
      console.error('Create team error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-white font-semibold text-lg'>
            Yeni Takım Oluştur
          </h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-xl'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Team Name */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Takım Adı *
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              placeholder='Takım adını girin'
              required
            />
          </div>

          {/* Team Description */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              placeholder='Takım açıklaması'
              rows={3}
            />
          </div>

          {/* Team Type */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Takım Türü
            </label>
            <select
              value={formData.teamType}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  teamType: e.target.value as WorkflowTeam['teamType'],
                }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
            >
              {teamTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Team Color */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Takım Rengi
            </label>
            <div className='flex flex-wrap gap-2'>
              {colors.map(color => (
                <button
                  key={color}
                  type='button'
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-white scale-110'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Team Icon */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Takım İkonu
            </label>
            <div className='grid grid-cols-4 gap-2'>
              {icons.map(icon => (
                <button
                  key={icon}
                  type='button'
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-white/20 text-gray-400 hover:border-white/40 hover:text-white'
                  }`}
                >
                  <i className={`${icon} text-lg`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
            >
              İptal
            </button>
            <button
              type='submit'
              disabled={loading || !formData.name.trim()}
              className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <i className='ri-loader-4-line animate-spin mr-2'></i>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <i className='ri-add-line mr-2'></i>
                  Takım Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
