import User from '../models/User';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function setUserOnline(userId: string, socketId: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  /**
   * Adds a socketId to the user's socketIds array and sets them online.
   * @param userId - The user's ID
   * @param socketId - The socket connection ID
   * @returns The updated user document or null
   */
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { online: true, $addToSet: { socketIds: socketId } },
      { new: true }
    ).exec();
    return user;
  } catch (err) {
    logger.error('Error in setUserOnline', err);
    throw err;
  }
}

export async function setUserOffline(userId: string, socketId?: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  /**
   * Removes a socketId from the user's socketIds array. If no socketIds remain, sets the user offline.
   * @param userId - The user's ID
   * @param socketId - The socket connection ID to remove
   * @returns The updated user document or null
   */
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { socketIds: socketId } },
      { new: true }
    ).exec();
    if (user && user.socketIds && user.socketIds.length === 0) {
      user.online = false;
      try {
        const saved = await saveDoc(user);
        return saved;
      } catch (saveErr) {
        logger.error('Error saving user in setUserOffline', saveErr);
        throw saveErr;
      }
    }
    return user;
  } catch (err) {
    logger.error('Error in setUserOffline', err);
    throw err;
  }
}

export async function getUserById(userId: string): Promise<import('../models/User').IUser | null> {
  /**
   * Retrieves a user by their ID.
   * @param userId - The user's ID
   * @returns The user document or null
   */
  try {
    const user = await User.findById(userId).exec();
    return user;
  } catch (err) {
    logger.error('Error in getUserById', err);
    throw err;
  }
}

export async function getUserBySocketId(socketId: string): Promise<import('../models/User').IUser | null> {
  /**
   * Retrieves a user by a socketId.
   * @param socketId - The socket connection ID
   * @returns The user document or null
   */
  try {
    const user = await User.findOne({ socketIds: socketId }).exec();
    return user;
  } catch (err) {
    logger.error('Error in getUserBySocketId', err);
    throw err;
  }
}
