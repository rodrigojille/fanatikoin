import { ObjectId } from 'mongodb';

export interface NotificationSettings {
  [key: string]: boolean;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  notifications?: NotificationSettings;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  walletAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  tokens?: number;
  isAdmin?: boolean;
  isTeam?: boolean;
  settings?: UserSettings;
  role?: string;
  avatarUrl?: string; // Optional avatar image URL for user profile
}

// User type with id property for compatibility with rewards system
export interface User {
  id: string;
  username?: string;
  email: string;
  walletAddress?: string;
  isAdmin?: boolean;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  confirmPassword?: string; // Optional for social login flows
}

export interface WalletLoginCredentials {
  address: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  authType: 'traditional' | 'web3' | null;
  balance?: string;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials, isSocialLogin?: boolean) => Promise<void>;
  loginWithWallet: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean; // Added for compatibility with rewards page
  user: UserProfile | null;
}
