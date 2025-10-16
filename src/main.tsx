import { StrictMode } from 'react';
import './i18n';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { validateEnv } from './shared/config/env';
import { initializeThemeSystem } from './presentation/store/theme/themeStore';
import { initSentry } from './shared/config/sentry';
import ErrorBoundary from './presentation/components/base/ErrorBoundary';

// Initialize Sentry for error tracking
initSentry();

// Clean console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  // Keep console.warn and console.error for important messages
}

// Validate environment variables on app start
validateEnv();

// Initialize theme system
initializeThemeSystem();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
