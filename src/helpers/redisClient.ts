import { createClient } from 'redis';

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
  socket: {
    host: process.env.REDIS_HOST || '',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    tls: false, // Enable TLS for Redis Cloud
  },
});

redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));

export default redisClient;
