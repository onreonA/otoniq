/**
 * CollaborationStats Component
 * Collaboration statistics overview
 */

import React from 'react';

interface CollaborationStatsProps {
  stats: {
    totalTeams: number;
    totalMembers: number;
    activeWorkflows: number;
    pendingApprovals: number;
  };
}

export default function CollaborationStats({ stats }: CollaborationStatsProps) {
  const statCards = [
    {
      title: 'Toplam Takım',
      value: stats.totalTeams,
      icon: 'ri-team-line',
      color: 'blue',
      change: '+2',
      changeType: 'positive',
    },
    {
      title: 'Takım Üyeleri',
      value: stats.totalMembers,
      icon: 'ri-user-line',
      color: 'green',
      change: '+5',
      changeType: 'positive',
    },
    {
      title: 'Aktif Workflow',
      value: stats.activeWorkflows,
      icon: 'ri-play-circle-line',
      color: 'purple',
      change: '+3',
      changeType: 'positive',
    },
    {
      title: 'Bekleyen Onaylar',
      value: stats.pendingApprovals,
      icon: 'ri-time-line',
      color: 'orange',
      change: '-1',
      changeType: 'negative',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {statCards.map((stat, index) => (
        <div
          key={index}
          className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'
        >
          <div className='flex items-center justify-between mb-4'>
            <div
              className={`w-12 h-12 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center`}
            >
              <i className={`${stat.icon} text-${stat.color}-400 text-xl`}></i>
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                stat.changeType === 'positive'
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}
            >
              <i
                className={`ri-arrow-${stat.changeType === 'positive' ? 'up' : 'down'}-line`}
              ></i>
              <span>{stat.change}</span>
            </div>
          </div>
          <div>
            <p className='text-white font-bold text-2xl mb-1'>{stat.value}</p>
            <p className='text-gray-400 text-sm'>{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
