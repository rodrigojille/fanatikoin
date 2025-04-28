import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  errorComponent?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, errorComponent } = this.props;

    if (hasError) {
      // If a custom error component is provided, use it
      if (errorComponent && error) {
        return errorComponent(error, this.resetError);
      }

      // If a fallback UI is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.resetError}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;
