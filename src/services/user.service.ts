import User from '../models/User';
import { saveDoc } from '../helpers/document';

export async function setUserOnline(userId: string, socketId: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  // Adds a socketId to the user's socketIds array and sets them online.
  return await User.findByIdAndUpdate(
    userId,
    { online: true, $addToSet: { socketIds: socketId } },
    { new: true }
  ).exec();
}

export async function setUserOffline(userId: string, socketId?: string): Promise<ReturnType<typeof User.findByIdAndUpdate>> {
  // Removes a socketId from the user's socketIds array. If no socketIds remain, sets the user offline.
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { socketIds: socketId } },
    { new: true }
  ).exec();
  if (user && user.socketIds && user.socketIds.length === 0) {
    user.online = false;
    const saved = await saveDoc(user);
    return saved;
  }
  return user;
}

export async function getUserById(userId: string): Promise<import('../models/User').IUser | null> {
  // Retrieves a user by their ID.
  return await User.findById(userId).exec();
}

export async function getUserBySocketId(socketId: string): Promise<import('../models/User').IUser | null> {
  // Retrieves a user by a socketId.
  return await User.findOne({ socketIds: socketId }).exec();
}
