import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/base/Button';

interface User {
  name: string;
  email: string;
  company: string;
  plan: string;
  avatar: string;
}

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: 'Yeni AI özelliği aktif',
      time: '5 dk önce',
      type: 'success',
    },
    { id: 2, title: 'Aylık rapor hazır', time: '1 saat önce', type: 'info' },
    {
      id: 3,
      title: 'Sistem güncellemesi',
      time: '2 saat önce',
      type: 'warning',
    },
  ]);

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-brain-line text-white text-xl"></i>
            </div>
            <div>
              <span
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                Otoniq.ai
              </span>
              <div className="text-xs text-gray-400 -mt-1">Dashboard</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
            >
              <i className="ri-dashboard-line mr-2"></i>
              Ana Sayfa
            </Link>
            <Link
              to="/dashboard/analytics"
              className="text-gray-300 font-medium hover:text-purple-400 transition-colors cursor-pointer"
            >
              <i className="ri-bar-chart-line mr-2"></i>
              Analitik
            </Link>
            <Link
              to="/dashboard/ai-tools"
              className="text-gray-300 font-medium hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <i className="ri-robot-line mr-2"></i>
              AI Araçları
            </Link>
            <Link
              to="/dashboard/settings"
              className="text-gray-300 font-medium hover:text-pink-400 transition-colors cursor-pointer"
            >
              <i className="ri-settings-line mr-2"></i>
              Ayarlar
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer relative">
                <i className="ri-notification-line text-xl"></i>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gradient-to-r from-blue-400 to-purple-400">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-white font-medium text-sm">
                    {user.name}
                  </div>
                  <div className="text-gray-400 text-xs">{user.plan} Plan</div>
                </div>
                <i
                  className={`ri-arrow-down-s-line text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                ></i>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                    <div className="text-gray-400 text-sm">{user.company}</div>
                  </div>

                  <Link
                    to="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <i className="ri-user-line mr-3"></i>
                    Profil
                  </Link>
                  <Link
                    to="/dashboard/billing"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <i className="ri-bill-line mr-3"></i>
                    Faturalama
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <i className="ri-settings-line mr-3"></i>
                    Ayarlar
                  </Link>

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <i className="ri-logout-box-line mr-3"></i>
                      Çıkış Yap
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
