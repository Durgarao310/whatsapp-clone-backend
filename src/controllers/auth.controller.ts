import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../helpers/jwt';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import { logger } from '../index';

export async function register(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
    return;
  }
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Username taken' });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    logger.error('Registration failed', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Registration failed', error: err instanceof Error ? err.message : err });
  }
}

export async function login(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Validation error', errors: errors.array() });
    return;
  }
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid credentials' });
      return;
    }
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    logger.error('Login failed', err);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Login failed', error: err instanceof Error ? err.message : err });
  }
}
