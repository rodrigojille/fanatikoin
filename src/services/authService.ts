import { LoginCredentials, RegisterCredentials, UserProfile, AuthResponse } from '@/types/auth';
import axiosInstance from '@/utils/axiosConfig';

export class AuthService {
  private storageKey = 'fanatikoin_auth';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/login', credentials);
      const { token, user } = response.data;

      // Store auth state
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify({
          user,
          token,
          authType: 'traditional'
        }));
      }

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  getCurrentUser(): { user: UserProfile | null; token: string | null; authType: 'traditional' | 'web3' | null } {
    if (typeof window === 'undefined') {
      return { user: null, token: null, authType: null };
    }
    const auth = localStorage.getItem(this.storageKey);
    if (!auth) return { user: null, token: null, authType: null };
    return JSON.parse(auth);
  }

  getAuthToken(): string | null {
    const auth = this.getCurrentUser();
    return auth.token;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/register', credentials);
      const { token, user } = response.data;

      // Store auth state
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify({
          user,
          token,
          authType: 'traditional'
        }));
      }

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  }

  async loginWithWallet(address: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>('/api/auth/wallet-login', { address });
      const { token, user } = response.data;

      // Store auth state
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify({
          user,
          token,
          authType: 'web3'
        }));
      }

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Wallet login failed');
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await axiosInstance.patch<UserProfile>(`/api/users/${userId}`, updates);
      const updatedUser = response.data;

      // Update auth state if this is the current user
      if (typeof window !== 'undefined') {
        const currentAuth = this.getCurrentUser();
        if (currentAuth?.user?._id?.toString() === userId) {
          localStorage.setItem(this.storageKey, JSON.stringify({
            user: updatedUser,
            token: currentAuth.token,
            authType: currentAuth.authType
          }));
        }
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Profile update failed');
    }
  }
}

export const authService = new AuthService();
