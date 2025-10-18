/**
 * AddMemberModal Component
 * Add member to team modal
 */

import React, { useState } from 'react';
import { TeamMember } from '../../../../../infrastructure/services/WorkflowCollaborationService';

interface AddMemberModalProps {
  teamId: string;
  onClose: () => void;
  onAddMember: (
    teamId: string,
    userId: string,
    role: TeamMember['role']
  ) => void;
}

export default function AddMemberModal({
  teamId,
  onClose,
  onAddMember,
}: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as TeamMember['role'],
  });

  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: 'viewer',
      label: 'Görüntüleyici',
      description: 'Sadece görüntüleme yetkisi',
    },
    {
      value: 'contributor',
      label: 'Katkıda Bulunan',
      description: 'Workflow oluşturma ve düzenleme',
    },
    {
      value: 'editor',
      label: 'Editör',
      description: 'Tüm workflow düzenleme yetkisi',
    },
    {
      value: 'admin',
      label: 'Yönetici',
      description: 'Takım yönetimi ve tüm yetkiler',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setLoading(true);
    try {
      // In a real app, you would search for the user by email first
      const userId = 'user-' + Math.random().toString(36).substr(2, 9);
      await onAddMember(teamId, userId, formData.role);
      onClose();
    } catch (error) {
      console.error('Add member error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md mx-4'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-white font-semibold text-lg'>Takıma Üye Ekle</h3>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors'
          >
            <i className='ri-close-line text-xl'></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Email */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Kullanıcı Email *
            </label>
            <input
              type='email'
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              placeholder='kullanici@example.com'
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className='block text-gray-300 text-sm font-medium mb-2'>
              Rol
            </label>
            <div className='space-y-2'>
              {roles.map(role => (
                <label
                  key={role.value}
                  className={`block p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.role === role.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <input
                      type='radio'
                      name='role'
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          role: e.target.value as TeamMember['role'],
                        }))
                      }
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500'
                    />
                    <div>
                      <p className='text-white font-medium text-sm'>
                        {role.label}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {role.description}
                      </p>
                    </div>
                  </div>
                </label>
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
              disabled={loading || !formData.email.trim()}
              className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <i className='ri-loader-4-line animate-spin mr-2'></i>
                  Ekleniyor...
                </>
              ) : (
                <>
                  <i className='ri-user-add-line mr-2'></i>
                  Üye Ekle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
