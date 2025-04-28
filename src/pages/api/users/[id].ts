import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
const verifyToken = (req: NextApiRequest): { userId: string; email: string } | null => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const updates = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const client = await clientPromise;
    const db = client.db('fanatikoin');
    const collection = db.collection('users');

    // Only allow users to update their own profile or admins
    const user = await collection.findOne({ _id: new ObjectId(id as string) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (decoded.userId !== id && !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.isAdmin;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = result;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
