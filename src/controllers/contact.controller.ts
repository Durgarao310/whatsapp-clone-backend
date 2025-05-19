import catchAsync from '../helpers/catchAsync';
import { AuthedRequest } from '../types';
import {
  addContactService,
  removeContactService,
  sendFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
} from '../services/contact.service';
import { AppError } from '../middlewares/error.middleware';
import User from '../models/User';

/**
 * @route POST /api/contacts/add
 * @desc Add a user to contacts
 * @returns { success: true, data: { message, contactId } } on success
 * @returns { success: false, message: string } on error
 */

// Add a user to contacts
export const addContact = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }
  const userId = req.user.id;
  const { contactId } = req.body;
  const result = await addContactService(userId, contactId);
  res.json({ success: true, data: { message: 'Contact added', contactId: result } });
});

/**
 * @route POST /api/contacts/remove
 * @desc Remove a user from contacts
 * @returns { success: true, data: { message, contactId } } on success
 * @returns { success: false, message: string } on error
 */

// Remove a user from contacts
export const removeContact = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }
  const userId = req.user.id;
  const { contactId } = req.body;
  const result = await removeContactService(userId, contactId);
  res.json({ success: true, data: { message: 'Contact removed', contactId: result } });
});

/**
 * @route POST /api/contacts/request
 * @desc Send a friend request
 */

export const sendFriendRequest = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;
  const { targetId } = req.body;
  const result = await sendFriendRequestService(userId, targetId);
  res.json({ success: true, data: { message: 'Friend request sent', targetId: result } });
});

/**
 * @route POST /api/contacts/accept
 * @desc Accept a friend request
 */

export const acceptFriendRequest = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;
  const { requesterId } = req.body;
  const result = await acceptFriendRequestService(userId, requesterId);
  res.json({ success: true, data: { message: 'Friend request accepted', requesterId: result } });
});

/**
 * @route POST /api/contacts/reject
 * @desc Reject a friend request
 */

export const rejectFriendRequest = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const userId = req.user.id;
  const { requesterId } = req.body;
  const result = await rejectFriendRequestService(userId, requesterId);
  res.json({ success: true, data: { message: 'Friend request rejected', requesterId: result } });
});

/**
 * @route GET /api/contacts/requests
 * @desc Get pending friend requests (received and sent)
 * @returns { success: true, data: { received: User[], sent: User[] } }
 */
export const getFriendRequests = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const user = await User.findById(req.user.id)
    .populate('friendRequests', 'id username online socketIds')
    .populate('sentRequests', 'id username online socketIds');
  if (!user) throw new AppError('User not found', 404);
  res.json({
    success: true,
    data: {
      received: user.friendRequests,
      sent: user.sentRequests
    }
  });
});

/**
 * @route GET /api/contacts/profile
 * @desc Get the authenticated user's full profile, including contacts, friend requests, and sent requests
 * @returns { success: true, data: { user: { id, username, online, socketIds, contacts, friendRequests, sentRequests } } }
 */
export const getFullUserProfile = catchAsync<AuthedRequest>(async (req, res) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const user = await User.findById(req.user.id)
    .populate('contacts', 'id username online socketIds')
    .populate('friendRequests', 'id username online socketIds')
    .populate('sentRequests', 'id username online socketIds');
  if (!user) throw new AppError('User not found', 404);
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        online: user.online,
        socketIds: user.socketIds,
        contacts: user.contacts,
        friendRequests: user.friendRequests,
        sentRequests: user.sentRequests
      }
    }
  });
});
