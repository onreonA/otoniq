/**
 * TeamManagement Component
 * Team member management
 */

import React, { useState } from 'react';
import { TeamMember } from '../../../../../infrastructure/services/WorkflowCollaborationService';
import AddMemberModal from './AddMemberModal';

interface TeamManagementProps {
  teamId: string;
  members: TeamMember[];
  onAddMember: (
    teamId: string,
    userId: string,
    role: TeamMember['role']
  ) => void;
}

export default function TeamManagement({
  teamId,
  members,
  onAddMember,
}: TeamManagementProps) {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'red';
      case 'admin':
        return 'orange';
      case 'editor':
        return 'blue';
      case 'contributor':
        return 'green';
      case 'viewer':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Sahip';
      case 'admin':
        return 'Yönetici';
      case 'editor':
        return 'Editör';
      case 'contributor':
        return 'Katkıda Bulunan';
      case 'viewer':
        return 'Görüntüleyici';
      default:
        return 'Üye';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return 'ri-crown-line';
      case 'admin':
        return 'ri-user-star-line';
      case 'editor':
        return 'ri-edit-line';
      case 'contributor':
        return 'ri-user-add-line';
      case 'viewer':
        return 'ri-eye-line';
      default:
        return 'ri-user-line';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-white font-semibold text-lg'>Takım Üyeleri</h3>
        <button
          onClick={() => setShowAddMemberModal(true)}
          className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
        >
          <i className='ri-user-add-line mr-2'></i>
          Üye Ekle
        </button>
      </div>

      {/* Members List */}
      <div className='space-y-3'>
        {members.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-user-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-lg mb-2'>Henüz üye yok</p>
            <p className='text-gray-500 text-sm'>İlk üyeyi ekleyin</p>
          </div>
        ) : (
          members.map(member => (
            <div
              key={member.id}
              className='bg-white/5 border border-white/10 rounded-lg p-4'
            >
              <div className='flex items-center gap-3'>
                {/* Avatar */}
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                  {member.user?.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.fullName}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  ) : (
                    <span className='text-white font-medium text-sm'>
                      {member.user?.fullName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>

                {/* Member Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='text-white font-medium truncate'>
                      {member.user?.fullName || 'Bilinmeyen Kullanıcı'}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium bg-${getRoleColor(member.role)}-500/20 text-${getRoleColor(member.role)}-400`}
                    >
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                  <p className='text-gray-400 text-sm truncate'>
                    {member.user?.email || 'email@example.com'}
                  </p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-500'>
                      <i className='ri-time-line mr-1'></i>
                      {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                    </span>
                    {member.invitedBy && (
                      <>
                        <span className='text-xs text-gray-500'>•</span>
                        <span className='text-xs text-gray-500'>
                          Davet edildi
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  <button className='text-gray-400 hover:text-white transition-colors'>
                    <i className='ri-more-line text-lg'></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Team Stats */}
      <div className='bg-white/5 border border-white/10 rounded-lg p-4'>
        <h4 className='text-white font-medium mb-3'>Takım İstatistikleri</h4>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-gray-400 text-sm'>Toplam Üye</p>
            <p className='text-white font-bold text-xl'>{members.length}</p>
          </div>
          <div>
            <p className='text-gray-400 text-sm'>Aktif Üye</p>
            <p className='text-white font-bold text-xl'>
              {members.filter(m => m.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          teamId={teamId}
          onClose={() => setShowAddMemberModal(false)}
          onAddMember={onAddMember}
        />
      )}
    </div>
  );
}
