import User from '../models/User';
import logger from '../helpers/logger';
import { AppError } from '../middlewares/error.middleware';
import httpStatus from 'http-status';
import { getSocketServer } from '../helpers/socket';
import FriendRequest from '../models/FriendRequest';

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
  if (userId === targetId) {
    logger.warn('User tried to send friend request to themselves', { userId });
    throw new AppError('Cannot send request to yourself', httpStatus.BAD_REQUEST);
  }
  const user = await User.findById(userId);
  const target = await User.findById(targetId);
  if (!user || !target) {
    logger.warn('User or target not found for friend request', { userId, targetId });
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  if (user.contacts?.map(c => c.toString()).includes(targetId)) {
    logger.warn('Attempted to send friend request to existing contact', { userId, targetId });
    throw new AppError('Already friends', httpStatus.CONFLICT);
  }
  // Check for existing pending requests
  const existing = await FriendRequest.findOne({ from: userId, to: targetId, status: 'pending' });
  if (existing) {
    logger.warn('Attempted to send duplicate friend request', { userId, targetId });
    throw new AppError('Request already sent', httpStatus.CONFLICT);
  }
  // Check if target already sent a request to user
  const reverse = await FriendRequest.findOne({ from: targetId, to: userId, status: 'pending' });
  if (reverse) {
    logger.warn('Attempted to send friend request to user who already sent one', { userId, targetId });
    throw new AppError('User already sent you a request', httpStatus.CONFLICT);
  }
  await FriendRequest.create({ from: userId, to: targetId });
  const io = getSocketServer();
  if (target.socketIds && target.socketIds.length > 0) {
    target.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_received', {
      senderId: userId,
      senderName: user.username,
      createdAt: new Date(),
    }));
    logger.info('Emitted friend_request_received to target user', { targetId, senderId: userId });
  }
  return targetId;
}

export async function acceptFriendRequestService(userId: string, requesterId: string) {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) {
    logger.warn('User or requester not found for accepting friend request', { userId, requesterId });
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  // Find the pending friend request
  const request = await FriendRequest.findOne({ from: requesterId, to: userId, status: 'pending' });
  if (!request) {
    logger.warn('Attempted to accept non-existent friend request', { userId, requesterId });
    throw new AppError('No such friend request', httpStatus.BAD_REQUEST);
  }
  request.status = 'accepted';
  await request.save();
  // Add each other as contacts
  user.contacts = user.contacts || [];
  requester.contacts = requester.contacts || [];
  if (!user.contacts.map(id => id.toString()).includes(requesterId)) user.contacts.push(requesterId);
  if (!requester.contacts.map(id => id.toString()).includes(userId)) requester.contacts.push(userId);
  await user.save();
  await requester.save();
  const io = getSocketServer();
  if (requester.socketIds && requester.socketIds.length > 0) {
    requester.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_accepted', {
      accepterId: userId,
      accepterName: user.username,
    }));
    logger.info('Emitted friend_request_accepted to requester', { requesterId, accepterId: userId });
  }
  if (user.socketIds && user.socketIds.length > 0) {
    user.socketIds.forEach((sid: string) => io.to(sid).emit('contact_added', { newContact: requester.toJSON() }));
  }
  return requesterId;
}

export async function rejectFriendRequestService(userId: string, requesterId: string) {
  const user = await User.findById(userId);
  const requester = await User.findById(requesterId);
  if (!user || !requester) {
    logger.warn('User or requester not found for rejecting friend request', { userId, requesterId });
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }
  // Find the pending friend request
  const request = await FriendRequest.findOne({ from: requesterId, to: userId, status: 'pending' });
  if (!request) {
    logger.warn('Attempted to reject non-existent friend request', { userId, requesterId });
    throw new AppError('No such friend request', httpStatus.BAD_REQUEST);
  }
  request.status = 'rejected';
  await request.save();
  const io = getSocketServer();
  if (requester.socketIds && requester.socketIds.length > 0) {
    requester.socketIds.forEach((sid: string) => io.to(sid).emit('friend_request_rejected', {
      rejecterId: userId,
      rejecterName: user.username,
    }));
    logger.info('Emitted friend_request_rejected to requester', { requesterId, rejecterId: userId });
  }
  return requesterId;
}
