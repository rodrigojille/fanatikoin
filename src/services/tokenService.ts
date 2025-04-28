import { AuthResponse } from '@/types/auth';
import { authService } from './authService';
import axiosInstance from '@/utils/axiosConfig';

class TokenService {
  private refreshTimeout: NodeJS.Timeout | null = null;
  private readonly tokenRefreshThreshold = 5 * 60 * 1000; // 5 minutes before expiry

  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const currentToken = authService.getAuthToken();
      if (!currentToken) return null;

      const response = await axiosInstance.post<AuthResponse>('/api/auth/refresh');
      const { token, user } = response.data;

      // Update auth state
      if (typeof window !== 'undefined') {
        const currentAuth = authService.getCurrentUser();
        localStorage.setItem('fanatikoin_auth', JSON.stringify({
          user,
          token,
          authType: currentAuth?.authType || 'traditional'
        }));
      }

      return { token, user };
    } catch (error) {
      // If refresh fails, log out the user
      authService.logout();
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Token refresh failed');
    }
  }

  scheduleTokenRefresh(token: string): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const timeUntilRefresh = expiryTime - Date.now() - this.tokenRefreshThreshold;

      if (timeUntilRefresh > 0) {
        this.refreshTimeout = setTimeout(() => {
          this.refreshToken();
        }, timeUntilRefresh);
      } else {
        // Token is already expired or very close to expiry
        this.refreshToken();
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  clearRefreshTimeout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}

export const tokenService = new TokenService();
