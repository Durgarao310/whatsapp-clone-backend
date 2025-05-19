import User from '../models/User';
import { logger } from '../index';
import { AppError } from '../middlewares/error.middleware';
import httpStatus from 'http-status';
import { getSocketServer } from '../helpers/socket';

export async function addContactService(userId: string, contactId: string) {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('Error finding user in addContactService');
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  if (user.contacts && user.contacts.map((id: any) => id.toString()).includes(contactId)) {
    throw new AppError('Contact already exists', httpStatus.CONFLICT);
  }
  user.contacts = user.contacts || [];
  user.contacts.push(contactId);
  await user.save();
  return contactId;
}

export async function removeContactService(userId: string, contactId: string) {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('Error finding user in removeContactService');
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  user.contacts = (user.contacts || []).filter((id: any) => id.toString() !== contactId);
  await user.save();
  return contactId;
}

export async function sendFriendRequestService(userId: string, targetId: string) {
  if (userId === targetId) throw new AppError('Cannot send request to yourself', httpStatus.BAD_REQUEST);
  const user = await User.findById(userId);
  const target = await User.findById(targetId);
  if (!user || !target) throw new AppError('User not found', httpStatus.NOT_FOUND);
  if (user.contacts?.includes(targetId)) throw new AppError('Already friends', httpStatus.CONFLICT);
  if (user.sentRequests?.includes(targetId)) throw new AppError('Request already sent', httpStatus.CONFLICT);
  if (user.friendRequests?.includes(targetId)) throw new AppError('User already sent you a request', httpStatus.CONFLICT);
  user.sentRequests = user.sentRequests || [];
  target.friendRequests = target.friendRequests || [];
  user.sentRequests.push(targetId);
  target.friendRequests.push(userId);
  await user.save();
  await target.save();
  // Real-time notification
  try {
    const io = getSocketServer();
    if (target.socketIds && target.socketIds.length > 0) {
      target.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_received', {
        senderId: userId,
        createdAt: new Date(),
      }));
    }
  } catch (e) {/* ignore if socket not available */}
  return targetId;
}

export async function acceptFriendRequestService(userId: string, requesterId: string) {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) throw new AppError('User not found', httpStatus.NOT_FOUND);
  if (!user.friendRequests?.includes(requesterId)) throw new AppError('No such friend request', httpStatus.BAD_REQUEST);
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
  requester.sentRequests = requester.sentRequests ? requester.sentRequests.filter(id => id.toString() !== userId) : [];
  user.contacts = user.contacts || [];
  requester.contacts = requester.contacts || [];
  user.contacts.push(requesterId);
  requester.contacts.push(userId);
  await user.save();
  await requester.save();
  // Real-time notification
  try {
    const io = getSocketServer();
    if (requester.socketIds && requester.socketIds.length > 0) {
      requester.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_accepted', {
        accepterId: userId,
      }));
    }
  } catch (e) {/* ignore if socket not available */}
  return requesterId;
}

export async function rejectFriendRequestService(userId: string, requesterId: string) {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) throw new AppError('User not found', httpStatus.NOT_FOUND);
  if (!user.friendRequests?.includes(requesterId)) throw new AppError('No such friend request', httpStatus.BAD_REQUEST);
  user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
  requester.sentRequests = requester.sentRequests ? requester.sentRequests.filter(id => id.toString() !== userId) : [];
  await user.save();
  await requester.save();
  // Real-time notification
  try {
    const io = getSocketServer();
    if (requester.socketIds && requester.socketIds.length > 0) {
      requester.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_rejected', {
        rejecterId: userId,
      }));
    }
  } catch (e) {/* ignore if socket not available */}
  return requesterId;
}
