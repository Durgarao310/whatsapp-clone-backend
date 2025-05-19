// src/helpers/socket.ts
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function setSocketServer(server: SocketIOServer) {
  io = server;
}

export function getSocketServer(): SocketIOServer {
  if (!io) throw new Error('Socket.IO server not initialized');
  return io;
}
