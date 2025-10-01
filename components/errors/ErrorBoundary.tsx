import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error | null) => React.ReactNode);
  onError?: (error: Error, info?: any) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console for now; production may report to Sentry or another service
    console.error('ErrorBoundary caught an error', error, info);
    if (this.props.onError) this.props.onError(error, info);
  }

  renderFallback() {
    const { fallback } = this.props;
    const { error } = this.state;
    if (typeof fallback === 'function') return fallback(error);
    if (fallback) return fallback;

    return (
      <div className="glass rounded-2xl p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100/30 border border-red-200/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-white/60 text-sm">This section encountered an error</p>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <p className="text-xs text-white/70 font-mono break-all">{String(error?.message)}</p>
          </div>
        )}
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="px-6 py-3 rounded-full bg-yellow-100/20 text-yellow-400 border border-yellow-200/30 hover:bg-yellow-100/30"
        >
          Try Again
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) return this.renderFallback();
    return this.props.children as React.ReactElement;
  }
}
