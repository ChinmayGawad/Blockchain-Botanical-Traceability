import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';
import { reportError } from '../../services/errorReporting';

interface Props {
  children: ReactNode;
  /**
   * `full` renders a full page fallback (application level),
   * `route` renders a compact inline fallback that keeps the surrounding layout usable.
   */
  variant?: 'full' | 'route';
  /** Logical name of the area that is protected, used for reporting. */
  component?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkLoadError: boolean;
}

/** Detects the failure modes of `React.lazy` dynamic imports. */
const isLazyChunkError = (error: Error | null): boolean => {
  if (!error) return false;
  const message = `${error.message} ${error.name}`.toLowerCase();
  return (
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('failed to load module script')
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkLoadError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isChunkLoadError: isLazyChunkError(error) };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      component: this.props.component ?? 'ErrorBoundary',
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, isChunkLoadError: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleHome = () => {
    this.setState({ hasError: false, error: null, isChunkLoadError: false });
    window.location.href = '/';
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.variant === 'route') {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-lg p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              {this.state.isChunkLoadError ? <WifiOff className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {this.state.isChunkLoadError ? 'This view could not be loaded' : 'Something went wrong'}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {this.state.isChunkLoadError
                ? 'The module for this view could not be downloaded. Check your connection and try again.'
                : 'An unexpected error occurred while rendering this view. The rest of the application is still usable.'}
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="text-left bg-muted p-3 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="default"
                onClick={this.state.isChunkLoadError ? this.handleReload : this.handleReset}
                className="inline-flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {this.state.isChunkLoadError ? 'Reload' : 'Try again'}
              </Button>
              <Button
                variant="outline"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              Something unexpected happened
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FloraChain encountered an unhandled system error. Your data and verified blockchain records remain completely safe.
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="text-left bg-muted p-3 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-32">
              {this.state.error.message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="default"
              onClick={this.handleReload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
            <Button
              variant="outline"
              onClick={this.handleHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
