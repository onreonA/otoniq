/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4'>
          <div className='max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='p-4 bg-red-500/20 rounded-full'>
                <AlertTriangle className='w-8 h-8 text-red-400' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Bir Hata Oluştu
                </h1>
                <p className='text-white/60'>
                  Beklenmeyen bir sorun meydana geldi.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className='mb-6 p-4 bg-black/30 rounded-lg'>
                <p className='text-sm font-mono text-red-300 mb-2'>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className='mt-2'>
                    <summary className='text-xs text-white/60 cursor-pointer hover:text-white/80'>
                      Detayları Göster
                    </summary>
                    <pre className='text-xs text-white/40 mt-2 overflow-x-auto'>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className='flex gap-3'>
              <button
                onClick={this.handleReset}
                className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all'
              >
                <RefreshCw className='w-4 h-4' />
                Tekrar Dene
              </button>
              <Link
                to='/'
                className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all border border-white/10'
              >
                <Home className='w-4 h-4' />
                Ana Sayfa
              </Link>
            </div>

            <p className='mt-6 text-center text-sm text-white/40'>
              Sorun devam ederse, lütfen destek ekibiyle iletişime geçin.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version for functional components
 */
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    throw error; // Re-throw to be caught by ErrorBoundary
  };
}
