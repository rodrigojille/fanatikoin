import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { NotificationType } from '@/types/notification';

interface ToastItem {
  id: string;
  type: NotificationType;
  message: string;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create portal element when component mounts
    const element = document.createElement('div');
    document.body.appendChild(element);
    setPortalElement(element);

    // Clean up when component unmounts
    return () => {
      document.body.removeChild(element);
    };
  }, []);

  // Subscribe to custom toast events
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      const { type, message } = event.detail;
      addToast(type, message);
    };

    // Add event listener
    window.addEventListener('toast', handleToastEvent as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('toast', handleToastEvent as EventListener);
    };
  }, []);

  // Add a new toast
  const addToast = (type: NotificationType, message: string) => {
    const newToast: ToastItem = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message
    };

    setToasts(prevToasts => [...prevToasts, newToast]);
  };

  // Remove a toast by ID
  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 left-0';
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-0 right-0';
      case 'bottom-left':
        return 'bottom-0 left-0';
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-0 right-0';
      default:
        return 'top-0 right-0';
    }
  };

  if (!portalElement) return null;

  return createPortal(
    <div className={`fixed z-50 p-4 space-y-4 ${getPositionClasses()}`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    portalElement
  );
};

// Helper function to show toasts from anywhere in the app
export const showToast = (type: NotificationType, message: string) => {
  const event = new CustomEvent('toast', {
    detail: { type, message }
  });
  window.dispatchEvent(event);
};

export default ToastContainer;
