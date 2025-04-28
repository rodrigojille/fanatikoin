import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationCenter from '../NotificationCenter';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

// Mock component to test notification functionality
const NotificationTester = () => {
  const { addNotification, notifications, unreadCount } = useNotifications();

  const addInfoNotification = () => {
    addNotification({
      type: NotificationType.INFO,
      title: 'Info Notification',
      message: 'This is an info notification'
    });
  };

  const addSuccessNotification = () => {
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'Success Notification',
      message: 'This is a success notification'
    });
  };

  const addErrorNotification = () => {
    addNotification({
      type: NotificationType.ERROR,
      title: 'Error Notification',
      message: 'This is an error notification'
    });
  };

  return (
    <div>
      <div data-testid="notification-count">{unreadCount}</div>
      <div data-testid="notification-list-length">{notifications.length}</div>
      <button onClick={addInfoNotification} data-testid="add-info">Add Info</button>
      <button onClick={addSuccessNotification} data-testid="add-success">Add Success</button>
      <button onClick={addErrorNotification} data-testid="add-error">Add Error</button>
      <NotificationCenter />
    </div>
  );
};

describe('NotificationCenter', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    // The bell icon should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows notification panel when clicked', () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    // Click the notification bell
    fireEvent.click(screen.getByRole('button'));
    
    // Notification panel should be visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('displays correct notification count', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );
    
    // Initially there should be 0 notifications
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // There should now be 1 notification
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    
    // Add another notification
    fireEvent.click(screen.getByTestId('add-success'));
    
    // There should now be 2 notifications
    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
  });

  it('marks notifications as read when clicked', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );
    
    // Add a notification
    fireEvent.click(screen.getByTestId('add-info'));
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button'));
    
    // Click on the notification
    fireEvent.click(screen.getByText('Info Notification'));
    
    // Unread count should be 0
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    });
  });

  it('clears all notifications when "Clear all" is clicked', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );
    
    // Add multiple notifications
    fireEvent.click(screen.getByTestId('add-info'));
    fireEvent.click(screen.getByTestId('add-success'));
    fireEvent.click(screen.getByTestId('add-error'));
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button'));
    
    // Click "Clear all"
    fireEvent.click(screen.getByText('Clear all'));
    
    // Notification count should be 0
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notification-list-length')).toHaveTextContent('0');
    });
  });

  it('marks all notifications as read when "Mark all as read" is clicked', async () => {
    render(
      <NotificationProvider>
        <NotificationTester />
      </NotificationProvider>
    );
    
    // Add multiple notifications
    fireEvent.click(screen.getByTestId('add-info'));
    fireEvent.click(screen.getByTestId('add-success'));
    fireEvent.click(screen.getByTestId('add-error'));
    
    // Open notification panel
    fireEvent.click(screen.getByRole('button'));
    
    // Click "Mark all as read"
    fireEvent.click(screen.getByText('Mark all as read'));
    
    // Unread count should be 0, but notification list should still have 3 items
    await waitFor(() => {
      expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
      expect(screen.getByTestId('notification-list-length')).toHaveTextContent('3');
    });
  });
});
