import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // express-validator errors (from handleValidation or thrown)
  if (err && (err.errors && Array.isArray(err.errors) || typeof err.array === 'function')) {
    const errors = err.errors || (typeof err.array === 'function' ? err.array() : []);
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation error',
      errors,
    });
  }

  // Custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // JWT errors
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid or missing token' });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // MongoDB duplicate key error
  if (err.code && err.code === 11000) {
    return res.status(httpStatus.CONFLICT).json({
      message: 'Duplicate key error',
      keyValue: err.keyValue,
    });
  }

  // MongoDB CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: `Invalid value for field '${err.path}'`,
      value: err.value,
    });
  }

  // MongoServerError (general)
  if (err.name === 'MongoServerError') {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Other errors
  const status = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  // Optionally include stack trace in development
  const response: any = { message };
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }
  res.status(status).json(response);
}
