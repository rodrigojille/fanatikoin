import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../../pages/login';
import Register from '../../pages/register';
import Profile from '../../pages/profile';
import { MongoClient } from 'mongodb';
import clientPromise from '../../lib/mongodb';

describe('Frontend Integration Tests', () => {
  let connection: MongoClient;
  let db: any;

  beforeAll(async () => {
    connection = await clientPromise;
    db = connection.db('fanatikoin');
    await db.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({});
  });

  describe('Authentication Flow', () => {
    it('should handle registration flow', async () => {
      render(
        <AuthProvider>
          <Register />
        </AuthProvider>
      );

      // Fill registration form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
      });
    });

    it('should handle login flow', async () => {
      render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Fill login form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      });
    });

    it('should handle wallet connection', async () => {
      render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Click connect wallet button
      fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));

      // Mock wallet connection response
      global.ethereum = {
        request: jest.fn().mockResolvedValue(['0x123456789abcdef'])
      };

      // Wait for wallet connection
      await waitFor(() => {
        expect(screen.getByText(/wallet connected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Management', () => {
    it('should handle profile updates', async () => {
      render(
        <AuthProvider>
          <Profile />
        </AuthProvider>
      );

      // Fill update form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: 'updateduser' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Smart Contract Integration', () => {
    it('should handle token creation', async () => {
      render(
        <AuthProvider>
          <Profile />
        </AuthProvider>
      );

      // Mock web3 provider
      global.ethereum = {
        request: jest.fn().mockResolvedValue(['0x123456789abcdef'])
      };

      // Click create token button
      fireEvent.click(screen.getByRole('button', { name: /create token/i }));

      // Fill token form
      fireEvent.change(screen.getByLabelText(/token name/i), {
        target: { value: 'Test Token' }
      });
      fireEvent.change(screen.getByLabelText(/token symbol/i), {
        target: { value: 'TEST' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/token created/i)).toBeInTheDocument();
      });
    });
  });
});
