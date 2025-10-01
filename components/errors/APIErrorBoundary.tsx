import React from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ErrorBoundary, { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary';

export interface APIErrorBoundaryProps extends ErrorBoundaryProps {
  retryAction?: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
}

export interface APIErrorBoundaryState extends ErrorBoundaryState {
  retryCount: number;
  isRetrying: boolean;
}

export default class APIErrorBoundary extends React.Component<APIErrorBoundaryProps, APIErrorBoundaryState> {
  static defaultProps = {
    maxRetries: 3,
    retryDelay: 2000,
  } as Partial<APIErrorBoundaryProps>;

  constructor(props: APIErrorBoundaryProps) {
    super(props as any);
    this.state = { hasError: false, error: null, retryCount: 0, isRetrying: false } as any;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, retryCount: 0, isRetrying: false } as any;
  }

  componentDidCatch(error: Error, info: any) {
    console.error('APIErrorBoundary caught an error', error, info);
    if (this.props.onError) this.props.onError(error, info);
  }

  handleRetry = async () => {
    const { retryAction, maxRetries, retryDelay } = this.props as any;
    this.setState({ isRetrying: true, retryCount: this.state.retryCount + 1 });
    try {
      if (retryAction) await retryAction();
      this.setState({ hasError: false, error: null, isRetrying: false, retryCount: 0 });
      toast.success('Retry succeeded');
    } catch (err) {
      console.error('Retry failed', err);
      toast.error('Retry failed');
      this.setState({ isRetrying: false });
      if (this.state.retryCount >= (maxRetries || 3)) {
        // keep error state, show permanent message
      } else {
        // optionally wait before next retry
        await new Promise(res => setTimeout(res, retryDelay || 2000));
      }
    }
  };

  renderFallback() {
    const { retryAction } = this.props as any;
    const { retryCount, isRetrying } = this.state;
    const maxRetries = (this.props as any).maxRetries ?? 3;
    return (
      <div className="glass rounded-2xl p-8 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100/30 border border-red-200/30 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
          <p className="text-white/60 text-sm">
            {retryCount >= maxRetries ? 'Unable to connect after multiple attempts' : 'Failed to communicate with TARA'}
          </p>
        </div>
        {retryCount < maxRetries && retryAction && (
          <button
            onClick={this.handleRetry}
            disabled={isRetrying}
            className="px-6 py-3 rounded-full bg-yellow-100/20 text-yellow-400 border border-yellow-200/30 hover:bg-yellow-100/30 disabled:opacity-50"
          >
            {isRetrying ? 'Retrying...' : `Retry (${retryCount}/${maxRetries})`}
          </button>
        )}
        <button
          onClick={() => (window.location.href = '/dashboard')}
          className="px-6 py-3 rounded-full glass text-white hover:bg-white/15"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) return this.renderFallback();
    return this.props.children as React.ReactElement;
  }
}
