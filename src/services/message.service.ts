import Message from '../models/Message';
import User from '../models/User';
import { Types } from 'mongoose';
import { asyncatch } from '../helpers/asyncatch';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function createMessage(senderId: string, receiverId: string, content: string) {
  // Permission check: sender must have receiver in contacts
  const [sender, senderErr] = await asyncatch(User.findById(senderId));
  if (senderErr || !sender) {
    logger.error('Error finding sender in createMessage', senderErr);
    throw senderErr || new Error('Sender not found');
  }
  if (!sender.contacts || !sender.contacts.map(id => id.toString()).includes(receiverId.toString())) {
    throw new Error('Permission denied: You are not allowed to chat with this user');
  }

  const [message, err] = await asyncatch(Message.create({ sender: senderId, receiver: receiverId, content }));
  if (err) {
    logger.error('Error in createMessage', err);
    throw err;
  }
  return message;
}

export async function markMessageSeen(messageId: string, userId: string) {
  const [message, findErr] = await asyncatch(Message.findById(messageId));
  if (findErr) {
    logger.error('Error in markMessageSeen (find)', findErr);
    throw findErr;
  }
  if (message && message.receiver.toString() === userId) {
    message.seen = true;
    const [saved, saveErr] = await saveDoc(message);
    if (saveErr) {
      logger.error('Error in markMessageSeen (save)', saveErr);
      throw saveErr;
    }
    return saved;
  }
  return null;
}

export async function getMessagesBetweenUsers(userA: string, userB: string, options?: { limit?: number; page?: number }) {
  // Permission check: userA must have userB in contacts
  const [user, userErr] = await asyncatch(User.findById(userA));
  if (userErr || !user) {
    logger.error('Error finding user in getMessagesBetweenUsers', userErr);
    throw userErr || new Error('User not found');
  }
  if (!user.contacts || !user.contacts.map(id => id.toString()).includes(userB.toString())) {
    throw new Error('Permission denied: You are not allowed to chat with this user');
  }

  // Pagination: limit (default 20), page (default 1)
  const limit = options?.limit ?? 20;
  const page = options?.page ?? 1;
  const skip = (page - 1) * limit;
  const [messages, err] = await asyncatch(
    Message.find({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
  );
  if (err) {
    logger.error('Error in getMessagesBetweenUsers', err);
    throw err;
  }
  // Also return total count for pagination metadata
  const [total, countErr] = await asyncatch(
    Message.countDocuments({
      $or: [
        { sender: userA, receiver: userB },
        { sender: userB, receiver: userA },
      ],
    })
  );
  if (countErr) {
    logger.error('Error in getMessagesBetweenUsers (count)', countErr);
    throw countErr;
  }
  return { messages, total };
}
