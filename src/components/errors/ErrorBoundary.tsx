import { Component, type ErrorInfo, type ReactNode } from 'react';
import { UI } from '../../constants/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface-light px-4">
          <div className="max-w-md w-full text-center">
            <h1 className="font-display text-section font-bold text-text-primary mb-3">
              {UI.errorFallback.title}
            </h1>
            <p className="text-text-muted mb-8 leading-relaxed">
              {UI.errorFallback.message}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="btn-primary"
            >
              {UI.errorFallback.retryButton}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
