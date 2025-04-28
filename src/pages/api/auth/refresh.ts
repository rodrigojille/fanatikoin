import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    // Verify the current token
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Connect to the database
    const client = await connectToDatabase;
    const db = client.db();

    // Find the user
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId)
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token
    const newToken = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        authType: payload.authType
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Remove sensitive data
    delete user.password;

    return res.status(200).json({
      token: newToken,
      user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
