import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const client = await clientPromise;
    const db = client.db('fanatikoin');
    const collection = db.collection('users');

    // Find user by wallet address
    let user = await collection.findOne({ walletAddress: address });

    if (!user) {
      // Create new user for this wallet
      const newUser = {
        username: `User_${address.slice(0, 6)}`,
        email: `${address.slice(0, 6)}@wallet.local`,
        walletAddress: address,
        createdAt: Date.now(),
        isAdmin: false
      };

      const result = await collection.insertOne(newUser);
      user = await collection.findOne({ _id: result.insertedId });

      if (!user) {
        throw new Error('Failed to create user');
      }
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
