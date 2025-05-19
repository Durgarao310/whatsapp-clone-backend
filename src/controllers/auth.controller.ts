import User, { IUser } from '../models/User';
import argon2 from 'argon2';
import { generateToken } from '../helpers/jwt';
import catchAsync from '../helpers/catchAsync';
import { AuthedRequest } from '../types';
import { AppError } from '../middlewares/error.middleware';
import httpStatus from 'http-status';

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @returns { success: true, data: { token, user } } on success
 * @returns { success: false, message: string } on error
 */
export const register = catchAsync<AuthedRequest>(async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    throw new AppError('Username taken', httpStatus.BAD_REQUEST);
  }
  const hashed = await argon2.hash(password);
  const user = await User.create({ username, password: hashed });
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
  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError('Invalid credentials', httpStatus.BAD_REQUEST);
  }
  const match = await argon2.verify(user.password, password);
  if (!match) {
    throw new AppError('Invalid credentials', httpStatus.BAD_REQUEST);
  }
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
