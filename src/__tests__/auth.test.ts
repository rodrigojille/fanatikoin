import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { MongoClient } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import loginHandler from '../pages/api/auth/login';
import registerHandler from '../pages/api/auth/register';
import walletLoginHandler from '../pages/api/auth/wallet-login';
import clientPromise from '../lib/mongodb';

describe('Authentication System', () => {
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

  it('should register a new user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }
    });

    await registerHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.username).toBe('testuser');
    expect(data.user.email).toBe('test@example.com');
    expect(data.user.password).toBeUndefined();
  });

  it('should login an existing user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe('test@example.com');
  });

  it('should handle wallet login', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        address: '0x123456789abcdef'
      }
    });

    await walletLoginHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.token).toBeDefined();
    expect(data.user.walletAddress).toBe('0x123456789abcdef');
  });

  it('should reject invalid login credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    });

    await loginHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
  });
});
