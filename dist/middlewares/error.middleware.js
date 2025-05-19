"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.globalErrorHandler = globalErrorHandler;
const http_status_1 = __importDefault(require("http-status"));
class AppError extends Error {
    constructor(message, statusCode = http_status_1.default.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function globalErrorHandler(err, req, res, next) {
    // express-validator errors
    if (err && err.errors && Array.isArray(err.errors)) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: 'Validation error',
            errors: err.errors,
        });
    }
    // Custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    // JWT errors
    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(http_status_1.default.UNAUTHORIZED).json({ message: 'Invalid or missing token' });
    }
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: 'Validation error',
            errors: err.errors,
        });
    }
    // MongoDB duplicate key error
    if (err.code && err.code === 11000) {
        return res.status(http_status_1.default.CONFLICT).json({
            message: 'Duplicate key error',
            keyValue: err.keyValue,
        });
    }
    // MongoDB CastError (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: `Invalid value for field '${err.path}'`,
            value: err.value,
        });
    }
    // MongoServerError (general)
    if (err.name === 'MongoServerError') {
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            message: 'Database error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
    // Other errors
    const status = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';
    // Optionally include stack trace in development
    const response = { message };
    if (process.env.NODE_ENV === 'development' && err.stack) {
        response.stack = err.stack;
    }
    res.status(status).json(response);
}
