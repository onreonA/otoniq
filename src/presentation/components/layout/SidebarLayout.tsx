/**
 * SidebarLayout Component
 * Main layout wrapper with sidebar and top header
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { MobileSidebar } from './MobileSidebar';
import { Breadcrumb } from './Breadcrumb';
import { PageTransition } from '../animation/PageTransition';
import { useUIStore } from '../../store/ui/uiStore';

/**
 * SidebarLayout Component
 */
export function SidebarLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden flex'>
      {/* Animated Background */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000'></div>
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-0 md:ml-16' : 'ml-0 md:ml-64'}`}
      >
        {/* Top Header */}
        <TopHeader />

        {/* Main Content */}
        <main className='flex-1'>
          <div className='px-0 py-0 overflow-x-hidden max-w-full'>
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Page Content with Transition */}
            <PageTransition transition='fade'>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
