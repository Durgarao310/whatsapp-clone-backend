import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export function generateToken(user: IUser) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  return jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable must be set');
  }
  return jwt.verify(token, secret);
}
