/**
 * AuthLayout Component
 * Layout for authentication pages (login, signup)
 */

import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageTransition } from '../animation/PageTransition';

export function AuthLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Animated Background */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000'></div>
      </div>

      <div className='relative z-10 flex flex-col min-h-screen'>
        {/* Logo */}
        <div className='p-6'>
          <Link to='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
              <i className='ri-brain-line text-white text-xl'></i>
            </div>
            <span className='text-white font-bold text-xl'>Otoniq.ai</span>
          </Link>
        </div>

        {/* Content */}
        <div className='flex-grow flex items-center justify-center p-6'>
          <div className='w-full max-w-md'>
            <PageTransition transition='scale'>
              <Outlet />
            </PageTransition>
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 text-center text-gray-400 text-sm'>
          <p>© {new Date().getFullYear()} Otoniq.ai. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
