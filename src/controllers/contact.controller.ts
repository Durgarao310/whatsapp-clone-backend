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
