import Message from '../models/Message';
import User from '../models/User';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function createMessage(senderId: string, receiverId: string, content: string) {
  // Permission check: sender must have receiver in contacts
  try {
    const sender = await User.findById(senderId);
    if (!sender) {
      logger.error('Error finding sender in createMessage');
      throw new Error('Sender not found');
    }
    if (!sender.contacts || !sender.contacts.map(id => id.toString()).includes(receiverId.toString())) {
      throw new Error('Permission denied: You are not allowed to chat with this user');
    }
    const message = await Message.create({ sender: senderId, receiver: receiverId, content });
    return message;
  } catch (err) {
    logger.error('Error in createMessage', err);
    throw err;
  }
}

export async function markMessageSeen(messageId: string, userId: string) {
  try {
    const message = await Message.findById(messageId);
    if (message && message.receiver.toString() === userId) {
      message.seen = true;
      const saved = await saveDoc(message);
      return saved;
    }
    return null;
  } catch (err) {
    logger.error('Error in markMessageSeen', err);
    throw err;
  }
}

export async function getMessagesBetweenUsers(userA: string, userB: string, options?: { limit?: number; page?: number }) {
  try {
    const user = await User.findById(userA);
    if (!user) {
      logger.error('Error finding user in getMessagesBetweenUsers');
      throw new Error('User not found');
    }
    if (!user.contacts || !user.contacts.map(id => id.toString()).includes(userB.toString())) {
      throw new Error('Permission denied: You are not allowed to chat with this user');
    }
    // Pagination: limit (default 20), page (default 1)
    const limit = options?.limit ?? 20;
    const page = options?.page ?? 1;
    const skip = (page - 1) * limit;
    const messages = await Message.find({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
    // Also return total count for pagination metadata
    const total = await Message.countDocuments({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    });
    return { messages, total };
  } catch (err) {
    logger.error('Error in getMessagesBetweenUsers', err);
    throw err;
  }
}
