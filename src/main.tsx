import { StrictMode } from 'react';
import './i18n';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { validateEnv } from './shared/config/env';
import { initializeThemeSystem } from './presentation/store/theme/themeStore';

// Validate environment variables on app start
validateEnv();

// Initialize theme system
initializeThemeSystem();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
