import { useState } from 'react';

export default function UserManagement() {
  const [users] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@sirket.com',
      company: 'TechCorp A.Ş.',
      plan: 'Pro',
      status: 'active',
      lastLogin: '2 saat önce',
      usage: 85,
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20business%20person%20headshot%2C%20confident%20expression%2C%20modern%20corporate%20style%2C%20clean%20background&width=60&height=60&seq=user-1&orientation=squarish',
    },
    {
      id: 2,
      name: 'Zeynep Kaya',
      email: 'zeynep@startup.com',
      company: 'InnovateLab',
      plan: 'Enterprise',
      status: 'active',
      lastLogin: '5 dakika önce',
      usage: 92,
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20businesswoman%20portrait%2C%20confident%20female%20executive%2C%20modern%20office%20background%2C%20clean%20corporate%20style&width=60&height=60&seq=user-2&orientation=squarish',
    },
    {
      id: 3,
      name: 'Mehmet Özkan',
      email: 'mehmet@eticaret.com',
      company: 'E-Commerce Plus',
      plan: 'Basic',
      status: 'inactive',
      lastLogin: '3 gün önce',
      usage: 45,
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20businessman%20portrait%2C%20middle%20aged%20executive%2C%20confident%20expression%2C%20corporate%20background&width=60&height=60&seq=user-3&orientation=squarish',
    },
    {
      id: 4,
      name: 'Ayşe Demir',
      email: 'ayse@consulting.com',
      company: 'Strategy Consulting',
      plan: 'Pro',
      status: 'active',
      lastLogin: '1 saat önce',
      usage: 78,
      avatar:
        'https://readdy.ai/api/search-image?query=professional%20consultant%20woman%2C%20business%20attire%2C%20confident%20pose%2C%20modern%20office%20setting%2C%20clean%20background&width=60&height=60&seq=user-4&orientation=squarish',
    },
    {
      id: 5,
      name: 'Can Arslan',
      email: 'can@tech.com',
      company: 'Tech Solutions',
      plan: 'Enterprise',
      status: 'suspended',
      lastLogin: '1 hafta önce',
      usage: 15,
      avatar:
        'https://readdy.ai/api/search-image?query=young%20tech%20professional%2C%20software%20developer%20portrait%2C%20modern%20workspace%2C%20casual%20business%20attire&width=60&height=60&seq=user-5&orientation=squarish',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'suspended':
        return 'Askıya Alındı';
      default:
        return 'Bilinmiyor';
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Kullanıcı Yönetimi
            </h2>
            <p className='text-gray-300'>
              Tüm kullanıcıları görüntüle ve yönet
            </p>
          </div>
          <button className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer'>
            <i className='ri-user-add-line mr-2'></i>
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Kullanıcı ara...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
              />
              <i className='ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
            </div>
          </div>

          {/* Status Filter */}
          <div className='md:w-48'>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
            >
              <option value='all'>Tüm Durumlar</option>
              <option value='active'>Aktif</option>
              <option value='inactive'>Pasif</option>
              <option value='suspended'>Askıya Alındı</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className='flex space-x-2'>
              <button className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'>
                <i className='ri-check-line mr-2'></i>
                Aktifleştir
              </button>
              <button className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'>
                <i className='ri-close-line mr-2'></i>
                Askıya Al
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-white/5 border-b border-white/10'>
              <tr>
                <th className='text-left p-4'>
                  <input
                    type='checkbox'
                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(user => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Kullanıcı
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Şirket
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Plan
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Durum
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Kullanım
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Son Giriş
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className='border-b border-white/5 hover:bg-white/5 transition-colors'
                >
                  <td className='p-4'>
                    <input
                      type='checkbox'
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    />
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-12 h-12 rounded-full overflow-hidden'>
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div>
                        <div className='text-white font-medium'>
                          {user.name}
                        </div>
                        <div className='text-gray-400 text-sm'>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 text-gray-300'>{user.company}</td>
                  <td className='p-4'>
                    <span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm'>
                      {user.plan}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(user.status)}`}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className='p-4'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-16 h-2 bg-gray-700 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300'
                          style={{ width: `${user.usage}%` }}
                        ></div>
                      </div>
                      <span className='text-gray-400 text-sm'>
                        {user.usage}%
                      </span>
                    </div>
                  </td>
                  <td className='p-4 text-gray-400 text-sm'>
                    {user.lastLogin}
                  </td>
                  <td className='p-4'>
                    <div className='flex space-x-2'>
                      <button className='text-blue-400 hover:text-blue-300 transition-colors cursor-pointer'>
                        <i className='ri-edit-line'></i>
                      </button>
                      <button className='text-green-400 hover:text-green-300 transition-colors cursor-pointer'>
                        <i className='ri-eye-line'></i>
                      </button>
                      <button className='text-red-400 hover:text-red-300 transition-colors cursor-pointer'>
                        <i className='ri-delete-bin-line'></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='p-4 border-t border-white/10 flex items-center justify-between'>
          <div className='text-gray-400 text-sm'>
            {filteredUsers.length} kullanıcı gösteriliyor
          </div>
          <div className='flex space-x-2'>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              <i className='ri-arrow-left-line'></i>
            </button>
            <button className='bg-blue-500 text-white px-3 py-2 rounded-lg'>
              1
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              2
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              3
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              <i className='ri-arrow-right-line'></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
