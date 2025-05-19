"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const socket_1 = require("./socket");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const call_routes_1 = __importDefault(require("./routes/call.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const winston_1 = __importDefault(require("winston"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoClient_1 = __importDefault(require("./helpers/mongoClient"));
const redisAdapter_1 = require("./helpers/redisAdapter");
const swagger_1 = require("./helpers/swagger");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
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
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true,
    },
});
// Winston logger setup
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(),
        // Add file transports for production if needed
    ],
});
exports.logger = logger;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, helmet_1.default)()); // Helmet for security headers
// Global rate limiter (customize as needed)
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);
// MongoDB connection
(0, mongoClient_1.default)().then(() => {
    logger.info('MongoDB connected');
}).catch((err) => {
    logger.error('MongoDB connection error:', err);
});
// Socket.IO setup
(0, socket_1.registerSocketHandlers)(io);
// Redis adapter setup
(0, redisAdapter_1.setupRedisAdapter)(io, logger);
// Swagger setup
(0, swagger_1.setupSwagger)(app);
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/calls', call_routes_1.default);
app.use('/api/chats', chat_routes_1.default);
// Health check
app.get('/health', function (_req, res) {
    res.json({ status: 'ok', date: new Date().toISOString() });
});
// Error handler must be last middleware and passed as a function reference
app.use(error_middleware_1.globalErrorHandler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
exports.default = app;
