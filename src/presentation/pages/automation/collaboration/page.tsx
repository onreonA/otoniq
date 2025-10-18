/**
 * Workflow Collaboration Dashboard
 * Team management and workflow collaboration
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  workflowCollaborationService,
  WorkflowTeam,
  TeamMember,
  WorkflowNotification,
  WorkflowActivity,
} from '../../../../infrastructure/services/WorkflowCollaborationService';
import TeamsOverview from './components/TeamsOverview';
import TeamManagement from './components/TeamManagement';
import WorkflowSharing from './components/WorkflowSharing';
import ActivityFeed from './components/ActivityFeed';
import NotificationsPanel from './components/NotificationsPanel';
import CollaborationStats from './components/CollaborationStats';

export default function WorkflowCollaborationPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'teams' | 'sharing' | 'activity' | 'notifications'
  >('teams');
  const [teams, setTeams] = useState<WorkflowTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [notifications, setNotifications] = useState<WorkflowNotification[]>(
    []
  );
  const [activity, setActivity] = useState<WorkflowActivity[]>([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMembers: 0,
    activeWorkflows: 0,
    pendingApprovals: 0,
  });

  // Load collaboration data
  const loadCollaborationData = async () => {
    setLoading(true);
    try {
      // Load teams
      const teamsData =
        await workflowCollaborationService.getTeams('mock-tenant-id');
      setTeams(teamsData);

      // Load notifications
      const notificationsData =
        await workflowCollaborationService.getUserNotifications(
          'current-user-id'
        );
      setNotifications(notificationsData);

      // Load activity (mock data for now)
      const mockActivity: WorkflowActivity[] = [
        {
          id: '1',
          workflowId: 'workflow-1',
          userId: 'user-1',
          activityType: 'created',
          activityDescription: 'Yeni workflow oluşturuldu',
          metadata: {},
          createdAt: new Date(),
          user: {
            id: 'user-1',
            fullName: 'Ahmet Yılmaz',
            email: 'ahmet@example.com',
          },
        },
        {
          id: '2',
          workflowId: 'workflow-2',
          userId: 'user-2',
          activityType: 'shared',
          activityDescription: 'Workflow paylaşıldı',
          metadata: {},
          createdAt: new Date(),
          user: {
            id: 'user-2',
            fullName: 'Mehmet Kaya',
            email: 'mehmet@example.com',
          },
        },
      ];
      setActivity(mockActivity);

      // Load stats
      setStats({
        totalTeams: teamsData.length,
        totalMembers: teamsData.reduce(
          (sum, team) => sum + (team as any).memberCount || 0,
          0
        ),
        activeWorkflows: 12,
        pendingApprovals: 3,
      });
    } catch (error) {
      console.error('Load collaboration data error:', error);
      toast.error('Collaboration verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load team members when team is selected
  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await workflowCollaborationService.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Load team members error:', error);
      toast.error('Takım üyeleri yüklenirken hata oluştu');
    }
  };

  // Load data on mount
  useEffect(() => {
    loadCollaborationData();
  }, []);

  // Load team members when team is selected
  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam);
    }
  }, [selectedTeam]);

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  // Handle notification read
  const handleNotificationRead = async (notificationId: string) => {
    try {
      await workflowCollaborationService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      toast.success('Bildirim okundu olarak işaretlendi');
    } catch (error) {
      console.error('Mark notification as read error:', error);
      toast.error('Bildirim işaretlenemedi');
    }
  };

  // Handle create team
  const handleCreateTeam = async (
    teamData: Omit<WorkflowTeam, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const newTeam = await workflowCollaborationService.createTeam(teamData);
      setTeams(prev => [newTeam, ...prev]);
      toast.success('Takım başarıyla oluşturuldu');
    } catch (error) {
      console.error('Create team error:', error);
      toast.error('Takım oluşturulamadı');
    }
  };

  // Handle add team member
  const handleAddTeamMember = async (
    teamId: string,
    userId: string,
    role: TeamMember['role']
  ) => {
    try {
      await workflowCollaborationService.addTeamMember(
        teamId,
        userId,
        role,
        'current-user-id'
      );
      await loadTeamMembers(teamId); // Refresh team members
      toast.success('Takım üyesi eklendi');
    } catch (error) {
      console.error('Add team member error:', error);
      toast.error('Takım üyesi eklenemedi');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4'></div>
          <p className='text-gray-400 text-lg'>Collaboration yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Header */}
      <div className='bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                to='/automation'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Workflow Collaboration
                </h1>
                <p className='text-gray-300 mt-1'>
                  Team management and workflow collaboration
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                <i className='ri-add-line mr-2'></i>
                Yeni Takım
              </button>
              <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                <i className='ri-share-line mr-2'></i>
                Workflow Paylaş
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <CollaborationStats stats={stats} />
      </div>

      {/* Tabs */}
      <div className='max-w-7xl mx-auto px-4 pb-4'>
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-1'>
          <div className='flex space-x-1'>
            {[
              { id: 'teams', label: 'Takımlar', icon: 'ri-team-line' },
              { id: 'sharing', label: 'Paylaşım', icon: 'ri-share-line' },
              { id: 'activity', label: 'Aktivite', icon: 'ri-activity-line' },
              {
                id: 'notifications',
                label: 'Bildirimler',
                icon: 'ri-notification-line',
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={`${tab.icon} text-lg`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 pb-8'>
        {activeTab === 'teams' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-1'>
              <TeamsOverview
                teams={teams}
                selectedTeam={selectedTeam}
                onTeamSelect={handleTeamSelect}
                onCreateTeam={handleCreateTeam}
              />
            </div>
            <div className='lg:col-span-2'>
              {selectedTeam && (
                <TeamManagement
                  teamId={selectedTeam}
                  members={teamMembers}
                  onAddMember={handleAddTeamMember}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'sharing' && (
          <div className='space-y-6'>
            <WorkflowSharing />
          </div>
        )}

        {activeTab === 'activity' && (
          <div className='space-y-6'>
            <ActivityFeed activity={activity} />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className='space-y-6'>
            <NotificationsPanel
              notifications={notifications}
              onMarkAsRead={handleNotificationRead}
            />
          </div>
        )}
      </div>
    </div>
  );
}
