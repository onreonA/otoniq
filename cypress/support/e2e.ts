// Cypress E2E Support File

// Import commands
import './commands';

// Hide fetch/XHR requests in command log
const app = window.top;
if (
  app &&
  !app.document.head.querySelector('[data-hide-command-log-request]')
) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['supabase.auth.token'],
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions (useful for third-party scripts)
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});
