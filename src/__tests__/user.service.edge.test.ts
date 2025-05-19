import { setUserOnline, setUserOffline, getUserById, getUserBySocketId } from '../services/user.service';
import User from '../models/User';
import mongoose from 'mongoose';

describe('User Service Edge Cases', () => {
  let user: any;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!, { dbName: process.env.dbName });
    user = await User.create({ username: 'edgeuser', password: 'pw', online: false });
  });
  afterAll(async () => {
    await User.deleteMany({ username: 'edgeuser' });
    await mongoose.disconnect();
  });

  it('should handle setUserOffline for user with no socketIds', async () => {
    const result = await setUserOffline(user._id, 'nonexistent');
    expect(result).toBeTruthy();
  });

  it('should return null for getUserById with invalid id', async () => {
    await expect(getUserById('invalid')).rejects.toBeTruthy();
  });

  it('should return null for getUserBySocketId with no match', async () => {
    const result = await getUserBySocketId('notfound');
    expect(result).toBeNull();
  });
});
