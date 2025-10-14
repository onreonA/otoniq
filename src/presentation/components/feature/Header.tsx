import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../base/Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className='bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
                <i className='ri-brain-line text-white text-xl'></i>
              </div>
              <div>
                <span
                  className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'
                  style={{ fontFamily: '"Pacifico", serif' }}
                >
                  Otoniq.ai
                </span>
                <div className='text-xs text-gray-400 -mt-1'>
                  İşletmelerin Dijital Zekâsı
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            <a
              href='#features'
              className={`font-medium transition-colors cursor-pointer relative group ${
                isActive('/')
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-blue-400'
              }`}
            >
              Özellikler
              <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full'></div>
            </a>
            <a
              href='#solutions'
              className={`font-medium transition-colors cursor-pointer relative group ${
                isActive('/')
                  ? 'text-purple-400'
                  : 'text-gray-300 hover:text-purple-400'
              }`}
            >
              Çözümler
              <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 transition-all duration-300 group-hover:w-full'></div>
            </a>
            <Link
              to='/pricing'
              className={`font-medium transition-colors cursor-pointer relative group ${
                isActive('/pricing')
                  ? 'text-cyan-400'
                  : 'text-gray-300 hover:text-cyan-400'
              }`}
            >
              Fiyatlandırma
              <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full'></div>
            </Link>
            <Link
              to='/about'
              className={`font-medium transition-colors cursor-pointer relative group ${
                isActive('/about')
                  ? 'text-pink-400'
                  : 'text-gray-300 hover:text-pink-400'
              }`}
            >
              Hakkımızda
              <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full'></div>
            </Link>

            <div className='flex items-center space-x-4 ml-8'>
              <Link to='/login'>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400'
                >
                  Giriş Yap
                </Button>
              </Link>
              <Link to='/demo'>
                <Button
                  size='sm'
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
                >
                  <i className='ri-rocket-line mr-2'></i>
                  AI'yi Dene
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-gray-300 hover:text-blue-400 cursor-pointer p-2'
            >
              <i
                className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-2xl`}
              ></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-6 border-t border-gray-800'>
            <div className='flex flex-col space-y-6'>
              <a
                href='#features'
                className='text-gray-300 hover:text-blue-400 font-medium cursor-pointer flex items-center'
              >
                <i className='ri-cpu-line mr-3 text-blue-400'></i>
                Özellikler
              </a>
              <a
                href='#solutions'
                className='text-gray-300 hover:text-purple-400 font-medium cursor-pointer flex items-center'
              >
                <i className='ri-settings-4-line mr-3 text-purple-400'></i>
                Çözümler
              </a>
              <Link
                to='/pricing'
                className='text-gray-300 hover:text-cyan-400 font-medium cursor-pointer flex items-center'
              >
                <i className='ri-price-tag-3-line mr-3 text-cyan-400'></i>
                Fiyatlandırma
              </Link>
              <Link
                to='/about'
                className='text-gray-300 hover:text-pink-400 font-medium cursor-pointer flex items-center'
              >
                <i className='ri-information-line mr-3 text-pink-400'></i>
                Hakkımızda
              </Link>

              <div className='flex flex-col space-y-3 pt-6 border-t border-gray-800'>
                <Link to='/login'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400'
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link to='/demo'>
                  <Button
                    size='sm'
                    className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  >
                    <i className='ri-rocket-line mr-2'></i>
                    AI'yi Dene
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
