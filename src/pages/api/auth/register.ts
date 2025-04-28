import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { withAuthRateLimit } from '@/middleware/rateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, email, password, walletAddress } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      console.error('[REGISTER] Missing required fields:', { username, email, password });
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('[REGISTER] Invalid email format:', email);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      console.error('[REGISTER] Password too short:', password.length);
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const client = await clientPromise;
    const db = client.db('fanatikoin');
    const collection = db.collection('users');

    // Check if user already exists
    const existingUser = await collection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      console.error('[REGISTER] Duplicate user:', { email, username });
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      });
    }

    // Hash password with stronger work factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Web3 wallet association logic
    let wallet = null;
    let encryptedPrivateKey = null;
    let role = 'fan';

    if (walletAddress) {
      // Registered via wallet
      wallet = walletAddress;
    } else {
      // Registered via email: generate a new wallet
      const { ethers } = require('ethers');
      const newWallet = ethers.Wallet.createRandom();
      wallet = newWallet.address;
      // Encrypt private key with password
      encryptedPrivateKey = await newWallet.encrypt(password);
    }

    // Create user
    const result = await collection.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: Date.now(),
      role,
      wallet,
      encryptedPrivateKey,
      isAdmin: false
    });

    const user = await collection.findOne({ _id: result.insertedId });

    if (!user) {
      throw new Error('User not found after creation');
    }

    // Create token with more secure settings
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role || 'fan',
        wallet: user.wallet,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { 
        expiresIn: '7d',
        algorithm: 'HS256' 
      }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('[REGISTER] Registration error:', error);
    if (error && error.message) {
      return res.status(500).json({ message: `[REGISTER] ${error.message}` });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Apply rate limiting middleware to protect against abuse
export default withAuthRateLimit()(handler);
