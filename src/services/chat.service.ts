import Message from '../models/Message';
import User from '../models/User';
import { asyncatch } from '../helpers/asyncatch';
import { logger } from '../index';

/**
 * Returns all contacts (users the authenticated user has chatted with), each with the other user's info and the latest message.
 * @param userId The authenticated user's ID
 */
export async function getUserContacts(userId: string) {
  try {
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $addFields: {
          contactUser: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$contactUser',
          latestMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            id: '$user._id',
            username: '$user.username',
            online: '$user.online',
            socketIds: '$user.socketIds'
          },
          latestMessage: {
            id: '$latestMessage._id',
            sender: '$latestMessage.sender',
            receiver: '$latestMessage.receiver',
            content: '$latestMessage.content',
            seen: '$latestMessage.seen',
            createdAt: '$latestMessage.createdAt'
          }
        }
      },
      { $sort: { 'latestMessage.createdAt': -1 } }
    ]);
    return contacts;
  } catch (err) {
    logger.error('Error in getUserContacts', err);
    throw err;
  }
}
