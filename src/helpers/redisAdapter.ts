import { createAdapter } from '@socket.io/redis-adapter';
import redisClient from './redisClient';
import { Server as SocketIOServer } from 'socket.io';
import winston from 'winston';

export function setupRedisAdapter(io: SocketIOServer, logger: winston.Logger) {
  if (
    process.env.REDIS_HOST &&
    process.env.REDIS_PORT &&
    process.env.REDIS_USERNAME &&
    process.env.REDIS_PASSWORD
  ) {
    const pubClient = redisClient;
    const subClient = pubClient.duplicate();
    Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]).then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO Redis adapter enabled');
    }).catch((err) => {
      logger.error('Failed to connect to Redis for Socket.IO adapter', err);
    });
  } else {
    logger.warn('Redis config not set. Socket.IO clustering is not enabled.');
  }
}
