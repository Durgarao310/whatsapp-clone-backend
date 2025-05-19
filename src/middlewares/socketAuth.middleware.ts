import { Socket } from 'socket.io';
import { AuthedUser } from '../types';
import jwt from 'jsonwebtoken';

export function socketAuthMiddleware(socket: any, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthedUser;
    (socket as Socket & { user: AuthedUser }).user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
}
