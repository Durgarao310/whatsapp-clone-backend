import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketHandlers } from './socket';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import callRoutes from './routes/call.routes';
import chatRoutes from './routes/chat.routes';
import { globalErrorHandler } from './middlewares/error.middleware';
import winston from 'winston';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import connectMongo from './helpers/mongoClient';
import { setupRedisAdapter } from './helpers/redisAdapter';
import { setupSwagger } from './helpers/swagger';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Startup check for required environment variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'dbName'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// Startup check for required Redis environment variables
const requiredRedisEnv = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_USERNAME', 'REDIS_PASSWORD'];
const missingRedisEnv = requiredRedisEnv.filter((key) => !process.env[key]);
if (missingRedisEnv.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`Missing required Redis environment variables: ${missingRedisEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
  },
});

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add file transports for production if needed
  ],
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(helmet()); // Helmet for security headers

// Global rate limiter (customize as needed)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// MongoDB connection
connectMongo().then(() => {
  logger.info('MongoDB connected');
}).catch((err) => {
  logger.error('MongoDB connection error:', err);
});

// Socket.IO setup
registerSocketHandlers(io);

// Redis adapter setup
setupRedisAdapter(io, logger);

// Swagger setup
setupSwagger(app);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/chats', chatRoutes);

// Health check
app.get('/health', function (_req, res) {
  res.json({ status: 'ok', date: new Date().toISOString() });
});

// Error handler must be last middleware and passed as a function reference
app.use(globalErrorHandler as ErrorRequestHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export { logger };
export default app;
