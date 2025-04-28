import { User } from '@/types/auth';

// Event types for analytics tracking
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  WALLET_CONNECT = 'wallet_connect',
  WALLET_DISCONNECT = 'wallet_disconnect',
  TOKEN_VIEW = 'token_view',
  TOKEN_PURCHASE = 'token_purchase',
  TOKEN_SALE = 'token_sale',
  TOKEN_CREATION = 'token_creation',
  AUCTION_BID = 'auction_bid',
  AUCTION_CREATE = 'auction_create',
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  ERROR = 'error'
}

// Interface for analytics events
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  userId?: string;
  walletAddress?: string;
  data?: Record<string, any>;
}

// In-memory storage for events (would be replaced with a proper database in production)
const events: AnalyticsEvent[] = [];

// Maximum events to store in memory
const MAX_EVENTS = 1000;

/**
 * Track an analytics event
 */
export const trackEvent = (
  eventType: AnalyticsEventType,
  user?: User | null,
  data?: Record<string, any>
): void => {
  const event: AnalyticsEvent = {
    eventType,
    timestamp: Date.now(),
    userId: user?.id,
    walletAddress: user?.walletAddress,
    data
  };

  // Add event to in-memory storage
  events.unshift(event);
  
  // Keep only the most recent events
  if (events.length > MAX_EVENTS) {
    events.length = MAX_EVENTS;
  }
  
  // In a production environment, we would send this to a proper analytics service
  // For now, we just log it to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }
  
  // This would be where we'd send the event to a server or third-party analytics service
  sendToAnalyticsServer(event).catch(err => {
    console.error('Failed to send analytics event:', err);
  });
};

/**
 * Get events for a specific user
 */
export const getUserEvents = (userId: string): AnalyticsEvent[] => {
  return events.filter(event => event.userId === userId);
};

/**
 * Get events for a specific wallet address
 */
export const getWalletEvents = (walletAddress: string): AnalyticsEvent[] => {
  return events.filter(event => event.walletAddress === walletAddress);
};

/**
 * Get events of a specific type
 */
export const getEventsByType = (eventType: AnalyticsEventType): AnalyticsEvent[] => {
  return events.filter(event => event.eventType === eventType);
};

/**
 * Get all events within a time range
 */
export const getEventsByTimeRange = (startTime: number, endTime: number): AnalyticsEvent[] => {
  return events.filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
};

/**
 * Send event to analytics server
 * This is a placeholder for actual implementation
 */
const sendToAnalyticsServer = async (event: AnalyticsEvent): Promise<void> => {
  // In a real implementation, this would send the event to a server
  // For now, we just simulate a successful send
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
      
      if (!response.ok) {
        throw new Error(`Analytics server responded with status: ${response.status}`);
      }
    } catch (error) {
      // Silently fail in production, log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send analytics event:', error);
      }
    }
  }
  
  // Return a resolved promise to simulate success
  return Promise.resolve();
};

/**
 * Clear all events (for testing purposes)
 */
export const clearEvents = (): void => {
  events.length = 0;
};

export default {
  trackEvent,
  getUserEvents,
  getWalletEvents,
  getEventsByType,
  getEventsByTimeRange,
  clearEvents
};
