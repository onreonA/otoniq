import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './presentation/router';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import { LoadingSpinner } from './presentation/components/animation/LoadingSpinner';
import { SentryErrorBoundary } from './shared/config/sentry';

function App() {
  return (
    <SentryErrorBoundary
      fallback={({ error }) => (
        <div className='min-h-screen flex items-center justify-center bg-gray-900'>
          <div className='text-center max-w-md px-6'>
            <div className='w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <i className='ri-error-warning-line text-4xl text-white'></i>
            </div>
            <h1 className='text-2xl font-bold text-white mb-4'>
              Bir hata oluştu
            </h1>
            <p className='text-gray-400 mb-6'>{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all'
            >
              <i className='ri-refresh-line mr-2'></i>
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )}
      showDialog
    >
      <BrowserRouter>
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 4000,
            style: {
              minWidth: '300px',
              padding: '16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow:
                  '0 10px 40px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#10b981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow:
                  '0 10px 40px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#ef4444',
              },
            },
            loading: {
              duration: Infinity,
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow:
                  '0 10px 40px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#ffffff',
                secondary: '#3b82f6',
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
    </SentryErrorBoundary>
  );
}

export default App;
