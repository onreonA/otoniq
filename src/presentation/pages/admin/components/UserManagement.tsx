import { useState, useEffect } from 'react';
import { supabase } from '../../../../infrastructure/database/supabase/client';
import { LoginTrackingService } from '../../../../infrastructure/services/LoginTrackingService';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import ViewUserModal from './ViewUserModal';
import toast from 'react-hot-toast';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  tenant_id: string;
  created_at: string;
  last_sign_in_at?: string;
  tenant?: {
    company_name: string;
    subscription_plan: string;
    subscription_status: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Users'ları yükle
  const loadUsers = async () => {
    try {
      setLoading(true);

      // Gerçek veri ile kullanıcıları yükle
      const usersData = await LoginTrackingService.getUsersWithStatus();

      // Pagination uygula
      const offset = (currentPage - 1) * itemsPerPage;
      const paginatedUsers = usersData.slice(offset, offset + itemsPerPage);

      setUsers(paginatedUsers);
      setTotalUsers(usersData.length);
      setTotalPages(Math.ceil(usersData.length / itemsPerPage));
    } catch (error) {
      console.error('Users yükleme hatası:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme ve filtre değişikliklerinde yükle
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filterStatus]);

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    loadUsers();
  };

  // Status rengi (database'den gelen status kullan)
  const getStatusColor = (user: any) => {
    if (user.status === 'active') {
      return 'bg-green-500/20 text-green-400';
    }
    return 'bg-orange-500/20 text-orange-400';
  };

  // Status text (database'den gelen status kullan)
  const getStatusText = (user: any) => {
    if (user.status === 'active') {
      return 'Aktif';
    }
    return 'Pasif';
  };

  // Plan rengi
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400';
      case 'professional':
        return 'bg-blue-500/20 text-blue-400';
      case 'starter':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Plan text
  const getPlanText = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Professional';
      case 'starter':
        return 'Starter';
      default:
        return plan;
    }
  };

  // Last login time (database'den gelen last_login_text kullan)
  const getLastLoginText = (user: any) => {
    return user.last_login_text || 'Hiç giriş yapmadı';
  };

  // Usage percentage (mock for now)
  const getUsagePercentage = (user: User) => {
    // This would be calculated based on actual usage data
    return Math.floor(Math.random() * 100);
  };

  // Select all users
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Select individual user
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Edit user
  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  // View user
  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowViewModal(true);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);

      if (error) throw error;

      toast.success('Kullanıcı başarıyla silindi');
      loadUsers();
    } catch (error) {
      console.error('User silme hatası:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Kullanıcı Yönetimi</h1>
          <p className='text-gray-400 mt-1'>
            Tüm kullanıcıları görüntüle ve yönet
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2'
        >
          <i className='ri-user-add-line'></i>
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className='flex items-center space-x-4'>
        <form onSubmit={handleSearch} className='flex-1'>
          <div className='relative'>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Kullanıcı ara...'
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
            />
            <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
          </div>
        </form>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className='bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors'
        >
          <option value='all'>Tüm Durumlar</option>
          <option value='active'>Aktif</option>
          <option value='inactive'>Pasif</option>
        </select>
      </div>

      {/* Users Table */}
      <div className='bg-white/5 border border-white/10 rounded-2xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-white/5'>
              <tr>
                <th className='p-4 text-left'>
                  <input
                    type='checkbox'
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className='w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400'
                  />
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Kullanıcı
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Şirket
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Plan
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Durum
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Kullanım
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  Son Giriş
                </th>
                <th className='p-4 text-left text-gray-300 font-medium'>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  className='border-t border-white/10 hover:bg-white/5 transition-colors'
                >
                  <td className='p-4'>
                    <input
                      type='checkbox'
                      checked={selectedUsers.includes(user.id)}
                      onChange={e =>
                        handleSelectUser(user.id, e.target.checked)
                      }
                      className='w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-400'
                    />
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold'>
                        {user.full_name?.charAt(0) ||
                          user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className='font-semibold text-white'>
                          {user.full_name || 'İsimsiz'}
                        </div>
                        <div className='text-sm text-gray-400'>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 text-gray-300'>
                    <div className='space-y-1'>
                      <div className='font-medium text-white'>
                        {user.company_name || 'Şirket bilgisi yok'}
                      </div>
                      <div className='text-xs text-gray-400'>
                        ID: {user.company_id || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getPlanColor(user.tenant?.subscription_plan || 'starter')}`}
                    >
                      {getPlanText(user.tenant?.subscription_plan || 'starter')}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(user)}`}
                    >
                      {getStatusText(user)}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-16 bg-white/10 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full'
                          style={{ width: `${getUsagePercentage(user)}%` }}
                        ></div>
                      </div>
                      <span className='text-sm text-gray-400'>
                        {getUsagePercentage(user)}%
                      </span>
                    </div>
                  </td>
                  <td className='p-4 text-gray-400 text-sm'>
                    {getLastLoginText(user)}
                  </td>
                  <td className='p-4'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEditUser(user.id)}
                        className='text-blue-400 hover:text-blue-300 transition-colors cursor-pointer'
                        title='Düzenle'
                      >
                        <i className='ri-edit-line'></i>
                      </button>
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className='text-green-400 hover:text-green-300 transition-colors cursor-pointer'
                        title='Görüntüle'
                      >
                        <i className='ri-eye-line'></i>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className='text-red-400 hover:text-red-300 transition-colors cursor-pointer'
                        title='Sil'
                      >
                        <i className='ri-delete-bin-line'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-gray-400 text-sm'>
          {totalUsers} kullanıcı gösteriliyor
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className='p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <i className='ri-arrow-left-s-line'></i>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className='p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            <i className='ri-arrow-right-s-line'></i>
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadUsers();
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          loadUsers();
        }}
        user={selectedUser}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
}
