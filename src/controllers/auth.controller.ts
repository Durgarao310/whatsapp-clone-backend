import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '../helpers/jwt';
import catchAsync from '../helpers/catchAsync';
import { AuthedRequest } from '../types';

export const register = catchAsync<AuthedRequest>(async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) {
    res.status(400).json({ message: 'Username taken' });
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
});

export const login = catchAsync<AuthedRequest>(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(400).json({ message: 'Invalid credentials' });
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
});
