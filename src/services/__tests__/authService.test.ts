import { authService } from '../authService';
import { LoginCredentials, RegisterCredentials } from '@/types/auth';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('register', () => {
    const validCredentials: RegisterCredentials = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    it('creates a new user successfully', async () => {
      const user = await authService.register(validCredentials);
      
      expect(user).toMatchObject({
        username: validCredentials.username,
        email: validCredentials.email
      });
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('prevents duplicate email registration', async () => {
      await authService.register(validCredentials);
      
      await expect(authService.register(validCredentials))
        .rejects
        .toThrow('Email already registered');
    });

    it('prevents duplicate username registration', async () => {
      await authService.register(validCredentials);
      
      await expect(authService.register({
        ...validCredentials,
        email: 'different@example.com'
      }))
        .rejects
        .toThrow('Username already taken');
    });
  });

  describe('login', () => {
    const validCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      await authService.register({
        ...validCredentials,
        username: 'testuser',
        confirmPassword: 'password123'
      });
    });

    it('logs in user successfully', async () => {
      const user = await authService.login(validCredentials);
      
      expect(user).toMatchObject({
        email: validCredentials.email
      });
    });

    it('rejects invalid email', async () => {
      await expect(authService.login({
        ...validCredentials,
        email: 'wrong@example.com'
      }))
        .rejects
        .toThrow('User not found');
    });

    it('rejects invalid password', async () => {
      await expect(authService.login({
        ...validCredentials,
        password: 'wrongpassword'
      }))
        .rejects
        .toThrow('Invalid password');
    });
  });

  describe('loginWithWallet', () => {
    const walletAddress = '0x1234567890123456789012345678901234567890';

    it('creates new user for new wallet', async () => {
      const user = await authService.loginWithWallet(walletAddress);
      
      expect(user.walletAddress).toBe(walletAddress);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('returns existing user for known wallet', async () => {
      const firstLogin = await authService.loginWithWallet(walletAddress);
      const secondLogin = await authService.loginWithWallet(walletAddress);
      
      expect(secondLogin).toMatchObject(firstLogin);
    });
  });

  describe('updateProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      userId = user.id;
    });

    it('updates user profile successfully', async () => {
      const updates = {
        username: 'newusername',
        avatar: 'https://example.com/avatar.jpg'
      };

      const updatedUser = await authService.updateProfile(userId, updates);
      
      expect(updatedUser).toMatchObject(updates);
    });

    it('throws error for non-existent user', async () => {
      await expect(authService.updateProfile('nonexistent', {
        username: 'newname'
      }))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no user is logged in', () => {
      const { user, authType } = authService.getCurrentUser();
      expect(user).toBeNull();
      expect(authType).toBeNull();
    });

    it('returns user data when logged in', async () => {
      const registeredUser = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      const { user, authType } = authService.getCurrentUser();
      expect(user).toMatchObject({
        id: registeredUser.id,
        email: registeredUser.email
      });
      expect(authType).toBe('traditional');
    });
  });
});
