import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  email: string;
  password?: string;
  walletAddress?: string;
  createdAt: number;
  isAdmin: boolean;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {
  password?: never;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}
