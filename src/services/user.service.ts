import User from '../models/User';
import { asyncatch } from '../helpers/asyncatch';
import { saveDoc } from '../helpers/document';
import { logger } from '../index';

export async function setUserOnline(userId: string, socketId: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  /**
   * Adds a socketId to the user's socketIds array and sets them online.
   * @param userId - The user's ID
   * @param socketId - The socket connection ID
   * @returns The updated user document or null
   */
  // Add socketId to the array if not present
  const [user, err] = await asyncatch(User.findByIdAndUpdate(
    userId,
    { online: true, $addToSet: { socketIds: socketId } },
    { new: true }
  ));
  if (err) {
    logger.error('Error in setUserOnline', err);
    throw err;
  }
  return user;
}

export async function setUserOffline(userId: string, socketId?: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  /**
   * Removes a socketId from the user's socketIds array. If no socketIds remain, sets the user offline.
   * @param userId - The user's ID
   * @param socketId - The socket connection ID to remove
   * @returns The updated user document or null
   */
  // Remove socketId from the array; if none left, set online to false
  const [user, err] = await asyncatch(User.findByIdAndUpdate(
    userId,
    { $pull: { socketIds: socketId } },
    { new: true }
  ));
  if (err) {
    logger.error('Error in setUserOffline', err);
    throw err;
  }
  if (user && user.socketIds && user.socketIds.length === 0) {
    user.online = false;
    const [saved, saveErr] = await saveDoc(user);
    if (saveErr) {
      logger.error('Error saving user in setUserOffline', saveErr);
      throw saveErr;
    }
    return saved;
  }
  return user;
}

export async function getUserById(userId: string): Promise<import('../models/User').IUser | null> {
  /**
   * Retrieves a user by their ID.
   * @param userId - The user's ID
   * @returns The user document or null
   */
  const [user, err] = await asyncatch(User.findById(userId).exec());
  if (err) {
    logger.error('Error in getUserById', err);
    throw err;
  }
  return user;
}

export async function getUserBySocketId(socketId: string): Promise<import('../models/User').IUser | null> {
  /**
   * Retrieves a user by a socketId.
   * @param socketId - The socket connection ID
   * @returns The user document or null
   */
  const [user, err] = await asyncatch(User.findOne({ socketIds: socketId }).exec());
  if (err) {
    logger.error('Error in getUserBySocketId', err);
    throw err;
  }
  return user;
}
