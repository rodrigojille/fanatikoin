import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  transparent?: boolean;
  children: React.ReactNode;
}

/**
 * Loading overlay component that displays a spinner and optional message
 * over the content while loading is in progress
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  transparent = false,
  children
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Content (blurred when loading) */}
      <div className={isLoading ? 'blur-sm pointer-events-none' : ''}>
        {children}
      </div>

      {/* Overlay */}
      {isLoading && (
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center z-50 ${
            transparent ? 'bg-white/50 dark:bg-gray-900/50' : 'bg-white/90 dark:bg-gray-900/90'
          }`}
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingSpinner size="lg" color="primary" />
          {message && (
            <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
