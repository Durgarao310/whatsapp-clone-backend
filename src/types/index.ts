import { IUser } from '../models/User';
import { IMessage } from '../models/Message';
import { ICall, CallStatus } from '../models/Call';
import { Socket as IOSocket } from 'socket.io';
import { Request } from 'express';

export interface JwtPayload {
  id: string;
  username: string;
}

export interface PrivateMessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export interface MessageSeenPayload {
  messageId: string;
  userId: string;
}

export interface CallSignalPayload {
  callerId: string;
  calleeId: string;
  signal: any;
}

export interface CallStatusPayload {
  callId: string;
  status: CallStatus;
}

export interface AuthedUser {
  id: string;
  username: string;
}

export interface AuthedRequest extends Request {
  user: AuthedUser;
}

export interface AuthedSocket extends IOSocket {
  user: AuthedUser;
}
