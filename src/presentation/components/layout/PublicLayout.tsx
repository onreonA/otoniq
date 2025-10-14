/**
 * PublicLayout Component
 * Layout for public pages (home, login, etc.)
 */

import { Outlet } from 'react-router-dom';
import { Header } from '../feature/Header';
import { Footer } from '../feature/Footer';
import { PageTransition } from '../animation/PageTransition';

export function PublicLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-background-primary'>
      <Header />

      <main className='flex-grow'>
        <PageTransition transition='slide'>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}
