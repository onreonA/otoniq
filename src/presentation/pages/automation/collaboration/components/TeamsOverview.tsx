/**
 * TeamsOverview Component
 * Teams list and management
 */

import React, { useState } from 'react';
import { WorkflowTeam } from '../../../../../infrastructure/services/WorkflowCollaborationService';
import CreateTeamModal from './CreateTeamModal';

interface TeamsOverviewProps {
  teams: WorkflowTeam[];
  selectedTeam: string;
  onTeamSelect: (teamId: string) => void;
  onCreateTeam: (
    teamData: Omit<WorkflowTeam, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export default function TeamsOverview({
  teams,
  selectedTeam,
  onTeamSelect,
  onCreateTeam,
}: TeamsOverviewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getTeamTypeIcon = (type: string) => {
    switch (type) {
      case 'development':
        return 'ri-code-line';
      case 'operations':
        return 'ri-settings-line';
      case 'analytics':
        return 'ri-bar-chart-line';
      case 'management':
        return 'ri-user-star-line';
      case 'custom':
        return 'ri-team-line';
      default:
        return 'ri-team-line';
    }
  };

  const getTeamTypeLabel = (type: string) => {
    switch (type) {
      case 'development':
        return 'Geliştirme';
      case 'operations':
        return 'Operasyon';
      case 'analytics':
        return 'Analitik';
      case 'management':
        return 'Yönetim';
      case 'custom':
        return 'Özel';
      default:
        return 'Takım';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-white font-semibold text-lg'>Takımlar</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
        >
          <i className='ri-add-line mr-2'></i>
          Yeni Takım
        </button>
      </div>

      {/* Teams List */}
      <div className='space-y-3'>
        {teams.length === 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-team-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-lg mb-2'>Henüz takım yok</p>
            <p className='text-gray-500 text-sm'>İlk takımınızı oluşturun</p>
          </div>
        ) : (
          teams.map(team => (
            <div
              key={team.id}
              onClick={() => onTeamSelect(team.id)}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedTeam === team.id
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-10 h-10 rounded-lg flex items-center justify-center'
                  style={{ backgroundColor: team.color + '20' }}
                >
                  <i
                    className={`${team.icon} text-lg`}
                    style={{ color: team.color }}
                  ></i>
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='text-white font-medium truncate'>
                    {team.name}
                  </h4>
                  <p className='text-gray-400 text-sm truncate'>
                    {team.description}
                  </p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-gray-500'>
                      {getTeamTypeLabel(team.teamType)}
                    </span>
                    <span className='text-xs text-gray-500'>•</span>
                    <span className='text-xs text-gray-500'>
                      {new Date(team.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-400'>
                    {team.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                  <i className='ri-arrow-right-line text-gray-400'></i>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreateTeam={onCreateTeam}
        />
      )}
    </div>
  );
}
