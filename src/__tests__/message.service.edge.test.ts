import { createMessage, markMessageSeen, getMessagesBetweenUsers } from '../services/message.service';
import Message from '../models/Message';
import mongoose from 'mongoose';

describe('Message Service Edge Cases', () => {
  let userA: any, userB: any, message: any;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI!, { dbName: process.env.dbName });
    userA = new mongoose.Types.ObjectId();
    userB = new mongoose.Types.ObjectId();
  });
  afterAll(async () => {
    await Message.deleteMany({});
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it('should return null if marking seen for wrong user', async () => {
    const msg = await createMessage(userA.toString(), userB.toString(), 'test');
    if (!msg) throw new Error('Failed to create message');
    const result = await markMessageSeen((msg._id as any).toString(), userA.toString());
    expect(result).toBeNull();
  });

  it('should throw if getMessagesBetweenUsers fails (invalid id)', async () => {
    await expect(getMessagesBetweenUsers('invalid', userB.toString())).rejects.toBeTruthy();
  });
});
