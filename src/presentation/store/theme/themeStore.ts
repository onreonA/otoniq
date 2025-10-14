/**
 * Theme Store
 * Manages theme state and persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'minimal' | 'system';

interface ThemeState {
  // State
  mode: ThemeMode;
  systemTheme: 'light' | 'dark';

  // Actions
  setMode: (mode: ThemeMode) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;

  // Computed
  currentTheme: () => 'light' | 'dark' | 'minimal';
}

/**
 * Get system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'system',
      systemTheme: getSystemTheme(),

      // Actions
      setMode: (mode: ThemeMode) => set({ mode }),

      setSystemTheme: (theme: 'light' | 'dark') => set({ systemTheme: theme }),

      // Computed
      currentTheme: () => {
        const { mode, systemTheme } = get();

        if (mode === 'system') {
          return systemTheme;
        }

        return mode;
      },
    }),
    {
      name: 'otoniq-theme-storage',
      partialize: state => ({
        mode: state.mode,
      }),
    }
  )
);

/**
 * Initialize theme system
 */
export function initializeThemeSystem() {
  // Apply theme class to document
  const applyTheme = () => {
    const theme = useThemeStore.getState().currentTheme();

    // Remove all theme classes
    document.documentElement.classList.remove(
      'theme-light',
      'theme-dark',
      'theme-minimal'
    );

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
  };

  // Apply theme initially
  applyTheme();

  // Subscribe to theme changes
  useThemeStore.subscribe(applyTheme);

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      useThemeStore
        .getState()
        .setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }
}
