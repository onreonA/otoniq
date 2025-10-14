/**
 * TopHeader Component
 * Top navigation bar with user menu, notifications, and search
 */

import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useState, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/ui/uiStore';
import { useAuth } from '../../hooks/useAuth';

/**
 * TopHeader Component
 */
const TopHeader = memo(function TopHeader() {
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, toggleMobileSidebar } = useUIStore();
  const { userProfile, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  // Mock notifications
  const notifications = useMemo(
    () => [
      {
        id: 1,
        title: 'Yeni Sipariş',
        message: '5 yeni sipariş alındı',
        time: '2 dakika önce',
        unread: true,
      },
      {
        id: 2,
        title: 'Stok Uyarısı',
        message: '3 ürünün stoğu azalıyor',
        time: '1 saat önce',
        unread: true,
      },
      {
        id: 3,
        title: 'Shopify Senkronizasyonu',
        message: '50 ürün başarıyla senkronize edildi',
        time: '3 saat önce',
        unread: false,
      },
    ],
    []
  );

  const unreadCount = useMemo(
    () => notifications.filter(n => n.unread).length,
    [notifications]
  );

  return (
    <header
      className={`
        fixed top-0 h-16 z-20
        transition-all duration-300 ease-in-out
        left-0 right-0
        bg-gray-900 border-b border-gray-800
      `}
    >
      <div className='h-full px-4 flex items-center justify-between w-full'>
        {/* Left Section */}
        <div className='flex items-center gap-4 flex-1 min-w-0'>
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className='md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300'
            aria-label='Toggle mobile menu'
          >
            <Menu className='w-5 h-5' />
          </button>

          {/* Sidebar Toggle (Desktop) */}
          <button
            onClick={toggleSidebar}
            className='hidden md:flex p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300'
            aria-label='Toggle sidebar'
          >
            {sidebarCollapsed ? (
              <ChevronRight className='w-5 h-5' />
            ) : (
              <ChevronLeft className='w-5 h-5' />
            )}
          </button>

          {/* Current Page Title */}
          <div className='flex items-center gap-2'>
            <div className='hidden md:block'>
              <div className='text-lg font-bold text-white'>Dashboard</div>
              <div className='text-xs text-gray-400 -mt-1'>Genel Bakış</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className='hidden sm:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 lg:w-96 ml-4'>
            <Search className='w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Ürün, sipariş veya müşteri ara...'
              className='flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 focus:outline-none'
            />
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-2 flex-shrink-0'>
          {/* Search Button (Mobile) */}
          <button
            className='sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300'
            aria-label='Search'
          >
            <Search className='w-5 h-5' />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className='relative'>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300'
              aria-label='Notifications'
            >
              <Bell className='w-5 h-5' />
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center'>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setShowNotifications(false)}
                />
                <div className='absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-20'>
                  <div className='p-4 border-b border-gray-800'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-white'>Bildirimler</h3>
                      {unreadCount > 0 && (
                        <span className='px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full'>
                          {unreadCount} yeni
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='max-h-96 overflow-y-auto'>
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`
                          p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer
                          ${notification.unread ? 'bg-blue-500/10' : ''}
                        `}
                      >
                        <div className='flex items-start gap-3'>
                          <div
                            className={`
                            w-2 h-2 rounded-full mt-2
                            ${notification.unread ? 'bg-blue-400' : 'bg-transparent'}
                          `}
                          />
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-white'>
                              {notification.title}
                            </p>
                            <p className='text-sm text-gray-300 mt-0.5'>
                              {notification.message}
                            </p>
                            <p className='text-xs text-gray-400 mt-1'>
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='p-3 border-t border-white/10'>
                    <button className='w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium'>
                      Tümünü Gör
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className='relative'>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors'
              aria-label='User menu'
            >
              <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-gradient-to-r from-blue-400 to-purple-400'>
                <div className='w-full h-full bg-indigo-600 rounded-full flex items-center justify-center'>
                  <span className='text-white font-semibold text-sm'>
                    {userProfile?.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className='hidden md:block text-left'>
                <p className='text-white font-medium text-sm'>
                  {userProfile?.email?.split('@')[0] || 'User'}
                </p>
                <p className='text-gray-400 text-xs'>
                  {userProfile?.role === 'super_admin'
                    ? 'Super Admin'
                    : 'Tenant Admin'}
                </p>
              </div>
              <i
                className={`ri-arrow-down-s-line text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              ></i>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <>
                <div
                  className='fixed inset-0 z-10'
                  onClick={() => setShowUserMenu(false)}
                />
                <div className='absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-20'>
                  <div className='px-4 py-3 border-b border-gray-800'>
                    <div className='text-white font-medium'>
                      {userProfile?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className='text-gray-400 text-sm'>
                      {userProfile?.email || 'user@example.com'}
                    </div>
                    <div className='text-blue-400 text-sm font-medium'>
                      {userProfile?.role === 'super_admin'
                        ? 'Super Admin'
                        : 'Tenant Admin'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className='flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer'
                  >
                    <i className='ri-user-line mr-3'></i>
                    Profil
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className='flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer'
                  >
                    <i className='ri-settings-line mr-3'></i>
                    Ayarlar
                  </button>

                  <div className='border-t border-gray-800 mt-2 pt-2'>
                    <button
                      onClick={handleLogout}
                      className='flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer'
                    >
                      <i className='ri-logout-box-line mr-3'></i>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export { TopHeader };
