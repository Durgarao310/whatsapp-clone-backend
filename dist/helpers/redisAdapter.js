"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRedisAdapter = setupRedisAdapter;
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redisClient_1 = __importDefault(require("./redisClient"));
function setupRedisAdapter(io, logger) {
    if (process.env.REDIS_HOST &&
        process.env.REDIS_PORT &&
        process.env.REDIS_USERNAME &&
        process.env.REDIS_PASSWORD) {
        const pubClient = redisClient_1.default;
        const subClient = pubClient.duplicate();
        Promise.all([
            pubClient.connect(),
            subClient.connect()
        ]).then(() => {
            io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
            logger.info('Socket.IO Redis adapter enabled');
        }).catch((err) => {
            logger.error('Failed to connect to Redis for Socket.IO adapter', err);
        });
    }
    else {
        logger.warn('Redis config not set. Socket.IO clustering is not enabled.');
    }
}
