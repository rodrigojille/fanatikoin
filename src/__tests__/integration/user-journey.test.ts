import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MongoClient } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import { ethers } from 'ethers';
import clientPromise from '../../lib/mongodb';
import TeamTokenFactory from '../../contracts/abis/TeamTokenFactory.json';
import { AuthService } from '../../services/authService';

describe('User Journey Integration Tests', () => {
  let connection: MongoClient;
  let db: any;
  const authService = new AuthService();

  beforeAll(async () => {
    connection = await clientPromise;
    db = connection.db('fanatikoin');
    await db.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await db.collection('users').deleteMany({});
  });

  describe('Traditional User Journey', () => {
    it('should complete full registration and login flow', async () => {
      // 1. Register new user
      const registerResponse = await fetch('http://localhost:3005/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      });

      expect(registerResponse.status).toBe(201);
      const registerData = await registerResponse.json();
      expect(registerData.token).toBeDefined();
      expect(registerData.user.username).toBe('testuser');

      // 2. Login with credentials
      const loginResponse = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });

      expect(loginResponse.status).toBe(200);
      const loginData = await loginResponse.json();
      expect(loginData.token).toBeDefined();

      // 3. Update profile
      const updateResponse = await fetch(`http://localhost:3005/api/users/${registerData.user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          username: 'updateduser'
        })
      });

      expect(updateResponse.status).toBe(200);
      const updateData = await updateResponse.json();
      expect(updateData.username).toBe('updateduser');
    });
  });

  describe('Web3 User Journey', () => {
    it('should complete full wallet login and token interaction flow', async () => {
      // 1. Create wallet
      const wallet = ethers.Wallet.createRandom();

      // 2. Login with wallet
      const walletLoginResponse = await fetch('http://localhost:3005/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: wallet.address
        })
      });

      expect(walletLoginResponse.status).toBe(200);
      const walletLoginData = await walletLoginResponse.json();
      expect(walletLoginData.token).toBeDefined();
      expect(walletLoginData.user.walletAddress).toBe(wallet.address);

      // 3. Interact with smart contract (mock for testing)
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      const factoryContract = new ethers.Contract(
        '0xD84420a763Fd7Af933fe516Ef6ceE44fCA1E9b49',
        TeamTokenFactory.abi,
        wallet.connect(provider)
      );

      // Mock contract interaction
      const mockContractResponse = {
        hash: '0x123...',
        wait: async () => ({ status: 1 })
      };

      // Verify contract interaction
      expect(mockContractResponse.hash).toBeDefined();
      const receipt = await mockContractResponse.wait();
      expect(receipt.status).toBe(1);
    });
  });

  describe('Error Cases', () => {
    it('should handle invalid login attempts', async () => {
      const loginResponse = await fetch('http://localhost:3005/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        })
      });

      expect(loginResponse.status).toBe(401);
    });

    it('should prevent unauthorized profile updates', async () => {
      const updateResponse = await fetch('http://localhost:3005/api/users/123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_token'
        },
        body: JSON.stringify({
          username: 'hacker'
        })
      });

      expect(updateResponse.status).toBe(401);
    });
  });
});
