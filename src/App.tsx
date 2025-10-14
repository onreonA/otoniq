import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './presentation/router';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import { LoadingSpinner } from './presentation/components/animation/LoadingSpinner';
import { ErrorBoundary } from './presentation/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={__BASE_PATH__}>
        <Toaster
        position='top-right'
        toastOptions={{
          duration: 4000,
          className:
            'bg-background-primary text-text-primary border border-border-primary',
          style: {
            background: 'var(--color-bg-toast)',
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'var(--color-success-500)',
              secondary: 'var(--color-white)',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: 'var(--color-error-500)',
              secondary: 'var(--color-white)',
            },
          },
        }}
      />
      <Suspense
        fallback={
          <LoadingSpinner
            size='lg'
            color='primary'
            text='Yükleniyor...'
            fullScreen={true}
          />
        }
      >
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
