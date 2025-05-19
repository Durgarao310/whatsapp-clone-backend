import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware';
import { registerSocketHandlers as registerHandlers } from './handlers';

export function registerSocketHandlers(io: Server) {
  io.use(socketAuthMiddleware);
  registerHandlers(io);
}
