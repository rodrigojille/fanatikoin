export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  TRANSACTION = 'transaction'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}
