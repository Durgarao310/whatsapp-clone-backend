import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthedUser } from '../types';
import httpStatus from 'http-status';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token provided' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'JWT secret not configured' });
    return;
  }
  try {
    const decoded = jwt.verify(token, secret) as AuthedUser;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
}
