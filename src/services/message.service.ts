import Message from '../models/Message';
import User from '../models/User';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';
import { AppError } from '../middlewares/error.middleware';
import httpStatus from 'http-status';

export async function createMessage(senderId: string, receiverId: string, content: string) {
  const sender = await User.findById(senderId);
  if (!sender) {
    logger.error('Error finding sender in createMessage');
    throw new AppError('Sender not found', httpStatus.NOT_FOUND);
  }
  if (!sender.contacts || !sender.contacts.map(id => id.toString()).includes(receiverId.toString())) {
    throw new AppError('Permission denied: You are not allowed to chat with this user', httpStatus.FORBIDDEN);
  }
  const message = await Message.create({ sender: senderId, receiver: receiverId, content });
  return message;
}

export async function markMessageSeen(messageId: string, userId: string) {
  const message = await Message.findById(messageId);
  if (message && message.receiver.toString() === userId) {
    message.seen = true;
    const saved = await saveDoc(message);
    return saved;
  }
  return null;
}

export async function getMessagesBetweenUsers(userA: string, userB: string, options?: { limit?: number; page?: number }) {
  const user = await User.findById(userA);
  if (!user) {
    logger.error('Error finding user in getMessagesBetweenUsers');
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  if (!user.contacts || !user.contacts.map(id => id.toString()).includes(userB.toString())) {
    throw new AppError('Permission denied: You are not allowed to chat with this user', httpStatus.FORBIDDEN);
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
  const total = await Message.countDocuments({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA },
    ],
  });
  return { messages, total };
}
