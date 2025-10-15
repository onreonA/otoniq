/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '../../../shared/config/sentry';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4'>
          <div className='max-w-2xl w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center'>
            <div className='w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6'>
              <AlertTriangle className='w-10 h-10 text-red-400' />
            </div>

            <h1 className='text-3xl font-bold text-white mb-4'>
              Bir hata oluştu
            </h1>

            <p className='text-gray-300 mb-6'>
              Üzgünüz, beklenmeyen bir hata meydana geldi. Teknik ekibimiz
              bilgilendirildi ve sorunu en kısa sürede çözeceğiz.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className='bg-black/30 rounded-lg p-4 mb-6 text-left'>
                <p className='text-red-400 font-mono text-sm mb-2'>
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className='text-gray-400 font-mono text-xs overflow-auto max-h-40'>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className='flex gap-4 justify-center'>
              <button
                onClick={this.handleReset}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center gap-2'
              >
                <RefreshCw className='w-5 h-5' />
                Tekrar Dene
              </button>

              <button
                onClick={this.handleGoHome}
                className='px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center gap-2'
              >
                <Home className='w-5 h-5' />
                Ana Sayfaya Dön
              </button>
            </div>

            <p className='text-sm text-gray-400 mt-6'>
              Hata Kodu:{' '}
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
