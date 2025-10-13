import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const admin = {
    name: 'Sistem Yöneticisi',
    email: 'admin@otoniq.ai',
    role: 'Super Admin',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20system%20administrator%20portrait%2C%20confident%20tech%20expert%2C%20modern%20office%20background%2C%20clean%20corporate%20style&width=100&height=100&seq=admin-avatar-1&orientation=squarish',
  };

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-shield-star-line text-white text-xl"></i>
            </div>
            <div>
              <span
                className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
                style={{ fontFamily: '"Pacifico", serif' }}
              >
                Otoniq.ai
              </span>
              <div className="text-xs text-gray-400 -mt-1">Admin Panel</div>
            </div>
          </Link>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-white font-bold text-lg">1,247</div>
              <div className="text-gray-400 text-xs">Aktif Kullanıcı</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">99.8%</div>
              <div className="text-gray-400 text-xs">Sistem Durumu</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">₺2.4M</div>
              <div className="text-gray-400 text-xs">Aylık Gelir</div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="hidden md:flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">
                Sistem Normal
              </span>
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-300 hover:text-white transition-colors cursor-pointer relative">
              <i className="ri-notification-line text-xl"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Emergency Button */}
            <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-xl transition-colors cursor-pointer">
              <i className="ri-alarm-warning-line mr-2"></i>
              Acil Durum
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-400">
                  <img
                    src={admin.avatar}
                    alt={admin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-white font-medium text-sm">
                    {admin.name}
                  </div>
                  <div className="text-red-400 text-xs">{admin.role}</div>
                </div>
                <i
                  className={`ri-arrow-down-s-line text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                ></i>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <div className="text-white font-medium">{admin.name}</div>
                    <div className="text-gray-400 text-sm">{admin.email}</div>
                    <div className="text-red-400 text-sm font-medium">
                      {admin.role}
                    </div>
                  </div>

                  <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <i className="ri-settings-line mr-3"></i>
                    Sistem Ayarları
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <i className="ri-database-line mr-3"></i>
                    Veritabanı
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <i className="ri-file-text-line mr-3"></i>
                    Loglar
                  </button>

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <i className="ri-dashboard-line mr-3"></i>
                      Kullanıcı Paneli
                    </Link>
                    <Link
                      to="/"
                      className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
