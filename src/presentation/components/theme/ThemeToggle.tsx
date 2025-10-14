/**
 * Theme Toggle Component
 * Allows users to switch between light, dark, and minimal themes
 */

import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Minimize } from 'lucide-react';
import { useThemeStore, ThemeMode } from '../../store/theme/themeStore';

/**
 * Theme Toggle Component
 */
export function ThemeToggle() {
  const { mode, setMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Theme options
  const themes: { id: ThemeMode; label: string; icon: JSX.Element }[] = [
    {
      id: 'light',
      label: 'Aydınlık',
      icon: <Sun className='w-4 h-4' />,
    },
    {
      id: 'dark',
      label: 'Karanlık',
      icon: <Moon className='w-4 h-4' />,
    },
    {
      id: 'minimal',
      label: 'Minimal',
      icon: <Minimize className='w-4 h-4' />,
    },
    {
      id: 'system',
      label: 'Sistem',
      icon: <Laptop className='w-4 h-4' />,
    },
  ];

  // Get current theme icon
  const currentTheme = themes.find(theme => theme.id === mode) || themes[0];

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300'
        aria-label='Theme toggle'
        title='Tema değiştir'
      >
        {currentTheme.icon}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl z-20'>
          <div className='p-2'>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  setMode(theme.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
                  ${
                    mode === theme.id
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {theme.icon}
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
