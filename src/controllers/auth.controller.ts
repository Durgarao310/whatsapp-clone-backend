import User, { IUser } from '../models/User';
import argon2 from 'argon2';
import { generateToken } from '../helpers/jwt';
import catchAsync from '../helpers/catchAsync';
import { AuthedRequest } from '../types';
import { AppError } from '../middlewares/error.middleware';
import httpStatus from 'http-status';
import redisClient from '../helpers/redisClient';
import logger from '../helpers/logger';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @returns { success: true, data: { token, user } } on success
 * @returns { success: false, message: string } on error
 */
export const register = catchAsync<AuthedRequest>(async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = username.toLowerCase();
  const existing = await User.findOne({ username: normalizedUsername });
  if (existing) {
    throw new AppError('Username taken', httpStatus.BAD_REQUEST);
  }
  const hashed = await argon2.hash(password);
  const user = await User.create({ username: normalizedUsername, password: hashed });
  const token = generateToken(user);
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username
      }
    }
  });
});

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @returns { success: true, data: { token, user } } on success
 * @returns { success: false, message: string } on error
 */
export const login = catchAsync<AuthedRequest>(async (req, res) => {
  const { username, password } = req.body;
  const normalizedUsername = username.toLowerCase();
  const lockKey = `lockout:${normalizedUsername}`;
  const failKey = `failcount:${normalizedUsername}`;

  // Check if account is locked
  const isLocked = await redisClient.get(lockKey);
  if (isLocked) {
    throw new AppError(
      `Account locked due to too many failed login attempts. Try again in ${LOCKOUT_MINUTES} minutes.`,
      httpStatus.FORBIDDEN
    );
  }

  const user = await User.findOne({ username: normalizedUsername });
  if (!user) {
    // Increment failed attempts for non-existent users as well (prevent enumeration)
    await redisClient.incr(failKey);
    await redisClient.expire(failKey, LOCKOUT_MINUTES * 60);
    // Lock if threshold reached
    const fails = parseInt((await redisClient.get(failKey)) || '0', 10);
    if (fails >= MAX_FAILED_ATTEMPTS) {
      await redisClient.set(lockKey, '1', { EX: LOCKOUT_MINUTES * 60 });
    }
    throw new AppError('Invalid credentials', httpStatus.BAD_REQUEST);
  }
  const match = await argon2.verify(user.password, password);
  if (!match) {
    await redisClient.incr(failKey);
    await redisClient.expire(failKey, LOCKOUT_MINUTES * 60);
    const fails = parseInt((await redisClient.get(failKey)) || '0', 10);
    if (fails >= MAX_FAILED_ATTEMPTS) {
      await redisClient.set(lockKey, '1', { EX: LOCKOUT_MINUTES * 60 });
      logger.warn(`Account locked for user: ${normalizedUsername}`);
    }
    throw new AppError('Invalid credentials', httpStatus.BAD_REQUEST);
  }
  // On successful login, reset fail count
  await redisClient.del(failKey);
  await redisClient.del(lockKey);
  const token = generateToken(user);
  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        username: user.username
      }
    }
  });
});
