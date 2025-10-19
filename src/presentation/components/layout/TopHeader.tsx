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
import { NotificationBell } from '../notifications/NotificationBell';
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

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  // Get user ID and tenant ID for notifications
  const userId = userProfile?.id || 'user-123';
  const tenantId = userProfile?.tenant_id || 'tenant-123';

  return (
    <header
      className={`
        fixed top-0 h-16 z-40
        transition-all duration-300 ease-in-out
        left-0 right-0
        bg-gray-900 border-b border-gray-800
      `}
    >
      <div className='h-full px-4 flex items-center justify-between w-full'>
        {/* Left Section */}
        <div className='flex items-center gap-4'>
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

          {/* Logo */}
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <span className='text-white font-bold text-lg'>O</span>
            </div>
            <span className='hidden md:block text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Otoniq.ai
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-3 flex-shrink-0'>
          {/* Search Bar - Moved to Right */}
          <div className='hidden sm:flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 lg:w-80'>
            <Search className='w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Ürün, sipariş veya müşteri ara...'
              className='flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-400 focus:outline-none'
            />
          </div>
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
          <NotificationBell userId={userId} tenantId={tenantId} />

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
                {/* FİRMA İSMİ BUTTON'DA DA GÖSTERİLİYOR */}
                {userProfile?.tenant?.company_name && (
                  <p className='text-green-400 text-xs font-medium truncate max-w-32'>
                    🏢 {userProfile.tenant.company_name}
                  </p>
                )}
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
                    {/* FİRMA İSMİ EKLENİYOR */}
                    {userProfile?.tenant?.company_name && (
                      <div className='text-green-400 text-sm font-medium mt-1 flex items-center'>
                        <i className='ri-building-line mr-1'></i>
                        {userProfile.tenant.company_name}
                      </div>
                    )}
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
